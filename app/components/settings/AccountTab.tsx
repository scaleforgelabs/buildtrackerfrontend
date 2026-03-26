"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Edit, Lock, EyeOff, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useAuth } from "@/libs/hooks/useAuth";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { authService } from "@/libs/api/auth";
import { toast } from "sonner";
import UserAvatar from "../ui/UserAvatar";

export const AccountTab = () => {
    const { user, logout } = useAuth();
    const { currentWorkspace } = useWorkspace();

    // Profile State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password State
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setEmail(user.email || "");
            setRole(user.role || "");
            setPhone(user.phone || "");
            setBio(user.bio || "");
            setAvatarPreview(user.avatar || null);
        }
    }, [user]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 15 * 1024 * 1024) {
                toast.error("Image must be smaller than 15MB");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            const data: any = {
                first_name: firstName,
                last_name: lastName,
                role: role,
                phone: phone,
                bio: bio
            };
            if (avatarFile) {
                data.avatar = avatarFile;
            }

            await authService.updateProfile(data);
            toast.success("Profile updated successfully! Refresh to see your new data everywhere.");
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to update profile");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSavePassword = async () => {
        if (!oldPassword || !newPassword) {
            toast.error("Please enter both current and new password");
            return;
        }

        setIsSavingPassword(true);
        try {
            await authService.changePassword({ old_password: oldPassword, new_password: newPassword });
            toast.success("Password updated successfully");
            setOldPassword("");
            setNewPassword("");
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "Failed to update password");
        } finally {
            setIsSavingPassword(false);
        }
    };


    return (
        <div className="space-y-12">
            {/* Profile Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Profile</h3>
                    <p className="text-sm text-muted-foreground mt-1">Real-time information and activities of your tasks.</p>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <UserAvatar
                            user={{
                                first_name: firstName,
                                last_name: lastName,
                                avatar: avatarPreview || undefined,
                                name: `${firstName} ${lastName}`.trim()
                            }}
                            size={96}
                            className="ring-4 ring-background shadow-lg"
                        />
                        <div
                            className="absolute inset-0 bg-black/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                        />
                        <button
                            className="absolute -bottom-1 -right-1 bg-background p-2 rounded-full shadow-md border border-border hover:bg-muted transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
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
                        <Label htmlFor="firstName" className="text-sm font-semibold text-foreground/80 ml-1">First name</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-12 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold text-foreground/80 ml-1">Last name</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-12 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary" />
                    </div>
                    <div className="space-y-2 col-span-1 md:col-span-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-foreground/80 ml-1">Email</Label>
                        <Input id="email" value={email} disabled className="h-12 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary opacity-60 cursor-not-allowed" />
                        <p className="text-xs text-muted-foreground ml-1">Email cannot be changed directly.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-semibold text-foreground/80 ml-1">Role</Label>
                        <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Product Manager" className="h-12 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-foreground/80 ml-1">Phone number</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234567890" className="h-12 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="bio" className="text-sm font-semibold text-foreground/80 ml-1">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Write your Bio here e.g your hobbies, interests ETC"
                            className="min-h-[140px] bg-muted/50 border-border rounded-2xl resize-none focus:ring-primary/10 focus:border-primary p-4"
                        />
                    </div>
                </div>

                <div className="flex space-x-3 pt-2">
                    <Button variant="outline" className="h-11 px-8 rounded-xl border-border font-semibold hover:bg-muted transition-all">Cancel</Button>
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-sm font-semibold transition-all">
                        {isSavingProfile ? "Saving..." : "Save"}
                    </Button>
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
            </section >

            {/* Password Section */}
            < section className="space-y-6 pt-6 border-t border-border" >
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
                                type={showOldPassword ? "text" : "password"}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-12 pl-11 pr-11 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary"
                            />
                            <button
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
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
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-12 pl-11 pr-11 bg-muted/50 border-border rounded-xl focus:ring-primary/10 focus:border-primary"
                            />
                            <button
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <EyeOff className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <Button variant="outline" className="h-11 px-8 rounded-xl border-border font-semibold hover:bg-muted" onClick={() => { setOldPassword(""); setNewPassword(""); }}>Cancel</Button>
                    <Button onClick={handleSavePassword} disabled={isSavingPassword || !oldPassword || !newPassword} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-sm font-semibold">
                        {isSavingPassword ? "Saving..." : "Save"}
                    </Button>
                </div>
            </section >

            {/* Account Security Section */}
            < section className="space-y-6 pt-6 border-t border-border" >
                <div>
                    <h3 className="text-xl font-bold text-foreground">Account Security</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manage your account security.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button onClick={() => logout()} variant="outline" className="h-12 px-6 rounded-xl border-border group hover:border-border/80">
                        <LogOut className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="font-semibold text-foreground/80">Log out</span>
                    </Button>
                    <Button variant="ghost" className="h-12 px-6 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border border-rose-500/20 bg-rose-500/5">
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="font-semibold">Delete Account</span>
                    </Button>
                </div>
            </section >
        </div >
    );
};
