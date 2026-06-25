import ShirtScore from "@/components/ShirtScore";
import VerdictBanner from "@/components/VerdictBanner";
import FunnyMessage from "@/components/FunnyMessage";
import ScoreExplainer from "@/components/ScoreExplainer";

interface Props {
  score: number;
  verdictLabel: string;
  verdictColor: string;
  verdictMessage: string;
}

/**
 * The left column as a little clothesline scene: two posts planted at the
 * edges, a rope strung between them, and the score pegged to the line on a
 * t-shirt like a piece of washing. The verdict + message + explainer hang
 * below it.
 *
 * Posts/rope/string are anchored in px from the top so the peg always meets the
 * rope regardless of panel height. Strokes use non-scaling-stroke to keep a
 * constant weight while the viewBox stretches to the panel width.
 */
export default function ScorePanel({ score, verdictLabel, verdictColor, verdictMessage }: Props) {
  const ink = "#1C1C2E";
  return (
    <div className="relative z-10 w-full">
      {/* posts */}
      <div className="absolute top-2 bottom-2 left-1 sm:left-3 w-[3px] rounded-full" style={{ backgroundColor: ink, opacity: 0.55 }} />
      <div className="absolute top-2 bottom-2 right-1 sm:right-3 w-[3px] rounded-full" style={{ backgroundColor: ink, opacity: 0.55 }} />
      {/* feet */}
      <div className="absolute bottom-2 left-0 sm:left-1 h-[3px] w-5 rounded-full" style={{ backgroundColor: ink, opacity: 0.4 }} />
      <div className="absolute bottom-2 right-0 sm:right-1 h-[3px] w-5 rounded-full" style={{ backgroundColor: ink, opacity: 0.4 }} />

      {/* rope tied between the posts, with a peg + string the score hangs from */}
      <svg
        className="absolute inset-x-0 top-[58px] w-full"
        height={66}
        viewBox="0 0 1000 66"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <path d="M 6 6 Q 500 26 994 6" fill="none" stroke={ink} strokeOpacity={0.4} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* the washing on the line: the score, then the verdict + message */}
      <div className="flex flex-col items-center gap-3 px-4 pt-[52px] pb-3">
        <ShirtScore score={score} />
        <VerdictBanner label={verdictLabel} color={verdictColor} />
        <FunnyMessage message={verdictMessage} />
        <ScoreExplainer />
      </div>
    </div>
  );
}
