import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Clock, Phone, Shield, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getService } from "@/lib/servicesData";

export default function ThankYou() {
  const { state } = useLocation();
  const service = getService(state?.service);

  useEffect(() => {
    document.title = "Thank you — HomeFixr";
  }, []);

  const steps = [
    { icon: Clock, title: "Within 15 minutes", desc: "You'll receive a confirmation email with your submission details." },
    { icon: Phone, title: "Within 24 hours", desc: "A vetted local pro will reach out to discuss your project and schedule a time to talk." },
    { icon: Shield, title: "Compare & decide", desc: "You may receive 2–3 quotes to compare. No obligation — you're fully in control." }
  ];

  return (
    <div className="min-h-[85vh] py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 mb-8">
          <CheckCircle2 className="w-10 h-10 text-secondary" strokeWidth={2} />
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
          You're all set.<br/>
          <span className="italic font-light text-secondary">We've got this.</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          We've received your {service ? service.name.toLowerCase() : "project"} request. A vetted local pro will reach out within 24 hours.
        </p>

        <div className="mt-14 grid md:grid-cols-3 gap-4 text-left">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild size="lg" className="bg-primary text-primary-foreground rounded-full h-13 px-7">
            <Link to="/"><Home className="w-4 h-4 mr-2" /> Back to home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full h-13 px-7">
            <Link to="/#services">Browse other services <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Tip: Add hello@homefixr.com to your contacts so our email doesn't go to spam.
        </p>
      </div>
    </div>
  );
}