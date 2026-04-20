import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 lg:p-20 shadow-soft">
          <div className="absolute inset-0 bg-grain opacity-40" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
              Ready to start your<br />
              <span className="italic font-light text-secondary">next project?</span>
            </h2>
            <p className="mt-6 text-lg text-primary-foreground/70 max-w-lg leading-relaxed">
              2 minutes. 100% free. Zero obligation. Get matched with the right local pro today.
            </p>
            <Button asChild size="lg" className="mt-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-14 px-8 shadow-glow group">
              <Link to="/quiz">
                Get Free Quotes
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}