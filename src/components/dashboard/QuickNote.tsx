"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NOTE_COLORS = [
  { bg: "#fff1f2", border: "#fecdd3", name: "rose" },
  { bg: "#fef9c3", border: "#fef08a", name: "yellow" },
  { bg: "#e0f2fe", border: "#bae6fd", name: "blue" },
  { bg: "#f3e8ff", border: "#e9d5ff", name: "purple" },
  { bg: "#dcfce7", border: "#bbf7d0", name: "green" },
];

interface QuickNoteProps {
  notes: any[];
  onSend: (content: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  userId: string;
}

export function QuickNote({ notes, onSend, onDelete, userId }: QuickNoteProps) {
  const [content, setContent] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!content.trim() || sending) return;
    setSending(true);
    await onSend(content, color.bg);
    setContent("");
    setSending(false);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          Love Notes
        </h3>
        <span className="text-xs text-gray-300">{notes.length} notes</span>
      </div>

      {/* Input area */}
      <div
        className="rounded-2xl p-3 mb-3 transition-colors"
        style={{ backgroundColor: color.bg, borderColor: color.border, borderWidth: 1 }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave a sweet note..."
          className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400/60 resize-none focus:outline-none"
          rows={2}
          maxLength={280}
        />
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-1">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c)}
                className={`w-4 h-4 rounded-full transition-all ${
                  color.name === c.name ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : ""
                }`}
                style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
                aria-label={c.name}
              />
            ))}
          </div>
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="text-xs font-semibold text-love-500 hover:text-love-600 disabled:text-gray-300 transition-colors"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </div>

      {/* Recent notes scroll */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1 scrollbar-thin">
        <AnimatePresence>
          {notes.slice(0, 6).map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl p-2.5 text-xs group relative"
              style={{ backgroundColor: note.color || "#fff1f2" }}
            >
              <p className="text-gray-600 leading-relaxed">{note.content}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-gray-400">
                  {note.author?.name} &middot;{" "}
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {note.author?.id === userId && (
                  <button
                    onClick={() => onDelete(note.id)}
                    className="text-[10px] text-gray-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    remove
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
