import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  getWeatherByCity,
  extractWeatherInput,
  extractHours,
  extractTomorrowHours,
  extractLocalHour,
  type WeatherData,
} from "@/services/weatherService";
import { calculateLaundryScore } from "@/utils/laundryScore";
import { getVerdict, type Verdict } from "@/utils/verdictGenerator";
import { findBestWindow, type ClothesType } from "@/utils/bestWindow";
import ScoreCard from "@/components/ScoreCard";
import ClothesTypePicker from "@/components/ClothesTypePicker";
import VerdictBanner from "@/components/VerdictBanner";
import FunnyMessage from "@/components/FunnyMessage";
import BestWindow from "@/components/BestWindow";
import HourlyTimeline from "@/components/HourlyTimeline";

export default function CityPage() {
  const router = useRouter();
  const { city } = router.query;
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [clothesType, setClothesType] = useState<ClothesType>("mixed");

  useEffect(() => {
    if (!city || typeof city !== "string") return;
    setLoading(true);
    setError("");
    setWeather(null);
    getWeatherByCity(city)
      .then((data) => { setWeather(data); setLoading(false); })
      .catch(() => { setError(`Could not find weather for "${city}".`); setLoading(false); });
  }, [city]);

  function handleCitySubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = cityInput.trim();
    if (c) { setCityInput(""); router.push(`/${encodeURIComponent(c.toLowerCase())}`); }
  }

  const cityLabel = typeof city === "string" ? city : "";
  const score = weather ? calculateLaundryScore(extractWeatherInput(weather)) : 0;
  const verdict: Verdict | null = weather ? getVerdict(score) : null;
  const weatherInput = weather ? extractWeatherInput(weather) : null;
  const hours = weather ? extractHours(weather) : [];
  const tomorrowHours = weather ? extractTomorrowHours(weather) : [];
  const windowResult = findBestWindow(hours);
  const tomorrowWindowResult = findBestWindow(tomorrowHours);
  const localHour = weather ? extractLocalHour(weather) : undefined;

  return (
    <>
      <Head>
        <title>{cityLabel ? `${cityLabel.charAt(0).toUpperCase() + cityLabel.slice(1)} — Hang & Dry` : "Hang & Dry"}</title>
        <meta name="description" content={`Laundry weather score for ${cityLabel}.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden">

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

        <header className="flex items-center justify-between px-6 lg:px-8 py-4 border-b-2 border-ink/8 shrink-0">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-display text-lg tracking-widest text-ink uppercase hover:text-gold transition-colors">
              Hang &amp; Dry
            </Link>
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

        <main className="flex-1 overflow-hidden">

          {(loading || error) && (
            <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                  <div className="w-7 h-7 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                  <p className="font-body text-muted text-xl capitalize">Looking up {cityLabel}...</p>
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                  <p className="font-display text-2xl text-ink">City not found.</p>
                  <p className="font-body text-muted text-lg">{error}</p>
                </motion.div>
              )}
            </div>
          )}

          {!loading && !error && weather && verdict && weatherInput && (
            <div className="h-full flex flex-col lg:grid lg:grid-cols-[2fr_3fr]">

              <div className="flex flex-col items-center justify-center gap-3 p-6 lg:px-10 lg:py-12 lg:border-r-2 lg:border-ink/8 overflow-hidden">
                <ScoreCard
                  score={score}
                  locationName={weather.location.name}
                  locationRegion={weather.location.region}
                  locationCountry={weather.location.country}
                />
                <VerdictBanner label={verdict.label} color={verdict.color} />
                <FunnyMessage message={verdict.message} />
              </div>

              <div className="flex flex-col gap-5 p-6 lg:px-12 lg:pt-12 lg:pb-8 overflow-auto lg:overflow-y-auto">
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

        <footer className="lg:hidden w-full text-center py-3 border-t-2 border-ink/8 shrink-0">
          <p className="font-body text-muted text-xs">
            The only weather app that judges your laundry decisions.
          </p>
        </footer>

      </div>
    </>
  );
}
