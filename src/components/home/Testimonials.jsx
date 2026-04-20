import { Star } from "lucide-react";

const TESTIMONIALS = [
  { name: "Sarah M.", loc: "Austin, TX", project: "Kitchen Remodel", rating: 5, quote: "The pro HomeFixr matched us with nailed our vision. Quotes were honest and the work was top-notch.", img: "https://i.pravatar.cc/100?img=45" },
  { name: "James P.", loc: "Denver, CO", project: "Roofing", rating: 5, quote: "Had a leak after a storm. Got matched with 3 roofers by evening. One came out next morning. Lifesaver.", img: "https://i.pravatar.cc/100?img=12" },
  { name: "Priya K.", loc: "Seattle, WA", project: "Bathroom Remodel", rating: 5, quote: "Loved that the pros actually fit our budget. Didn't waste our time with out-of-range quotes.", img: "https://i.pravatar.cc/100?img=32" },
  { name: "Marcus T.", loc: "Atlanta, GA", project: "Flooring", rating: 5, quote: "New hardwood throughout the house. Three quotes, picked the mid-price one, zero regrets.", img: "https://i.pravatar.cc/100?img=52" },
  { name: "Elena R.", loc: "Phoenix, AZ", project: "Electrical", rating: 5, quote: "Needed a panel upgrade for our EV charger. The electrician was licensed, fast, and fairly priced.", img: "https://i.pravatar.cc/100?img=44" },
  { name: "David H.", loc: "Boston, MA", project: "Plumbing", rating: 5, quote: "Water heater died on a Sunday. Got matched with a pro Monday morning. Replaced same day.", img: "https://i.pravatar.cc/100?img=14" }
];

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-muted/40">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">Homeowner stories</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            Real projects. Real results.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <figure key={i} className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-soft">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              <blockquote className="font-display text-lg md:text-xl leading-snug text-balance mb-6">
                "{t.quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-5 border-t border-border">
                <img src={t.img} className="w-11 h-11 rounded-full object-cover" alt={t.name} />
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.loc} · {t.project}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}