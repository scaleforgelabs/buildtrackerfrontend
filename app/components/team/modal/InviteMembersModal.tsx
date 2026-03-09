"use client";

import { X, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { CountrySelect } from "../../ui/CountrySelect";
import FormField from "../../ui/FormField";
import { Input } from "../../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/Select";
import { workspacesService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";

interface InviteMembersModalProps {
    open: boolean;
    onClose: () => void;
    onInviteSent?: () => void;
}

export default function InviteMembersModal({
    open,
    onClose,
    onInviteSent,
}: InviteMembersModalProps) {
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState("+234");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [jobRole, setJobRole] = useState("");
    const [role, setRole] = useState("Member");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const { currentWorkspace } = useWorkspace();

    const resetForm = () => {
        setEmail("");
        setPhoneNumber("");
        setJobRole("");
        setRole("Member");
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentWorkspace?.id) {
            setError("No workspace selected");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const invitationData = {
                email,
                role: role as 'Admin' | 'Member',
                phone: phoneNumber ? `${countryCode}${phoneNumber}` : undefined,
                job_role: jobRole || undefined,
            };

            await workspacesService.sendInvitation(currentWorkspace.id, invitationData);
            
            resetForm();
            onClose();
            onInviteSent?.();
        } catch (err: any) {
            console.error('Failed to send invitation:', err);
            setError(err.response?.data?.error || err.response?.data || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            resetForm();
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 h-screen">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-[520px] rounded-2xl bg-card px-6 py-7 shadow-xl sm:px-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <UserPlus className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Invite Members
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Send an invitation to collaborate on this workspace.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    
                    {/* Email */}
                    <FormField label="Email Address">
                        <Input
                            type="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </FormField>

                    {/* Phone */}
                    <FormField label="Phone Number (Optional)">
                        <div className="flex">
                            <CountrySelect
                                value={countryCode}
                                onChange={setCountryCode}
                                disabled={loading}
                            />

                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={e =>
                                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                                }
                                placeholder="8012345678"
                                disabled={loading}
                                className="flex h-11 w-full rounded-r-lg border border-input bg-background px-3 py-2 text-sm ring-0 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 ring-0"
                            />
                        </div>
                    </FormField>

                    {/* Job Role */}
                    <FormField label="Job Role (Optional)">
                        <Input
                            type="text"
                            placeholder="Product Management, Software Engineer e.t.c"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            disabled={loading}
                        />
                    </FormField>

                    {/* Status */}
                    <FormField label="Status">
                        <div className="relative">
                            <Input
                                type="text"
                                value="Available"
                                readOnly
                                className="pl-9 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 cursor-default"
                            />
                            <div className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    </FormField>

                    {/* Workspace Role */}
                    <FormField label="Workspace Role">
                        <Select value={role} onValueChange={setRole} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Member">Member</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-input px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
