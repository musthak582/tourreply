import { getCurrentHotel } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingsClient } from "@/components/booking/bookings-client";

export default async function BookingsPage() {
  const hotel = await getCurrentHotel();
  if (!hotel) redirect("/login");

  const [bookings, rooms, guests] = await Promise.all([
    prisma.booking.findMany({
      where: { room: { hotelId: hotel.id } },
      include: { guest: true, room: true, payments: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.room.findMany({ where: { hotelId: hotel.id } }),
    prisma.guest.findMany({ where: { hotelId: hotel.id } }),
  ]);

  return <BookingsClient bookings={bookings} rooms={rooms} guests={guests} />;
}
