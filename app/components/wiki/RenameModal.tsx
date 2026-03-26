"use client";

import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";

interface RenameModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (newName: string) => Promise<void>;
    initialName: string;
    title: string;
}

export function RenameModal({ open, onClose, onConfirm, initialName, title }: RenameModalProps) {
    const [name, setName] = useState(initialName);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setName(initialName);
        }
    }, [open, initialName]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!name.trim() || name === initialName) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            await onConfirm(name.trim());
            onClose();
        } catch (error) {
            console.error("Rename failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="rename-input">New Name</Label>
                        <Input
                            id="rename-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter new name..."
                            autoFocus
                            onFocus={(e) => {
                                const lastDotIndex = name.lastIndexOf(".");
                                if (lastDotIndex > 0) {
                                    e.target.setSelectionRange(0, lastDotIndex);
                                } else {
                                    e.target.select();
                                }
                            }}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !name.trim()}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Rename
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
