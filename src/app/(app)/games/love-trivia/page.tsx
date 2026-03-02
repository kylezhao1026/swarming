"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CuteCard } from "@/components/ui/CuteCard";
import { HeartButton } from "@/components/ui/HeartButton";

export default function LoveTriviaPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const res = await fetch("/api/games/trivia");
    const data = await res.json();
    if (data.success) {
      const all = [
        ...data.data.defaults.map((d: any) => ({ ...d, isDefault: true })),
        ...data.data.custom.map((c: any) => ({ ...c, isDefault: false })),
      ];
      setQuestions(all);
    }
  }

  function startGame() {
    setCurrentIdx(0);
    setScore(0);
    setGameStarted(true);
    setGameOver(false);
    setAnswer("");
    setRevealed(false);
  }

  function revealAnswer() {
    setRevealed(true);
  }

  function markCorrect(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    next();
  }

  function next() {
    setAnswer("");
    setRevealed(false);
    if (currentIdx + 1 >= Math.min(questions.length, 10)) {
      setGameOver(true);
      saveScore();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  async function saveScore() {
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "LOVE_TRIVIA",
        score,
        moves: Math.min(questions.length, 10),
        completed: true,
      }),
    });
  }

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const res = await fetch("/api/games/trivia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
    });

    if ((await res.json()).success) {
      setNewQuestion("");
      setNewAnswer("");
      setShowAddForm(false);
      fetchQuestions();
    }
  }

  const totalRounds = Math.min(questions.length, 10);
  const current = questions[currentIdx];

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">💕 Love Trivia</h1>
        <p className="text-sm text-gray-400">How well do you know each other?</p>
      </div>

      {!gameStarted && !gameOver && (
        <CuteCard className="text-center">
          <span className="text-5xl block mb-3">💕</span>
          <p className="text-gray-600 mb-4">
            {questions.length} questions ready. Answer about your partner!
          </p>
          <div className="space-y-2">
            <HeartButton onClick={startGame} className="w-full" disabled={questions.length === 0}>
              Start Trivia ({totalRounds} questions)
            </HeartButton>
            <HeartButton
              onClick={() => setShowAddForm(!showAddForm)}
              variant="secondary"
              className="w-full"
            >
              {showAddForm ? "Cancel" : "Add Your Own Question ✏️"}
            </HeartButton>
          </div>
        </CuteCard>
      )}

      {/* Add question form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CuteCard>
              <form onSubmit={addQuestion} className="space-y-3">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="cute-input"
                  placeholder="Your trivia question..."
                  maxLength={300}
                />
                <input
                  type="text"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="cute-input"
                  placeholder="The answer..."
                  maxLength={200}
                />
                <HeartButton type="submit" className="w-full">
                  Add Question
                </HeartButton>
              </form>
            </CuteCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active game */}
      {gameStarted && !gameOver && current && (
        <div className="space-y-4">
          <div className="flex justify-center gap-4 text-sm">
            <span className="font-semibold text-gray-600">
              Q {currentIdx + 1}/{totalRounds}
            </span>
            <span className="font-semibold text-love-500">Score: {score}</span>
          </div>

          <CuteCard className="text-center">
            <motion.p
              key={currentIdx}
              className="text-lg font-semibold text-gray-700 py-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {current.question}
            </motion.p>

            {!revealed ? (
              <div className="space-y-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="cute-input min-h-[60px] resize-none"
                  placeholder="Your answer..."
                />
                <HeartButton onClick={revealAnswer} className="w-full">
                  Reveal Answer
                </HeartButton>
              </div>
            ) : (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {current.answer && (
                  <div className="bg-love-50 rounded-cute p-3">
                    <p className="text-xs text-gray-400 mb-1">Expected answer:</p>
                    <p className="font-semibold text-gray-700">{current.answer}</p>
                  </div>
                )}
                <p className="text-sm text-gray-400">Were you close?</p>
                <div className="flex gap-2">
                  <HeartButton
                    onClick={() => markCorrect(true)}
                    className="flex-1"
                  >
                    Nailed it! ✅
                  </HeartButton>
                  <HeartButton
                    onClick={() => markCorrect(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Not quite 😅
                  </HeartButton>
                </div>
              </motion.div>
            )}
          </CuteCard>
        </div>
      )}

      {/* Game over */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CuteCard className="text-center bg-love-50">
            <span className="text-4xl block mb-2">
              {score >= totalRounds * 0.8 ? "🎉" : score >= totalRounds * 0.5 ? "💕" : "💪"}
            </span>
            <h2 className="text-xl font-bold text-gray-800">
              {score}/{totalRounds} correct!
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {score >= totalRounds * 0.8
                ? "You know each other so well!"
                : "Keep learning about each other!"}
            </p>
            <HeartButton onClick={startGame} className="mt-4">
              Play Again 🔄
            </HeartButton>
          </CuteCard>
        </motion.div>
      )}
    </div>
  );
}
