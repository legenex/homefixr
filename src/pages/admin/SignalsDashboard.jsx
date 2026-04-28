import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Activity, AlertTriangle, MapPin, TrendingUp, CheckCircle, RefreshCw, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SCORE_COLORS = {
  low: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-red-500/10 text-red-600 border-red-500/20"
};

export default function SignalsDashboard() {
  useEffect(() => {
    document.title = "Signal Engine — HomeFixr Admin";
  }, []);

  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scoreRange, setScoreRange] = useState("all");
  const [fetching, setFetching] = useState(false);

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ["scored-signals"],
    queryFn: () => base44.asServiceRole.entities.ScoredSignal.list("-created_date", 500),
    refetchInterval: 30000 // Refetch every 30s
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["signal-settings"],
    queryFn: () => base44.asServiceRole.entities.SignalEngineSettings.list()
  });

  const config = settings.length > 0 ? settings[0] : { alert_threshold_composite_score: 60, urgent_threshold_composite_score: 80 };

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.asServiceRole.entities.ScoredSignal.update(id, { status, reviewed_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries(["scored-signals"])
  });

  const handleFetchAlerts = async () => {
    setFetching(true);
    try {
      await base44.functions.invoke("pollNoaaAlerts", {});
      // Refetch signals after a short delay to allow backend to process
      setTimeout(() => {
        qc.invalidateQueries(["scored-signals"]);
        setFetching(false);
      }, 1000);
    } catch (err) {
      console.error("Fetch error:", err);
      setFetching(false);
    }
  };

  const filtered = signals.filter(s => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (scoreRange === "urgent" && s.composite_score < config.urgent_threshold_composite_score) return false;
    if (scoreRange === "high" && (s.composite_score < 70 || s.composite_score >= config.urgent_threshold_composite_score)) return false;
    if (scoreRange === "medium" && (s.composite_score < config.alert_threshold_composite_score || s.composite_score >= 70)) return false;
    return true;
  });

  const activeCount = signals.filter(s => s.status === "new").length;
  const urgentCount = signals.filter(s => s.composite_score >= config.urgent_threshold_composite_score && s.status === "new").length;
  const reviewedToday = signals.filter(s => {
    const revDate = s.reviewed_at ? new Date(s.reviewed_at) : null;
    const today = new Date();
    return revDate && revDate.toDateString() === today.toDateString();
  }).length;
  const launchedThisMonth = signals.filter(s => s.status === "campaign_launched").length;

  const scoreColor = (score) => {
    if (score >= config.urgent_threshold_composite_score) return SCORE_COLORS.critical;
    if (score >= 70) return SCORE_COLORS.high;
    if (score >= config.alert_threshold_composite_score) return SCORE_COLORS.medium;
    return SCORE_COLORS.low;
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header + Stats */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white">Signal Engine</h1>
          <p className="text-white/40 text-sm mt-0.5">Monitor events & generate campaign briefs</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => qc.invalidateQueries(["scored-signals"])}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="text-white flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleFetchAlerts}
            disabled={fetching}
            size="sm"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            {fetching ? 'Fetching...' : 'Fetch NOAA Alerts'}
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Active Signals" value={activeCount} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={AlertTriangle} label="URGENT" value={urgentCount} color="bg-red-500/10 text-red-400" />
        <StatCard icon={CheckCircle} label="Reviewed Today" value={reviewedToday} color="bg-green-500/10 text-green-400" />
        <StatCard icon={TrendingUp} label="Campaigns Launched" value={launchedThisMonth} color="bg-secondary/10 text-secondary" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
            <SelectItem value="campaign_launched">Launched</SelectItem>
          </SelectContent>
        </Select>

        <Select value={scoreRange} onValueChange={setScoreRange}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="All scores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scores</SelectItem>
            <SelectItem value="critical">URGENT (80+)</SelectItem>
            <SelectItem value="high">High (70-79)</SelectItem>
            <SelectItem value="medium">Medium (60-69)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_120px_90px_80px_100px_80px] gap-3 px-5 py-3 border-b border-white/8 text-xs font-semibold uppercase tracking-wider text-white/30">
          <span>Event</span>
          <span>Affected</span>
          <span>Score</span>
          <span>Severity</span>
          <span>Created</span>
          <span>Status</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-white/30">Loading signals...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/30">No signals match your filters.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(signal => (
              <div key={signal.id} className="grid md:grid-cols-[2fr_120px_90px_80px_100px_80px] gap-3 px-5 py-4 items-center hover:bg-white/3 transition-colors cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-white group-hover:underline">{signal.brief_summary?.split('\n')[0] || 'Signal'}</p>
                  <p className="text-xs text-white/40 mt-0.5 line-clamp-1">Score: {signal.composite_score}/100</p>
                </div>
                <div className="text-xs text-white/50 text-center">{signal.recommended_geo_targeting?.length || 0} ZIPs</div>
                <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold text-center ${scoreColor(signal.composite_score)}`}>
                  {signal.composite_score}
                </div>
                <div className="text-xs text-white/50 text-center">{signal.severity_score}/10</div>
                <div className="text-xs text-white/40">{format(new Date(signal.created_date), "MMM d, HH:mm")}</div>
                <div>
                  <StatusBadge status={signal.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/8 p-4">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${color} mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    reviewed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dismissed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    campaign_launched: "bg-green-500/10 text-green-400 border-green-500/20",
    expired: "bg-white/5 text-white/30 border-white/10"
  };
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${styles[status] || styles.new}`}>
      {status.replace('_', ' ')}
    </span>
  );
}