import React from 'react'
import Image from 'next/image'
import { Images } from "@/public"

const QuickLinkCard = ({
  title,
  url,
  icon,
  category,
  description,
}: {
  title: string;
  url?: string;
  icon?: string;
  category?: string;
  description?: string;
}) => {
  return (
    <div className="rounded-2xl border bg-card shadow-sm h-full flex flex-col">
      <div className='p-4 flex-1'>

        {/* Top */}
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
  )
}

export default QuickLinkCard