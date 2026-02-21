"use client";

import React from "react";
import { Camera, Edit, Lock, EyeOff, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";

export const AccountTab = () => {
    return (
        <div className="space-y-12">
            {/* Profile Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Profile</h3>
                    <p className="text-sm text-muted-foreground mt-1">Real-time information and activities of your tasks.</p>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden ring-4 ring-background">
                            {/* Profile Image Placeholder */}
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            AM
                        </div>
                        <button className="absolute -bottom-1 -right-1 bg-background p-2 rounded-full shadow-md border border-border hover:bg-muted transition-colors">
                            <Edit className="w-4 h-4 text-primary" />
                        </button>
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-foreground">Profile Picture</h4>
                        <p className="text-xs text-muted-foreground">PNG, JPEG under 15MB</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullname" className="text-sm font-semibold text-foreground/80 ml-1">Full name</Label>
                        <Input id="fullname" defaultValue="Abdulmalik Olabisi" className="h-12 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-foreground/80 ml-1">Email</Label>
                        <Input id="email" defaultValue="abdulmalik@buildtracker.com" className="h-12 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-semibold text-foreground/80 ml-1">Role</Label>
                        <Input id="role" defaultValue="Product Manager" className="h-12 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-foreground/80 ml-1">Phone number</Label>
                        <Input id="phone" defaultValue="+1 23456789021" className="h-12 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="bio" className="text-sm font-semibold text-foreground/80 ml-1">Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Write your Bio here e.g your hobbies, interests ETC"
                            className="min-h-[140px] bg-muted/50 border-border rounded-2xl resize-none focus:ring-primary/10 focus:border-primary p-4"
                        />
                    </div>
                </div>

                <div className="flex space-x-3 pt-2">
                    <Button variant="outline" className="h-11 px-8 rounded-xl border-border font-semibold hover:bg-muted transition-all">Cancel</Button>
                    <Button className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-sm font-semibold transition-all">Save</Button>
                </div>
            </section>

            {/* Notification Section */}
            <section className="space-y-6 pt-6 border-t border-border">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Notification</h3>
                    <p className="text-sm text-muted-foreground mt-1">Modify your current password.</p>
                </div>

                <div className="space-y-5">
                    {[
                        { id: "email-notif", label: "Email Notification", desc: "You will be notified when a new email arrives.", checked: false },
                        { id: "sound-notif", label: "Sound Notification", desc: "You will be notified with sound when someone messages you.", checked: true },
                        { id: "sub-notif", label: "Subscription", desc: "You will be notified when you subscribe to an account.", checked: false },
                    ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-4 p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
                            <div className="pt-1">
                                <Checkbox id={item.id} defaultChecked={item.checked} className="w-5 h-5 rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={item.id} className="text-base font-bold text-foreground cursor-pointer">{item.label}</Label>
                                <p className="text-sm text-muted-foreground leading-relaxed font-normal">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Password Section */}
            <section className="space-y-6 pt-6 border-t border-border">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Password</h3>
                    <p className="text-sm text-muted-foreground mt-1">Modify your current password.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground/80 ml-1">Current Password</Label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Lock className="w-4 h-4" />
                            </span>
                            <Input
                                type="password"
                                defaultValue="••••••••••••••"
                                className="h-12 pl-11 pr-11 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                <EyeOff className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground/80 ml-1">New Password</Label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Lock className="w-4 h-4" />
                            </span>
                            <Input
                                type="password"
                                defaultValue="••••••••••••••"
                                className="h-12 pl-11 pr-11 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                <EyeOff className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <Button variant="outline" className="h-11 px-8 rounded-xl border-border font-semibold hover:bg-muted">Cancel</Button>
                    <Button className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-sm font-semibold">Save</Button>
                </div>
            </section>

            {/* Account Security Section */}
            <section className="space-y-6 pt-6 border-t border-border">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Account Security</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage your account security.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-border group hover:border-border/80">
                        <LogOut className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="font-semibold text-foreground/80">Log out</span>
                    </Button>
                    <Button variant="ghost" className="h-12 px-6 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 bg-rose-500/5">
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="font-semibold">Delete Account</span>
                    </Button>
                </div>
            </section>
        </div>
    );
};
