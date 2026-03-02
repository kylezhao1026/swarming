"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartButton } from "@/components/ui/HeartButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="cute-card w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center mb-6">
          <span className="text-4xl">💕</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Welcome Back</h1>
          <p className="text-sm text-gray-400">Sign in to your lovely</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cute-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cute-input"
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="cute-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cute-input"
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-love-500 text-center">{error}</p>
          )}

          <HeartButton type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In 💖"}
          </HeartButton>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          New here?{" "}
          <Link href="/register" className="text-love-500 font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
