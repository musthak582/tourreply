import { getCurrentHotel } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RoomsClient } from "@/components/dashboard/rooms-client";

export default async function RoomsPage() {
  const hotel = await getCurrentHotel();
  if (!hotel) redirect("/login");

  const rooms = await prisma.room.findMany({
    where: { hotelId: hotel.id },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        where: { status: { in: ["confirmed", "requested"] } },
        select: { checkIn: true, checkOut: true },
        orderBy: { checkIn: "asc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return <RoomsClient rooms={rooms} />;
}
