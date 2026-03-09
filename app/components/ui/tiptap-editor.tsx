'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
    Bold,
    Italic,
    AlignLeft,
    List,
    Link as LinkIcon,
    RotateCcw,
    RotateCw,
    ListOrdered
} from 'lucide-react'
import { Toggle } from '@/app/components/ui/toggle'

const TiptapEditor = ({
    value,
    onChange,
    placeholder = 'Type your description here...'
}: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm dark:prose-invert max-w-none w-full rounded-md border-none bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getText())
        },
        immediatelyRender: false,
    })

    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-col rounded-xl border border-input overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b bg-muted/50 p-2 overflow-x-auto">
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </Toggle>

                <div className="mx-1 h-4 w-px bg-border"></div>

                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>

                <div className="mx-1 h-4 w-px bg-border"></div>

                <button
                    onClick={() => {
                        const previousUrl = editor.getAttributes('link').href
                        const url = window.prompt('URL', previousUrl)

                        // cancelled
                        if (url === null) {
                            return
                        }

                        // empty
                        if (url === '') {
                            editor.chain().focus().extendMarkRange('link').unsetLink().run()
                            return
                        }

                        // update link
                        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
                    }}
                    className={`rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground ${editor.isActive('link') ? 'bg-muted text-foreground' : ''}`}
                >
                    <LinkIcon className="h-4 w-4" />
                </button>

                <div className="flex-1"></div>

                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                    <RotateCw className="h-4 w-4" />
                </button>
            </div>

            <EditorContent editor={editor} className="p-2" />
        </div>
    )
}

export default TiptapEditor
