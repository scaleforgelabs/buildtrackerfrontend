"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChartColumn, PlaySquare } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Images } from "@/public";
import { useAuth } from "@/libs/hooks/useAuth";

export function CTASection() {
    const { isAuthenticated } = useAuth();
    const signupRedirect = isAuthenticated ? "/home" : "/signup";
    const getStartedText = isAuthenticated ? "Go to Dashboard" : "Get Started";

    return (
        <section className="py-16 md:py-24 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto mb-12 md:mb-16">
                <div className="bg-blue-50 dark:bg-muted/20 rounded-2xl md:rounded-[3.5rem] flex flex-col md:row items-center gap-6 md:gap-12 lg:gap-24 relative overflow-hidden">
                    <div className="w-full md:w-2/5 relative overflow-hidden hidden md:block h-64 md:h-auto">
                        <Image
                            src={Images.tiltRight}
                            alt="Team Management"
                            className="w-full h-full object-cover object-bottom-left"
                        />
                    </div>
                    <div className="w-full md:w-3/5 space-y-6 md:space-y-8 z-10 order-1 md:order-2 p-6 md:p-0">
                        <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                            Ready to manage Your <br />{" "}
                            <span className="text-primary">Team Better</span> with us?
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
                            Stop fighting your software. Start tracking your progress.
                        </p>
                        <Link href={signupRedirect}>
                            <Button className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-black active:scale-95 transition-all hover:scale-105">
                                {getStartedText}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-orange-500 rounded-2xl md:rounded-[3rem] p-8 md:p-12 lg:p-20 text-white space-y-6 md:space-y-8 group overflow-hidden relative">
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                        <ChartColumn className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-4xl md:text-5xl font-black">
                            Start Tracking Progress
                        </h3>
                        <p className="text-white/80 font-medium">
                            BuildTracker optimize your productivity & workflow.
                        </p>
                    </div>
                    <Link href={signupRedirect}>
                        <Button
                            variant="outline"
                            className="rounded-full px-12 h-14 bg-orange-500 border-white text-white hover:bg-white hover:text-orange-500 font-black transition-all"
                        >
                            {getStartedText}
                        </Button>
                    </Link>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                </div>
                <div className="bg-purple-600 rounded-2xl md:rounded-[3rem] p-8 md:p-12 lg:p-20 text-white space-y-6 md:space-y-8 group overflow-hidden relative">
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                        <PlaySquare className="w-10 h-10" />
                    </div>
                    <div className="space-y-3 md:space-y-4 px-4 md:px-0">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black">
                            Watch <br /> Demo
                        </h3>
                        <p className="text-base md:text-lg text-white/80 font-medium">
                            BuildTracker plays well with your team. Watch BuildTracker
                            Now.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="rounded-full px-12 h-14 border-white bg-purple-600 text-white hover:bg-white hover:text-purple-600 font-black transition-all"
                    >
                        Watch Now
                    </Button>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                </div>
            </div>
        </section>
    );
}
