import type { Card } from "../types/game";

export type RhythmSegment = {
  index: number;
  startMs: number;
  endMs: number;
  smoothness: number;
};

export type TelemetrySummary = {
  nowText: string;
  trendText: string;
};

export type TelemetryEvent = {
  timeMs: number;
  type: string;
  message: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

export function buildGlobalBaseline(
  duration: number,
  segments: number,
  seed: number
): RhythmSegment[] {
  const rng = createRng(seed || 1);
  const slice = duration / segments;
  return Array.from({ length: segments }, (_, index) => {
    const jitter = (rng() - 0.5) * 0.08;
    return {
      index,
      startMs: Math.round(index * slice),
      endMs: Math.round((index + 1) * slice),
      smoothness: clamp(0.86 + jitter, 0.7, 0.98),
    };
  });
}

function eventImpact(type: string): number {
  switch (type) {
    case "jitter":
      return -0.2;
    case "stall":
      return -0.32;
    case "drop":
      return -0.4;
    case "surge":
      return 0.18;
    default:
      return 0;
  }
}

export function buildYourRhythm(
  duration: number,
  segments: number,
  events: TelemetryEvent[]
): RhythmSegment[] {
  const slice = duration / segments;
  const base = 0.74;
  const buckets = Array.from({ length: segments }, (_, index) => ({
    index,
    startMs: Math.round(index * slice),
    endMs: Math.round((index + 1) * slice),
    smoothness: base,
  }));

  for (const event of events) {
    const idx = clamp(Math.floor(event.timeMs / slice), 0, segments - 1);
    const impact = eventImpact(event.type);
    buckets[idx].smoothness = clamp(buckets[idx].smoothness + impact, 0.1, 0.98);
    const neighbor = idx + 1 < segments ? idx + 1 : idx;
    if (neighbor !== idx) {
      buckets[neighbor].smoothness = clamp(
        buckets[neighbor].smoothness + impact * 0.4,
        0.1,
        0.98
      );
    }
  }

  return buckets;
}

function buildCardNarrative(cards: Card[]): string {
  if (cards.length === 0) return "";
  const avgStability = cards.reduce((sum, c) => sum + c.stats.stability, 0) / cards.length;
  const avgPredictability =
    cards.reduce((sum, c) => sum + c.stats.predictability, 0) / cards.length;
  const avgDelay = cards.reduce((sum, c) => sum + c.stats.delay, 0) / cards.length;
  const avgBurst = cards.reduce((sum, c) => sum + c.stats.burst, 0) / cards.length;

  const lines: string[] = [];
  if (avgStability >= 80) {
    lines.push("Steady cards dampen hiccups.");
  }
  if (avgPredictability >= 80) {
    lines.push("Predictable cards keep rhythm calmer.");
  }
  if (avgDelay <= 25) {
    lines.push("Fast-response cards shorten pauses.");
  }
  if (avgBurst >= 80) {
    lines.push("Burst cards unlock brief surges.");
  }

  return lines.slice(0, 2).join(" ");
}

export function summarizeTelemetry(
  events: TelemetryEvent[],
  elapsedMs: number,
  cards: Card[]
): TelemetrySummary {
  const recent = events.filter((event) => elapsedMs - event.timeMs <= 5000);
  const last = recent[recent.length - 1];

  let nowText = "Running steady.";
  if (last) {
    if (last.type === "surge") nowText = "A short boost just kicked in.";
    if (last.type === "jitter") nowText = "Rhythm wobble is visible right now.";
    if (last.type === "stall") nowText = "Response feels delayed at the moment.";
    if (last.type === "drop") nowText = "A brief dip slowed the pace.";
  }

  const hiccups = recent.filter((event) => event.type !== "surge").length;
  const trendText =
    hiccups >= 2
      ? "Recent moments show uneven pacing and small hiccups."
      : "Overall pace stays readable and consistent.";

  const cardHint = buildCardNarrative(cards);
  const combinedTrend = cardHint ? `${trendText} ${cardHint}` : trendText;

  return { nowText, trendText: combinedTrend };
}
