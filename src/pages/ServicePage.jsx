import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Check, Star, ShieldCheck } from "lucide-react";
import { getService } from "@/lib/servicesData";
import HowItWorks from "@/components/home/HowItWorks";

export default function ServicePage() {
  const { slug } = useParams();
  const service = getService(slug);

  useEffect(() => {
    if (service) {
      document.title = `${service.name} — HomeFixr | Free Quotes from Vetted Pros`;
    }
  }, [service]);

  if (!service) return <Navigate to="/" replace />;

  const Icon = service.icon;
  const quizLink = `/quiz?service=${service.slug}`;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-16 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium mb-6">
                <Icon className="w-3.5 h-3.5" />
                {service.name}
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-balance">
                {service.tagline}
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                {service.description}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-14 px-7 shadow-glow group">
                  <Link to={quizLink}>
                    Get Free Quotes <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-7 border-primary/20 hover:bg-primary hover:text-primary-foreground">
                  <Link to="/">All services</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />)}
                  <span className="ml-1">4.9 rating</span>
                </div>
                <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-secondary" /> Licensed pros</div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden shadow-soft">
                <img src={service.heroImage} alt={service.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Includes */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">What we cover</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
                Common {service.short.toLowerCase()} projects.
              </h2>
              <p className="mt-5 text-muted-foreground max-w-md leading-relaxed">
                Whether it's a full project or a small upgrade, our pros handle all of it.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {service.includes.map((item, i) => (
                <li key={i} className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">Why HomeFixr for {service.short.toLowerCase()}</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
              Hire with confidence.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {service.benefits.map((b, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Check className="w-4 h-4 text-secondary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">{service.name} FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
              Your questions, answered.
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {service.faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-xl bg-card px-5 md:px-6 shadow-soft">
                <AccordionTrigger className="font-display text-lg md:text-xl font-semibold text-left hover:no-underline py-5">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 lg:p-20 shadow-soft">
            <div className="absolute inset-0 bg-grain opacity-40" />
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" />
            <div className="relative max-w-2xl">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
                Get matched with<br/>
                <span className="italic font-light text-secondary">{service.short.toLowerCase()} pros.</span>
              </h2>
              <p className="mt-6 text-lg text-primary-foreground/70 max-w-lg leading-relaxed">
                2 minutes. 100% free. Zero obligation.
              </p>
              <Button asChild size="lg" className="mt-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-14 px-8 shadow-glow group">
                <Link to={quizLink}>
                  Start Your Free Quote <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}