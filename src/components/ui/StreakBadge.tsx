"use client";

import { motion } from "framer-motion";
import { getStreakEmoji, getStreakMessage } from "@/lib/streaks";

interface StreakBadgeProps {
  count: number;
  type: string;
}

export function StreakBadge({ count, type }: StreakBadgeProps) {
  const emoji = getStreakEmoji(count);
  const message = getStreakMessage(count);

  return (
    <motion.div
      className="flex items-center gap-2 bg-warm-50 rounded-full px-4 py-2 border border-warm-200"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.span
        className="text-xl"
        animate={count >= 7 ? { rotate: [0, -10, 10, 0] } : undefined}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {emoji}
      </motion.span>
      <div>
        <p className="text-sm font-bold text-gray-700">
          {count} day{count !== 1 ? "s" : ""}{" "}
          <span className="text-gray-400 font-normal capitalize">{type}</span>
        </p>
        <p className="text-xs text-gray-400">{message}</p>
      </div>
    </motion.div>
  );
}
