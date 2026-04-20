import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldAlert, CheckCircle2, XCircle, Mail, Phone, MapPin } from "lucide-react";
import { SERVICES_LIST, getService } from "@/lib/servicesData";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [qualFilter, setQualFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    document.title = "Admin — HomeFixr Leads";
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setChecked(true));
  }, []);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 500),
    enabled: user?.role === "admin"
  });

  if (!checked) {
    return <div className="py-32 text-center text-muted-foreground">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="py-20 md:py-32">
        <div className="max-w-md mx-auto px-5 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-3">Admin access required</h1>
          <p className="text-muted-foreground">This dashboard is only available to HomeFixr admins.</p>
        </div>
      </div>
    );
  }

  const filtered = leads.filter(l => {
    if (serviceFilter !== "all" && l.service !== serviceFilter) return false;
    if (qualFilter === "qualified" && !l.qualified) return false;
    if (qualFilter === "disqualified" && l.qualified) return false;
    if (dateFilter !== "all") {
      const d = new Date(l.created_date);
      const now = new Date();
      const days = (now - d) / (1000 * 60 * 60 * 24);
      if (dateFilter === "today" && days > 1) return false;
      if (dateFilter === "week" && days > 7) return false;
      if (dateFilter === "month" && days > 30) return false;
    }
    return true;
  });

  const stats = {
    total: leads.length,
    qualified: leads.filter(l => l.qualified).length,
    disqualified: leads.filter(l => !l.qualified).length,
    conversion: leads.length ? Math.round((leads.filter(l => l.qualified).length / leads.length) * 100) : 0
  };

  return (
    <div className="py-10 md:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="mb-10">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">Admin</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Leads dashboard</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total leads" value={stats.total} />
          <StatCard label="Qualified" value={stats.qualified} color="text-secondary" />
          <StatCard label="Disqualified" value={stats.disqualified} color="text-muted-foreground" />
          <StatCard label="Qualification rate" value={`${stats.conversion}%`} />
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-52 rounded-full bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {SERVICES_LIST.map(s => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={qualFilter} onValueChange={setQualFilter}>
            <SelectTrigger className="w-48 rounded-full bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="qualified">Qualified only</SelectItem>
              <SelectItem value="disqualified">Disqualified only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40 rounded-full bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Last 24h</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-center py-20 text-muted-foreground">Loading leads...</p>
        ) : filtered.length === 0 ? (
          <Card className="p-16 text-center text-muted-foreground">No leads match your filters.</Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(lead => <LeadRow key={lead.id} lead={lead} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "" }) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`font-display text-3xl font-semibold mt-1.5 ${color}`}>{value}</p>
    </div>
  );
}

function LeadRow({ lead }) {
  const service = getService(lead.service);
  return (
    <div className="bg-card rounded-2xl p-5 md:p-6 border border-border shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${lead.qualified ? 'bg-secondary/10' : 'bg-muted'}`}>
            {lead.qualified ? <CheckCircle2 className="w-5 h-5 text-secondary" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-semibold text-base">{lead.full_name}</p>
              {lead.qualified ? (
                <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/10 border-0">Qualified</Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground">Disqualified</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {service?.name || lead.service} · {format(new Date(lead.created_date), "MMM d, yyyy h:mm a")}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {lead.email}</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {lead.phone}</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {lead.zip_code}</span>
            </div>
            {!lead.qualified && lead.disqualification_reason && (
              <p className="text-xs text-destructive mt-2">Reason: {lead.disqualification_reason}</p>
            )}
          </div>
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground text-xs">View details</summary>
          <pre className="mt-3 p-3 bg-muted rounded-lg text-xs overflow-auto max-w-md">
{JSON.stringify({ timeline: lead.timeline, budget: lead.budget, best_time: lead.best_time, details: lead.service_details }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}