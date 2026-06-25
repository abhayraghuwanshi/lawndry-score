import { useMemo } from "react";

type Mode = "sunny" | "partly" | "rainy";

interface Props {
  score: number;
  /** It's actively raining right now — forces the rainy scene regardless of score. */
  raining?: boolean;
}

function getMode(score: number, raining: boolean): Mode {
  if (raining || score < 35) return "rainy";
  if (score >= 65) return "sunny";
  return "partly";
}

/** Bright sun with slowly rotating, breathing rays. Good-drying-day mood. */
function Sun() {
  const rays = Array.from({ length: 12 });
  return (
    <div style={{ width: 120, height: 120, position: "relative" }}>
      <div
        className="hd-anim"
        style={{
          position: "absolute",
          inset: 0,
          animation: "hd-spin-slow 60s linear infinite",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          {rays.map((_, i) => {
            const a = (i / rays.length) * Math.PI * 2;
            const x1 = 60 + Math.cos(a) * 40;
            const y1 = 60 + Math.sin(a) * 40;
            const x2 = 60 + Math.cos(a) * 54;
            const y2 = 60 + Math.sin(a) * 54;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#F4C430"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>
      <div
        className="hd-anim"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "hd-breathe 5s ease-in-out infinite",
          transformOrigin: "50% 50%",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* soft glow */}
          <circle cx={60} cy={60} r={40} fill="#F4C430" opacity={0.12} />
          <circle cx={60} cy={60} r={32} fill="#F4C430" opacity={0.16} />
          {/* core disc */}
          <circle cx={60} cy={60} r={25} fill="#F4C430" />
          <circle cx={60} cy={60} r={25} fill="none" stroke="#E0A800" strokeOpacity={0.35} strokeWidth={1.5} />
        </svg>
      </div>
    </div>
  );
}

/** A soft line-art cloud. */
function Cloud({
  scale = 1,
  drift,
  delay = 0,
  opacity = 1,
}: {
  scale?: number;
  drift?: number;
  delay?: number;
  opacity?: number;
}) {
  return (
    <div
      className={drift ? "hd-anim" : undefined}
      style={{
        opacity,
        animation: drift ? `hd-drift ${drift}s ease-in-out ${delay}s infinite` : undefined,
      }}
    >
      <svg
        width={110 * scale}
        height={60 * scale}
        viewBox="0 0 110 60"
        style={{ overflow: "visible" }}
      >
        <path
          d="M22 50 C8 50 6 34 19 32 C18 18 38 14 44 26 C50 12 76 14 76 30 C92 28 96 50 80 50 Z"
          fill="rgba(28,28,46,0.06)"
          stroke="#1C1C2E"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function WeatherScene({ score, raining = false }: Props) {
  const mode = getMode(score, raining);

  // Stable per-streak timing so rain doesn't reshuffle on every render.
  const streaks = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        left: `${(i / 16) * 100 + (i % 3) * 3}%`,
        duration: 0.7 + ((i * 7) % 5) * 0.12,
        delay: ((i * 13) % 17) * 0.11,
        height: 16 + ((i * 5) % 4) * 6,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* ── Sky: sun / cloud(s) top-right, above the clothesline. Scaled down on
           small screens and anchored to the corner so it stays in the sky and
           never lands on the rope or the shirt. ── */}
      <div className="absolute right-3 top-3 lg:right-10 lg:top-8 origin-top-right scale-[0.6] sm:scale-75 lg:scale-100">
        {mode === "sunny" && <Sun />}
        {mode === "partly" && (
          <div className="relative" style={{ width: 150, height: 110 }}>
            <div className="absolute right-4 top-0 opacity-90">
              <Sun />
            </div>
            <div className="absolute left-0 top-10">
              <Cloud scale={1.1} drift={9} />
            </div>
          </div>
        )}
        {mode === "rainy" && (
          <div className="relative" style={{ width: 160, height: 110 }}>
            <div className="absolute right-0 top-0">
              <Cloud scale={1.35} drift={8} />
            </div>
            <div className="absolute left-0 top-7 opacity-70">
              <Cloud scale={0.9} drift={11} delay={1.5} />
            </div>
          </div>
        )}
      </div>

      {/* ── Rain streaks ── */}
      {mode === "rainy" &&
        streaks.map((s, i) => (
          <span
            key={i}
            className="hd-anim absolute top-24 block w-px"
            style={{
              left: s.left,
              height: s.height,
              background:
                "linear-gradient(to bottom, rgba(28,28,46,0) 0%, rgba(28,28,46,0.35) 100%)",
              transform: "rotate(12deg)",
              animation: `hd-rain ${s.duration}s linear ${s.delay}s infinite`,
            }}
          />
        ))}

    </div>
  );
}
