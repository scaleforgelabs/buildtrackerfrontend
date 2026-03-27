"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Navbar } from "@/app/components/marketing/Navbar";
import { Footer } from "@/app/components/marketing/Footer";
import { PricingCard } from "@/app/components/marketing/PricingCard";
import { ComparisonTable } from "@/app/components/marketing/ComparisonTable";
import { useRouter } from "next/navigation";

const PricingPage = () => {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white dark:bg-background text-foreground font-poppins overflow-x-hidden mt-20">
            <Navbar />

            <div className="bg-muted m-4 rounded-2xl">

                <main className="">
                    {/* Hero Section */}
                    <section className="pt-16 md:pt-24 pb-12 px-4 text-center space-y-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#0D0D0D] dark:text-white"
                        >
                            Plans and Pricing
                        </motion.h1>

                        {/* Billing Toggle */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center p-1 bg-white dark:bg-muted rounded-full border border-border shadow-sm"
                        >
                            <button
                                onClick={() => setBillingCycle("monthly")}
                                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === "monthly"
                                    ? "bg-muted text-muted-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle("yearly")}
                                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center space-x-2 ${billingCycle === "yearly"
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <span>Yearly</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold">15% Off</span>
                            </button>
                        </motion.div>
                    </section>

                    {/* Pricing Cards Section */}
                    <section className="pb-24 px-4 overflow-visible">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                <PricingCard
                                    name="Starter"
                                    description="Perfect for small teams."
                                    price="0"
                                    billingCycle="month"
                                    features={[
                                        "Up to 5 users",
                                        "Up to 2 workspaces",
                                        "500 MB Storage",
                                        "All tools, unlocked with no limits",
                                        "Work together in real-time"
                                    ]}
                                    onSelectPlan={() => router.push('/checkout/free')}
                                />
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <PricingCard
                                    name="Pro"
                                    description="Perfect for growing teams."
                                    price={billingCycle === "yearly" ? "5,100" : "6,000"}
                                    billingCycle="month"
                                    isPopular={true}
                                    features={[
                                        "Everything in starter",
                                        "Up to 10 users",
                                        "Up to 10 Workspaces",
                                        "All tools, unlocked with no limits",
                                        "Work together in real-time"
                                    ]}
                                    onSelectPlan={() => router.push('/checkout/pro')}
                                />
                            </motion.div>

                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                <PricingCard
                                    name="Business"
                                    description="Perfect for scaling teams."
                                    price={billingCycle === "yearly" ? "15,300" : "18,000"}
                                    billingCycle="month"
                                    features={[
                                        "Everything in Pro",
                                        "Up to 30 Users",
                                        "Up to 30 Workspaces",
                                        "All tools, unlocked with no limits",
                                        "Work together in real-time"
                                    ]}
                                    onSelectPlan={() => router.push('/checkout/business')}
                                />
                            </motion.div>
                        </div>

                        {/* Enterprise / Custom Plan */}
                        <div className="max-w-7xl mx-auto mt-12 bg-white dark:bg-muted/50 rounded-[3rem] p-12 md:p-16 border border-border shadow-sm flex flex-col md:flex-row items-center gap-12 group hover:shadow-xl transition-all">
                            <div className="w-full md:w-1/2 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-extrabold text-[#0D0D0D] dark:text-white">Enterprise</h3>
                                    <p className="text-sm text-muted-foreground font-medium">Perfect for global organization</p>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-extrabold text-[#0D0D0D] dark:text-white">Custom</h2>
                                <Button className="rounded-xl px-12 h-14 bg-primary hover:bg-primary/90 text-white font-bold w-full md:w-fit transition-all active:scale-95 shadow-xl shadow-primary/20">
                                    Contact sale
                                </Button>
                            </div>
                            <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                                <div className="col-span-1 sm:col-span-2">
                                    <p className="text-sm text-muted-foreground font-medium mb-6">Automate service processes and streamline communication</p>
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Enterprise includes:</p>
                                </div>
                                {[
                                    "Unlimited users",
                                    "Unlimited Workspaces",
                                    "Unlimited Storage",
                                    "API Access",
                                    "Project Managers Support"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 border border-primary/20 shrink-0">
                                            <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                        </div>
                                        <span className="text-sm font-extrabold text-[#0D0D0D] dark:text-white/80">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Comparison Table */}
                    <ComparisonTable />

                    {/* CTA Section */}
                    <section className="py-24 px-4">
                        <div className="max-w-7xl mx-auto bg-white dark:bg-muted/50 rounded-[3rem] p-12 md:p-24 text-center md:text-left flex flex-col md:flex-row items-center justify-between border border-border hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                            <div className="space-y-6 relative z-10 max-w-xl">
                                <h2 className="text-5xl font-extrabold text-[#0D0D0D] dark:text-white">Start your trial today.</h2>
                                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                    Manage your workflow without the headache. Whether it's Kanban, Gantt charts, or simple lists, BuildTracker adapts to you—not the other way around.
                                </p>
                                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                    <Button className="rounded-full px-10 h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-bold active:scale-95 transition-all">
                                        Get Started
                                    </Button>
                                    <Button variant="outline" className="rounded-full px-10 h-14 bg-transparent border-primary/30 text-primary hover:bg-primary/5 font-bold transition-all">
                                        Learn more
                                    </Button>
                                </div>
                            </div>
                            {/* Circle decorative elements as seen in design */}
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 h-full aspect-square bg-[#F2F6FF] dark:bg-muted rounded-full -mr-1/4 -z-0"></div>
                        </div>
                    </section>
                </main>
            </div>


            <Footer />
        </div>
    );
};

export default PricingPage;
