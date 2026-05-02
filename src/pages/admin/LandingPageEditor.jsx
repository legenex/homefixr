import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, ArrowLeft, Globe, Eye, Smartphone, Monitor, AlertTriangle } from "lucide-react";
import { SERVICES_LIST } from "@/lib/servicesData";
import LandingPageRenderer from "@/components/landing-page/LandingPageRenderer";

const RESERVED_PATHS = ["/admin", "/api", "/services", "/auth", "/quiz", "/thank-you", "/about", "/privacy", "/terms", "/tcpa"];

function isReservedPath(path) {
  return RESERVED_PATHS.some(r => path === r || path.startsWith(r + "/"));
}

export default function LandingPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState(null);
  const [originalPath, setOriginalPath] = useState(null);
  const [pathError, setPathError] = useState("");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [showPathWarning, setShowPathWarning] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);
  const [toast, setToast] = useState(null);

  const { data: page, isLoading } = useQuery({
    queryKey: ["landing-page", id],
    queryFn: () => base44.entities.LandingPage.get(id),
    enabled: !!id
  });

  const { data: quiz } = useQuery({
    queryKey: ["lp-quiz", form?.quiz_id],
    queryFn: () => base44.entities.LPQuiz.get(form?.quiz_id),
    enabled: !!form?.quiz_id
  });

  const { data: allPages = [] } = useQuery({
    queryKey: ["landing-pages"],
    queryFn: () => base44.entities.LandingPage.list("-updated_date", 200)
  });

  useEffect(() => {
    if (page && !form) {
      setForm({ ...page });
      setOriginalPath(page.path);
    }
  }, [page]);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.LandingPage.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(["landing-page", id]);
      qc.invalidateQueries(["landing-pages"]);
      showToast("Saved successfully");
    },
    onError: () => showToast("Save failed", "error")
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const patch = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const patchHero = (key, val) => setForm(f => ({ ...f, hero: { ...(f.hero || {}), [key]: val } }));
  const patchStats = (key, val) => setForm(f => ({ ...f, stats: { ...(f.stats || {}), [key]: val } }));

  const validateAndSave = (data = form) => {
    // Validate path
    if (data.path && isReservedPath(data.path)) {
      setPathError("This path is reserved and cannot be used.");
      return;
    }
    if (data.path && !/^\/[a-z0-9\-\/]+$/.test(data.path)) {
      setPathError("Path must start with /, be lowercase, and contain only letters, numbers, and hyphens.");
      return;
    }
    // Check if published LP path is being changed
    const pathChanged = data.path !== originalPath;
    if (pathChanged && originalPath && page?.status === "published") {
      setPendingSave(data);
      setShowPathWarning(true);
      return;
    }
    setPathError("");
    saveMutation.mutate(data);
  };

  const handlePublish = () => {
    validateAndSave({ ...form, status: "published" });
    setForm(f => ({ ...f, status: "published" }));
  };

  const handleUnpublish = () => {
    saveMutation.mutate({ ...form, status: "draft" });
    setForm(f => ({ ...f, status: "draft" }));
  };

  if (isLoading || !form) {
    return <div className="p-8 text-white/30">Loading editor...</div>;
  }

  const otherPages = allPages.filter(p => p.id !== id);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-[#0f1623] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/admin/landing-pages" className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-sm font-medium text-white truncate max-w-xs">{form.title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
            form.status === "published" ? "bg-green-500/10 text-green-400 border-green-500/20" :
            form.status === "archived" ? "bg-white/5 text-white/30 border-white/10" :
            "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
          }`}>{form.status}</span>
        </div>
        <div className="flex items-center gap-2">
          {form.status === "published" ? (
            <Button size="sm" variant="outline" onClick={handleUnpublish} className="border-white/10 text-white/50 text-xs">
              Unpublish
            </Button>
          ) : (
            <Button size="sm" onClick={handlePublish} className="bg-green-500 hover:bg-green-600 text-white text-xs gap-1">
              <Globe className="w-3.5 h-3.5" /> Publish
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => validateAndSave()}
            disabled={saveMutation.isPending}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs gap-1"
          >
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Path change warning */}
      {showPathWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-[#141e2e] border border-white/10 rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-semibold">Path change warning</h3>
            </div>
            <p className="text-white/60 text-sm mb-4">
              This will break existing inbound links and ad URLs. Changing from <code className="text-yellow-300">{originalPath}</code> to <code className="text-yellow-300">{pendingSave?.path}</code>. Continue?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowPathWarning(false); setPendingSave(null); }} className="flex-1 border-white/10 text-white/50">Cancel</Button>
              <Button onClick={() => { setShowPathWarning(false); saveMutation.mutate(pendingSave); setPendingSave(null); setOriginalPath(pendingSave.path); }} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">Continue</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left pane — fields */}
        <div className="w-full lg:w-[440px] flex-shrink-0 overflow-y-auto border-r border-white/8 p-5 space-y-2">
          <Accordion type="multiple" defaultValue={["meta", "hero"]} className="space-y-2">

            {/* META */}
            <AccordionItem value="meta" className="bg-white/3 rounded-xl border border-white/8 px-4">
              <AccordionTrigger className="text-sm font-medium text-white py-3">Meta</AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <Field label="Title (internal)">
                  <Input value={form.title || ""} onChange={e => patch("title", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" />
                </Field>
                <Field label="Slug">
                  <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                    <span className="text-white/30">/lp/</span>
                    <input value={form.slug || ""} onChange={e => patch("slug", e.target.value)} className="flex-1 bg-transparent text-white outline-none text-sm" />
                  </div>
                </Field>
                <Field label="Public path" error={pathError}>
                  <Input value={form.path || ""} onChange={e => { patch("path", e.target.value); setPathError(""); }} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" placeholder="/lp/storm-roofing" />
                </Field>
                <Field label="Linked service">
                  <Select value={form.service_slug || ""} onValueChange={v => patch("service_slug", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-lg text-sm">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {SERVICES_LIST.map(s => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.status || "draft"} onValueChange={v => patch("status", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-lg text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Phone (optional override)">
                  <Input value={form.phone || ""} onChange={e => patch("phone", e.target.value)} placeholder="(555) 555-5555" className="bg-white/5 border-white/10 text-white rounded-lg text-sm" />
                </Field>
              </AccordionContent>
            </AccordionItem>

            {/* HERO */}
            <AccordionItem value="hero" className="bg-white/3 rounded-xl border border-white/8 px-4">
              <AccordionTrigger className="text-sm font-medium text-white py-3">Hero</AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <Field label="Eyebrow">
                  <Input value={form.hero?.eyebrow || ""} onChange={e => patchHero("eyebrow", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" />
                </Field>
                <Field label="Headline">
                  <Textarea value={form.hero?.headline || ""} onChange={e => patchHero("headline", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm min-h-[60px]" />
                </Field>
                <Field label="Subheadline">
                  <Textarea value={form.hero?.subheadline || ""} onChange={e => patchHero("subheadline", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm min-h-[80px]" />
                </Field>
                <Field label="CTA label">
                  <Input value={form.hero?.cta_label || ""} onChange={e => patchHero("cta_label", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" />
                </Field>
              </AccordionContent>
            </AccordionItem>

            {/* TRUST BULLETS */}
            <AccordionItem value="trust" className="bg-white/3 rounded-xl border border-white/8 px-4">
              <AccordionTrigger className="text-sm font-medium text-white py-3">Trust Bullets</AccordionTrigger>
              <AccordionContent className="pb-4">
                <TrustBulletsEditor
                  bullets={form.trust_bullets || []}
                  onChange={v => patch("trust_bullets", v)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* STATS */}
            <AccordionItem value="stats" className="bg-white/3 rounded-xl border border-white/8 px-4">
              <AccordionTrigger className="text-sm font-medium text-white py-3">Stats</AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Value 1"><Input value={form.stats?.headline_value || ""} onChange={e => patchStats("headline_value", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" /></Field>
                  <Field label="Label 1"><Input value={form.stats?.headline_label || ""} onChange={e => patchStats("headline_label", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" /></Field>
                  <Field label="Value 2"><Input value={form.stats?.secondary_value || ""} onChange={e => patchStats("secondary_value", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" /></Field>
                  <Field label="Label 2"><Input value={form.stats?.secondary_label || ""} onChange={e => patchStats("secondary_label", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" /></Field>
                </div>
                <Field label="Body copy">
                  <Textarea value={form.stats?.body_copy || ""} onChange={e => patchStats("body_copy", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm min-h-[80px]" />
                </Field>
              </AccordionContent>
            </AccordionItem>

            {/* STORY */}
            <AccordionItem value="story" className="bg-white/3 rounded-xl border border-white/8 px-4">
              <AccordionTrigger className="text-sm font-medium text-white py-3">Story Blocks</AccordionTrigger>
              <AccordionContent className="pb-4">
                <StoryBlocksEditor
                  blocks={form.story_blocks || []}
                  onChange={v => patch("story_blocks", v)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* FINAL CTA */}
            <AccordionItem value="cta" className="bg-white/3 rounded-xl border border-white/8 px-4">
              <AccordionTrigger className="text-sm font-medium text-white py-3">Final CTA</AccordionTrigger>
              <AccordionContent className="pb-4">
                <Field label="CTA label">
                  <Input value={form.final_cta_label || ""} onChange={e => patch("final_cta_label", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" />
                </Field>
              </AccordionContent>
            </AccordionItem>

            {/* SEO */}
            <AccordionItem value="seo" className="bg-white/3 rounded-xl border border-white/8 px-4">
              <AccordionTrigger className="text-sm font-medium text-white py-3">SEO</AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <Field label="SEO title"><Input value={form.seo_title || ""} onChange={e => patch("seo_title", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm" /></Field>
                <Field label="SEO description"><Textarea value={form.seo_description || ""} onChange={e => patch("seo_description", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm min-h-[70px]" /></Field>
              </AccordionContent>
            </AccordionItem>

            {/* TCPA */}
            <AccordionItem value="tcpa" className="bg-white/3 rounded-xl border border-white/8 px-4">
              <AccordionTrigger className="text-sm font-medium text-white py-3">TCPA Disclosure</AccordionTrigger>
              <AccordionContent className="pb-4">
                <Textarea value={form.tcpa_disclosure || ""} onChange={e => patch("tcpa_disclosure", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-lg text-sm min-h-[120px]" />
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

        {/* Right pane — preview */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden bg-[#080f1a]">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8">
            <Eye className="w-4 h-4 text-white/30" />
            <span className="text-xs text-white/40">Live preview</span>
            <div className="ml-auto flex gap-1">
              <button onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-white/15 text-white" : "text-white/30 hover:text-white"}`}>
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded-md transition-colors ${previewMode === "desktop" ? "bg-white/15 text-white" : "text-white/30 hover:text-white"}`}>
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 flex justify-center">
            <div className={`transition-all ${previewMode === "mobile" ? "w-[390px]" : "w-full max-w-3xl"} overflow-y-auto`}>
              <LandingPageRenderer page={form} quiz={quiz} previewMode />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div>
      <label className="text-xs text-white/40 block mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function TrustBulletsEditor({ bullets, onChange }) {
  const add = () => onChange([...bullets, { icon: "CheckCircle", label: "" }]);
  const remove = (i) => onChange(bullets.filter((_, j) => j !== i));
  const update = (i, key, val) => onChange(bullets.map((b, j) => j === i ? { ...b, [key]: val } : b));

  return (
    <div className="space-y-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input value={b.icon || ""} onChange={e => update(i, "icon", e.target.value)} placeholder="Icon" className="bg-white/5 border-white/10 text-white rounded-lg text-sm w-28" />
          <Input value={b.label || ""} onChange={e => update(i, "label", e.target.value)} placeholder="Label" className="bg-white/5 border-white/10 text-white rounded-lg text-sm flex-1" />
          <button onClick={() => remove(i)} className="text-white/20 hover:text-red-400 transition-colors text-xs px-1">✕</button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-white/40 hover:text-white transition-colors mt-1">+ Add bullet</button>
    </div>
  );
}

function StoryBlocksEditor({ blocks, onChange }) {
  const add = () => onChange([...blocks, { type: "paragraph", text: "" }]);
  const remove = (i) => onChange(blocks.filter((_, j) => j !== i));
  const update = (i, val) => onChange(blocks.map((b, j) => j === i ? { ...b, text: val } : b));

  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <div key={i} className="relative">
          <Textarea value={b.text || ""} onChange={e => update(i, e.target.value)} placeholder="Story paragraph..." className="bg-white/5 border-white/10 text-white rounded-lg text-sm min-h-[80px] pr-7" />
          <button onClick={() => remove(i)} className="absolute top-2 right-2 text-white/20 hover:text-red-400 transition-colors text-xs">✕</button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-white/40 hover:text-white transition-colors">+ Add block</button>
    </div>
  );
}