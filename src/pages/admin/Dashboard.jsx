import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { BarChart2, TrendingUp, Users, CheckCircle2, XCircle, ArrowRight, Clock } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SERVICES_LIST, getService } from "@/lib/servicesData";

export default function AdminDashboard() {
  useEffect(() => { document.title = "Dashboard — HomeFixr Admin"; }, []);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 500),
  });

  const now = new Date();
  const last30 = leads.filter(l => isAfter(new Date(l.created_date), subDays(now, 30)));
  const last7 = leads.filter(l => isAfter(new Date(l.created_date), subDays(now, 7)));
  const qualified = leads.filter(l => l.qualified);
  const qRate = leads.length ? Math.round((qualified.length / leads.length) * 100) : 0;

  // Leads by day (last 14 days)
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(now, 13 - i);
    const dayStr = format(day, "MMM d");
    const dayLeads = leads.filter(l => format(new Date(l.created_date), "MMM d") === dayStr);
    return { day: dayStr, total: dayLeads.length, qualified: dayLeads.filter(l => l.qualified).length };
  });

  // By service
  const byService = SERVICES_LIST.map(s => ({
    name: s.short,
    count: leads.filter(l => l.service === s.slug).length,
  })).sort((a, b) => b.count - a.count);

  const stats = [
    { label: "Total leads", value: leads.length, sub: `${last7.length} this week`, icon: Users },
    { label: "Qualified", value: qualified.length, sub: `${qRate}% rate`, icon: CheckCircle2 },
    { label: "Last 30 days", value: last30.length, sub: "leads", icon: TrendingUp },
    { label: "Disqualified", value: leads.length - qualified.length, sub: "need follow-up", icon: XCircle },
  ];

  const recent = leads.slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">HomeFixr lead generation overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/8">
              <div className="flex items-start justify-between mb-3">
                <Icon className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-3xl font-semibold text-white">{isLoading ? "—" : s.value}</p>
              <p className="text-xs text-white/40 mt-1">{s.label}</p>
              <p className="text-xs text-secondary/80 mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/8">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Leads — last 14 days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a2235", border: "none", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="total" fill="rgba(232,136,72,0.25)" radius={[4,4,0,0]} name="Total" />
              <Bar dataKey="qualified" fill="#e88848" radius={[4,4,0,0]} name="Qualified" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By service */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/8">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Leads by service</h2>
          <div className="space-y-3">
            {byService.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{s.name}</span>
                    <span className="text-white font-medium">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{ width: leads.length ? `${(s.count / leads.length) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent leads */}
      <div className="bg-white/5 rounded-2xl border border-white/8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-sm font-semibold text-white/80">Recent leads</h2>
          <Link to="/admin/leads" className="text-xs text-secondary hover:underline flex items-center gap-1">All leads <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {isLoading ? (
          <div className="py-10 text-center text-white/30 text-sm">Loading...</div>
        ) : recent.length === 0 ? (
          <div className="py-10 text-center text-white/30 text-sm">No leads yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {recent.map(lead => (
              <div key={lead.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${lead.qualified ? "bg-secondary" : "bg-white/20"}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{lead.full_name}</p>
                    <p className="text-xs text-white/40">{getService(lead.service)?.name} · {lead.zip_code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${lead.qualified ? "text-secondary" : "text-white/30"}`}>
                    {lead.qualified ? "Qualified" : "Disqualified"}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {format(new Date(lead.created_date), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}