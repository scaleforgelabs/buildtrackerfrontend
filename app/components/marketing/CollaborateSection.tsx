"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Images } from "@/public";

export function CollaborateSection() {
    return (
        <section className="py-16 md:py-24 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto text-center space-y-12 md:space-y-16">
                <div className="space-y-4">
                    <h2 className="text-primary text-4xl md:text-5xl font-black">
                        Collaborate
                    </h2>
                    <p className="text-4xl md:text-6xl font-black text-[#0D0D0D] dark:text-white">
                        Across the Globe
                    </p>
                    <p className="text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                        Real-time communication tools designed for remote, hybrid, and
                        site-based teams.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Multi-Organization",
                            color: "bg-primary",
                            desc: "Manage multiple teams with role-based permissions and isolated workspaces.",
                            image: Images.workspace,
                        },
                        {
                            title: "Wiki & Docs",
                            color: "bg-orange-400",
                            desc: "Built-in documentation system with version control for your SOPs and blueprints.",
                            image: Images.folderScreenshot,
                        },
                        {
                            title: "Analytics & Reports",
                            color: "bg-purple-500",
                            desc: "Get report and analytics of individual team members and performance of team.",
                            image: Images.rate,
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="text-center group"
                        >
                            <div className="bg-muted rounded-xl relative overflow-hidden mb-8 h-fit">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    className="pl-15 pr-8 pt-12 w-auto h-full object-contain object-bottom"
                                />
                            </div>
                            <div className="space-y-3 px-4">
                                <h3 className="text-2xl font-black text-[#0D0D0D] dark:text-white">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
