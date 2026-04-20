import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

import Logo from "@/components/layout/Logo";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuizStepWrapper from "@/components/quiz/QuizStepWrapper";
import OptionCard from "@/components/quiz/OptionCard";
import ServiceQuestion from "@/components/quiz/ServiceQuestions";
import ContactForm from "@/components/quiz/ContactForm";

import { SERVICES_LIST, getService } from "@/lib/servicesData";
import { qualifyLead } from "@/lib/qualify";

const TIMELINES = [
  { value: "asap", label: "ASAP — as soon as possible" },
  { value: "1-3-months", label: "Within 1–3 months" },
  { value: "3-6-months", label: "Within 3–6 months" },
  { value: "researching", label: "Just researching" }
];

export default function Quiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselect = searchParams.get("service");

  useEffect(() => {
    document.title = "Get Free Quotes — HomeFixr Quiz";
  }, []);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    service: preselect || "",
    is_homeowner: null,
    is_residential: null,
    timeline: "",
    budget: "",
    zip_code: "",
    service_details: {},
    full_name: "",
    email: "",
    phone: "",
    best_time: "",
    tcpa_consent: false
  });

  const service = getService(data.service);
  const serviceQuestions = service?.questions || [];

  // Build dynamic step list
  const steps = useMemo(() => {
    const base = [
      "service",
      "is_homeowner",
      "is_residential",
      "timeline",
      "budget",
      "zip_code",
      ...serviceQuestions.map(q => `sq_${q.id}`),
      "contact"
    ];
    return base;
  }, [serviceQuestions]);

  const totalSteps = steps.length;
  const currentKey = steps[step];

  const setField = (key, val) => setData(d => ({ ...d, [key]: val }));
  const setServiceDetail = (key, val) =>
    setData(d => ({ ...d, service_details: { ...d.service_details, [key]: val } }));

  const canProceed = () => {
    switch (currentKey) {
      case "service": return !!data.service;
      case "is_homeowner": return data.is_homeowner !== null;
      case "is_residential": return data.is_residential !== null;
      case "timeline": return !!data.timeline;
      case "budget": return !!data.budget;
      case "zip_code": return /^\d{5}$/.test(data.zip_code);
      case "contact": return true; // validated on submit
      default:
        if (currentKey?.startsWith("sq_")) {
          const qid = currentKey.slice(3);
          const q = serviceQuestions.find(q => q.id === qid);
          const v = data.service_details[qid];
          if (q?.type === "multi") return Array.isArray(v) && v.length > 0;
          if (q?.type === "text") return !!v && v.trim().length > 3;
          return !!v;
        }
        return true;
    }
  };

  // Steps where user must explicitly press Continue (multi-select, text input, zip, contact)
  const isManualStep = () => {
    if (currentKey === "zip_code" || currentKey === "contact") return true;
    if (currentKey?.startsWith("sq_")) {
      const qid = currentKey.slice(3);
      const q = serviceQuestions.find(q => q.id === qid);
      return q?.type === "multi" || q?.type === "text";
    }
    return false;
  };

  const next = () => {
    if (!canProceed()) return;
    if (step < totalSteps - 1) setStep(s => s + 1);
    else submit();
  };
  const back = () => {
    if (step > 0) setStep(s => s - 1);
    else navigate("/");
  };

  // Auto-advance after a single-select pick (with tiny delay for visual feedback)
  const pickAndAdvance = (setFn) => {
    setFn();
    setTimeout(() => {
      setStep(s => s < totalSteps - 1 ? s + 1 : s);
    }, 180);
  };

  const validateContact = () => {
    const errs = {};
    if (!data.full_name || data.full_name.trim().length < 2) errs.full_name = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "")) errs.email = "Please enter a valid email";
    const phoneDigits = (data.phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 10) errs.phone = "Please enter a valid phone number";
    if (!data.tcpa_consent) errs.tcpa_consent = "Please agree to be contacted to submit";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validateContact()) return;
    setSubmitting(true);
    const { qualified, reason } = qualifyLead(data);
    try {
      await base44.entities.Lead.create({
        ...data,
        qualified,
        disqualification_reason: reason || ""
      });
      navigate(qualified ? "/thank-you" : "/thank-you-unmatched", {
        state: { service: data.service, reason }
      });
    } catch (e) {
      setErrors({ submit: "Something went wrong. Please try again." });
      setSubmitting(false);
    }
  };

  // Render step content
  const renderStep = () => {
    if (currentKey === "service") {
      return (
        <QuizStepWrapper title="Which service do you need?" subtitle="Pick the category closest to your project.">
          {SERVICES_LIST.map(s => (
            <OptionCard
              key={s.slug}
              label={s.name}
              icon={s.icon}
              selected={data.service === s.slug}
              onClick={() => pickAndAdvance(() => setData(d => ({ ...d, service: s.slug, service_details: {} })))}
            />
          ))}
        </QuizStepWrapper>
      );
    }

    if (currentKey === "is_homeowner") {
      return (
        <QuizStepWrapper title="Are you the homeowner?" subtitle="We only work with homeowners and authorized decision-makers.">
          <OptionCard label="Yes, I'm the homeowner" selected={data.is_homeowner === true} onClick={() => pickAndAdvance(() => setField("is_homeowner", true))} />
          <OptionCard label="No, I'm not" selected={data.is_homeowner === false} onClick={() => pickAndAdvance(() => setField("is_homeowner", false))} />
        </QuizStepWrapper>
      );
    }

    if (currentKey === "is_residential") {
      return (
        <QuizStepWrapper title="Is this for a residential property?" subtitle="HomeFixr serves residential projects only — not commercial or industrial.">
          <OptionCard label="Yes, residential" selected={data.is_residential === true} onClick={() => pickAndAdvance(() => setField("is_residential", true))} />
          <OptionCard label="No, commercial or other" selected={data.is_residential === false} onClick={() => pickAndAdvance(() => setField("is_residential", false))} />
        </QuizStepWrapper>
      );
    }

    if (currentKey === "timeline") {
      return (
        <QuizStepWrapper title="When would you like to start?" subtitle="This helps us match you with pros available on your schedule.">
          {TIMELINES.map(t => (
            <OptionCard key={t.value} label={t.label} selected={data.timeline === t.value} onClick={() => pickAndAdvance(() => setField("timeline", t.value))} />
          ))}
        </QuizStepWrapper>
      );
    }

    if (currentKey === "budget") {
      return (
        <QuizStepWrapper title="What's your budget range?" subtitle="We'll only match you with pros who can work within your range — no wasted quotes.">
          {service.budgetOptions.map(b => (
            <OptionCard key={b.value} label={b.label} selected={data.budget === b.value} onClick={() => pickAndAdvance(() => setField("budget", b.value))} />
          ))}
        </QuizStepWrapper>
      );
    }

    if (currentKey === "zip_code") {
      return (
        <QuizStepWrapper title="What's your ZIP code?" subtitle="We'll match you with pros local to your area.">
          <div className="max-w-xs">
            <Label htmlFor="zip" className="text-sm font-medium mb-2 block">ZIP code</Label>
            <Input
              id="zip"
              inputMode="numeric"
              maxLength={5}
              value={data.zip_code}
              onChange={(e) => setField("zip_code", e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="12345"
              className="h-14 text-2xl font-semibold tracking-widest text-center rounded-xl"
            />
            {data.zip_code && !/^\d{5}$/.test(data.zip_code) && (
              <p className="text-xs text-muted-foreground mt-2">Enter 5 digits</p>
            )}
          </div>
        </QuizStepWrapper>
      );
    }

    if (currentKey?.startsWith("sq_")) {
      const qid = currentKey.slice(3);
      const q = serviceQuestions.find(q => q.id === qid);
      if (!q) return null;
      const handleChange = (v) => {
        setServiceDetail(qid, v);
        // Auto-advance only for single-select service questions
        if (q.type === "single") {
          setTimeout(() => setStep(s => s < totalSteps - 1 ? s + 1 : s), 180);
        }
      };
      return (
        <QuizStepWrapper title={q.label} subtitle={q.type === "multi" ? "Select all that apply." : undefined}>
          <ServiceQuestion
            question={q}
            value={data.service_details[qid]}
            onChange={handleChange}
          />
        </QuizStepWrapper>
      );
    }

    if (currentKey === "contact") {
      return (
        <QuizStepWrapper title="Where should we send your matches?" subtitle="Almost done. Your info stays private — only shared with your matched pros.">
          <ContactForm data={data} onChange={setData} errors={errors} />
          {errors.submit && <p className="text-sm text-destructive mt-3">{errors.submit}</p>}
        </QuizStepWrapper>
      );
    }

    return null;
  };

  const isLast = step === totalSteps - 1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple quiz header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Exit</Link>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-4">
          <QuizProgress current={step + 1} total={totalSteps} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start md:items-center py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-5 md:px-8 w-full">
          <AnimatePresence mode="wait">
            <div key={currentKey}>{renderStep()}</div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={submitting} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          {(isManualStep() || isLast) && (
            <Button
              onClick={next}
              disabled={!canProceed() || submitting}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-12 px-6 shadow-soft"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : isLast ? (
                <>Submit <ArrowRight className="w-4 h-4 ml-1.5" /></>
              ) : (
                <>Continue <ArrowRight className="w-4 h-4 ml-1.5" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}