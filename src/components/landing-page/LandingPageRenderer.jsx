import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle, Phone, Shield, Clock, Award, Star, ChevronLeft,
  AlertCircle, CheckCircle2, Zap, CloudHail, Snowflake, Bug,
  SunMedium, Waves, Home, Droplets, Wind, ShieldCheck, DollarSign,
  Calendar, Users, ThumbsUp, Lock, Truck, FileText, HeartHandshake
} from "lucide-react";
import Logo from "@/components/layout/Logo";

const SITE_PHONE = "(800) 555-0199";

const ICON_MAP = {
  CheckCircle, CheckCircle2, Shield, ShieldCheck, Clock, Award, Star,
  Phone, Zap, CloudHail, Snowflake, Bug, SunMedium, Waves, Home,
  Droplets, Wind, DollarSign, Calendar, Users, ThumbsUp, Lock, Truck,
  FileText, HeartHandshake
};

function getIcon(name) {
  if (!name) return CheckCircle;
  return ICON_MAP[name] || CheckCircle;
}

export default function LandingPageRenderer({ page, quiz, previewMode = false }) {
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contactInfo, setContactInfo] = useState({ first_name: "", phone: "", email: "" });
  const [tcpaConsent, setTcpaConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [disqualified, setDisqualified] = useState(null);

  if (!page) return null;

  const phone = page.phone || SITE_PHONE;
  const hero = page.hero || {};
  const questions = quiz?.questions || [];
  const isContactStep = quizStep === questions.length;
  const totalSteps = questions.length + 1;
  const currentQuestion = !isContactStep ? questions[quizStep] : null;
  const progressPct = Math.round(((quizStep + 1) / totalSteps) * 100);

  const handleOptionSelect = (question, opt) => {
    const val = typeof opt === "object" ? opt.value : opt;
    const disqualifies = typeof opt === "object" ? opt.disqualifies : false;
    setAnswers(a => ({ ...a, [question.id]: val }));
    if (disqualifies) {
      setDisqualified("We're sorry — our services are currently only available to homeowners. If you're a renter, please share this link with your landlord.");
      return;
    }
    if (quizStep < questions.length) {
      setQuizStep(s => s + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tcpaConsent) return;
    setSubmitting(true);
    const now = new Date().toISOString();
    const urlParams = new URLSearchParams(window.location.search);
    try {
      await base44.entities.LPSubmission.create({
        landing_page_id: page.id || "preview",
        quiz_id: quiz?.id || null,
        answers: { ...answers, ...contactInfo },
        first_name: contactInfo.first_name,
        phone: contactInfo.phone,
        email: contactInfo.email,
        tcpa_consent_at: now,
        submitted_at: now,
        referrer: document.referrer,
        utm_source: urlParams.get("utm_source") || "",
        utm_medium: urlParams.get("utm_medium") || "",
        utm_campaign: urlParams.get("utm_campaign") || "",
        utm_content: urlParams.get("utm_content") || "",
        user_agent: navigator.userAgent
      });
      if (page.service_slug && !previewMode) {
        const serviceSlug = page.service_slug.replace("-summer", "").replace("-emergency", "");
        await base44.entities.Lead.create({
          service: serviceSlug,
          full_name: contactInfo.first_name,
          phone: contactInfo.phone,
          email: contactInfo.email,
          zip_code: answers.zip || answers.zip_code || "",
          is_homeowner: true,
          tcpa_consent: true,
          status: "new",
          sale_status: "unsold",
          qualified: true,
          notes: `LP: ${page.title} | Answers: ${JSON.stringify(answers)}`
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error", err);
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0F1B2D] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-white mb-3">You're all set!</h1>
        <p className="text-white/60 max-w-sm mb-8">A licensed local contractor will call you shortly. Check your email for confirmation.</p>
        <a
          href={`tel:${phone.replace(/\D/g, "")}`}
          className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-6 py-3 font-semibold text-sm"
        >
          <Phone className="w-4 h-4" /> Call now: {phone}
        </a>
        {!previewMode && (
          <Link to="/" className="mt-4 text-xs text-white/30 hover:text-white transition-colors">← Back to HomeFixr</Link>
        )}
      </div>
    );
  }

  if (disqualified) {
    return (
      <div className="min-h-screen bg-[#0F1B2D] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-white mb-3">Not quite a match</h1>
        <p className="text-white/60 max-w-sm mb-6">{disqualified}</p>
        <button
          onClick={() => { setDisqualified(null); setQuizStep(0); setAnswers({}); }}
          className="text-xs text-white/30 hover:text-white transition-colors"
        >
          ← Start over
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1B2D] bg-grain">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0F1B2D]/95 backdrop-blur-sm border-b border-white/8">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo light />
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-xs font-semibold hover:bg-secondary/90 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CALL </span>{phone}
          </a>
        </div>
      </header>

      {/* Hero + Quiz card */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
        {hero.eyebrow && (
          <p className="text-center text-xs text-secondary font-medium uppercase tracking-wider mb-3">{hero.eyebrow}</p>
        )}
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-white text-center leading-tight mb-2">
          {hero.headline || "Get Your Free Quote"}
        </h1>
        {quizStep === 0 && hero.subheadline && (
          <p className="text-white/60 text-sm text-center mb-5 max-w-lg mx-auto leading-relaxed">{hero.subheadline}</p>
        )}

        {/* Quiz card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-white/10">
            <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="p-5 md:p-6">
            {/* Content question */}
            {!isContactStep && currentQuestion && (
              <div>
                {quizStep > 0 && (
                  <button
                    onClick={() => setQuizStep(s => s - 1)}
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-white mb-4 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                <p className="text-xs text-white/40 mb-1">Question {quizStep + 1} of {totalSteps}</p>
                <h2 className="font-semibold text-white mb-4 text-base leading-snug">{currentQuestion.label}</h2>

                {(currentQuestion.type === "zip" || currentQuestion.type === "text") ? (
                  <div className="space-y-3">
                    <input
                      type={currentQuestion.type === "zip" ? "tel" : "text"}
                      inputMode={currentQuestion.type === "zip" ? "numeric" : "text"}
                      pattern={currentQuestion.type === "zip" ? "[0-9]{5}" : undefined}
                      maxLength={currentQuestion.type === "zip" ? 5 : undefined}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-secondary transition-colors"
                      placeholder={currentQuestion.type === "zip" ? "Enter ZIP code" : "Type your answer..."}
                      value={answers[currentQuestion.id] || ""}
                      onChange={e => setAnswers(a => ({ ...a, [currentQuestion.id]: e.target.value }))}
                    />
                    <button
                      onClick={() => { if (!answers[currentQuestion.id]) return; setQuizStep(s => s + 1); }}
                      disabled={!answers[currentQuestion.id]}
                      className="w-full bg-secondary hover:bg-secondary/90 disabled:opacity-40 text-secondary-foreground rounded-xl py-3.5 font-semibold text-sm transition-colors"
                    >
                      Continue →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {(currentQuestion.options || []).map((opt, i) => {
                      const label = typeof opt === "object" ? opt.label : opt;
                      const val = typeof opt === "object" ? opt.value : opt;
                      return (
                        <button
                          key={i}
                          onClick={() => handleOptionSelect(currentQuestion, opt)}
                          className={`min-h-[48px] rounded-xl border px-3 py-3 text-sm font-medium text-left transition-all hover:border-secondary hover:bg-secondary/10 ${
                            answers[currentQuestion.id] === val
                              ? "border-secondary bg-secondary/15 text-white"
                              : "border-white/15 text-white/80 bg-white/3"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Contact step */}
            {isContactStep && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {quizStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuizStep(s => s - 1)}
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-white mb-2 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                <h2 className="font-semibold text-white text-base">Where should we send your matches?</h2>
                <p className="text-xs text-white/40">Best contractors in your area will call within 1 hour.</p>
                <input
                  required
                  type="text"
                  placeholder="First name"
                  value={contactInfo.first_name}
                  onChange={e => setContactInfo(c => ({ ...c, first_name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-secondary placeholder:text-white/30 transition-colors"
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone number"
                  value={contactInfo.phone}
                  onChange={e => setContactInfo(c => ({ ...c, phone: e.target.value }))}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-secondary placeholder:text-white/30 transition-colors"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={contactInfo.email}
                  onChange={e => setContactInfo(c => ({ ...c, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-secondary placeholder:text-white/30 transition-colors"
                />
                {/* TCPA checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tcpaConsent}
                    onChange={e => setTcpaConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 flex-shrink-0 accent-secondary"
                  />
                  <span className="text-[11px] text-white/35 leading-relaxed">
                    {page.tcpa_disclosure || "By submitting, I consent to be contacted by HomeFixr and its partners regarding home-services offers. Consent is not a condition of purchase."}
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={!tcpaConsent || submitting}
                  className="w-full bg-secondary hover:bg-secondary/90 disabled:opacity-40 text-secondary-foreground rounded-xl py-4 font-bold text-base transition-colors shadow-glow"
                >
                  {submitting ? "Submitting..." : (hero.cta_label || "Get My Free Quote")}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Phone callout pill */}
        <div className="mt-4 flex justify-center">
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="inline-flex items-center gap-2 border border-white/15 rounded-full px-4 py-2 text-xs text-white/50 hover:text-white hover:border-white/30 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Prefer to call? <span className="text-white font-medium ml-1">{phone}</span>
          </a>
        </div>
      </div>

      {/* Trust + Stats section */}
      {(page.trust_bullets?.length > 0 || page.stats) && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {page.trust_bullets?.length > 0 && (
              <div>
                <h3 className="font-display text-xl font-semibold text-white mb-4">Why HomeFixr?</h3>
                <ul className="space-y-2.5">
                  {page.trust_bullets.map((b, i) => {
                    const Icon = getIcon(b.icon);
                    return (
                      <li key={i} className="flex items-start gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
                        <Icon className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-white/80">{b.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {page.stats && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                {page.stats.headline_value && (
                  <div className="mb-4">
                    <p className="font-display text-4xl font-bold text-secondary">{page.stats.headline_value}</p>
                    <p className="text-white/60 text-sm mt-1">{page.stats.headline_label}</p>
                  </div>
                )}
                {page.stats.secondary_value && (
                  <div className="mb-4 pl-4 border-l border-white/10">
                    <p className="font-display text-2xl font-semibold text-white">{page.stats.secondary_value}</p>
                    <p className="text-white/50 text-xs mt-0.5">{page.stats.secondary_label}</p>
                  </div>
                )}
                {page.stats.body_copy && (
                  <p className="text-sm text-white/60 leading-relaxed">{page.stats.body_copy}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Story */}
      {page.story_blocks?.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="space-y-4">
            {page.story_blocks.map((block, i) => (
              <p key={i} className="text-white/70 leading-relaxed text-sm md:text-base">{block.text}</p>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      {page.final_cta_label && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full py-4 font-bold text-base shadow-glow transition-colors"
          >
            {page.final_cta_label}
          </button>
        </div>
      )}

      {/* TCPA Footer */}
      <footer className="max-w-2xl mx-auto px-4 pb-10 pt-2">
        <div className="border-t border-white/8 pt-5">
          <p className="text-[10px] text-white/25 leading-relaxed mb-3">{page.tcpa_disclosure || ""}</p>
          <div className="flex gap-4 text-[10px] text-white/30">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/tcpa" className="hover:text-white transition-colors">TCPA Consent</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}