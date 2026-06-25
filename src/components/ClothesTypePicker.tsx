import { motion } from "framer-motion";
import type { ClothesType } from "@/utils/bestWindow";

interface Props {
  value: ClothesType;
  onChange: (t: ClothesType) => void;
}

const OPTIONS: { type: ClothesType; label: string }[] = [
  { type: "light", label: "Light" },
  { type: "mixed", label: "Mixed" },
  { type: "heavy", label: "Heavy" },
];

// Compact segmented load-type control for the top bar, matching DayToggle.
// Active option = solid ink; the day toggle owns the gold (tomorrow) accent.
export default function ClothesTypePicker({ value, onChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-0.5 border-2 border-ink/15 bg-cream-dark/30 p-0.5"
      role="tablist"
      aria-label="Load type"
    >
      {OPTIONS.map(({ type, label }) => {
        const active = value === type;
        return (
          <button
            key={type}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(type)}
            className="font-display text-xs tracking-[0.2em] uppercase px-5 py-2 transition-colors"
            style={
              active
                ? { backgroundColor: "#1C1C2E", color: "#F5F0E8" }
                : { backgroundColor: "transparent", color: "#8A8FA8" }
            }
          >
            {label}
          </button>
        );
      })}
    </motion.div>
  );
}
