import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { SERVICES_LIST } from "@/lib/servicesData";

const TCPA_TEMPLATE = `By clicking "{cta_label}" and submitting this form, I provide my electronic signature and express written consent to be contacted by HomeFixr and its service-provider partners at the phone number and email I provided, including via autodialed and pre-recorded calls and texts, regarding home-services offers — even if my number is on a Do-Not-Call list. Consent is not a condition of any purchase. Message and data rates may apply. Reply STOP to opt out. See our Privacy Policy and Terms.`;

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NewLandingPageDialog({ onClose, onCreated }) {
  const [activeTab, setActiveTab] = useState("prompt");

  // Prompt tab state
  const [promptText, setPromptText] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [linkedService, setLinkedService] = useState("");
  const [targetGeo, setTargetGeo] = useState("");
  const [preferredPath, setPreferredPath] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  // Blank tab state
  const [blankTitle, setBlankTitle] = useState("");
  const [blankSlug, setBlankSlug] = useState("");
  const [blankService, setBlankService] = useState("");
  const [creating, setCreating] = useState(false);

  const handleBlankTitleChange = (val) => {
    setBlankTitle(val);
    setBlankSlug(toSlug(val));
  };

  const handleCreateBlank = async () => {
    if (!blankTitle.trim()) return;
    setCreating(true);
    const slug = blankSlug || toSlug(blankTitle);
    const quiz = await base44.entities.LPQuiz.create({ name: `${blankTitle} Quiz`, questions: [], tcpa_required: true });
    const page = await base44.entities.LandingPage.create({
      title: blankTitle,
      slug,
      path: `/lp/${slug}`,
      service_slug: blankService || null,
      status: "draft",
      quiz_id: quiz.id,
      tcpa_disclosure: TCPA_TEMPLATE
    });
    onCreated(page.id);
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) return;
    setGenerating(true);
    setGenError("");

    const systemPrompt = `You write direct-response landing-page copy for HomeFixr, a US home-services lead-gen brand. Write for homeowners (not renters), mobile-first, US English. Keep quiz to 4–5 questions max. Always include homeowner-vs-renter (disqualify renters), ZIP code, and contact info + TCPA consent steps. Never reference South African markets, currencies, or laws. Return ONLY valid JSON matching the schema — no markdown, no extra text.`;

    const userPrompt = `Create a high-converting direct-response landing page for this campaign:

"${promptText}"${targetGeo ? `\nTarget geography: ${targetGeo}` : ""}${linkedService ? `\nLinked service: ${linkedService}` : ""}

Return a JSON object with this exact schema:
{
  "title": "string (internal label)",
  "slug": "string (kebab-case)",
  "hero": { "eyebrow": "string", "headline": "string", "subheadline": "string", "cta_label": "string" },
  "trust_bullets": [{ "icon": "string (lucide icon name)", "label": "string" }],
  "stats": { "headline_value": "string", "headline_label": "string", "secondary_value": "string", "secondary_label": "string", "body_copy": "string" },
  "story_blocks": [{ "type": "paragraph", "text": "string" }],
  "final_cta_label": "string",
  "quiz": {
    "name": "string",
    "questions": [
      { "id": "string", "label": "string", "type": "single|multi|text|phone|email|zip", "options": [{ "label": "string", "value": "string", "disqualifies": false }], "required": true, "helper_text": "" }
    ]
  },
  "seo_title": "string",
  "seo_description": "string"
}

Rules: 4–5 quiz questions. First question: homeowner yes/no (disqualify renters). Include a zip question. Final question must be contact info (type "text" with id "contact_info" — this is handled specially by the UI). Generate exactly 4 trust bullets. Story should be 2–3 paragraphs.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: userPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            slug: { type: "string" },
            hero: { type: "object" },
            trust_bullets: { type: "array" },
            stats: { type: "object" },
            story_blocks: { type: "array" },
            final_cta_label: { type: "string" },
            quiz: { type: "object" },
            seo_title: { type: "string" },
            seo_description: { type: "string" }
          }
        }
      });

      const slug = preferredPath
        ? preferredPath.replace(/^\/lp\//, "")
        : (result.slug || toSlug(result.title || "landing-page"));
      const path = preferredPath || `/lp/${slug}`;

      // Create quiz first
      const quiz = await base44.entities.LPQuiz.create({
        name: result.quiz?.name || `${result.title} Quiz`,
        questions: result.quiz?.questions || [],
        tcpa_required: true,
        success_route: `/lp/${slug}/thanks`
      });

      // Create landing page
      const page = await base44.entities.LandingPage.create({
        title: result.title,
        slug,
        path,
        service_slug: linkedService || null,
        status: "draft",
        hero: result.hero,
        trust_bullets: result.trust_bullets,
        stats: result.stats,
        story_blocks: result.story_blocks,
        final_cta_label: result.final_cta_label,
        quiz_id: quiz.id,
        seo_title: result.seo_title,
        seo_description: result.seo_description,
        tcpa_disclosure: TCPA_TEMPLATE.replace("{cta_label}", result.hero?.cta_label || "Get My Free Quote")
      });

      onCreated(page.id);
    } catch (err) {
      setGenError("Generation failed. Please try again.");
      setGenerating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#141e2e] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">New Landing Page</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 w-full">
            <TabsTrigger value="prompt" className="flex-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              From Prompt
            </TabsTrigger>
            <TabsTrigger value="blank" className="flex-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              Blank
            </TabsTrigger>
          </TabsList>

          {/* FROM PROMPT */}
          <TabsContent value="prompt" className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-white/50 block mb-1.5">Describe the landing page you want</label>
              <Textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder="Storm roofing campaign for DFW homeowners after recent hail — emphasize insurance coverage and 48-hour inspection window."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-[100px] rounded-xl"
              />
            </div>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                Advanced options
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div>
                  <label className="text-xs text-white/50 block mb-1.5">Linked service (optional)</label>
                  <Select value={linkedService} onValueChange={setLinkedService}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="Select a service..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {SERVICES_LIST.map(s => (
                        <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1.5">Target geography (optional)</label>
                  <Input
                    value={targetGeo}
                    onChange={e => setTargetGeo(e.target.value)}
                    placeholder="e.g. DFW, Tampa, Southeast US"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1.5">Preferred path (optional)</label>
                  <Input
                    value={preferredPath}
                    onChange={e => setPreferredPath(e.target.value)}
                    placeholder="/lp/storm-roofing-dfw"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {genError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{genError}</p>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" onClick={onClose} className="border-white/10 text-white/50">Cancel</Button>
              <Button
                onClick={handleGenerate}
                disabled={generating || !promptText.trim()}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1.5"
              >
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
              </Button>
            </div>
          </TabsContent>

          {/* BLANK */}
          <TabsContent value="blank" className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-white/50 block mb-1.5">Title (internal label)</label>
              <Input
                value={blankTitle}
                onChange={e => handleBlankTitleChange(e.target.value)}
                placeholder="Storm Roofing — Tampa Q3 2026"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1.5">Slug (auto-generated)</label>
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <span className="text-white/30">/lp/</span>
                <input
                  value={blankSlug}
                  onChange={e => setBlankSlug(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1.5">Linked service (optional)</label>
              <Select value={blankService} onValueChange={setBlankService}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                  <SelectValue placeholder="Select a service..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {SERVICES_LIST.map(s => (
                    <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" onClick={onClose} className="border-white/10 text-white/50">Cancel</Button>
              <Button
                onClick={handleCreateBlank}
                disabled={creating || !blankTitle.trim()}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                {creating ? "Creating..." : "Create Draft"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}