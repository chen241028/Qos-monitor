import { Card } from "../types/game";

export function generateAnalysis(
  userCards: Card[],
  userPosition: number,
  opponentPosition: number
): {
  strengths: string[];
  limitations: string[];
  improvements: string[];
} {
  if (!userCards || userCards.length === 0) {
    return {
      strengths: [],
      limitations: ["Card data was missing, analysis could not be generated."],
      improvements: ["Please draw cards and try again."],
    };
  }

  const strengths: string[] = [];
  const limitations: string[] = [];
  const improvements: string[] = [];

  const avgStability =
    userCards.reduce((sum, c) => sum + c.stats.stability, 0) / userCards.length;
  const avgBurst =
    userCards.reduce((sum, c) => sum + c.stats.burst, 0) / userCards.length;
  const avgDelay =
    userCards.reduce((sum, c) => sum + c.stats.delay, 0) / userCards.length;
  const avgPredictability =
    userCards.reduce((sum, c) => sum + c.stats.predictability, 0) /
    userCards.length;

  // Strengths
  if (avgStability > 80) {
    strengths.push("Your network is highly stable and keeps a steady connection.");
  }
  if (avgBurst > 75) {
    strengths.push("Your network bursts fast and responds quickly.");
  }
  if (avgDelay < 20) {
    strengths.push("Latency is very low and responses are snappy.");
  }
  if (avgPredictability > 80) {
    strengths.push("Behavior is predictable with consistent performance.");
  }

  // Limitations
  if (avgStability < 60) {
    limitations.push("Stability is below average, with noticeable fluctuations.");
  }
  if (avgBurst < 50) {
    limitations.push("Burst capacity is limited during spikes.");
  }
  if (avgDelay > 50) {
    limitations.push("Latency is high and needs improvement.");
  }
  if (avgPredictability < 60) {
    limitations.push("Performance is hard to predict and needs steadier behavior.");
  }

  // Improvements
  if (userPosition < opponentPosition) {
    improvements.push("Consider higher-rarity cards to improve overall quality.");
    if (avgStability < 70) {
      improvements.push("Prioritize configurations with higher stability.");
    }
    if (avgDelay > 30) {
      improvements.push("Reduce latency by choosing a better route.");
    }
  } else {
    improvements.push("Keep the current setup and maintain your advantage.");
    if (avgBurst < 70) {
      improvements.push("Consider boosting burst performance.");
    }
  }

  return { strengths, limitations, improvements };
}
