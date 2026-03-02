"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CuteCard } from "@/components/ui/CuteCard";
import { HeartButton } from "@/components/ui/HeartButton";
import { createMemoryBoard, checkMatch, calculateMemoryScore } from "@/lib/games";
import type { MemoryCard } from "@/types";

const PAIR_COUNT = 6;

export default function MemoryMatchPage() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    startGame();
  }, []);

  function startGame() {
    setCards(createMemoryBoard(PAIR_COUNT));
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setLocked(false);
  }

  const handleFlip = useCallback(
    (id: number) => {
      if (locked) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.isFlipped || card.isMatched) return;
      if (flipped.length >= 2) return;

      const newCards = cards.map((c) =>
        c.id === id ? { ...c, isFlipped: true } : c
      );
      const newFlipped = [...flipped, id];

      setCards(newCards);
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);

        const [id1, id2] = newFlipped;
        const card1 = newCards.find((c) => c.id === id1)!;
        const card2 = newCards.find((c) => c.id === id2)!;

        if (checkMatch(card1, card2)) {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === id1 || c.id === id2
                  ? { ...c, isMatched: true }
                  : c
              )
            );
            const newMatches = matches + 1;
            setMatches(newMatches);
            setFlipped([]);
            setLocked(false);

            if (newMatches === PAIR_COUNT) {
              setGameOver(true);
              saveScore(newMatches, moves + 1);
            }
          }, 500);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === id1 || c.id === id2
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlipped([]);
            setLocked(false);
          }, 800);
        }
      }
    },
    [cards, flipped, locked, matches, moves]
  );

  async function saveScore(finalMatches: number, finalMoves: number) {
    const score = calculateMemoryScore(finalMatches, finalMoves, PAIR_COUNT);
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "MEMORY_MATCH",
        score,
        moves: finalMoves,
        completed: true,
      }),
    });
  }

  const score = calculateMemoryScore(matches, moves, PAIR_COUNT);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">🃏 Memory Match</h1>
        <p className="text-sm text-gray-400">Find all the matching pairs!</p>
      </div>

      {/* Stats bar */}
      <div className="flex justify-center gap-6 text-sm">
        <span className="font-semibold text-gray-600">
          Moves: <span className="text-love-500">{moves}</span>
        </span>
        <span className="font-semibold text-gray-600">
          Matches: <span className="text-love-500">{matches}/{PAIR_COUNT}</span>
        </span>
      </div>

      {/* Game board */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`aspect-square rounded-cute text-2xl flex items-center justify-center transition-all ${
              card.isMatched
                ? "bg-love-100 border-2 border-love-300"
                : card.isFlipped
                ? "bg-white border-2 border-lavender-300 shadow-sm"
                : "bg-lavender-100 hover:bg-lavender-200 border-2 border-transparent"
            }`}
            whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : undefined}
            whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : undefined}
            disabled={card.isFlipped || card.isMatched || locked}
            aria-label={
              card.isFlipped || card.isMatched
                ? `Card: ${card.emoji}`
                : "Hidden card"
            }
          >
            {card.isFlipped || card.isMatched ? (
              <motion.span
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.2 }}
              >
                {card.emoji}
              </motion.span>
            ) : (
              <span className="text-lavender-300">?</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Game over */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CuteCard className="text-center bg-love-50">
            <span className="text-4xl block mb-2">🎉</span>
            <h2 className="text-xl font-bold text-gray-800">You did it!</h2>
            <p className="text-sm text-gray-500 mt-1">
              {moves} moves &middot; Score: {score}
            </p>
            <HeartButton onClick={startGame} className="mt-4">
              Play Again 🔄
            </HeartButton>
          </CuteCard>
        </motion.div>
      )}

      {!gameOver && (
        <div className="text-center">
          <HeartButton onClick={startGame} variant="ghost">
            Restart
          </HeartButton>
        </div>
      )}
    </div>
  );
}
