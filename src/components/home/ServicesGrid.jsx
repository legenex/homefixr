import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SERVICES_LIST } from "@/lib/servicesData";

export default function ServicesGrid() {
  return (
    <section id="services" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">Services</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
              Any project. Every pro.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            From full remodels to urgent repairs — we match you with the right local pros for the job.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {SERVICES_LIST.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.slug}
                to={`/services/${s.slug}`}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-500"
              >
                <img
                  src={s.heroImage}
                  alt={s.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />

                <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-secondary transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7 text-white">
                  <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-2xl md:text-[1.65rem] font-semibold leading-tight">{s.name}</h3>
                  <p className="text-sm text-white/75 mt-1.5 line-clamp-2">{s.tagline}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}