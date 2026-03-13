"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHotel } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roomSchema = z.object({
  name: z.string().min(2),
  type: z.string(),
  price: z.number().min(0),
  capacity: z.number().min(1),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export async function createRoomAction(data: z.infer<typeof roomSchema>) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const result = roomSchema.safeParse(data);
  if (!result.success) return { error: "Invalid room data" };

  const room = await prisma.room.create({
    data: {
      ...result.data,
      amenities: result.data.amenities || [],
      hotelId: hotel.id,
    },
  });

  revalidatePath("/dashboard/rooms");
  return { success: true, room };
}

export async function updateRoomAction(
  roomId: string,
  data: Partial<z.infer<typeof roomSchema>>
) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const room = await prisma.room.update({
    where: { id: roomId, hotelId: hotel.id },
    data,
  });

  revalidatePath("/dashboard/rooms");
  return { success: true, room };
}

export async function deleteRoomAction(roomId: string) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  await prisma.room.delete({
    where: { id: roomId, hotelId: hotel.id },
  });

  revalidatePath("/dashboard/rooms");
  return { success: true };
}

export async function getRoomsAction() {
  const hotel = await getCurrentHotel();
  if (!hotel) return [];

  return prisma.room.findMany({
    where: { hotelId: hotel.id },
    include: {
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function checkAvailabilityAction(
  checkIn: string,
  checkOut: string,
  guestCount?: number
) {
  const hotel = await getCurrentHotel();
  if (!hotel) return [];

  const rooms = await prisma.room.findMany({
    where: {
      hotelId: hotel.id,
      isAvailable: true,
      ...(guestCount ? { capacity: { gte: guestCount } } : {}),
    },
  });

  const availableRooms = [];

  for (const room of rooms) {
    const conflicting = await prisma.booking.findFirst({
      where: {
        roomId: room.id,
        status: { in: ["requested", "confirmed"] },
        OR: [
          {
            checkIn: { lte: new Date(checkOut) },
            checkOut: { gte: new Date(checkIn) },
          },
        ],
      },
    });

    if (!conflicting) {
      availableRooms.push(room);
    }
  }

  return availableRooms;
}
