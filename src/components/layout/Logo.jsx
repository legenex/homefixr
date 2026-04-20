import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${light ? 'bg-white/10' : 'bg-primary'}`}>
        <Wrench className={`w-5 h-5 ${light ? 'text-white' : 'text-primary-foreground'}`} strokeWidth={2.5} />
      </div>
      <span className={`font-display text-xl font-semibold tracking-tight ${light ? 'text-white' : 'text-primary'}`}>
        HomeFixr<span className="text-secondary">.</span>
      </span>
    </Link>
  );
}