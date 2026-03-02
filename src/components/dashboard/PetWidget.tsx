"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore - react-kawaii doesn't have type defs
import { Planet, Ghost, Cat, IceCream, SpeechBubble } from "react-kawaii";
import { getNextStageXP } from "@/lib/pet";
import type { GrowthStage } from "@prisma/client";

const STAGE_CONFIG: Record<
  string,
  { Component: any; size: number; label: string; color: string }
> = {
  SEED: { Component: Ghost, size: 88, label: "Baby Ghost", color: "#fda4af" },
  SPROUT: { Component: IceCream, size: 96, label: "Little Sprout", color: "#fbcfe8" },
  GROWING: { Component: Cat, size: 104, label: "Growing Kitty", color: "#fde68a" },
  BLOOMING: { Component: Planet, size: 114, label: "Blooming Star", color: "#c4b5fd" },
  FLOURISHING: { Component: SpeechBubble, size: 126, label: "Love Bug", color: "#fda4af" },
};

const ACTION_EMOJI: Record<string, string> = {
  feed: "\u{1F356}",
  play: "\u{1F3BE}",
  water: "\u{1F4A7}",
};

const COOLDOWN_SECONDS = 30;
const DAILY_LIMIT = 5;

function getPetMood(health: number): string {
  if (health >= 80) return "blissful";
  if (health >= 60) return "happy";
  if (health >= 40) return "sad";
  return "shocked";
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyUsage(): Record<string, number> {
  try {
    const raw = localStorage.getItem("pet-daily-usage");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed._date !== getTodayKey()) return {};
    return parsed;
  } catch {
    return {};
  }
}

function setDailyUsage(usage: Record<string, number>) {
  localStorage.setItem(
    "pet-daily-usage",
    JSON.stringify({ ...usage, _date: getTodayKey() })
  );
}

interface FloatingParticle {
  id: number;
  emoji: string;
  x: number;
}

interface PetWidgetProps {
  pet: any;
  onAction: (action: string) => Promise<void>;
}

export function PetWidget({ pet, onAction }: PetWidgetProps) {
  const [acting, setActing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [dailyUses, setDailyUses] = useState<Record<string, number>>({});
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [isPetting, setIsPetting] = useState(false);
  const particleId = useRef(0);

  // Initialize daily usage from localStorage
  useEffect(() => {
    const usage = getDailyUsage();
    setDailyUses({
      feed: usage.feed || 0,
      play: usage.play || 0,
      water: usage.water || 0,
    });
  }, []);

  // Cooldown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const next: Record<string, number> = {};
        let changed = false;
        for (const [key, val] of Object.entries(prev)) {
          if (val > 0) {
            next[key] = val - 1;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const spawnParticle = useCallback((emoji: string) => {
    const id = ++particleId.current;
    const x = Math.random() * 40 - 20;
    setParticles((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  }, []);

  const handlePet = useCallback(() => {
    setIsPetting(true);
    spawnParticle("\u2764\uFE0F");
    setTimeout(() => setIsPetting(false), 500);
  }, [spawnParticle]);

  if (!pet) return null;

  const config = STAGE_CONFIG[pet.growthStage] || STAGE_CONFIG.SEED;
  const KawaiiComponent = config.Component;
  const mood = getPetMood(pet.health);
  const nextStageXP = getNextStageXP(pet.growthStage as GrowthStage);
  const progress = nextStageXP
    ? Math.min(100, Math.round((pet.experience / nextStageXP) * 100))
    : 100;
  const isReadyToEvolve = progress >= 100 && nextStageXP !== null;
  const isHealthy = pet.health >= 80;

  async function handleAction(action: string) {
    const remaining = DAILY_LIMIT - (dailyUses[action] || 0);
    if (acting || (cooldowns[action] ?? 0) > 0 || remaining <= 0) return;

    setActing(true);
    setLastAction(action);

    // Spawn emoji particle
    spawnParticle(ACTION_EMOJI[action] || "\u2728");

    await onAction(action);

    // Update daily usage
    const newUses = { ...dailyUses, [action]: (dailyUses[action] || 0) + 1 };
    setDailyUses(newUses);
    setDailyUsage(newUses);

    // Start cooldown
    setCooldowns((prev) => ({ ...prev, [action]: COOLDOWN_SECONDS }));

    setActing(false);
    setTimeout(() => setLastAction(null), 2200);
  }

  const actions = [
    { type: "feed", label: "Feed", iconPath: "/icons/action-feed.svg" },
    { type: "play", label: "Play", iconPath: "/icons/action-play.svg" },
    { type: "water", label: "Water", iconPath: "/icons/action-water.svg" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider">
            {pet.name}
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-slate-400">
            {config.label} &bull; {pet.growthStage.toLowerCase()} stage
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-600 dark:text-slate-200">{pet.experience} XP</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-400">
            {nextStageXP ? `${nextStageXP - pet.experience} to next` : "Max stage"}
          </p>
        </div>
      </div>

      {/* Progress bar with evolution sparkle */}
      <div className="mb-3 relative">
        <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r from-love-300 to-lavender-300 ${
              isReadyToEvolve ? "animate-shimmer" : ""
            }`}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={
              isReadyToEvolve
                ? {
                    backgroundSize: "200% 100%",
                    backgroundImage:
                      "linear-gradient(90deg, #fda4af, #c4b5fd, #fde68a, #fda4af)",
                  }
                : undefined
            }
          />
        </div>
        {isReadyToEvolve && (
          <motion.p
            className="text-[10px] font-bold text-center mt-1 text-transparent bg-clip-text bg-gradient-to-r from-love-400 to-lavender-400"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Ready to evolve!
          </motion.p>
        )}
      </div>

      {/* Pet area with tap-to-pet and health glow */}
      <div className="flex-1 flex items-center justify-center py-2 relative">
        {/* Floating particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute text-lg pointer-events-none z-10"
              initial={{ opacity: 1, y: 0, x: p.x }}
              animate={{ opacity: 0, y: -50, x: p.x }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              style={{ top: "30%" }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Health glow */}
        {isHealthy && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: config.size + 40,
              height: config.size + 40,
              background:
                "radial-gradient(circle, rgba(253,164,175,0.25) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
        )}

        <motion.div
          className="cursor-pointer select-none"
          onClick={handlePet}
          animate={
            isPetting
              ? { rotate: [0, -8, 8, -5, 5, 0], scale: [1, 1.1, 1] }
              : lastAction
                ? { scale: [1, 1.14, 1], rotate: [0, -5, 5, 0] }
                : { y: [0, -6, 0] }
          }
          transition={
            isPetting
              ? { duration: 0.45 }
              : lastAction
                ? { duration: 0.38 }
                : { repeat: Infinity, duration: 3, ease: "easeInOut" }
          }
        >
          <KawaiiComponent size={config.size} mood={mood} color={config.color} />
        </motion.div>
      </div>

      <div className="h-5 mb-2 text-center">
        {lastAction ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-love-500 font-medium"
          >
            {lastAction === "feed" && "Nice meal for your lovely bug"}
            {lastAction === "play" && "Playtime makes them sparkle"}
            {lastAction === "water" && "Hydrated and comfy"}
          </motion.p>
        ) : (
          <p className="text-[11px] text-gray-400 dark:text-slate-400">
            Tap your pet to show some love!
          </p>
        )}
      </div>

      <div className="w-full space-y-1.5 mb-3">
        {[
          { label: "Hunger", value: pet.hunger, color: "bg-orange-300" },
          { label: "Happy", value: pet.happiness, color: "bg-yellow-300" },
          { label: "Health", value: pet.health, color: "bg-rose-300" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 dark:text-slate-400 w-10">{stat.label}</span>
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${stat.color}`}
                initial={false}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 0.45 }}
              />
            </div>
            <span className="text-[10px] text-gray-500 dark:text-slate-300 w-7 text-right">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Action buttons with cooldowns and daily limits */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {actions.map((a) => {
          const cd = cooldowns[a.type] ?? 0;
          const used = dailyUses[a.type] || 0;
          const remaining = DAILY_LIMIT - used;
          const isDisabled = acting || cd > 0 || remaining <= 0;

          return (
            <button
              key={a.type}
              onClick={() => handleAction(a.type)}
              disabled={isDisabled}
              className="relative flex flex-col items-center gap-0.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-love-200 dark:hover:border-lavender-300 hover:bg-love-50/50 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {/* Daily limit badge */}
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-love-100 dark:bg-slate-700 text-love-500 dark:text-lavender-300 rounded-full px-1.5 py-0.5 leading-none">
                {remaining}/{DAILY_LIMIT}
              </span>

              {cd > 0 ? (
                <span className="w-7 h-7 flex items-center justify-center text-[11px] font-bold text-gray-400 dark:text-slate-400">
                  {cd}s
                </span>
              ) : (
                <img src={a.iconPath} alt={a.label} className="w-7 h-7" />
              )}
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
