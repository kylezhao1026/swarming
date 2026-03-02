"use client";

import { motion } from "framer-motion";

interface CuteCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function CuteCard({
  children,
  className = "",
  hoverable = false,
  onClick,
}: CuteCardProps) {
  return (
    <motion.div
      className={`cute-card ${className}`}
      whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </motion.div>
  );
}
