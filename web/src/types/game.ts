export type CardCategory = "bandwidth" | "latency" | "jitter" | "packet-loss" | "special";
export type CardRarity = "SSR" | "SR" | "R";
export type GamePhase = "start" | "card-draw" | "race" | "result" | "analysis";

export interface Card {
  id: string;
  category: CardCategory;
  rarity: CardRarity;
  name: string;
  description: string;
  flavorText: string;
  stats: {
    stability: number; // 0-100
    burst: number; // 0-100
    delay: number; // milliseconds
    predictability: number; // 0-100
  };
}

export interface RaceParticipant {
  id: string;
  name: string;
  position: number; // 0-100 (percentage of track)
  speed: number; // 0-1 (current speed multiplier)
  cards: Card[];
  startDelayMs?: number;
}

export type RaceEventType = "jitter" | "stall" | "drop" | "surge";

export interface RaceEvent {
  id: string;
  timeMs: number;
  participantId: string;
  type: RaceEventType;
  message: string;
  durationMs?: number;
}

export interface ActiveEffect {
  type: RaceEventType;
  remainingMs: number;
  strength: number;
}

export interface RaceState {
  elapsedTime: number;
  duration: number; // 10 seconds
  participants: RaceParticipant[];
  commentary: string[];
  events: RaceEvent[];
  effects: Record<string, ActiveEffect[]>;
  rngState: number;
  runId: number;
  currentEvent?: {
    type: string;
    participant: string;
    message: string;
  };
}

export interface GameState {
  phase: GamePhase;
  userCards: Card[];
  raceState: RaceState | null;
  result: {
    winner: string;
    userPosition: number;
    difference: number;
    analysis: {
      strengths: string[];
      limitations: string[];
      improvements: string[];
    };
  } | null;
}
