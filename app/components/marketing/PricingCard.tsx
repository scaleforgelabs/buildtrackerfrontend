"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface PricingCardProps {
    name: string;
    description: string;
    price: string;
    billingCycle: string;
    features: string[];
    isPopular?: boolean;
    buttonText?: string;
    onGetStarted?: () => void;
}

export const PricingCard = ({
    name,
    description,
    price,
    billingCycle,
    features,
    isPopular = false,
    buttonText = "Get Started",
    onGetStarted
}: PricingCardProps) => {
    return (
        <div className={`relative flex flex-col p-8 rounded-[2rem] border-2 transition-all duration-300 h-full ${isPopular
            ? "border-primary bg-primary/2 shadow-xl shadow-primary/10 scale-105 z-10"
            : "border-border bg-card hover:border-border/80"
            }`}>
            {isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Recommended
                </div>
            )}

            <div className="space-y-4 mb-8">
                <h3 className="text-xl font-extrabold text-[#0D0D0D] dark:text-white">{name}</h3>
                <p className="text-sm text-muted-foreground font-medium">{description}</p>
            </div>

            <div className="flex items-baseline mb-8">
                <span className="text-4xl font-extrabold text-[#0D0D0D] dark:text-white">$ {price}</span>
                <span className="text-muted-foreground font-semibold ml-1">/{billingCycle}</span>
            </div>

            <Button
                variant={isPopular ? "default" : "default"}
                onClick={onGetStarted}
                className={`w-full h-12 rounded-xl font-bold mb-8 transition-all active:scale-95 ${isPopular
                    ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                    : "bg-primary/20 hover:bg-primary/30 text-primary border-none"
                    }`}
            >
                {buttonText}
            </Button>

            <div className="space-y-4 mt-auto">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    {name === "Starter" ? "Free includes:" : `${name} includes:`}
                </p>
                <div className="space-y-3">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-start space-x-3">
                            <div className="mt-1 flex items-center justify-center w-4 h-4 rounded-md bg-primary/10 border border-primary/20 shrink-0">
                                <Check className="w-2.5 h-2.5 text-primary" strokeWidth={4} />
                            </div>
                            <span className="text-sm text-[#0D0D0D] dark:text-white/80 font-medium leading-tight">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
