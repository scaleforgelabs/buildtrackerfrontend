import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import { getFileIcon } from '@/libs/utils'
import ImagePreviewModal from './ImagePreviewModal'

interface UploadFileProps {
    onFilesChange?: (files: File[]) => void
}

interface FileWithProgress extends File {
    progress?: number
}

const ImagePreview = ({ file, onClick }: { file: File; onClick?: () => void }) => {
    const [previewUrl, setPreviewUrl] = useState<string>('')
    useEffect(() => {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [file])
    return previewUrl ? (
        <button type="button" onClick={onClick} className="cursor-pointer">
            <img src={previewUrl} alt="Preview" className="h-10 w-10 object-cover rounded-lg border border-gray-100 hover:ring-2 hover:ring-primary/40 transition-all" />
        </button>
    ) : null
}

const UploadFile = ({ onFilesChange }: UploadFileProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadedFiles, setUploadedFiles] = useState<FileWithProgress[]>([])
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null)

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const simulateUpload = (index: number) => {
        let progress = 0
        const interval = setInterval(() => {
            progress += Math.random() * 40
            if (progress > 100) progress = 100

            setUploadedFiles(prev => {
                const updated = [...prev]
                if (updated[index]) {
                    updated[index].progress = progress
                }
                return updated
            })

            if (progress >= 100) clearInterval(interval)
        }, 300)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const filesWithProgress = files.map(file => {
            const fileWithProgress = file as FileWithProgress
            fileWithProgress.progress = 0
            return fileWithProgress
        })

        const updated = [...uploadedFiles, ...filesWithProgress]
        setUploadedFiles(updated)

        filesWithProgress.forEach((file, index) => {
            simulateUpload(uploadedFiles.length + index)
        })

        onFilesChange?.(updated)
    }

    const handleRemove = (index: number) => {
        const updated = uploadedFiles.filter((_, i) => i !== index)
        setUploadedFiles(updated)
        onFilesChange?.(updated)
    }

    const openImagePreview = (file: File) => {
        const url = URL.createObjectURL(file)
        setPreviewFile({ url, name: file.name })
    }

    const closeImagePreview = () => {
        if (previewFile) {
            URL.revokeObjectURL(previewFile.url)
        }
        setPreviewFile(null)
    }

    return (
        <>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">Attachment</label>
                <button
                    type="button"
                    onClick={handleClick}
                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-8 hover:bg-muted/50 transition-colors"
                >
                    <div className="mb-3 rounded-lg border bg-card p-2 shadow-sm">
                        <Upload className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-primary">Click to upload <span className="text-muted-foreground">or drag and drop</span></p>
                        <p className="mt-1 text-xs text-muted-foreground">Drag and drop files here, or click to browse</p>
                    </div>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            {uploadedFiles.length > 0 && (
                <div className="flex flex-col gap-3">
                    {uploadedFiles.map((file, index) => {
                        const isComplete = (file.progress || 0) >= 100
                        const fileExt = file.name.split('.').pop()?.toUpperCase() || 'FILE'
                        const isImage = file.type.startsWith('image/')

                        return (
                            <div key={index} className="flex items-center justify-between rounded-xl border bg-card p-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex h-10 w-10 items-center justify-center shrink-0">
                                        {isImage ? (
                                            <ImagePreview file={file} onClick={() => openImagePreview(file)} />
                                        ) : (
                                            <img width="40" height="40" src={getFileIcon(file.name)} alt="File" className="object-contain" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium text-foreground ${isImage ? 'cursor-pointer hover:text-primary' : ''}`}
                                            onClick={() => isImage && openImagePreview(file)}
                                        >
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB - {Math.round(file.progress || 0)}% Uploaded</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    {isComplete ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <ImagePreviewModal
                isOpen={!!previewFile}
                imageUrl={previewFile?.url || ''}
                fileName={previewFile?.name}
                onClose={closeImagePreview}
            />
        </>
    )
}

export default UploadFile

