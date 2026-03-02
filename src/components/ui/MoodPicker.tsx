"use client";

import { motion } from "framer-motion";

const MOODS = [
  { value: "HAPPY", emoji: "😊", label: "Happy" },
  { value: "SAD", emoji: "😢", label: "Sad" },
  { value: "EXCITED", emoji: "🤩", label: "Excited" },
  { value: "TIRED", emoji: "😴", label: "Tired" },
  { value: "LOVING", emoji: "🥰", label: "Loving" },
  { value: "NEUTRAL", emoji: "😌", label: "Neutral" },
] as const;

interface MoodPickerProps {
  selected: string | null;
  onSelect: (mood: string) => void;
}

export function MoodPicker({ selected, onSelect }: MoodPickerProps) {
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {MOODS.map((mood) => (
        <motion.button
          key={mood.value}
          onClick={() => onSelect(mood.value)}
          className={`flex flex-col items-center gap-1 p-3 rounded-cute transition-all ${
            selected === mood.value
              ? "bg-love-100 ring-2 ring-love-400 shadow-sm"
              : "bg-white hover:bg-love-50"
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Mood: ${mood.label}`}
          aria-pressed={selected === mood.value}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-xs font-medium text-gray-500">
            {mood.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
