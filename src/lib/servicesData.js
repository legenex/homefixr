// Central services config - one source of truth for all 7 services
import {
  ChefHat, Bath, Layers, Home, Hammer, Zap, Droplets
} from "lucide-react";

export const SERVICES = {
  "kitchen-remodeling": {
    slug: "kitchen-remodeling",
    name: "Kitchen Remodeling",
    short: "Kitchen",
    icon: ChefHat,
    tagline: "Design the kitchen you've always dreamed of.",
    description: "From full remodels to cabinet refreshes, connect with top kitchen pros in your area.",
    heroImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80",
    includes: [
      "Full kitchen remodels",
      "Custom cabinetry & countertops",
      "Backsplash & tile work",
      "Appliance installation",
      "Lighting & electrical upgrades",
      "Layout & floor plan changes"
    ],
    benefits: [
      { title: "Design consultation", desc: "Work with pros who understand layout, storage, and flow." },
      { title: "Transparent pricing", desc: "Compare itemized quotes side-by-side." },
      { title: "Quality materials", desc: "Access to trusted cabinet, counter, and appliance suppliers." },
      { title: "Licensed contractors", desc: "Every pro is vetted, licensed, and insured." }
    ],
    budgetOptions: [
      { value: "under-10k", label: "Under $10,000", qualified: false },
      { value: "10k-25k", label: "$10,000 – $25,000", qualified: true },
      { value: "25k-50k", label: "$25,000 – $50,000", qualified: true },
      { value: "50k-100k", label: "$50,000 – $100,000", qualified: true },
      { value: "100k-plus", label: "$100,000+", qualified: true }
    ],
    questions: [
      {
        id: "scope",
        label: "What's the scope of your project?",
        type: "single",
        options: ["Full remodel", "Partial remodel", "Cabinets only", "Countertops only"]
      },
      {
        id: "size",
        label: "How would you describe your kitchen size?",
        type: "single",
        options: ["Small (under 100 sq ft)", "Medium (100–200 sq ft)", "Large (200+ sq ft)"]
      },
      {
        id: "changes",
        label: "What would you like to change? (select all)",
        type: "multi",
        options: ["Cabinets", "Countertops", "Flooring", "Appliances", "Layout", "Lighting", "Backsplash"]
      }
    ],
    faqs: [
      { q: "How long does a kitchen remodel take?", a: "Most projects take 4–8 weeks depending on scope. Full gut remodels may take 10–12 weeks." },
      { q: "Do I need permits?", a: "Often yes — especially for electrical, plumbing, or structural changes. Your pro will handle this." },
      { q: "Can I stay in my home during the remodel?", a: "Yes, though expect kitchen to be unusable for several weeks. Your pro will help you plan." },
      { q: "What's the ROI on a kitchen remodel?", a: "Kitchens typically return 60–80% of the investment and are the #1 feature buyers look at." }
    ]
  },

  "bathroom-remodeling": {
    slug: "bathroom-remodeling",
    name: "Bathroom Remodeling",
    short: "Bathroom",
    icon: Bath,
    tagline: "Transform your bathroom into a spa-like retreat.",
    description: "Full remodels, tub-to-shower conversions, vanities, and more from trusted pros.",
    heroImage: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&q=80",
    includes: [
      "Full bathroom remodels",
      "Tub-to-shower conversions",
      "Vanity & fixture upgrades",
      "Tile, flooring & waterproofing",
      "Plumbing & lighting updates",
      "Accessibility features"
    ],
    benefits: [
      { title: "Waterproofing experts", desc: "Pros who know how to do it right the first time." },
      { title: "Design flexibility", desc: "From classic to modern spa, pros match your vision." },
      { title: "On-time delivery", desc: "Clear timelines so you're never left without a bathroom." },
      { title: "Licensed & insured", desc: "Every contractor is vetted for quality." }
    ],
    budgetOptions: [
      { value: "under-5k", label: "Under $5,000", qualified: false },
      { value: "5k-15k", label: "$5,000 – $15,000", qualified: true },
      { value: "15k-30k", label: "$15,000 – $30,000", qualified: true },
      { value: "30k-plus", label: "$30,000+", qualified: true }
    ],
    questions: [
      {
        id: "scope",
        label: "What's the scope of your project?",
        type: "single",
        options: ["Full remodel", "Partial remodel", "Tub-to-shower conversion", "Vanity only"]
      },
      {
        id: "num_bathrooms",
        label: "How many bathrooms?",
        type: "single",
        options: ["1", "2", "3+"]
      },
      {
        id: "changes",
        label: "What would you like to change? (select all)",
        type: "multi",
        options: ["Shower/Tub", "Vanity", "Toilet", "Tile", "Flooring", "Lighting", "Plumbing fixtures"]
      }
    ],
    faqs: [
      { q: "How long does a bathroom remodel take?", a: "Typically 2–4 weeks for standard remodels, longer for major overhauls." },
      { q: "Will I be without a bathroom?", a: "If it's your only one, pros often work in phases. Otherwise plan for it to be offline." },
      { q: "Do I need permits?", a: "Plumbing and electrical changes usually require permits. Your pro handles this." },
      { q: "Can I convert a tub to a shower?", a: "Yes, and it's one of the most popular upgrades — great for accessibility and modern look." }
    ]
  },

  "flooring": {
    slug: "flooring",
    name: "Flooring",
    short: "Flooring",
    icon: Layers,
    tagline: "Beautiful, durable floors installed right.",
    description: "Hardwood, laminate, vinyl, tile, or carpet — matched with expert installers near you.",
    heroImage: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=1600&q=80",
    includes: [
      "Hardwood installation & refinishing",
      "Laminate & luxury vinyl (LVP)",
      "Tile & stone flooring",
      "Carpet installation",
      "Subfloor repair",
      "Whole-home flooring projects"
    ],
    benefits: [
      { title: "Material guidance", desc: "Pros help you choose what fits your lifestyle and budget." },
      { title: "Precision installation", desc: "Proper prep and installation = floors that last." },
      { title: "Fast turnaround", desc: "Most rooms completed in 1–3 days." },
      { title: "Warranty-backed work", desc: "Covered installation from licensed pros." }
    ],
    budgetOptions: [
      { value: "under-2k", label: "Under $2,000", qualified: false },
      { value: "2k-5k", label: "$2,000 – $5,000", qualified: true },
      { value: "5k-15k", label: "$5,000 – $15,000", qualified: true },
      { value: "15k-plus", label: "$15,000+", qualified: true }
    ],
    questions: [
      {
        id: "flooring_type",
        label: "What type of flooring are you considering?",
        type: "single",
        options: ["Hardwood", "Laminate", "Luxury Vinyl (LVP)", "Tile", "Carpet", "Not sure yet"]
      },
      {
        id: "square_footage",
        label: "Approximate square footage?",
        type: "single",
        options: ["Under 300 sq ft", "300–800 sq ft", "800–1,500 sq ft", "1,500+ sq ft"]
      },
      {
        id: "rooms",
        label: "Which rooms? (select all)",
        type: "multi",
        options: ["Living room", "Bedrooms", "Kitchen", "Bathroom", "Basement", "Whole home", "Other"]
      }
    ],
    faqs: [
      { q: "Which flooring lasts longest?", a: "Tile and quality hardwood last 50+ years. LVP is very durable for the price." },
      { q: "How long does installation take?", a: "Most rooms are done in 1–2 days. Whole homes take 3–7 days." },
      { q: "Do I need to remove furniture?", a: "Pros can often help move furniture as part of the job — ask during quote." },
      { q: "Is underlayment included?", a: "Quality installers include proper underlayment and moisture barriers in their quote." }
    ]
  },

  "roofing": {
    slug: "roofing",
    name: "Roofing",
    short: "Roofing",
    icon: Home,
    tagline: "Protect your home with a roof done right.",
    description: "Replacements, repairs, and inspections from licensed local roofers.",
    heroImage: "https://images.unsplash.com/photo-1632759145351-1d76b6e1dff1?w=1600&q=80",
    includes: [
      "Full roof replacements",
      "Repair & leak fixing",
      "Roof inspections",
      "Asphalt, metal, tile options",
      "Gutters & flashing",
      "Storm damage & insurance claims"
    ],
    benefits: [
      { title: "Licensed roofers", desc: "Fully insured pros who pull proper permits." },
      { title: "Quality materials", desc: "Top brands with manufacturer warranties." },
      { title: "Storm-ready", desc: "Pros who know how to handle insurance claims." },
      { title: "Fast response", desc: "Emergency leaks? Get matched quickly." }
    ],
    budgetOptions: [
      { value: "under-3k", label: "Under $3,000", qualified: false },
      { value: "3k-10k", label: "$3,000 – $10,000", qualified: true },
      { value: "10k-25k", label: "$10,000 – $25,000", qualified: true },
      { value: "25k-plus", label: "$25,000+", qualified: true }
    ],
    questions: [
      {
        id: "project_type",
        label: "What type of roofing project?",
        type: "single",
        options: ["Full replacement", "Repair", "Inspection only", "New construction"]
      },
      {
        id: "material",
        label: "Preferred roofing material?",
        type: "single",
        options: ["Asphalt shingles", "Metal", "Tile", "Flat/TPO", "Not sure yet"]
      },
      {
        id: "roof_age",
        label: "Approximate age of current roof?",
        type: "single",
        options: ["Under 5 years", "5–15 years", "15–25 years", "25+ years", "Not sure"]
      },
      {
        id: "damage",
        label: "Any current leaks or visible damage?",
        type: "single",
        options: ["Yes, active leak", "Yes, minor damage", "No damage, preventive", "Not sure"]
      }
    ],
    faqs: [
      { q: "How long does a roof replacement take?", a: "Most homes are done in 1–3 days depending on size and material." },
      { q: "Will my homeowner's insurance cover it?", a: "Often yes, for storm damage. Your pro can help document and submit the claim." },
      { q: "How often should I inspect my roof?", a: "Every 1–2 years, and after major storms." },
      { q: "What's the best material?", a: "Asphalt is most affordable; metal lasts longest; tile is premium. Depends on climate and budget." }
    ]
  },

  "home-improvement": {
    slug: "home-improvement",
    name: "Home Improvement",
    short: "Home Improvement",
    icon: Hammer,
    tagline: "Additions, siding, decks, windows — done right.",
    description: "Bigger home projects matched with licensed general contractors.",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
    includes: [
      "Home additions & ADUs",
      "Siding & exterior",
      "Windows & doors",
      "Decks & patios",
      "Interior renovations",
      "General contracting"
    ],
    benefits: [
      { title: "Full-service contractors", desc: "One pro to manage the whole project." },
      { title: "Design + build", desc: "Plan, permit, and execute — all in one." },
      { title: "Project management", desc: "Clear timelines and communication." },
      { title: "Licensed & bonded", desc: "Protected work with warranties." }
    ],
    budgetOptions: [
      { value: "under-5k", label: "Under $5,000", qualified: false },
      { value: "5k-20k", label: "$5,000 – $20,000", qualified: true },
      { value: "20k-75k", label: "$20,000 – $75,000", qualified: true },
      { value: "75k-plus", label: "$75,000+", qualified: true }
    ],
    questions: [
      {
        id: "project_type",
        label: "What type of project?",
        type: "single",
        options: ["Addition / ADU", "Siding", "Windows & doors", "Deck or patio", "Interior renovation", "Other"]
      },
      {
        id: "description",
        label: "Briefly describe your project",
        type: "text",
        placeholder: "Tell us what you're planning..."
      }
    ],
    faqs: [
      { q: "Do I need an architect?", a: "For additions, usually yes. Your contractor can recommend one or bring their own." },
      { q: "How long does an addition take?", a: "Typically 3–6 months including design, permits, and construction." },
      { q: "What's a general contractor?", a: "They manage the entire project, coordinating subcontractors, materials, and timelines." },
      { q: "Are permits included?", a: "Licensed contractors handle permits as part of the project scope." }
    ]
  },

  "electrical": {
    slug: "electrical",
    name: "Electricians",
    short: "Electrical",
    icon: Zap,
    tagline: "Safe, code-compliant electrical work.",
    description: "Panel upgrades, rewiring, EV chargers, and repairs from licensed electricians.",
    heroImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&q=80",
    includes: [
      "Panel upgrades & replacements",
      "Whole-home rewiring",
      "New circuit installs",
      "EV charger installation",
      "Lighting & fixture install",
      "Electrical repairs & troubleshooting"
    ],
    benefits: [
      { title: "Licensed electricians", desc: "All pros are state-licensed and insured." },
      { title: "Code-compliant work", desc: "Safe, inspected, and up to code." },
      { title: "Emergency response", desc: "Fast matching for urgent issues." },
      { title: "Upfront pricing", desc: "No surprises — clear quotes." }
    ],
    budgetOptions: [
      { value: "under-500", label: "Under $500", qualified: false },
      { value: "500-2k", label: "$500 – $2,000", qualified: true },
      { value: "2k-10k", label: "$2,000 – $10,000", qualified: true },
      { value: "10k-plus", label: "$10,000+", qualified: true }
    ],
    questions: [
      {
        id: "work_type",
        label: "What type of electrical work?",
        type: "single",
        options: ["Panel upgrade", "Rewiring", "New install / outlets", "EV charger", "Repair / troubleshooting", "Lighting install"]
      },
      {
        id: "urgency",
        label: "How urgent is this?",
        type: "single",
        options: ["Emergency (same day)", "Within a week", "Within a month", "Planning ahead"]
      }
    ],
    faqs: [
      { q: "Do electricians need to be licensed?", a: "Yes — every state requires licensing. We only match you with licensed pros." },
      { q: "How much does a panel upgrade cost?", a: "Typically $1,500–$4,000 depending on amperage and complexity." },
      { q: "Can I install an EV charger myself?", a: "For safety and code, hire a licensed electrician — often required by the charger warranty." },
      { q: "Do you handle emergencies?", a: "Yes — select 'Emergency' and we'll prioritize matching you fast." }
    ]
  },

  "plumbing": {
    slug: "plumbing",
    name: "Plumbers",
    short: "Plumbing",
    icon: Droplets,
    tagline: "Leaks, water heaters, repipes — fixed fast.",
    description: "Licensed plumbers for repairs, installs, and remodel plumbing.",
    heroImage: "https://images.unsplash.com/photo-1621905252472-943afaa20e20?w=1600&q=80",
    includes: [
      "Leak detection & repair",
      "Water heater install / repair",
      "Drain & sewer cleaning",
      "Remodel plumbing rough-ins",
      "Fixture installation",
      "Repiping"
    ],
    benefits: [
      { title: "Licensed plumbers", desc: "Only state-licensed, insured pros." },
      { title: "Fast emergency response", desc: "Burst pipe? We match you quickly." },
      { title: "Upfront pricing", desc: "Transparent, itemized quotes." },
      { title: "Warrantied work", desc: "Repairs backed by guarantees." }
    ],
    budgetOptions: [
      { value: "under-300", label: "Under $300", qualified: false },
      { value: "300-1500", label: "$300 – $1,500", qualified: true },
      { value: "1500-7k", label: "$1,500 – $7,000", qualified: true },
      { value: "7k-plus", label: "$7,000+", qualified: true }
    ],
    questions: [
      {
        id: "work_type",
        label: "What type of plumbing work?",
        type: "single",
        options: ["Leak repair", "Water heater", "Drain / sewer", "Remodel plumbing", "New install", "Repiping"]
      },
      {
        id: "urgency",
        label: "How urgent is this?",
        type: "single",
        options: ["Emergency (same day)", "Within a week", "Within a month", "Planning ahead"]
      }
    ],
    faqs: [
      { q: "Are plumbers licensed?", a: "Yes — we only match you with licensed, insured plumbers." },
      { q: "How much does a water heater cost?", a: "Standard tank heaters run $1,200–$2,500 installed. Tankless $2,500–$5,000." },
      { q: "What's an emergency?", a: "Burst pipes, sewage backups, no hot water, major leaks. We prioritize these." },
      { q: "Is tankless worth it?", a: "For most homes yes — longer lifespan, endless hot water, energy savings over time." }
    ]
  }
};

export const SERVICES_LIST = Object.values(SERVICES);

export function getService(slug) {
  return SERVICES[slug];
}