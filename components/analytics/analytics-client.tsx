"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  MessageSquare,
  CalendarCheck,
  DollarSign,
  Zap,
  BarChart3,
} from "lucide-react";

interface AnalyticsClientProps {
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    totalConversations: number;
    revenue: number;
    conversionRate: number;
    faqStats: { id: string; question: string; hits: number }[];
    bookingsByStatus: { status: string; _count: number }[];
    monthlyData: {
      month: string;
      bookings: number;
      conversations: number;
      revenue: number;
    }[];
  };
}

const STATUS_COLORS: Record<string, string> = {
  inquiry: "#94a3b8",
  interested: "#60a5fa",
  requested: "#fbbf24",
  confirmed: "#34d399",
  cancelled: "#f87171",
};

export function AnalyticsClient({ stats }: AnalyticsClientProps) {
  const kpis = [
    {
      label: "Total Inquiries",
      value: stats.totalConversations,
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Confirmed Bookings",
      value: stats.confirmedBookings,
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const pieData = stats.bookingsByStatus.map((item) => ({
    name: item.status,
    value: item._count,
    color: STATUS_COLORS[item.status] || "#94a3b8",
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Performance overview for your hotel</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bookings over time */}
        <Card className="col-span-2 border-slate-200 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-slate-900">Bookings & Conversations (6 months)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} name="Bookings" />
                <Line type="monotone" dataKey="conversations" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: "#60a5fa" }} name="Conversations" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking status breakdown */}
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-slate-900">Booking Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-600 flex-1 capitalize">{item.name}</span>
                      <span className="text-xs font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-xs text-slate-400">No bookings yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart + FAQ */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart */}
        <Card className="col-span-2 border-slate-200 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-slate-900">Revenue (6 months)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* FAQ hits */}
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-sm font-semibold text-slate-900">Top FAQ Questions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {stats.faqStats.length > 0 ? (
              stats.faqStats.map((faq, i) => {
                const maxHits = stats.faqStats[0]?.hits || 1;
                return (
                  <div key={faq.id}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-600 line-clamp-1 flex-1">
                        {faq.question.length > 32 ? faq.question.slice(0, 32) + "..." : faq.question}
                      </p>
                      <span className="text-xs font-semibold text-slate-700 ml-2">{faq.hits}</span>
                    </div>
                    <Progress value={(faq.hits / maxHits) * 100} className="h-1.5" />
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-xs text-slate-400">No FAQ data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
