import { getCurrentHotel } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsClient } from "@/components/analytics/analytics-client";

export default async function AnalyticsPage() {
  const hotel = await getCurrentHotel();
  if (!hotel) redirect("/login");

  const [totalBookings, confirmedBookings, totalConversations, revenue, faqStats, bookingsByStatus] =
    await Promise.all([
      prisma.booking.count({ where: { room: { hotelId: hotel.id } } }),
      prisma.booking.count({ where: { room: { hotelId: hotel.id }, status: "confirmed" } }),
      prisma.conversation.count({ where: { hotelId: hotel.id } }),
      prisma.payment.aggregate({
        where: { status: "completed", booking: { room: { hotelId: hotel.id } } },
        _sum: { amount: true },
      }),
      prisma.fAQ.findMany({
        where: { hotelId: hotel.id },
        orderBy: { hits: "desc" },
        take: 5,
      }),
      prisma.booking.groupBy({
        by: ["status"],
        where: { room: { hotelId: hotel.id } },
        _count: true,
      }),
    ]);

  // Monthly booking data (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const [bookings, convs, rev] = await Promise.all([
      prisma.booking.count({
        where: {
          room: { hotelId: hotel.id },
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.conversation.count({
        where: {
          hotelId: hotel.id,
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: "completed",
          booking: { room: { hotelId: hotel.id } },
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
    ]);

    monthlyData.push({
      month: date.toLocaleString("default", { month: "short" }),
      bookings,
      conversations: convs,
      revenue: rev._sum.amount || 0,
    });
  }

  const stats = {
    totalBookings,
    confirmedBookings,
    totalConversations,
    revenue: revenue._sum.amount || 0,
    conversionRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0,
    faqStats,
    bookingsByStatus,
    monthlyData,
  };

  return <AnalyticsClient stats={stats} />;
}
