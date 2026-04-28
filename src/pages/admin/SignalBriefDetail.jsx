import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SignalBriefDetail() {
  useEffect(() => {
    document.title = "Campaign Brief — Signal Engine";
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: brief, isLoading } = useQuery({
    queryKey: ["campaign-brief", id],
    queryFn: () => base44.asServiceRole.entities.CampaignBrief.get(id)
  });

  const updateBrief = useMutation({
    mutationFn: (data) => base44.asServiceRole.entities.CampaignBrief.update(id, data),
    onSuccess: () => qc.invalidateQueries(["campaign-brief"])
  });

  if (isLoading) {
    return <div className="p-6 text-white/40">Loading...</div>;
  }

  if (!brief) {
    return <div className="p-6 text-white/40">Brief not found</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/admin/signals/briefs')} className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">{brief.brief_title}</h1>
            <p className="text-white/40 text-sm mt-1">Campaign: <span className="font-mono">{brief.recommended_campaign_slug}</span></p>
            <p className="text-white/40 text-sm">Status: <span className="font-medium capitalize">{brief.status}</span></p>
          </div>
          <div className="flex gap-2">
            {brief.status === "draft" && (
              <Button onClick={() => updateBrief.mutate({ status: "approved", approved_at: new Date().toISOString() })} className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase">Brief Summary</h2>
        <Textarea
          value={brief.brief_summary || ""}
          onChange={(e) => updateBrief.mutate({ brief_summary: e.target.value })}
          className="bg-white/5 border-white/10 text-white rounded-xl min-h-[150px] text-sm"
          placeholder="Brief summary..."
        />
      </div>

      {/* Creative Angles */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase">Recommended Creative Angles</h2>
        <Textarea
          value={brief.recommended_creative_angles || ""}
          onChange={(e) => updateBrief.mutate({ recommended_creative_angles: e.target.value })}
          className="bg-white/5 border-white/10 text-white rounded-xl min-h-[150px] text-sm"
          placeholder="Creative angles (one per line)..."
        />
      </div>

      {/* Ad Copy */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase">Ad Copy Suggestions</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 mb-2 font-semibold">Headlines</p>
            <div className="space-y-2">
              {(brief.suggested_ad_copy_headlines || []).map((h, i) => (
                <div key={i} className="p-3 bg-white/3 rounded-lg">
                  <p className="text-white text-sm">{h}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-2 font-semibold">Descriptions</p>
            <div className="space-y-2">
              {(brief.suggested_ad_copy_descriptions || []).map((d, i) => (
                <div key={i} className="p-3 bg-white/3 rounded-lg">
                  <p className="text-white text-sm">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stage 2 Placeholder - AI Creatives */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-white mb-2">AI Creative Generation</h2>
            <p className="text-xs text-white/60 mb-3">Generate AI images and video storyboards for this campaign.</p>
            <Button disabled className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Generate Ad Creatives — Coming Soon (Stage 2)
            </Button>
          </div>
        </div>
      </div>

      {/* Stage 3 Placeholder - Launch */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">Launch Campaign</h2>
            <div className="flex flex-wrap gap-2">
              <Button disabled className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Launch via Meta — Coming Soon (Stage 3)
              </Button>
              <Button disabled className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Launch via Google — Coming Soon (Stage 3)
              </Button>
              <Button disabled className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Launch via TikTok — Coming Soon (Stage 3)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Targeting */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase">Targeting</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/40 mb-2">Target ZIPs</p>
            <p className="text-white font-mono text-xs bg-white/3 p-2 rounded break-all">{(brief.recommended_geo_targeting || []).join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-white/40 mb-2">Budget</p>
            <p className="text-white">${brief.recommended_budget_low} - ${brief.recommended_budget_high} /day</p>
          </div>
          <div className="col-span-2">
            <p className="text-white/40 mb-2">Demographics</p>
            <p className="text-white text-sm">{brief.suggested_targeting_demographics || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}