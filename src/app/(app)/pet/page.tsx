"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CuteCard } from "@/components/ui/CuteCard";
import { HeartButton } from "@/components/ui/HeartButton";
import { getStageEmoji, getNextStageXP } from "@/lib/pet";
import type { GrowthStage } from "@prisma/client";

const ACTIONS = [
  { type: "feed", emoji: "🍎", label: "Feed", description: "+25 hunger, +10 XP" },
  { type: "play", emoji: "🎾", label: "Play", description: "+30 happiness, +15 XP" },
  { type: "water", emoji: "💧", label: "Water", description: "+10 all, +10 XP" },
] as const;

export default function PetPage() {
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    fetchPet();
  }, []);

  async function fetchPet() {
    const res = await fetch("/api/pet");
    const data = await res.json();
    if (data.success) setPet(data.data);
    setLoading(false);
  }

  async function doAction(action: string) {
    setActing(true);
    setLastAction(action);
    const res = await fetch("/api/pet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.success) setPet(data.data);
    setActing(false);
    setTimeout(() => setLastAction(null), 1500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-4xl animate-float">🌱</span>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No pet yet. Create a couple space first!</p>
      </div>
    );
  }

  const nextXP = getNextStageXP(pet.growthStage as GrowthStage);
  const progress = nextXP ? (pet.experience / nextXP) * 100 : 100;

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">🌱 {pet.name}</h1>
        <p className="text-sm text-gray-400">Your shared love plant</p>
      </div>

      {/* Pet display */}
      <CuteCard className="text-center">
        <motion.div
          className="text-7xl py-6"
          animate={
            lastAction
              ? { scale: [1, 1.3, 1], rotate: [0, -5, 5, 0] }
              : { y: [0, -8, 0] }
          }
          transition={
            lastAction
              ? { duration: 0.5 }
              : { repeat: Infinity, duration: 3 }
          }
        >
          {getStageEmoji(pet.growthStage as GrowthStage)}
        </motion.div>

        <p className="text-sm font-semibold text-gray-600 capitalize">
          {pet.growthStage.toLowerCase().replace("_", " ")} Stage
        </p>

        {/* XP progress bar */}
        <div className="mt-3 mx-auto max-w-xs">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{pet.experience} XP</span>
            {nextXP && <span>{nextXP} XP</span>}
          </div>
          <div className="h-2 bg-love-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-love-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </CuteCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Hunger", value: pet.hunger, emoji: "🍎", color: "text-orange-500" },
          { label: "Happy", value: pet.happiness, emoji: "😊", color: "text-yellow-500" },
          { label: "Health", value: pet.health, emoji: "❤️", color: "text-love-500" },
        ].map((stat) => (
          <CuteCard key={stat.label} className="text-center p-3">
            <span className="text-lg">{stat.emoji}</span>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}%</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </CuteCard>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map((a) => (
          <HeartButton
            key={a.type}
            onClick={() => doAction(a.type)}
            variant="secondary"
            disabled={acting}
            className="flex flex-col items-center gap-1 py-4"
          >
            <span className="text-2xl">{a.emoji}</span>
            <span className="text-xs">{a.label}</span>
          </HeartButton>
        ))}
      </div>

      {/* Action feedback */}
      {lastAction && (
        <motion.p
          className="text-center text-sm text-love-500 font-semibold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {lastAction === "feed" && "Yum! 🍎"}
          {lastAction === "play" && "Wheee! 🎾"}
          {lastAction === "water" && "Refreshing! 💧"}
        </motion.p>
      )}
    </div>
  );
}
