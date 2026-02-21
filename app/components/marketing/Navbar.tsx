"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Images } from "@/public";
import { Button } from "@/app/components/ui/button";

export const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image src={Images.logo} alt="BuildTracker Logo" width={32} height={32} />
                            <span className="text-xl font-extrabold text-[#0D0D0D] dark:text-white font-inter">BuildTracker</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/product" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Product</Link>
                        <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Plans</Link>
                        <Link href="/business" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Business</Link>
                        <Link href="/education" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Education</Link>
                        <Link href="/help" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Help</Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/login">
                            <Button variant="outline" className="rounded-full px-6 h-10 border-primary text-primary hover:bg-primary/5 font-semibold">
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="rounded-full px-6 h-10 bg-primary hover:bg-primary/90 text-white shadow-md font-semibold">
                                Sign up
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
