import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    num: "01",
    title: "Tell us about your project",
    desc: "Take our 2-minute quiz. Share your project type, timeline, budget, and ZIP code."
  },
  {
    num: "02",
    title: "Get matched with top local pros",
    desc: "We hand-match you with vetted, licensed pros who fit your specific needs and budget."
  },
  {
    num: "03",
    title: "Compare quotes & hire",
    desc: "Receive quotes, compare side-by-side, read reviews, and choose the right pro — no obligation."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-30" />
      <div className="max-w-7xl mx-auto px-5 md:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">How it works</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            Three steps to your perfect pro.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="relative">
              <div className="flex md:flex-col items-start gap-5">
                <div className="font-display text-6xl md:text-7xl font-light text-secondary leading-none">{step.num}</div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-primary-foreground/70 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-white/10 -translate-x-8" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-14 px-8 shadow-glow">
            <Link to="/quiz">Start Your Free Quote</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}