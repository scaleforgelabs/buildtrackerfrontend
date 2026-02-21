"use client";

import React from "react";
import { Briefcase } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export const WorkspaceTab = () => {
    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="p-4 bg-muted rounded-full border border-border animate-pulse">
                <Briefcase className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">Workspace Settings</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    Manage your team workspace, project environments, and collaboration settings here.
                </p>
            </div>
            <Button variant="outline" className="mt-4 rounded-xl px-8 border-border text-muted-foreground font-semibold" disabled>
                Coming Soon
            </Button>
        </div>
    );
};
