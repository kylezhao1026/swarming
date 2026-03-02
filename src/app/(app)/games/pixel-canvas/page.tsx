"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PixelCanvas } from "@/components/games/PixelCanvas";
import Link from "next/link";
// @ts-ignore
import { Planet } from "react-kawaii";

export default function PixelCanvasPage() {
  const [canvas, setCanvas] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCanvas();
  }, []);

  async function fetchCanvas() {
    const res = await fetch("/api/canvas");
    const data = await res.json();
    if (data.success) setCanvas(data.data);
    setLoading(false);
  }

  async function handleSave(pixels: string[][]) {
    await fetch("/api/canvas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pixels }),
    });
  }

  async function handleClear() {
    await fetch("/api/canvas", { method: "DELETE" });
    fetchCanvas();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-heart-pulse">🎨</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="inline-block mb-2"
        >
          <Planet size={48} mood="blissful" color="#fda4af" />
        </motion.div>
        <h1 className="text-xl font-bold text-gray-800">Pixel Canvas</h1>
        <p className="text-xs text-gray-400 mt-1">
          Draw together on a shared canvas. Your partner sees your art when they visit!
        </p>
      </div>

      <div className="bento-cell flex justify-center py-6">
        <PixelCanvas
          initialPixels={canvas?.pixels as string[][] | undefined}
          onSave={handleSave}
          onClear={handleClear}
        />
      </div>

      <div className="text-center">
        <Link
          href="/games"
          className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
        >
          Back to games
        </Link>
      </div>
    </div>
  );
}
