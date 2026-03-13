import { getCurrentHotel } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
//import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Phone, Globe, CalendarCheck, MessageSquare, DollarSign } from "lucide-react";
import { initials } from "@/lib/utils";

export default async function GuestsPage() {
  const hotel = await getCurrentHotel();
  if (!hotel) redirect("/login");

  const guests = await prisma.guest.findMany({
    where: { hotelId: hotel.id },
    include: {
      _count: { select: { bookings: true, conversations: true } },
      bookings: {
        include: { room: true, payments: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = await prisma.payment.aggregate({
    where: {
      status: "completed",
      booking: { guest: { hotelId: hotel.id } },
    },
    _sum: { amount: true },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Guests</h1>
          <p className="text-sm text-slate-500 mt-0.5">{guests.length} guests in your CRM</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-900">{formatCurrency(totalRevenue._sum.amount || 0)}</span>
            <span className="text-slate-500 text-xs">total revenue</span>
          </div>
        </div>
      </div>

      {/* Guests grid */}
      {guests.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">No guests yet</h3>
          <p className="text-sm text-slate-500 mt-1">Guests will appear here when they contact you</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map((guest) => {
            const guestRevenue = guest.bookings.reduce((sum, b) => {
              const paid = b.payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
              return sum + paid;
            }, 0);

            return (
              <Card key={guest.id} className="border-slate-200 shadow-none hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-sm">
                        {initials(guest.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">{guest.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{guest.phone}</span>
                      </div>
                      {guest.country && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{guest.country}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-base font-bold text-slate-900">{guest._count.bookings}</p>
                      <p className="text-xs text-slate-500">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-slate-900">{guest._count.conversations}</p>
                      <p className="text-xs text-slate-500">Chats</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-emerald-600">
                        {guestRevenue > 0 ? formatCurrency(guestRevenue) : "—"}
                      </p>
                      <p className="text-xs text-slate-500">Revenue</p>
                    </div>
                  </div>

                  {guest.bookings.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-slate-600">Recent bookings:</p>
                      {guest.bookings.slice(0, 2).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <CalendarCheck className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-600">{booking.room.name}</span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            booking.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                            booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-slate-400">
                    <span>Added {formatDate(guest.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
