"use client";

import { Modal } from "../../ui/Modal";
import { Trash2, AlertTriangle } from "lucide-react";

type DeleteConfirmationModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    count: number;
};

export function DeleteConfirmationModal({
    open,
    onClose,
    onConfirm,
    title,
    count
}: DeleteConfirmationModalProps) {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                        <Trash2 size={24} className="text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Delete {count > 1 ? "Items" : "Item"}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Are you sure you want to delete {count > 1 ? `${count} items` : `"${title}"`}? This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 mb-6">
                    <AlertTriangle size={20} className="text-amber-600 dark:text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                        Deleting these items will remove them permanently from the workspace.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="px-4 py-2 rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
}
