"use client";

import { getAvatarImage } from "@/lib/avatars";

export function AvatarImage({
  avatar,
  alt,
  size = 40,
  className = "",
}: {
  avatar: string | null | undefined;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={getAvatarImage(avatar)}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
    />
  );
}
