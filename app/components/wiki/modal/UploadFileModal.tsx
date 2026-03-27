"use client";

import { X, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import UploadFIle from "../../ui/UploadFIle";
import { filesService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";

interface UploadFileModalProps {
    open: boolean;
    onClose: () => void;
    folderId?: string;
    onUploaded?: () => void;
}

export default function UploadFileModal({ open, onClose, folderId, onUploaded }: UploadFileModalProps) {
    const { currentWorkspace } = useWorkspace();
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.length || !currentWorkspace?.id) return;
        setError(null);
        setLoading(true);
        try {
            for (const file of files) {
                if (folderId) {
                    await filesService.uploadFileToFolder(currentWorkspace.id, folderId, file);
                } else {
                    await filesService.uploadFile(currentWorkspace.id, file);
                }
            }
            setFiles([]);
            onUploaded?.();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || "Upload failed. Please try again.");
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-card px-6 py-7 shadow-xl sm:px-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Upload File</h2>
                            <p className="text-sm text-muted-foreground">
                                {folderId ? "Upload files to current folder" : "Upload files to workspace"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
                    <UploadFIle onFilesChange={setFiles} />

                    {error && <p className="text-sm text-destructive">{error}</p>}

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
                            disabled={loading || !files.length}
                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Uploading..." : `Upload ${files.length > 1 ? `${files.length} files` : "file"}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
