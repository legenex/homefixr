import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SERVICES_LIST } from "@/lib/servicesData";

const BLANK = { name: "", vertical: "kitchen-remodeling", status: "active", description: "", default_price: "", daily_cap: "", monthly_cap: "" };

const STATUS_COLORS = { active: "text-green-400 bg-green-500/10 border-green-500/20", paused: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", archived: "text-white/30 bg-white/5 border-white/10" };

export default function CampaignsTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState(null); // null=closed, obj=editing
  const [isNew, setIsNew] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => base44.entities.Campaign.list("-created_date", 100),
  });

  const save = useMutation({
    mutationFn: (d) => isNew ? base44.entities.Campaign.create(d) : base44.entities.Campaign.update(form.id, d),
    onSuccess: () => { qc.invalidateQueries(["campaigns"]); setForm(null); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Campaign.delete(id),
    onSuccess: () => qc.invalidateQueries(["campaigns"]),
  });

  const openNew = () => { setForm({ ...BLANK }); setIsNew(true); };
  const openEdit = (c) => { setForm({ ...c }); setIsNew(false); };

  const serviceName = (slug) => SERVICES_LIST.find(s => s.slug === slug)?.name || slug;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/90">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-white/30">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center text-white/30">No campaigns yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{serviceName(c.vertical)}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_COLORS[c.status] || STATUS_COLORS.active}`}>{c.status}</span>
                {c.default_price && <span className="text-xs text-white/50">${c.default_price}/lead</span>}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => del.mutate(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {form && (
        <Modal title={isNew ? "New Campaign" : "Edit Campaign"} onClose={() => setForm(null)}>
          <div className="space-y-4">
            <Field label="Campaign name"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="dark-input" /></Field>
            <Field label="Vertical">
              <select value={form.vertical} onChange={e => setForm(f => ({ ...f, vertical: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-9 px-3 text-sm">
                {SERVICES_LIST.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-9 px-3 text-sm">
                <option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option>
              </select>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Default price ($)"><Input type="number" value={form.default_price} onChange={e => setForm(f => ({ ...f, default_price: e.target.value }))} className="dark-input" /></Field>
              <Field label="Daily cap"><Input type="number" value={form.daily_cap} onChange={e => setForm(f => ({ ...f, daily_cap: e.target.value }))} className="dark-input" /></Field>
              <Field label="Monthly cap"><Input type="number" value={form.monthly_cap} onChange={e => setForm(f => ({ ...f, monthly_cap: e.target.value }))} className="dark-input" /></Field>
            </div>
            <Field label="Description"><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="dark-input" /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setForm(null)} className="px-4 py-2 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg">Cancel</button>
              <button onClick={() => save.mutate(form)} disabled={save.isPending} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">
                <Save className="w-3.5 h-3.5" /> {save.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141e2e] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}