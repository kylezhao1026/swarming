import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { SessionUser } from "@/types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireCoupleSpace(): Promise<{
  user: SessionUser;
  coupleSpaceId: string;
}> {
  const user = await requireSession();
  if (!user.coupleSpaceId) throw new Error("No couple space");
  return { user, coupleSpaceId: user.coupleSpaceId };
}
