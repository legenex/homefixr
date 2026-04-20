import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  CheckCircle2, XCircle, Mail, MapPin, Download,
  Eye, X, Edit2, Save, DollarSign, RotateCcw, ShoppingCart
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SERVICES_LIST, getService } from "@/lib/servicesData";
import SellManuallyModal from "@/components/distribution/SellManuallyModal";

const STATUS_COLORS = {
  new: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  matched: "bg-secondary/10 text-secondary border-secondary/20",
  closed: "bg-white/5 text-white/30 border-white/10",
};

export default function AdminLeads() {
  useEffect(() => { document.title = "Leads — HomeFixr Admin"; }, []);
  const qc = useQueryClient();

  const [serviceFilter, setServiceFilter] = useState("all");
  const [qualFilter, setQualFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewingLead, setViewingLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [sellModal, setSellModal] = useState(null); // lead to sell manually

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 500),
  });

  const { data: buyers = [] } = useQuery({ queryKey: ["buyers"], queryFn: () => base44.entities.Buyer.list() });

  const updateLead = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries(["admin-leads"]);
      setViewingLead(v => v ? { ...v, ...updated } : null);
      setEditingLead(null);
    },
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
    const headers = ["Name","Email","Phone","ZIP","City","State","Service","Qualified","Timeline","Budget","Status","Date"];
    const rows = filtered.map(l => [
      l.full_name, l.email, l.phone, l.zip_code, l.city || "", l.state || "",
      getService(l.service)?.name || l.service,
      l.qualified ? "Yes" : "No",
      l.timeline, l.budget, l.status,
      format(new Date(l.created_date), "yyyy-MM-dd HH:mm")
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ""}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const openView = (lead) => {
    setViewingLead(lead);
    setEditingLead(null);
  };

  const saveEdit = () => {
    updateLead.mutate({ id: editingLead.id, data: editingLead });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leads</h1>
          <p className="text-white/40 text-sm mt-0.5">{filtered.length} of {leads.length} leads</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 rounded-xl text-sm text-white border border-white/10 transition-colors">
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
            <SelectValue placeholder="All qualifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All qualifications</SelectItem>
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

      {/* Table */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1fr_120px_110px_90px_90px_80px_60px] gap-3 px-5 py-3 border-b border-white/8 text-xs font-semibold uppercase tracking-wider text-white/30">
          <span>Lead</span>
          <span>Location</span>
          <span>Qualification</span>
          <span>Sale</span>
          <span>Buyer</span>
          <span>Price</span>
          <span></span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-white/30">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/30">No leads match your filters.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(lead => (
              <div key={lead.id} className="grid md:grid-cols-[1fr_120px_110px_90px_90px_80px_60px] gap-3 px-5 py-4 items-center hover:bg-white/3 transition-colors">
                {/* Name + service */}
                <div>
                  <p className="text-sm font-medium text-white">{lead.full_name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{getService(lead.service)?.name} · {format(new Date(lead.created_date), "MMM d, yyyy")}</p>
                  <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</p>
                </div>
                {/* Location */}
                <div className="text-xs text-white/50">
                  {lead.city && lead.state ? (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.city}, {lead.state}</span>
                  ) : lead.zip_code ? (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.zip_code}</span>
                  ) : "—"}
                </div>
                {/* Qualification badge */}
                <div>
                  {lead.qualified ? (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Qualified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-white/5 text-white/40 border border-white/10 font-medium">
                      <XCircle className="w-3 h-3" /> Disqual.
                    </span>
                  )}
                </div>
                {/* Sale status */}
                <div>
                  {lead.sale_status === "sold" ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">Sold</span>
                  ) : lead.sale_status === "returned" ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">Returned</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/10 font-medium">Unsold</span>
                  )}
                </div>
                {/* Buyer */}
                <div className="text-xs font-mono text-white/50">{lead.sold_buyer_id || "—"}</div>
                {/* Price */}
                <div className="text-xs text-white/60">{lead.sale_price ? <span className="text-green-400 font-medium">${lead.sale_price}</span> : "—"}</div>
                {/* Actions */}
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => openView(lead)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
                  {lead.sale_status !== "sold" && (
                    <button onClick={() => setSellModal(lead)} className="p-1.5 rounded-lg hover:bg-green-500/10 text-white/20 hover:text-green-400 transition-colors" title="Sell manually"><ShoppingCart className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sell manually modal */}
      {sellModal && (
        <SellManuallyModal
          lead={sellModal}
          buyers={buyers}
          onSell={(patch) => { updateLead.mutate({ id: sellModal.id, data: patch }); setSellModal(null); }}
          onClose={() => setSellModal(null)}
        />
      )}

      {/* Lead detail modal */}
      {viewingLead && (
        <LeadModal
          lead={editingLead || viewingLead}
          viewingLead={viewingLead}
          isEditing={!!editingLead}
          isSaving={updateLead.isPending}
          onEdit={() => setEditingLead({ ...viewingLead })}
          onSave={saveEdit}
          onCancelEdit={() => setEditingLead(null)}
          onChange={patch => setEditingLead(e => ({ ...e, ...patch }))}
          onStatusChange={(val) => updateLead.mutate({ id: viewingLead.id, data: val === "returned" ? { sale_status: "returned" } : { status: val } })}
          onClose={() => { setViewingLead(null); setEditingLead(null); }}
        />
      )}
    </div>
  );
}

function LeadModal({ lead, isEditing, isSaving, onEdit, onSave, onCancelEdit, onChange, onStatusChange, onClose, viewingLead }) {
  const service = getService(lead.service);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141e2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 sticky top-0 bg-[#141e2e] z-10">
          <div>
            <h2 className="text-base font-semibold text-white">{lead.full_name}</h2>
            <p className="text-xs text-white/40">{service?.name} · {format(new Date(lead.created_date), "MMM d, yyyy h:mm a")}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/8 hover:bg-white/12 text-white rounded-lg border border-white/10">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <>
                <button onClick={onCancelEdit} className="px-3 py-1.5 text-xs text-white/50 hover:text-white rounded-lg border border-white/10">Cancel</button>
                <button onClick={onSave} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90">
                  <Save className="w-3.5 h-3.5" /> {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Qual badge */}
          <div className="flex items-center gap-3">
            {lead.qualified ? (
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Qualified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 font-medium">
                <XCircle className="w-4 h-4" /> Disqualified
              </span>
            )}
            {!lead.qualified && lead.disqualification_reason && (
              <span className="text-xs text-white/40">Reason: {lead.disqualification_reason}</span>
            )}
          </div>

          {/* Contact info */}
          <Section title="Contact information">
            <TwoCol>
              <EditField label="Full name" value={lead.full_name} isEditing={isEditing} onChange={v => onChange({ full_name: v })} />
              <EditField label="Phone" value={lead.phone} isEditing={isEditing} onChange={v => onChange({ phone: v })} />
              <EditField label="Email" value={lead.email} isEditing={isEditing} onChange={v => onChange({ email: v })} />
              <EditField label="Best time to call" value={lead.best_time} isEditing={isEditing} onChange={v => onChange({ best_time: v })} />
            </TwoCol>
          </Section>

          {/* Location */}
          <Section title="Location">
            <TwoCol>
              <EditField label="ZIP code" value={lead.zip_code} isEditing={isEditing} onChange={v => onChange({ zip_code: v })} />
              <EditField label="City" value={lead.city || "—"} isEditing={isEditing} onChange={v => onChange({ city: v })} />
              <EditField label="State" value={lead.state || "—"} isEditing={isEditing} onChange={v => onChange({ state: v })} />
            </TwoCol>
          </Section>

          {/* Project */}
          <Section title="Project details">
            <TwoCol>
              <EditField label="Service" value={service?.name || lead.service} isEditing={false} />
              <EditField label="Timeline" value={lead.timeline} isEditing={isEditing} onChange={v => onChange({ timeline: v })} />
              <EditField label="Budget" value={lead.budget} isEditing={isEditing} onChange={v => onChange({ budget: v })} />
              <EditField label="Homeowner" value={lead.is_homeowner ? "Yes" : "No"} isEditing={false} />
            </TwoCol>

            {/* Service-specific answers */}
            {lead.service_details && Object.keys(lead.service_details).length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-white/30 font-semibold uppercase tracking-wider">Quiz answers</p>
                {Object.entries(lead.service_details).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-3 text-sm">
                    <span className="text-white/40 min-w-[120px] capitalize">{k.replace(/_/g, " ")}:</span>
                    <span className="text-white">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Sale info */}
          {viewingLead?.sale_status === "sold" && (
            <Section title="Sale details">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs text-white/30 mb-1">Buyer ID</p>
                  <p className="text-sm text-white font-mono">{lead.sold_buyer_id || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-1">Sale price</p>
                  {isEditing ? (
                    <Input type="number" value={lead.sale_price || ""} onChange={e => onChange({ sale_price: parseFloat(e.target.value) || 0 })} className="bg-white/5 border-white/10 text-white rounded-lg h-9 w-28 text-sm" />
                  ) : (
                    <p className="text-sm text-green-400 font-medium">${lead.sale_price || 0}</p>
                  )}
                </div>
                {!isEditing && (
                  <button
                    onClick={() => onStatusChange("returned")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 mt-4"
                  >
                    <RotateCcw className="w-3 h-3" /> Return lead
                  </button>
                )}
              </div>
            </Section>
          )}

          {/* Status */}
          <Section title="Lead status">
            <div className="flex flex-wrap gap-2">
              {["new","contacted","matched","closed"].map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`text-xs px-4 py-2 rounded-lg border transition-colors capitalize font-medium ${
                    lead.status === s
                      ? "bg-secondary text-secondary-foreground border-transparent"
                      : "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Section>

          {/* Notes */}
          <Section title="Notes">
            {isEditing ? (
              <Textarea
                value={lead.notes || ""}
                onChange={e => onChange({ notes: e.target.value })}
                placeholder="Add internal notes..."
                className="bg-white/5 border-white/10 text-white rounded-xl min-h-[80px] text-sm"
              />
            ) : (
              <p className="text-sm text-white/50 italic">{lead.notes || "No notes yet."}</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">{title}</p>
      {children}
    </div>
  );
}

function TwoCol({ children }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}

function EditField({ label, value, isEditing, onChange }) {
  return (
    <div>
      <p className="text-xs text-white/30 mb-1">{label}</p>
      {isEditing && onChange ? (
        <Input
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-sm"
        />
      ) : (
        <p className="text-sm text-white">{value || "—"}</p>
      )}
    </div>
  );
}