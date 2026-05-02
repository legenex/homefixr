import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import LandingPageRenderer from "@/components/landing-page/LandingPageRenderer";

export default function PublicLandingPage() {
  const location = useLocation();
  const [page, setPage] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    base44.entities.LandingPage.list("-created_date", 500)
      .then(async (allPages) => {
        const pages = allPages.filter(p => p.path === currentPath && p.status === "published");
        if (pages.length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const p = pages[0];
        setPage(p);
        if (p.seo_title) document.title = p.seo_title;
        if (p.quiz_id) {
          const q = await base44.entities.LPQuiz.get(p.quiz_id);
          setQuiz(q);
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1B2D] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-[#0F1B2D] flex flex-col items-center justify-center text-center px-4">
        <p className="text-white/40 text-sm">This page doesn't exist or isn't published yet.</p>
      </div>
    );
  }

  return <LandingPageRenderer page={page} quiz={quiz} />;
}