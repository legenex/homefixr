import { useEffect, useState } from "react";
import { Search, CheckCircle2, ExternalLink, AlertCircle, Plug } from "lucide-react";
import { Input } from "@/components/ui/input";

const INTEGRATIONS = [
  {
    category: "SEO & Analytics",
    items: [
      {
        id: "gsc",
        name: "Google Search Console",
        desc: "Monitor search performance, indexing, and fix crawl errors. Verify site ownership and submit sitemaps.",
        logo: "https://www.gstatic.com/images/branding/product/2x/search_console_48dp.png",
        status: "not_connected",
        setupUrl: "https://search.google.com/search-console",
        fields: [{ key: "verification_code", label: "HTML meta verification code", placeholder: "e.g. abc123def456..." }],
      },
      {
        id: "ga4",
        name: "Google Analytics 4",
        desc: "Track pageviews, user behavior, lead funnel conversions, and source attribution.",
        logo: "https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg",
        status: "not_connected",
        setupUrl: "https://analytics.google.com",
        fields: [{ key: "measurement_id", label: "Measurement ID", placeholder: "G-XXXXXXXXXX" }],
      },
      {
        id: "gtm",
        name: "Google Tag Manager",
        desc: "Manage all tracking tags in one place — GA4, Meta Pixel, conversion pixels, and more.",
        logo: "https://www.gstatic.com/tagmanager/googletagmanager.svg",
        status: "not_connected",
        setupUrl: "https://tagmanager.google.com",
        fields: [{ key: "container_id", label: "Container ID", placeholder: "GTM-XXXXXXX" }],
      },
    ]
  },
  {
    category: "Advertising",
    items: [
      {
        id: "meta_pixel",
        name: "Meta Pixel",
        desc: "Track Facebook and Instagram ad conversions, retarget visitors, and build lookalike audiences.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png",
        status: "not_connected",
        setupUrl: "https://business.facebook.com",
        fields: [{ key: "pixel_id", label: "Pixel ID", placeholder: "1234567890" }],
      },
      {
        id: "google_ads",
        name: "Google Ads",
        desc: "Track conversions from Google Ads campaigns and optimize bidding on lead quality.",
        logo: "https://www.gstatic.com/images/branding/product/2x/ads_48dp.png",
        status: "not_connected",
        setupUrl: "https://ads.google.com",
        fields: [
          { key: "conversion_id", label: "Conversion ID", placeholder: "AW-XXXXXXXXXX" },
          { key: "conversion_label", label: "Conversion label", placeholder: "abc123" },
        ],
      },
    ]
  },
  {
    category: "CRM & Lead delivery",
    items: [
      {
        id: "zapier",
        name: "Zapier",
        desc: "Send qualified leads to any CRM (HubSpot, Salesforce, Pipedrive) or email tool automatically.",
        logo: "https://cdn.zapier.com/zapier/images/logos/zapier-logo.png",
        status: "not_connected",
        setupUrl: "https://zapier.com",
        fields: [{ key: "webhook_url", label: "Zapier webhook URL", placeholder: "https://hooks.zapier.com/hooks/catch/..." }],
      },
      {
        id: "slack",
        name: "Slack notifications",
        desc: "Get instant Slack alerts for every new qualified lead submitted.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/800px-Slack_icon_2019.svg.png",
        status: "not_connected",
        setupUrl: "https://api.slack.com/messaging/webhooks",
        fields: [{ key: "webhook_url", label: "Slack incoming webhook URL", placeholder: "https://hooks.slack.com/services/..." }],
      },
      {
        id: "email",
        name: "Email notifications",
        desc: "Receive an email for every qualified lead with full contact and project details.",
        logo: null,
        status: "connected",
        setupUrl: null,
        fields: [{ key: "notify_email", label: "Notification email address", placeholder: "team@example.com", value: "hello@homefixr.com" }],
      },
    ]
  },
  {
    category: "Communication",
    items: [
      {
        id: "twilio",
        name: "Twilio SMS",
        desc: "Send automated SMS confirmations to homeowners when their lead is received.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Twilio-logo-red.svg/800px-Twilio-logo-red.svg.png",
        status: "not_connected",
        setupUrl: "https://twilio.com",
        fields: [
          { key: "account_sid", label: "Account SID", placeholder: "ACxxxxxx" },
          { key: "auth_token", label: "Auth token", placeholder: "••••••••" },
          { key: "from_number", label: "From number", placeholder: "+15005550006" },
        ],
      },
    ]
  }
];

export default function Integrations() {
  useEffect(() => { document.title = "Integrations — HomeFixr Admin"; }, []);
  const [statuses, setStatuses] = useState(() => {
    const s = {};
    INTEGRATIONS.forEach(cat => cat.items.forEach(i => { s[i.id] = i.status; }));
    return s;
  });
  const [expanded, setExpanded] = useState(null);
  const [values, setValues] = useState({});
  const [search, setSearch] = useState("");

  const toggleConnect = (id) => {
    setStatuses(s => ({ ...s, [id]: s[id] === "connected" ? "not_connected" : "connected" }));
  };

  const filtered = search
    ? INTEGRATIONS.map(cat => ({ ...cat, items: cat.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase())) })).filter(cat => cat.items.length > 0)
    : INTEGRATIONS;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Integrations</h1>
        <p className="text-white/40 text-sm mt-1">Connect your tools — SEO, analytics, ads, CRM, and notifications</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search integrations..."
          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-10"
        />
      </div>

      {filtered.map(cat => (
        <div key={cat.category} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/30">{cat.category}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {cat.items.map(item => {
              const connected = statuses[item.id] === "connected";
              const open = expanded === item.id;
              return (
                <div key={item.id} className={`bg-white/5 rounded-2xl border overflow-hidden transition-all ${connected ? "border-secondary/30" : "border-white/8"}`}>
                  <div className="flex items-start gap-4 p-5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.logo ? (
                        <img src={item.logo} alt={item.name} className="w-6 h-6 object-contain" onError={e => e.target.style.display='none'} />
                      ) : <Plug className="w-5 h-5 text-white/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        {connected && <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />}
                      </div>
                      <p className="text-xs text-white/40 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-4 flex items-center gap-2">
                    <button
                      onClick={() => setExpanded(open ? null : item.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/8 text-white/60 hover:text-white hover:bg-white/12 transition-colors"
                    >
                      {open ? "Close" : "Configure"}
                    </button>
                    <button
                      onClick={() => toggleConnect(item.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${connected ? "bg-secondary/10 text-secondary hover:bg-secondary/20" : "bg-secondary text-secondary-foreground hover:bg-secondary/90"}`}
                    >
                      {connected ? "Disconnect" : "Connect"}
                    </button>
                    {item.setupUrl && (
                      <a href={item.setupUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-white/20 hover:text-white/50">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  {open && (
                    <div className="px-5 pb-5 border-t border-white/8 pt-4 space-y-3 bg-black/10">
                      {item.fields.map(f => (
                        <div key={f.key}>
                          <label className="text-xs text-white/40 mb-1.5 block">{f.label}</label>
                          <Input
                            defaultValue={f.value || values[`${item.id}_${f.key}`] || ""}
                            onChange={e => setValues(v => ({ ...v, [`${item.id}_${f.key}`]: e.target.value }))}
                            placeholder={f.placeholder}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-10 text-sm"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => { toggleConnect(item.id); setExpanded(null); }}
                        className="mt-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-xs font-medium hover:bg-secondary/90"
                      >
                        Save & connect
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}