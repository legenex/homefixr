import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HeartHandshake, BookOpen, Calculator, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYouUnmatched() {
  const { state } = useLocation();

  useEffect(() => {
    document.title = "Thanks for your interest — HomeFixr";
  }, []);

  const resources = [
    { icon: BookOpen, title: "Project planning guide", desc: "A free guide with typical costs, timelines, and questions to ask pros." },
    { icon: Calculator, title: "Cost estimator tools", desc: "Use free tools like HomeAdvisor's True Cost Guide to ballpark your project." },
    { icon: Search, title: "Local directories", desc: "Search your state's licensing board to find licensed pros in your area." }
  ];

  return (
    <div className="min-h-[85vh] py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-8">
          <HeartHandshake className="w-10 h-10 text-muted-foreground" strokeWidth={2} />
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
          Thanks for<br/>
          <span className="italic font-light text-secondary">reaching out.</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Based on your answers, we don't currently have a match in our network for your specific needs. But here are some resources that may help.
        </p>

        {state?.reason && (
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium">Note:</span> {state.reason}
          </p>
        )}

        <div className="mt-14 grid md:grid-cols-3 gap-4 text-left">
          {resources.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-1.5">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild size="lg" className="bg-primary text-primary-foreground rounded-full h-13 px-7">
            <Link to="/"><Home className="w-4 h-4 mr-2" /> Back to home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full h-13 px-7">
            <Link to="/quiz">Try again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}