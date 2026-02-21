"use client";

import React from "react";
import { Check, Minus } from "lucide-react";

const features = [
    { name: "Plan features", isHeader: true },
    { name: "Custom Workflows", starter: true, pro: true, business: true, enterprise: true },
    { name: "Users", starter: "3", pro: "10", business: "30", enterprise: "Unlimited" },
    { name: "Individual Data", starter: "150MB", pro: "1GB", business: "5GB", enterprise: "Unlimited" },
    { name: "Integrations", starter: true, pro: true, business: true, enterprise: true },
    { name: "Automated Workflows", starter: false, pro: true, business: true, enterprise: true },
    { name: "Performance Analytics", starter: false, pro: true, business: true, enterprise: true },
    { name: "Support", starter: true, pro: true, business: true, enterprise: true },
    { name: "Advanced permissions", starter: true, pro: true, business: true, enterprise: true },
    { name: "Security Features", starter: false, pro: false, business: true, enterprise: true },
    { name: "API Access", starter: false, pro: false, business: false, enterprise: true },
    { name: "Custom Log", starter: false, pro: false, business: true, enterprise: true },
];

export const ComparisonTable = () => {
    return (
        <section className="py-24 px-4 bg-muted">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0D0D0D] dark:text-white">Compare our plans</h2>
                    <p className="text-sm text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        BuildTracker is a simple, intuitive management platform built to help teams move faster without the friction of complex tools.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-8 px-6 min-w-[200px] text-sm font-bold text-muted-foreground uppercase tracking-widest">Plan features</th>
                                <th className="py-8 px-6 min-w-[150px]"><div className="space-y-1"><p className="font-bold text-[#0D0D0D] dark:text-white">Starter Plan</p></div></th>
                                <th className="py-8 px-6 min-w-[150px] bg-primary/3 rounded-t-3xl"><div className="space-y-1"><p className="font-bold text-[#0D0D0D] dark:text-white">Pro Plan</p></div></th>
                                <th className="py-8 px-6 min-w-[150px]"><div className="space-y-1"><p className="font-bold text-[#0D0D0D] dark:text-white">Business Plan</p></div></th>
                                <th className="py-8 px-6 min-w-[150px]"><div className="space-y-1"><p className="font-bold text-[#0D0D0D] dark:text-white">Custom Plan</p></div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {features.filter(f => !f.isHeader).map((feature, i) => (
                                <tr key={i} className="group hover:bg-muted/30 transition-colors">
                                    <td className="py-6 px-6 text-sm font-bold text-muted-foreground tracking-tight">{feature.name}</td>

                                    <td className="py-6 px-6 text-center">
                                        <div className="flex justify-center">
                                            {typeof feature.starter === "boolean"
                                                ? (feature.starter ? <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /></div> : <Minus className="w-4 h-4 text-muted-foreground/30" />)
                                                : <span className="text-sm font-bold text-muted-foreground">{feature.starter}</span>
                                            }
                                        </div>
                                    </td>

                                    <td className="py-6 px-6 text-center bg-primary/3">
                                        <div className="flex justify-center">
                                            {typeof feature.pro === "boolean"
                                                ? (feature.pro ? <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /></div> : <Minus className="w-4 h-4 text-muted-foreground/30" />)
                                                : <span className="text-sm font-bold text-muted-foreground">{feature.pro}</span>
                                            }
                                        </div>
                                    </td>

                                    <td className="py-6 px-6 text-center">
                                        <div className="flex justify-center">
                                            {typeof feature.business === "boolean"
                                                ? (feature.business ? <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /></div> : <Minus className="w-4 h-4 text-muted-foreground/30" />)
                                                : <span className="text-sm font-bold text-muted-foreground">{feature.business}</span>
                                            }
                                        </div>
                                    </td>

                                    <td className="py-6 px-6 text-center">
                                        <div className="flex justify-center">
                                            {typeof feature.enterprise === "boolean"
                                                ? (feature.enterprise ? <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /></div> : <Minus className="w-4 h-4 text-muted-foreground/30" />)
                                                : <span className="text-sm font-bold text-muted-foreground">{feature.enterprise}</span>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};
