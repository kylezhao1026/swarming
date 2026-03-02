import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      coupleSpaceId: string | null;
      avatarEmoji: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    coupleSpaceId: string | null;
    avatarEmoji: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    coupleSpaceId: string | null;
    avatarEmoji: string;
  }
}
