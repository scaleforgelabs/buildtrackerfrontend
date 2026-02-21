"use client";

import React from "react";
import { Navbar } from "@/app/components/marketing/Navbar";
import { Footer } from "@/app/components/marketing/Footer";
import { PlaceholderTab } from "@/app/components/settings/PlaceholderTab";

interface MarketingPlaceholderProps {
    title: string;
}

const MarketingPlaceholder = ({ title }: MarketingPlaceholderProps) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-poppins">
            <Navbar />
            <main className="pt-32 pb-24 max-w-7xl mx-auto px-4">
                <div className="bg-card rounded-[3rem] border border-border p-12 md:p-24 shadow-sm">
                    <PlaceholderTab tabName={title} />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MarketingPlaceholder;
