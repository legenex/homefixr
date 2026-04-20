import { useEffect, useState } from "react";
import { Sliders, CheckCircle2, Save } from "lucide-react";
import { SERVICES_LIST } from "@/lib/servicesData";

// This is a read/display view of the current quiz config
// In production this would connect to a CMS entity for dynamic config
export default function QuizSettings() {
  useEffect(() => { document.title = "Quiz Settings — HomeFixr Admin"; }, []);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Quiz Settings</h1>
          <p className="text-white/40 text-sm mt-1">Configure qualification logic and lead scoring</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/90"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      {/* Qualification rules */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Sliders className="w-4 h-4 text-secondary" /> Qualification rules</h2>
        <div className="space-y-4">
          {[
            { rule: "Must be homeowner", desc: "Disqualify leads who are not the homeowner", enabled: true },
            { rule: "Residential only", desc: "Disqualify commercial / non-residential properties", enabled: true },
            { rule: "Exclude 'just researching'", desc: "Disqualify leads with 'just researching' timeline", enabled: true },
            { rule: "Minimum budget enforcement", desc: "Disqualify leads below service minimum budget", enabled: true },
            { rule: "Valid ZIP code required", desc: "Must enter a valid 5-digit US ZIP", enabled: true },
          ].map((r, i) => (
            <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{r.rule}</p>
                <p className="text-xs text-white/40 mt-0.5">{r.desc}</p>
              </div>
              <Toggle enabled={r.enabled} />
            </div>
          ))}
        </div>
      </div>

      {/* Per-service budget minimums */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Budget minimums by service</h2>
        <div className="space-y-4">
          {SERVICES_LIST.map(s => {
            const minQ = s.budgetOptions.find(b => b.qualified);
            return (
              <div key={s.slug} className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-xs text-white/40">Minimum qualifying budget</p>
                  </div>
                </div>
                <span className="text-sm text-secondary font-medium">{minQ?.label || "Any"}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-white/30 mt-4">To change budget thresholds, update <code className="bg-white/10 px-1 rounded">lib/servicesData.js</code> — set <code className="bg-white/10 px-1 rounded">qualified: false</code> on budget options below your minimum.</p>
      </div>

      {/* Quiz flow */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Quiz step order</h2>
        <ol className="space-y-2">
          {["Select service", "Homeowner verification", "Residential check", "Project timeline", "Budget range", "ZIP code", "Service-specific questions", "Contact info + TCPA consent"].map((step, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/60">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/40 flex-shrink-0">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Toggle({ enabled: init }) {
  const [on, setOn] = useState(init);
  return (
    <button
      onClick={() => setOn(v => !v)}
      className={`relative w-10 h-5.5 rounded-full flex-shrink-0 transition-colors ${on ? "bg-secondary" : "bg-white/15"}`}
      style={{ height: 22, width: 40 }}
    >
      <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} style={{ width: 18, height: 18 }} />
    </button>
  );
}