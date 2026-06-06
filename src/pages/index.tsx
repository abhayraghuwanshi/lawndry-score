import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import {
  getWeatherByCoords,
  extractWeatherInput,
  extractHours,
  extractTomorrowHours,
  extractLocalHour,
  type WeatherData,
} from "@/services/weatherService";
import { calculateLaundryScore } from "@/utils/laundryScore";
import { getVerdict, type Verdict } from "@/utils/verdictGenerator";
import { findBestWindow, type ClothesType, adjustScoreForClothesType } from "@/utils/bestWindow";
import { checkRainAlert } from "@/utils/rainAlert";
import ScoreCard from "@/components/ScoreCard";
import ClothesTypePicker from "@/components/ClothesTypePicker";
import RainAlert from "@/components/RainAlert";
import DayBadge from "@/components/DayBadge";
import ScoreExplainer from "@/components/ScoreExplainer";
import VerdictBanner from "@/components/VerdictBanner";
import FunnyMessage from "@/components/FunnyMessage";
import BestWindow from "@/components/BestWindow";
import HourlyTimeline from "@/components/HourlyTimeline";

type Status = "loading" | "success" | "denied" | "error";

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [clothesType, setClothesType] = useState<ClothesType>("mixed");

  const fetchWeather = useCallback(() => {
    if (!navigator.geolocation) { setStatus("denied"); return; }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
          setWeather(data);
          setStatus("success");
        } catch {
          setErrorMsg("Could not fetch weather data.");
          setStatus("error");
        }
      },
      () => setStatus("denied"),
      {
        timeout: 8000,       // fail fast instead of hanging forever
        maximumAge: 300000,  // reuse cached GPS position up to 5 min old (instant on mobile)
        enableHighAccuracy: false, // wifi/cell positioning — faster, less battery
      }
    );
  }, []);

  // Initial load
  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  // Refresh when tab becomes visible again (handles mobile app-switch / bfcache)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") fetchWeather(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchWeather]);

  function handleCitySubmit(e: React.FormEvent) {
    e.preventDefault();
    const city = cityInput.trim();
    if (city) router.push(`/${encodeURIComponent(city.toLowerCase())}`);
  }

  const weatherInput = weather ? extractWeatherInput(weather) : null;
  const hours = weather ? extractHours(weather) : [];
  const tomorrowHours = weather ? extractTomorrowHours(weather) : [];
  const localHour = weather ? extractLocalHour(weather) : undefined;
  const windowResult = findBestWindow(hours, localHour);
  const tomorrowWindowResult = findBestWindow(tomorrowHours);
  const rawRainAlert = weather && localHour !== undefined ? checkRainAlert(weather, localHour) : null;
  // Always surface the rain time. A "soon" alert "threatens" (urgent red) only when rain
  // would catch laundry still out — i.e. it arrives before the planned collect time.
  // Otherwise it's an informational heads-up (gold) since you'd already be done.
  const rainAlert = rawRainAlert;
  const rainThreatens =
    rawRainAlert?.type === "soon" &&
    rawRainAlert.rainHour !== undefined &&
    windowResult.hasWindow &&
    windowResult.collectHour !== null &&
    rawRainAlert.rainHour < windowResult.collectHour;

  const noTodayWindow = !windowResult.hasWindow || windowResult.hangHour === null || windowResult.collectHour === null;
  const isTodayPast = !noTodayWindow && localHour !== undefined && localHour >= windowResult.collectHour!;
  const isTomorrow = (noTodayWindow || isTodayPast) && tomorrowWindowResult.hasWindow && tomorrowWindowResult.hangHour !== null;

  const rawBaseScore = weather ? calculateLaundryScore(extractWeatherInput(weather)) : 0;

  // The headline score represents the *recommended* drying window, so the big number
  // agrees with the BestWindow card. It stays on live conditions only when a window is
  // active right now (more responsive) or while it's raining (so it matches the alert).
  const isRainingNow = rawRainAlert?.type === "now";
  const todayWindowActiveNow =
    windowResult.hasWindow && !isTodayPast &&
    windowResult.hangHour !== null &&
    localHour !== undefined &&
    localHour >= windowResult.hangHour;
  const todayWindowUpcoming = windowResult.hasWindow && !isTodayPast && !todayWindowActiveNow;

  const showTomorrowScore = !isRainingNow && isTomorrow && tomorrowWindowResult.avgScore > 0;
  const showTodayWindowScore =
    !isRainingNow && !showTomorrowScore && todayWindowUpcoming && windowResult.avgScore > 0;
  const baseScore = showTomorrowScore
    ? tomorrowWindowResult.avgScore
    : showTodayWindowScore
      ? windowResult.avgScore
      : rawBaseScore;
  const score = adjustScoreForClothesType(baseScore, clothesType);
  const verdict: Verdict | null = weather ? getVerdict(score) : null;

  return (
    <>
      <Head>
        <title>Hang &amp; Dry — Should you do laundry today?</title>
        <meta name="description" content="The only weather app that judges your laundry decisions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden">

        {/* Verdict accent bar — desktop only */}
        <AnimatePresence>
          {verdict && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hidden lg:block h-[3px] origin-left"
              style={{ backgroundColor: verdict.color }}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex items-center justify-between px-6 lg:px-8 py-4 border-b-2 border-ink/8 shrink-0">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-lg tracking-widest text-ink uppercase">
              Hang &amp; Dry
            </span>
            <span className="font-body text-muted text-xs tracking-wider hidden sm:inline">
              — the laundry forecast
            </span>
          </div>
          <form onSubmit={handleCitySubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search a city..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="font-body text-sm bg-transparent border-b-2 border-ink/20 focus:border-ink focus:outline-none px-1 py-0.5 w-28 sm:w-40 text-ink placeholder:text-muted/60 transition-colors"
            />
            <button
              type="submit"
              className="font-display text-xs tracking-widest bg-ink text-cream px-3 py-1.5 hover:bg-gold hover:text-ink transition-colors uppercase"
            >
              Go
            </button>
          </form>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-hidden">

          {/* Non-success: centered */}
          {status !== "success" && (
            <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
              {status === "loading" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                  <div className="w-7 h-7 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                  <p className="font-body text-muted text-xl">Checking the skies...</p>
                </motion.div>
              )}
              {status === "denied" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
                  <p className="font-display text-3xl text-ink tracking-wide">Location not shared.</p>
                  <p className="font-body text-muted text-xl">Search a city above to get the forecast.</p>
                </motion.div>
              )}
              {status === "error" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                  <p className="font-display text-2xl text-ink">Something went wrong.</p>
                  <p className="font-body text-muted text-lg">{errorMsg}</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Success: two-column on lg, stacked on mobile */}
          {status === "success" && weather && verdict && weatherInput && (
            <div className="h-full flex flex-col lg:grid lg:grid-cols-[2fr_3fr]">

              {/* ── Left panel: score ── */}
              <div className="flex flex-col items-center justify-center gap-3 p-6 lg:px-10 lg:py-12 lg:border-r-2 lg:border-ink/8 overflow-hidden">
                <ScoreCard
                  score={score}
                  locationName={weather.location.name}
                  locationRegion={weather.location.region}
                  locationCountry={weather.location.country}
                />
                <VerdictBanner label={verdict.label} color={verdict.color} />
                <DayBadge day={showTomorrowScore ? "tomorrow" : "today"} />
                <FunnyMessage message={verdict.message} />
                <ScoreExplainer />
              </div>

              {/* ── Right panel: action ── */}
              <div className="flex flex-col gap-5 p-6 lg:px-12 lg:pt-12 lg:pb-8 overflow-auto lg:overflow-y-auto">
                {rainAlert && <RainAlert alert={rainAlert} threatens={rainThreatens} />}
                <ClothesTypePicker value={clothesType} onChange={setClothesType} />
                <BestWindow result={windowResult} tomorrowResult={tomorrowWindowResult} localHour={localHour} clothesType={clothesType} />
                <HourlyTimeline
                  hourlyScores={windowResult.hourlyScores}
                  windowStart={windowResult.windowStart}
                  windowEnd={windowResult.windowEnd}
                  localHour={localHour}
                />
              </div>

            </div>
          )}
        </main>

        {/* Footer — mobile only */}
        <footer className="lg:hidden w-full text-center py-3 border-t-2 border-ink/8 shrink-0">
          <p className="font-body text-muted text-xs">
            The only weather app that judges your laundry decisions.
          </p>
        </footer>

      </div>
    </>
  );
}
