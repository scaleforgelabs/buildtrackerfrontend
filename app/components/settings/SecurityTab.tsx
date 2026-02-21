"use client";

import React from "react";
import { Shield } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export const SecurityTab = () => {
    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="p-4 bg-muted rounded-full border border-border animate-pulse">
                <Shield className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">Security Settings</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    Enhance your account security with two-factor authentication, login alerts, and session management.
                </p>
            </div>
            <Button variant="outline" className="mt-4 rounded-xl px-8 border-border text-muted-foreground font-semibold" disabled>
                Coming Soon
            </Button>
        </div>
    );
};
