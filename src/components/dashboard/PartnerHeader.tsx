"use client";

import { motion } from "framer-motion";
import { AvatarImage } from "@/components/ui/AvatarImage";

interface PartnerHeaderProps {
  spaceName: string;
  user: any;
  partner: any;
  inviteCode?: string;
  onGenerateInvite: () => Promise<void>;
}

export function PartnerHeader({ spaceName, user, partner, inviteCode, onGenerateInvite }: PartnerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{spaceName}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-300">
          {partner ? `${user?.name} & ${partner.name}` : "Waiting for your partner..."}
        </p>
      </div>

      {partner ? (
        <div className="flex -space-x-2">
          <div className="w-12 h-12 rounded-full bg-love-100 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <AvatarImage avatar={user?.avatarEmoji} alt={user?.name || "You"} size={40} />
          </div>
          <div className="w-12 h-12 rounded-full bg-lavender-100 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <AvatarImage avatar={partner.avatarEmoji} alt={partner.name || "Partner"} size={40} />
          </div>
        </div>
      ) : (
        <div>
          {inviteCode ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-love-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-300">Invite code</p>
              <p className="text-lg font-mono font-bold text-love-500 tracking-widest">{inviteCode}</p>
            </motion.div>
          ) : (
            <button onClick={onGenerateInvite} className="text-sm font-semibold text-love-500 hover:text-love-600 bg-love-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 px-4 py-2 rounded-full transition-all">
              Generate invite code
            </button>
          )}
        </div>
      )}
    </div>
  );
}
