import React, { useState } from 'react'
import Image from 'next/image'
import { Images } from "@/public"
import { MoreVertical, Edit2, Trash2 } from "lucide-react"
import EditLinksModal from "./modal/EditLinksModal"
import DeleteLinksModal from "./modal/DeleteLinksModal"

const QuickLinkCard = ({
  id,
  title,
  url,
  icon,
  category,
  description,
  onSaved,
  onDeleted,
}: {
  id?: string;
  title: string;
  url?: string;
  icon?: string;
  category?: string;
  description?: string;
  onSaved?: () => void;
  onDeleted?: () => void;
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <EditLinksModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        link={{ id, title, url, category, description, icon }}
        onSaved={() => {
          setIsEditModalOpen(false);
          onSaved?.();
        }}
      />
      <DeleteLinksModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        link={{ id, title }}
        onDeleted={() => {
          setIsDeleteModalOpen(false);
          onDeleted?.();
        }}
      />
      <div className="rounded-2xl border bg-card shadow-sm h-full flex flex-col">
        <div className='p-4 flex-1'>

          {/* Top */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-card shrink-0 overflow-hidden relative">
                {icon ? (
                  <img src={icon} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <Image
                    src={Images.logo}
                    alt={title}
                    width={56}
                    height={56}
                    className="p-1"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate" title={title}>{title}</p>
                <span className="mt-1 inline-flex rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs text-primary capitalize">
                  {category || 'General'}
                </span>
              </div>
            </div>

            <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-full p-1.5 hover:bg-muted/80 transition-colors focus:outline-none shrink-0 -mt-1 -mr-1"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl border bg-popover shadow-lg p-2 flex flex-col gap-1">
                    <button
                      onClick={() => { setMenuOpen(false); setIsEditModalOpen(true); }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg w-full text-left transition-colors text-foreground"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" /> Edit
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setIsDeleteModalOpen(true); }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg w-full text-left transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600/80 dark:text-red-400/80" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description - Optional if available, otherwise hide or show URL */}
          <p className="mt-4 line-clamp-3 text-sm text-muted-foreground break-all">
            {description || url || 'No description provided'}
          </p>
        </div>

        <hr className='border-t border-border' />

        {/* Actions */}
        <div className="flex items-center gap-3 p-4">
          <button className="flex-1 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
            Details
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors text-center"
          >
            Open Link
          </a>
        </div>
      </div>
    </>
  )
}

export default QuickLinkCard