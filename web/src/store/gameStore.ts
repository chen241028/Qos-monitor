import { create } from "zustand";
import { GameState, RaceState, Card } from "../types/game";
import { drawCards } from "../data/cards";

interface GameStore extends GameState {
  startGame: () => void;
  drawUserCards: () => void;
  startRace: () => void;
  updateRace: (state: Partial<RaceState>) => void;
  endRace: (result: GameState["result"]) => void;
  reset: () => void;
}

const initialState: GameState = {
  phase: "start",
  userCards: [],
  raceState: null,
  result: null,
};

function hashCards(cards: Card[], runId: number): number {
  let hash = 2166136261;
  for (const card of cards) {
    const text = `${card.id}-${card.category}-${card.rarity}`;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
  }
  return (hash ^ runId) >>> 0;
}

function getStartDelayMs(cards: Card[]): number {
  if (!cards.length) return 0;
  const avgDelay = cards.reduce((sum, c) => sum + c.stats.delay, 0) / cards.length;
  return Math.min(1200, Math.max(0, Math.round(avgDelay * 8)));
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: () => {
    const cards = drawCards(3);
    set({ phase: "card-draw", userCards: cards, raceState: null, result: null });
  },

  drawUserCards: () => {
    const cards = drawCards(3);
    set({ userCards: cards });
  },

  startRace: () => {
    const { userCards } = get();

    // Create opponent with random cards
    const opponentCards = drawCards(3);
    const runId = Date.now();
    const seed = hashCards([...userCards, ...opponentCards], runId);

    const raceState: RaceState = {
      elapsedTime: 0,
      duration: 30000, // 30 seconds
      participants: [
        {
          id: "user",
          name: "Your Network",
          position: 0,
          speed: 0.5,
          cards: userCards,
          startDelayMs: getStartDelayMs(userCards),
        },
        {
          id: "opponent",
          name: "Opponent Network",
          position: 0,
          speed: 0.5,
          cards: opponentCards,
          startDelayMs: getStartDelayMs(opponentCards),
        },
      ],
      commentary: [],
      events: [],
      effects: {
        user: [],
        opponent: [],
      },
      rngState: seed,
      runId,
    };

    set({ phase: "race", raceState });
  },

  updateRace: (updates) => {
    const { raceState } = get();
    if (!raceState) return;
    set({ raceState: { ...raceState, ...updates } });
  },

  endRace: (result) => {
    set({ phase: "result", result });
  },

  reset: () => {
    set(initialState);
  },
}));
