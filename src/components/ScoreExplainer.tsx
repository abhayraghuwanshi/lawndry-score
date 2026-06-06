import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Plain-language "why this score" — answers "how accurate is this?" without dumping
// the VPD math on the page. Collapsed by default so it never clutters the main view.
const FACTORS = [
  { name: "Air dryness", note: "how much moisture the air can still soak up — the biggest factor" },
  { name: "Wind", note: "a breeze carries moisture away" },
  { name: "Sun", note: "warms the clothes and speeds drying" },
  { name: "Temperature", note: "warmer air holds more moisture" },
];

export default function ScoreExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-sm md:max-w-md flex flex-col items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-body text-muted hover:text-ink transition-colors text-sm tracking-wide flex items-center gap-1.5"
      >
        How is this scored?
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 text-center">
              <p className="font-body text-ink/70 text-sm mb-2">
                Not just temperature — we weigh the four things that actually dry clothes:
              </p>
              <ul className="font-body text-ink/70 text-sm space-y-1 text-left inline-block">
                {FACTORS.map((f) => (
                  <li key={f.name}>
                    <span className="text-ink">{f.name}</span>
                    <span className="text-muted"> — {f.note}</span>
                  </li>
                ))}
              </ul>
              <p className="font-body italic text-muted text-xs mt-2">
                Rain, or air too damp to dry, overrides the rest and drops the score.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
