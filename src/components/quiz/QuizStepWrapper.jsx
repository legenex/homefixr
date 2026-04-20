import { motion } from "framer-motion";

export default function QuizStepWrapper({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto w-full"
    >
      <div className="mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-balance leading-tight">
          {title}
        </h2>
        {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}