"use client";

import Link from "next/link";
import { motion } from "framer-motion";
// @ts-ignore
import { Ghost, Cat, Planet, SpeechBubble } from "react-kawaii";

const features = [
  {
    Component: SpeechBubble,
    color: "#fda4af",
    title: "Love Notes",
    desc: "Leave little messages for each other, anytime",
  },
  {
    Component: Cat,
    color: "#c4b5fd",
    title: "Shared Pet",
    desc: "Care for your love bug together and watch it grow",
  },
  {
    Component: Ghost,
    color: "#fde68a",
    title: "Mini Games",
    desc: "Memory Match, Love Trivia — play from anywhere",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Floating kawaii characters */}
        <div className="flex items-end justify-center gap-6 mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0 }}
          >
            <Ghost size={64} mood="blissful" color="#fda4af" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: 0.3 }}
          >
            <Planet size={80} mood="blissful" color="#c4b5fd" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, delay: 0.6 }}
          >
            <Cat size={64} mood="happy" color="#fde68a" />
          </motion.div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-3 tracking-tight">
          lovely
        </h1>
        <p className="text-base text-gray-400 mb-8 leading-relaxed max-w-sm mx-auto">
          A cozy little dashboard for two. Share notes, grow a pet together,
          play games, and keep your streaks alive — no matter the distance.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 rounded-full font-semibold text-white bg-love-400 hover:bg-love-500 transition-all active:scale-95 shadow-sm shadow-love-200"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-full font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-all active:scale-95 border border-gray-200"
          >
            Sign In
          </Link>
        </div>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mt-20 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="bento-cell text-center py-6 flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <f.Component size={48} mood="happy" color={f.color} />
            <h3 className="font-bold text-gray-700 text-sm">{f.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed px-2">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="mt-16 flex items-center gap-2">
        <div className="w-8 h-px bg-gray-200" />
        <p className="text-xs text-gray-300">Made with care, for lovers</p>
        <div className="w-8 h-px bg-gray-200" />
      </div>
    </div>
  );
}
