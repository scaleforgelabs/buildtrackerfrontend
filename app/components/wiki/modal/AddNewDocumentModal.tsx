"use client";

import { X, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import FormField from "../../ui/FormField";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import UploadFIle from "../../ui/UploadFIle";
import { wikiService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { generateDocumentPreview, getFileTypeName } from "@/libs/utils/documentPreview";

interface AddNewDocumentModalProps {
    open: boolean;
    onClose: () => void;
    folderId?: string;
    onDocumentCreated?: () => void;
}

export default function AddNewDocumentModal({
    open,
    onClose,
    folderId,
    onDocumentCreated,
}: AddNewDocumentModalProps) {
    const { currentWorkspace } = useWorkspace();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleFilesChange = async (uploadedFiles: File[]) => {
        setFiles(uploadedFiles);

        if (uploadedFiles.length > 0) {
            const first = uploadedFiles[0];
            setFileType(getFileTypeName(first));
            const preview = await generateDocumentPreview(first);
            setPreviewUrl(preview);
        } else {
            setPreviewUrl(null);
            setFileType("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !currentWorkspace?.id) return;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("document_title", title.trim());
            formData.append("document_description", description.trim());
            formData.append("visibility", isPublic ? "public" : "private");

            for (const file of files) {
                formData.append("attachments", file);
            }

            // Send the first image file (or generated preview) as the document cover
            if (files.length > 0) {
                const firstFile = files[0];
                const isImage = firstFile.type.startsWith("image/");
                if (isImage) {
                    formData.append("image", firstFile);
                } else if (previewUrl && previewUrl.startsWith("blob:")) {
                    // Convert canvas-rendered PDF preview to a File
                    const res = await fetch(previewUrl);
                    const blob = await res.blob();
                    formData.append("image", new File([blob], "preview.jpg", { type: "image/jpeg" }));
                }
            }

            await wikiService.createDocument(currentWorkspace.id, formData);

            setTitle("");
            setDescription("");
            setFiles([]);
            setPreviewUrl(null);
            setFileType("");
            onDocumentCreated?.();
            onClose();
        } catch (error) {
            console.error("Failed to create wiki document:", error);
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
            <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-card px-6 py-7 shadow-xl sm:px-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Add New Document
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Create a new document in your workspace wiki
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

                {/* Preview */}
                {previewUrl && (
                    <div className="mt-5 flex items-center gap-4 rounded-xl border bg-muted/40 p-3">
                        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-background">
                            <Image
                                src={previewUrl}
                                alt="Document preview"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-foreground">
                                {files[0]?.name}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                {fileType}
                            </span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
                    <FormField label="Document Title">
                        <Input
                            placeholder="e.g. Product Brief"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </FormField>

                    <FormField label="Description">
                        <Input
                            placeholder="Short description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        />
                    </FormField>

                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Make Public</p>
                        <Switch
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                            disabled={loading}
                        />
                    </div>

                    <UploadFIle onFilesChange={handleFilesChange} />

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
                            disabled={loading || !title.trim()}
                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Add Document"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
