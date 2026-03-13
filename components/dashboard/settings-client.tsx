"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createFAQAction, deleteFAQAction } from "@/actions/message-actions";
import { toast } from "@/hooks/use-toast";
import { Zap, Plus, Trash2, Bot, Building, User, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  isActive: boolean;
  hits: number;
};

interface SettingsClientProps {
  user: { name: string; email: string };
  hotel: { name: string; location: string; phone: string; email: string };
  faqs: FAQ[];
}

const QUICK_TEMPLATES = [
  { q: "What are your check-in and check-out times?", a: "Check-in is at 2:00 PM and check-out is at 12:00 PM (noon). Early check-in and late check-out may be available on request.", k: ["check-in", "checkin", "check-out", "checkout", "time"] },
  { q: "Is breakfast included?", a: "Breakfast is included in our Deluxe and Suite rooms. For Standard rooms, it can be added for $15 per person per day.", k: ["breakfast", "food", "meal", "included"] },
  { q: "Do you offer airport transfer?", a: "Yes! We offer airport transfers. Please let us know your flight details and we'll arrange everything.", k: ["airport", "transfer", "pickup", "taxi"] },
  { q: "Where are you located?", a: "We're centrally located. We'll send you our exact address and Google Maps link upon booking confirmation.", k: ["location", "address", "where", "directions"] },
  { q: "What payment methods do you accept?", a: "We accept bank transfer, credit/debit cards, and cash upon arrival. A 30% deposit is required to confirm your booking.", k: ["payment", "pay", "deposit", "credit card"] },
];

export function SettingsClient({ user, hotel, faqs: initialFaqs }: SettingsClientProps) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [activeTab, setActiveTab] = useState<"hotel" | "faqs" | "automation">("faqs");
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", keywords: "" });
  const [addingFaq, setAddingFaq] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  async function handleAddFaq() {
    if (!newFaq.question || !newFaq.answer) return;
    setAddingFaq(true);

    const result = await createFAQAction({
      question: newFaq.question,
      answer: newFaq.answer,
      keywords: newFaq.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    });

    if (result.success && result.faq) {
      setFaqs((prev) => [...prev, result.faq as any]);
      setNewFaq({ question: "", answer: "", keywords: "" });
      toast({ title: "FAQ added!" });
    }
    setAddingFaq(false);
  }

  async function handleDeleteFaq(id: string) {
    await deleteFAQAction(id);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast({ title: "FAQ deleted" });
  }

  async function addTemplate(t: typeof QUICK_TEMPLATES[0]) {
    const result = await createFAQAction({ question: t.q, answer: t.a, keywords: t.k });
    if (result.success && result.faq) {
      setFaqs((prev) => [...prev, result.faq as any]);
      toast({ title: "Template added!" });
    }
  }

  const tabs = [
    { id: "faqs", label: "Auto-Reply FAQs", icon: Bot },
    { id: "hotel", label: "Hotel Profile", icon: Building },
    { id: "automation", label: "Automation", icon: Zap },
  ] as const;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure your hotel and automation settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* FAQs Tab */}
      {activeTab === "faqs" && (
        <div className="space-y-5">
          {/* Quick templates */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Quick Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-slate-500 mb-3">Click to add pre-built FAQ templates</p>
              <div className="grid grid-cols-1 gap-2">
                {QUICK_TEMPLATES.filter((t) => !faqs.some((f) => f.question === t.q)).map((template, i) => (
                  <button
                    key={i}
                    onClick={() => addTemplate(template)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-left transition-all"
                  >
                    <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700">{template.q}</p>
                    </div>
                  </button>
                ))}
                {QUICK_TEMPLATES.every((t) => faqs.some((f) => f.question === t.q)) && (
                  <p className="text-xs text-slate-500 text-center py-2">All templates added ✓</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing FAQs */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Your FAQs ({faqs.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div
                    className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  >
                    <Bot className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="flex-1 text-sm font-medium text-slate-800">{faq.question}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{faq.hits} hits</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFaq(faq.id); }}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedFaq === faq.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </div>
                  {expandedFaq === faq.id && (
                    <div className="px-3.5 pb-3.5 pt-0">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                        {faq.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {faq.keywords.map((k) => (
                              <span key={k} className="text-xs px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                                {k}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add new FAQ */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 space-y-3 mt-3">
                <p className="text-xs font-semibold text-slate-700">Add custom FAQ</p>
                <Input
                  placeholder="Question (e.g. Do you have a swimming pool?)"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  className="text-sm"
                />
                <textarea
                  placeholder="Answer..."
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
                <Input
                  placeholder="Keywords (comma-separated): pool, swim, water"
                  value={newFaq.keywords}
                  onChange={(e) => setNewFaq({ ...newFaq, keywords: e.target.value })}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleAddFaq}
                  disabled={addingFaq || !newFaq.question || !newFaq.answer}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {addingFaq ? "Adding..." : "Add FAQ"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hotel Profile Tab */}
      {activeTab === "hotel" && (
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">Hotel Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Hotel Name</Label>
                <Input defaultValue={hotel.name} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input defaultValue={hotel.location} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input defaultValue={hotel.phone} placeholder="+1 234 567 890" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input defaultValue={hotel.email} placeholder="info@hotel.com" />
              </div>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Automation Tab */}
      {activeTab === "automation" && (
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Automation Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {[
                { label: "Auto-reply to FAQ matches", desc: "Automatically send answers to common questions", enabled: true },
                { label: "Welcome message for new guests", desc: "Send a welcome message when a new guest contacts you", enabled: true },
                { label: "Booking confirmation emails", desc: "Send email confirmation when booking is confirmed", enabled: false },
                { label: "Payment reminder after 24h", desc: "Remind guests about pending payment", enabled: false },
              ].map((rule) => (
                <div key={rule.label} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{rule.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{rule.desc}</p>
                  </div>
                  <Switch defaultChecked={rule.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
