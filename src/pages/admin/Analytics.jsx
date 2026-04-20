import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, subDays, isAfter } from "date-fns";
import { SERVICES_LIST, getService } from "@/lib/servicesData";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend
} from "recharts";

const COLORS = ["#e88848", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function Analytics() {
  useEffect(() => { document.title = "Analytics — HomeFixr Admin"; }, []);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 500),
  });

  const now = new Date();

  // Leads by day last 30
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(now, 29 - i);
    const label = format(day, "MMM d");
    const dayLeads = leads.filter(l => format(new Date(l.created_date), "MMM d") === label);
    return { day: label, total: dayLeads.length, qualified: dayLeads.filter(l => l.qualified).length };
  });

  // By service (pie)
  const byService = SERVICES_LIST.map((s, i) => ({
    name: s.short,
    value: leads.filter(l => l.service === s.slug).length,
    color: COLORS[i % COLORS.length],
  })).filter(s => s.value > 0);

  // By timeline
  const timelines = ["asap", "1-3-months", "3-6-months", "researching"].map(t => ({
    name: t === "asap" ? "ASAP" : t === "1-3-months" ? "1–3 mo" : t === "3-6-months" ? "3–6 mo" : "Researching",
    count: leads.filter(l => l.timeline === t).length,
  }));

  // By budget (top services)
  const budgetData = ["25k-50k", "10k-25k", "5k-15k", "50k-100k", "100k-plus"].map(b => ({
    name: b,
    count: leads.filter(l => l.budget === b).length,
  })).filter(b => b.count > 0);

  const qRate = leads.length ? Math.round((leads.filter(l => l.qualified).length / leads.length) * 100) : 0;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Lead trends, funnel performance, and service breakdown</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-white/30">Loading analytics...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total leads", value: leads.length },
              { label: "Qualified", value: leads.filter(l => l.qualified).length },
              { label: "Qualification rate", value: `${qRate}%` },
              { label: "Last 30 days", value: leads.filter(l => isAfter(new Date(l.created_date), subDays(now, 30))).length },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/8">
                <p className="text-3xl font-semibold text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Volume chart */}
          <div className="bg-white/5 rounded-2xl border border-white/8 p-6">
            <h2 className="text-sm font-semibold text-white/80 mb-4">Daily lead volume — last 30 days</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e88848" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e88848" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a2235", border: "none", borderRadius: 8, color: "#fff" }} />
                <Area type="monotone" dataKey="total" stroke="#e88848" strokeWidth={2} fill="url(#totalGrad)" name="Total" />
                <Area type="monotone" dataKey="qualified" stroke="#f97316" strokeWidth={2} fill="none" name="Qualified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* By service */}
            <div className="bg-white/5 rounded-2xl border border-white/8 p-6">
              <h2 className="text-sm font-semibold text-white/80 mb-4">Leads by service</h2>
              {byService.length === 0 ? (
                <p className="text-white/30 text-sm">No data yet</p>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={byService} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
                        {byService.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {byService.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-white/60">
                          <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                          {s.name}
                        </span>
                        <span className="text-white font-medium">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* By timeline */}
            <div className="bg-white/5 rounded-2xl border border-white/8 p-6">
              <h2 className="text-sm font-semibold text-white/80 mb-4">Leads by timeline</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={timelines} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: "#1a2235", border: "none", borderRadius: 8, color: "#fff" }} />
                  <Bar dataKey="count" fill="#e88848" radius={[0, 4, 4, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}