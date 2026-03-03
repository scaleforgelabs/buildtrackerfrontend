"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, BarChart3, Layout, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Navbar } from "@/app/components/marketing/Navbar";
import { Footer } from "@/app/components/marketing/Footer";
import { PricingCard } from "@/app/components/marketing/PricingCard";
import { ComparisonTable } from "@/app/components/marketing/ComparisonTable";
import { Images } from "@/public";
import Image from "next/image";

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly",
  );
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-background text-foreground font-poppins mt-20 relative overflow-hidden">
      <Navbar />

      <AnimatePresence mode="wait">
        {!showPaymentOverlay ? (
          <motion.div
            key="pricing-content"
            initial={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="bg-muted m-4 rounded-[2.5rem]"
          >
            <main className="">
              {/* Hero Section */}
              <section className="pt-16 md:pt-24 pb-12 px-4 text-center space-y-8">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-black tracking-tight text-[#0D0D0D] dark:text-white"
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
                    className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                      billingCycle === "monthly"
                        ? "bg-muted text-muted-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center space-x-2 ${
                      billingCycle === "yearly"
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>Yearly</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                      15% Off
                    </span>
                  </button>
                </motion.div>
              </section>

              {/* Pricing Cards Section */}
              <section className="pb-24 px-4 overflow-visible">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <PricingCard
                      name="Starter"
                      description="Perfect for small teams."
                      price="0"
                      billingCycle="month"
                      onGetStarted={() => setShowPaymentOverlay(true)}
                      features={[
                        "Up to 3 users",
                        "Up to 2 workspaces",
                        "500 MB Storage",
                        "Instant project creation",
                        "Instant project creation",
                        "Instant project creation",
                      ]}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <PricingCard
                      name="Pro"
                      description="Perfect for growing teams."
                      price={billingCycle === "yearly" ? "20" : "25"}
                      billingCycle="month"
                      isPopular={true}
                      onGetStarted={() => setShowPaymentOverlay(true)}
                      features={[
                        "Everything in starter",
                        "Up to 10 users",
                        "Up to 10 Workspaces",
                        "10 GB storage",
                        "10 GB storage",
                      ]}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <PricingCard
                      name="Business"
                      description="Perfect for scaling teams."
                      price={billingCycle === "yearly" ? "50" : "60"}
                      billingCycle="month"
                      onGetStarted={() => setShowPaymentOverlay(true)}
                      features={[
                        "Instant project creation",
                        "Instant project creation",
                        "Instant project creation",
                        "Instant project creation",
                        "Instant project creation",
                        "Instant project creation",
                      ]}
                    />
                  </motion.div>
                </div>

                {/* Enterprise / Custom Plan */}
                <div className="max-w-7xl mx-auto mt-12 bg-white dark:bg-muted/50 rounded-[3rem] p-12 md:p-16 border border-border shadow-sm flex flex-col md:flex-row items-center gap-12 group hover:shadow-xl transition-all">
                  <div className="w-full md:w-1/2 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-[#0D0D0D] dark:text-white">
                        Enterprise
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        Perfect for global organization
                      </p>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-[#0D0D0D] dark:text-white">
                      Custom
                    </h2>
                    <Button className="rounded-xl px-12 h-14 bg-primary hover:bg-primary/90 text-white font-black w-full md:w-fit transition-all active:scale-95 shadow-xl shadow-primary/20">
                      Contact sale
                    </Button>
                  </div>
                  <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-sm text-muted-foreground font-medium mb-6">
                        Automate service processes and streamline communication
                      </p>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6">
                        Enterprise includes:
                      </p>
                    </div>
                    {[
                      "Unlimited users",
                      "Unlimited Workspaces",
                      "Unlimited Storage",
                      "API Access",
                      "Project Managers Support",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 border border-primary/20 shrink-0">
                          <Check
                            className="w-3 h-3 text-primary"
                            strokeWidth={4}
                          />
                        </div>
                        <span className="text-sm font-black text-[#0D0D0D] dark:text-white/80">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Comparison Table */}
              <ComparisonTable />

              {/* CTA Section */}
              <section className="py-24 px-4">
                <div className="mx-2 md:mx-20  bg-blue-50  rounded-[3rem] pt-12 md:pt-24 text-center md:text-left flex flex-col md:flex-row items-center justify-between border border-border transition-all duration-500 overflow-hidden relative">
                  <div className="space-y-6 relative z-10 max-w-xl pl-4 md:pl-24">
                    <h2 className="text-5xl font-black text-[#0D0D0D] dark:text-white">
                      Start your trial today.
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                      Manage your workflow without the headache. Whether it's
                      Kanban, Gantt charts, or simple lists, BuildTracker adapts
                      to you—not the other way around.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <Button
                        onClick={() => setShowPaymentOverlay(true)}
                        className="rounded-full px-10 h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-black active:scale-95 transition-all"
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full px-10 h-14 bg-transparent border-primary/30 text-primary hover:bg-primary/5 font-black transition-all"
                      >
                        Learn more
                      </Button>
                    </div>
                  </div>
                  <Image
                    src={Images.tiltLeft}
                    alt="CTA Background"
                    className="h-96 w-auto object-cover"
                  />
                </div>
              </section>
            </main>
            <Footer />
          </motion.div>
        ) : (
          <motion.div
            key="payment-overlay"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{
              duration: 0.5,
              type: "spring",
              damping: 25,
              stiffness: 200,
            }}
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
          >
            <div className="w-full max-w-7xl mx-auto bg-muted rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* LEFT SECTION */}
              <div className="w-full lg:flex-1 space-y-8">
                {/* Back Button */}
                <motion.button
                  animate={{ x: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm"
                  onClick={() => setShowPaymentOverlay(false)}
                >
                  <ArrowLeft size={18} className="text-gray-500" />
                </motion.button>

                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
                    Activate Your BuildTracker Pro
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 mt-2">
                    Get unlimited access to all productivity tools in seconds.
                  </p>
                </div>

                {/* Starter Plan */}
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                    Starter Plan
                  </h2>

                  {/* Monthly */}
                  <div className="border-2 border-blue-500 rounded-xl p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex gap-3">
                      <input
                        type="radio"
                        checked
                        readOnly
                        className="mt-1 accent-blue-600"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          Monthly Plan
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Ideal for short-term project & sprints
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      $12{" "}
                      <span className="text-xs sm:text-sm font-normal text-gray-400">
                        / Month
                      </span>
                    </p>
                  </div>

                  {/* Annual */}
                  <div className="border border-gray-300 rounded-xl p-4 sm:p-5 bg-white mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex gap-3">
                      <input type="radio" className="mt-1 accent-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          Annual Plan
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Commit for a year with{" "}
                          <span className="text-blue-500">20% savings.</span>
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      $10{" "}
                      <span className="text-xs sm:text-sm font-normal text-gray-400">
                        / Month
                      </span>
                    </p>
                  </div>
                </div>

                {/* Unlock Section */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                    What you’ll unlock:
                  </h3>

                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Everything in starter</li>
                    <li>• Up to 10 Users</li>
                    <li>• Up to 10 Workspace</li>
                    <li>• All tools, unlocked with no limits</li>
                    <li>• Work together in real-time</li>
                  </ul>

                  <p className="text-xs text-gray-500 mt-6 leading-relaxed max-w-full sm:max-w-md">
                    Everything unlocked synced, and built to adapt to how you
                    work not the other way around. Collaborate in real time,
                    scale your workflow smoothly.
                  </p>
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div className="w-full lg:flex-1 border-2 border-blue-500 rounded-2xl p-6 sm:p-8 bg-white">
                <h2 className="text-lg sm:text-xl font-semibold text-center text-gray-900 mb-6 sm:mb-8">
                  Select a payment option
                </h2>

                {/* Paystack Card */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white mb-6 sm:mb-8 shadow-md">
                  <p className="uppercase text-xs tracking-wider opacity-80">
                    PAYSTACK
                  </p>
                  <h3 className="text-lg sm:text-2xl font-semibold mt-3">
                    Get paid by anyone, anywhere
                  </h3>

                  <button className="mt-6 bg-white text-purple-600 px-6 py-2 rounded-full font-medium text-sm">
                    Pay Now
                  </button>
                </div>

                {/* Flutterwave Card */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-md">
                  <p className="uppercase text-xs tracking-wider opacity-80">
                    FLUTTERWAVE
                  </p>
                  <h3 className="text-lg sm:text-2xl font-semibold mt-3">
                    Process global payments.
                  </h3>

                  <button className="mt-6 bg-white text-red-500 px-6 py-2 rounded-full font-medium text-sm">
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingPage;
