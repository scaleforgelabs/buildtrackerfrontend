import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Images } from "@/public";

export const Footer = () => {
    return (
        <footer className="bg-muted py-16 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image src={Images.logo} alt="BuildTracker Logo" width={32} height={32} />
                            <span className="text-xl font-bold text-[#0D0D0D] dark:text-white font-inter">BuildTracker</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            BuildTracker is a simple, intuitive management platform built to help teams move faster without the friction of complex tools.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><Link href="/product" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link href="/business" className="text-sm text-muted-foreground hover:text-primary transition-colors">Business</Link></li>
                            <li><Link href="/integrations" className="text-sm text-muted-foreground hover:text-primary transition-colors">Integrations</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-foreground mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
                            <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/security" className="text-sm text-muted-foreground hover:text-primary transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} BuildTracker. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
