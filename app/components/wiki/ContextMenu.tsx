"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Edit2, Trash2, FolderOpen, ExternalLink } from "lucide-react";
import { cn } from "@/libs/utils";

type ContextMenuProps = {
    x: number;
    y: number;
    onClose: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
    onOpen?: () => void;
    kind?: "file" | "folder" | "document";
    canRename?: boolean;
    canDelete?: boolean;
};

export function ContextMenu({
    x,
    y,
    onClose,
    onRename,
    onDelete,
    onDownload,
    onOpen,
    kind,
    canRename = true,
    canDelete = true
}: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const [pos, setPos] = useState({ top: y, left: x });

    useEffect(() => {
        if (menuRef.current) {
            const { innerWidth, innerHeight } = window;
            const { offsetWidth, offsetHeight } = menuRef.current;

            let newLeft = x;
            let newTop = y;

            if (x + offsetWidth > innerWidth) {
                newLeft = x - offsetWidth;
            }
            if (y + offsetHeight > innerHeight) {
                newTop = y - offsetHeight;
            }

            setPos({ top: newTop, left: newLeft });
        }
    }, [x, y]);

    return (
        <div
            ref={menuRef}
            className="fixed z-[100] w-48 rounded-xl border bg-card shadow-2xl py-1 animate-in fade-in zoom-in duration-100"
            style={{ top: pos.top, left: pos.left }}
        >
            {onOpen && (
                <button
                    onClick={() => { onOpen(); onClose(); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                >
                    <FolderOpen size={16} className="text-muted-foreground" />
                    Open
                </button>
            )}
            {onDownload && (kind === "file" || kind === "document") && (
                <button
                    onClick={() => { onDownload(); onClose(); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                >
                    <Download size={16} className="text-muted-foreground" />
                    Download
                </button>
            )}
            {onRename && (
                <button
                    onClick={() => { if (canRename) { onRename(); onClose(); } }}
                    disabled={!canRename}
                    className={cn(
                        "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors text-foreground hover:bg-muted",
                        !canRename && "opacity-50 blur-[0.5px] cursor-not-allowed grayscale pointer-events-none"
                    )}
                >
                    <Edit2 size={16} className="text-muted-foreground" />
                    Rename
                </button>
            )}
            <div className="h-px bg-border my-1" />
            {onDelete && (
                <button
                    onClick={() => { if (canDelete) { onDelete(); onClose(); } }}
                    disabled={!canDelete}
                    className={cn(
                        "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors text-left",
                        canDelete ? "hover:bg-destructive/10 text-destructive" : "opacity-50 blur-[0.5px] cursor-not-allowed grayscale pointer-events-none text-muted-foreground"
                    )}
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            )}
        </div>
    );
}
