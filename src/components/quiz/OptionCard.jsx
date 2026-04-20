import { Check } from "lucide-react";

export default function OptionCard({ label, selected, onClick, icon: Icon, multi = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 flex items-center gap-4 group hover:-translate-y-0.5 ${
        selected
          ? 'border-secondary bg-secondary/5 shadow-soft'
          : 'border-border bg-card hover:border-secondary/40'
      }`}
    >
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-foreground'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <span className="font-medium flex-1">{label}</span>
      <div className={`w-6 h-6 rounded-${multi ? 'md' : 'full'} border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        selected ? 'border-secondary bg-secondary' : 'border-border'
      }`}>
        {selected && <Check className="w-3.5 h-3.5 text-secondary-foreground" strokeWidth={3} />}
      </div>
    </button>
  );
}