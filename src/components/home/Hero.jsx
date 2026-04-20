import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grain pointer-events-none" />
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-20 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Matching 10,000+ homeowners with top pros
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-balance">
              Your home,<br />
              <span className="italic font-light text-secondary">fixed right.</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Tell us about your project. We'll match you with vetted local pros who fit your budget — in minutes, free of charge.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-14 px-7 text-base shadow-glow group">
                <Link to="/quiz">
                  Get Free Quotes
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-7 text-base border-primary/20 hover:bg-primary hover:text-primary-foreground">
                <Link to="#services">Browse Services</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-secondary to-primary" style={{ backgroundImage: `url(https://i.pravatar.cc/40?img=${i+10})`, backgroundSize: 'cover' }} />
                  ))}
                </div>
                <span className="text-muted-foreground"><span className="font-semibold text-foreground">10,000+</span> homeowners</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
                <span className="ml-1 text-muted-foreground"><span className="font-semibold text-foreground">4.9/5</span> rating</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                Vetted pros only
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] md:aspect-[5/6] rounded-3xl overflow-hidden shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
                alt="Beautiful modern home interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-4 md:-left-8 bg-card rounded-2xl p-4 md:p-5 shadow-soft border border-border max-w-[240px] animate-fade-up">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-muted-foreground">Matched</span>
              </div>
              <p className="text-sm font-semibold">Kitchen remodel</p>
              <p className="text-xs text-muted-foreground mt-0.5">3 pros responded in 18 min</p>
            </div>

            <div className="hidden md:block absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-soft border border-border animate-fade-up">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Licensed &</p>
                  <p className="text-sm font-semibold">Insured pros</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}