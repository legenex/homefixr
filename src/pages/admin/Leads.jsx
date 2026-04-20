import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Mail, Phone, MapPin, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICES_LIST, getService } from "@/lib/servicesData";

export default function AdminLeads() {
  useEffect(() => { document.title = "Leads — HomeFixr Admin"; }, []);
  const qc = useQueryClient();

  const [serviceFilter, setServiceFilter] = useState("all");
  const [qualFilter, setQualFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 500),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Lead.update(id, { status }),
    onSuccess: () => qc.invalidateQueries(["admin-leads"]),
  });

  const filtered = leads.filter(l => {
    if (serviceFilter !== "all" && l.service !== serviceFilter) return false;
    if (qualFilter === "qualified" && !l.qualified) return false;
    if (qualFilter === "disqualified" && l.qualified) return false;
    if (dateFilter !== "all") {
      const days = (new Date() - new Date(l.created_date)) / 86400000;
      if (dateFilter === "today" && days > 1) return false;
      if (dateFilter === "week" && days > 7) return false;
      if (dateFilter === "month" && days > 30) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "ZIP", "Service", "Qualified", "Timeline", "Budget", "Status", "Date"];
    const rows = filtered.map(l => [
      l.full_name, l.email, l.phone, l.zip_code,
      getService(l.service)?.name || l.service,
      l.qualified ? "Yes" : "No",
      l.timeline, l.budget, l.status,
      format(new Date(l.created_date), "yyyy-MM-dd HH:mm")
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ""}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `homefixr-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const STATUS_COLORS = {
    new: "bg-blue-500/10 text-blue-300",
    contacted: "bg-yellow-500/10 text-yellow-300",
    matched: "bg-secondary/10 text-secondary",
    closed: "bg-white/10 text-white/40",
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leads</h1>
          <p className="text-white/40 text-sm mt-0.5">{filtered.length} of {leads.length} leads</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 rounded-xl text-sm text-white transition-colors border border-white/10">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-52 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="All services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {SERVICES_LIST.map(s => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={qualFilter} onValueChange={setQualFilter}>
          <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="disqualified">Disqualified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Last 24h</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads table */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-white/30">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/30">No leads match your filters.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(lead => (
              <div key={lead.id}>
                <div
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-white/3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                >
                  <div className="flex items-center gap-3">
                    {lead.qualified
                      ? <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-white/30 flex-shrink-0" />
                    }
                    <div>
                      <p className="text-sm font-medium text-white">{lead.full_name}</p>
                      <p className="text-xs text-white/40">{getService(lead.service)?.name} · {format(new Date(lead.created_date), "MMM d, yyyy h:mm a")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                      {lead.status}
                    </span>
                    {expandedId === lead.id ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </div>
                </div>
                {expandedId === lead.id && (
                  <div className="px-5 pb-5 bg-white/3 border-t border-white/5">
                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2 text-sm">
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Contact</p>
                        <p className="flex items-center gap-2 text-white/70"><Mail className="w-3.5 h-3.5" /> {lead.email}</p>
                        <p className="flex items-center gap-2 text-white/70"><Phone className="w-3.5 h-3.5" /> {lead.phone}</p>
                        <p className="flex items-center gap-2 text-white/70"><MapPin className="w-3.5 h-3.5" /> {lead.zip_code}</p>
                        <p className="text-white/50 mt-2">Timeline: <span className="text-white">{lead.timeline}</span></p>
                        <p className="text-white/50">Budget: <span className="text-white">{lead.budget}</span></p>
                        <p className="text-white/50">Best time: <span className="text-white">{lead.best_time}</span></p>
                        {!lead.qualified && lead.disqualification_reason && (
                          <p className="text-red-400 text-xs mt-2">Disqualified: {lead.disqualification_reason}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Project details</p>
                        <pre className="text-xs text-white/50 bg-black/20 rounded-lg p-3 overflow-auto">
                          {JSON.stringify(lead.service_details || {}, null, 2)}
                        </pre>
                        <div className="mt-4">
                          <p className="text-white/40 text-xs mb-2">Update status</p>
                          <div className="flex flex-wrap gap-2">
                            {["new", "contacted", "matched", "closed"].map(s => (
                              <button
                                key={s}
                                onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: lead.id, status: s }); }}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                                  lead.status === s
                                    ? "bg-secondary text-secondary-foreground border-transparent"
                                    : "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}