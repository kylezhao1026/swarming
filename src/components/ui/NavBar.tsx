"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
// @ts-ignore
import { Ghost } from "react-kawaii";

const THEME_KEY = "lovely-theme";

type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  const html = document.documentElement;
  html.classList.toggle("dark", theme === "dark");
}

export function NavBar() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const initialTheme: ThemeMode = saved ?? "light";
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  if (!session) return null;

  const themeIcon = theme === "dark" ? "/icons/theme-moon.svg" : "/icons/theme-sun.svg";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-gray-100/80 dark:border-slate-800 z-50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Ghost size={34} mood="blissful" color="#fda4af" />
          <span className="font-extrabold text-xl text-gray-800 dark:text-slate-100 tracking-tight">
            lovely
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="relative inline-flex h-11 w-20 items-center rounded-full bg-gray-200 dark:bg-slate-700 transition-colors px-1"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            <span
              className={`inline-flex h-9 w-9 transform rounded-full bg-white dark:bg-slate-100 shadow transition-transform items-center justify-center ${
                theme === "dark" ? "translate-x-9" : "translate-x-0"
              }`}
            >
              <img src={themeIcon} alt={theme === "dark" ? "Moon mode" : "Sun mode"} className="w-6 h-6" />
            </span>
          </button>

          <Link
            href="/settings"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-slate-200 hover:text-gray-700 dark:hover:text-slate-100"
            aria-label="Settings"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
