"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import { Ghost, Cat, Planet, IceCream, SpeechBubble, Mug } from "react-kawaii";

const MOODS = [
  { value: "HAPPY", Component: Cat, color: "#fde68a", label: "Happy", mood: "happy" },
  { value: "SAD", Component: Ghost, color: "#bae6fd", label: "Sad", mood: "sad" },
  { value: "EXCITED", Component: Planet, color: "#fda4af", label: "Excited", mood: "blissful" },
  { value: "TIRED", Component: Mug, color: "#e9d5ff", label: "Tired", mood: "sad" },
  { value: "LOVING", Component: SpeechBubble, color: "#fecdd3", label: "Loving", mood: "lovestruck" },
  { value: "NEUTRAL", Component: IceCream, color: "#bbf7d0", label: "Chill", mood: "happy" },
];

interface CheckInWidgetProps {
  recentCheckIns: any[];
  onCheckIn: (mood: string, message?: string) => Promise<void>;
}

export function CheckInWidget({ recentCheckIns, onCheckIn }: CheckInWidgetProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (!selected || sending) return;
    setSending(true);
    await onCheckIn(selected, message || undefined);
    setSubmitted(true);
    setSending(false);
  }

  const partnerCheckIn = recentCheckIns[0];
  const partnerMoodDef = partnerCheckIn
    ? MOODS.find((m) => m.value === partnerCheckIn.mood)
    : null;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider mb-2">
        How are you?
      </h3>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-2"
          >
            {(() => {
              const m = MOODS.find((m) => m.value === selected);
              if (!m) return null;
              const C = m.Component;
              return <C size={64} mood={m.mood as any} color={m.color} />;
            })()}
            <p className="text-xs text-gray-500 dark:text-slate-300">Checked in!</p>
            <button
              onClick={() => {
                setSubmitted(false);
                setSelected(null);
                setMessage("");
              }}
              className="text-[10px] text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors mt-1"
            >
              Change
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" className="flex-1 flex flex-col">
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {MOODS.map((m) => {
                const C = m.Component;
                return (
                  <motion.button
                    key={m.value}
                    onClick={() => setSelected(m.value)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center py-2 rounded-xl text-xs transition-all border ${
                      selected === m.value
                        ? "ring-2 ring-love-300 dark:ring-lavender-300 shadow-sm border-love-200 dark:border-lavender-400"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                    style={{
                      backgroundColor:
                        selected === m.value ? `${m.color}44` : "transparent",
                    }}
                  >
                    <C size={40} mood={m.mood as any} color={m.color} />
                    <span className="text-[11px] text-gray-600 dark:text-slate-200 mt-1">{m.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A little note... (optional)"
                  className="flex-1 min-w-0 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-love-300 placeholder:text-gray-300 dark:placeholder:text-slate-500"
                  maxLength={140}
                />
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-love-400 text-white hover:bg-love-500 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {sending ? "..." : "Check in"}
                </button>
              </motion.div>
            )}

            {partnerMoodDef && partnerCheckIn && (
              <div className="mt-auto pt-2 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <partnerMoodDef.Component
                    size={24}
                    mood={partnerMoodDef.mood as any}
                    color={partnerMoodDef.color}
                  />
                  <div>
                    <p className="text-[11px] font-medium text-gray-600 dark:text-slate-200">
                      {partnerCheckIn.author?.name} is feeling {partnerMoodDef.label.toLowerCase()}
                    </p>
                    {partnerCheckIn.message && (
                      <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5">
                        &ldquo;{partnerCheckIn.message}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
