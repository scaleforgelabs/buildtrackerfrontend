'use client'

import React from 'react'
import { getFileIcon } from '@/libs/utils'
import ImagePreviewModal from './ImagePreviewModal'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import dynamic from 'next/dynamic'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-[300px] bg-gray-100 animate-pulse flex items-center justify-center rounded-lg text-gray-400 text-xs">Loading Emojis...</div>
})
import {
    Bold,
    Italic,
    AlignLeft,
    List as ListIcon,
    Link as LinkIcon,
    Smile,
    Paperclip,
    Send,
    X,
    Loader2,
    CheckCircle2
} from 'lucide-react'

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const ImagePreview = ({ file, onClick }: { file: File; onClick?: () => void }) => {
    const [previewUrl, setPreviewUrl] = React.useState<string>('')
    React.useEffect(() => {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [file])
    return previewUrl ? (
        <button type="button" onClick={onClick} className="h-full w-full cursor-pointer">
            <img src={previewUrl} alt={file.name} className="h-full w-full object-cover hover:opacity-80 transition-opacity" />
        </button>
    ) : null
}

import { Toggle } from '@/app/components/ui/toggle'

interface CommentEditorProps {
    value: string
    onChange: (value: string) => void
    onAttachClick: () => void
    onSend: () => void
    isSubmitting?: boolean
    hasAttachments?: boolean
    placeholder?: string
    attachments?: any[]
    onRemoveAttachment?: (index: number) => void
}

export default function CommentEditor({
    value,
    onChange,
    onAttachClick,
    onSend,
    isSubmitting = false,
    hasAttachments = false,
    placeholder = 'Add a comment here',
    attachments = [],
    onRemoveAttachment
}: CommentEditorProps) {

    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [previewFile, setPreviewFile] = React.useState<{ url: string; name: string } | null>(null);

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

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none w-full border-none bg-transparent px-3 py-2 text-sm focus-visible:outline-none min-h-[60px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        immediatelyRender: false,
    })

    // Reset editor content when value is empty (e.g., after successful submit)
    React.useEffect(() => {
        if (editor && value === '') {
            editor.commands.setContent('')
        }
    }, [value, editor])

    if (!editor) {
        return null
    }

    const isEmptyContent = editor.getText().trim() === ''

    return (
        <>
            <div className="flex flex-col rounded-xl bg-gray-50/80 border border-transparent focus-within:border-gray-200 focus-within:bg-white overflow-hidden transition-colors w-full">
                {/* Toolbar */}
                <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 transition-colors ${editor.isActive('bold') ? 'text-gray-900 bg-gray-200/50' : ''}`}
                    >
                        <Bold className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 transition-colors ${editor.isActive('italic') ? 'text-gray-900 bg-gray-200/50' : ''}`}
                    >
                        <Italic className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => { }} // Dummy align left for visual parity with Figma
                        className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 transition-colors"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 transition-colors ${editor.isActive('bulletList') ? 'text-gray-900 bg-gray-200/50' : ''}`}
                    >
                        <ListIcon className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const previousUrl = editor.getAttributes('link').href
                            const url = window.prompt('URL', previousUrl || '')
                            if (url === null) return
                            if (url.trim() === '') {
                                editor.chain().focus().extendMarkRange('link').unsetLink().run()
                                return
                            }
                            let validUrl = url.trim()
                            if (!/^https?:\/\//i.test(validUrl) && !/^mailto:/i.test(validUrl)) {
                                validUrl = 'https://' + validUrl
                            }
                            if (editor.state.selection.empty) {
                                editor.chain().focus().insertContent(`<a href="${validUrl}">${validUrl}</a>`).run()
                            } else {
                                editor.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run()
                            }
                        }}
                        className={`p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 transition-colors ${editor.isActive('link') ? 'text-gray-900 bg-gray-200/50' : ''}`}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Editor Content Area */}
                <div className="px-1 min-h-[60px] pb-6">
                    <EditorContent editor={editor} />
                </div>

                {/* Attached Files Preview */}
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-3 pb-3">
                        {attachments.map((file, idx) => {
                            const isImage = file.type.startsWith('image/');
                            const progress = file.progress;
                            const isComplete = progress === undefined || progress >= 100;

                            return (
                                <div key={idx} className="relative flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-2 py-2 text-sm text-gray-700 shadow-sm min-w-[200px] max-w-sm group">
                                    <div className="flex items-center gap-3 overflow-hidden w-full">
                                        {isImage ? (
                                            <div className="h-12 w-16 overflow-hidden flex-shrink-0 rounded bg-gray-100 border border-gray-200">
                                                <ImagePreview file={file} onClick={() => openImagePreview(file)} />
                                            </div>
                                        ) : (
                                            <img width="40" height="40" src={getFileIcon(file.name)} alt="File" className="object-contain shrink-0" />
                                        )}
                                        <div className="flex flex-col truncate pr-14">
                                            <span className="font-semibold text-gray-900 truncate">{file.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {formatBytes(file.size)}
                                                {progress !== undefined && progress < 100 ? ` - ${Math.round(progress)}% Uploaded` : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center">
                                        {!isComplete && (
                                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                        )}
                                        {isComplete && progress !== undefined && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    <button type="button" onClick={() => onRemoveAttachment?.(idx)} className="absolute top-1/2 -translate-y-1/2 right-2 text-gray-400 hover:text-red-600 transition-colors bg-white/80 rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Bottom Actions Row */}
                <div className="flex items-center justify-end px-3 pb-3 gap-2 relative">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200/50 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <Smile className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onAttachClick}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200/50 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onSend}
                        disabled={isSubmitting || (isEmptyContent && !hasAttachments)}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-1"
                    >
                        <Send className="h-4 w-4" />
                    </button>

                    {/* Emoji Picker Popover */}
                    {showEmojiPicker && (
                        <div className="absolute right-0 bottom-full mb-2 z-50">
                            <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)}></div>
                            <div className="relative z-50 shadow-2xl rounded-lg overflow-hidden">
                                {/* @ts-ignore */}
                                <EmojiPicker
                                    onEmojiClick={(emojiData: any) => {
                                        editor.chain().focus().insertContent(emojiData.emoji).run();
                                        setShowEmojiPicker(false);
                                    }}
                                    width={300}
                                    height={400}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ImagePreviewModal
                isOpen={!!previewFile}
                imageUrl={previewFile?.url || ''}
                fileName={previewFile?.name}
                onClose={closeImagePreview}
            />
        </>
    )
}
