import { getCurrentHotel } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InboxClient } from "@/components/chat/inbox-client";

export default async function InboxPage() {
  const hotel = await getCurrentHotel();
  if (!hotel) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { hotelId: hotel.id },
    include: {
      guest: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const faqs = await prisma.fAQ.findMany({
    where: { hotelId: hotel.id, isActive: true },
    orderBy: { hits: "desc" },
  });

  return <InboxClient conversations={conversations} faqs={faqs} />;
}
