import { Card } from "../types/game";

export const CARD_POOL: Card[] = [
  // Bandwidth cards
  {
    id: "bw-ssr-1",
    category: "bandwidth",
    rarity: "SSR",
    name: "Fiber High-Speed Channel",
    description: "A rock-solid ultra-fast link.",
    flavorText: "Like a city express lane, always flowing and never stalling.",
    stats: { stability: 95, burst: 85, delay: 5, predictability: 90 },
  },
  {
    id: "bw-sr-1",
    category: "bandwidth",
    rarity: "SR",
    name: "Stable Broadband",
    description: "Reliable everyday speed.",
    flavorText: "Like a quiet country road: not the fastest, but it gets you there.",
    stats: { stability: 75, burst: 60, delay: 15, predictability: 80 },
  },
  {
    id: "bw-r-1",
    category: "bandwidth",
    rarity: "R",
    name: "Shared Network",
    description: "Sometimes fast, sometimes slow.",
    flavorText: "Like rush-hour metro: smooth when empty, crowded when full.",
    stats: { stability: 50, burst: 40, delay: 30, predictability: 50 },
  },

  // Latency cards
  {
    id: "lat-ssr-1",
    category: "latency",
    rarity: "SSR",
    name: "Zero-Latency Feel",
    description: "Near-instant response.",
    flavorText: "Like talking face to face, the reply lands immediately.",
    stats: { stability: 90, burst: 80, delay: 2, predictability: 95 },
  },
  {
    id: "lat-sr-1",
    category: "latency",
    rarity: "SR",
    name: "Low-Latency Link",
    description: "Quick responses with light delay.",
    flavorText: "Like a phone call: slight delay but easy to follow.",
    stats: { stability: 70, burst: 65, delay: 25, predictability: 75 },
  },
  {
    id: "lat-r-1",
    category: "latency",
    rarity: "R",
    name: "Latency Swings",
    description: "Response time is unstable.",
    flavorText: "Like shouting across a canyon: sometimes clear, sometimes late.",
    stats: { stability: 45, burst: 35, delay: 80, predictability: 45 },
  },

  // Jitter cards
  {
    id: "jit-ssr-1",
    category: "jitter",
    rarity: "SSR",
    name: "Perfect Timing",
    description: "Consistent rhythm throughout.",
    flavorText: "Like a metronome, every beat hits on time.",
    stats: { stability: 98, burst: 75, delay: 3, predictability: 98 },
  },
  {
    id: "jit-sr-1",
    category: "jitter",
    rarity: "SR",
    name: "Light Fluctuation",
    description: "Minor rhythm shifts.",
    flavorText: "Like a steady walk with a few uneven steps.",
    stats: { stability: 70, burst: 60, delay: 20, predictability: 70 },
  },
  {
    id: "jit-r-1",
    category: "jitter",
    rarity: "R",
    name: "Chaotic Tempo",
    description: "Speed changes are sharp.",
    flavorText: "Like an untrained drummer: fast, slow, and unpredictable.",
    stats: { stability: 40, burst: 50, delay: 50, predictability: 40 },
  },

  // Packet Loss cards
  {
    id: "pl-ssr-1",
    category: "packet-loss",
    rarity: "SSR",
    name: "Perfect Delivery",
    description: "Zero packet loss.",
    flavorText: "Like flawless courier service: every parcel arrives intact.",
    stats: { stability: 99, burst: 90, delay: 2, predictability: 99 },
  },
  {
    id: "pl-sr-1",
    category: "packet-loss",
    rarity: "SR",
    name: "Occasional Drop",
    description: "Most data arrives safely.",
    flavorText: "Like postal service: a rare miss, but most items arrive.",
    stats: { stability: 65, burst: 55, delay: 25, predictability: 65 },
  },
  {
    id: "pl-r-1",
    category: "packet-loss",
    rarity: "R",
    name: "Frequent Loss",
    description: "Requires constant retries.",
    flavorText: "Like a cracked pipe: water keeps leaking away.",
    stats: { stability: 35, burst: 30, delay: 60, predictability: 35 },
  },

  // Special Event cards
  {
    id: "spec-ssr-1",
    category: "special",
    rarity: "SSR",
    name: "Network Optimization",
    description: "Temporary performance boost.",
    flavorText: "Like opening a green lane: everything flows smoothly.",
    stats: { stability: 85, burst: 95, delay: 5, predictability: 85 },
  },
  {
    id: "spec-sr-1",
    category: "special",
    rarity: "SR",
    name: "Traffic Surge",
    description: "Network congestion event.",
    flavorText: "Like holiday highways: crowded lanes and slower speed.",
    stats: { stability: 40, burst: 45, delay: 100, predictability: 50 },
  },
  {
    id: "spec-r-1",
    category: "special",
    rarity: "R",
    name: "Random Fluctuation",
    description: "Unpredictable changes.",
    flavorText: "Like the weather: sun, rain, and sudden storms.",
    stats: { stability: 50, burst: 60, delay: 40, predictability: 30 },
  },
];

export function drawCards(count: number = 3): Card[] {
  const shuffled = [...CARD_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
