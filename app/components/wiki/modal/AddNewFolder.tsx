"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import FormField from "../../ui/FormField";
import { Input } from "../../ui/input";
import api from "@/libs/api";
import { useWorkspace } from "@/libs/hooks/useWorkspace";

interface AddNewFolderModalProps {
    open: boolean;
    onClose: () => void;
    parentFolderId?: string;
    onFolderCreated?: () => void;
}

export default function AddNewFolderModal({
    open,
    onClose,
    parentFolderId,
    onFolderCreated,
}: AddNewFolderModalProps) {
    const { currentWorkspace } = useWorkspace();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWorkspace?.id || !name.trim()) return;
        setError(null);

        try {
            setLoading(true);
            const payload: any = { name };
            if (parentFolderId) {
                payload.parent = parentFolderId;
            }

            await api.post(
                `/files/workspaces/${currentWorkspace.id}/folders/create/`,
                payload
            );

            setName("");
            onFolderCreated?.();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to create folder. Please try again.");
            console.error("Failed to create folder:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
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
            <div className="relative z-10 w-full max-w-xl rounded-2xl bg-card px-6 py-7 shadow-xl sm:px-8">
                {/* Form */}
                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <p className="text-xl font-semibold">New Folder</p>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <FormField label="">
                        <Input
                            type="text"
                            placeholder="Folder name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </FormField>

                    {/* Actions */}
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
                            disabled={loading || !name.trim()}
                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
