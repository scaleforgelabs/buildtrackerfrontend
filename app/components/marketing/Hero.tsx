"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Images } from "@/public";

export function Hero() {
    return (
        <section className="relative pt-16 md:pt-24 pb-20 px-4 md:px-8 overflow-hidden pl-0 md:pl-20">
            <div className=" mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="w-full lg:w-1/2 text-left space-y-8 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20"
                    >
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            Management Made Simple
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-[5.5rem] font-black tracking-tight text-[#0D0D0D] dark:text-white leading-[1.1]"
                    >
                        Maximize <br /> Your{" "}
                        <span className="text-primary">Project</span> <br /> Potential
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium"
                    >
                        BuildTracker is a simple, intuitive management platform built to
                        help teams move faster without the friction of complex tools.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="pt-4"
                    >
                        <Button className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 text-white text-lg font-bold transition-all hover:scale-105 active:scale-95">
                            Get Started
                        </Button>
                    </motion.div>
                </div>

                <div className="w-full lg:w-1/2 relative">
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative z-10"
                    >
                        <Image
                            src={Images.screenshot}
                            alt="BuildTracker Dashboard"
                            className="w-full h-auto"
                            priority
                        />
                    </motion.div>

                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
                </div>
            </div>
        </section>
    );
}
