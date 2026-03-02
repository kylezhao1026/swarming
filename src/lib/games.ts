/**
 * Game logic for Memory Match and Love Trivia.
 */

import { MemoryCard } from "@/types";

// ── Memory Match ──────────────────────────────────────────────

const LOVE_EMOJIS = [
  "💕", "💖", "💗", "💘", "💝", "💞",
  "🌹", "🦋", "🌸", "⭐", "🎀", "🧸",
];

export function createMemoryBoard(pairCount: number = 6): MemoryCard[] {
  const emojis = LOVE_EMOJIS.slice(0, pairCount);
  const cards: MemoryCard[] = [];

  emojis.forEach((emoji, i) => {
    cards.push({ id: i * 2, emoji, isFlipped: false, isMatched: false });
    cards.push({ id: i * 2 + 1, emoji, isFlipped: false, isMatched: false });
  });

  return shuffleCards(cards);
}

export function shuffleCards(cards: MemoryCard[]): MemoryCard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function checkMatch(card1: MemoryCard, card2: MemoryCard): boolean {
  return card1.emoji === card2.emoji && card1.id !== card2.id;
}

export function calculateMemoryScore(
  matches: number,
  moves: number,
  totalPairs: number
): number {
  if (moves === 0) return 0;
  const efficiency = totalPairs / moves;
  const baseScore = matches * 100;
  const bonus = Math.round(efficiency * 200);
  return baseScore + bonus;
}

// ── Love Trivia ───────────────────────────────────────────────

export const DEFAULT_TRIVIA_QUESTIONS = [
  // Getting to know each other deeper
  { question: "What's one thing your partner is secretly proud of?", category: "deep" },
  { question: "If your partner could live anywhere for a year, where would it be?", category: "dreams" },
  { question: "What small thing do you do that makes your partner's day?", category: "connection" },
  { question: "What's your partner's go-to order at their favorite restaurant?", category: "basics" },
  { question: "When was the last time you saw your partner genuinely belly-laugh?", category: "memories" },
  { question: "What's something your partner wants to learn but hasn't started yet?", category: "dreams" },
  { question: "What does your partner's ideal Sunday morning look like?", category: "habits" },
  { question: "What song would your partner play on repeat right now?", category: "favorites" },
  { question: "What childhood memory does your partner bring up the most?", category: "deep" },
  { question: "How does your partner act when they're stressed vs. when they're sad?", category: "personality" },

  // Building connection across distance
  { question: "What's the hardest part of long distance for your partner?", category: "connection" },
  { question: "What do you miss most about being physically together?", category: "connection" },
  { question: "What's a little ritual you've built together despite the distance?", category: "connection" },
  { question: "What's one thing you're looking forward to doing together next time you meet?", category: "dreams" },
  { question: "If you could teleport to your partner right now, what would you do first?", category: "connection" },

  // Fun & lighthearted
  { question: "What's your partner's most controversial food opinion?", category: "favorites" },
  { question: "What movie can your partner quote from start to finish?", category: "favorites" },
  { question: "What's your partner's hidden talent that most people don't know about?", category: "personality" },
  { question: "If your partner were an animal, what would they be and why?", category: "fun" },
  { question: "What's the most embarrassing thing your partner has told you?", category: "fun" },
  { question: "What game or app does your partner lose track of time on?", category: "habits" },
  { question: "What would your partner's dream birthday look like?", category: "dreams" },

  // Values & future
  { question: "What's a value your partner would never compromise on?", category: "deep" },
  { question: "Where do you both see yourselves in 5 years?", category: "dreams" },
  { question: "What's one thing your partner has taught you?", category: "deep" },
  { question: "What does 'home' mean to your partner?", category: "deep" },
  { question: "What's a small act of kindness your partner did that you'll never forget?", category: "memories" },

  // Daily life
  { question: "What's the first thing your partner does when they wake up?", category: "habits" },
  { question: "What's your partner's comfort show or YouTube rabbit hole?", category: "favorites" },
  { question: "What does your partner's workspace or desk look like right now?", category: "habits" },
  { question: "What's the weirdest snack combination your partner enjoys?", category: "fun" },
  { question: "What weather makes your partner happiest?", category: "personality" },

  // Relationship growth
  { question: "What's one way your relationship has changed you for the better?", category: "deep" },
  { question: "What's a fight or disagreement that actually made you closer?", category: "deep" },
  { question: "What's one thing you wish you said to your partner more often?", category: "connection" },
  { question: "What made you realize this person was special?", category: "memories" },
  { question: "What's a silly inside joke only the two of you understand?", category: "memories" },
  { question: "What's the bravest thing your partner has done?", category: "deep" },
  { question: "What do you admire most about your partner that they probably don't see in themselves?", category: "connection" },
  { question: "If you wrote a letter to your future selves, what would it say?", category: "dreams" },
  { question: "What moment in your relationship would you want to relive?", category: "memories" },
];

export function calculateTriviaScore(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 1000);
}
