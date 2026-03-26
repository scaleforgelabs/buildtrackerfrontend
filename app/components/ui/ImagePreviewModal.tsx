'use client'

import React, { useEffect } from 'react'
import { X, Download } from 'lucide-react'

interface ImagePreviewModalProps {
    isOpen: boolean
    imageUrl: string
    fileName?: string
    onClose: () => void
    onDownload?: () => void
}

const ImagePreviewModal = ({ isOpen, imageUrl, fileName, onClose, onDownload }: ImagePreviewModalProps) => {
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !imageUrl) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col items-center max-w-[90vw] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top bar */}
                <div className="absolute -top-12 right-0 flex items-center gap-2">
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm font-medium text-white transition-colors"
                            title="Download"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
                        title="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Image */}
                <img
                    src={imageUrl}
                    alt={fileName || 'Image preview'}
                    className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                />

                {/* File name */}
                {fileName && (
                    <p className="mt-3 text-sm text-white/70 font-medium truncate max-w-full">
                        {fileName}
                    </p>
                )}
            </div>
        </div>
    )
}

export default ImagePreviewModal
