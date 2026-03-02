"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PhotosPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPhotos(d.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function deletePhoto(id: string) {
    const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Photo History</h1>
        <Link href="/dashboard" className="text-xs font-semibold text-love-500 hover:text-love-600">
          Back to dashboard
        </Link>
      </div>

      {loading ? (
        <div className="bento-cell text-sm text-gray-400 dark:text-slate-400">Loading photos...</div>
      ) : photos.length === 0 ? (
        <div className="bento-cell text-sm text-gray-400 dark:text-slate-400">No photos uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="bento-cell p-2 space-y-2">
              <img
                src={photo.imageData}
                alt={photo.caption || "Shared photo"}
                className="w-full aspect-square object-cover rounded-xl"
              />
              <p className="text-[11px] text-gray-500 dark:text-slate-300 truncate">
                {photo.caption || "No caption"}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-400">
                {new Date(photo.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => deletePhoto(photo.id)}
                className="w-full text-[11px] py-1 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-400/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
