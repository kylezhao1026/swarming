/**
 * Pet/plant care logic.
 * Stats decay over time. Actions restore stats and grant XP.
 * Growth stages unlock at XP thresholds.
 */

import { GrowthStage } from "@prisma/client";

export interface PetStats {
  hunger: number;
  happiness: number;
  health: number;
  experience: number;
  growthStage: GrowthStage;
  lastFed: Date;
  lastPlayed: Date;
}

const GROWTH_THRESHOLDS: Record<GrowthStage, number> = {
  SEED: 0,
  SPROUT: 50,
  GROWING: 150,
  BLOOMING: 350,
  FLOURISHING: 600,
};

const STAGE_ORDER: GrowthStage[] = [
  "SEED",
  "SPROUT",
  "GROWING",
  "BLOOMING",
  "FLOURISHING",
];

export function getStageEmoji(stage: GrowthStage): string {
  const emojis: Record<GrowthStage, string> = {
    SEED: "🌰",
    SPROUT: "🌱",
    GROWING: "🌿",
    BLOOMING: "🌸",
    FLOURISHING: "🌺",
  };
  return emojis[stage];
}

export function calculateDecay(stats: PetStats, now: Date): PetStats {
  const hoursSinceFed =
    (now.getTime() - new Date(stats.lastFed).getTime()) / (1000 * 60 * 60);
  const hoursSincePlayed =
    (now.getTime() - new Date(stats.lastPlayed).getTime()) / (1000 * 60 * 60);

  const hungerDecay = Math.min(Math.floor(hoursSinceFed * 2), stats.hunger);
  const happinessDecay = Math.min(
    Math.floor(hoursSincePlayed * 1.5),
    stats.happiness
  );

  const newHunger = Math.max(0, stats.hunger - hungerDecay);
  const newHappiness = Math.max(0, stats.happiness - happinessDecay);
  const newHealth = Math.round((newHunger + newHappiness) / 2);

  return {
    ...stats,
    hunger: newHunger,
    happiness: newHappiness,
    health: newHealth,
  };
}

function adaptiveGain(current: number, multiplier: number, minGain: number): number {
  const missing = 100 - current;
  return Math.max(minGain, Math.round(missing * multiplier));
}

export function applyAction(
  stats: PetStats,
  action: "feed" | "play" | "water",
  now: Date
): PetStats {
  let { hunger, happiness, health, experience } = stats;

  switch (action) {
    case "feed": {
      const gain = adaptiveGain(hunger, 0.22, 4);
      hunger = Math.min(100, hunger + gain);
      experience += 5;
      break;
    }
    case "play": {
      const gain = adaptiveGain(happiness, 0.24, 5);
      happiness = Math.min(100, happiness + gain);
      experience += 6;
      break;
    }
    case "water": {
      const hungerGain = adaptiveGain(hunger, 0.1, 2);
      const happinessGain = adaptiveGain(happiness, 0.1, 2);
      hunger = Math.min(100, hunger + hungerGain);
      happiness = Math.min(100, happiness + happinessGain);
      experience += 4;
      break;
    }
  }

  health = Math.round((hunger + happiness) / 2);
  const growthStage = calculateGrowthStage(experience);

  return {
    hunger,
    happiness,
    health,
    experience,
    growthStage,
    lastFed: action === "feed" || action === "water" ? now : stats.lastFed,
    lastPlayed: action === "play" ? now : stats.lastPlayed,
  };
}

export function calculateGrowthStage(experience: number): GrowthStage {
  let stage: GrowthStage = "SEED";
  for (const s of STAGE_ORDER) {
    if (experience >= GROWTH_THRESHOLDS[s]) {
      stage = s;
    }
  }
  return stage;
}

export function getNextStageXP(stage: GrowthStage): number | null {
  const idx = STAGE_ORDER.indexOf(stage);
  if (idx >= STAGE_ORDER.length - 1) return null;
  return GROWTH_THRESHOLDS[STAGE_ORDER[idx + 1]];
}
