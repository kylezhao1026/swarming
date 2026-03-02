import { Mood, GrowthStage, GameType } from "@prisma/client";

export type { Mood, GrowthStage, GameType };

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  coupleSpaceId: string | null;
  avatarEmoji: string;
}

export interface PetState {
  id: string;
  name: string;
  species: string;
  hunger: number;
  happiness: number;
  health: number;
  growthStage: GrowthStage;
  experience: number;
}

export interface PetAction {
  type: "feed" | "play" | "water";
}

export interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface TriviaQuestionData {
  id: string;
  question: string;
  answer: string;
  authorId: string;
}

export interface StreakData {
  type: string;
  currentCount: number;
  longestCount: number;
  lastDate: string | null;
}

export interface CheckInData {
  mood: Mood;
  message?: string;
}

export interface NoteData {
  content: string;
  color?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
