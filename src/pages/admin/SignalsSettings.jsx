import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignalsSettings() {
  useEffect(() => {
    document.title = "Signal Engine Settings — HomeFixr Admin";
  }, []);

  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState(null);

  const { data: settings = [] } = useQuery({
    queryKey: ["signal-settings"],
    queryFn: () => base44.asServiceRole.entities.SignalEngineSettings.list()
  });

  const updateSettings = useMutation({
    mutationFn: (data) => {
      if (settings.length === 0) {
        return base44.asServiceRole.entities.SignalEngineSettings.create(data);
      } else {
        return base44.asServiceRole.entities.SignalEngineSettings.update(settings[0].id, data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(["signal-settings"]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  });

  useEffect(() => {
    if (settings.length > 0) {
      setFormData(settings[0]);
    }
  }, [settings]);

  if (!formData) {
    return <div className="p-6 text-white/40">Loading...</div>;
  }

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  const setField = (path, value) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      setFormData({ ...formData, [path]: value });
    } else {
      const obj = { ...formData };
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      setFormData(obj);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Signal Engine Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure monitoring, scoring, and alerting</p>
      </div>

      {/* Alerts */}
      <Section title="Alert Recipients">
        <Field label="Email addresses (comma-separated)">
          <Input
            value={(formData.alert_recipients || []).join(', ')}
            onChange={(e) => setField('alert_recipients', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="bg-white/5 border-white/10 text-white rounded-xl"
            placeholder="admin@homefixr.com, team@homefixr.com"
          />
        </Field>
      </Section>

      {/* Thresholds */}
      <Section title="Score Thresholds">
        <div className="space-y-4">
          <Field label="Alert threshold (sends email alert)">
            <Input
              type="number"
              min="1"
              max="100"
              value={formData.alert_threshold_composite_score || 60}
              onChange={(e) => setField('alert_threshold_composite_score', parseInt(e.target.value))}
              className="bg-white/5 border-white/10 text-white rounded-xl"
            />
            <p className="text-xs text-white/40 mt-1">Default: 60</p>
          </Field>

          <Field label="Urgent threshold (Slack + SMS)">
            <Input
              type="number"
              min="1"
              max="100"
              value={formData.urgent_threshold_composite_score || 80}
              onChange={(e) => setField('urgent_threshold_composite_score', parseInt(e.target.value))}
              className="bg-white/5 border-white/10 text-white rounded-xl"
            />
            <p className="text-xs text-white/40 mt-1">Default: 80</p>
          </Field>
        </div>
      </Section>

      {/* Digest */}
      <Section title="Daily Digest">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.digest_email_enabled || false}
              onChange={(e) => setField('digest_email_enabled', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label className="text-white text-sm">Enable daily digest emails</label>
          </div>

          {formData.digest_email_enabled && (
            <>
              <Field label="Send time (HH:MM ET)">
                <Input
                  value={formData.digest_send_time || '08:00'}
                  onChange={(e) => setField('digest_send_time', e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl w-32"
                  placeholder="HH:MM"
                />
              </Field>

              <Field label="Digest recipients (comma-separated)">
                <Input
                  value={(formData.digest_recipients || []).join(', ')}
                  onChange={(e) => setField('digest_recipients', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                  placeholder="admin@homefixr.com"
                />
              </Field>
            </>
          )}
        </div>
      </Section>

      {/* Quiet Hours */}
      <Section title="Quiet Hours">
        <p className="text-xs text-white/40 mb-4">Only urgent signals (score ≥ 80) trigger immediate notifications outside quiet hours</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Start (HH:MM)">
            <Input
              value={formData.notification_quiet_hours_start || '22:00'}
              onChange={(e) => setField('notification_quiet_hours_start', e.target.value)}
              className="bg-white/5 border-white/10 text-white rounded-xl"
            />
          </Field>
          <Field label="End (HH:MM)">
            <Input
              value={formData.notification_quiet_hours_end || '06:00'}
              onChange={(e) => setField('notification_quiet_hours_end', e.target.value)}
              className="bg-white/5 border-white/10 text-white rounded-xl"
            />
          </Field>
        </div>
      </Section>

      {/* Slack */}
      <Section title="Slack Integration">
        <Field label="Webhook URL (for urgent alerts)">
          <Input
            type="password"
            value={formData.slack_webhook_url || ''}
            onChange={(e) => setField('slack_webhook_url', e.target.value)}
            className="bg-white/5 border-white/10 text-white rounded-xl"
            placeholder="https://hooks.slack.com/services/..."
          />
          <p className="text-xs text-white/40 mt-1">Optional. Set to enable Slack notifications for score ≥ 80.</p>
        </Field>
      </Section>

      {/* Weights */}
      <Section title="Scoring Weights">
        <p className="text-xs text-white/40 mb-4">Adjust how component scores are weighted in composite calculation</p>
        <div className="space-y-3">
          <WeightField
            label="Severity"
            value={formData.scoring_weights?.severity || 0.30}
            onChange={(v) => setField('scoring_weights.severity', v)}
          />
          <WeightField
            label="Population Impact"
            value={formData.scoring_weights?.population || 0.25}
            onChange={(v) => setField('scoring_weights.population', v)}
          />
          <WeightField
            label="Wealth"
            value={formData.scoring_weights?.wealth || 0.20}
            onChange={(v) => setField('scoring_weights.wealth', v)}
          />
          <WeightField
            label="Urgency"
            value={formData.scoring_weights?.urgency || 0.15}
            onChange={(v) => setField('scoring_weights.urgency', v)}
          />
          <WeightField
            label="Competition"
            value={formData.scoring_weights?.competition || 0.10}
            onChange={(v) => setField('scoring_weights.competition', v)}
          />
        </div>
      </Section>

      {/* Master toggle */}
      <Section title="System Status">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.enabled !== false}
            onChange={(e) => setField('enabled', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label className="text-white text-sm">Signal Engine enabled (master kill switch)</label>
        </div>
      </Section>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={updateSettings.isPending}
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl h-12 px-6 font-medium"
      >
        {saved ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        {saved ? 'Settings saved!' : updateSettings.isPending ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-white/50 uppercase">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-white/40 mb-1.5 block font-medium">{label}</label>
      {children}
    </div>
  );
}

function WeightField({ label, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm text-white/60">{label}</p>
        <p className="text-sm font-mono text-white">{value.toFixed(2)}</p>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}