"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NavBar } from "@/components/ui/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-heart-pulse">💕</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen pt-20 pb-8 transition-colors duration-300">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
