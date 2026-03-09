'use client'

import React, { useState } from 'react'
import Image, { StaticImageData } from "next/image"
import { Switch } from "@/app/components/ui/switch"

interface IntegrationCardProps {
  name: string;
  category: string;
  description: string;
  icon: string | StaticImageData;
  categoryColor?: string;
  isActive?: boolean;
}

const IntegrationCard = ({
  name,
  category,
  description,
  icon,
  categoryColor = "blue",
  isActive: initialActive = false,
  onToggle,
  onRemove
}: IntegrationCardProps & {
  onToggle?: (active: boolean) => void;
  onRemove?: () => void;
}) => {
  const [isActive, setIsActive] = useState(initialActive);

  // Sync local state with prop when it changes
  React.useEffect(() => {
    setIsActive(initialActive);
  }, [initialActive]);

  const getCategoryStyles = (color: string) => {
    const colors: Record<string, string> = {
      blue: "border-blue-200 bg-blue-50 text-blue-700",
      purple: "border-purple-200 bg-purple-50 text-purple-700",
      green: "border-green-200 bg-green-50 text-green-700",
      orange: "border-orange-200 bg-orange-50 text-orange-700",
      red: "border-red-200 bg-red-50 text-red-700",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Card Body */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 p-2 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
            <Image
              src={icon}
              alt={name}
              width={40}
              height={40}
              className="object-contain"
              unoptimized 
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{name}</p>
            <span className={`mt-1 inline-flex rounded-full border px-3 py-0.5 text-xs font-medium ${getCategoryStyles(categoryColor)}`}>
              {category}
            </span>
          </div>
        </div>

        <p className="mt-5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-border px-6 py-5">
        <div className="flex items-center gap-3 flex-1">
          <button className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
            Details
          </button>
          <button
            onClick={onRemove}
            className="rounded-xl border border-red-100 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => {
            setIsActive(checked);
            onToggle?.(checked);
          }}
        />
      </div>
    </div >
  )
}

export default IntegrationCard