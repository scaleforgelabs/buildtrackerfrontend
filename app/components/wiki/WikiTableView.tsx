"use client";

import Image from "next/image";
import { MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Images } from "@/public";
import UserAvatar from "../ui/UserAvatar";
import { filesService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";

const EXT_SVG: Record<string, string> = {
  pdf: "/images/pdf_icon.svg",
  doc: "/images/doc_icon.svg",
  docx: "/images/docx_icon.svg",
  xls: "/images/xls_icon.svg",
  xlsx: "/images/xls_icon.svg",
  ppt: "/images/ppt_icon.svg",
  pptx: "/images/pptx_icon.svg",
  png: "/images/png_icon.svg",
  jpg: "/images/jpg_icon.svg",
  jpeg: "/images/jpeg_icon.svg",
  gif: "/images/gif_icon.svg",
  webp: "/images/webp_icon.svg",
  svg: "/images/svg_icon.svg",
  txt: "/images/txt_icon.svg",
  csv: "/images/csv_icon.svg",
  zip: "/images/zip_icon.svg",
  rar: "/images/zip_icon.svg",
  mp4: "/images/mp4_icon.svg",
  mov: "/images/mp4_icon.svg",
  avi: "/images/mp4_icon.svg",
  mp3: "/images/mp3_icon.svg",
};

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_SVG[ext] ?? null;
}

function formatSize(bytes?: number) {
  if (!bytes) return "–";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

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
  members?: { avatar?: string }[];
  itemCount?: number;
  onOpen?: () => void;
  onRename?: () => void;
};

type WikiTableSection = {
  label: string;
  count: number;
  items: WikiTableItem[];
};

type WikiTableViewProps = {
  sections: WikiTableSection[];
  showMoreCount?: number;
};

function ItemIcon({ item }: { item: WikiTableItem }) {
  if (item.kind === "folder") {
    return (
      <div className="relative h-8 w-8 shrink-0 flex-shrink-0">
        <Image src={Images.folder} alt="" fill className="object-contain" />
      </div>
    );
  }
  const svgSrc = getFileIcon(item.name);
  if (svgSrc) {
    return (
      <Image
        src={svgSrc}
        alt=""
        width={32}
        height={32}
        className="flex-shrink-0"
        unoptimized
      />
    );
  }
  return (
    <div className="h-8 w-8 shrink-0 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
      {item.name.split(".").pop()?.toUpperCase().slice(0, 3) ?? "?"}
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
            user={{ avatar: m.avatar }}
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
  onRenameSuccess,
}: {
  item: WikiTableItem;
  onRenameSuccess?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(item.name);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({
    top: 0,
    right: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (buttonRef.current && menuOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [menuOpen]);

  const handleRenameSubmit = async () => {
    if (!renameVal.trim() || renameVal === item.name) {
      setRenaming(false);
      return;
    }
    try {
      if (item.kind === "folder") {
        await filesService.renameFolder(currentWorkspace?.id!, item.id, {
          name: renameVal,
        });
      } else if (item.kind === "file") {
        await filesService.renameFile(item.id, { file_name: renameVal });
      }
      item.onRename?.();
      onRenameSuccess?.();
    } catch {
      /* silent */
    }
    setRenaming(false);
  };

  const handleDownload = async () => {
    if (item.kind !== "file") return;
    try {
      const res = await filesService.downloadFile(item.id);
      const url = res.data.file?.file_url || res.data.download_url;
      if (url) window.open(url, "_blank");
    } catch {
      /* silent */
    }
    setMenuOpen(false);
  };

  const ownerLabel = item.owner
    ? `${item.owner.first_name ?? ""} ${item.owner.last_name ?? ""}`.trim() ||
      item.owner.name ||
      item.owner.email ||
      "–"
    : "–";

  return (
    <tr
      className="border-b border-border/50 hover:bg-muted/30 transition-colors group cursor-pointer"
      onClick={() => item.kind === "folder" && item.onOpen?.()}
    >
      {/* Name */}
      <td className="px-3 md:px-4 py-3 min-w-0 max-w-xs sm:max-w-none">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <ItemIcon item={item} />
          {renaming ? (
            <input
              autoFocus
              value={renameVal}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setRenameVal(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                e.stopPropagation();
              }}
              className="text-xs md:text-sm font-medium text-foreground bg-muted px-2 py-1 rounded outline-none border border-primary flex-1 min-w-0 max-w-[calc(100vw-140px)]"
            />
          ) : (
            <div className="flex-1 min-w-0 overflow-hidden">
              <span className="text-xs md:text-sm font-medium text-foreground block truncate">
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

      {/* Last modified - Hidden on mobile */}
      <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-muted-foreground whitespace-nowrap hidden md:table-cell">
        {item.modifiedAt}
      </td>

      {/* Size - Hidden on mobile */}
      <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-muted-foreground hidden lg:table-cell">
        {formatSize(item.size)}
      </td>

      {/* Owner - Hidden on tablet and below */}
      <td className="px-3 md:px-4 py-3 hidden xl:table-cell">
        <div className="flex items-center gap-2 min-w-0">
          <UserAvatar user={item.owner} size={28} />
          <span className="text-xs md:text-sm text-foreground truncate">
            {ownerLabel}
          </span>
        </div>
      </td>

      {/* Members - Hidden on mobile and tablet */}
      <td className="px-3 md:px-4 py-3 hidden 2xl:table-cell">
        <MemberStack members={item.members} />
      </td>

      {/* Actions */}
      <td
        className="px-3 md:px-4 py-3 text-right relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative inline-block">
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="fixed z-50 w-40 md:w-44 rounded-xl border bg-card shadow-lg py-1 text-xs md:text-sm"
                style={{
                  top: `${menuPos.top}px`,
                  right: `${menuPos.right}px`,
                }}
              >
                {item.kind === "folder" && (
                  <button
                    onClick={() => {
                      item.onOpen?.();
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 md:px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    Open
                  </button>
                )}
                {(item.kind === "file" || item.kind === "folder") && (
                  <button
                    onClick={() => {
                      setRenaming(true);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 md:px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    Rename
                  </button>
                )}
                {item.kind === "file" && (
                  <button
                    onClick={handleDownload}
                    className="w-full px-3 md:px-4 py-2 text-left hover:bg-muted transition-colors"
                  >
                    Download
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function TableSection({
  section,
  showMoreCount = 7,
}: {
  section: WikiTableSection;
  showMoreCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? section.items
    : section.items.slice(0, showMoreCount);
  const hasMore = section.items.length > showMoreCount;

  return (
    <div className="space-y-0">
      {/* Section header */}
      <div className="flex items-center gap-2 pb-3">
        <h3 className="text-lg font-semibold text-foreground">
          {section.label}
        </h3>
        <span className="text-primary text-base font-normal">
          {section.count}
        </span>
      </div>

      <div className="w-full rounded-xl border border-border overflow-x-auto truncate bg-card">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap truncate">
                Name
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden md:table-cell">
                Last modified
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">
                Size
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden xl:table-cell">
                Owner
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap hidden 2xl:table-cell">
                Member
              </th>
              <th className="px-3 md:px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <TableRow key={item.id} item={item} />
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

export function WikiTableView({ sections }: WikiTableViewProps) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <TableSection key={section.label} section={section} />
      ))}
    </div>
  );
}
