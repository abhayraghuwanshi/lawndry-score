import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getScoreColor } from "@/utils/laundryScore";

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

const CX = 140;
const CY = 140;
const R = 108;
// 270° arc: bottom-left (-135°) → top → bottom-right (+135°)
const TRACK_PATH = describeArc(CX, CY, R, -135, 135);

interface Props {
  score: number;
}

export default function ScoreCard({ score }: Props) {
  const [progress, setProgress] = useState(0);
  const color = getScoreColor(score);

  useEffect(() => {
    const t = setTimeout(() => setProgress(score / 100), 180);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-1"
    >
      <div className="relative" style={{ width: 280, height: 280 }}>
        <svg
          viewBox="0 0 280 280"
          width="280"
          height="280"
          style={{ overflow: "visible" }}
        >
          {/* Track ring */}
          <path
            d={TRACK_PATH}
            stroke="#E0D9CC"
            strokeWidth={13}
            fill="none"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={TRACK_PATH}
            pathLength={1}
            stroke={color}
            strokeWidth={13}
            fill="none"
            // butt (not round): a round cap on a dash whose length == pathLength
            // renders with a recessed end in Chrome, leaving a gap before the
            // leftover track. The track's own round caps give the ring its
            // rounded ends, so the fill meets the remaining track seamlessly.
            strokeLinecap="butt"
            strokeDasharray={`${progress.toFixed(4)} ${(1 - progress).toFixed(4)}`}
            strokeDashoffset={0}
            style={{
              transition:
                "stroke-dasharray 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.25s, stroke 0.6s ease",
            }}
          />
        </svg>

        {/* Score number */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingBottom: 32 }}
        >
          <motion.span
            className="font-display leading-none"
            style={{ fontSize: "5.5rem", color, lineHeight: 1 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.55, ease: "easeOut" }}
          >
            {score}
          </motion.span>
          <span className="font-body text-muted" style={{ fontSize: "1rem" }}>
            / 100
          </span>
        </div>
      </div>
    </motion.div>
  );
}
