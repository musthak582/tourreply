"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell, Search, ChevronDown, LogOut, Settings,
  MessageSquare, CalendarCheck, DollarSign, CheckCircle,
  Check, X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/actions/auth-actions";
import { markNotificationsReadAction } from "@/actions/message-actions";
import { initials, formatRelative } from "@/lib/utils";
import Link from "next/link";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
};

interface HeaderProps {
  user: { name: string; email: string };
  hotel?: { name: string; location: string };
  notifications: NotificationItem[];
}

const NOTIF_ICONS: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  new_inquiry:        { icon: MessageSquare, bg: "bg-blue-100",    color: "text-blue-600"    },
  booking_requested:  { icon: CalendarCheck, bg: "bg-amber-100",   color: "text-amber-600"   },
  payment_received:   { icon: DollarSign,    bg: "bg-violet-100",  color: "text-violet-600"  },
  booking_confirmed:  { icon: CheckCircle,   bg: "bg-emerald-100", color: "text-emerald-600" },
};

export function Header({ user, hotel, notifications: initial }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [notifications, setNotifications] = useState(initial);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.isRead).length;

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleMarkAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markNotificationsReadAction();
  }

  function handleNotifClick(n: NotificationItem) {
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    setNotifOpen(false);
  }

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-30 relative">

      {/* Search */}
      <div className={`flex items-center gap-2 h-8 rounded-lg border transition-all px-3 ${
        searchFocused ? "border-emerald-300 bg-white w-72" : "border-slate-200 bg-slate-50 w-56"
      }`}>
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search guests, bookings…"
          className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* ── Notification bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors
              ${notifOpen ? "bg-slate-100" : "hover:bg-slate-50"}`}
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-emerald-500 rounded-full
                border-2 border-white flex items-center justify-center">
                {unread > 9
                  ? <span className="text-[8px] font-bold text-white px-0.5">9+</span>
                  : unread > 1
                    ? <span className="text-[8px] font-bold text-white px-0.5">{unread}</span>
                    : null
                }
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 z-50 overflow-hidden">

              {/* panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  {unread > 0 && (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                      {unread} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unread > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50"
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* notification list */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                      <Bell className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">All caught up</p>
                    <p className="text-xs text-slate-400 mt-0.5">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map(n => {
                      const cfg = NOTIF_ICONS[n.type] ?? NOTIF_ICONS["new_inquiry"];
                      const Icon = cfg.icon;
                      return (
                        <Link
                          key={n.id}
                          href={n.link ?? "/dashboard"}
                          onClick={() => handleNotifClick(n)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors
                            ${!n.isRead ? "bg-emerald-50/40" : ""}`}
                        >
                          <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-semibold leading-tight ${!n.isRead ? "text-slate-900" : "text-slate-700"}`}>
                                {n.title}
                              </p>
                              {!n.isRead && (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatRelative(n.createdAt)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* footer */}
              {notifications.length > 0 && (
                <div className="border-t border-slate-100 px-4 py-2.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    View all activity →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── User menu ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-1 pr-2 h-8 rounded-lg hover:bg-slate-50 transition-colors">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700">{user.name.split(" ")[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 font-normal mt-0.5">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            {hotel && (
              <div className="px-2 pb-2 pt-1">
                <div className="rounded-lg bg-emerald-50 px-2 py-1.5">
                  <p className="text-xs font-medium text-emerald-800">{hotel.name}</p>
                  <p className="text-xs text-emerald-600">{hotel.location}</p>
                </div>
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => logoutAction()}
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
