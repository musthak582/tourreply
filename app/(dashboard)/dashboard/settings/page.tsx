import { getCurrentHotel, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const hotel = await getCurrentHotel();
  if (!user || !hotel) redirect("/login");

  const faqs = await prisma.fAQ.findMany({
    where: { hotelId: hotel.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <SettingsClient
      user={{ name: user.name, email: user.email }}
      hotel={{ name: hotel.name, location: hotel.location, phone: hotel.phone || "", email: hotel.email || "" }}
      faqs={faqs}
    />
  );
}
