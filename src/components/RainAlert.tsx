import { motion } from "framer-motion";
import type { RainAlertData } from "@/utils/rainAlert";
import { hrLabel } from "@/utils/bestWindow";

interface Props {
  alert: RainAlertData;
  // True when rain would catch laundry still out (arrives before the planned collect
  // time). Urgent red when true or raining now; informational gold otherwise.
  threatens?: boolean;
}

export default function RainAlert({ alert, threatens = false }: Props) {
  const isNow = alert.type === "now";
  const urgent = isNow || threatens;
  const at = alert.rainHour != null ? hrLabel(alert.rainHour) : null;
  const accent = urgent ? "#ef4444" : "#F4C430";

  let title: string;
  let sub: string;
  if (isNow) {
    title = "It's raining — bring your clothes in.";
    sub = "Any laundry outside will get wet.";
  } else if (threatens && at) {
    title = `Collect before ${at} — rain arriving then.`;
    sub = `Get your laundry inside before ${at} to stay dry.`;
  } else if (at) {
    title = `Rain expected around ${at}.`;
    sub = "A heads-up so you can plan your laundry around it.";
  } else {
    title = "Rain on the way later today.";
    sub = "Something to keep in mind for your laundry.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full px-5 py-4 flex items-start gap-4"
      style={{
        border: `2px solid ${accent}`,
        backgroundColor: urgent ? "rgba(239,68,68,0.06)" : "rgba(244,196,48,0.08)",
      }}
    >
      {/* Pulsing dot — only while it's actively raining */}
      <div className="relative mt-1 shrink-0">
        <span
          className="block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
        {isNow && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: accent }}
            animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Message */}
      <div>
        <p className="font-display text-ink leading-none" style={{ fontSize: "1.1rem" }}>
          {title}
        </p>
        <p className="font-body text-muted text-xs mt-1">{sub}</p>
      </div>
    </motion.div>
  );
}
