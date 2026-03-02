"use client";

import Link from "next/link";
import { motion } from "framer-motion";
// @ts-ignore
import { Ghost, Planet } from "react-kawaii";

const GAMES = [
  {
    id: "memory-match",
    title: "Memory Match",
    description: "Flip cards and find matching love-themed pairs. Try to beat your best score!",
    Component: Ghost,
    color: "#c4b5fd",
    bgColor: "bg-lavender-100/50",
  },
  {
    id: "pixel-canvas",
    title: "Pixel Canvas",
    description: "Draw together on a shared 32x32 canvas. Create art, leave doodles, express yourselves!",
    Component: Planet,
    color: "#fda4af",
    bgColor: "bg-love-50/50",
  },
];

export default function GamesPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Games</h1>
        <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Play together, even apart</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GAMES.map((game, i) => (
          <Link key={game.id} href={`/games/${game.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`bento-cell ${game.bgColor} text-center py-8 flex flex-col items-center gap-3 cursor-pointer`}
            >
              <game.Component size={56} mood="blissful" color={game.color} />
              <h2 className="text-sm font-bold text-gray-700 dark:text-slate-100">{game.title}</h2>
              <p className="text-[11px] text-gray-400 dark:text-slate-300 leading-relaxed px-2">
                {game.description}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="text-xs text-gray-300 dark:text-slate-400 hover:text-gray-500 dark:hover:text-slate-200 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
