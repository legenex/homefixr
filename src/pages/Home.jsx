import { useEffect } from "react";
import Hero from "@/components/home/Hero";
import Benefits from "@/components/home/Benefits";
import ServicesGrid from "@/components/home/ServicesGrid";
import HowItWorks from "@/components/home/HowItWorks";
import AboutSection from "@/components/home/AboutSection";
import Testimonials from "@/components/home/Testimonials";
import FAQSection from "@/components/home/FAQSection";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  useEffect(() => {
    document.title = "HomeFixr — Your home, fixed right. Free quotes from vetted local pros.";
  }, []);

  return (
    <>
      <Hero />
      <Benefits />
      <ServicesGrid />
      <HowItWorks />
      <AboutSection />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
    </>
  );
}