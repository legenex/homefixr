import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { SERVICES_LIST } from "@/lib/servicesData";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-soft' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <Logo />

        <div className="hidden lg:flex items-center gap-1">
          <Link to="/" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Home</Link>

          <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <button className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
              Services <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 pt-2 w-64">
                <div className="bg-card rounded-xl border border-border shadow-soft p-2 animate-fade-up">
                  {SERVICES_LIST.map(s => {
                    const Icon = s.icon;
                    return (
                      <Link key={s.slug} to={`/services/${s.slug}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-secondary" />
                        </div>
                        <span className="text-sm font-medium">{s.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link to="/about" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">About</Link>
          <Link to="/#faq" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">FAQ</Link>
        </div>

        <div className="hidden lg:block">
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-6 shadow-soft">
            <Link to="/quiz">Get Free Quotes</Link>
          </Button>
        </div>

        <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-up">
          <div className="px-5 py-4 space-y-1">
            <Link to="/" className="block py-3 px-3 rounded-lg hover:bg-muted font-medium">Home</Link>
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Services</div>
              {SERVICES_LIST.map(s => {
                const Icon = s.icon;
                return (
                  <Link key={s.slug} to={`/services/${s.slug}`} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted">
                    <Icon className="w-4 h-4 text-secondary" />
                    <span className="text-sm">{s.name}</span>
                  </Link>
                );
              })}
            </div>
            <Link to="/about" className="block py-3 px-3 rounded-lg hover:bg-muted font-medium">About</Link>
            <Link to="/#faq" className="block py-3 px-3 rounded-lg hover:bg-muted font-medium">FAQ</Link>
            <div className="pt-3">
              <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-12">
                <Link to="/quiz">Get Free Quotes</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}