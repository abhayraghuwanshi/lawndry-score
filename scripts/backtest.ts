/**
 * Offline backtest / validation harness for the laundry score.
 *
 * Runs OUTSIDE the app (no backend, no DB) — reads the WeatherAPI key from .env.local,
 * calls WeatherAPI directly, and reuses the *real* scoring code from src/utils so we test
 * the model that actually ships.
 *
 * Usage (Node 18+ for global fetch):
 *   npx tsx scripts/backtest.ts calibrate         # immediate sanity check on recent actuals
 *   npx tsx scripts/backtest.ts capture           # save tomorrow's predicted windows (run daily)
 *   npx tsx scripts/backtest.ts verify            # check saved predictions against what happened
 *
 * Why two modes — read the header comments on each. calibrate is instant but partly circular
 * (the score consumes precip/humidity); capture+verify is the rigorous forecast-skill test but
 * needs a few days of accumulated predictions before verify has anything to check.
 */

import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { findBestWindow } from "../src/utils/bestWindow";

// ── Minimal local types (avoid importing app runtime modules) ──
interface Hour {
  time: string;
  temp_c: number;
  humidity: number;
  wind_kph: number;
  precip_mm: number;
  will_it_rain: number;
  chance_of_rain: number;
  uv: number;
  cloud: number;
}

// ── Config ──
const CITIES = [
  "Bangalore", "Mumbai", "Delhi", "London", "Singapore", "Sydney",
  "New York", "Tokyo", "Dubai", "Cape Town", "Sao Paulo", "Berlin",
];
const HISTORY_DAYS = 7; // free-tier WeatherAPI keeps ~7 days of history
const PRED_FILE = join(process.cwd(), "scripts", "predictions.jsonl");

// ── Key loading: environment first (CI secret), then .env.local (local dev) ──
function loadKey(): string {
  const fromEnv = process.env.WEATHERAPI_KEY || process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
  if (fromEnv) return fromEnv;
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const txt = readFileSync(envPath, "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*(NEXT_PUBLIC_WEATHERAPI_KEY|WEATHERAPI_KEY)\s*=\s*(.+?)\s*$/);
      if (m) return m[2].replace(/^["']|["']$/g, "");
    }
  }
  throw new Error("No WEATHERAPI key found (set WEATHERAPI_KEY env var or .env.local)");
}
const KEY = loadKey();

const CONCURRENCY = 8;   // calls in flight at once — keeps the whole run under a minute
const REQ_TIMEOUT = 10000; // ms — skip a slow call instead of hanging the whole run

// fetch + JSON with a hard timeout so one stuck request can't stall everything.
async function fetchJson(url: string, label: string): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), REQ_TIMEOUT);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    throw new Error(`${label}: ${e.name === "AbortError" ? "timed out" : e.message}`);
  } finally {
    clearTimeout(t);
  }
}

// Run an async fn over items with a bounded number in flight (simple worker pool).
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function fetchForecast(city: string, days: number): Promise<{ location: any; hours: Hour[][] }> {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;
  const data = await fetchJson(url, city);
  return { location: data.location, hours: data.forecast.forecastday.map((d: any) => d.hour) };
}

async function fetchHistory(city: string, dt: string): Promise<Hour[]> {
  const url = `https://api.weatherapi.com/v1/history.json?key=${KEY}&q=${encodeURIComponent(city)}&dt=${dt}`;
  const data = await fetchJson(url, `${city} ${dt}`);
  return data.forecast.forecastday[0].hour;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ── Independent ground-truth rule (deliberately NOT the app's composite score) ──
// A transparent physical definition of "this was genuinely a drying day," using the
// observed daytime conditions. If the model and this rule disagree a lot, the model's
// weighting is off.
function actuallyGoodDay(hours: Hour[]): { good: boolean; precip: number; rh: number; wind: number } {
  const day = hours.filter((h) => {
    const hr = parseInt(h.time.split(" ")[1], 10);
    return hr >= 9 && hr <= 16;
  });
  if (day.length === 0) return { good: false, precip: 0, rh: 0, wind: 0 };
  const precip = day.reduce((s, h) => s + h.precip_mm, 0);
  const rh = day.reduce((s, h) => s + h.humidity, 0) / day.length;
  const wind = day.reduce((s, h) => s + h.wind_kph, 0) / day.length;
  // Physically, a day dries laundry if it doesn't rain and the air isn't near-saturated.
  // Wind only changes how *fast* — a calm, dry, sunny day still dries clothes — so it's
  // reported but not required. Kept deliberately simple/defensible, not tuned to the model.
  const good = precip < 0.5 && rh < 80;
  return { good, precip, rh, wind };
}

// Rain that actually fell during a [start, end) hour window.
function rainInWindow(hours: Hour[], start: number, end: number): number {
  return hours
    .filter((h) => {
      const hr = parseInt(h.time.split(" ")[1], 10);
      return hr >= start && hr < end;
    })
    .reduce((s, h) => s + h.precip_mm, 0);
}

function pct(n: number, d: number): string {
  return d === 0 ? "—" : `${Math.round((n / d) * 100)}%`;
}

// ── Mode: calibrate ──
async function calibrate() {
  console.log(`\nCALIBRATE — model verdict vs an independent "good drying day" rule`);
  console.log(`(${CITIES.length} cities × ${HISTORY_DAYS} days of actual observed conditions)`);
  console.log(`Note: partly circular — the score uses precip/humidity. Catches miscalibration,`);
  console.log(`not forecast accuracy. For real forecast skill use capture + verify.\n`);

  let tp = 0, fp = 0, tn = 0, fn = 0, days = 0;
  const disagreements: string[] = [];

  // Build every (city, day) task, then run them with bounded concurrency.
  const tasks = CITIES.flatMap((city) =>
    Array.from({ length: HISTORY_DAYS }, (_, i) => ({
      city,
      dt: dateStr(new Date(Date.now() - (i + 1) * 86400000)),
    }))
  );

  await mapLimit(tasks, CONCURRENCY, async ({ city, dt }) => {
    try {
      const hours = await fetchHistory(city, dt);
      const reality = actuallyGoodDay(hours);
      const win = findBestWindow(hours);
      const modelGood = win.hasWindow && win.avgScore >= 55;
      days++;
      if (modelGood && reality.good) tp++;
      else if (modelGood && !reality.good) {
        fp++;
        disagreements.push(
          `  FALSE-GOOD ${city} ${dt}: score ${win.avgScore} said hang, but precip=${reality.precip.toFixed(1)}mm rh=${Math.round(reality.rh)}% wind=${Math.round(reality.wind)}kph`
        );
      } else if (!modelGood && reality.good) {
        fn++;
        disagreements.push(
          `  MISSED-GOOD ${city} ${dt}: no/low window, but it was actually fine (precip=${reality.precip.toFixed(1)}mm rh=${Math.round(reality.rh)}%)`
        );
      } else tn++;
    } catch (e: any) {
      console.log(`  skip ${e.message}`);
    }
  });

  console.log(`\nResults over ${days} city-days:`);
  console.log(`  Agreement (accuracy):  ${pct(tp + tn, days)}  (${tp + tn}/${days})`);
  console.log(`  Precision (of "hang" calls, how many were truly good): ${pct(tp, tp + fp)}`);
  console.log(`  Recall (of truly-good days, how many we'd recommend):   ${pct(tp, tp + fn)}`);
  console.log(`  False-good rate (told you to hang on a bad day):        ${pct(fp, days)}  ← credibility risk`);
  console.log(`  Missed-good rate (too pessimistic):                     ${pct(fn, days)}`);
  if (disagreements.length) {
    console.log(`\nDisagreements:`);
    disagreements.slice(0, 40).forEach((d) => console.log(d));
    if (disagreements.length > 40) console.log(`  …and ${disagreements.length - 40} more`);
  }
}

// ── Mode: capture ── (save tomorrow's predicted window; run daily via cron/manually)
async function capture() {
  console.log(`\nCAPTURE — saving tomorrow's predicted windows to ${PRED_FILE}`);
  const target = dateStr(new Date(Date.now() + 86400000));
  let n = 0;
  await mapLimit(CITIES, CONCURRENCY, async (city) => {
    try {
      const { hours } = await fetchForecast(city, 2);
      const tomorrow = hours[1] ?? [];
      const win = findBestWindow(tomorrow);
      const rec = {
        capturedAt: new Date().toISOString(),
        city,
        targetDate: target,
        hasWindow: win.hasWindow,
        hangHour: win.hangHour,
        collectHour: win.collectHour,
        avgScore: win.avgScore,
      };
      appendFileSync(PRED_FILE, JSON.stringify(rec) + "\n");
      n++;
      console.log(`  ${city}: ${win.hasWindow ? `hang ${win.hangHour}:00 → collect ${win.collectHour}:00 (score ${win.avgScore})` : "no window"}`);
    } catch (e: any) {
      console.log(`  skip ${city}: ${e.message}`);
    }
  });
  console.log(`\nSaved ${n} predictions for ${target}.`);
}

// ── Mode: verify ── (check past predictions against what actually happened)
async function verify() {
  if (!existsSync(PRED_FILE)) {
    console.log(`No predictions file yet. Run 'capture' for a few days first.`);
    return;
  }
  console.log(`\nVERIFY — did rain fall in the windows we predicted?\n`);
  const today = dateStr(new Date());
  const lines = readFileSync(PRED_FILE, "utf8").split("\n").filter(Boolean);
  const due = lines.map((l) => JSON.parse(l)).filter((p) => p.targetDate < today && p.hasWindow);

  if (due.length === 0) {
    console.log(`No verifiable predictions yet (need targetDate in the past). Keep running capture.`);
    return;
  }

  let checked = 0, stayedDry = 0;
  const wet: string[] = [];
  await mapLimit(due, CONCURRENCY, async (p) => {
    try {
      const hours = await fetchHistory(p.city, p.targetDate);
      const rain = rainInWindow(hours, p.hangHour, p.collectHour);
      checked++;
      if (rain < 0.5) stayedDry++;
      else wet.push(`  RAIN ${p.city} ${p.targetDate}: ${rain.toFixed(1)}mm fell in ${p.hangHour}:00–${p.collectHour}:00 (predicted score ${p.avgScore})`);
    } catch (e: any) {
      console.log(`  skip ${p.city} ${p.targetDate}: ${e.message}`);
    }
  });

  console.log(`Checked ${checked} predicted windows:`);
  console.log(`  Stayed dry: ${pct(stayedDry, checked)}  (${stayedDry}/${checked})  ← headline accuracy`);
  if (wet.length) {
    console.log(`\nWindows that got rained on:`);
    wet.forEach((w) => console.log(w));
  }
}

// ── Entry ──
const mode = process.argv[2] ?? "calibrate";
const run = mode === "capture" ? capture : mode === "verify" ? verify : calibrate;
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
