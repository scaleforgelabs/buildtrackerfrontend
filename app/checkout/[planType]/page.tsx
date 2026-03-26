"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, ChevronRight, Minimize2, Layers } from "lucide-react";
import { subscriptionsService } from "@/libs/api/services";
import { useAuth } from "@/libs/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Images } from "@/public";

export default function CheckoutPage({ params }: { params: Promise<{ planType: string }> }) {
    const { user } = useAuth();
    const router = useRouter();
    const resolvedParams = React.use(params);
    const planType = resolvedParams.planType?.toLowerCase() || 'pro';
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isInitiating, setIsInitiating] = useState(false);

    // Default prices based on plan
    const prices = {
        pro: { monthly: 6000, yearly: 61200 }, // 6000 * 12 * 0.85
        business: { monthly: 18000, yearly: 183600 } // 18000 * 12 * 0.85
    };

    const currentPrices = prices[planType as keyof typeof prices] || prices.pro;
    const monthlyFormatted = `₦${(currentPrices.monthly).toLocaleString()}`;
    const yearlyMonthlyFormatted = `₦${(currentPrices.yearly / 12).toLocaleString()}`;

    const handlePayment = async (provider: 'paystack' | 'flutterwave') => {
        if (!user?.id) {
            toast.error("You must be logged in to checkout.");
            return;
        }

        setIsInitiating(true);
        try {
            const response = await subscriptionsService.initiate(user.id, {
                plan_type: planType,
                payment_provider: provider,
                billing_cycle: billingCycle
            });

            if (response.data?.authorization_url) {
                window.location.href = response.data.authorization_url;
            } else {
                toast.error("Failed to generate checkout link.");
                setIsInitiating(false);
            }
        } catch (error: any) {
            console.error("Initiate error", error);
            toast.error(error.response?.data?.error || "An error occurred during checkout.");
            setIsInitiating(false);
        }
    };

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            {/* Minimal Header */}
            <header className="px-8 py-6 flex items-center justify-between bg-white border-b border-gray-100">
                <Link href="/" className="flex items-center space-x-2 text-xl font-extrabold text-[#0D0D0D] dark:text-white font-inter">
                    <Image src={Images.logo} alt="BuildTracker Logo" width={32} height={32} />
                    <span>BuildTracker</span>
                </Link>
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
                    <Link href="/product" className="hover:text-foreground transition-colors">Product</Link>
                    <Link href="/pricing" className="hover:text-foreground transition-colors">Plans</Link>
                    <Link href="/business" className="hover:text-foreground transition-colors">Business</Link>
                    <Link href="/education" className="hover:text-foreground transition-colors">Education</Link>
                    <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
                </nav>
                <div className="flex items-center space-x-3">
                    <button onClick={() => router.push('/settings')} className="px-4 py-2 text-sm font-medium text-primary border border-primary/20 rounded-full hover:bg-primary/5 transition-colors">
                        Cancel
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">

                {/* Left Column: Plan Details */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <button onClick={() => router.back()} className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors mb-6">
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                            Activate Your BuildTracker {capitalize(planType)}
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Get unlimited access to all productivity tools in seconds.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                            <span>{capitalize(planType)} Plan</span>
                        </h3>

                        {/* Monthly Option */}
                        <div
                            onClick={() => setBillingCycle('monthly')}
                            className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex items-center justify-between ${billingCycle === 'monthly' ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-primary/30'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${billingCycle === 'monthly' ? 'border-primary' : 'border-gray-300'
                                    }`}>
                                    {billingCycle === 'monthly' && (
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Monthly Plan</h4>
                                    <p className="text-sm text-gray-500">Ideal for short-term projects & sprints</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-gray-900 text-lg">{monthlyFormatted}</span>
                                <span className="text-sm text-gray-500"> / Month</span>
                            </div>
                        </div>

                        {/* Yearly Option */}
                        <div
                            onClick={() => setBillingCycle('yearly')}
                            className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex items-center justify-between ${billingCycle === 'yearly' ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-primary/30'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${billingCycle === 'yearly' ? 'border-primary' : 'border-gray-300'
                                    }`}>
                                    {billingCycle === 'yearly' && (
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Annual Plan</h4>
                                    <p className="text-sm text-gray-500">
                                        Commit for a year with - <span className="text-primary font-medium">15% savings.</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-gray-900 text-lg">₦{(currentPrices.yearly).toLocaleString()}</span>
                                <span className="text-sm text-gray-500"> / Year</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4">What you'll unlock:</h4>
                        <ul className="space-y-3">
                            {[
                                planType === 'business' ? 'Everything in Pro' : 'Everything in starter',
                                planType === 'business' ? 'Up to 30 Users' : 'Up to 10 Users',
                                planType === 'business' ? 'Up to 30 Workspaces' : 'Up to 10 Workspaces',
                                'All tools, unlocked with no limits',
                                'Work together in real-time'
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-start text-sm text-gray-600">
                                    <span className="mr-2 mt-0.5 w-1 h-1 rounded-full bg-gray-400 block shrink-0"></span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-400 mt-8 leading-relaxed max-w-sm">
                            Everything unlocked synced, and built to adapt to how you work not the other way around. Collaborate in real time, scale your workflow smoothly.
                        </p>
                    </div>
                </div>

                {/* Right Column: Payment Options */}
                <div className="h-full">
                    <div className="bg-white rounded-[2rem] border border-primary/20 p-8 shadow-sm h-full flex flex-col relative overflow-hidden">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Select a payment option</h3>

                        <div className="space-y-6 flex-1 flex flex-col justify-start max-w-md mx-auto w-full pt-2">
                            {/* Flutterwave Option - Now at the top */}
                            <button
                                onClick={() => handlePayment('flutterwave')}
                                disabled={isInitiating}
                                className="group relative w-full bg-[#e04f38] hover:bg-[#d03d27] text-white rounded-[2rem] p-10 text-left transition-all duration-300 disabled:opacity-50 overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                            >
                                <div className="absolute top-8 right-8 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Minimize2 size={42} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-sm font-bold tracking-widest text-white/80 mb-3">FLUTTERWAVE</p>
                                    <h4 className="text-4xl font-bold mb-8 pr-12 leading-tight">Process global payments.</h4>
                                    <div className="inline-flex items-center space-x-2 bg-white text-[#e04f38] font-black px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-lg">
                                        <span>Pay Now</span>
                                    </div>
                                </div>
                            </button>

                            {/* Paystack Option - Commented out for now */}
                            {/*
                            <button
                                onClick={() => handlePayment('paystack')}
                                disabled={isInitiating}
                                className="group relative w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-[2rem] p-8 text-left transition-all duration-300 disabled:opacity-50 overflow-hidden"
                            >
                                <div className="absolute top-6 right-6 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Layers size={32} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-sm font-bold tracking-widest text-white/80 mb-2">PAYSTACK</p>
                                    <h4 className="text-3xl font-bold mb-6 pr-8 leading-tight">Get paid by anyone, anywhere</h4>
                                    <div className="inline-flex items-center space-x-2 bg-white text-[#8b5cf6] font-bold px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors">
                                        <span>Pay Now</span>
                                    </div>
                                </div>
                            </button>
                             */}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
