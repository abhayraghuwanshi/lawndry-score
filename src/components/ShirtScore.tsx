import { motion } from "framer-motion";
import { getScoreColor } from "@/utils/laundryScore";

interface Props {
  score: number;
}

const INK = "#1C1C2E";

/** Mix two hex colours. t=0 → a, t=1 → b. */
function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * The score as a t-shirt pegged to the clothesline: a dyed-cotton silhouette
 * whose colour tracks the score, with the number screen-printed across the
 * chest in a deeper tone of the same hue. Sways gently from two pegs clipped to
 * the rope above. Replaces the old circular gauge so the score reads as just
 * another piece of washing on the line.
 */
export default function ShirtScore({ score }: Props) {
  const base = getScoreColor(score);
  const fabric = mix(base, "#FFFFFF", 0.6); // soft dyed cotton
  const fabricShade = mix(base, "#FFFFFF", 0.42); // shaded fabric for depth
  const print = mix(base, INK, 0.42); // deep, readable print on the fabric

  // Abril Fatface is wide — pull the size in for the 3-digit "100".
  const numberSize = score >= 100 ? "3.5rem" : "4.6rem";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
      style={{ width: 240, height: 252 }}
    >
      {/* shirt + pegs — sways from the peg line at the top */}
      <div
        className="hd-anim"
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: "50% 8px",
          animation: "hd-sway-soft 6s ease-in-out infinite",
        }}
      >
        <svg width="240" height="252" viewBox="0 0 200 210" style={{ overflow: "visible" }}>
          <defs>
            {/* subtle top-down shading so the cotton reads as fabric, not a flat fill */}
            <linearGradient id="hd-fabric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fabric} />
              <stop offset="100%" stopColor={fabricShade} />
            </linearGradient>
          </defs>

          {/* strings from the pegs down to the shoulders */}
          <line x1={60} y1={18} x2={60} y2={32} stroke={INK} strokeOpacity={0.4} strokeWidth={1.5} />
          <line x1={140} y1={18} x2={140} y2={32} stroke={INK} strokeOpacity={0.4} strokeWidth={1.5} />

          {/* shirt body, dyed by the score */}
          <path
            d="M 76 32 C 66 26 52 28 46 38 L 20 58 L 36 88 L 56 74 L 56 196 L 144 196 L 144 74 L 164 88 L 180 58 L 154 38 C 148 28 134 26 124 32 C 114 50 86 50 76 32 Z"
            fill="url(#hd-fabric)"
            stroke={INK}
            strokeOpacity={0.85}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {/* collar trim */}
          <path
            d="M 76 32 C 86 50 114 50 124 32"
            fill="none"
            stroke={print}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          {/* sleeve cuffs */}
          <path d="M 36 88 L 56 74" fill="none" stroke={print} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
          <path d="M 164 88 L 144 74" fill="none" stroke={print} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
          {/* hem accent */}
          <line x1={58} y1={190} x2={142} y2={190} stroke={print} strokeOpacity={0.25} strokeWidth={2.5} strokeLinecap="round" />

          {/* pegs clipping the shoulders to the rope */}
          <line x1={60} y1={6} x2={60} y2={20} stroke="#F4C430" strokeWidth={6} strokeLinecap="round" />
          <line x1={140} y1={6} x2={140} y2={20} stroke="#F4C430" strokeWidth={6} strokeLinecap="round" />
        </svg>

        {/* score printed on the chest */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 30 }}>
          <motion.span
            className="font-display leading-none"
            style={{ fontSize: numberSize, color: print, lineHeight: 1, letterSpacing: "-0.02em" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
          >
            {score}
          </motion.span>
          <span
            className="font-body uppercase"
            style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: print, opacity: 0.65, marginTop: 4 }}
          >
            out of 100
          </span>
        </div>
      </div>
    </motion.div>
  );
}
