import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
    <div className="space-y-5">
      <div>
        <Label htmlFor="full_name" className="text-sm font-medium mb-2 block">Full name</Label>
        <Input
          id="full_name"
          value={data.full_name || ""}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="Jane Smith"
          className="h-12 text-base rounded-xl"
        />
        {errors.full_name && <p className="text-xs text-destructive mt-1.5">{errors.full_name}</p>}
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          value={data.email || ""}
          onChange={(e) => set("email", e.target.value)}
          placeholder="jane@example.com"
          className="h-12 text-base rounded-xl"
        />
        {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Phone</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          value={data.phone || ""}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="(555) 123-4567"
          className="h-12 text-base rounded-xl"
        />
        {errors.phone && <p className="text-xs text-destructive mt-1.5">{errors.phone}</p>}
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Best time to contact you</Label>
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

      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/60 border border-border">
        <Checkbox
          id="tcpa"
          checked={!!data.tcpa_consent}
          onCheckedChange={(v) => set("tcpa_consent", !!v)}
          className="mt-1"
        />
        <label htmlFor="tcpa" className="text-xs leading-relaxed text-muted-foreground cursor-pointer">
          By checking this box and clicking "Submit", I consent to HomeFixr and its matched service pros contacting me at the phone number provided, including by autodialed, pre-recorded, or artificial voice calls and text messages, about my project. Consent is not a condition of purchase. Msg & data rates may apply. See our <a href="/tcpa" target="_blank" className="underline text-foreground">TCPA consent</a> and <a href="/privacy" target="_blank" className="underline text-foreground">Privacy Policy</a>.
        </label>
      </div>
      {errors.tcpa_consent && <p className="text-xs text-destructive">{errors.tcpa_consent}</p>}
    </div>
  );
}