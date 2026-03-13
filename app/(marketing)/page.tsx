import Link from "next/link";
import {
  MessageSquare,
  Zap,
  CalendarCheck,
  Users,
  BarChart3,
  ArrowRight,
  Check,
  Star,
  Globe,
  Clock,
  Shield,
  Bot,
  BedDouble,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">TourReply</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">WhatsApp automation for hotels &amp; villas</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
            Stop losing bookings to{" "}
            <span className="text-emerald-600">slow replies</span>
          </h1>

          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            TourReply automates your WhatsApp inquiries, captures booking details, and converts conversations into confirmed reservations — while you sleep.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
            >
              Start free — no credit card
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-all hover:bg-slate-50"
            >
              View demo dashboard
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <div className="flex -space-x-2">
              {["A", "B", "C", "D"].map((l) => (
                <div key={l} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-sm text-slate-600">Loved by <strong>500+</strong> hotels worldwide</span>
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
            {/* Mock browser bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-slate-500 text-center">
                app.tourreply.com/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="bg-slate-50 p-6">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Conversations", value: "124", color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Bookings", value: "38", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Revenue", value: "$12,480", color: "text-violet-600", bg: "bg-violet-50" },
                  { label: "Guests", value: "89", color: "text-orange-600", bg: "bg-orange-50" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                      <div className={`w-3 h-3 rounded-sm ${s.color} bg-current opacity-60`} />
                    </div>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-700 mb-3">Recent Conversations</p>
                  {[
                    { name: "Sarah Johnson", msg: "I'd like to book the Garden Suite...", time: "2m", dot: "bg-emerald-400" },
                    { name: "Marcus Weber", msg: "Do you have airport pickup?", time: "15m", dot: "bg-blue-400" },
                    { name: "Priya Sharma", msg: "What's the price for 5 nights?", time: "1h", dot: "bg-amber-400" },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-500 truncate">{c.msg}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        <span className="text-xs text-slate-400">{c.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-700 mb-3">Booking Pipeline</p>
                  {[
                    { status: "Confirmed", count: 12, color: "bg-emerald-400" },
                    { status: "Requested", count: 5, color: "bg-amber-400" },
                    { status: "Interested", count: 8, color: "bg-blue-400" },
                    { status: "Inquiry", count: 18, color: "bg-slate-300" },
                  ].map((s) => (
                    <div key={s.status} className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-xs text-slate-600 flex-1">{s.status}</span>
                      <span className="text-xs font-semibold text-slate-800">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Hotels lose bookings every day because of this
          </h2>
          <p className="text-slate-600 mb-12 max-w-xl mx-auto">
            Guests expect instant replies. When they don't hear back fast, they book elsewhere.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "Slow Response Time", desc: "67% of travelers book with the first hotel that replies. Every hour of delay costs you money.", color: "text-red-500 bg-red-50" },
              { icon: MessageSquare, title: "Repetitive Questions", desc: "Your team answers the same 10 questions 50 times a day. That's wasted time and energy.", color: "text-amber-500 bg-amber-50" },
              { icon: Users, title: "No Guest Tracking", desc: "Bookings scattered across WhatsApp, email, and notebooks. No single source of truth.", color: "text-blue-500 bg-blue-50" },
            ].map((p) => (
              <div key={p.title} className="bg-white rounded-2xl border border-slate-200 p-6 text-left">
                <div className={`w-10 h-10 rounded-xl ${p.color.split(" ")[1]} flex items-center justify-center mb-4`}>
                  <p.icon className={`w-5 h-5 ${p.color.split(" ")[0]}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to run your hotel inbox
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              From first inquiry to confirmed booking — TourReply handles the entire conversation workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Bot,
                title: "Smart Auto-Replies",
                desc: "Configure FAQ answers once. TourReply automatically detects guest questions and replies instantly — 24/7.",
                color: "bg-emerald-50 text-emerald-600",
                tag: "Most popular",
              },
              {
                icon: MessageSquare,
                title: "Unified Inbox",
                desc: "All your WhatsApp conversations in one beautiful dashboard. Conversation history, guest info, and quick replies.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: CalendarCheck,
                title: "Booking Pipeline",
                desc: "Visual Kanban board to track every inquiry from first contact to confirmed booking and payment.",
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: BedDouble,
                title: "Room Inventory",
                desc: "Manage all your rooms, prices, and availability. Automatically check dates when guests ask.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: DollarSign,
                title: "Payment Links",
                desc: "Generate deposit payment links and send them in chat. Mark bookings as paid when received.",
                color: "bg-rose-50 text-rose-600",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                desc: "Track inquiries, conversion rates, revenue, and top FAQ questions with beautiful charts.",
                color: "bg-teal-50 text-teal-600",
              },
            ].map((f) => (
              <div key={f.title} className="relative rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
                {f.tag && (
                  <span className="absolute top-4 right-4 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {f.tag}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl ${f.color.split(" ")[0]} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color.split(" ")[1]}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How TourReply works</h2>
          <p className="text-slate-600 mb-16 max-w-xl mx-auto">Set up once, automate forever</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Connect WhatsApp", desc: "Link your hotel's WhatsApp number to TourReply in minutes." },
              { step: "02", title: "Configure FAQs", desc: "Add your common questions and answers. TourReply learns your hotel." },
              { step: "03", title: "Auto-reply starts", desc: "Guests get instant, accurate replies to their questions 24/7." },
              { step: "04", title: "Manage bookings", desc: "Track all inquiries and bookings in your pipeline dashboard." },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-0 h-px bg-slate-300 border-t border-dashed border-slate-300" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold mb-4 relative z-10">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-slate-600">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-600 mb-12 max-w-lg mx-auto">
            Start free, upgrade when you're ready. No hidden fees, no contracts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "forever",
                desc: "Perfect for solo guesthouses",
                features: ["Up to 50 conversations/mo", "5 FAQ auto-replies", "Basic booking pipeline", "1 hotel"],
                cta: "Get started",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$49",
                period: "/month",
                desc: "For growing hotels & villas",
                features: ["Unlimited conversations", "Unlimited FAQs", "Full booking pipeline", "Payment links", "Analytics dashboard", "Guest CRM", "Priority support"],
                cta: "Start free trial",
                highlighted: true,
              },
              {
                name: "Agency",
                price: "$149",
                period: "/month",
                desc: "For property managers",
                features: ["Everything in Pro", "Up to 10 hotels", "Team members", "White-label option", "API access", "Dedicated support"],
                cta: "Contact sales",
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 text-left relative ${
                  plan.highlighted
                    ? "border-emerald-300 bg-emerald-600 text-white shadow-xl shadow-emerald-200"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute top-4 right-4 text-xs font-semibold bg-white text-emerald-700 px-2 py-0.5 rounded-full">
                    Most popular
                  </span>
                )}
                <p className={`text-sm font-semibold mb-1 ${plan.highlighted ? "text-emerald-100" : "text-slate-600"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-1 ${plan.highlighted ? "text-emerald-200" : "text-slate-500"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-xs mb-5 ${plan.highlighted ? "text-emerald-200" : "text-slate-500"}`}>
                  {plan.desc}
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${plan.highlighted ? "text-emerald-200" : "text-emerald-500"}`} />
                      <span className={`text-sm ${plan.highlighted ? "text-emerald-50" : "text-slate-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-all ${
                    plan.highlighted
                      ? "bg-white text-emerald-700 hover:bg-emerald-50"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Loved by hotel owners worldwide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Wayan Sudarta",
                role: "Owner, Villa Nirwana Bali",
                review: "TourReply saved us 3+ hours per day. Our response time went from hours to seconds. Bookings increased by 40% in the first month.",
              },
              {
                name: "Maria Santos",
                role: "Manager, Casa Bonita Cartagena",
                review: "The automated FAQ replies are a game changer. Guests get instant answers, and I only step in for real conversations. Incredible tool.",
              },
              {
                name: "Ahmed Hassan",
                role: "Owner, Dahab Divers Hotel",
                review: "Finally a booking management tool built for small hotels. The WhatsApp inbox plus Kanban pipeline is exactly what we needed.",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-6 text-left">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">&ldquo;{t.review}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              { q: "Does TourReply work with my existing WhatsApp?", a: "Yes! TourReply connects to your existing WhatsApp Business account via the official WhatsApp Business API. Setup takes less than 10 minutes." },
              { q: "How does the auto-reply work?", a: "You configure FAQ answers in your dashboard. When a guest sends a message, TourReply scans it for keywords and sends the matching answer automatically. No AI hallucinations — just your pre-approved answers." },
              { q: "Can I still reply manually?", a: "Absolutely. The inbox lets you see all conversations and reply manually at any time. Auto-replies just handle the repetitive questions so you can focus on real conversations." },
              { q: "Is my data secure?", a: "Yes. All data is encrypted in transit and at rest. We're GDPR compliant and never share your guest data with third parties." },
              { q: "What if I manage multiple properties?", a: "Our Agency plan supports up to 10 hotels under one account, with separate inboxes, rooms, and booking pipelines for each property." },
            ].map((item) => (
              <div key={item.q} className="border border-slate-200 rounded-xl p-5">
                <p className="font-semibold text-slate-900 mb-2">{item.q}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to automate your hotel bookings?
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Join 500+ hotels already using TourReply to reply faster, book more, and stress less.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg"
          >
            Get started for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-emerald-200 text-sm mt-4">No credit card required · Setup in 10 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">TourReply</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 TourReply. Built for hotels, villas & tour operators.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
