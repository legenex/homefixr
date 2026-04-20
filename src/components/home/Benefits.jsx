import { Gift, ShieldCheck, Zap, ThumbsUp, MapPin, Wallet } from "lucide-react";

const BENEFITS = [
  { icon: Gift, title: "100% Free", desc: "Quotes and matches always free — no hidden fees." },
  { icon: ShieldCheck, title: "Vetted Pros", desc: "Every contractor is licensed, insured, and background-checked." },
  { icon: Zap, title: "Fast Matching", desc: "Get matched with local pros in minutes — not days." },
  { icon: ThumbsUp, title: "No Obligation", desc: "Compare quotes on your terms. Hire only if you want to." },
  { icon: MapPin, title: "Local Experts", desc: "Pros who know your area, codes, and climate." },
  { icon: Wallet, title: "Budget-Matched", desc: "Only matched with pros who fit your budget range." }
];

export default function Benefits() {
  return (
    <section className="py-20 md:py-28 bg-muted/40">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">Why HomeFixr</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            The smarter way to hire home pros.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="group relative bg-card rounded-2xl p-6 md:p-8 border border-border hover:border-secondary/40 hover:-translate-y-1 transition-all duration-300 shadow-soft">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <Icon className="w-5 h-5 text-secondary group-hover:text-secondary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}