# lovely

A cozy couple dashboard for partners near or far. Share notes, raise a Love Bug together, play mini-games, and keep your daily streaks alive.

**Live at [swarming.vercel.app](https://swarming.vercel.app)**

## Getting Started

1. Visit [swarming.vercel.app](https://swarming.vercel.app)
2. Click **Get Started** and create an account with your email and a password
3. Once logged in, create a **Couple Space** — this is your shared dashboard
4. Share the **invite code** with your partner so they can join your space
5. That's it — you're connected

## What You Can Do

### Love Bug
Raise a shared pet together. Feed, play, and water it daily — watch it grow through 5 stages from Baby Ghost to Love Bug. Each action has a cooldown and daily limit, so check in throughout the day.

### Daily Check-Ins
Pick a mood (Happy, Sad, Excited, Tired, Loving, Chill) and leave an optional note. See how your partner is feeling at a glance.

### Photos
Share photos with your partner. Upload images with captions — your partner's latest photo shows front and center on the dashboard.

### Love Notes
Leave colorful sticky notes for each other. Pick a color, write a message, and it appears on both dashboards.

### Daily Trivia
Answer a new question every day. Once both partners answer, you can see each other's responses.

### Streaks
Track your daily habits together — check-ins, Love Bug care, and shared notes all have streak counters. No punishment for missing a day, just motivation to keep going.

### Mini Games
Play Memory Match and Pixel Canvas together from the games section.

## Dark Mode

Toggle between light and dark mode using the sun/moon switch in the top navigation bar. Your preference is saved automatically.

## Settings

Access settings from the gear icon in the top nav to:
- Change your display name
- Pick a cute avatar (16 animal options)
- Rename your couple space
- Unpair from your partner if needed

## For Developers

### Local Setup

```bash
git clone https://github.com/kylezhao1026/lovely.git
cd lovely
npm install
cp .env.example .env
# Add your PostgreSQL DATABASE_URL and a NEXTAUTH_SECRET to .env
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Tech Stack

- Next.js 14 (App Router) + TypeScript
- Prisma + PostgreSQL (Neon)
- NextAuth.js (credentials)
- Tailwind CSS + Framer Motion
- Deployed on Vercel

### Tests

```bash
npm test
# 43 unit tests covering streaks, games, and pet care logic
```
