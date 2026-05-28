import { calculateLaundryScore } from "./laundryScore";
import type { HourlyWeather } from "@/services/weatherService";

export interface HourScore {
  hour: number;
  score: number;
}

export interface WindowResult {
  hangHour: number | null;
  collectHour: number | null;
  windowStart: number | null;
  windowEnd: number | null;
  dryHours: number;
  avgScore: number;
  hasWindow: boolean;
  hourlyScores: HourScore[];
}

export type ClothesType = "light" | "mixed" | "heavy";

// Research-backed adjustments per load type (source: textile drying studies)
// Light (thin cotton, synthetics): 1–3 hrs in good weather
// Mixed (shirts, light pants):     2–5 hrs — baseline
// Heavy (jeans, towels, hoodies):  4–7 hrs minimum
export function adjustDryHours(base: number, type: ClothesType): number {
  if (type === "light") return Math.max(1, base - 1);
  if (type === "heavy") return Math.max(4, base + 2);
  return base;
}

export function hrLabel(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

// Baseline dry time for a mixed load — adjusted per clothes type via adjustDryHours
function estimateDryHours(avgScore: number): number {
  if (avgScore >= 80) return 2; // ideal: sun, dry, breezy — mixed load ~2 hrs
  if (avgScore >= 60) return 3; // good conditions — mixed load ~3 hrs
  if (avgScore >= 40) return 4; // decent — mixed load ~4 hrs
  return 5;                     // poor — slow drying, mixed load ~5 hrs
}

export function findBestWindow(hours: HourlyWeather[]): WindowResult {
  const FIRST_HOUR = 6;
  const LAST_HANG = 15; // don't start hanging after 3 PM
  const MIN_SCORE = 50;

  const parsed: HourScore[] = hours
    .map((h) => ({
      hour: parseInt(h.time.split(" ")[1].split(":")[0], 10),
      score: calculateLaundryScore({
        temp_c: h.temp_c,
        humidity: h.humidity,
        wind_kph: h.wind_kph,
        precip_mm: h.precip_mm,
        uv: h.uv,
        cloud: h.cloud,
        chance_of_rain: h.chance_of_rain,
      }),
    }))
    .filter((h) => h.hour >= FIRST_HOUR && h.hour <= 20);

  // Find the longest consecutive run where score >= MIN_SCORE and start <= LAST_HANG
  let bestStart = -1;
  let bestEnd = -1;
  let bestLen = 0;
  let bestAvg = 0;

  let i = 0;
  while (i < parsed.length) {
    const { hour, score } = parsed[i];
    if (score >= MIN_SCORE && hour <= LAST_HANG) {
      let j = i;
      while (j < parsed.length && parsed[j].score >= MIN_SCORE) j++;
      const slice = parsed.slice(i, j);
      const len = slice.length;
      const avg = slice.reduce((s, x) => s + x.score, 0) / len;
      if (len > bestLen || (len === bestLen && avg > bestAvg)) {
        bestStart = parsed[i].hour;
        bestEnd = parsed[j - 1].hour;
        bestLen = len;
        bestAvg = avg;
      }
      i = j;
    } else {
      i++;
    }
  }

  if (bestStart === -1) {
    return {
      hangHour: null,
      collectHour: null,
      windowStart: null,
      windowEnd: null,
      dryHours: 0,
      avgScore: 0,
      hasWindow: false,
      hourlyScores: parsed,
    };
  }

  const dry = estimateDryHours(bestAvg);
  // Collect time = hang start + drying time, but no later than window end + 1
  const collect = Math.min(bestStart + dry, bestEnd + 1);

  return {
    hangHour: bestStart,
    collectHour: collect,
    windowStart: bestStart,
    windowEnd: bestEnd + 1,
    dryHours: dry,
    avgScore: Math.round(bestAvg),
    hasWindow: true,
    hourlyScores: parsed,
  };
}
