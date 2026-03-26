"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/app/components/marketing/Navbar";
import { Footer } from "@/app/components/marketing/Footer";
import { Hero } from "@/app/components/marketing/Hero";
import { TrustedBy } from "@/app/components/marketing/TrustedBy";
import { FeatureSections } from "@/app/components/marketing/FeatureSections";
import { CollaborateSection } from "@/app/components/marketing/CollaborateSection";
import { SecuritySection } from "@/app/components/marketing/SecuritySection";
import { IntegrationsSection } from "@/app/components/marketing/IntegrationsSection";
import { CTASection } from "@/app/components/marketing/CTASection";
import { useAuth } from "@/libs/hooks/useAuth";

const HomePage = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
