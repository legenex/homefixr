import { useEffect } from "react";

function LegalLayout({ title, children }) {
  useEffect(() => { document.title = `${title} — HomeFixr`; }, [title]);
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-8">{title}</h1>
        <div className="prose prose-lg max-w-none space-y-5 text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>HomeFixr.com ("we", "us") respects your privacy. This Privacy Policy explains what we collect, how we use it, and your rights.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">What we collect</h2>
      <p>We collect information you provide via our quiz and forms — including your name, email, phone, ZIP code, project type, timeline, and budget.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">How we use it</h2>
      <p>To match you with up to three vetted local service providers who can fulfill your project, and to send confirmation and follow-up communications.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">Who we share with</h2>
      <p>We share your information only with matched service providers relevant to your project, and with service providers that help us operate (email, analytics). We do not sell your data.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">Your rights</h2>
      <p>You may request access, correction, or deletion of your data by emailing hello@homefixr.com.</p>
      <p className="text-xs">This is a placeholder privacy policy. Please consult an attorney for production use.</p>
    </LegalLayout>
  );
}

export function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>By using HomeFixr.com, you agree to these terms.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">Our service</h2>
      <p>HomeFixr is a matching service that connects homeowners with third-party service providers. We do not perform the services ourselves and are not responsible for the work performed by matched providers.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">Your responsibilities</h2>
      <p>You agree to provide accurate information and to use the service only for lawful, residential home-improvement purposes.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">Limitation of liability</h2>
      <p>HomeFixr is provided "as is". We make no warranties regarding matched providers and are not liable for any damages arising from work performed.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">Contact</h2>
      <p>Questions? Email hello@homefixr.com.</p>
      <p className="text-xs">This is a placeholder. Please consult an attorney for production use.</p>
    </LegalLayout>
  );
}

export function TCPA() {
  return (
    <LegalLayout title="TCPA Consent">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>By submitting your information on HomeFixr.com, you expressly consent to be contacted by HomeFixr and its matched service provider partners at the phone number and email address you provided.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">What this means</h2>
      <p>You agree that HomeFixr and its partners may contact you via autodialed calls, pre-recorded messages, artificial voice calls, and SMS text messages — even if your number is on a do-not-call list — regarding the project you submitted.</p>
      <p>Consent is not a condition of any purchase. Standard message and data rates may apply.</p>
      <h2 className="font-display text-2xl font-semibold text-foreground">Opting out</h2>
      <p>You may opt out at any time by replying STOP to any text, asking the caller to remove you, or emailing hello@homefixr.com.</p>
      <p className="text-xs">This is a placeholder. Please consult an attorney for production use.</p>
    </LegalLayout>
  );
}