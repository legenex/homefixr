import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Is HomeFixr really free?", a: "Yes — 100% free for homeowners. We're paid by the pros who want to grow their business with quality leads. You never pay us a cent." },
  { q: "How are pros vetted?", a: "Every pro in our network is licensed, insured, and background-checked. We verify credentials directly with state licensing boards and require proof of liability insurance." },
  { q: "How fast will I hear back?", a: "Most homeowners get their first match within 15 minutes during business hours, and hear from 2–3 pros within 24 hours." },
  { q: "Do I have to hire anyone?", a: "No. You're under zero obligation. Get quotes, compare, and walk away if nothing's right. We'd rather you hire the right pro than any pro." },
  { q: "How does budget matching work?", a: "During the quiz, you tell us your budget range. We only match you with pros who can realistically work within that range — so you don't waste time on mismatched quotes." },
  { q: "What areas do you serve?", a: "We serve all 50 US states. Our pro network is deepest in major metros, but we have vetted pros across suburban and rural areas as well." },
  { q: "What if I'm not happy with my match?", a: "Tell us and we'll re-match you at no cost. We only succeed when homeowners find the right pro." },
  { q: "Do you share my info?", a: "Only with the 1–3 matched pros you're connected with for your project. We never sell your data to third parties. See our Privacy Policy for details." },
  { q: "Can I get quotes for urgent repairs?", a: "Yes — select 'ASAP' on the quiz for your timeline, and we prioritize matching you with pros available immediately. Great for emergencies like burst pipes or leaks." },
  { q: "What if I'm just researching?", a: "That's fine — select 'Just researching' and we'll send you a guide with typical project costs, questions to ask, and next steps. No pressure." }
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            Questions, answered.
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-xl bg-card px-5 md:px-6 shadow-soft">
              <AccordionTrigger className="font-display text-lg md:text-xl font-semibold text-left hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}