"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHotel } from "@/lib/auth";
import { matchFAQ } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { createGuestAction } from "./guest-actions";

export async function getConversationsAction() {
  const hotel = await getCurrentHotel();
  if (!hotel) return [];

  return prisma.conversation.findMany({
    where: { hotelId: hotel.id },
    include: {
      guest: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getConversationAction(conversationId: string) {
  const hotel = await getCurrentHotel();
  if (!hotel) return null;

  return prisma.conversation.findFirst({
    where: { id: conversationId, hotelId: hotel.id },
    include: {
      guest: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
  sender: "hotel" | "system" = "hotel"
) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const message = await prisma.message.create({
    data: {
      conversationId,
      sender,
      content,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessage: content, updatedAt: new Date() },
  });

  revalidatePath("/dashboard/inbox");
  return { success: true, message };
}

export async function receiveGuestMessageAction(
  guestPhone: string,
  guestName: string,
  content: string
) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  // Find or create guest
  const guestResult = await createGuestAction({
    name: guestName,
    phone: guestPhone,
  });

  if (!guestResult.guest) return { error: "Could not create guest" };

  const guest = guestResult.guest;

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { guestId: guest.id, hotelId: hotel.id, status: "open" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        guestId: guest.id,
        hotelId: hotel.id,
        lastMessage: content,
      },
    });

    // Notify hotel owner
    await prisma.notification.create({
      data: {
        userId: hotel.ownerId,
        type: "new_inquiry",
        title: "New Inquiry",
        message: `${guestName} sent a new message`,
        link: `/dashboard/inbox`,
      },
    });
  }

  // Save guest message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: "guest",
      content,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessage: content, updatedAt: new Date() },
  });

  // Check FAQ auto-reply
  const faqs = await prisma.fAQ.findMany({
    where: { hotelId: hotel.id, isActive: true },
  });

  const matched = matchFAQ(content, faqs);

  if (matched) {
    // Update FAQ hit count
    await prisma.fAQ.update({
      where: { id: (matched as any).id },
      data: { hits: { increment: 1 } },
    });

    // Send auto reply
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: "system",
        content: matched.answer,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessage: matched.answer, updatedAt: new Date() },
    });
  }

  revalidatePath("/dashboard/inbox");
  return { success: true, conversation, autoReplied: !!matched };
}

export async function createConversationAction(
  guestId: string,
  initialMessage?: string
) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const conversation = await prisma.conversation.create({
    data: {
      guestId,
      hotelId: hotel.id,
      lastMessage: initialMessage,
    },
  });

  if (initialMessage) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: "hotel",
        content: initialMessage,
      },
    });
  }

  revalidatePath("/dashboard/inbox");
  return { success: true, conversation };
}

export async function getFAQsAction() {
  const hotel = await getCurrentHotel();
  if (!hotel) return [];

  return prisma.fAQ.findMany({
    where: { hotelId: hotel.id },
    orderBy: { hits: "desc" },
  });
}

export async function createFAQAction(data: {
  question: string;
  answer: string;
  keywords: string[];
}) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  const faq = await prisma.fAQ.create({
    data: { ...data, hotelId: hotel.id },
  });

  revalidatePath("/dashboard/settings");
  return { success: true, faq };
}

export async function deleteFAQAction(faqId: string) {
  const hotel = await getCurrentHotel();
  if (!hotel) return { error: "Unauthorized" };

  await prisma.fAQ.delete({ where: { id: faqId, hotelId: hotel.id } });
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function getNotificationsAction() {
  const hotel = await getCurrentHotel();
  if (!hotel) return [];

  return prisma.notification.findMany({
    where: { userId: hotel.ownerId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function markNotificationsReadAction() {
  const hotel = await getCurrentHotel();
  if (!hotel) return;

  await prisma.notification.updateMany({
    where: { userId: hotel.ownerId, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/dashboard");
}
