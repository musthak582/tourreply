"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  Settings,
  CheckCircle2,
  Circle,
  ArrowRight,
  CalendarCheck,
  BarChart3,
  DollarSign,
  Mail,
  Loader2,
} from "lucide-react";

const TIMELINE = [
  {
    label: "Infrastructure upgrade",
    desc: "Servers migrated to faster hardware",
    state: "done",
  },
  {
    label: "Database optimisation",
    desc: "Query performance improved across all endpoints",
    state: "done",
  },
  {
    label: "Final testing & QA",
    desc: "Running end-to-end checks — in progress",
    state: "active",
  },
  {
    label: "Go live",
    desc: "All systems green — coming soon",
    state: "pending",
  },
];

const FEATURES = [
  { icon: MessageSquare, label: "WhatsApp inbox" },
  { icon: CalendarCheck, label: "Booking pipeline" },
  { icon: DollarSign,    label: "Payment links"   },
  { icon: BarChart3,     label: "Analytics"       },
];

const spinStyle: React.CSSProperties = {
  animation: "spinSlow 14s linear infinite",
};

const spinReverseStyle: React.CSSProperties = {
  animation: "spinSlow 9s linear infinite reverse",
};

export function MaintenanceClient() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1400));
    setStatus("done");
  }

  return (
    <>
      <style>{`
        @keyframes spinSlow {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 flex flex-col items-center justify-center px-4 py-16">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-300">
            <MessageSquare className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            TourReply
          </span>
        </div>

        {/* Animated gear */}
        <div className="relative w-28 h-28 mb-8 select-none">
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-200"
            style={spinStyle}
          />
          <div className="absolute inset-[18px] rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Settings
              className="w-9 h-9 text-emerald-600"
              style={spinReverseStyle}
            />
          </div>
        </div>

        {/* Status badge */}
        <Badge
          variant="outline"
          className="mb-5 gap-2 px-3 py-1.5 rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          System improvement in progress
        </Badge>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-center leading-tight mb-3">
          We&apos;re making TourReply
          <br className="hidden sm:block" />
          even better for you
        </h1>
        <p className="text-slate-500 text-base text-center leading-relaxed max-w-md mb-8">
          Our team is working on technical improvements to deliver a faster, more
          reliable experience. We&apos;ll notify you the moment we&apos;re back online.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {label}
            </div>
          ))}
        </div>

        {/* Notify card */}
        <Card className="w-full max-w-sm mb-6 shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              Get notified when we&apos;re back
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Enter your email and we&apos;ll message you the moment TourReply goes live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "done" ? (
              <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-sm font-medium text-emerald-800">
                  You&apos;re on the list — we&apos;ll email you when we go live!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setStatus("idle");
                      }}
                      className={`pl-9 text-sm h-9 ${
                        status === "error"
                          ? "border-red-300 focus-visible:ring-red-200"
                          : ""
                      }`}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={status === "loading"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 gap-1.5 shrink-0"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        Notify me
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </Button>
                </div>
                {status === "error" && (
                  <p className="text-xs text-red-500">
                    Please enter a valid email address.
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>

        {/* Timeline card */}
        <Card className="w-full max-w-sm shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              What we&apos;re working on
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                {item.state === "done" ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                ) : item.state === "active" ? (
                  <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Circle className="w-2.5 h-2.5 text-slate-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${
                    item.state === "pending" ? "text-slate-400" : "text-slate-800"
                  }`}>
                    {item.label}
                  </p>
                  <p className={`text-xs mt-0.5 leading-relaxed ${
                    item.state === "pending" ? "text-slate-300" : "text-slate-500"
                  }`}>
                    {item.desc}
                  </p>
                </div>

                {item.state === "done" && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0 mt-0.5">
                    Done
                  </span>
                )}
                {item.state === "active" && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shrink-0 mt-0.5">
                    In progress
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-xs text-slate-400 text-center">
          Questions?{" "}
          
            href="mailto:support@tourreply.com"
            className="text-emerald-600 hover:underline"
          >
            support@tourreply.com
          </a>
          {" "}· Powered by{" "}
          <span className="font-medium text-slate-500">TourReply</span>
        </p>

      </div>
    </>
  );
}
