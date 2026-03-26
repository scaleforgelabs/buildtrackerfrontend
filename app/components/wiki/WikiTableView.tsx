"use client";

import Image from "next/image";
import { MoreVertical, Download, Trash2, Edit2 } from "lucide-react";
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
  isRenaming: isRenamingProp,
  onSelect,
  onContextMenu,
  onRenameSuccess,
}: {
  item: WikiTableItem;
  isSelected: boolean;
  isRenaming?: boolean;
  onSelect: (e: React.MouseEvent | React.ChangeEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onRenameSuccess?: () => void;
}) {
  const [renaming, setRenaming] = useState(false);

  const [renameVal, setRenameVal] = useState(item.name);
  const [isSaving, setIsSaving] = useState(false);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (isRenamingProp) {
      setRenaming(true);
      setRenameVal(item.name);
    }
  }, [isRenamingProp, item.name]);

  const handleRenameSubmit = async () => {
    if (isSaving) return;
    if (!renameVal.trim() || renameVal === item.name) {
      setRenaming(false);
      onRenameSuccess?.();
      return;
    }
    setIsSaving(true);
    try {
      if (item.kind === "folder") {
        await filesService.renameFolder(currentWorkspace?.id!, item.id, {
          name: renameVal,
        });
      } else if (item.kind === "file") {
        await filesService.renameFile(item.id, { file_name: renameVal });
      } else if (item.kind === "document") {
        await wikiService.updateDocument(currentWorkspace?.id!, item.id, {
          document_title: renameVal
        });
      }
      item.onRename?.();
      onRenameSuccess?.();
    } catch (error) {
      console.error("Rename failed:", error);
    } finally {
      setIsSaving(false);
      setRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      setRenaming(false);
      setRenameVal(item.name);
      onRenameSuccess?.();
    }
    e.stopPropagation();
  };

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
          {renaming ? (
            <input
              autoFocus
              value={renameVal}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => {
                const val = e.target.value;
                const lastDotIndex = val.lastIndexOf(".");
                if (lastDotIndex > 0) {
                  e.target.setSelectionRange(0, lastDotIndex);
                } else {
                  e.target.select();
                }
              }}
              onChange={(e) => setRenameVal(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className={cn(
                "text-xs md:text-sm font-medium text-foreground bg-muted px-2 py-1 rounded outline-none border border-primary flex-1 min-w-0 max-w-[calc(100vw-140px)]",
                isSaving && "opacity-50 cursor-not-allowed"
              )}
            />
          ) : (
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
          )}
        </div>
      </td>

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
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onContextMenu}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
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
}: {
  section: WikiTableSection;
  showMoreCount?: number;
  selectedIds?: string[];
  renamingItemId?: string;
  onSelectionChange?: (ids: string[]) => void;
  onContextMenu?: (e: React.MouseEvent, item: WikiTableItem) => void;
  onRenameSuccess?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? section.items
    : section.items.slice(0, showMoreCount);
  const hasMore = section.items.length > showMoreCount;

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
              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap truncate">
                Name
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden md:table-cell">
                Last modified
              </th>
              <th className="px-3 md:px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden lg:table-cell pr-12">
                Size
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
        />
      ))}
    </div>
  );
}
