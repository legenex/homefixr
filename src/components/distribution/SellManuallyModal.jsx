import { useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SellManuallyModal({ lead, buyers, onSell, onClose }) {
  const [buyerId, setBuyerId] = useState("");
  const [price, setPrice] = useState("");

  const handleSell = () => {
    if (!buyerId || !price) return;
    const buyer = buyers.find(b => b.buyer_id === buyerId);
    onSell({
      sale_status: "sold",
      sold_buyer_id: buyerId,
      sold_buyer_name: buyer?.company_name || buyerId,
      sale_price: parseFloat(price),
      sold_at: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141e2e] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-secondary" />
            <h2 className="text-base font-semibold text-white">Sell Lead Manually</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs text-white/40 mb-0.5">Lead</p>
            <p className="text-sm text-white font-medium">{lead.full_name}</p>
            <p className="text-xs text-white/40">{lead.email} · {lead.service}</p>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Select buyer</label>
            <select
              value={buyerId}
              onChange={e => setBuyerId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg h-10 px-3 text-sm"
            >
              <option value="">Choose a buyer...</option>
              {buyers.filter(b => b.status === "active").map(b => (
                <option key={b.buyer_id} value={b.buyer_id}>{b.company_name} ({b.buyer_id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Sale price ($)</label>
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="bg-white/5 border-white/10 text-white rounded-lg h-10"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm text-white/50 hover:text-white border border-white/10 rounded-xl">Cancel</button>
            <button
              onClick={handleSell}
              disabled={!buyerId || !price}
              className="flex-1 py-2.5 text-sm bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/90 disabled:opacity-40"
            >
              Confirm Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}