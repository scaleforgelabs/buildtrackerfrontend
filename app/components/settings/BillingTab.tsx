"use client";

import React from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";

export const BillingTab = () => {
    return (
        <div className="space-y-12">
            {/* Plan Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-foreground">Plan</h3>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0 text-[10px] font-bold uppercase tracking-wider dark:text-emerald-400">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                                Active
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-normal">Information about your current plan on BuildTracker</p>
                    </div>
                </div>

                <div className="bg-muted/50 rounded-2xl p-8 border border-border flex items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 flex-1">
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Your Plan</p>
                            <p className="font-bold text-foreground text-base">BuildTracker Business</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total amount</p>
                            <p className="font-bold text-foreground text-base">120.00 USD</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Cycle</p>
                            <p className="font-bold text-foreground text-base">Monthly</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Next billing date</p>
                            <p className="font-bold text-foreground text-base">Mon, 19 Jan 2027</p>
                        </div>
                        <div className="space-y-2 text-left md:text-left">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total amount</p>
                            <p className="font-bold text-foreground text-base">120.00 USD</p>
                        </div>
                    </div>
                    <Button className="ml-8 px-8 h-11 bg-primary hover:bg-primary/90 shadow-md font-bold rounded-xl whitespace-nowrap hidden sm:block">Edit plan</Button>
                </div>
            </section>

            {/* Payment Method Section */}
            <section className="space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">Payment Method</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                        Your bills will be sent from the default card shown below. <span className="text-foreground font-bold cursor-pointer hover:underline">Learn more.</span>
                    </p>
                </div>

                <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted border-b border-border">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[50px] text-center"><Checkbox className="rounded-md border-border" /></TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Payment method</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Ending</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Status</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Date expired</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Status</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { name: "Google/Visa", ending: "**** 9862", status: "Default", expiry: "02/2032", worker: "Working" },
                                { name: "Flutterwave/Visa", ending: "**** 9862", status: "Default", expiry: "02/2032", worker: "Working" },
                                { name: "Paystack/Mastercard", ending: "**** 9862", status: "Default", expiry: "02/2032", worker: "Working" },
                            ].map((pm, i) => (
                                <TableRow key={i} className="hover:bg-muted/50 transition-colors border-border h-16 group">
                                    <TableCell className="text-center"><Checkbox className="rounded-md border-border" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-7 rounded border border-border bg-background"></div>
                                            <span className="font-semibold text-foreground">{pm.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-muted-foreground">{pm.ending}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] lowercase font-bold dark:text-emerald-400">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                                            {pm.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-muted-foreground">{pm.expiry}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] lowercase font-bold dark:text-emerald-400">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                                            {pm.worker}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-5 h-5 rounded border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* Invoices Section */}
            <section className="space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">Invoices</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                        Invoices are generated every 30 days and send to your default payment method. <span className="text-foreground font-bold cursor-pointer hover:underline">Learn more.</span>
                    </p>
                </div>

                <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted border-b border-border">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[50px] text-center"><Checkbox className="rounded-md border-border" /></TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Description</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Created on</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Status</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Amount</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Plan</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="hover:bg-muted/50 transition-colors border-border h-16 group">
                                <TableCell className="text-center"><Checkbox className="rounded-md border-border" /></TableCell>
                                <TableCell><span className="font-semibold text-foreground">Subscription purchase</span></TableCell>
                                <TableCell className="font-medium text-muted-foreground">January 15, 2026</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] lowercase font-bold dark:text-emerald-400">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                                        Paid
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-muted-foreground">$40.00</TableCell>
                                <TableCell className="font-semibold text-foreground">BuildTracker Pro</TableCell>
                                <TableCell>
                                    <div className="w-5 h-5 rounded border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </section>
        </div>
    );
};
