"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createRoomAction, updateRoomAction, deleteRoomAction } from "@/actions/room-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BedDouble, Users, Plus, Pencil, Trash2, CheckCircle, XCircle, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Room = {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description: string | null;
  amenities: string[];
  isAvailable: boolean;
  _count: { bookings: number };
  bookings: { checkIn: Date; checkOut: Date }[];
};

const ROOM_TYPES = ["standard", "deluxe", "suite", "villa"];

const COMMON_AMENITIES = ["AC", "WiFi", "Breakfast", "Private Pool", "Balcony", "Ocean View", "King Bed", "Queen Bed", "Kitchen", "Parking"];

export function RoomsClient({ rooms: initialRooms }: { rooms: Room[] }) {
  const [rooms, setRooms] = useState(initialRooms);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "standard",
    price: "",
    capacity: "2",
    description: "",
    amenities: [] as string[],
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", type: "standard", price: "", capacity: "2", description: "", amenities: [] });
    setOpen(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setForm({
      name: room.name,
      type: room.type,
      price: room.price.toString(),
      capacity: room.capacity.toString(),
      description: room.description || "",
      amenities: room.amenities,
    });
    setOpen(true);
  }

  function toggleAmenity(amenity: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  }

  async function handleSave() {
    if (!form.name || !form.price) return;
    setSaving(true);

    const data = {
      name: form.name,
      type: form.type,
      price: parseFloat(form.price),
      capacity: parseInt(form.capacity),
      description: form.description || undefined,
      amenities: form.amenities,
    };

    if (editing) {
      const result = await updateRoomAction(editing.id, data);
      if (result.success) {
        setRooms((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...data } : r));
        toast({ title: "Room updated!" });
      }
    } else {
      const result = await createRoomAction(data);
      if (result.success && result.room) {
        setRooms((prev) => [...prev, { ...result.room, _count: { bookings: 0 }, bookings: [] } as any]);
        toast({ title: "Room created!" });
      }
    }

    setOpen(false);
    setSaving(false);
  }

  async function handleDelete(roomId: string) {
    if (!confirm("Delete this room?")) return;
    await deleteRoomAction(roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    toast({ title: "Room deleted" });
  }

  const typeColors: Record<string, string> = {
    standard: "bg-slate-100 text-slate-700",
    deluxe: "bg-blue-100 text-blue-700",
    suite: "bg-violet-100 text-violet-700",
    villa: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Rooms & Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">{rooms.length} rooms configured</p>
        </div>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center">
          <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">No rooms yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Add your first room to start accepting bookings</p>
          <Button size="sm" onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Room
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id} className="border-slate-200 shadow-none hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">{room.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[room.type] || "bg-slate-100 text-slate-700"}`}>
                        {room.type}
                      </span>
                    </div>
                    {room.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{room.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => openEdit(room)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(room.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-slate-900">{formatCurrency(room.price)}</span>
                    <span className="text-xs text-slate-500">/ night</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    up to {room.capacity} guests
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {room.isAvailable ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Available
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                      <XCircle className="w-3.5 h-3.5" />
                      Unavailable
                    </span>
                  )}
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">{room._count.bookings} total bookings</span>
                </div>

                {room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="text-xs px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-slate-600">
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="text-xs px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-slate-500">
                        +{room.amenities.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {room.bookings.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Next booking:</p>
                    <p className="text-xs font-medium text-slate-700">
                      {formatDate(room.bookings[0].checkIn)} – {formatDate(room.bookings[0].checkOut)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Room" : "Add New Room"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Room Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Garden Villa Suite" />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Capacity (guests)</Label>
                <Input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Price per night (USD)</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="180" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description (optional)</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Stunning garden view with private pool..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_AMENITIES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      form.amenities.includes(a)
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? "Saving..." : editing ? "Update Room" : "Create Room"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
