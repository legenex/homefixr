import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Zap, Check, Eye, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS = {
  draft: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  launched: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20"
};

export default function SignalBriefs() {
  useEffect(() => {
    document.title = "Campaign Briefs — Signal Engine";
  }, []);

  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: briefs = [], isLoading } = useQuery({
    queryKey: ["campaign-briefs"],
    queryFn: () => base44.asServiceRole.entities.CampaignBrief.list("-created_date", 500)
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.asServiceRole.entities.CampaignBrief.update(id, { status, approved_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries(["campaign-briefs"])
  });

  const filtered = briefs.filter(b => statusFilter === "all" || b.status === statusFilter);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Campaign Briefs</h1>
        <p className="text-white/40 text-sm mt-0.5">{filtered.length} brief{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "draft", "approved", "launched", "archived"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium capitalize ${
              statusFilter === s
                ? "bg-secondary text-secondary-foreground border-transparent"
                : "border-white/10 text-white/50 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-white/30">Loading briefs...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/30">No briefs found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(brief => (
              <div key={brief.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{brief.brief_title}</p>
                  <p className="text-xs text-white/40 mt-0.5">Campaign: {brief.recommended_campaign_slug}</p>
                  <p className="text-xs text-white/30 mt-0.5">{format(new Date(brief.created_at), "MMM d, yyyy")}</p>
                </div>

                {brief.status === "draft" && (
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_COLORS.draft}`}>
                    Draft
                  </span>
                )}
                {brief.status === "approved" && (
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_COLORS.approved}`}>
                    Approved
                  </span>
                )}
                {brief.status === "launched" && (
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_COLORS.launched}`}>
                    Launched
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate(`/admin/signals/briefs/${brief.id}`)}
                    size="sm"
                    variant="outline"
                    className="text-white"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>

                  {brief.status === "draft" && (
                    <Button
                      onClick={() => updateStatus.mutate({ id: brief.id, status: "approved" })}
                      size="sm"
                      className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  )}

                  {brief.status === "approved" && (
                    <Button
                      disabled
                      size="sm"
                      className="bg-secondary/20 text-secondary border border-secondary/20"
                    >
                      <Zap className="w-3.5 h-3.5" /> Coming Soon
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}