import { motion } from "framer-motion";

interface Props {
  name: string;
  region: string;
  country: string;
}

// Page-level "where" header. Lives at the top of the right (forecast) panel so
// the left column can be a clean score hero.
export default function LocationHeader({ name, region, country }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full text-center"
    >
      <p className="font-display text-2xl md:text-3xl text-ink tracking-widest uppercase">
        {name}
        {region && region !== name && (
          <span className="font-body text-muted text-lg md:text-xl font-normal tracking-wide">
            {", "}
            {region}
          </span>
        )}
      </p>
      <p className="font-body text-muted text-xs tracking-[0.3em] uppercase">
        {country}
      </p>
    </motion.div>
  );
}
