import { getCurrentUser, getCurrentHotel } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelative, getBookingStatusColor, getBookingStatusLabel } from "@/lib/utils";
import {
  MessageSquare,
  CalendarCheck,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const hotel = user.hotels[0];
  if (!hotel) redirect("/login");

  // Fetch stats
  const [totalGuests, totalBookings, conversations, recentBookings, revenue] =
    await Promise.all([
      prisma.guest.count({ where: { hotelId: hotel.id } }),
      prisma.booking.count({
        where: { room: { hotelId: hotel.id } },
      }),
      prisma.conversation.count({ where: { hotelId: hotel.id } }),
      prisma.booking.findMany({
        where: { room: { hotelId: hotel.id } },
        include: { guest: true, room: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.payment.aggregate({
        where: {
          status: "completed",
          booking: { room: { hotelId: hotel.id } },
        },
        _sum: { amount: true },
      }),
    ]);

  const confirmedBookings = await prisma.booking.count({
    where: {
      room: { hotelId: hotel.id },
      status: "confirmed",
    },
  });

  const stats = [
    {
      label: "Total Conversations",
      value: conversations,
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
      change: "+12%",
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      change: "+8%",
    },
    {
      label: "Revenue",
      value: formatCurrency(revenue._sum.amount || 0),
      icon: DollarSign,
      color: "text-violet-600",
      bg: "bg-violet-50",
      change: "+24%",
    },
    {
      label: "Total Guests",
      value: totalGuests,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
      change: "+5%",
    },
  ];

  const conversionRate = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Good morning, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{hotel.name} · {hotel.location}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Clock className="w-3.5 h-3.5" />
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200 shadow-none hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Conversion rate */}
        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Conversion Rate</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{conversionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">
              {confirmedBookings} confirmed of {totalBookings} inquiries
            </p>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-slate-200 shadow-none col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 grid grid-cols-2 gap-2">
            {[
              { label: "View Inbox", href: "/dashboard/inbox", icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
              { label: "New Booking", href: "/dashboard/bookings", icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50" },
              { label: "Manage Rooms", href: "/dashboard/rooms", icon: Zap, color: "text-violet-600 bg-violet-50" },
              { label: "View Guests", href: "/dashboard/guests", icon: Users, color: "text-orange-600 bg-orange-50" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg ${action.color.split(" ")[1]} flex items-center justify-center`}>
                  <action.icon className={`w-4 h-4 ${action.color.split(" ")[0]}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-900">Recent Bookings</CardTitle>
          <Link href="/dashboard/bookings" className="text-xs text-emerald-600 hover:underline font-medium">
            View all →
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {recentBookings.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No bookings yet</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                    {booking.guest.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{booking.guest.name}</p>
                    <p className="text-xs text-slate-500">
                      {booking.room.name} · {format(new Date(booking.checkIn), "MMM d")} – {format(new Date(booking.checkOut), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {booking.totalAmount && (
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBookingStatusColor(booking.status)}`}>
                      {getBookingStatusLabel(booking.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
