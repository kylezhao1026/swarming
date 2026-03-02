"use client";

import { motion } from "framer-motion";

interface HeartButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export function HeartButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}: HeartButtonProps) {
  const base = {
    primary: "cute-button",
    secondary: "cute-button-secondary",
    ghost:
      "px-5 py-2.5 rounded-full font-semibold text-gray-500 hover:text-love-500 hover:bg-love-50 transition-all",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base[variant]} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
