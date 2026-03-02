"use client";

interface StreaksWidgetProps {
  streaks: any[];
}

const STREAK_META: Record<string, { label: string; icon: string }> = {
  checkin: { label: "Daily Check-ins", icon: "/icons/streak-checkin.svg" },
  pet_care: { label: "Love Bug Care", icon: "/icons/streak-pet.svg" },
  notes: { label: "Shared Notes", icon: "/icons/streak-notes.svg" },
};

export function StreaksWidget({ streaks }: StreaksWidgetProps) {
  const mapped = ["checkin", "pet_care", "notes"].map((type) => {
    const found = streaks.find((s: any) => s.type === type);
    return { type, currentCount: found?.currentCount || 0, longestCount: found?.longestCount || 0 };
  });

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-600 dark:text-slate-200 uppercase tracking-wider mb-3">
        Streaks
      </h3>

      <div className="space-y-3">
        {mapped.map((s) => {
          const meta = STREAK_META[s.type];
          return (
            <div key={s.type} className="rounded-xl border border-gray-100 dark:border-slate-700 p-3 bg-white/80 dark:bg-slate-900/70">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <img src={meta.icon} alt={meta.label} className="w-7 h-7" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-100">{meta.label}</p>
                </div>
                <p className="text-sm font-bold text-love-500 dark:text-love-300">{s.currentCount} days</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-300">Best: {s.longestCount} days</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
