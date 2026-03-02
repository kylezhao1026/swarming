import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.gameSession.deleteMany();
  await prisma.triviaQuestion.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.note.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.pixelCanvas.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.user.updateMany({ data: { coupleSpaceId: null } });
  await prisma.coupleSpace.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hash = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      passwordHash: hash,
      avatarEmoji: "🦋",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob",
      passwordHash: hash,
      avatarEmoji: "🌟",
    },
  });

  // Create couple space (with a start date 47 days ago)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 47);

  const space = await prisma.coupleSpace.create({
    data: {
      name: "Alice & Bob's Space 💕",
      startDate,
      members: { connect: [{ id: alice.id }, { id: bob.id }] },
    },
  });

  // Create pixel canvas with a small heart
  const emptyRow = () => Array(32).fill("");
  const canvasPixels = Array.from({ length: 32 }, emptyRow);
  // Draw a small heart in the center
  const heartPixels = [
    [13,12],[14,12],[16,12],[17,12],
    [12,13],[15,13],[18,13],
    [12,14],[18,14],
    [13,15],[17,15],
    [14,16],[16,16],
    [15,17],
  ];
  heartPixels.forEach(([x,y]) => { canvasPixels[y][x] = "#fda4af"; });

  await prisma.pixelCanvas.create({
    data: {
      coupleSpaceId: space.id,
      pixels: canvasPixels,
      width: 32,
      height: 32,
    },
  });

  // Create pet
  await prisma.pet.create({
    data: {
      name: "Love Bug",
      species: "🌱",
      hunger: 75,
      happiness: 80,
      health: 78,
      growthStage: "SPROUT",
      experience: 65,
      coupleSpaceId: space.id,
    },
  });

  // Create streaks
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.streak.createMany({
    data: [
      { type: "checkin", currentCount: 5, longestCount: 5, lastDate: yesterday, coupleSpaceId: space.id },
      { type: "pet_care", currentCount: 3, longestCount: 7, lastDate: yesterday, coupleSpaceId: space.id },
      { type: "notes", currentCount: 2, longestCount: 4, lastDate: yesterday, coupleSpaceId: space.id },
    ],
  });

  // Create notes
  await prisma.note.createMany({
    data: [
      { content: "I miss your smile today 💕", color: "#fff1f2", authorId: alice.id, coupleSpaceId: space.id },
      { content: "Can't wait to see you this weekend! 🎉", color: "#fef9c3", authorId: bob.id, coupleSpaceId: space.id },
      { content: "You make every day brighter ☀️", color: "#e0f2fe", authorId: alice.id, coupleSpaceId: space.id },
      { content: "Thinking of you always 🥰", color: "#f3e8ff", authorId: bob.id, coupleSpaceId: space.id },
    ],
  });

  // Create check-ins
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.checkIn.createMany({
    data: [
      { mood: "LOVING", message: "Missing you extra today", authorId: alice.id, coupleSpaceId: space.id, date: today },
      { mood: "EXCITED", message: "Got a surprise planned for us!", authorId: bob.id, coupleSpaceId: space.id, date: today },
    ],
  });

  // Create trivia questions
  await prisma.triviaQuestion.createMany({
    data: [
      { question: "What's Alice's favorite ice cream flavor?", answer: "Strawberry", authorId: bob.id, coupleSpaceId: space.id },
      { question: "Where did we have our first date?", answer: "The little cafe downtown", authorId: alice.id, coupleSpaceId: space.id },
      { question: "What movie makes Bob cry every time?", answer: "Up (the beginning)", authorId: alice.id, coupleSpaceId: space.id },
    ],
  });

  // Create game sessions
  await prisma.gameSession.createMany({
    data: [
      { gameType: "MEMORY_MATCH", score: 850, moves: 14, completed: true, playerId: alice.id, coupleSpaceId: space.id },
      { gameType: "MEMORY_MATCH", score: 720, moves: 18, completed: true, playerId: bob.id, coupleSpaceId: space.id },
      { gameType: "LOVE_TRIVIA", score: 800, moves: 10, completed: true, playerId: alice.id, coupleSpaceId: space.id },
    ],
  });

  console.log("✅ Seeded successfully!");
  console.log("   📧 alice@example.com / password123");
  console.log("   📧 bob@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
