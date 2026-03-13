"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHotel } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const guestSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  country: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function createGuestAction(data: z.infer<typeof guestSchema>) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const result = guestSchema.safeParse(data);
  if (!result.success) return { error: "Invalid guest data" };

  const existing = await prisma.guest.findFirst({
    where: { phone: result.data.phone, hotelId: hotel.id },
  });

  if (existing) return { success: true, guest: existing };

  const guest = await prisma.guest.create({
    data: {
      ...result.data,
      email: result.data.email || null,
      hotelId: hotel.id,
    },
  });

  revalidatePath("/dashboard/guests");
  return { success: true, guest };
}

export async function getGuestsAction() {
  const hotel = await getCurrentHotel();
  if (!hotel) return [];

  return prisma.guest.findMany({
    where: { hotelId: hotel.id },
    include: {
      _count: {
        select: { bookings: true, conversations: true },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGuestAction(guestId: string) {
  const hotel = await getCurrentHotel();
  if (!hotel) return null;

  return prisma.guest.findFirst({
    where: { id: guestId, hotelId: hotel.id },
    include: {
      bookings: {
        include: { room: true, payments: true },
        orderBy: { createdAt: "desc" },
      },
      conversations: {
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
