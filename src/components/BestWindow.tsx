import { motion } from "framer-motion";
import type { WindowResult, ClothesType } from "@/utils/bestWindow";
import { hrLabel, adjustDryHours } from "@/utils/bestWindow";
import type { Day } from "@/components/DayToggle";

interface Props {
  result: WindowResult;
  day: Day;
  localHour?: number;
  clothesType?: ClothesType;
}

export default function BestWindow({ result, day, localHour, clothesType = "mixed" }: Props) {
  const isToday = day === "today";
  const currentHour = localHour ?? new Date().getHours();

  const noWindow = !result.hasWindow || result.hangHour === null || result.collectHour === null;
  // "Past" / "now" only apply to today — tomorrow's window is always upcoming.
  const isPast = isToday && !noWindow && currentHour >= result.collectHour!;
  const isNow = isToday && !noWindow && !isPast && currentHour >= result.hangHour!;

  const dryHrs = noWindow ? 0 : adjustDryHours(result.dryHours, clothesType);
  const collectHr = noWindow ? 0 : result.hangHour! + dryHrs;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.15 }}
      className="w-full border-2 border-ink/10 bg-cream-dark/40 px-6 py-5"
    >
      <div className="flex flex-col items-center gap-1.5 mb-4">
        <p className="font-body text-muted text-xs tracking-[0.25em] uppercase">
          Laundry Window
        </p>
      </div>

      {/* No good drying window */}
      {noWindow && (
        <div className="text-center">
          <p className="font-display text-2xl text-ink">No good window.</p>
          <p className="font-body italic text-muted text-lg mt-1">
            {isToday ? "Wait for better weather." : "Not a great drying day."}
          </p>
        </div>
      )}

      {/* Today's window has already closed */}
      {!noWindow && isPast && (
        <div className="text-center">
          <p className="font-display text-2xl text-ink">Too late today.</p>
          <p className="font-body italic text-muted text-lg mt-1">
            Check tomorrow&apos;s forecast.
          </p>
        </div>
      )}

      {/* Upcoming or active window */}
      {!noWindow && !isPast && (
        <>
          <div className="flex items-center justify-center gap-6 md:gap-10">
            <div className="text-center">
              <p className="font-body text-muted text-xs tracking-[0.2em] uppercase mb-1">
                {isNow ? "Hang Now" : "Hang at"}
              </p>
              <p
                className="font-display leading-none text-ink"
                style={{ fontSize: isNow ? "2.8rem" : "3.5rem" }}
              >
                {isNow ? "NOW" : hrLabel(result.hangHour!)}
              </p>
            </div>
            <div className="text-ink/25 font-display text-2xl select-none mt-4">→</div>
            <div className="text-center">
              <p className="font-body text-muted text-xs tracking-[0.2em] uppercase mb-1">
                Collect by
              </p>
              <p className="font-display leading-none text-ink" style={{ fontSize: "3.5rem" }}>
                {hrLabel(collectHr)}
              </p>
            </div>
          </div>
          <p className="font-body text-muted text-sm text-center mt-4">
            ~{dryHrs} hour{dryHrs !== 1 ? "s" : ""} to dry
            {result.windowEnd && result.windowEnd > collectHr && (
              <span>
                {" · "}window open until{" "}
                <span className="text-ink">{hrLabel(result.windowEnd)}</span>
              </span>
            )}
          </p>
        </>
      )}
    </motion.div>
  );
}
