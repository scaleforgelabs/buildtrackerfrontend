"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Images } from "@/public";

export function FeatureSections() {
    return (
        <>
            <div className="max-w-7xl mx-auto py-16 md:py-24 px-4 md:px-8 text-center space-y-3 md:space-y-4">
                <h2 className="text-primary text-3xl md:text-4xl font-extrabold tracking-tight">
                    Empower <span className="text-primary">Your Project</span>
                </h2>
                <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0D0D0D] dark:text-white">
                    Future with us
                </p>
            </div>

            {/* Feature: Analytics */}
            <section className="px-4 md:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto bg-muted dark:bg-muted/30 rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 lg:p-24 flex flex-col md:flex-row items-center gap-8 md:gap-16 lg:gap-24">
                    <div className="w-full md:w-1/2 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative z-10"
                        >
                            <Image
                                src={Images.analytics}
                                alt="Project Analytics Dashboard"
                                className="w-full h-auto max-w-md md:max-w-none"
                            />
                        </motion.div>
                    </div>
                    <div className="w-full md:w-1/2 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                                Comprehensive <br />{" "}
                                <span className="text-primary">Project Analytics</span>{" "}
                                Dashboard
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                Gain real-time visibility into your operations with a clean,
                                centralized oversight of all your active builds.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-y-6 pt-4">
                            {[
                                "Live Project Metrics",
                                "Team Activity Feeds",
                                "Customizable Widgets",
                                "Automated Progress Tracking",
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center space-x-3 text-lg  text-[#0D0D0D] dark:text-white"
                                >
                                    <div className="w-4 h-4 rounded-full bg-[#0D0D0D] flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full "></div>
                                    </div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature: Tasks */}
            <section className="py-12 md:py-16 lg:py-24 px-4 md:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto bg-muted dark:bg-muted/30 rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 lg:p-24 flex flex-col md:flex-row items-center gap-8 md:gap-16 lg:gap-24">
                    <div className="w-full md:w-1/2 space-y-8 order-2 md:order-1">
                        <h2 className="text-4xl md:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                            <span className="text-primary">Track</span> All Your <br />{" "}
                            Tasks with Ease
                        </h2>
                        <p className="text-xl text-foreground leading-relaxed font-medium">
                            Manage your workflow without the headache. Whether it&apos;s
                            Kanban, Gantt charts, or simple lists, BuildTracker adapts to
                            you—not the other way around.
                        </p>
                        <Button className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 text-white font-black group mt-4 transition-all hover:scale-105 active:scale-95">
                            Explore Features
                        </Button>
                    </div>
                    <div className="w-full md:w-1/2 min-h-[400px] order-1 md:order-2">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative z-10"
                        >
                            <Image
                                src={Images.task}
                                alt="Task Tracking Board"
                                className="w-full h-auto"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    );
}
