import {
  calculateDecay,
  applyAction,
  calculateGrowthStage,
  getNextStageXP,
  getStageEmoji,
} from "@/lib/pet";
import type { PetStats } from "@/lib/pet";

function makePet(overrides: Partial<PetStats> = {}): PetStats {
  return {
    hunger: 80,
    happiness: 80,
    health: 80,
    experience: 0,
    growthStage: "SEED",
    lastFed: new Date("2024-01-15T12:00:00Z"),
    lastPlayed: new Date("2024-01-15T12:00:00Z"),
    ...overrides,
  };
}

describe("Pet Logic", () => {
  describe("calculateDecay", () => {
    it("does not decay if no time has passed", () => {
      const pet = makePet();
      const result = calculateDecay(pet, new Date("2024-01-15T12:00:00Z"));
      expect(result.hunger).toBe(80);
      expect(result.happiness).toBe(80);
    });

    it("decays hunger over time", () => {
      const pet = makePet();
      const result = calculateDecay(pet, new Date("2024-01-15T17:00:00Z"));
      expect(result.hunger).toBe(70);
    });

    it("decays happiness over time", () => {
      const pet = makePet();
      const result = calculateDecay(pet, new Date("2024-01-15T16:00:00Z"));
      expect(result.happiness).toBe(74);
    });

    it("does not go below 0", () => {
      const pet = makePet({ hunger: 5, happiness: 5 });
      const result = calculateDecay(pet, new Date("2024-01-16T12:00:00Z"));
      expect(result.hunger).toBeGreaterThanOrEqual(0);
      expect(result.happiness).toBeGreaterThanOrEqual(0);
    });
  });

  describe("applyAction", () => {
    it("feed increases hunger and XP with scaled gains", () => {
      const pet = makePet({ hunger: 50 });
      const now = new Date();
      const result = applyAction(pet, "feed", now);
      expect(result.hunger).toBe(61);
      expect(result.experience).toBe(5);
    });

    it("play increases happiness and XP with scaled gains", () => {
      const pet = makePet({ happiness: 50 });
      const now = new Date();
      const result = applyAction(pet, "play", now);
      expect(result.happiness).toBe(62);
      expect(result.experience).toBe(6);
    });

    it("water gives a smaller balanced boost", () => {
      const pet = makePet({ hunger: 50, happiness: 50, health: 50 });
      const now = new Date();
      const result = applyAction(pet, "water", now);
      expect(result.hunger).toBe(55);
      expect(result.happiness).toBe(55);
      expect(result.experience).toBe(4);
    });

    it("caps stats at 100", () => {
      const pet = makePet({ hunger: 98, happiness: 95 });
      const now = new Date();
      const fed = applyAction(pet, "feed", now);
      expect(fed.hunger).toBe(100);
    });

    it("updates lastFed on feed", () => {
      const pet = makePet();
      const now = new Date("2024-01-16T12:00:00Z");
      const result = applyAction(pet, "feed", now);
      expect(result.lastFed).toEqual(now);
    });

    it("updates lastPlayed on play", () => {
      const pet = makePet();
      const now = new Date("2024-01-16T12:00:00Z");
      const result = applyAction(pet, "play", now);
      expect(result.lastPlayed).toEqual(now);
    });
  });

  describe("calculateGrowthStage", () => {
    it("returns SEED for 0 XP", () => {
      expect(calculateGrowthStage(0)).toBe("SEED");
    });

    it("returns SPROUT at 50 XP", () => {
      expect(calculateGrowthStage(50)).toBe("SPROUT");
    });

    it("returns GROWING at 150 XP", () => {
      expect(calculateGrowthStage(150)).toBe("GROWING");
    });

    it("returns BLOOMING at 350 XP", () => {
      expect(calculateGrowthStage(350)).toBe("BLOOMING");
    });

    it("returns FLOURISHING at 600 XP", () => {
      expect(calculateGrowthStage(600)).toBe("FLOURISHING");
    });
  });

  describe("getNextStageXP", () => {
    it("returns 50 for SEED", () => {
      expect(getNextStageXP("SEED")).toBe(50);
    });

    it("returns null for FLOURISHING (max stage)", () => {
      expect(getNextStageXP("FLOURISHING")).toBeNull();
    });
  });

  describe("getStageEmoji", () => {
    it("returns correct emoji for each stage", () => {
      expect(getStageEmoji("SEED")).toBe("🌰");
      expect(getStageEmoji("SPROUT")).toBe("🌱");
      expect(getStageEmoji("GROWING")).toBe("🌿");
      expect(getStageEmoji("BLOOMING")).toBe("🌸");
      expect(getStageEmoji("FLOURISHING")).toBe("🌺");
    });
  });
});
