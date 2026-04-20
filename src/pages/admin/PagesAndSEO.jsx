import { useEffect, useState } from "react";
import { Globe, Search, CheckCircle2, Save, ExternalLink, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SERVICES_LIST } from "@/lib/servicesData";
import { Link } from "react-router-dom";

const PAGES = [
  { path: "/", title: "Home", desc: "HomeFixr — Your home, fixed right. Free quotes from vetted local pros.", keywords: "home improvement, local contractors, free quotes, vetted pros" },
  { path: "/about", title: "About Us", desc: "Learn how HomeFixr connects homeowners with the best local service providers.", keywords: "about homefixr, trusted home pros" },
  { path: "/quiz", title: "Get Free Quotes", desc: "Tell us about your project and get matched with vetted local pros in minutes.", keywords: "free home improvement quotes, match a contractor" },
  ...SERVICES_LIST.map(s => ({
    path: `/services/${s.slug}`,
    title: s.name,
    desc: s.description,
    keywords: `${s.name.toLowerCase()}, local ${s.short.toLowerCase()} pros, free quotes`
  }))
];

export default function PagesAndSEO() {
  useEffect(() => { document.title = "Pages & SEO — HomeFixr Admin"; }, []);
  const [editing, setEditing] = useState(null);
  const [pages, setPages] = useState(PAGES);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setEditing(null);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Pages & SEO</h1>
        <p className="text-white/40 text-sm mt-1">Manage meta titles, descriptions, and SEO for all pages</p>
      </div>

      {/* Global SEO */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-secondary" /> Global settings</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Site name</label>
            <Input defaultValue="HomeFixr" className="bg-white/5 border-white/10 text-white rounded-xl h-10" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Default separator</label>
            <Input defaultValue=" — " className="bg-white/5 border-white/10 text-white rounded-xl h-10" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Canonical base URL</label>
            <Input defaultValue="https://homefixr.com" className="bg-white/5 border-white/10 text-white rounded-xl h-10" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">robots.txt</label>
            <Input defaultValue="index, follow" className="bg-white/5 border-white/10 text-white rounded-xl h-10" />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs text-white/40 mb-1.5 block">Default OG image URL</label>
          <Input defaultValue="https://homefixr.com/og-image.png" className="bg-white/5 border-white/10 text-white rounded-xl h-10" />
        </div>
      </div>

      {/* Pages */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8 flex items-center gap-2">
          <Search className="w-4 h-4 text-secondary" />
          <h2 className="text-sm font-semibold text-white/80">Page SEO ({pages.length} pages)</h2>
        </div>
        <div className="divide-y divide-white/5">
          {pages.map((p, i) => (
            <div key={i}>
              <div className="flex items-center justify-between px-6 py-4 hover:bg-white/3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{p.title}</p>
                    <Link to={p.path} target="_blank" className="text-white/20 hover:text-secondary">
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-xs text-white/30 font-mono mt-0.5">{p.path}</p>
                  {editing !== i && <p className="text-xs text-white/40 mt-1 truncate max-w-lg">{p.desc}</p>}
                </div>
                <button
                  onClick={() => setEditing(editing === i ? null : i)}
                  className="ml-4 p-2 rounded-lg hover:bg-white/8 text-white/30 hover:text-white transition-colors flex-shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {editing === i && (
                <div className="px-6 pb-5 bg-black/20 space-y-3 border-t border-white/5">
                  <div className="pt-4">
                    <label className="text-xs text-white/40 mb-1.5 block">Meta title</label>
                    <Input
                      value={p.title}
                      onChange={e => setPages(ps => ps.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                      className="bg-white/5 border-white/10 text-white rounded-xl h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Meta description (150–160 chars)</label>
                    <Textarea
                      value={p.desc}
                      onChange={e => setPages(ps => ps.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))}
                      className="bg-white/5 border-white/10 text-white rounded-xl min-h-[80px] text-sm"
                    />
                    <p className="text-xs text-white/20 mt-1 text-right">{p.desc.length} chars</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Keywords</label>
                    <Input
                      value={p.keywords}
                      onChange={e => setPages(ps => ps.map((x, j) => j === i ? { ...x, keywords: e.target.value } : x))}
                      className="bg-white/5 border-white/10 text-white rounded-xl h-10"
                    />
                  </div>
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/90">
                    <Save className="w-3.5 h-3.5" /> Save changes
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-6 right-6 bg-secondary text-secondary-foreground px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4" /> Changes saved
        </div>
      )}
    </div>
  );
}