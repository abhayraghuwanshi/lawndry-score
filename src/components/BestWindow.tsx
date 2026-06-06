import { motion } from "framer-motion";
import type { WindowResult, ClothesType } from "@/utils/bestWindow";
import { hrLabel, adjustDryHours } from "@/utils/bestWindow";
import DayBadge from "@/components/DayBadge";

interface Props {
  result: WindowResult;
  tomorrowResult?: WindowResult;
  localHour?: number;
  clothesType?: ClothesType;
}

export default function BestWindow({ result, tomorrowResult, localHour, clothesType = "mixed" }: Props) {
  const currentHour = localHour ?? new Date().getHours();

  const noWindow = !result.hasWindow || result.hangHour === null || result.collectHour === null;
  const isPast = !noWindow && currentHour >= result.collectHour!;
  const showTomorrow = (noWindow || isPast) && tomorrowResult?.hasWindow &&
    tomorrowResult.hangHour !== null && tomorrowResult.collectHour !== null;
  const isNow = !noWindow && !isPast && currentHour >= result.hangHour!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.15 }}
      className="w-full border-2 border-ink/10 bg-cream-dark/40 px-6 py-5"
    >
      <div className="flex flex-col items-center gap-1.5 mb-4">
        <DayBadge day={showTomorrow ? "tomorrow" : "today"} size="sm" />
        <p className="font-body text-muted text-xs tracking-[0.25em] uppercase">
          Laundry Window
        </p>
      </div>

      {/* Today's window is done, show tomorrow */}
      {showTomorrow && (() => {
        const dryHrs = adjustDryHours(tomorrowResult!.dryHours, clothesType);
        const collectHr = tomorrowResult!.hangHour! + dryHrs;
        return (
          <>
            <div className="flex items-center justify-center gap-6 md:gap-10">
              <div className="text-center">
                <p className="font-body text-muted text-xs tracking-[0.2em] uppercase mb-1">Hang at</p>
                <p className="font-display leading-none text-ink" style={{ fontSize: "3.5rem" }}>
                  {hrLabel(tomorrowResult!.hangHour!)}
                </p>
              </div>
              <div className="text-ink/25 font-display text-2xl select-none mt-4">→</div>
              <div className="text-center">
                <p className="font-body text-muted text-xs tracking-[0.2em] uppercase mb-1">Collect by</p>
                <p className="font-display leading-none text-ink" style={{ fontSize: "3.5rem" }}>
                  {hrLabel(collectHr)}
                </p>
              </div>
            </div>
            <p className="font-body text-muted text-sm text-center mt-4">
              {isPast ? "Too late today." : "No good window today."}{" "}
              Plan for tomorrow &mdash; ~{dryHrs} hour{dryHrs !== 1 ? "s" : ""} to dry.
            </p>
          </>
        );
      })()}

      {/* No window today, no window tomorrow */}
      {!showTomorrow && noWindow && (
        <div className="text-center">
          <p className="font-display text-2xl text-ink">No good window.</p>
          <p className="font-body italic text-muted text-lg mt-1">
            Wait for better weather.
          </p>
        </div>
      )}

      {/* Window closed today, no window tomorrow */}
      {!showTomorrow && isPast && !noWindow && (
        <div className="text-center">
          <p className="font-display text-2xl text-ink">Too late today.</p>
          <p className="font-body italic text-muted text-lg mt-1">
            Check back tomorrow morning.
          </p>
        </div>
      )}

      {/* Active window */}
      {!noWindow && !isPast && (
        <>
          {(() => {
            const dryHrs = adjustDryHours(result.dryHours, clothesType);
            const collectHr = result.hangHour! + dryHrs;
            return (
              <>
                <div className="flex items-center justify-center gap-6 md:gap-10">
                  <div className="text-center">
                    <p className="font-body text-muted text-xs tracking-[0.2em] uppercase mb-1">
                      {isNow ? "Hang Now" : "Hang at"}
                    </p>
                    <p className="font-display leading-none text-ink"
                      style={{ fontSize: isNow ? "2.8rem" : "3.5rem" }}>
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
            );
          })()}
        </>
      )}
    </motion.div>
  );
}
