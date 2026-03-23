"use client";

import { X, Link2, ExternalLink } from "lucide-react";
import { useEffect } from "react";

interface ViewLinkModalProps {
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
}

export default function ViewLinkModal({ open, onClose, link }: ViewLinkModalProps) {
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    if (!open || !link) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 h-screen">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl sm:p-8 flex flex-col gap-6 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-shrink-0 h-16 w-16 items-center justify-center rounded-2xl border bg-muted/30 overflow-hidden relative">
                            {link.icon ? (
                                <img src={link.icon} alt={link.title} className="h-full w-full object-cover" />
                            ) : (
                                <Link2 className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 pr-4">
                            <h2 className="text-xl font-bold text-foreground truncate break-words">{link.title}</h2>
                            <span className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                                {link.category || "General"}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors -mr-2 -mt-2"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-5 rounded-2xl bg-muted/40 p-5 border border-border/50">

                    {/* URL */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Direct URL</span>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 w-fit text-sm font-medium text-primary hover:underline hover:text-primary/80 transition break-all"
                        >
                            {link.url}
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        </a>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</span>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                            {link.description || <span className="text-muted-foreground italic">No description provided for this quick link.</span>}
                        </p>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-primary px-8 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm w-full sm:w-auto"
                    >
                        Close Details
                    </button>
                </div>

            </div>
        </div>
    );
}
