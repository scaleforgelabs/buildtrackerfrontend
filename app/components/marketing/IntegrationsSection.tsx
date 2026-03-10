import React from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Images } from "@/public";

export function IntegrationsSection() {
    return (
        <section className="py-12 md:py-16 lg:py-24 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl mx-auto bg-muted dark:bg-muted/30 rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 lg:p-24 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2 space-y-6 md:space-y-8">
                    <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                        <span className="text-primary">Integrate</span> With Your
                        Favourite Tools
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
                        BuildTracker plays well with others. Connect your workflow to
                        the apps your team already uses every day.
                    </p>
                    <Button className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 text-white font-black active:scale-95 transition-all hover:scale-105">
                        Explore Integration
                    </Button>
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center relative">
                    <Image
                        src={Images.integration}
                        alt="BuildTracker"
                        width={500}
                        height={120}
                    />
                </div>
            </div>
        </section>
    );
}
