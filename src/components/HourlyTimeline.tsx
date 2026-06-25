import { motion } from "framer-motion";
import { getScoreColor } from "@/utils/laundryScore";
import type { HourScore } from "@/utils/bestWindow";
import type { Day } from "@/components/DayToggle";

interface Props {
  hourlyScores: HourScore[];
  windowStart: number | null;
  windowEnd: number | null;
  localHour?: number;
  day?: Day;
}

const SLOTS = [
  { label: "Morning",   range: "6–9 AM",   hours: [6, 7, 8] },
  { label: "Midday",    range: "9–12 PM",  hours: [9, 10, 11] },
  { label: "Afternoon", range: "12–3 PM",  hours: [12, 13, 14] },
  { label: "Evening",   range: "3–8 PM",   hours: [15, 16, 17, 18, 19, 20] },
];

function statusLabel(avg: number): string {
  if (avg >= 80) return "Great";
  if (avg >= 60) return "Good";
  if (avg >= 40) return "Ok";
  if (avg >= 20) return "Poor";
  return "Bad";
}

export default function HourlyTimeline({ hourlyScores, windowStart, windowEnd, localHour, day = "today" }: Props) {
  // Tomorrow is always upcoming, so nothing is "past" — only dim past slots for today.
  const currentHour = day === "today" ? (localHour ?? new Date().getHours()) : -1;
  const scoreMap = new Map(hourlyScores.map((h) => [h.hour, h.score]));

  if (hourlyScores.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.3 }}
      className="w-full"
    >
      <p className="font-body text-muted text-xs tracking-[0.25em] uppercase text-center mb-3">
        {day === "tomorrow" ? "Tomorrow" : "Today"} at a Glance
      </p>

      <div className="grid grid-cols-4 gap-2">
        {SLOTS.map(({ label, range, hours }, i) => {
          const scores = hours.map((h) => scoreMap.get(h) ?? 0);
          const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          const color = getScoreColor(avg);
          const isPast = currentHour > hours[hours.length - 1];
          const inWindow =
            windowStart !== null &&
            windowEnd !== null &&
            hours.some((h) => h >= windowStart && h < windowEnd);

          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isPast ? 0.4 : 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.3 + i * 0.07 }}
              className="relative border-2 border-ink/10 bg-cream-dark/40 px-3 py-3 flex flex-col gap-1"
            >
              {/* colored top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ backgroundColor: color }}
              />

              <p className="font-display text-ink leading-none" style={{ fontSize: "1.25rem" }}>
                {statusLabel(avg)}
              </p>
              <p className="font-body text-ink text-xs tracking-wide">{label}</p>
              <p className="font-body text-muted" style={{ fontSize: "0.65rem" }}>{range}</p>

              {inWindow && !isPast && (
                <span
                  className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
