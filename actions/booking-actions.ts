"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHotel } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bookingSchema = z.object({
  guestId: z.string(),
  roomId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().min(1),
  specialRequest: z.string().optional(),
  totalAmount: z.number().optional(),
  depositAmount: z.number().optional(),
});

export async function createBookingAction(data: z.infer<typeof bookingSchema>) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const result = bookingSchema.safeParse(data);
  if (!result.success) return { error: "Invalid booking data" };

  const room = await prisma.room.findFirst({
    where: { id: result.data.roomId, hotelId: hotel.id },
  });

  if (!room) return { error: "Room not found" };

  const nights =
    (new Date(result.data.checkOut).getTime() -
      new Date(result.data.checkIn).getTime()) /
    (1000 * 60 * 60 * 24);

  const totalAmount = result.data.totalAmount || room.price * nights;

  const booking = await prisma.booking.create({
    data: {
      guestId: result.data.guestId,
      roomId: result.data.roomId,
      checkIn: new Date(result.data.checkIn),
      checkOut: new Date(result.data.checkOut),
      guests: result.data.guests,
      specialRequest: result.data.specialRequest,
      totalAmount,
      depositAmount: result.data.depositAmount,
      status: "requested",
    },
    include: { guest: true, room: true },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: hotel.ownerId,
      type: "booking_requested",
      title: "New Booking Request",
      message: `${booking.guest.name} requested ${booking.room.name} for ${new Date(result.data.checkIn).toLocaleDateString()}`,
      link: `/dashboard/bookings`,
    },
  });

  revalidatePath("/dashboard/bookings");
  return { success: true, booking };
}

export async function updateBookingStatusAction(
  bookingId: string,
  status: string
) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { guest: true, room: true },
  });

  if (status === "confirmed") {
    await prisma.notification.create({
      data: {
        userId: hotel.ownerId,
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `Booking for ${booking.guest.name} has been confirmed`,
        link: `/dashboard/bookings`,
      },
    });
  }

  revalidatePath("/dashboard/bookings");
  return { success: true, booking };
}

export async function getBookingsAction() {
  const hotel = await getCurrentHotel();
  if (!hotel) return [];

  return prisma.booking.findMany({
    where: {
      room: { hotelId: hotel.id },
    },
    include: {
      guest: true,
      room: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPaymentAction(
  bookingId: string,
  amount: number,
  method?: string
) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      amount,
      method: method || "bank_transfer",
      status: "pending",
      paymentLink: `/pay/${bookingId}`,
    },
    include: {
      booking: { include: { guest: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: hotel.ownerId,
      type: "payment_received",
      title: "Payment Requested",
      message: `Payment link sent to ${payment.booking.guest.name} for $${amount}`,
      link: `/dashboard/bookings`,
    },
  });

  revalidatePath("/dashboard/bookings");
  return { success: true, payment };
}

export async function markPaymentPaidAction(paymentId: string) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "completed", paidAt: new Date() },
    include: { booking: true },
  });

  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { paymentStatus: "paid", status: "confirmed" },
  });

  revalidatePath("/dashboard/bookings");
  return { success: true };
}
