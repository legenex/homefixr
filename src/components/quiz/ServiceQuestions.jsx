import OptionCard from "./OptionCard";
import { Textarea } from "@/components/ui/textarea";

// Render one service-specific question based on its config
export default function ServiceQuestion({ question, value, onChange }) {
  if (question.type === "single") {
    return (
      <div className="space-y-3">
        {question.options.map(opt => (
          <OptionCard
            key={opt}
            label={opt}
            selected={value === opt}
            onClick={() => onChange(opt)}
          />
        ))}
      </div>
    );
  }

  if (question.type === "multi") {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (opt) => {
      const next = arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt];
      onChange(next);
    };
    return (
      <div className="space-y-3">
        {question.options.map(opt => (
          <OptionCard
            key={opt}
            label={opt}
            selected={arr.includes(opt)}
            onClick={() => toggle(opt)}
            multi
          />
        ))}
      </div>
    );
  }

  if (question.type === "text") {
    return (
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || "Type your answer..."}
        className="min-h-32 text-base rounded-xl"
      />
    );
  }

  return null;
}