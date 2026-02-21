"use client";

import React, { useState } from "react";
import {
    User,
    Briefcase,
    CreditCard,
    Bell,
    Shield,
    Sliders,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Tab Components
import { AccountTab } from "@/app/components/settings/AccountTab";
import { BillingTab } from "@/app/components/settings/BillingTab";
import { WorkspaceTab } from "@/app/components/settings/WorkspaceTab";
import { SecurityTab } from "@/app/components/settings/SecurityTab";
import { NotificationTab } from "@/app/components/settings/NotificationTab";
import { PreferencesTab } from "@/app/components/settings/PreferencesTab";

type TabType = "Account" | "Workspace" | "Billing" | "Notification" | "Security" | "Preferences";

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>("Account");

    const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
        { id: "Account", icon: <User className="w-4 h-4" />, label: "Account" },
        { id: "Workspace", icon: <Briefcase className="w-4 h-4" />, label: "Workspace" },
        { id: "Billing", icon: <CreditCard className="w-4 h-4" />, label: "Billing" },
        { id: "Notification", icon: <Bell className="w-4 h-4" />, label: "Notification" },
        { id: "Security", icon: <Shield className="w-4 h-4" />, label: "Security" },
        { id: "Preferences", icon: <Sliders className="w-4 h-4" />, label: "Preferences" },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen bg-muted">
            <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-inter">Settings</h1>
                <p className="text-muted-foreground font-medium">Configure Your BuildTracker Preferences</p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center space-x-1 bg-card p-1 rounded-2xl border border-border shadow-sm w-fit max-w-full overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                            ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-card rounded-[2rem] border border-border shadow-sm p-6 md:p-10 min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "Account" && <AccountTab />}
                        {activeTab === "Billing" && <BillingTab />}
                        {activeTab === "Workspace" && <WorkspaceTab />}
                        {activeTab === "Security" && <SecurityTab />}
                        {activeTab === "Notification" && <NotificationTab />}
                        {activeTab === "Preferences" && <PreferencesTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SettingsPage;