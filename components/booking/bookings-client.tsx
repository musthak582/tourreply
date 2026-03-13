"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateBookingStatusAction, createBookingAction, createPaymentAction } from "@/actions/booking-actions";
import { formatCurrency, getNights } from "@/lib/utils";
import { format } from "date-fns";
import {
  Plus,
  CalendarCheck,
  BedDouble,
  DollarSign,
  Link as LinkIcon,
  GripVertical,
  Users,
  MessageSquare,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const COLUMNS = [
  { id: "inquiry",    label: "New Inquiry",      color: "bg-slate-400",   border: "border-slate-300",   bg: "bg-slate-50",   text: "text-slate-700"   },
  { id: "interested", label: "Interested",        color: "bg-blue-400",    border: "border-blue-300",    bg: "bg-blue-50",    text: "text-blue-700"    },
  { id: "requested",  label: "Booking Requested", color: "bg-amber-400",   border: "border-amber-300",   bg: "bg-amber-50",   text: "text-amber-700"   },
  { id: "confirmed",  label: "Confirmed",         color: "bg-emerald-400", border: "border-emerald-300", bg: "bg-emerald-50", text: "text-emerald-700" },
  { id: "cancelled",  label: "Cancelled",         color: "bg-red-400",     border: "border-red-300",     bg: "bg-red-50",     text: "text-red-700"     },
];

type Booking = {
  id: string;
  status: string;
  paymentStatus: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number | null;
  specialRequest: string | null;
  source: string;
  guest: { id: string; name: string; phone: string };
  room: { id: string; name: string; price: number };
  payments: { id: string; amount: number; status: string }[];
};

type Room  = { id: string; name: string; price: number; capacity: number };
type GuestOption = { id: string; name: string; phone: string };

interface Props {
  bookings: Booking[];
  rooms: Room[];
  guests: GuestOption[];
}

export function BookingsClient({ bookings: initial, rooms, guests }: Props) {
  const [bookings, setBookings]       = useState(initial);
  const [createOpen, setCreateOpen]   = useState(false);
  const [detailId, setDetailId]       = useState<string | null>(null);
  const [creating, setCreating]       = useState(false);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const draggingId  = useRef<string | null>(null);
  const dragFromCol = useRef<string | null>(null);

  const [form, setForm] = useState({
    guestId: "", roomId: "", checkIn: "", checkOut: "",
    guests: 2, specialRequest: "",
  });

  /* ─── drag handlers ─────────────────────────────── */
  function onDragStart(e: React.DragEvent<HTMLDivElement>, id: string, status: string) {
    draggingId.current  = id;
    dragFromCol.current = status;
    e.dataTransfer.effectAllowed = "move";
    const el = e.currentTarget as HTMLElement;
    setTimeout(() => { el.style.opacity = "0.45"; }, 0);
  }

  function onDragEnd(e: React.DragEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    draggingId.current  = null;
    dragFromCol.current = null;
    setDragOverCol(null);
  }

  function onColumnDragOver(e: React.DragEvent<HTMLDivElement>, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) setDragOverCol(colId);
  }

  function onColumnDragLeave(e: React.DragEvent<HTMLDivElement>) {
    // only clear if leaving the column itself, not a child
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverCol(null);
    }
  }

  async function onColumnDrop(e: React.DragEvent<HTMLDivElement>, toStatus: string) {
    e.preventDefault();
    setDragOverCol(null);
    const id   = draggingId.current;
    const from = dragFromCol.current;
    if (!id || from === toStatus) return;

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: toStatus } : b));

    const result = await updateBookingStatusAction(id, toStatus);
    if (!result.success) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: from! } : b));
      toast({ title: "Error moving booking", variant: "destructive" });
    } else {
      toast({ title: `Moved to "${COLUMNS.find(c => c.id === toStatus)?.label}"` });
    }
  }

  /* ─── create ────────────────────────────────────── */
  async function handleCreate() {
    if (!form.guestId || !form.roomId || !form.checkIn || !form.checkOut) return;
    setCreating(true);
    const room   = rooms.find(r => r.id === form.roomId);
    const nights = getNights(form.checkIn, form.checkOut);
    const total  = (room?.price ?? 0) * nights;

    const result = await createBookingAction({
      guestId: form.guestId, roomId: form.roomId,
      checkIn: form.checkIn, checkOut: form.checkOut,
      guests: form.guests,
      specialRequest: form.specialRequest || undefined,
      totalAmount: total,
    });

    if (result.success && result.booking) {
      setBookings(prev => [result.booking as any, ...prev]);
      setCreateOpen(false);
      setForm({ guestId: "", roomId: "", checkIn: "", checkOut: "", guests: 2, specialRequest: "" });
      toast({ title: "Booking created!" });
    }
    setCreating(false);
  }

  /* ─── payment link ──────────────────────────────── */
  async function handlePaymentLink(booking: Booking) {
    if (!booking.totalAmount) return;
    const deposit = Math.round(booking.totalAmount * 0.3 * 100) / 100;
    await createPaymentAction(booking.id, deposit);
    toast({ title: "Payment link created", description: `30% deposit: ${formatCurrency(deposit)}` });
  }

  const getCol          = (status: string) => bookings.filter(b => b.status === status);
  const selectedBooking = bookings.find(b => b.id === detailId) ?? null;
  const totalNights     = form.roomId && form.checkIn && form.checkOut
    ? getNights(form.checkIn, form.checkOut) : 0;
  const totalPrice = (rooms.find(r => r.id === form.roomId)?.price ?? 0) * totalNights;

  return (
    <div className="flex flex-col h-full">

      {/* top bar */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {bookings.length} total · <span className="text-slate-400">drag cards between columns to update status</span>
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              <Plus className="w-4 h-4" /> New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create New Booking</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">

              <div className="space-y-1.5">
                <Label>Guest</Label>
                <Select value={form.guestId} onValueChange={v => setForm({ ...form, guestId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select guest" /></SelectTrigger>
                  <SelectContent>
                    {guests.map(g => <SelectItem key={g.id} value={g.id}>{g.name} · {g.phone}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Room</Label>
                <Select value={form.roomId} onValueChange={v => setForm({ ...form, roomId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} · {formatCurrency(r.price)}/night · up to {r.capacity} guests
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Check-in</Label>
                  <Input type="date" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Check-out</Label>
                  <Input type="date" value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Number of guests</Label>
                <Input type="number" min={1} value={form.guests}
                  onChange={e => setForm({ ...form, guests: parseInt(e.target.value) || 1 })} />
              </div>

              <div className="space-y-1.5">
                <Label>Special request <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                <textarea
                  rows={2}
                  placeholder="e.g. late check-in, extra bed, dietary needs…"
                  value={form.specialRequest}
                  onChange={e => setForm({ ...form, specialRequest: e.target.value })}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm
                    placeholder:text-muted-foreground focus-visible:outline-none
                    focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>

              {totalNights > 0 && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">{totalNights} nights × {formatCurrency(rooms.find(r => r.id === form.roomId)?.price ?? 0)}</span>
                    <span className="font-bold text-emerald-800">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>30% deposit required</span>
                    <span className="font-semibold">{formatCurrency(totalPrice * 0.3)}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleCreate} disabled={creating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                {creating ? "Creating…" : "Create Booking"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* board + panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full" style={{ minWidth: "920px" }}>
            {COLUMNS.map(col => {
              const cards  = getCol(col.id);
              const isOver = dragOverCol === col.id;

              return (
                <div key={col.id} className="flex flex-col w-56 shrink-0 min-h-0">
                  {/* col header */}
                  <div className="flex items-center gap-2 mb-3 px-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.color}`} />
                    <span className="text-xs font-semibold text-slate-700 flex-1 leading-tight">{col.label}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full border ${col.bg} ${col.border} ${col.text}`}>
                      {cards.length}
                    </span>
                  </div>

                  {/* drop zone */}
                  <div
                    onDragOver={e => onColumnDragOver(e, col.id)}
                    onDragLeave={onColumnDragLeave}
                    onDrop={e => onColumnDrop(e, col.id)}
                    className={`flex-1 rounded-xl p-1.5 space-y-2 transition-all duration-150 overflow-y-auto
                      ${isOver
                        ? `border-2 border-dashed ${col.border} ${col.bg}`
                        : "border-2 border-transparent"
                      }`}
                  >
                    {cards.map(b => (
                      <KanbanCard
                        key={b.id}
                        booking={b}
                        isSelected={detailId === b.id}
                        onClick={() => setDetailId(detailId === b.id ? null : b.id)}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onPaymentLink={handlePaymentLink}
                      />
                    ))}

                    {cards.length === 0 && (
                      <div className={`flex items-center justify-center rounded-xl h-20
                        border-2 border-dashed transition-colors
                        ${isOver ? `${col.border} ${col.bg}` : "border-slate-200"}`}>
                        <p className={`text-xs ${isOver ? col.text : "text-slate-400"}`}>
                          {isOver ? "Drop here" : "Empty"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* side panel */}
        {selectedBooking && (
          <DetailPanel
            booking={selectedBooking}
            onClose={() => setDetailId(null)}
            onPaymentLink={handlePaymentLink}
            onStatusChange={async (id, status) => {
              setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
              await updateBookingStatusAction(id, status);
              const label = COLUMNS.find(c => c.id === status)?.label;
              toast({ title: `Moved to "${label}"` });
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Kanban card ──────────────────────────────────── */
function KanbanCard({
  booking, isSelected, onClick, onDragStart, onDragEnd, onPaymentLink,
}: {
  booking: Booking;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string, status: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onPaymentLink: (b: Booking) => void;
}) {
  const nights = getNights(booking.checkIn, booking.checkOut);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, booking.id, booking.status)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group bg-white rounded-xl border select-none
        cursor-grab active:cursor-grabbing transition-all duration-150
        hover:shadow-md hover:border-slate-300
        ${isSelected ? "border-emerald-400 ring-1 ring-emerald-200 shadow-md" : "border-slate-200"}`}
    >
      <div className="px-3 pt-3 pb-1 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
          {booking.guest.name[0].toUpperCase()}
        </div>
        <span className="text-xs font-semibold text-slate-800 flex-1 truncate">{booking.guest.name}</span>
        <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 shrink-0" />
      </div>

      <div className="px-3 pb-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <BedDouble className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{booking.room.name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarCheck className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{format(new Date(booking.checkIn), "MMM d")} – {format(new Date(booking.checkOut), "MMM d")}</span>
          <span className="text-slate-400 ml-auto">{nights}n</span>
        </div>

        {booking.totalAmount && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span className="text-xs font-bold text-slate-800">{formatCurrency(booking.totalAmount)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              booking.paymentStatus === "paid"    ? "bg-emerald-100 text-emerald-700" :
              booking.paymentStatus === "partial" ? "bg-blue-100 text-blue-700"      :
                                                    "bg-amber-100 text-amber-700"
            }`}>{booking.paymentStatus}</span>
          </div>
        )}

        {booking.paymentStatus !== "paid" && booking.totalAmount && (
          <button
            onClick={e => { e.stopPropagation(); onPaymentLink(booking); }}
            className="w-full flex items-center justify-center gap-1.5 text-xs py-1.5
              bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700
              border border-emerald-200 transition-colors
              opacity-0 group-hover:opacity-100"
          >
            <LinkIcon className="w-3 h-3" /> Send payment link
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Detail side panel ────────────────────────────── */
function DetailPanel({
  booking, onClose, onPaymentLink, onStatusChange,
}: {
  booking: Booking;
  onClose: () => void;
  onPaymentLink: (b: Booking) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const nights = getNights(booking.checkIn, booking.checkOut);

  return (
    <div className="w-72 border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white z-10">
        <p className="text-sm font-semibold text-slate-900">Booking Detail</p>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 text-sm">

        {/* Guest */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Guest</p>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
              {booking.guest.name[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{booking.guest.name}</p>
              <p className="text-xs text-slate-500">{booking.guest.phone}</p>
            </div>
          </div>
        </section>

        {/* Booking details */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Details</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BedDouble className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-700">{booking.room.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-700">
                {format(new Date(booking.checkIn), "MMM d")} – {format(new Date(booking.checkOut), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-700">{booking.guests} guests · {nights} nights</span>
            </div>
            {booking.specialRequest && (
              <div className="flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600 italic text-xs leading-relaxed">{booking.specialRequest}</span>
              </div>
            )}
          </div>
        </section>

        {/* Payment */}
        {booking.totalAmount && (
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment</p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total amount</span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">30% deposit</span>
                <span className="font-semibold text-slate-700">{formatCurrency(booking.totalAmount * 0.3)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold ${
                  booking.paymentStatus === "paid"    ? "bg-emerald-100 text-emerald-700" :
                  booking.paymentStatus === "partial" ? "bg-blue-100 text-blue-700"      :
                                                        "bg-amber-100 text-amber-700"
                }`}>{booking.paymentStatus}</span>
              </div>
            </div>
            {booking.paymentStatus !== "paid" && (
              <button
                onClick={() => onPaymentLink(booking)}
                className="w-full mt-2.5 flex items-center justify-center gap-2 text-sm py-2.5
                  bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium transition-colors"
              >
                <LinkIcon className="w-3.5 h-3.5" /> Send payment link
              </button>
            )}
          </section>
        )}

        {/* Move stage */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Move to stage</p>
          <div className="space-y-1.5">
            {COLUMNS.filter(c => c.id !== booking.status).map(col => (
              <button
                key={col.id}
                onClick={() => onStatusChange(booking.id, col.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border
                  text-xs font-medium transition-all hover:shadow-sm
                  ${col.bg} ${col.border} ${col.text}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${col.color}`} />
                {col.label}
              </button>
            ))}
          </div>
        </section>

        <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
          Source: <span className="font-medium text-slate-600 capitalize">{booking.source}</span>
        </div>
      </div>
    </div>
  );
}
