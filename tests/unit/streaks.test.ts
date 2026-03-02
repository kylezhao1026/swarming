import { calculateStreak, getStreakEmoji, getStreakMessage } from "@/lib/streaks";

describe("calculateStreak", () => {
  it("starts a new streak from null lastDate", () => {
    const result = calculateStreak(
      { currentCount: 0, longestCount: 0, lastDate: null },
      "2024-01-15"
    );
    expect(result.currentCount).toBe(1);
    expect(result.longestCount).toBe(1);
    expect(result.lastDate).toBe("2024-01-15");
  });

  it("increments streak on consecutive day", () => {
    const result = calculateStreak(
      { currentCount: 3, longestCount: 5, lastDate: "2024-01-14" },
      "2024-01-15"
    );
    expect(result.currentCount).toBe(4);
    expect(result.longestCount).toBe(5);
    expect(result.lastDate).toBe("2024-01-15");
  });

  it("updates longest count when current exceeds it", () => {
    const result = calculateStreak(
      { currentCount: 5, longestCount: 5, lastDate: "2024-01-14" },
      "2024-01-15"
    );
    expect(result.currentCount).toBe(6);
    expect(result.longestCount).toBe(6);
  });

  it("does not change streak on same day", () => {
    const result = calculateStreak(
      { currentCount: 3, longestCount: 5, lastDate: "2024-01-15" },
      "2024-01-15"
    );
    expect(result.currentCount).toBe(3);
    expect(result.longestCount).toBe(5);
  });

  it("resets streak when gap is more than 1 day", () => {
    const result = calculateStreak(
      { currentCount: 10, longestCount: 10, lastDate: "2024-01-10" },
      "2024-01-15"
    );
    expect(result.currentCount).toBe(1);
    expect(result.longestCount).toBe(10);
    expect(result.lastDate).toBe("2024-01-15");
  });

  it("preserves longest count after reset", () => {
    const result = calculateStreak(
      { currentCount: 3, longestCount: 15, lastDate: "2024-01-01" },
      "2024-01-10"
    );
    expect(result.currentCount).toBe(1);
    expect(result.longestCount).toBe(15);
  });
});

describe("getStreakEmoji", () => {
  it("returns fire for 30+ days", () => {
    expect(getStreakEmoji(30)).toBe("🔥");
    expect(getStreakEmoji(100)).toBe("🔥");
  });

  it("returns heart for 14+ days", () => {
    expect(getStreakEmoji(14)).toBe("💖");
    expect(getStreakEmoji(29)).toBe("💖");
  });

  it("returns sparkle for 7+ days", () => {
    expect(getStreakEmoji(7)).toBe("✨");
  });

  it("returns flower for low counts", () => {
    expect(getStreakEmoji(0)).toBe("🌸");
    expect(getStreakEmoji(1)).toBe("🌸");
  });
});

describe("getStreakMessage", () => {
  it("returns appropriate messages for different counts", () => {
    expect(getStreakMessage(0)).toContain("Start");
    expect(getStreakMessage(1)).toContain("start");
    expect(getStreakMessage(7)).toContain("week");
    expect(getStreakMessage(30)).toContain("30");
  });
});
