import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TCPA = `By clicking "{cta_label}" and submitting this form, I provide my electronic signature and express written consent to be contacted by HomeFixr and its service-provider partners at the phone number and email I provided, including via autodialed and pre-recorded calls and texts, regarding home-services offers — even if my number is on a Do-Not-Call list. Consent is not a condition of any purchase. Message and data rates may apply. Reply STOP to opt out. See our Privacy Policy and Terms.`;

const CAMPAIGNS = [
  {
    slug: "storm-roofing",
    path: "/lp/storm-roofing",
    title: "Storm-Damage Roofing — Summer 2026",
    service_slug: "storm-roofing",
    hero: {
      eyebrow: "Take the 30-Second Quiz to See If Your Roof Has Storm Damage",
      headline: "Storm Damage in Your Area? Get a Free Roof Inspection",
      subheadline: "Recent severe weather affected your area. Local licensed contractors are offering free inspections to homeowners who may have hidden roof damage covered by insurance.",
      cta_label: "Get My Free Inspection"
    },
    phone: "",
    trust_bullets: [
      { icon: "CheckCircle2", label: "Licensed local contractors only" },
      { icon: "CheckCircle2", label: "No cost or obligation for the inspection" },
      { icon: "CheckCircle2", label: "Insurance claim assistance available" },
      { icon: "CheckCircle2", label: "Inspections within 48 hours" }
    ],
    stats: {
      headline_value: "$1.2B+",
      headline_label: "Insurance Claims Paid",
      secondary_value: "Thousands",
      secondary_label: "of roofs inspected annually",
      body_copy: "We connect homeowners with vetted local roofing contractors nationwide. Most inspections find damage covered by insurance — minus your deductible."
    },
    story_blocks: [
      { type: "paragraph", text: "Your area was recently affected by severe weather. Even when there's no visible damage from the ground, hail can damage shingles, soft metal vents, and gutters in ways that lead to leaks months or years later — and insurance companies are more likely to deny claims as time passes." },
      { type: "paragraph", text: "A free professional inspection from a licensed local contractor takes 20 minutes. If damage is found, they can document it for your insurance claim and provide a quote for repair or full replacement (often covered entirely by your policy minus deductible)." },
      { type: "paragraph", text: "Why act now: Insurance claims are time-limited (most carriers require claims within 12 months). Hidden damage gets worse over time. The inspection is free — there's no reason to wait." }
    ],
    final_cta_label: "Get My Free Inspection",
    seo_title: "Free Storm Damage Roof Inspection — HomeFixr",
    seo_description: "Recent storm in your area? Get a free roof inspection from a licensed local contractor. Hidden damage is often covered by insurance.",
    quiz: {
      name: "Storm Roofing Quiz",
      questions: [
        {
          id: "homeowner",
          label: "Are you the homeowner?",
          type: "single",
          options: [
            { label: "Yes", value: "yes", disqualifies: false },
            { label: "No (renter)", value: "no", disqualifies: true },
            { label: "Yes, co-owner with spouse", value: "co-owner", disqualifies: false }
          ],
          required: true,
          helper_text: ""
        },
        {
          id: "zip",
          label: "What is your ZIP code?",
          type: "zip",
          options: [],
          required: true,
          helper_text: ""
        },
        {
          id: "roof_age",
          label: "When did you last have your roof inspected or replaced?",
          type: "single",
          options: [
            { label: "Less than 1 year ago", value: "under-1yr", disqualifies: false },
            { label: "1–3 years ago", value: "1-3yr", disqualifies: false },
            { label: "3–10 years ago", value: "3-10yr", disqualifies: false },
            { label: "More than 10 years ago", value: "10yr-plus", disqualifies: false },
            { label: "Never", value: "never", disqualifies: false }
          ],
          required: true,
          helper_text: ""
        }
      ],
      tcpa_required: true,
      success_route: "/lp/storm-roofing/thanks"
    }
  },
  {
    slug: "hvac-repair",
    path: "/lp/hvac-repair",
    title: "HVAC Emergency Repair & Replacement — Summer 2026",
    service_slug: "hvac-emergency",
    hero: {
      eyebrow: "Take the 30-Second Quiz — Same-Day HVAC Service Near You",
      headline: "AC Not Working? Same-Day Service in Your Area",
      subheadline: "Local licensed HVAC contractors are standing by. Call now for same-day diagnosis and repair. Most repairs completed in 1–2 hours.",
      cta_label: "Get Same-Day Service"
    },
    phone: "",
    trust_bullets: [
      { icon: "ShieldCheck", label: "Licensed & insured local contractors" },
      { icon: "Clock", label: "Same-day service available" },
      { icon: "DollarSign", label: "Upfront pricing — no surprises" },
      { icon: "CheckCircle2", label: "Financing options available" }
    ],
    stats: {
      headline_value: "Same-Day",
      headline_label: "Service Available",
      secondary_value: "1–2 hours",
      secondary_label: "Average Repair Time",
      body_copy: "We connect homeowners with vetted local HVAC contractors. From quick repairs to full system replacements with $0-down financing."
    },
    story_blocks: [
      { type: "paragraph", text: "It's the middle of summer's peak heat. When your AC stops working, every hour matters. We connect you with licensed local HVAC contractors who can diagnose and repair most issues same-day. No high-pressure sales, no hidden fees — just honest service from contractors with strong local reputations." },
      { type: "paragraph", text: "Most AC systems last 10–15 years. After year 10, repair costs spiral — and energy efficiency drops to 60% of original. Modern high-efficiency systems can cut your cooling bills 30–50% and qualify for federal tax credits up to $2,000." }
    ],
    final_cta_label: "Get Same-Day Service",
    seo_title: "Same-Day AC Repair & HVAC Replacement — HomeFixr",
    seo_description: "AC not working? Get same-day HVAC service from licensed local contractors. Most repairs completed in 1–2 hours.",
    quiz: {
      name: "HVAC Emergency Quiz",
      questions: [
        {
          id: "issue",
          label: "What's happening with your AC?",
          type: "single",
          options: [
            { label: "Not cooling at all", value: "no-cool", disqualifies: false },
            { label: "Working but barely / strange sounds", value: "barely", disqualifies: false },
            { label: "Looking to replace old system", value: "replace", disqualifies: false },
            { label: "General maintenance / tune-up", value: "maintenance", disqualifies: false }
          ],
          required: true,
          helper_text: ""
        },
        {
          id: "homeowner",
          label: "Are you the homeowner?",
          type: "single",
          options: [
            { label: "Yes", value: "yes", disqualifies: false },
            { label: "Renter", value: "renter", disqualifies: true }
          ],
          required: true,
          helper_text: ""
        },
        {
          id: "zip",
          label: "What is your ZIP code?",
          type: "zip",
          options: [],
          required: true,
          helper_text: ""
        },
        {
          id: "age",
          label: "How old is your current AC system?",
          type: "single",
          options: [
            { label: "Less than 5 years", value: "under-5", disqualifies: false },
            { label: "5–10 years", value: "5-10", disqualifies: false },
            { label: "More than 10 years", value: "10-plus", disqualifies: false },
            { label: "Don't know", value: "unknown", disqualifies: false }
          ],
          required: true,
          helper_text: "A licensed HVAC contractor will call you within 30 minutes."
        }
      ],
      tcpa_required: true,
      success_route: "/lp/hvac-repair/thanks"
    }
  },
  {
    slug: "pest-control",
    path: "/lp/pest-control",
    title: "Pest Control (Mosquito, Termite & General) — Summer 2026",
    service_slug: "pest-control-summer",
    hero: {
      eyebrow: "Take the 30-Second Quiz — Free First Treatment This Summer",
      headline: "A Mosquito-Free Backyard This Summer",
      subheadline: "Licensed local mosquito specialists treat your entire yard for the season. EPA-registered, kid + pet safe. First treatment free.",
      cta_label: "Get My Free Treatment"
    },
    phone: "",
    trust_bullets: [
      { icon: "ShieldCheck", label: "EPA-registered treatment" },
      { icon: "CheckCircle2", label: "Safe for kids and pets" },
      { icon: "Award", label: "Licensed local exterminators" },
      { icon: "ThumbsUp", label: "Money-back guarantee" }
    ],
    stats: {
      headline_value: "21-day",
      headline_label: "Treatment Lasts",
      secondary_value: "1-acre",
      secondary_label: "Coverage Standard",
      body_copy: "We connect homeowners with vetted local pest specialists for mosquito, termite, bed bug, rodent, and general pest control."
    },
    story_blocks: [
      { type: "paragraph", text: "Mosquitoes don't just ruin barbecues — they carry West Nile, Zika, and other diseases that put your family at risk. Citronella candles, sprays, and DIY traps barely scratch the surface." },
      { type: "paragraph", text: "Professional mosquito treatment targets where mosquitoes actually live: the shaded undersides of leaves, dense shrubs, and standing water in your yard. One treatment lasts 21 days — meaning you can actually USE your backyard all summer." },
      { type: "paragraph", text: "Local specialists are running a first-treatment-free promotion through summer. See if they cover your area." }
    ],
    final_cta_label: "Get My Free Treatment",
    seo_title: "Free Mosquito Treatment + Pest Control — HomeFixr",
    seo_description: "Get a free first pest control treatment this summer. Licensed local specialists treat mosquitoes, termites, and more.",
    quiz: {
      name: "Pest Control Quiz",
      questions: [
        {
          id: "pest",
          label: "What pest are you dealing with?",
          type: "single",
          options: [
            { label: "Mosquitoes (outdoor)", value: "mosquitoes", disqualifies: false },
            { label: "Termites", value: "termites", disqualifies: false },
            { label: "Bed bugs", value: "bed-bugs", disqualifies: false },
            { label: "Roaches/ants/general", value: "general", disqualifies: false },
            { label: "Rodents", value: "rodents", disqualifies: false },
            { label: "Multiple", value: "multiple", disqualifies: false }
          ],
          required: true,
          helper_text: ""
        },
        {
          id: "homeowner",
          label: "Are you the homeowner or renter?",
          type: "single",
          options: [
            { label: "Homeowner", value: "homeowner", disqualifies: false },
            { label: "Renter (with permission to treat)", value: "renter-permission", disqualifies: false },
            { label: "Renter (no permission)", value: "renter-no", disqualifies: true }
          ],
          required: true,
          helper_text: ""
        },
        {
          id: "zip",
          label: "What is your ZIP code?",
          type: "zip",
          options: [],
          required: true,
          helper_text: "Local pest specialists will call within 1 hour to schedule your free inspection."
        }
      ],
      tcpa_required: true,
      success_route: "/lp/pest-control/thanks"
    }
  },
  {
    slug: "solar",
    path: "/lp/solar",
    title: "Solar + Battery Backup — 2026",
    service_slug: "solar-summer",
    hero: {
      eyebrow: "Take the 60-Second Quiz to See Your Home's Solar Savings",
      headline: "See If Your Home Qualifies for Solar",
      subheadline: "Homeowners are eliminating their electric bills with $0-down solar — and saving an average of $2,400/year. The 30% federal tax credit makes 2026 the best year to install. See your home's free custom quote in 60 seconds.",
      cta_label: "Check My Home's Solar Potential"
    },
    phone: "",
    trust_bullets: [
      { icon: "Award", label: "30% federal tax credit (through 2032)" },
      { icon: "DollarSign", label: "$0 down financing available" },
      { icon: "ShieldCheck", label: "Local licensed installers only" },
      { icon: "CheckCircle2", label: "25-year equipment warranties" }
    ],
    stats: {
      headline_value: "$2,400+/yr",
      headline_label: "Average Savings",
      secondary_value: "30%",
      secondary_label: "Federal Tax Credit",
      body_copy: "We connect homeowners with vetted local solar installers. Most homes qualify for $0-down financing where the monthly payment is less than the current electric bill."
    },
    story_blocks: [
      { type: "paragraph", text: "Power costs are up 38% over the past 5 years. Most homeowners are paying $200–$400/month and watching that number rise. A modern solar system, paired with the 30% federal tax credit, eliminates 80–100% of your electric bill — and your monthly payment is typically LESS than what you're paying the utility company today." },
      { type: "paragraph", text: "Add a battery backup and you also have power during outages. The catch: solar isn't right for every home. Roof orientation, shade, age, and your utility's net metering policies all matter. We connect you with vetted local installers who'll show you the actual savings for your specific home — free, with no obligation." }
    ],
    final_cta_label: "Check My Home's Solar Potential",
    seo_title: "See If Your Home Qualifies for Solar — HomeFixr",
    seo_description: "Get a free custom solar quote. Average savings $2,400/year. $0-down financing available. 30% federal tax credit through 2032.",
    quiz: {
      name: "Solar Qualification Quiz",
      questions: [
        {
          id: "ownership",
          label: "Do you own or rent your home?",
          type: "single",
          options: [
            { label: "Own", value: "own", disqualifies: false },
            { label: "Rent", value: "rent", disqualifies: true }
          ],
          required: true,
          helper_text: ""
        },
        {
          id: "bill",
          label: "Approximately what is your average monthly electric bill?",
          type: "single",
          options: [
            { label: "Under $80", value: "under-80", disqualifies: false },
            { label: "$80–$150", value: "80-150", disqualifies: false },
            { label: "$150–$250", value: "150-250", disqualifies: false },
            { label: "More than $250", value: "250-plus", disqualifies: false }
          ],
          required: true,
          helper_text: ""
        },
        {
          id: "zip",
          label: "What is your ZIP code?",
          type: "zip",
          options: [],
          required: true,
          helper_text: ""
        },
        {
          id: "roof_age",
          label: "What is the approximate age of your roof?",
          type: "single",
          options: [
            { label: "Less than 5 years", value: "under-5", disqualifies: false },
            { label: "5–15 years", value: "5-15", disqualifies: false },
            { label: "More than 15 years", value: "15-plus", disqualifies: false },
            { label: "Recently replaced", value: "recent", disqualifies: false }
          ],
          required: true,
          helper_text: "A licensed solar installer will call within 30 minutes with your free custom quote."
        }
      ],
      tcpa_required: true,
      success_route: "/lp/solar/thanks"
    }
  },
  {
    slug: "pool-installation",
    path: "/lp/pool-installation",
    title: "Pool Design & Installation — Summer 2026",
    service_slug: "pool-installation",
    hero: {
      eyebrow: "Take the 30-Second Quiz — Pool by Summer 2026",
      headline: "Get a Pool by Summer — Free Design + Quote",
      subheadline: "Local licensed pool builders are booking spring/summer 2026 installs now. Custom design consultation is free. Most pools install in 6–10 weeks. Financing from $300/month with 0% down options.",
      cta_label: "Get My Free Pool Quote"
    },
    phone: "",
    trust_bullets: [
      { icon: "ShieldCheck", label: "Licensed local pool builders only" },
      { icon: "CheckCircle2", label: "Free design consultation, no commitment" },
      { icon: "DollarSign", label: "0% down financing available" },
      { icon: "Award", label: "25-year structural warranties" }
    ],
    stats: {
      headline_value: "From $300/mo",
      headline_label: "Financing Available",
      secondary_value: "6–10 weeks",
      secondary_label: "Average Install Time",
      body_copy: "We connect homeowners with vetted local pool builders for in-ground gunite, fiberglass, and custom designs."
    },
    story_blocks: [
      { type: "paragraph", text: "A pool isn't just a backyard upgrade — it's where summers happen for the next 20 years. Kids learn to swim. Friends gather. Property value rises. The hardest part is choosing the right design and builder." },
      { type: "paragraph", text: "Custom pools range from $35,000 (basic in-ground) to $150,000+ (luxury with spa, water features, decking). With 0% financing, monthly payments often start under $300 — and the equity stays in your home." },
      { type: "paragraph", text: "We connect you with up to 3 vetted local pool builders who'll provide free 3D designs and quotes. Compare options. Choose the right fit. Most homeowners book a builder within 2–3 weeks of consultation." }
    ],
    final_cta_label: "Get My Free Pool Quote",
    seo_title: "Get a Pool by Summer 2026 — Free Design & Quote",
    seo_description: "Local licensed pool builders are booking summer installs now. Free 3D design consultation. Financing from $300/month.",
    quiz: {
      name: "Pool Installation Quiz",
      questions: [
        {
          id: "homeowner",
          label: "Do you own your home?",
          type: "single",
          options: [
            { label: "Yes", value: "yes", disqualifies: false },
            { label: "Renter", value: "renter", disqualifies: true }
          ],
          required: true,
          helper_text: ""
        },
        {
          id: "zip",
          label: "What is your ZIP code?",
          type: "zip",
          options: [],
          required: true,
          helper_text: ""
        },
        {
          id: "pool_type",
          label: "What type of pool are you considering?",
          type: "single",
          options: [
            { label: "In-ground (gunite/concrete)", value: "gunite", disqualifies: false },
            { label: "In-ground (fiberglass)", value: "fiberglass", disqualifies: false },
            { label: "Above-ground", value: "above-ground", disqualifies: false },
            { label: "Not sure / open to options", value: "unsure", disqualifies: false }
          ],
          required: true,
          helper_text: ""
        },
        {
          id: "timeline",
          label: "What's your timeline for installation?",
          type: "single",
          options: [
            { label: "Within 3 months", value: "3mo", disqualifies: false },
            { label: "3–6 months", value: "3-6mo", disqualifies: false },
            { label: "6–12 months", value: "6-12mo", disqualifies: false },
            { label: "More than a year / just exploring", value: "exploring", disqualifies: false }
          ],
          required: true,
          helper_text: "A licensed local pool builder will call within 1 hour to schedule your free design consultation."
        }
      ],
      tcpa_required: true,
      success_route: "/lp/pool-installation/thanks"
    }
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const created = [];
    const skipped = [];

    for (const campaign of CAMPAIGNS) {
      // Idempotent: skip if slug already exists
      const existing = await base44.asServiceRole.entities.LandingPage.filter({ slug: campaign.slug });
      if (existing.length > 0) {
        skipped.push(campaign.slug);
        continue;
      }

      // Create quiz
      const quiz = await base44.asServiceRole.entities.LPQuiz.create({
        name: campaign.quiz.name,
        questions: campaign.quiz.questions,
        tcpa_required: campaign.quiz.tcpa_required,
        success_route: campaign.quiz.success_route
      });

      // Create landing page
      const tcpa = TCPA.replace('{cta_label}', campaign.hero.cta_label);
      await base44.asServiceRole.entities.LandingPage.create({
        slug: campaign.slug,
        path: campaign.path,
        title: campaign.title,
        service_slug: campaign.service_slug,
        status: 'published',
        hero: campaign.hero,
        phone: campaign.phone,
        trust_bullets: campaign.trust_bullets,
        stats: campaign.stats,
        story_blocks: campaign.story_blocks,
        final_cta_label: campaign.final_cta_label,
        quiz_id: quiz.id,
        seo_title: campaign.seo_title,
        seo_description: campaign.seo_description,
        tcpa_disclosure: tcpa,
        webhook_endpoints: []
      });

      created.push(campaign.slug);
    }

    return Response.json({ message: 'Seed complete', created, skipped });
  } catch (error) {
    console.error('Seed error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});