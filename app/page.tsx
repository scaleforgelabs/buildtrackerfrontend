import React from "react";
import { Navbar } from "@/app/components/marketing/Navbar";
import { Footer } from "@/app/components/marketing/Footer";
import { Hero } from "@/app/components/marketing/Hero";
import { TrustedBy } from "@/app/components/marketing/TrustedBy";
import { FeatureSections } from "@/app/components/marketing/FeatureSections";
import { CollaborateSection } from "@/app/components/marketing/CollaborateSection";
import { SecuritySection } from "@/app/components/marketing/SecuritySection";
import { IntegrationsSection } from "@/app/components/marketing/IntegrationsSection";
import { CTASection } from "@/app/components/marketing/CTASection";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-poppins overflow-x-hidden">
      <Navbar />

      <main className="pt-20 ">
        <Hero />
        <TrustedBy />
        <FeatureSections />
        <CollaborateSection />
        <SecuritySection />
        <IntegrationsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
