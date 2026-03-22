"use client";

import { X, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import FormField from "../../ui/FormField";
import { Input } from "../../ui/input";
import { quickLinksService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";

interface DeleteLinksModalProps {
    open: boolean;
    onClose: () => void;
    link: {
        id?: string;
        title: string;
    };
    onDeleted?: () => void;
}

export default function DeleteLinksModal({
    open,
    onClose,
    link,
    onDeleted,
}: DeleteLinksModalProps) {
    const { currentWorkspace } = useWorkspace();
    const [confirmName, setConfirmName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setConfirmName("");
            setError("");
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (confirmName !== link.title) return;

        setLoading(true);
        setError("");

        try {
            if (currentWorkspace?.id && link?.id) {
                await quickLinksService.deleteSharedQuickLink(currentWorkspace.id, link.id);
            } else {
                console.warn("No workspace or link ID; link not deleted from server.");
            }
            onDeleted?.();
            onClose();
        } catch (err: any) {
            console.error("Failed to delete quick link:", err);
            setError(
                err?.response?.data?.error ||
                err?.response?.data?.detail ||
                "Failed to delete link. Please try again."
            );
        } finally {
            setLoading(false);
            setConfirmName("");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 h-screen">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-[520px] rounded-2xl bg-card px-6 py-7 shadow-xl sm:px-8">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Delete Quick Link</h2>
                            <p className="text-sm text-muted-foreground pt-1">
                                This action cannot be undone.
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

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="p-4 bg-muted/50 rounded-lg text-sm text-foreground">
                        To confirm, please type{" "}
                        <strong className="select-all">{link.title}</strong> below.
                    </div>

                    <FormField label="Confirm Link Name">
                        <Input
                            type="text"
                            placeholder="Type name to confirm"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </FormField>

                    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-input px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || confirmName !== link.title}
                            className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Deleting..." : "Delete Link"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
