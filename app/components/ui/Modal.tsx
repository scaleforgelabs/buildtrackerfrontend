"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export function Modal({ open, onClose, children }: ModalProps) {
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 h-screen">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-card shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
