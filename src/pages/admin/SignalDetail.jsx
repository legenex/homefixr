import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ArrowLeft, Copy, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function SignalDetail() {
  useEffect(() => {
    document.title = "Signal Detail — HomeFixr Admin";
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: signal, isLoading } = useQuery({
    queryKey: ["scored-signal", id],
    queryFn: () => base44.asServiceRole.entities.ScoredSignal.get(id)
  });

  const { data: rawSignal } = useQuery({
    queryKey: ["raw-signal", signal?.raw_signal_id],
    queryFn: () => signal ? base44.asServiceRole.entities.RawSignal.get(signal.raw_signal_id) : null,
    enabled: !!signal?.raw_signal_id
  });

  const updateStatus = useMutation({
    mutationFn: (status) => base44.asServiceRole.entities.ScoredSignal.update(id, { status, reviewed_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries(["scored-signal"])
  });

  const createBrief = useMutation({
    mutationFn: async () => {
      const brief = await base44.asServiceRole.entities.CampaignBrief.create({
        scored_signal_id: id,
        brief_title: signal.brief_summary?.split('\n')[0] || 'Campaign Brief',
        brief_summary: signal.brief_summary || '',
        recommended_campaign_slug: signal.recommended_campaigns?.[0] || 'home-improvement',
        recommended_geo_targeting: signal.recommended_geo_targeting || [],
        recommended_creative_angles: signal.recommended_creative_angles?.join('\n\n') || '',
        recommended_buyer_types: signal.recommended_buyer_types || [],
        recommended_budget_low: signal.recommended_daily_budget_low || 500,
        recommended_budget_high: signal.recommended_daily_budget_high || 1500,
        suggested_ad_copy_headlines: signal.recommended_creative_angles?.slice(0, 3) || [],
        suggested_ad_copy_descriptions: signal.recommended_creative_angles?.slice(2, 5) || [],
        status: 'draft'
      });
      return brief;
    },
    onSuccess: (brief) => {
      navigate(`/admin/signals/briefs/${brief.id}`);
    }
  });

  if (isLoading) {
    return <div className="p-6 text-white/40">Loading...</div>;
  }

  if (!signal) {
    return <div className="p-6 text-white/40">Signal not found</div>;
  }

  const scoreColor = signal.composite_score >= 80 ? "text-red-400" : signal.composite_score >= 70 ? "text-orange-400" : "text-yellow-400";

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/admin/signals')} className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">{rawSignal?.title || 'Signal'}</h1>
            <p className="text-white/40 text-sm mt-1">Composite Score: <span className={`font-semibold ${scoreColor}`}>{signal.composite_score}/100</span></p>
          </div>
          <div className="flex gap-2">
            {signal.status === 'new' && (
              <>
                <Button onClick={() => updateStatus.mutate('reviewed')} variant="outline" size="sm" className="text-white">Mark Reviewed</Button>
                <Button onClick={() => updateStatus.mutate('dismissed')} variant="destructive" size="sm">Dismiss</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      {rawSignal && (
        <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase">Event Details</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/40 mb-1">Type</p>
              <p className="text-white font-mono">{rawSignal.event_type}</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Affected States</p>
              <p className="text-white">{(rawSignal.affected_states || []).join(', ') || '—'}</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Started</p>
              <p className="text-white">{format(new Date(rawSignal.event_started_at), "MMM d, yyyy HH:mm")}</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">ZIPs Affected</p>
              <p className="text-white">{(rawSignal.affected_zip_codes || []).length} areas</p>
            </div>
          </div>
          {rawSignal.source_url && (
            <div>
              <p className="text-white/40 text-xs mb-1">Source URL</p>
              <a href={rawSignal.source_url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline text-sm break-all">{rawSignal.source_url}</a>
            </div>
          )}
        </div>
      )}

      {/* Score Breakdown */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase">Score Breakdown</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <ScoreBar label="Severity" value={signal.severity_score} />
          <ScoreBar label="Population Impact" value={signal.population_impact_score} />
          <ScoreBar label="Wealth Score" value={signal.wealth_score} />
          <ScoreBar label="Urgency" value={signal.urgency_score} />
          <ScoreBar label="Competition (inverted)" value={signal.competition_score} />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase">Recommendations</h2>
        <div className="space-y-4">
          <div>
            <p className="text-white/40 text-xs mb-1.5 font-semibold">Campaigns to Run</p>
            <div className="flex flex-wrap gap-2">
              {signal.recommended_campaigns?.map(c => (
                <span key={c} className="px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-sm font-medium">
                  {c}
                </span>
              )) || <span className="text-white/30 text-sm">—</span>}
            </div>
          </div>

          <div>
            <p className="text-white/40 text-xs mb-1.5 font-semibold">Creative Angles</p>
            <div className="space-y-2">
              {signal.recommended_creative_angles?.map((angle, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-white/3 rounded-lg">
                  <span className="text-secondary text-sm font-medium min-w-fit">{i + 1}.</span>
                  <p className="text-white text-sm">{angle}</p>
                </div>
              )) || <p className="text-white/30 text-sm">—</p>}
            </div>
          </div>

          <div>
            <p className="text-white/40 text-xs mb-1.5 font-semibold">Target Geo (ZIPs)</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-white/3 rounded-lg max-h-24 overflow-y-auto">
                <p className="text-white text-xs font-mono">{(signal.recommended_geo_targeting || []).join(', ') || '—'}</p>
              </div>
              <Button
                onClick={() => copyToClipboard((signal.recommended_geo_targeting || []).join(','))}
                size="sm"
                variant="outline"
                className="text-white"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-white/40 text-xs mb-1.5 font-semibold">Recommended Budget</p>
            <p className="text-white font-mono">${signal.recommended_daily_budget_low} - ${signal.recommended_daily_budget_high} /day</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {signal.brief_summary && (
        <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase">Brief Summary</h2>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{signal.brief_summary}</p>
        </div>
      )}

      {/* Generate Brief Button */}
      {signal.status !== 'expired' && (
        <Button
          onClick={() => createBrief.mutate()}
          disabled={createBrief.isPending}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl h-12 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          {createBrief.isPending ? 'Generating Brief...' : 'Generate Campaign Brief'}
        </Button>
      )}
    </div>
  );
}

function ScoreBar({ label, value }) {
  const percentage = (value / 10) * 100;
  const color = value >= 8 ? 'bg-red-500' : value >= 6 ? 'bg-orange-500' : 'bg-yellow-500';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm text-white/60">{label}</p>
        <p className="text-sm font-semibold text-white">{value}/10</p>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}