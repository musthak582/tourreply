"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  LayoutDashboard,
  Inbox,
  CalendarCheck,
  BedDouble,
  Users,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { name: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
  { name: "Rooms", href: "/dashboard/rooms", icon: BedDouble },
  { name: "Guests", href: "/dashboard/guests", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shadow shadow-emerald-200">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900 tracking-tight">TourReply</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-emerald-600" : "text-slate-400"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade banner */}
      <div className="p-3 border-t border-slate-100">
        <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 p-3.5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Pro Plan</span>
          </div>
          <p className="text-xs text-emerald-100 mb-2.5">
            Unlock unlimited conversations & automation
          </p>
          <button className="w-full text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg py-1.5 transition-colors">
            Upgrade now
          </button>
        </div>
      </div>
    </aside>
  );
}
