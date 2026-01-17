import {
  RaceState,
  RaceParticipant,
  Card,
  RaceEvent,
  ActiveEffect,
  RaceEventType,
} from "../types/game";

const MAX_EVENTS = 30;
const LEAD_CAP = 1.04;
const LAG_CAP = 0.78;

type CardEffects = {
  rateMul: Record<RaceEventType, number>;
  strengthMul: Record<RaceEventType, number>;
  durationMul: Record<RaceEventType, number>;
  cooldownMs: Record<RaceEventType, number>;
  speedBias: number;
  jitterOffsetMul: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function nextRand(state: number): { value: number; state: number } {
  const next = (state * 1664525 + 1013904223) >>> 0;
  return { value: next / 2 ** 32, state: next };
}

function randomRange(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng();
}

function averageStat(cards: Card[], key: keyof Card["stats"]): number {
  if (!cards.length) return 0;
  return cards.reduce((sum, c) => sum + c.stats[key], 0) / cards.length;
}

function countCategory(cards: Card[], category: Card["category"]): number {
  return cards.filter((c) => c.category === category).length;
}

function hasRarity(cards: Card[], category: Card["category"], rarity: Card["rarity"]): boolean {
  return cards.some((card) => card.category === category && card.rarity === rarity);
}

function buildCardEffects(cards: Card[]): CardEffects {
  const avgStability = averageStat(cards, "stability") / 100;
  const avgPredictability = averageStat(cards, "predictability") / 100;
  const avgDelay = averageStat(cards, "delay");
  const avgBurst = averageStat(cards, "burst") / 100;

  const delayQuality = clamp(1 - avgDelay / 120, 0, 1);
  const quality = clamp((avgStability + avgPredictability + delayQuality) / 3, 0, 1);

  const bandwidthCount = countCategory(cards, "bandwidth");
  const jitterCount = countCategory(cards, "jitter");
  const lossCount = countCategory(cards, "packet-loss");
  const specialCount = countCategory(cards, "special");

  let jitterRateMul = clamp(1 - avgPredictability * 0.7, 0.35, 1.4);
  let stallRateMul = clamp(1 - delayQuality * 0.7, 0.4, 1.5);
  let dropRateMul = clamp(1 - avgStability * 0.8, 0.3, 1.5);
  let surgeRateMul = clamp(0.7 + avgBurst * 0.8, 0.5, 1.6);

  if (jitterCount > 0) {
    jitterRateMul *= avgPredictability >= 0.6 ? 1 - jitterCount * 0.1 : 1 + jitterCount * 0.08;
  }
  if (lossCount > 0) {
    dropRateMul *= avgStability >= 0.6 ? 1 - lossCount * 0.08 : 1 + lossCount * 0.1;
  }

  jitterRateMul *= 1 - bandwidthCount * 0.06;
  dropRateMul *= 1 - bandwidthCount * 0.06;
  surgeRateMul *= 1 + bandwidthCount * 0.08;
  surgeRateMul *= 1 + specialCount * 0.12;

  let jitterStrengthMul = clamp(1 - avgPredictability * 0.6, 0.4, 1.3);
  let stallStrengthMul = clamp(1 - delayQuality * 0.6, 0.5, 1.4);
  let dropStrengthMul = clamp(1 - avgStability * 0.7, 0.4, 1.4);
  let surgeStrengthMul = clamp(0.8 + avgBurst * 0.6, 0.7, 1.5);

  let jitterDurationMul = clamp(1 - avgPredictability * 0.4, 0.5, 1.3);
  let stallDurationMul = clamp(1 - delayQuality * 0.4, 0.6, 1.4);
  let dropDurationMul = clamp(1 - avgStability * 0.5, 0.5, 1.3);
  let surgeDurationMul = clamp(0.9 + avgBurst * 0.3, 0.8, 1.3);

  if (hasRarity(cards, "packet-loss", "SSR")) {
    dropRateMul *= 0.35;
    dropStrengthMul *= 0.6;
    dropDurationMul *= 0.75;
  }
  if (hasRarity(cards, "jitter", "SSR")) {
    jitterRateMul *= 0.5;
    jitterStrengthMul *= 0.7;
    jitterDurationMul *= 0.8;
  }
  if (hasRarity(cards, "bandwidth", "SSR")) {
    jitterRateMul *= 0.85;
    dropRateMul *= 0.85;
  }

  const cooldownBase = {
    jitter: 900,
    stall: 1800,
    drop: 2200,
    surge: 1200,
  };

  const cooldownMs = {
    jitter: Math.round(cooldownBase.jitter + quality * 700),
    stall: Math.round(cooldownBase.stall + quality * 900),
    drop: Math.round(cooldownBase.drop + quality * 1100),
    surge: Math.round(cooldownBase.surge + (1 - quality) * 600),
  } as Record<RaceEventType, number>;

  const speedBias = clamp(0.92 + quality * 0.16 + bandwidthCount * 0.02 + avgBurst * 0.06, 0.9, 1.15);
  const jitterOffsetMul = clamp(1 - avgPredictability * 0.6, 0.3, 1);

  return {
    rateMul: {
      jitter: clamp(jitterRateMul, 0.2, 1.6),
      stall: clamp(stallRateMul, 0.25, 1.8),
      drop: clamp(dropRateMul, 0.2, 1.8),
      surge: clamp(surgeRateMul, 0.4, 2),
    },
    strengthMul: {
      jitter: clamp(jitterStrengthMul, 0.4, 1.4),
      stall: clamp(stallStrengthMul, 0.5, 1.5),
      drop: clamp(dropStrengthMul, 0.4, 1.5),
      surge: clamp(surgeStrengthMul, 0.6, 1.6),
    },
    durationMul: {
      jitter: clamp(jitterDurationMul, 0.5, 1.4),
      stall: clamp(stallDurationMul, 0.6, 1.5),
      drop: clamp(dropDurationMul, 0.5, 1.4),
      surge: clamp(surgeDurationMul, 0.6, 1.4),
    },
    cooldownMs,
    speedBias,
    jitterOffsetMul,
  };
}

export function calculateSpeed(cards: Card[]): number {
  if (cards.length === 0) return 0.3;

  const avgStability = averageStat(cards, "stability");
  const avgBurst = averageStat(cards, "burst");
  const avgDelay = averageStat(cards, "delay");
  const avgPredictability = averageStat(cards, "predictability");

  const baseSpeed = (avgStability * 0.4 + avgBurst * 0.3 + avgPredictability * 0.3) / 100;
  const delayPenalty = Math.max(0, 1 - avgDelay / 200);

  return Math.max(0.1, Math.min(1.0, baseSpeed * delayPenalty));
}

export function generateCommentary(
  participant: RaceParticipant,
  opponent: RaceParticipant,
  elapsedTime: number
): string[] {
  const comments: string[] = [];
  const posDiff = participant.position - opponent.position;

  if (elapsedTime < 2000) {
    comments.push("The race begins! Both networks are accelerating...");
  } else if (elapsedTime < 5000) {
    if (posDiff > 5) {
      comments.push(`${participant.name} is performing well and keeping the lead!`);
    } else if (posDiff < -5) {
      comments.push(`${participant.name} is falling behind and needs a boost!`);
    } else {
      comments.push("Both sides are neck and neck. The competition is intense!");
    }
  } else if (elapsedTime < 8000) {
    if (posDiff > 10) {
      comments.push(`${participant.name} has a clear advantage and a stable connection.`);
    } else if (posDiff < -10) {
      comments.push(`${participant.name} is struggling with network stability...`);
    } else {
      comments.push("The race is entering its heated phase!");
    }
  } else {
    if (posDiff > 5) {
      comments.push(`${participant.name} is about to win!`);
    } else if (posDiff < -5) {
      comments.push(`${participant.name} can still catch up!`);
    } else {
      comments.push("Final sprint! The outcome is still uncertain.");
    }
  }

  return comments;
}

function pushEvent(events: RaceEvent[], event: RaceEvent): RaceEvent[] {
  const next = [...events, event];
  return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
}

function createEvent(
  rng: () => number,
  participantId: string,
  participantName: string,
  type: RaceEventType,
  timeMs: number,
  modifiers: CardEffects
): { event: RaceEvent; effect: ActiveEffect } {
  if (type === "jitter") {
    const durationMs = Math.round(randomRange(rng, 550, 1100) * modifiers.durationMul.jitter);
    const strength = clamp(randomRange(rng, 0.4, 0.75) * modifiers.strengthMul.jitter, 0.2, 1);
    return {
      event: {
        id: `${participantId}-jitter-${timeMs}`,
        timeMs,
        participantId,
        type,
        message: `${participantName}: rhythm jitters (shake ${durationMs}ms)`,
        durationMs,
      },
      effect: { type, remainingMs: durationMs, strength },
    };
  }

  if (type === "stall") {
    const durationMs = Math.round(randomRange(rng, 450, 900) * modifiers.durationMul.stall);
    const strength = clamp(randomRange(rng, 0.25, 0.5) * modifiers.strengthMul.stall, 0.15, 0.9);
    return {
      event: {
        id: `${participantId}-stall-${timeMs}`,
        timeMs,
        participantId,
        type,
        message: `${participantName}: delayed response (pause ${durationMs}ms)`,
        durationMs,
      },
      effect: { type, remainingMs: durationMs, strength },
    };
  }

  if (type === "drop") {
    const durationMs = Math.round(randomRange(rng, 420, 850) * modifiers.durationMul.drop);
    const strength = clamp(randomRange(rng, 0.18, 0.4) * modifiers.strengthMul.drop, 0.1, 0.8);
    return {
      event: {
        id: `${participantId}-drop-${timeMs}`,
        timeMs,
        participantId,
        type,
        message: `${participantName}: packet detour (slow ${durationMs}ms)`,
        durationMs,
      },
      effect: { type, remainingMs: durationMs, strength },
    };
  }

  const durationMs = Math.round(randomRange(rng, 500, 900) * modifiers.durationMul.surge);
  const strength = clamp(randomRange(rng, 0.12, 0.22) * modifiers.strengthMul.surge, 0.1, 0.6);
  return {
    event: {
      id: `${participantId}-surge-${timeMs}`,
      timeMs,
      participantId,
      type: "surge",
      message: `${participantName}: sudden boost (surge ${durationMs}ms)`,
      durationMs,
    },
    effect: { type: "surge", remainingMs: durationMs, strength },
  };
}

function shouldTrigger(ratePerSecond: number, deltaTime: number, rng: () => number): boolean {
  const clampedRate = Math.max(0, Math.min(0.6, ratePerSecond));
  const chance = 1 - Math.pow(1 - clampedRate, deltaTime / 1000);
  return rng() < chance;
}

function lastEventTimeByType(
  events: RaceEvent[],
  participantId: string,
  type: RaceEventType
): number {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const event = events[i];
    if (event.participantId === participantId && event.type === type) {
      return event.timeMs;
    }
  }
  return 0;
}

export function simulateRaceStep(raceState: RaceState, deltaTime: number): RaceState {
  const newState = { ...raceState };
  newState.elapsedTime = Math.min(newState.elapsedTime + deltaTime, newState.duration);

  const duration = Math.max(1, newState.duration);
  const targetProgress = Math.min(1, newState.elapsedTime / duration) * 100;
  const baseDelta = (deltaTime / duration) * 100;
  const rateScale = Math.max(0.35, Math.min(1, 12000 / duration));
  const minEventGapMs = Math.max(900, Math.min(1800, duration / 18));

  const rng = () => {
    const { value, state } = nextRand(newState.rngState);
    newState.rngState = state;
    return value;
  };

  const updatedEffects: Record<string, ActiveEffect[]> = { ...newState.effects };
  for (const key of Object.keys(updatedEffects)) {
    updatedEffects[key] = updatedEffects[key]
      .map((effect) => ({ ...effect, remainingMs: effect.remainingMs - deltaTime }))
      .filter((effect) => effect.remainingMs > 0);
  }

  const updatedParticipants = newState.participants.map((p) => {
    const cards = p.cards ?? [];
    const avgBurst = averageStat(cards, "burst");
    const avgDelay = averageStat(cards, "delay");
    const avgPredictability = averageStat(cards, "predictability");
    //const avgStability = averageStat(cards, "stability");

    const bandwidthCount = countCategory(cards, "bandwidth");

    const baseSpeed = calculateSpeed(cards);
    const bandwidthBoost = bandwidthCount * 0.03;
    const burstBoost = (avgBurst - 50) / 300;
    const delayPenalty = 1 - Math.min(0.25, avgDelay / 250);

    const modifiers = buildCardEffects(cards);
    const predictabilityVariance = (1 - avgPredictability / 100) * 0.18 * modifiers.jitterOffsetMul;
    const speedVariation = (rng() - 0.5) * predictabilityVariance;

    let speedFactor = Math.max(0.82, Math.min(1.2, 0.9 + baseSpeed * 0.2 + burstBoost + bandwidthBoost));
    speedFactor *= delayPenalty;
    speedFactor += speedVariation;
    speedFactor *= modifiers.speedBias;

    let jitterOffset = 0;
    let speedMultiplier = 1;

    const effects = updatedEffects[p.id] ?? [];
    for (const effect of effects) {
      if (effect.type === "jitter") {
        speedMultiplier *= 0.9 + effect.strength * 0.1;
        jitterOffset += (rng() - 0.5) * (1.4 * effect.strength);
      } else if (effect.type === "stall") {
        speedMultiplier *= effect.strength;
      } else if (effect.type === "drop") {
        speedMultiplier *= effect.strength;
        jitterOffset -= effect.strength * 0.8;
      } else if (effect.type === "surge") {
        speedMultiplier *= 1 + effect.strength;
      }
    }

    const startDelay = p.startDelayMs ?? 0;
    const isDelayedStart = newState.elapsedTime < startDelay;
    const moveMultiplier = isDelayedStart ? 0 : speedFactor * speedMultiplier;

    const deltaPosition = baseDelta * moveMultiplier + jitterOffset;
    let newPosition = p.position + deltaPosition;

    const maxLead = Math.min(100, targetProgress * LEAD_CAP);
    const minTrail = Math.max(0, isDelayedStart ? 0 : targetProgress * LAG_CAP);
    newPosition = Math.min(maxLead, Math.max(minTrail, newPosition));

    return {
      ...p,
      position: Math.max(0, Math.min(100, newPosition)),
      speed: Math.max(0.1, Math.min(1, speedFactor)),
    };
  });

  newState.participants = updatedParticipants;

  let nextEvents = [...newState.events];
  const nextEffects = { ...updatedEffects };

  for (const participant of updatedParticipants) {
    const cards = participant.cards ?? [];
    const avgDelay = averageStat(cards, "delay");
    const avgPredictability = averageStat(cards, "predictability");
    const avgStability = averageStat(cards, "stability");

    const modifiers = buildCardEffects(cards);
    const activeTypes = new Set((nextEffects[participant.id] ?? []).map((e) => e.type));

    const lastAny = [...nextEvents]
      .reverse()
      .find((event) => event.participantId === participant.id)?.timeMs ?? 0;

    if (newState.elapsedTime - lastAny < minEventGapMs) {
      continue;
    }

    const jitterRate = (0.06 + (100 - avgPredictability) / 500) * rateScale * modifiers.rateMul.jitter;
    const stallRate = (0.035 + avgDelay / 700) * rateScale * modifiers.rateMul.stall;
    const dropRate = (0.03 + Math.max(0, (60 - avgStability) / 400)) * rateScale * modifiers.rateMul.drop;
    const surgeRate = (0.05 + modifiers.rateMul.surge * 0.02) * rateScale;

    const now = newState.elapsedTime;

    if (
      !activeTypes.has("jitter") &&
      now - lastEventTimeByType(nextEvents, participant.id, "jitter") >= modifiers.cooldownMs.jitter &&
      shouldTrigger(jitterRate, deltaTime, rng)
    ) {
      const { event, effect } = createEvent(rng, participant.id, participant.name, "jitter", now, modifiers);
      nextEffects[participant.id] = [...(nextEffects[participant.id] ?? []), effect];
      nextEvents = pushEvent(nextEvents, event);
      continue;
    }

    if (
      !activeTypes.has("stall") &&
      now - lastEventTimeByType(nextEvents, participant.id, "stall") >= modifiers.cooldownMs.stall &&
      shouldTrigger(stallRate, deltaTime, rng)
    ) {
      const { event, effect } = createEvent(rng, participant.id, participant.name, "stall", now, modifiers);
      nextEffects[participant.id] = [...(nextEffects[participant.id] ?? []), effect];
      nextEvents = pushEvent(nextEvents, event);
      continue;
    }

    if (
      !activeTypes.has("drop") &&
      now - lastEventTimeByType(nextEvents, participant.id, "drop") >= modifiers.cooldownMs.drop &&
      shouldTrigger(dropRate, deltaTime, rng)
    ) {
      const { event, effect } = createEvent(rng, participant.id, participant.name, "drop", now, modifiers);
      nextEffects[participant.id] = [...(nextEffects[participant.id] ?? []), effect];
      nextEvents = pushEvent(nextEvents, event);
      continue;
    }

    if (
      !activeTypes.has("surge") &&
      now - lastEventTimeByType(nextEvents, participant.id, "surge") >= modifiers.cooldownMs.surge &&
      shouldTrigger(surgeRate, deltaTime, rng)
    ) {
      const { event, effect } = createEvent(rng, participant.id, participant.name, "surge", now, modifiers);
      nextEffects[participant.id] = [...(nextEffects[participant.id] ?? []), effect];
      nextEvents = pushEvent(nextEvents, event);
    }
  }

  newState.effects = nextEffects;
  newState.events = nextEvents;

  const user = newState.participants.find((p) => p.id === "user")!;
  const opponent = newState.participants.find((p) => p.id === "opponent")!;
  const newComments = generateCommentary(user, opponent, newState.elapsedTime);

  if (newComments.length > 0 && newState.commentary.length === 0) {
    newState.commentary = newComments;
  } else if (newComments.length > 0 && rng() > 0.7) {
    newState.commentary = [...newState.commentary.slice(-2), ...newComments];
  }

  return newState;
}
