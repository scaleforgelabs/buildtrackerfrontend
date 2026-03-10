import React from "react";

export function TrustedBy() {
    return (
        <section className="bg-muted dark:bg-muted/10 py-8 md:py-12 border-y border-border">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <p className="text-center text-lg md:text-xl font-bold text-primary mb-8 md:mb-12">
                    Trusted by{" "}
                    <span className="text-foreground">
                        modern project teams worldwide.
                    </span>
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center max-w-4xl mx-auto gap-8 md:gap-12">
                    <div className="text-center space-y-1">
                        <p className="text-2xl font-extrabold text-primary">
                            28+ Teams
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Early Access Waitlist
                        </p>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-2xl font-extrabold text-orange-500">
                            Q1 2026
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Launch Date
                        </p>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-2xl font-extrabold text-[#4372E9]">SOC 2</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Compliance Ready
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
