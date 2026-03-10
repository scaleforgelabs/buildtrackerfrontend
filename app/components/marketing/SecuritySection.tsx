import React from "react";
import Image from "next/image";
import { Layout, Users } from "lucide-react";
import { Images } from "@/public";

export function SecuritySection() {
    return (
        <section className="py-12 md:py-16 lg:py-24 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto text-center mb-12 md:mb-16">
                <h2 className="text-primary text-4xl md:text-5xl font-black">
                    Security & Trust
                </h2>
            </div>
            <div className="max-w-7xl mx-auto rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 lg:p-24 flex flex-col md:flex-row items-center gap-8 md:gap-16 lg:gap-32 bg-muted">
                <div className="w-full md:w-1/2 relative flex justify-center">
                    <div className="w-40 h-40 md:w-56 md:h-56 bg-blue-50 dark:bg-muted/20 rounded-full flex items-center justify-center relative">
                        <Image
                            src={Images.auth}
                            alt="Security & Authentication"
                            className="w-32 h-32 md:w-44 md:h-44 object-contain"
                        />
                    </div>
                </div>
                <div className="w-full md:w-1/2 space-y-12">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                            Achieve{" "}
                            <span className="text-primary">
                                Operational <br /> Excellence
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                            We take your data seriously. Your intellectual property is
                            protected by the same standards used by global banks.
                        </p>
                    </div>
                    <div className="space-y-10">
                        <div className="flex items-start space-x-6">
                            <div className="w-12 h-12 rounded-full bg-orange-400 shrink-0 shadow-xl shadow-orange-400/20 flex items-center justify-center">
                                <Layout className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-[#0D0D0D] dark:text-white">
                                    Multi-Factor Authentication
                                </h4>
                                <p className="text-sm text-muted-foreground font-medium mt-1">
                                    Secure logins for every team member.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-6">
                            <div className="w-12 h-12 rounded-full bg-orange-400 shrink-0 shadow-xl shadow-orange-400/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-[#0D0D0D] dark:text-white">
                                    End-to-End Encryption
                                </h4>
                                <p className="text-sm text-muted-foreground font-medium mt-1">
                                    Your documents and chats are for your eyes only.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
