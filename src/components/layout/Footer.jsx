import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";
import Logo from "./Logo";
import { SERVICES_LIST } from "@/lib/servicesData";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Logo light />
            <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              Your home, fixed right. HomeFixr connects you with vetted local pros matched to your project and budget.
            </p>
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {SERVICES_LIST.map(s => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link to="/#faq" className="hover:text-secondary transition-colors">FAQ</Link></li>
              <li><Link to="/quiz" className="hover:text-secondary transition-colors">Get Quotes</Link></li>
              <li><Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
              <li><Link to="/tcpa" className="hover:text-secondary transition-colors">TCPA Consent</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@homefixr.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1 (800) 555-FIXR</li>
            </ul>
            <p className="mt-6 text-xs text-primary-foreground/50 leading-relaxed">
              Available Mon–Sat, 8am–8pm local time. Free to use, no obligation.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} HomeFixr.com — All rights reserved.</p>
          <p className="text-xs text-primary-foreground/50">Made with care for homeowners everywhere.</p>
        </div>
      </div>
    </footer>
  );
}