import { motion } from "framer-motion";
import type { RainAlertData } from "@/utils/rainAlert";

interface Props {
  alert: RainAlertData;
}

export default function RainAlert({ alert }: Props) {
  const isNow = alert.type === "now";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full px-5 py-4 flex items-start gap-4"
      style={{
        border: `2px solid ${isNow ? "#ef4444" : "#F4C430"}`,
        backgroundColor: isNow ? "rgba(239,68,68,0.06)" : "rgba(244,196,48,0.08)",
      }}
    >
      {/* Pulsing dot */}
      <div className="relative mt-1 shrink-0">
        <span
          className="block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: isNow ? "#ef4444" : "#F4C430" }}
        />
        {isNow && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "#ef4444" }}
            animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Message */}
      <div>
        <p className="font-display text-ink leading-none" style={{ fontSize: "1.1rem" }}>
          {isNow ? "It's raining — bring your clothes in." : `Rain in ~${alert.hoursUntil} hour${alert.hoursUntil !== 1 ? "s" : ""}.`}
        </p>
        <p className="font-body text-muted text-xs mt-1">
          {isNow
            ? "Any laundry outside will get wet."
            : "Start collecting soon to stay ahead of it."}
        </p>
      </div>
    </motion.div>
  );
}
