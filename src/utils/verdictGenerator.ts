export interface Verdict {
  label: string;
  color: string;
  message: string;
}

interface Tier {
  min: number;
  max: number;
  label: string;
  color: string;
  messages: string[];
}

const TIERS: Tier[] = [
  {
    min: 80,
    max: 100,
    label: "PERFECT DAY",
    color: "#22c55e",
    messages: [
      "Even your ex's hoodie deserves a wash today.",
      "The sun is personally asking to help with laundry.",
      "Sheets, towels, that mystery pile in the corner — all of it.",
      "If you don't do laundry today, the weather gods will be offended.",
    ],
  },
  {
    min: 60,
    max: 79,
    label: "GREAT DAY",
    color: "#84cc16",
    messages: [
      "Go forth and spin cycle.",
      "Your clothes have been waiting for this moment.",
      "A genuinely solid laundry day. Do not waste it.",
      "Dryers are optional. The sky has got you covered.",
    ],
  },
  {
    min: 40,
    max: 59,
    label: "DECENT",
    color: "#D4A017",
    messages: [
      "Probably fine. Probably.",
      "Not ideal, not terrible. The beige of laundry days.",
      "You could do it. No one is stopping you.",
      "Mediocre conditions for mediocre laundry. The circle of life.",
    ],
  },
  {
    min: 20,
    max: 39,
    label: "SKETCHY",
    color: "#f97316",
    messages: [
      "Bold move. We respect it but won't endorse it.",
      "Your clothes will dry. Eventually. Probably.",
      "The weather is giving you the side-eye right now.",
      "Do it if you're brave. Or desperate. Or both.",
    ],
  },
  {
    min: 10,
    max: 19,
    label: "BAD IDEA",
    color: "#ef4444",
    messages: [
      "Your clothes will be sadder than before.",
      "Nature is sending you a strongly worded letter.",
      "The humidity alone should be considered a hate crime against fabric.",
      "Not today. Not even close.",
    ],
  },
  {
    min: 0,
    max: 9,
    label: "ABSOLUTE NO",
    color: "#991b1b",
    messages: [
      "Nature itself is asking you not to do laundry today.",
      "Your clothes prefer to stay dirty. Trust them.",
      "This is a level-5 laundry emergency. Stand down.",
      "The weather has filed a restraining order against your washing machine.",
    ],
  },
];

export function getVerdict(score: number): Verdict {
  const tier =
    TIERS.find((t) => score >= t.min && score <= t.max) ?? TIERS[TIERS.length - 1];
  const message = tier.messages[score % tier.messages.length];
  return { label: tier.label, color: tier.color, message };
}
