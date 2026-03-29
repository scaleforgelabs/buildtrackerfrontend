"use client";

import Image from "next/image";
import { MoreVertical, Download, Trash2, Edit2, Folder } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Images } from "@/public";
import UserAvatar from "../ui/UserAvatar";
import { filesService, wikiService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { getFileIcon as getUtilityIcon, cn } from "@/libs/utils";

type WikiTableItem = {
  id: string;
  kind: "folder" | "file" | "document";
  name: string;
  modifiedAt: string;
  size?: number;
  owner?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar?: string;
    name?: string;
  };
  members?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    email?: string;
  }[];
  itemCount?: number;
  url?: string;
  onOpen?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  location?: { id: string; name: string };
};

type WikiTableSection = {
  label: string;
  count: number;
  items: WikiTableItem[];
};

type WikiTableViewProps = {
  sections: WikiTableSection[];
  showMoreCount?: number;
  selectedIds?: string[];
  renamingItemId?: string;
  onSelectionChange?: (ids: string[]) => void;
  onContextMenu?: (e: React.MouseEvent, item: WikiTableItem) => void;
  onRenameSuccess?: () => void;
  sortBy?: 'name' | 'size' | 'modified';
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: 'name' | 'size' | 'modified') => void;
};

function ItemIcon({ item }: { item: WikiTableItem }) {
  if (item.kind === "folder") {
    return (
      <div className="relative h-8 w-8 shrink-0 flex-shrink-0">
        <Image src={Images.folder} alt="" fill className="object-contain" />
      </div>
    );
  }

  const ext = item.name.split(".").pop()?.toLowerCase() || "";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "tif", "heic", "heif", "ico", "avif"].includes(ext) || (item.kind === "document" && !!item.url && !item.url.toString().includes('icon'));

  if (isImage && item.url) {
    return (
      <div className="h-8 w-8 shrink-0 rounded overflow-hidden border border-border/50">
        <img
          src={item.url}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const iconUrl = getUtilityIcon(item.name);
  return (
    <div className="h-8 w-8 shrink-0 flex items-center justify-center">
      <img
        src={iconUrl}
        alt=""
        width={32}
        height={32}
        className="flex-shrink-0 object-contain"
      />
    </div>
  );
}

function MemberStack({ members }: { members?: { avatar?: string }[] }) {
  if (!members || members.length === 0)
    return <span className="text-muted-foreground text-xs md:text-sm">–</span>;
  const visible = members.slice(0, 3);
  const extra = members.length - visible.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((m, i) => (
          <UserAvatar
            key={i}
            user={m}
            size={28}
            className="border-2 border-background"
          />
        ))}
      </div>
      {extra > 0 && (
        <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground border-2 border-background">
          +{extra}
        </span>
      )}
    </div>
  );
}

function TableRow({
  item,
  isSelected,
  isRenaming,
  onSelect,
  onContextMenu,
  onRenameSuccess,
  showLocation,
}: {
  item: WikiTableItem;
  isSelected: boolean;
  isRenaming?: boolean;
  onSelect: (e: React.MouseEvent | React.ChangeEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onRenameSuccess?: () => void;
  showLocation?: boolean;
}) {
  const ownerLabel = item.owner
    ? `${item.owner.first_name ?? ""} ${item.owner.last_name ?? ""}`.trim() ||
    item.owner.name ||
    item.owner.email ||
    "–"
    : "–";

  return (
    <tr
      className={cn(
        "border-b border-border/50 hover:bg-muted/30 transition-colors group cursor-pointer",
        isSelected && "bg-primary/5 hover:bg-primary/10"
      )}
      onClick={onSelect}
      onDoubleClick={() => item.kind === "folder" && item.onOpen?.()}
      onContextMenu={onContextMenu}
    >
      <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
      </td>

      {/* Name */}
      <td className="px-3 md:px-4 py-3 min-w-0 max-w-xs sm:max-w-none">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <ItemIcon item={item} />
          <div className="flex-1 min-w-0 overflow-hidden">
            <span
              className="text-xs md:text-sm font-medium text-foreground block truncate"
              title={item.name}
            >
              {item.name}
            </span>
            {item.kind === "folder" && item.itemCount !== undefined && (
              <span className="text-xs text-muted-foreground">
                ({item.itemCount})
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Location */}
      {showLocation && (
        <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-primary hover:underline whitespace-nowrap hidden sm:table-cell">
          {item.location ? (
            <button 
              onClick={(e) => { e.stopPropagation(); if (item.location?.id) item.onOpen?.(); }}
              className="hover:underline flex items-center gap-1"
            >
              <Folder className="h-3 w-3" />
              {item.location.name}
            </button>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
      )}

      <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-muted-foreground whitespace-nowrap hidden md:table-cell">
        {item.modifiedAt}
      </td>

      <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-muted-foreground hidden lg:table-cell text-right pr-12">
        {(() => {
          const bytes = item.size || 0;
          if (bytes === 0) return "–";
          const k = 1024;
          const units = ["B", "KB", "MB", "GB"];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
        })()}
      </td>

      <td className="px-3 md:px-4 py-3 hidden xl:table-cell">
        <div className="flex items-center gap-2 min-w-0">
          <UserAvatar user={item.owner} size={28} />
          <span className="text-xs md:text-sm text-foreground truncate">
            {ownerLabel}
          </span>
        </div>
      </td>

      <td className="px-3 md:px-4 py-3 hidden 2xl:table-cell">
        <MemberStack members={item.members} />
      </td>

      <td
        className="px-3 md:px-4 py-3 text-right"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {item.onDownload && (
            <button
              onClick={(e) => { e.stopPropagation(); item.onDownload?.(); }}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              title="Download"
            >
              <Download size={16} />
            </button>
          )}
          <button
            onClick={onContextMenu}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function TableSection({
  section,
  showMoreCount = 7,
  selectedIds = [],
  renamingItemId,
  onSelectionChange,
  onContextMenu,
  onRenameSuccess,
  sortBy,
  sortOrder,
  onSort,
}: {
  section: WikiTableSection;
  showMoreCount?: number;
  selectedIds?: string[];
  renamingItemId?: string;
  onSelectionChange?: (ids: string[]) => void;
  onContextMenu?: (e: React.MouseEvent, item: WikiTableItem) => void;
  onRenameSuccess?: () => void;
  sortBy?: 'name' | 'size' | 'modified';
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: 'name' | 'size' | 'modified') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? section.items
    : section.items.slice(0, showMoreCount);
  const hasMore = section.items.length > showMoreCount;
  const sectionHasLocation = section.items.some(i => !!i.location);

  const SortIndicator = ({ column }: { column: 'name' | 'size' | 'modified' }) => {
    if (sortBy !== column) return null;
    return <span className="ml-1 text-primary">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-0">
      <div className="w-full rounded-xl border border-border overflow-x-auto truncate bg-card shadow-sm">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={section.items.length > 0 && section.items.every(i => selectedIds.includes(i.id))}
                  onChange={(e) => {
                    const allIds = section.items.map(i => i.id);
                    if (e.target.checked) {
                      onSelectionChange?.([...new Set([...selectedIds, ...allIds])]);
                    } else {
                      onSelectionChange?.(selectedIds.filter(id => !allIds.includes(id)));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </th>
              <th className="px-3 md:px-4 py-3 text-left">
                <button 
                  onClick={() => onSort?.('name')}
                  className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap overflow-hidden hover:text-primary transition-colors pl-[32px] ml-2 md:pl-[32px] md:ml-3"
                >
                  Name <SortIndicator column="name" />
                </button>
              </th>
              {sectionHasLocation && (
                <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">
                  <div className="pl-[12px] ml-1">Location</div>
                </th>
              )}
              <th className="px-3 md:px-4 py-3 text-left hidden md:table-cell">
                <button 
                  onClick={() => onSort?.('modified')}
                  className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hover:text-primary transition-colors"
                >
                  Last modified <SortIndicator column="modified" />
                </button>
              </th>
              <th className="px-3 md:px-4 py-3 text-right hidden lg:table-cell pr-12">
                <button 
                  onClick={() => onSort?.('size')}
                  className="flex items-center justify-end w-full text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hover:text-primary transition-colors"
                >
                  Size <SortIndicator column="size" />
                </button>
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden xl:table-cell">
                Owner
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden 2xl:table-cell">
                Member
              </th>
              <th className="px-3 md:px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <TableRow
                key={item.id}
                item={item}
                isSelected={selectedIds.includes(item.id)}
                isRenaming={renamingItemId === item.id}
                onSelect={(e) => {
                  e.stopPropagation();
                  if (onSelectionChange) {
                    const isCheckbox = e.target instanceof HTMLInputElement && e.target.type === 'checkbox';
                    const isMeta = (e.nativeEvent as any).ctrlKey || (e.nativeEvent as any).metaKey;

                    if (isCheckbox || isMeta) {
                      onSelectionChange(selectedIds.includes(item.id)
                        ? selectedIds.filter(id => id !== item.id)
                        : [...selectedIds, item.id]
                      );
                    }
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onContextMenu?.(e, item);
                }}
                onRenameSuccess={onRenameSuccess}
                showLocation={sectionHasLocation}
              />
            ))}
          </tbody>
        </table>

        {hasMore && (
          <div className="flex justify-center border-t border-border/50 py-3">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="rounded-lg border px-5 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function WikiTableView({
  sections,
  selectedIds = [],
  renamingItemId,
  onSelectionChange,
  onContextMenu,
  onRenameSuccess,
  sortBy,
  sortOrder,
  onSort,
}: WikiTableViewProps) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <TableSection
          key={section.label}
          section={section}
          selectedIds={selectedIds}
          renamingItemId={renamingItemId}
          onSelectionChange={onSelectionChange}
          onContextMenu={onContextMenu}
          onRenameSuccess={onRenameSuccess}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        />
      ))}
    </div>
  );
}
