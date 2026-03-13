"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Landmark, CheckCircle, Loader2, Lock } from "lucide-react";

type Method = "card" | "bank";

interface Props {
  bookingId: string;
  amount: number;
  guestName: string;
  hotelName: string;
}

export function PaymentPageClient({ bookingId, amount, guestName, hotelName }: Props) {
  const [method, setMethod]   = useState<Method>("card");
  const [step, setStep]       = useState<"form" | "processing" | "success">("form");
  const [card, setCard]       = useState({ number: "", expiry: "", cvv: "", name: guestName });
  const [errors, setErrors]   = useState<Record<string, string>>({});

  /* ── format card number ── */
  function formatCardNumber(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  /* ── validate ── */
  function validate() {
    const e: Record<string, string> = {};
    if (method === "card") {
      const digits = card.number.replace(/\s/g, "");
      if (digits.length < 16) e.number = "Enter a valid 16-digit card number";
      if (!card.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "Enter expiry as MM/YY";
      if (card.cvv.length < 3) e.cvv = "Enter 3 or 4 digit CVV";
      if (!card.name.trim()) e.name = "Enter cardholder name";
    }
    return e;
  }

  /* ── submit ── */
  async function handlePay() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep("processing");

    // Simulate payment processing (2 seconds)
    // In production: call Stripe / payment gateway here
    await new Promise(r => setTimeout(r, 2000));

    // Mark booking as paid via API
    try {
      await fetch(`/api/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount }),
      });
    } catch (_) {
      // still show success for demo
    }

    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
        <p className="text-slate-500 text-sm mb-4">
          Thank you, {guestName}. Your deposit of{" "}
          <span className="font-semibold text-slate-800">{formatCurrency(amount)}</span>{" "}
          has been received.
        </p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          <p className="font-semibold mb-1">{hotelName}</p>
          <p>Your booking is now <strong>confirmed</strong>. A confirmation message will be sent to you via WhatsApp shortly.</p>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Reference: <span className="font-mono">{bookingId.slice(0, 8).toUpperCase()}</span>
        </p>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-800">Processing payment…</p>
        <p className="text-xs text-slate-400 mt-1">Please don't close this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Method selector */}
      <div>
        <p className="text-xs font-semibold text-slate-600 mb-2">Payment method</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "card" as Method,  label: "Credit / Debit",  icon: CreditCard  },
            { id: "bank" as Method,  label: "Bank Transfer",   icon: Landmark    },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                ${method === m.id
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <m.icon className={`w-4 h-4 ${method === m.id ? "text-emerald-600" : "text-slate-400"}`} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card form */}
      {method === "card" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Cardholder name</Label>
            <Input
              value={card.name}
              onChange={e => setCard({ ...card, name: e.target.value })}
              placeholder="As it appears on your card"
              className={errors.name ? "border-red-300 focus-visible:ring-red-300" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Card number</Label>
            <div className="relative">
              <Input
                value={card.number}
                onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                placeholder="1234 5678 9012 3456"
                className={`pr-10 font-mono ${errors.number ? "border-red-300 focus-visible:ring-red-300" : ""}`}
              />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {errors.number && <p className="text-xs text-red-500">{errors.number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Expiry</Label>
              <Input
                value={card.expiry}
                onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                placeholder="MM/YY"
                className={`font-mono ${errors.expiry ? "border-red-300 focus-visible:ring-red-300" : ""}`}
              />
              {errors.expiry && <p className="text-xs text-red-500">{errors.expiry}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>CVV</Label>
              <Input
                value={card.cvv}
                onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                placeholder="123"
                type="password"
                className={`font-mono ${errors.cvv ? "border-red-300 focus-visible:ring-red-300" : ""}`}
              />
              {errors.cvv && <p className="text-xs text-red-500">{errors.cvv}</p>}
            </div>
          </div>

          {/* Demo hint */}
          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
            <span className="font-semibold">Demo:</span> use any details — no real charge will be made.
          </p>
        </div>
      )}

      {/* Bank transfer instructions */}
      {method === "bank" && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-blue-800">Bank Transfer Details</p>
          <div className="space-y-2 text-sm">
            {[
              { label: "Account name",   value: hotelName           },
              { label: "Bank",           value: "BCA – Central Bank" },
              { label: "Account number", value: "1234-5678-90"       },
              { label: "Amount",         value: formatCurrency(amount) },
              { label: "Reference",      value: bookingId.slice(0, 8).toUpperCase() },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-blue-600">{row.label}</span>
                <span className="font-semibold text-blue-900 font-mono text-xs">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            After transferring, click confirm below. The hotel will verify and confirm your booking.
          </p>
        </div>
      )}

      {/* Pay button */}
      <button
        onClick={handlePay}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700
          text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-200 text-sm"
      >
        <Lock className="w-4 h-4" />
        {method === "card"
          ? `Pay ${formatCurrency(amount)} securely`
          : `Confirm bank transfer of ${formatCurrency(amount)}`
        }
      </button>
    </div>
  );
}
