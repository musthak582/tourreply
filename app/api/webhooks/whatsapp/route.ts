// app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkFAQs } from '@/actions/message-actions'
import { createNotification } from '@/actions/notification-actions'
import { parseISO } from 'date-fns'

type IncomingPayload = {
  phone: string
  name?: string
  message: string
  hotelId: string
  // optional structured booking info if your WhatsApp provider sends it
  checkIn?: string
  checkOut?: string
  guests?: number
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as IncomingPayload

  const { phone, name, message, hotelId } = body

  if (!phone || !message || !hotelId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Find hotel
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { owner: true },
  })

  if (!hotel) {
    return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
  }

  // Upsert guest
  const guest = await prisma.guest.upsert({
    where: { phone },
    update: {
      name: name || undefined,
      hotelId: hotel.id,
    },
    create: {
      name: name || phone,
      phone,
      hotelId: hotel.id,
    },
  })

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      guestId: guest.id,
      hotelId: hotel.id,
    },
    orderBy: { updatedAt: 'desc' },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        guestId: guest.id,
        hotelId: hotel.id,
        lastMessage: message,
      },
    })
  }

  // Store guest message
  const createdMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: 'guest',
      content: message,
    },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessage: message,
      updatedAt: new Date(),
    },
  })

  const responses: string[] = []

  // Automated FAQ reply
  const faqMatch = await checkFAQs(message, hotel.id)
  if (faqMatch) {
    const systemMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'system',
        content: faqMatch.answer,
        faqId: faqMatch.id,
      },
    })
    responses.push(systemMessage.content)
  }

  // Notification for hotel owner about new inquiry
  if (hotel.owner) {
    await createNotification({
      userId: hotel.owner.id,
      type: 'message',
      title: `New inquiry from ${guest.name}`,
      description: message.length > 80 ? `${message.slice(0, 77)}...` : message,
    })
  }

  // Very simple availability check based on structured fields if provided
  if (body.checkIn && body.checkOut && body.guests) {
    const checkIn = parseISO(body.checkIn)
    const checkOut = parseISO(body.checkOut)

    const rooms = await prisma.room.findMany({
      where: {
        hotelId: hotel.id,
        capacity: {
          gte: body.guests,
        },
      },
      include: {
        bookings: true,
      },
    })

    const availableRoom = rooms.find((room) =>
      room.bookings.every((booking) => {
        const overlaps =
          (checkIn >= booking.checkIn && checkIn < booking.checkOut) ||
          (checkOut > booking.checkIn && checkOut <= booking.checkOut)
        return !overlaps
      }),
    )

    if (availableRoom) {
      const nights =
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      const estimatedTotal = nights * availableRoom.price

      const availabilityText = `We have availability in our "${availableRoom.name}" for your dates. The estimated total is $${estimatedTotal.toFixed(
        0,
      )} for ${body.guests} guest(s). Would you like to proceed with a booking?`

      const availabilityMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: 'system',
          content: availabilityText,
        },
      })

      responses.push(availabilityMessage.content)
    }
  }

  return NextResponse.json({
    ok: true,
    conversationId: conversation.id,
    messageId: createdMessage.id,
    automatedResponses: responses,
  })
}

