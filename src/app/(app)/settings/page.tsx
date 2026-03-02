"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
// @ts-ignore
import { Ghost } from "react-kawaii";
import { CUTE_AVATARS, getAvatarImage } from "@/lib/avatars";
import { AvatarImage } from "@/components/ui/AvatarImage";

export default function SettingsPage() {
  const { update } = useSession();
  const [settings, setSettings] = useState<any>(null);
  const [name, setName] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState<string>("avatar-bunny");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showUnpair, setShowUnpair] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d.success) {
        setSettings(d.data);
        setName(d.data.user?.name || "");
        setSpaceName(d.data.space?.name || "");
        setAvatarEmoji(d.data.user?.avatarEmoji || "avatar-bunny");
      }
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatarEmoji, spaceName }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      await update({ name, avatarEmoji });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleUnpair() {
    const res = await fetch("/api/settings", { method: "DELETE" });
    if ((await res.json()).success) {
      await update({ coupleSpaceId: null });
      window.location.href = "/dashboard";
    }
  }

  const partner = settings?.space?.members?.find((m: any) => m.id !== settings?.user?.id);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Ghost size={36} mood="happy" color="#fda4af" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Settings</h1>
      </div>

      <div className="bento-cell space-y-5">
        <h2 className="text-base font-bold text-gray-600 dark:text-slate-200 uppercase tracking-wider">Your Profile</h2>
        <div className="flex items-center gap-3">
          <AvatarImage avatar={avatarEmoji} alt="Selected avatar" size={56} className="ring-2 ring-love-300" />
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-100">Current profile icon</p>
            <p className="text-xs text-gray-500 dark:text-slate-300">Choose one of 16 generated icons</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-slate-200 mb-1 block">Display Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="cute-input" maxLength={50} />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-slate-200 mb-2 block">Cute Profile Picture</label>
          <div className="grid grid-cols-4 gap-2">
            {CUTE_AVATARS.map((avatar) => (
              <button key={avatar} onClick={() => setAvatarEmoji(avatar)} className={`rounded-xl border p-2 transition-all ${avatarEmoji === avatar ? "border-love-400 bg-love-50 dark:bg-slate-700" : "border-gray-200 dark:border-slate-700 hover:border-love-200"}`}>
                <img src={getAvatarImage(avatar)} alt={avatar} className="w-12 h-12 mx-auto" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-slate-200 mb-1 block">Email</label>
          <p className="text-base text-gray-500 dark:text-slate-300 px-4 py-2.5">{settings?.user?.email}</p>
        </div>
      </div>

      {settings?.space && (
        <div className="bento-cell space-y-4">
          <h2 className="text-base font-bold text-gray-600 dark:text-slate-200 uppercase tracking-wider">Couple Space</h2>
          <div>
            <label className="text-sm font-semibold text-gray-600 dark:text-slate-200 mb-1 block">Space Name</label>
            <input type="text" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} className="cute-input" maxLength={50} />
          </div>
          {partner && (
            <div className="flex items-center gap-3 bg-love-50 dark:bg-slate-800 rounded-xl p-3">
              <AvatarImage avatar={partner.avatarEmoji} alt={partner.name} size={44} />
              <div>
                <p className="text-base font-semibold text-gray-700 dark:text-slate-100">{partner.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">{partner.email}</p>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-slate-300">Joined {new Date(settings.space.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="w-full text-base font-semibold py-3 rounded-xl bg-love-400 text-white hover:bg-love-500 transition-all disabled:opacity-50">
        {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
      </button>

      <div className="bento-cell space-y-4 text-center">
        <Ghost size={56} mood="lovestruck" color="#fda4af" />
        <div>
          <h2 className="text-base font-bold text-gray-700 dark:text-slate-100">Love using lovely?</h2>
          <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">Support the developer to keep this project alive</p>
        </div>
        <a
          href="https://buymeacoffee.com/lovely"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-semibold py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-white transition-all"
        >
          Buy me a coffee ☕
        </a>
      </div>

      <div className="bento-cell space-y-3 border-rose-200/50 dark:border-slate-700">
        <h2 className="text-base font-bold text-gray-600 dark:text-slate-200 uppercase tracking-wider">Account</h2>
        {settings?.space && (
          <>
            {!showUnpair ? (
              <button onClick={() => setShowUnpair(true)} className="w-full text-sm font-medium py-2 rounded-xl text-gray-500 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">Unpair from couple space</button>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-3 space-y-2">
                <p className="text-sm text-gray-600 dark:text-slate-300">This will remove you from the couple space. Your partner remains. Notes and check-ins are preserved.</p>
                <div className="flex gap-2">
                  <button onClick={handleUnpair} className="flex-1 text-sm font-semibold py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all">Confirm Unpair</button>
                  <button onClick={() => setShowUnpair(false)} className="flex-1 text-sm font-semibold py-2 rounded-lg bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                </div>
              </motion.div>
            )}
          </>
        )}

        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-sm font-medium py-2 rounded-xl text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Sign out</button>
      </div>
    </div>
  );
}
