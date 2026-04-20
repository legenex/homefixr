import { useEffect, useState } from "react";
import { Save, CheckCircle2, Bell, Shield, Globe, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettings() {
  useEffect(() => { document.title = "Settings — HomeFixr Admin"; }, []);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Site-wide configuration for HomeFixr.com</p>
      </div>

      {/* Business info */}
      <Section icon={Globe} title="Business information">
        <Field label="Site name" defaultValue="HomeFixr" />
        <Field label="Tagline" defaultValue="Your home, fixed right." />
        <Field label="Contact email" defaultValue="hello@homefixr.com" type="email" icon={Mail} />
        <Field label="Contact phone" defaultValue="1 (800) 555-FIXR" type="tel" icon={Phone} />
        <div>
          <label className="text-xs text-white/40 mb-1.5 block">Business description</label>
          <Textarea
            defaultValue="HomeFixr connects homeowners with vetted local service providers for kitchen, bathroom, flooring, roofing, electrical, plumbing, and more."
            className="bg-white/5 border-white/10 text-white rounded-xl min-h-[80px] text-sm"
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Lead notifications">
        <Field label="Notify email (new qualified leads)" defaultValue="hello@homefixr.com" type="email" />
        <Field label="Notify email (all leads)" defaultValue="" placeholder="Leave blank to disable" type="email" />
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div>
            <p className="text-sm text-white">Email on qualified leads</p>
            <p className="text-xs text-white/40">Get notified for every qualified submission</p>
          </div>
          <Toggle defaultOn />
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm text-white">Daily digest email</p>
            <p className="text-xs text-white/40">Daily summary of leads at 8am</p>
          </div>
          <Toggle defaultOn={false} />
        </div>
      </Section>

      {/* Privacy & Legal */}
      <Section icon={Shield} title="Privacy & legal">
        <Field label="Privacy policy URL" defaultValue="/privacy" />
        <Field label="Terms of service URL" defaultValue="/terms" />
        <Field label="TCPA consent URL" defaultValue="/tcpa" />
        <div>
          <label className="text-xs text-white/40 mb-1.5 block">TCPA consent text (shown in quiz)</label>
          <Textarea
            defaultValue="By checking this box and clicking Submit, I consent to HomeFixr and its matched service pros contacting me..."
            className="bg-white/5 border-white/10 text-white rounded-xl min-h-[80px] text-sm"
          />
        </div>
      </Section>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/90 transition-colors"
      >
        {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? "Changes saved!" : "Save all changes"}
      </button>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/8 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Icon className="w-4 h-4 text-secondary" /> {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, defaultValue, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
      <Input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-10"
      />
    </div>
  );
}

function Toggle({ defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(v => !v)}
      style={{ width: 40, height: 22 }}
      className={`relative rounded-full flex-shrink-0 transition-colors ${on ? "bg-secondary" : "bg-white/15"}`}
    >
      <span
        style={{ width: 18, height: 18 }}
        className={`absolute top-0.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}