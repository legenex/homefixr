import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal, Field } from "./CampaignsTab";

const BLANK = { buyer_id: "", company_name: "", contact_name: "", email: "", phone: "", status: "active", notes: "" };
const STATUS_COLORS = { active: "text-green-400 bg-green-500/10 border-green-500/20", paused: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", suspended: "text-red-400 bg-red-500/10 border-red-500/20" };

export default function BuyersTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const { data: buyers = [], isLoading } = useQuery({
    queryKey: ["buyers"],
    queryFn: () => base44.entities.Buyer.list("-created_date", 200),
  });

  const save = useMutation({
    mutationFn: (d) => isNew ? base44.entities.Buyer.create(d) : base44.entities.Buyer.update(form.id, d),
    onSuccess: () => { qc.invalidateQueries(["buyers"]); setForm(null); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.Buyer.delete(id),
    onSuccess: () => qc.invalidateQueries(["buyers"]),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">{buyers.length} buyer{buyers.length !== 1 ? "s" : ""}</p>
        <button onClick={() => { setForm({ ...BLANK }); setIsNew(true); }} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/90">
          <Plus className="w-4 h-4" /> New Buyer
        </button>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        <div className="hidden md:grid grid-cols-[100px_1fr_1fr_100px_80px] gap-4 px-5 py-3 border-b border-white/8 text-xs font-semibold uppercase tracking-wider text-white/30">
          <span>Buyer ID</span><span>Company</span><span>Contact</span><span>Status</span><span></span>
        </div>
        {isLoading ? <div className="py-12 text-center text-white/30">Loading...</div> :
          buyers.length === 0 ? <div className="py-12 text-center text-white/30">No buyers yet.</div> : (
            <div className="divide-y divide-white/5">
              {buyers.map(b => (
                <div key={b.id} className="grid md:grid-cols-[100px_1fr_1fr_100px_80px] gap-4 px-5 py-4 items-center hover:bg-white/3">
                  <span className="text-xs font-mono text-secondary">{b.buyer_id}</span>
                  <div>
                    <p className="text-sm text-white font-medium">{b.company_name}</p>
                    <p className="text-xs text-white/40">{b.email}</p>
                  </div>
                  <div className="text-sm text-white/60">{b.contact_name || "—"}<br /><span className="text-xs text-white/30">{b.phone}</span></div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_COLORS[b.status] || STATUS_COLORS.active}`}>{b.status}</span>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setForm({ ...b }); setIsNew(false); }} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => del.mutate(b.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {form && (
        <Modal title={isNew ? "New Buyer" : "Edit Buyer"} onClose={() => setForm(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Buyer ID (unique)"><Input value={form.buyer_id} onChange={e => setForm(f => ({ ...f, buyer_id: e.target.value }))} className="dark-input" placeholder="e.g. BUY-001" /></Field>
              <Field label="Status">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-9 px-3 text-sm">
                  <option value="active">Active</option><option value="paused">Paused</option><option value="suspended">Suspended</option>
                </select>
              </Field>
            </div>
            <Field label="Company name"><Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} className="dark-input" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact name"><Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} className="dark-input" /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="dark-input" /></Field>
            </div>
            <Field label="Email"><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="dark-input" /></Field>
            <Field label="Notes"><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="dark-input" /></Field>
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