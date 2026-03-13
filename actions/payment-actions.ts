// actions/payment-actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/actions/notification-actions'

export async function generatePaymentLink(bookingId: string, amount: number) {
  await requireAuth()

  // In production, integrate with Stripe or similar
  const paymentLink = `https://pay.tourreply.com/booking/${bookingId}`

  const payment = await prisma.payment.upsert({
    where: { bookingId },
    update: { paymentLink, amount },
    create: {
      bookingId,
      amount,
      paymentLink,
      status: 'pending',
    },
  })

  revalidatePath(`/dashboard/bookings/${bookingId}`)
  return payment.paymentLink
}

export async function markAsPaid(bookingId: string) {
  await requireAuth()

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { status: 'paid' },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'paid',
        status: 'confirmed',
      },
    }),
  ])

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      guest: true,
      room: {
        include: { hotel: true },
      },
    },
  })

  if (booking?.room.hotel.ownerId) {
    await createNotification({
      userId: booking.room.hotel.ownerId,
      type: 'payment',
      title: 'Payment received',
      description: `${booking.guest.name} • ${booking.room.name}`,
    })
  }

  revalidatePath(`/dashboard/bookings/${bookingId}`)
}