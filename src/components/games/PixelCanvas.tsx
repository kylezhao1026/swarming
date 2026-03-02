"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

const PALETTE = [
  "#000000", "#ffffff", "#ff6b6b", "#fda4af", "#c084fc",
  "#60a5fa", "#34d399", "#fbbf24", "#fb923c", "#a78bfa",
  "#f472b6", "#2dd4bf", "#818cf8", "#e879f9", "#fca5a5",
  "#86efac", "#fde68a", "#a5b4fc", "#67e8f9", "#d1d5db",
];

const GRID_SIZE = 32;
const CELL_PX = 12;

interface PixelCanvasProps {
  initialPixels?: string[][];
  onSave: (pixels: string[][]) => Promise<void>;
  onClear: () => Promise<void>;
}

export function PixelCanvas({ initialPixels, onSave, onClear }: PixelCanvasProps) {
  const [pixels, setPixels] = useState<string[][]>(() =>
    initialPixels ||
    Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => "")
    )
  );
  const [color, setColor] = useState(PALETTE[0]);
  const [tool, setTool] = useState<"draw" | "erase">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the grid onto canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const c = pixels[y]?.[x];
        if (c) {
          ctx.fillStyle = c;
          ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX, CELL_PX);
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(0,0,0,0.04)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_PX, 0);
      ctx.lineTo(i * CELL_PX, GRID_SIZE * CELL_PX);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_PX);
      ctx.lineTo(GRID_SIZE * CELL_PX, i * CELL_PX);
      ctx.stroke();
    }
  }, [pixels]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    if (initialPixels) setPixels(initialPixels);
  }, [initialPixels]);

  function getCellFromEvent(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / CELL_PX);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_PX);
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
    return { x, y };
  }

  function paint(x: number, y: number) {
    setPixels((prev) => {
      const next = prev.map((row) => [...row]);
      next[y][x] = tool === "erase" ? "" : color;
      return next;
    });
    setHasChanges(true);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const cell = getCellFromEvent(e);
    if (cell) paint(cell.x, cell.y);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const cell = getCellFromEvent(e);
    if (cell) paint(cell.x, cell.y);
  }

  function handleMouseUp() {
    setIsDrawing(false);
  }

  async function handleSave() {
    await onSave(pixels);
    setHasChanges(false);
  }

  async function handleClear() {
    setPixels(
      Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => "")
      )
    );
    await onClear();
    setHasChanges(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas */}
      <div
        className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-inner"
        style={{ width: GRID_SIZE * CELL_PX, height: GRID_SIZE * CELL_PX }}
      >
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_PX}
          height={GRID_SIZE * CELL_PX}
          className="cursor-crosshair"
          style={{ width: GRID_SIZE * CELL_PX, height: GRID_SIZE * CELL_PX }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Color palette */}
      <div className="flex flex-wrap gap-1.5 justify-center max-w-[300px]">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); setTool("draw"); }}
            className={`w-6 h-6 rounded-lg transition-all border ${
              color === c && tool === "draw"
                ? "ring-2 ring-offset-1 ring-gray-500 scale-110"
                : "border-gray-200"
            }`}
            style={{ backgroundColor: c }}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>

      {/* Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTool("draw")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
            tool === "draw"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Draw
        </button>
        <button
          onClick={() => setTool("erase")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
            tool === "erase"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Erase
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="text-xs px-3 py-1.5 rounded-lg bg-love-400 text-white hover:bg-love-500 transition-all disabled:opacity-40"
        >
          Save
        </button>
        <button
          onClick={handleClear}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
        >
          Clear
        </button>
      </div>

      {hasChanges && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-gray-400"
        >
          Unsaved changes
        </motion.p>
      )}
    </div>
  );
}
