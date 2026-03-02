"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartButton } from "@/components/ui/HeartButton";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // Auto sign in after register
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created but couldn't sign in. Please try logging in.");
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
          <span className="text-4xl">✨</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Join lovely</h1>
          <p className="text-sm text-gray-400">Create your cozy corner</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cute-label">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="cute-input"
              placeholder="Your cute name"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="cute-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cute-input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="cute-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cute-input"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-love-500 text-center">{error}</p>
          )}

          <HeartButton type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Account 💕"}
          </HeartButton>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-love-500 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
