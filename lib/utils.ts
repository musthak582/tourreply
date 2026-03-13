import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function formatTime(date: Date | string) {
  return format(new Date(date), "h:mm a");
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function getNights(checkIn: Date | string, checkOut: Date | string) {
  return differenceInDays(new Date(checkOut), new Date(checkIn));
}

export function getBookingStatusColor(status: string) {
  const colors: Record<string, string> = {
    inquiry: "bg-slate-100 text-slate-700",
    interested: "bg-blue-100 text-blue-700",
    requested: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getPaymentStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    partial: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    refunded: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getBookingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    inquiry: "New Inquiry",
    interested: "Interested",
    requested: "Booking Requested",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

export function matchFAQ(message: string, faqs: { question: string; answer: string; keywords: string[] }[]) {
  const lowerMessage = message.toLowerCase();
  
  for (const faq of faqs) {
    // Check keywords
    const hasKeyword = faq.keywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) return faq;
    
    // Check if question words match
    const questionWords = faq.question.toLowerCase().split(" ");
    const matchCount = questionWords.filter(word => 
      word.length > 3 && lowerMessage.includes(word)
    ).length;
    
    if (matchCount >= 2) return faq;
  }
  
  return null;
}

export function generatePaymentLink(bookingId: string, amount: number) {
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${bookingId}?amount=${amount}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
