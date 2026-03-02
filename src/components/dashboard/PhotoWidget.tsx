"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoWidgetProps {
  photos: any[];
  onUpload: (imageData: string, caption?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  userId: string;
  partnerName?: string;
}

export function PhotoWidget({
  photos,
  onUpload,
  onDelete,
  userId,
  partnerName,
}: PhotoWidgetProps) {
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const displayPhoto = useMemo(() => {
    const partnerLatest = photos.find((p) => p.authorId !== userId);
    return partnerLatest || photos[0] || null;
  }, [photos, userId]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result as string;
      await onUpload(dataUri, caption || undefined);
      setCaption("");
      setUploading(false);
      setExpanded(false);
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider">
          Photos
        </h3>
        <Link
          href="/photos"
          className="text-[11px] font-semibold text-love-500 hover:text-love-600"
        >
          View history
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="relative flex-1 min-h-[220px] rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-left"
      >
        {displayPhoto ? (
          <>
            <img
              src={displayPhoto.imageData}
              alt={displayPhoto.caption || "Latest shared photo"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/65 to-transparent">
              <p className="text-xs text-white font-semibold">
                {displayPhoto.authorId === userId
                  ? "Your latest photo"
                  : `${partnerName || "Partner"}'s latest photo`}
              </p>
              {displayPhoto.caption && (
                <p className="text-[11px] text-white/90 truncate mt-0.5">{displayPhoto.caption}</p>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-center p-4">
            <p className="text-xs text-gray-400 dark:text-slate-400">
              No photos yet. Click to upload your first one.
            </p>
          </div>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 space-y-2"
          >
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-love-300 placeholder:text-gray-300 dark:placeholder:text-slate-500"
              maxLength={200}
            />

            <div className="flex items-center gap-2">
              <label className="flex items-center justify-center gap-1 text-xs font-semibold text-love-500 hover:text-love-600 bg-love-50 hover:bg-love-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 px-3 py-2 rounded-xl cursor-pointer transition-all flex-1">
                {uploading ? "Uploading..." : "Choose photo"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                  disabled={uploading}
                />
              </label>

              {displayPhoto?.authorId === userId && (
                <button
                  onClick={() => onDelete(displayPhoto.id)}
                  className="text-xs px-3 py-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-400/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  Delete
                </button>
              )}
            </div>

            <p className="text-[10px] text-gray-400 dark:text-slate-400">Max upload size: 10MB</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
