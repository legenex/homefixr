import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Save, Webhook, Mail, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal, Field } from "./CampaignsTab";
import { SERVICES_LIST } from "@/lib/servicesData";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const BLANK = {
  buyer_id: "", campaign_id: "", name: "", delivery_type: "webhook", status: "active",
  price: "", webhook_url: "", webhook_method: "POST", webhook_headers: "", webhook_payload_template: "",
  allowed_states: [], allowed_zips: "", allowed_verticals: [], daily_cap: "", monthly_cap: "", priority: 1
};

const TYPE_ICONS = { webhook: Webhook, email: Mail, api: Settings, manual: Settings };
const STATUS_COLORS = { active: "text-green-400 bg-green-500/10 border-green-500/20", paused: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };

export default function DeliveriesTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const { data: deliveries = [], isLoading } = useQuery({ queryKey: ["deliveries"], queryFn: () => base44.entities.BuyerDelivery.list("-created_date", 200) });
  const { data: buyers = [] } = useQuery({ queryKey: ["buyers"], queryFn: () => base44.entities.Buyer.list() });
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns"], queryFn: () => base44.entities.Campaign.list() });

  const save = useMutation({
    mutationFn: (d) => isNew ? base44.entities.BuyerDelivery.create(d) : base44.entities.BuyerDelivery.update(form.id, d),
    onSuccess: () => { qc.invalidateQueries(["deliveries"]); setForm(null); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.BuyerDelivery.delete(id),
    onSuccess: () => qc.invalidateQueries(["deliveries"]),
  });

  const toggleState = (st) => {
    const cur = form.allowed_states || [];
    setForm(f => ({ ...f, allowed_states: cur.includes(st) ? cur.filter(x => x !== st) : [...cur, st] }));
  };

  const toggleVertical = (v) => {
    const cur = form.allowed_verticals || [];
    setForm(f => ({ ...f, allowed_verticals: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] }));
  };

  const buyerName = (bid) => buyers.find(b => b.buyer_id === bid)?.company_name || bid;
  const campaignName = (cid) => campaigns.find(c => c.id === cid)?.name || cid;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">{deliveries.length} delivery config{deliveries.length !== 1 ? "s" : ""}</p>
        <button onClick={() => { setForm({ ...BLANK }); setIsNew(true); }} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/90">
          <Plus className="w-4 h-4" /> New Delivery
        </button>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        {isLoading ? <div className="py-12 text-center text-white/30">Loading...</div> :
          deliveries.length === 0 ? <div className="py-12 text-center text-white/30">No delivery configs yet.</div> : (
            <div className="divide-y divide-white/5">
              {deliveries.map(d => {
                const Icon = TYPE_ICONS[d.delivery_type] || Settings;
                return (
                  <div key={d.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3">
                    <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{d.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">{buyerName(d.buyer_id)} · {campaignName(d.campaign_id)}</p>
                    </div>
                    <div className="text-xs text-white/50 text-right hidden sm:block">
                      {d.price ? <span className="text-secondary font-medium">${d.price}/lead</span> : <span>No price</span>}
                      <br /><span className="capitalize">{d.delivery_type}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_COLORS[d.status] || STATUS_COLORS.active}`}>{d.status}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setForm({ ...d, allowed_states: d.allowed_states || [], allowed_verticals: d.allowed_verticals || [] }); setIsNew(false); }} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => del.mutate(d.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {form && (
        <Modal title={isNew ? "New Delivery Config" : "Edit Delivery Config"} onClose={() => setForm(null)}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Field label="Name"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="dark-input" placeholder="e.g. Buyer A - Kitchen Webhook" /></Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Buyer">
                <select value={form.buyer_id} onChange={e => setForm(f => ({ ...f, buyer_id: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-9 px-3 text-sm">
                  <option value="">Select buyer...</option>
                  {buyers.map(b => <option key={b.buyer_id} value={b.buyer_id}>{b.company_name} ({b.buyer_id})</option>)}
                </select>
              </Field>
              <Field label="Campaign">
                <select value={form.campaign_id} onChange={e => setForm(f => ({ ...f, campaign_id: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-9 px-3 text-sm">
                  <option value="">Select campaign...</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Delivery type">
                <select value={form.delivery_type} onChange={e => setForm(f => ({ ...f, delivery_type: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-9 px-3 text-sm">
                  <option value="webhook">Webhook</option><option value="email">Email</option><option value="api">API</option><option value="manual">Manual</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-9 px-3 text-sm">
                  <option value="active">Active</option><option value="paused">Paused</option>
                </select>
              </Field>
              <Field label="Price ($)"><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="dark-input" placeholder="0.00" /></Field>
            </div>

            {form.delivery_type === "webhook" && (
              <div className="space-y-3 p-4 bg-white/3 rounded-xl border border-white/8">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Webhook config</p>
                <div className="grid grid-cols-4 gap-2">
                  <Field label="Method">
                    <select value={form.webhook_method} onChange={e => setForm(f => ({ ...f, webhook_method: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-9 px-2 text-sm">
                      <option>POST</option><option>GET</option>
                    </select>
                  </Field>
                  <div className="col-span-3">
                    <Field label="Webhook URL"><Input value={form.webhook_url} onChange={e => setForm(f => ({ ...f, webhook_url: e.target.value }))} className="dark-input" placeholder="https://..." /></Field>
                  </div>
                </div>
                <Field label="Custom headers (JSON)"><Textarea value={form.webhook_headers} onChange={e => setForm(f => ({ ...f, webhook_headers: e.target.value }))} className="bg-white/5 border-white/10 text-white rounded-xl text-xs font-mono min-h-[60px]" placeholder={'{"X-API-Key": "your-key"}'} /></Field>
                <Field label="Payload template (JSON, use {{field}} placeholders)"><Textarea value={form.webhook_payload_template} onChange={e => setForm(f => ({ ...f, webhook_payload_template: e.target.value }))} className="bg-white/5 border-white/10 text-white rounded-xl text-xs font-mono min-h-[80px]" placeholder={'{"first_name": "{{full_name}}", "email": "{{email}}"}'} /></Field>
              </div>
            )}

            {/* Filters */}
            <div className="space-y-3 p-4 bg-white/3 rounded-xl border border-white/8">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Filters</p>

              <Field label="Allowed states (leave empty = all)">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {US_STATES.map(st => (
                    <button key={st} type="button" onClick={() => toggleState(st)} className={`text-xs px-2 py-0.5 rounded border transition-colors ${(form.allowed_states || []).includes(st) ? "bg-secondary text-white border-secondary" : "border-white/10 text-white/40 hover:text-white"}`}>{st}</button>
                  ))}
                </div>
              </Field>

              <Field label="Allowed ZIP codes (comma-separated, or prefixes like 9*)"><Input value={form.allowed_zips} onChange={e => setForm(f => ({ ...f, allowed_zips: e.target.value }))} className="dark-input" placeholder="90210, 100*, 33..." /></Field>

              <Field label="Allowed verticals (leave empty = all)">
                <div className="flex flex-wrap gap-2 mt-1">
                  {SERVICES_LIST.map(s => (
                    <button key={s.slug} type="button" onClick={() => toggleVertical(s.slug)} className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${(form.allowed_verticals || []).includes(s.slug) ? "bg-secondary text-white border-secondary" : "border-white/10 text-white/40 hover:text-white"}`}>{s.short || s.name}</button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Daily cap"><Input type="number" value={form.daily_cap} onChange={e => setForm(f => ({ ...f, daily_cap: e.target.value }))} className="dark-input" /></Field>
                <Field label="Monthly cap"><Input type="number" value={form.monthly_cap} onChange={e => setForm(f => ({ ...f, monthly_cap: e.target.value }))} className="dark-input" /></Field>
              </div>

              <Field label="Priority (lower = higher priority)"><Input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="dark-input" /></Field>
            </div>

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