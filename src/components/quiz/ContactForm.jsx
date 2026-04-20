import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Phone } from "lucide-react";

const TIMES = [
  { value: "morning", label: "Morning (8am–12pm)" },
  { value: "afternoon", label: "Afternoon (12pm–5pm)" },
  { value: "evening", label: "Evening (5pm–8pm)" },
  { value: "anytime", label: "Anytime" }
];

export default function ContactForm({ data, onChange, errors = {} }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  return (
    <div className="space-y-5 max-w-lg">
      {/* Name */}
      <div className="relative">
        <Label htmlFor="full_name" className="text-sm font-semibold mb-2 block">
          Full name <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="full_name"
            value={data.full_name || ""}
            onChange={(e) => set("full_name", e.target.value)}
            placeholder="Jane Smith"
            className={`h-13 text-base rounded-xl pl-10 ${errors.full_name ? "border-destructive" : ""}`}
            style={{ height: 52 }}
          />
        </div>
        {errors.full_name && <p className="text-xs text-destructive mt-1.5">{errors.full_name}</p>}
      </div>

      {/* Email + Phone side by side on larger screens */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
            Email address <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              inputMode="email"
              value={data.email || ""}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane@example.com"
              className={`text-base rounded-xl pl-10 ${errors.email ? "border-destructive" : ""}`}
              style={{ height: 52 }}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-semibold mb-2 block">
            Phone number <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              value={data.phone || ""}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className={`text-base rounded-xl pl-10 ${errors.phone ? "border-destructive" : ""}`}
              style={{ height: 52 }}
            />
          </div>
          {errors.phone && <p className="text-xs text-destructive mt-1.5">{errors.phone}</p>}
        </div>
      </div>

      {/* Best time */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Best time to reach you</Label>
        <div className="grid grid-cols-2 gap-2">
          {TIMES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("best_time", t.value)}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                data.best_time === t.value
                  ? "border-secondary bg-secondary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-secondary/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TCPA */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/60 border border-border">
        <Checkbox
          id="tcpa"
          checked={!!data.tcpa_consent}
          onCheckedChange={(v) => set("tcpa_consent", !!v)}
          className="mt-0.5 flex-shrink-0"
        />
        <label htmlFor="tcpa" className="text-xs leading-relaxed text-muted-foreground cursor-pointer">
          By checking this box and clicking "Submit", I consent to HomeFixr and its matched service pros contacting me at the phone number provided, including by autodialed, pre-recorded, or artificial voice calls and text messages, about my project. Consent is not a condition of purchase. Msg & data rates may apply. See our{" "}
          <a href="/tcpa" target="_blank" className="underline text-foreground">TCPA consent</a> and{" "}
          <a href="/privacy" target="_blank" className="underline text-foreground">Privacy Policy</a>.
        </label>
      </div>
      {errors.tcpa_consent && <p className="text-xs text-destructive">{errors.tcpa_consent}</p>}
    </div>
  );
}