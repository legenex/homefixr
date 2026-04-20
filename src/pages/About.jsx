import { useEffect } from "react";
import AboutSection from "@/components/home/AboutSection";
import FinalCTA from "@/components/home/FinalCTA";

export default function About() {
  useEffect(() => {
    document.title = "About HomeFixr — Why we built it";
  }, []);

  return (
    <>
      <section className="pt-16 md:pt-24 pb-4">
        <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-4">About</p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
            Making home projects<br/><span className="italic font-light text-secondary">simpler.</span>
          </h1>
        </div>
      </section>
      <AboutSection />
      <FinalCTA />
    </>
  );
}