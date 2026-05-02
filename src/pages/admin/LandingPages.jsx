import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  Plus, Search, ExternalLink, Edit2, Copy, Trash2, Link2,
  Globe, FileText, Archive, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NewLandingPageDialog from "@/components/landing-page/NewLandingPageDialog";
import ConfirmDeleteModal from "@/components/landing-page/ConfirmDeleteModal";

const STATUS_STYLES = {
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  archived: "bg-white/5 text-white/30 border-white/10"
};

export default function LandingPages() {
  useEffect(() => { document.title = "Landing Pages — HomeFixr Admin"; }, []);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["landing-pages"],
    queryFn: () => base44.entities.LandingPage.list("-updated_date", 200)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LandingPage.delete(id),
    onSuccess: () => qc.invalidateQueries(["landing-pages"])
  });

  const cloneMutation = useMutation({
    mutationFn: async (page) => {
      // Find a unique slug with -copy suffix
      const baseSuffix = page.slug.endsWith("-copy") ? page.slug : `${page.slug}-copy`;
      const existingSlugs = pages.map(p => p.slug);
      let newSlug = baseSuffix;
      let counter = 2;
      while (existingSlugs.includes(newSlug)) {
        newSlug = `${baseSuffix}-${counter++}`;
      }
      const newPath = page.path
        ? page.path.replace(page.slug, newSlug)
        : `/lp/${newSlug}`;

      // Clone quiz if present
      let newQuizId = null;
      if (page.quiz_id) {
        const quiz = await base44.entities.LPQuiz.get(page.quiz_id);
        if (quiz) {
          const clonedQuiz = await base44.entities.LPQuiz.create({
            ...quiz,
            id: undefined,
            name: `${quiz.name} (copy)`
          });
          newQuizId = clonedQuiz.id;
        }
      }

      return base44.entities.LandingPage.create({
        ...page,
        id: undefined,
        slug: newSlug,
        path: newPath,
        title: `${page.title} (copy)`,
        status: "draft",
        quiz_id: newQuizId
      });
    },
    onSuccess: (newPage) => {
      qc.invalidateQueries(["landing-pages"]);
      navigate(`/admin/landing-pages/${newPage.id}`);
    }
  });

  const filtered = pages.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.path?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const copyURL = (path) => {
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white">Landing Pages</h1>
          <p className="text-white/40 text-sm mt-0.5">Build and manage campaign landing pages</p>
        </div>
        <Button
          onClick={() => setShowNewDialog(true)}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Landing Page
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or path..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_120px_100px_80px] gap-3 px-5 py-3 border-b border-white/8 text-xs font-semibold uppercase tracking-wider text-white/30">
          <span>Title / Path</span>
          <span>Linked Service</span>
          <span>Status</span>
          <span>Updated</span>
          <span></span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-white/30">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/40 text-sm">
              {pages.length === 0 ? "No landing pages yet. Create your first one!" : "No pages match your filters."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(page => (
              <div key={page.id} className="grid md:grid-cols-[2fr_1fr_120px_100px_80px] gap-3 px-5 py-4 items-center hover:bg-white/3 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{page.title}</p>
                  <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                    <Globe className="w-3 h-3" />{page.path}
                  </p>
                </div>
                <div className="text-xs text-white/50">
                  {page.service_slug || <span className="text-white/20">—</span>}
                </div>
                <div>
                  <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_STYLES[page.status] || STATUS_STYLES.draft}`}>
                    {page.status}
                  </span>
                </div>
                <div className="text-xs text-white/40">
                  {page.updated_date ? format(new Date(page.updated_date), "MMM d") : "—"}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Link
                    to={`/admin/landing-pages/${page.id}`}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  {page.status === "published" && (
                    <a
                      href={page.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                      title="View live"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => copyURL(page.path)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                    title="Copy URL"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => cloneMutation.mutate(page)}
                    disabled={cloneMutation.isPending}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                    title="Clone"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(page)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewDialog && (
        <NewLandingPageDialog
          onClose={() => setShowNewDialog(false)}
          onCreated={(id) => { setShowNewDialog(false); navigate(`/admin/landing-pages/${id}`); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.title}
          onConfirm={() => { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}