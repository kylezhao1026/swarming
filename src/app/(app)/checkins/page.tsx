"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CuteCard } from "@/components/ui/CuteCard";
import { MoodPicker } from "@/components/ui/MoodPicker";
import { HeartButton } from "@/components/ui/HeartButton";

const MOOD_EMOJIS: Record<string, string> = {
  HAPPY: "😊",
  SAD: "😢",
  EXCITED: "🤩",
  TIRED: "😴",
  LOVING: "🥰",
  NEUTRAL: "😌",
};

export default function CheckInsPage() {
  const [mood, setMood] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchCheckIns();
  }, []);

  async function fetchCheckIns() {
    const res = await fetch("/api/checkins");
    const data = await res.json();
    if (data.success) setCheckIns(data.data);
    setLoading(false);
  }

  async function submitCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!mood) return;
    setSubmitting(true);

    const res = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, message: message || undefined }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (data.success) {
      setSubmitted(true);
      setMood(null);
      setMessage("");
      fetchCheckIns();
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">💝 Daily Check-In</h1>
        <p className="text-sm text-gray-400">How are you feeling today?</p>
      </div>

      {/* Check-in form */}
      <CuteCard>
        {submitted ? (
          <motion.div
            className="text-center py-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <span className="text-4xl block mb-2">💖</span>
            <p className="font-semibold text-gray-700">Checked in!</p>
            <p className="text-sm text-gray-400">Your partner will see how you feel</p>
            <HeartButton
              onClick={() => setSubmitted(false)}
              variant="ghost"
              className="mt-3"
            >
              Update
            </HeartButton>
          </motion.div>
        ) : (
          <form onSubmit={submitCheckIn} className="space-y-4">
            <MoodPicker selected={mood} onSelect={setMood} />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="cute-input min-h-[60px] resize-none"
              placeholder="What's on your mind? (optional)"
              maxLength={280}
            />
            <HeartButton
              type="submit"
              disabled={!mood || submitting}
              className="w-full"
            >
              {submitting ? "Sending..." : "Check In 💕"}
            </HeartButton>
          </form>
        )}
      </CuteCard>

      {/* History */}
      <div>
        <h2 className="font-bold text-gray-600 mb-3">Recent Check-Ins</h2>
        {loading ? (
          <div className="text-center py-4">
            <span className="animate-heart-pulse text-2xl">💝</span>
          </div>
        ) : checkIns.length === 0 ? (
          <p className="text-center text-gray-300 py-4">No check-ins yet</p>
        ) : (
          <div className="space-y-2">
            {checkIns.map((ci) => (
              <motion.div
                key={ci.id}
                className="cute-card flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="text-2xl">{MOOD_EMOJIS[ci.mood] || "😌"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">
                    {ci.author?.name}{" "}
                    <span className="font-normal text-gray-400">
                      &middot; {new Date(ci.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  {ci.message && (
                    <p className="text-sm text-gray-500 mt-0.5">{ci.message}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
