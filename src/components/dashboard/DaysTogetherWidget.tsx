"use client";

import { motion } from "framer-motion";
// @ts-ignore
import { Planet } from "react-kawaii";

interface DaysTogetherWidgetProps {
  startDate: string;
  partnerName?: string;
}

export function DaysTogetherWidget({ startDate, partnerName }: DaysTogetherWidgetProps) {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;

  let label = "";
  if (years > 0) label += `${years}y `;
  if (months > 0) label += `${months}m `;
  label += `${days}d`;

  // Determine mood based on milestones
  const mood = totalDays >= 365 ? "blissful" : totalDays >= 30 ? "happy" : "blissful";

  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-2">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <Planet size={56} mood={mood} color="#c4b5fd" />
      </motion.div>

      <div>
        <motion.p
          className="text-2xl font-extrabold text-gray-800 dark:text-slate-100"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          {totalDays}
        </motion.p>
        <p className="text-[10px] text-gray-400 dark:text-slate-400 font-medium uppercase tracking-wider">
          days together
        </p>
      </div>

      <p className="text-[10px] text-gray-300 dark:text-slate-400">{label.trim()}</p>
    </div>
  );
}
