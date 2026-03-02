"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
// @ts-ignore
import { Ghost } from "react-kawaii";
import { CuteCard } from "@/components/ui/CuteCard";
import { HeartButton } from "@/components/ui/HeartButton";
import { PartnerHeader } from "@/components/dashboard/PartnerHeader";
import { QuickNote } from "@/components/dashboard/QuickNote";
import { CheckInWidget } from "@/components/dashboard/CheckInWidget";
import { PetWidget } from "@/components/dashboard/PetWidget";
import { TriviaWidget } from "@/components/dashboard/TriviaWidget";
import { StreaksWidget } from "@/components/dashboard/StreaksWidget";
import { PhotoWidget } from "@/components/dashboard/PhotoWidget";
import { DaysTogetherWidget } from "@/components/dashboard/DaysTogetherWidget";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, update } = useSession();
  const user = session?.user as any;
  const [space, setSpace] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [pet, setPet] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [setupTab, setSetupTab] = useState<"create" | "join">("create");

  const fetchAll = useCallback(async () => {
    const [spaceRes, notesRes, checkInsRes, petRes, photosRes] =
      await Promise.all([
        fetch("/api/couples"),
        fetch("/api/notes"),
        fetch("/api/checkins"),
        fetch("/api/pet"),
        fetch("/api/photos"),
      ]);
    const [spaceData, notesData, checkInsData, petData, photosData] =
      await Promise.all([
        spaceRes.json(),
        notesRes.json(),
        checkInsRes.json(),
        petRes.json(),
        photosRes.json(),
      ]);
    setSpace(spaceData.data);
    if (notesData.success) setNotes(notesData.data);
    if (checkInsData.success) setCheckIns(checkInsData.data);
    if (petData.success) setPet(petData.data);
    if (photosData.success) setPhotos(photosData.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.coupleSpaceId) fetchAll();
    else {
      fetch("/api/couples")
        .then((r) => r.json())
        .then((d) => {
          setSpace(d.data);
          setLoading(false);
        });
    }
  }, [user?.coupleSpaceId, fetchAll]);

  async function createSpace() {
    const res = await fetch("/api/couples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (data.success) {
      await update({ coupleSpaceId: data.data.id });
      fetchAll();
    }
  }

  async function generateInvite() {
    const res = await fetch("/api/invitations", { method: "POST" });
    const data = await res.json();
    if (data.success) setInviteCode(data.data.code);
  }

  async function joinSpace() {
    setError("");
    const res = await fetch("/api/invitations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode }),
    });
    const data = await res.json();
    if (data.success) {
      await update({ coupleSpaceId: data.data.coupleSpaceId });
      fetchAll();
    } else {
      setError(data.error || "Invalid code");
    }
  }

  async function sendNote(content: string, color: string) {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, color }),
    });
    const data = await res.json();
    if (data.success) setNotes([data.data, ...notes]);
  }

  async function deleteNote(id: string) {
    const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    if ((await res.json()).success) setNotes(notes.filter((n) => n.id !== id));
  }

  async function doCheckIn(mood: string, message?: string) {
    const res = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, message }),
    });
    const data = await res.json();
    if (data.success) setCheckIns([data.data, ...checkIns]);
  }

  async function petAction(action: string) {
    const res = await fetch("/api/pet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.success) setPet(data.data);
  }

  async function uploadPhoto(imageData: string, caption?: string) {
    const res = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData, caption }),
    });
    const data = await res.json();
    if (data.success) setPhotos([data.data, ...photos]);
  }

  async function deletePhoto(id: string) {
    const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    if ((await res.json()).success) {
      setPhotos(photos.filter((p) => p.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Ghost size={80} mood="blissful" color="#fda4af" />
          </motion.div>
        </motion.div>
        <motion.p
          className="text-sm text-gray-400 dark:text-slate-400 font-medium tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          loading your love...
        </motion.p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block"
          >
            <Ghost size={80} mood="blissful" color="#fda4af" />
          </motion.div>
          <h1 className="text-2xl font-bold mt-4 text-gray-800 dark:text-slate-100">
            Welcome, {user?.name}!
          </h1>
          <p className="text-sm text-gray-400 dark:text-slate-400 mt-1">
            Let&apos;s get you paired with your partner
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <CuteCard>
            <div className="flex rounded-xl bg-gray-100 dark:bg-slate-800 p-1 mb-5">
              <button
                onClick={() => setSetupTab("create")}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${
                  setupTab === "create"
                    ? "bg-white dark:bg-slate-700 text-love-500 shadow-sm"
                    : "text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
                }`}
              >
                Create Space
              </button>
              <button
                onClick={() => setSetupTab("join")}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${
                  setupTab === "join"
                    ? "bg-white dark:bg-slate-700 text-love-500 shadow-sm"
                    : "text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
                }`}
              >
                Join with Code
              </button>
            </div>

            {setupTab === "create" ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <p className="text-sm text-gray-500 dark:text-slate-300">
                  Start a new couple space, then send your partner an invite code.
                </p>
                <HeartButton onClick={createSpace} className="w-full">
                  Create Our Space
                </HeartButton>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <p className="text-sm text-gray-500 dark:text-slate-300">
                  Got an invite code from your partner? Enter it below.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="cute-input flex-1"
                    placeholder="Enter invite code"
                    maxLength={8}
                  />
                  <HeartButton onClick={joinSpace} variant="secondary">
                    Join
                  </HeartButton>
                </div>
                {error && (
                  <p className="text-sm text-love-500">{error}</p>
                )}
              </motion.div>
            )}
          </CuteCard>
        </motion.div>
      </div>
    );
  }

  const partner = space.members?.find((m: any) => m.id !== user?.id);
  const partnerCheckIns = checkIns.filter(
    (ci: any) => ci.author?.id !== user?.id
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const cellVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PartnerHeader
        spaceName={space.name}
        user={user}
        partner={partner}
        inviteCode={inviteCode}
        onGenerateInvite={generateInvite}
      />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-12 gap-3 auto-rows-min"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Row 1: Love Bug (4) | Photos (5, tall) | Days Together (3) + Games (3) */}
        <motion.div className="md:col-span-4 md:row-span-2" variants={cellVariants}>
          <div className="bento-cell h-full min-h-[420px]">
            <PetWidget pet={pet} onAction={petAction} />
          </div>
        </motion.div>

        <motion.div className="md:col-span-5 md:row-span-2" variants={cellVariants}>
          <div className="bento-cell h-full min-h-[420px]">
            <PhotoWidget
              photos={photos}
              onUpload={uploadPhoto}
              onDelete={deletePhoto}
              userId={user?.id}
              partnerName={partner?.name}
            />
          </div>
        </motion.div>

        <motion.div className="md:col-span-3" variants={cellVariants}>
          <div className="bento-cell min-h-[160px]">
            <DaysTogetherWidget
              startDate={space.startDate || space.createdAt}
              partnerName={partner?.name}
            />
          </div>
        </motion.div>

        <motion.div className="md:col-span-3" variants={cellVariants}>
          <Link href="/games">
            <div className="bento-cell h-full flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-lavender-300 transition-colors">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-lavender-300 group-hover:text-lavender-400 transition-colors"
                >
                  <rect x="6" y="3" width="12" height="18" rx="2" />
                  <circle cx="12" cy="14" r="2" />
                  <line x1="10" y1="8" x2="14" y2="8" />
                </svg>
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-600 dark:text-slate-200 group-hover:text-lavender-400 transition-colors">
                  Play Games
                </p>
                <p className="text-[10px] text-gray-300 dark:text-slate-400 mt-0.5">
                  Memory Match · Pixel Canvas
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Row 2: Check-in (3) | Trivia (5) | Streaks (4) */}
        <motion.div className="md:col-span-3" variants={cellVariants}>
          <div className="bento-cell">
            <CheckInWidget
              recentCheckIns={partnerCheckIns}
              onCheckIn={doCheckIn}
            />
          </div>
        </motion.div>

        <motion.div className="md:col-span-5" variants={cellVariants}>
          <div className="bento-cell h-full min-h-[300px]">
            <TriviaWidget />
          </div>
        </motion.div>

        <motion.div className="md:col-span-4" variants={cellVariants}>
          <div className="bento-cell h-full">
            <StreaksWidget streaks={space.streaks || []} />
          </div>
        </motion.div>

        {/* Row 3: Quick Notes (full width) */}
        <motion.div className="md:col-span-12" variants={cellVariants}>
          <div className="bento-cell min-h-[180px]">
            <QuickNote
              notes={notes}
              onSend={sendNote}
              onDelete={deleteNote}
              userId={user?.id}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
