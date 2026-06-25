import { motion } from "framer-motion";

export type Day = "today" | "tomorrow";

interface Props {
  value: Day;
  onChange: (day: Day) => void;
  /** Disable the tomorrow tab when no tomorrow forecast is available. */
  tomorrowDisabled?: boolean;
}

// Segmented Today/Tomorrow control — the single source of truth for the chosen day.
// Selection reads at a glance via colour: TODAY = solid ink, TOMORROW = solid gold.
export default function DayToggle({ value, onChange, tomorrowDisabled = false }: Props) {
  const days: Day[] = ["today", "tomorrow"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-0.5 border-2 border-ink/15 bg-cream-dark/30 p-0.5"
      role="tablist"
      aria-label="Forecast day"
    >
      {days.map((day) => {
        const active = value === day;
        const isTomorrow = day === "tomorrow";
        const disabled = isTomorrow && tomorrowDisabled;
        return (
          <button
            key={day}
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(day)}
            className="font-display text-xs tracking-[0.2em] uppercase px-5 py-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={
              active
                ? {
                    backgroundColor: isTomorrow ? "#F4C430" : "#1C1C2E",
                    color: isTomorrow ? "#1C1C2E" : "#F5F0E8",
                  }
                : { backgroundColor: "transparent", color: "#8A8FA8" }
            }
          >
            {day}
          </button>
        );
      })}
    </motion.div>
  );
}
