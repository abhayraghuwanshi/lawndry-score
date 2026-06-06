import { motion } from "framer-motion";

interface Props {
  day: "today" | "tomorrow";
  // Slightly smaller variant for use inside cards.
  size?: "lg" | "sm";
}

// A bold, color-coded pill so the day is readable at a glance — no reading required.
// TODAY is solid ink; TOMORROW flips to solid gold so the two are unmistakable.
export default function DayBadge({ day, size = "lg" }: Props) {
  const isTomorrow = day === "tomorrow";
  const pad = size === "lg" ? "px-4 py-1.5" : "px-3 py-1";
  const text = size === "lg" ? "text-sm" : "text-xs";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={`inline-flex items-center gap-2 font-display tracking-[0.25em] uppercase ${pad} ${text}`}
      style={{
        backgroundColor: isTomorrow ? "#F4C430" : "#1C1C2E",
        color: isTomorrow ? "#1C1C2E" : "#F5F0E8",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: isTomorrow ? "#1C1C2E" : "#F4C430" }}
      />
      {isTomorrow ? "Tomorrow" : "Today"}
    </motion.span>
  );
}
