import {
  createMemoryBoard,
  checkMatch,
  calculateMemoryScore,
  calculateTriviaScore,
} from "@/lib/games";

describe("Memory Match", () => {
  describe("createMemoryBoard", () => {
    it("creates correct number of cards (pairs * 2)", () => {
      const board = createMemoryBoard(6);
      expect(board).toHaveLength(12);
    });

    it("creates correct number of pairs", () => {
      const board = createMemoryBoard(4);
      expect(board).toHaveLength(8);

      const emojis = board.map((c) => c.emoji);
      const unique = new Set(emojis);
      expect(unique.size).toBe(4);

      // Each emoji appears exactly twice
      unique.forEach((emoji) => {
        const count = emojis.filter((e) => e === emoji).length;
        expect(count).toBe(2);
      });
    });

    it("initializes all cards as not flipped and not matched", () => {
      const board = createMemoryBoard(6);
      board.forEach((card) => {
        expect(card.isFlipped).toBe(false);
        expect(card.isMatched).toBe(false);
      });
    });

    it("assigns unique IDs to each card", () => {
      const board = createMemoryBoard(6);
      const ids = board.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(12);
    });
  });

  describe("checkMatch", () => {
    it("returns true for matching emojis with different IDs", () => {
      const card1 = { id: 0, emoji: "💕", isFlipped: true, isMatched: false };
      const card2 = { id: 1, emoji: "💕", isFlipped: true, isMatched: false };
      expect(checkMatch(card1, card2)).toBe(true);
    });

    it("returns false for different emojis", () => {
      const card1 = { id: 0, emoji: "💕", isFlipped: true, isMatched: false };
      const card2 = { id: 1, emoji: "💖", isFlipped: true, isMatched: false };
      expect(checkMatch(card1, card2)).toBe(false);
    });

    it("returns false for same card (same ID)", () => {
      const card = { id: 0, emoji: "💕", isFlipped: true, isMatched: false };
      expect(checkMatch(card, card)).toBe(false);
    });
  });

  describe("calculateMemoryScore", () => {
    it("returns 0 for 0 moves", () => {
      expect(calculateMemoryScore(0, 0, 6)).toBe(0);
    });

    it("gives higher score for fewer moves", () => {
      const efficientScore = calculateMemoryScore(6, 6, 6);
      const lessEfficientScore = calculateMemoryScore(6, 20, 6);
      expect(efficientScore).toBeGreaterThan(lessEfficientScore);
    });

    it("scores based on matches * 100 plus efficiency bonus", () => {
      const score = calculateMemoryScore(3, 10, 6);
      expect(score).toBeGreaterThan(300); // at least base score
    });
  });
});

describe("Love Trivia", () => {
  describe("calculateTriviaScore", () => {
    it("returns 0 for 0 total questions", () => {
      expect(calculateTriviaScore(0, 0)).toBe(0);
    });

    it("returns 1000 for perfect score", () => {
      expect(calculateTriviaScore(10, 10)).toBe(1000);
    });

    it("returns 500 for 50% correct", () => {
      expect(calculateTriviaScore(5, 10)).toBe(500);
    });

    it("scales proportionally", () => {
      expect(calculateTriviaScore(7, 10)).toBe(700);
      expect(calculateTriviaScore(3, 10)).toBe(300);
    });
  });
});
