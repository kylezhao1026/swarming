/**
 * Streak calculation logic.
 * Streaks increment when an action happens on consecutive days.
 * Missing a day resets the streak to 0 (non-punitive: no negative effects).
 */

export interface StreakState {
  currentCount: number;
  longestCount: number;
  lastDate: string | null; // ISO date string (YYYY-MM-DD)
}

export function calculateStreak(
  current: StreakState,
  actionDate: string // YYYY-MM-DD
): StreakState {
  if (!current.lastDate) {
    return {
      currentCount: 1,
      longestCount: Math.max(1, current.longestCount),
      lastDate: actionDate,
    };
  }

  const last = new Date(current.lastDate);
  const action = new Date(actionDate);
  const diffMs = action.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day — no change
    return current;
  }

  if (diffDays === 1) {
    // Consecutive day — increment
    const newCount = current.currentCount + 1;
    return {
      currentCount: newCount,
      longestCount: Math.max(newCount, current.longestCount),
      lastDate: actionDate,
    };
  }

  // Gap > 1 day — reset streak
  return {
    currentCount: 1,
    longestCount: current.longestCount,
    lastDate: actionDate,
  };
}

export function getStreakEmoji(count: number): string {
  if (count >= 30) return "🔥";
  if (count >= 14) return "💖";
  if (count >= 7) return "✨";
  if (count >= 3) return "💕";
  return "🌸";
}

export function getStreakMessage(count: number): string {
  if (count >= 30) return "On fire! 30+ days together!";
  if (count >= 14) return "Two weeks strong! 💪";
  if (count >= 7) return "One week streak! Amazing!";
  if (count >= 3) return "Keep it going! 3+ days!";
  if (count >= 1) return "Great start!";
  return "Start your streak today!";
}
