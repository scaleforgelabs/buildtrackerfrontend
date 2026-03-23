"use client";

import { X, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import FormField from "../../ui/FormField";
import { Input } from "../../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/Select";
import { Textarea } from "../../ui/textarea";
import IconSelectionModal from "./IconSelectionModal";
import { quickLinksService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";

interface EditLinksModalProps {
    open: boolean;
    onClose: () => void;
    link: {
        id?: string;
        title: string;
        url?: string;
        category?: string;
        description?: string;
        icon?: string;
    } | null;
    onSaved?: () => void;
}

export default function EditLinksModal({
    open,
    onClose,
    link,
    onSaved,
}: EditLinksModalProps) {
    const { currentWorkspace } = useWorkspace();
    const [selectedIcon, setSelectedIcon] = useState<{
        id: string;
        name: string;
        icon: string;
        color?: string;
    } | null>(null);
    const [iconModalOpen, setIconModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open && link) {
            setName(link.title || "");
            setUrl(link.url || "");
            setCategory(link.category?.toLowerCase() || "");
            setDescription(link.description || "");
            setError("");
            // Pre-set the icon if there's an existing one
            if (link.icon) {
                setSelectedIcon({ id: "existing", name: "Current Icon", icon: link.icon });
            } else {
                setSelectedIcon(null);
            }
        }
    }, [open, link]);

    const handleIconSelect = (icon: { id: string; name: string; icon: string; color?: string }) => {
        setSelectedIcon(icon);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let finalUrl = url;
        if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = `https://${finalUrl}`;
        }

        const payload = {
            title: name,
            url: finalUrl,
            category,
            description,
            icon: selectedIcon?.icon || link?.icon || "",
        };

        try {
            if (currentWorkspace?.id && link?.id) {
                await quickLinksService.updateSharedQuickLink(currentWorkspace.id, link.id, payload);
            } else {
                console.warn("No workspace or link ID; changes not saved to server.");
            }
            onSaved?.();
            onClose();
        } catch (err: any) {
            console.error("Failed to edit quick link:", err);
            const resData = err?.response?.data;
            let errorMessage = "Failed to update link. Please try again.";

            if (resData?.error) errorMessage = resData.error;
            else if (resData?.detail) errorMessage = resData.detail;
            else if (resData && typeof resData === 'object') {
                const firstVal = Object.values(resData)[0];
                if (Array.isArray(firstVal)) errorMessage = firstVal[0] as string;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 h-screen">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-card px-6 py-7 shadow-xl sm:px-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Link2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Edit Custom Link</h2>
                            <p className="text-sm text-muted-foreground">Update your custom link details.</p>
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

                    {/* Icon Preview and Change Button */}
                    <div className="flex items-center gap-4">
                        {/* Icon Preview */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Icon Preview</label>
                            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
                                {selectedIcon ? (
                                    <img
                                        src={selectedIcon.icon}
                                        alt={selectedIcon.name}
                                        width={40}
                                        height={40}
                                        className="h-10 w-10"
                                    />
                                ) : (
                                    <Link2 className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                        </div>

                        {/* Change Icon Button */}
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-medium text-foreground">Service Icon</label>
                            <button
                                type="button"
                                onClick={() => setIconModalOpen(true)}
                                className="rounded-lg border border-input px-4 py-2.5 text-sm w-fit font-medium text-foreground hover:bg-muted transition text-left"
                            >
                                {selectedIcon ? `${selectedIcon.name} Icon` : "Choose Icon"}
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <FormField label="Service Name">
                        <Input
                            type="text"
                            placeholder="Quick Link Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </FormField>

                    {/* URL */}
                    <FormField label="URL">
                        <Input
                            type="text"
                            placeholder="www.companywebsite.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </FormField>

                    {/* Category */}
                    <FormField label="Category">
                        <Select value={category} onValueChange={setCategory} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="communication">Communication</SelectItem>
                                <SelectItem value="collaboration">Collaboration</SelectItem>
                                <SelectItem value="document">Document</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                                <SelectItem value="task">Task</SelectItem>
                                <SelectItem value="team">Team</SelectItem>
                                <SelectItem value="workspace">Workspace</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    {/* Description */}
                    <FormField label="Description">
                        <Textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        />
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
                            disabled={loading}
                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Icon Selection Modal */}
            <IconSelectionModal
                open={iconModalOpen}
                onClose={() => setIconModalOpen(false)}
                onSelect={handleIconSelect}
                selectedIcon={selectedIcon?.id}
            />
        </div>
    );
}
