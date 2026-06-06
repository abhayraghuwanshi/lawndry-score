import { motion } from "framer-motion";

interface Props {
  message: string;
}

export default function FunnyMessage({ message }: Props) {
  return (
    <motion.p
      key={message}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="font-body italic text-ink/65 text-center max-w-sm md:max-w-md px-4"
      style={{ fontSize: "clamp(1.1rem, 4vw, 1.4rem)" }}
    >
      &ldquo;{message}&rdquo;
    </motion.p>
  );
}
