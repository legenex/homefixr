import { useEffect, useState } from "react";
import {
  Sliders, Save, CheckCircle2, Plus, Trash2, GripVertical,
  ChevronDown, ChevronRight, Type, List, ToggleLeft, AlignLeft
} from "lucide-react";
import { SERVICES_LIST } from "@/lib/servicesData";
import { Input } from "@/components/ui/input";

// ---------- default questions per service from servicesData ----------
function buildDefaults() {
  const map = {};
  SERVICES_LIST.forEach(s => {
    map[s.slug] = (s.questions || []).map((q, i) => ({ ...q, order: i }));
  });
  return map;
}

const FIELD_TYPES = [
  { value: "single", label: "Single choice", icon: List },
  { value: "multi", label: "Multi choice", icon: List },
  { value: "text", label: "Free text", icon: AlignLeft },
  { value: "boolean", label: "Yes / No", icon: ToggleLeft },
];

const QUAL_RULES_DEFAULT = [
  { id: "homeowner", rule: "Must be homeowner", desc: "Disqualify leads who are not the homeowner", enabled: true },
  { id: "residential", rule: "Residential only", desc: "Disqualify commercial/non-residential", enabled: true },
  { id: "no_research", rule: "Exclude 'just researching'", desc: "Disqualify leads with researching timeline", enabled: true },
  { id: "budget", rule: "Minimum budget enforcement", desc: "Disqualify leads below service minimum budget", enabled: true },
  { id: "zip", rule: "Valid ZIP code required", desc: "Must enter a valid 5-digit US ZIP", enabled: true },
];

export default function QuizSettings() {
  useEffect(() => { document.title = "Quiz Settings — HomeFixr Admin"; }, []);

  const [activeService, setActiveService] = useState(SERVICES_LIST[0].slug);
  const [questions, setQuestions] = useState(buildDefaults);
  const [qualRules, setQualRules] = useState(QUAL_RULES_DEFAULT);
  const [saved, setSaved] = useState(false);
  const [expandedQ, setExpandedQ] = useState(null);
  const [dragging, setDragging] = useState(null);

  const serviceQuestions = questions[activeService] || [];

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  // ---- question mutations ----
  const addQuestion = () => {
    const newQ = {
      id: `q_${Date.now()}`,
      label: "New question",
      type: "single",
      options: ["Option A", "Option B"],
      order: serviceQuestions.length,
    };
    setQuestions(q => ({ ...q, [activeService]: [...(q[activeService] || []), newQ] }));
    setExpandedQ(newQ.id);
  };

  const updateQ = (id, patch) => {
    setQuestions(q => ({
      ...q,
      [activeService]: q[activeService].map(x => x.id === id ? { ...x, ...patch } : x)
    }));
  };

  const deleteQ = (id) => {
    setQuestions(q => ({ ...q, [activeService]: q[activeService].filter(x => x.id !== id) }));
  };

  const moveQ = (fromIdx, toIdx) => {
    const arr = [...serviceQuestions];
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    setQuestions(q => ({ ...q, [activeService]: arr.map((x, i) => ({ ...x, order: i })) }));
  };

  const addOption = (qid) => {
    const q = serviceQuestions.find(x => x.id === qid);
    updateQ(qid, { options: [...(q.options || []), "New option"] });
  };

  const updateOption = (qid, idx, val) => {
    const q = serviceQuestions.find(x => x.id === qid);
    const opts = [...(q.options || [])];
    opts[idx] = val;
    updateQ(qid, { options: opts });
  };

  const deleteOption = (qid, idx) => {
    const q = serviceQuestions.find(x => x.id === qid);
    updateQ(qid, { options: q.options.filter((_, i) => i !== idx) });
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Quiz Settings</h1>
          <p className="text-white/40 text-sm mt-1">Manage questions per service, qualification rules, and field types</p>
        </div>
        <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/90">
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      {/* Qualification rules */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-secondary" /> Qualification rules
        </h2>
        <div className="space-y-1">
          {qualRules.map(r => (
            <div key={r.id} className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{r.rule}</p>
                <p className="text-xs text-white/40 mt-0.5">{r.desc}</p>
              </div>
              <Toggle on={r.enabled} onChange={v => setQualRules(rs => rs.map(x => x.id === r.id ? { ...x, enabled: v } : x))} />
            </div>
          ))}
        </div>
      </div>

      {/* Per-service question builder */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        {/* Service tabs */}
        <div className="border-b border-white/8 flex overflow-x-auto">
          {SERVICES_LIST.map(s => (
            <button
              key={s.slug}
              onClick={() => { setActiveService(s.slug); setExpandedQ(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeService === s.slug
                  ? "border-secondary text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.short}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-white/60">
              {serviceQuestions.length} question{serviceQuestions.length !== 1 ? "s" : ""} for <span className="text-white">{SERVICES_LIST.find(s => s.slug === activeService)?.name}</span>
            </p>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-medium hover:bg-secondary/20"
            >
              <Plus className="w-3.5 h-3.5" /> Add question
            </button>
          </div>

          <div className="space-y-2">
            {serviceQuestions.map((q, idx) => (
              <div
                key={q.id}
                draggable
                onDragStart={() => setDragging(idx)}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={() => { if (dragging !== null && dragging !== idx) moveQ(dragging, idx); setDragging(null); }}
                className={`border rounded-xl transition-all ${expandedQ === q.id ? "border-secondary/40 bg-white/5" : "border-white/8 bg-white/3 hover:bg-white/5"}`}
              >
                {/* Question header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                >
                  <GripVertical className="w-4 h-4 text-white/20 cursor-grab flex-shrink-0" />
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/40 flex-shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{q.label}</p>
                  </div>
                  <span className="text-xs text-white/30 bg-white/8 px-2 py-0.5 rounded-full">{FIELD_TYPES.find(f => f.value === q.type)?.label || q.type}</span>
                  <button onClick={e => { e.stopPropagation(); deleteQ(q.id); }} className="text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expandedQ === q.id ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                </div>

                {/* Expanded editor */}
                {expandedQ === q.id && (
                  <div className="px-4 pb-4 border-t border-white/8 space-y-4 pt-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Question label</label>
                      <Input
                        value={q.label}
                        onChange={e => updateQ(q.id, { label: e.target.value })}
                        className="bg-white/5 border-white/10 text-white rounded-xl h-10"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Field type</label>
                      <div className="flex flex-wrap gap-2">
                        {FIELD_TYPES.map(ft => (
                          <button
                            key={ft.value}
                            onClick={() => updateQ(q.id, { type: ft.value })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                              q.type === ft.value
                                ? "bg-secondary text-secondary-foreground border-transparent"
                                : "border-white/10 text-white/50 hover:text-white"
                            }`}
                          >
                            <ft.icon className="w-3.5 h-3.5" /> {ft.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(q.type === "single" || q.type === "multi") && (
                      <div>
                        <label className="text-xs text-white/40 mb-2 block">Options</label>
                        <div className="space-y-2">
                          {(q.options || []).map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <Input
                                value={opt}
                                onChange={e => updateOption(q.id, oi, e.target.value)}
                                className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-sm flex-1"
                              />
                              <button onClick={() => deleteOption(q.id, oi)} className="text-white/20 hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(q.id)}
                            className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 mt-1"
                          >
                            <Plus className="w-3 h-3" /> Add option
                          </button>
                        </div>
                      </div>
                    )}

                    {q.type === "text" && (
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">Placeholder text</label>
                        <Input
                          value={q.placeholder || ""}
                          onChange={e => updateQ(q.id, { placeholder: e.target.value })}
                          className="bg-white/5 border-white/10 text-white rounded-xl h-10"
                          placeholder="e.g. Tell us about your project..."
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {serviceQuestions.length === 0 && (
              <div className="py-8 text-center text-white/30 text-sm">No questions yet. Click "Add question" to start.</div>
            )}
          </div>
          <p className="text-xs text-white/20 mt-4">Drag questions to reorder them. Changes apply to future quiz submissions.</p>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{ width: 40, height: 22 }}
      className={`relative rounded-full flex-shrink-0 transition-colors ${on ? "bg-secondary" : "bg-white/15"}`}
    >
      <span
        style={{ width: 18, height: 18 }}
        className={`absolute top-0.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}