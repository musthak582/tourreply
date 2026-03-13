import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface SessionData {
  userId?: string;
  email?: string;
  name?: string;
  hotelId?: string;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex-password-at-least-32-characters-long-please",
  cookieName: "tourreply_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      hotels: {
        take: 1,
      },
    },
  });

  return user;
}

export async function getCurrentHotel() {
  const user = await getCurrentUser();
  if (!user || user.hotels.length === 0) return null;
  return user.hotels[0];
}
