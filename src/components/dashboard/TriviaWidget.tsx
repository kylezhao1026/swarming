"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function TriviaWidget() {
  const [question, setQuestion] = useState<any>(null);
  const [dayKey, setDayKey] = useState("");
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<any[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchDailyTrivia();
  }, []);

  async function fetchDailyTrivia() {
    const res = await fetch("/api/games/trivia/daily");
    const data = await res.json();
    if (data.success) {
      setQuestion(data.data.question);
      setDayKey(data.data.dayKey);
      setAnswers(data.data.answers || []);
      setHasAnswered(Boolean(data.data.hasAnswered));
    }
  }

  async function submitAnswer() {
    if (!answer.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/games/trivia/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });
    const data = await res.json();
    setSending(false);

    if (data.success) {
      setAnswer("");
      await fetchDailyTrivia();
    }
  }

  if (!question) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-400">
        <p className="text-sm">No daily trivia available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider">
          Daily Trivia
        </h3>
        <span className="text-[10px] text-gray-400 dark:text-slate-400">{dayKey}</span>
      </div>

      <div className="bg-lavender-100/70 dark:bg-slate-800 rounded-2xl p-4 mb-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-slate-100 leading-relaxed">
          {question.question}
        </p>
      </div>

      {!hasAnswered ? (
        <div className="space-y-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer for today..."
            className="w-full text-sm min-h-[84px] px-3 py-2 rounded-xl border border-lavender-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-lavender-300 placeholder:text-gray-300 dark:placeholder:text-slate-500 resize-none"
            maxLength={300}
          />
          <button
            onClick={submitAnswer}
            disabled={sending || !answer.trim()}
            className="w-full text-xs font-semibold py-2 rounded-xl bg-love-400 text-white hover:bg-love-500 transition-colors disabled:opacity-50"
          >
            {sending ? "Submitting..." : "Submit answer"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500 dark:text-slate-300 mb-2">
          You answered today. If your partner answers too, both responses show below.
        </p>
      )}

      <div className="mt-3 space-y-2 overflow-y-auto min-h-0">
        {answers.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-400">No answers yet today.</p>
        ) : (
          answers.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg leading-none">{entry.player.avatarEmoji || "💕"}</span>
                <p className="text-xs font-semibold text-gray-600 dark:text-slate-200">{entry.player.name}</p>
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-100">{entry.answer}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
