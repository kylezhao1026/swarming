export const CUTE_AVATARS = [
  "avatar-bunny",
  "avatar-bear",
  "avatar-panda",
  "avatar-koala",
  "avatar-fox",
  "avatar-kitty",
  "avatar-puppy",
  "avatar-frog",
  "avatar-hamster",
  "avatar-tiger",
  "avatar-cow",
  "avatar-pig",
  "avatar-unicorn",
  "avatar-chick",
  "avatar-teddy",
  "avatar-blossom",
] as const;

export type CuteAvatar = (typeof CUTE_AVATARS)[number];

const LEGACY_EMOJIS = new Set([
  "🐰", "🐻", "🐼", "🐨", "🦊", "🐱", "🐶", "🐸",
  "🐹", "🐯", "🐮", "🐷", "🦄", "🐣", "🧸", "🌸", "💕", "🦋", "🌟",
]);

export function getAvatarImage(value: string | null | undefined): string {
  if (!value) return "/avatars/avatar-bunny.svg";
  if (value.startsWith("avatar-")) return `/avatars/${value}.svg`;
  if (LEGACY_EMOJIS.has(value)) return "/avatars/avatar-bunny.svg";
  return "/avatars/avatar-bunny.svg";
}
