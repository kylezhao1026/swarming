"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { CuteCard } from "@/components/ui/CuteCard";
import { HeartButton } from "@/components/ui/HeartButton";

const NOTE_COLORS = [
  "#fff1f2", "#fef9c3", "#e0f2fe", "#f3e8ff", "#dcfce7", "#fce7f3",
];

export default function NotesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [notes, setNotes] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const res = await fetch("/api/notes");
    const data = await res.json();
    if (data.success) setNotes(data.data);
    setLoading(false);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, color }),
    });
    const data = await res.json();
    if (data.success) {
      setNotes([data.data, ...notes]);
      setContent("");
    }
  }

  async function deleteNote(id: string) {
    const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setNotes(notes.filter((n) => n.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">💌 Love Notes</h1>
        <p className="text-sm text-gray-400">
          Leave sweet messages for each other
        </p>
      </div>

      {/* New note form */}
      <CuteCard>
        <form onSubmit={addNote} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="cute-input min-h-[80px] resize-none"
            placeholder="Today I'm thinking of you because..."
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    color === c ? "border-love-400 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Note color ${c}`}
                />
              ))}
            </div>
            <HeartButton type="submit" disabled={!content.trim()}>
              Send 💕
            </HeartButton>
          </div>
        </form>
      </CuteCard>

      {/* Notes grid */}
      {loading ? (
        <div className="text-center py-8">
          <span className="text-2xl animate-heart-pulse">💌</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="cute-card relative"
                style={{ backgroundColor: note.color }}
              >
                <p className="text-gray-700 whitespace-pre-wrap text-sm">
                  {note.content}
                </p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
                  <span className="text-xs text-gray-400">
                    {note.author?.avatarEmoji} {note.author?.name} &middot;{" "}
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  {note.author?.id === user?.id && (
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-xs text-gray-300 hover:text-love-400 transition-colors"
                    >
                      delete
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && notes.length === 0 && (
        <p className="text-center text-gray-300 py-8">
          No notes yet. Be the first to leave one! 💝
        </p>
      )}
    </div>
  );
}
