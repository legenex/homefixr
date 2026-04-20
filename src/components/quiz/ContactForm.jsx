import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Mail, User, Clock } from "lucide-react";
import OptionCard from "./OptionCard";

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
      <div>
        <Label htmlFor="full_name" className="text-sm font-semibold mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-secondary" /> Full name
        </Label>
        <Input
          id="full_name"
          value={data.full_name || ""}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="Jane Smith"
          className={`h-13 text-base rounded-xl border-2 transition-colors ${errors.full_name ? "border-destructive" : "border-border focus:border-secondary"}`}
          style={{ height: 52 }}
          autoComplete="name"
        />
        {errors.full_name && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">⚠ {errors.full_name}</p>}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-secondary" /> Email address
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          value={data.email || ""}
          onChange={(e) => set("email", e.target.value)}
          placeholder="jane@example.com"
          className={`h-13 text-base rounded-xl border-2 transition-colors ${errors.email ? "border-destructive" : "border-border focus:border-secondary"}`}
          style={{ height: 52 }}
          autoComplete="email"
        />
        {errors.email && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">⚠ {errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone" className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4 text-secondary" /> Phone number
        </Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          value={data.phone || ""}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="(555) 123-4567"
          className={`h-13 text-base rounded-xl border-2 transition-colors ${errors.phone ? "border-destructive" : "border-border focus:border-secondary"}`}
          style={{ height: 52 }}
          autoComplete="tel"
        />
        {errors.phone && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">⚠ {errors.phone}</p>}
      </div>

      {/* Best time */}
      <div>
        <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-secondary" /> Best time to call
        </Label>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {TIMES.map(t => (
            <OptionCard
              key={t.value}
              label={t.label}
              selected={data.best_time === t.value}
              onClick={() => set("best_time", t.value)}
            />
          ))}
        </div>
      </div>

      {/* TCPA */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${errors.tcpa_consent ? "bg-destructive/5 border-destructive/30" : "bg-muted/60 border-border"}`}>
        <Checkbox
          id="tcpa"
          checked={!!data.tcpa_consent}
          onCheckedChange={(v) => set("tcpa_consent", !!v)}
          className="mt-0.5"
        />
        <label htmlFor="tcpa" className="text-xs leading-relaxed text-muted-foreground cursor-pointer">
          By checking this box and clicking "Submit", I consent to HomeFixr and its matched service pros contacting me at the phone number provided, including by autodialed, pre-recorded, or artificial voice calls and text messages, about my project. Consent is not a condition of purchase. Msg & data rates may apply. See our{" "}
          <a href="/tcpa" target="_blank" className="underline text-foreground">TCPA consent</a> and{" "}
          <a href="/privacy" target="_blank" className="underline text-foreground">Privacy Policy</a>.
        </label>
      </div>
      {errors.tcpa_consent && <p className="text-xs text-destructive flex items-center gap-1">⚠ {errors.tcpa_consent}</p>}
    </div>
  );
}