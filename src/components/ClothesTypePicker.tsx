import type { ClothesType } from "@/utils/bestWindow";

interface Props {
  value: ClothesType;
  onChange: (t: ClothesType) => void;
}

const OPTIONS: { type: ClothesType; label: string; sub: string }[] = [
  { type: "light", label: "Light",  sub: "shirts · socks" },
  { type: "mixed", label: "Mixed",  sub: "everyday wash" },
  { type: "heavy", label: "Heavy",  sub: "jeans · towels" },
];

export default function ClothesTypePicker({ value, onChange }: Props) {
  return (
    <div className="w-full">
      <p className="font-body text-muted text-xs tracking-[0.25em] uppercase text-center mb-3">
        Load Type
      </p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ type, label, sub }) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex flex-col items-center py-3 px-2 border-2 transition-colors ${
              value === type
                ? "border-ink bg-ink text-cream"
                : "border-ink/15 bg-cream-dark/40 text-ink hover:border-ink/40"
            }`}
          >
            <span className="font-display text-sm tracking-widest uppercase leading-none">
              {label}
            </span>
            <span
              className={`font-body text-center mt-1 leading-tight ${
                value === type ? "text-cream/60" : "text-muted"
              }`}
              style={{ fontSize: "0.6rem" }}
            >
              {sub}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
