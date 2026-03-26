import Image from "next/image";
import { MoreVertical, Edit2 } from "lucide-react";
import { Images } from "@/public"
import { useState, useEffect } from "react";
import { filesService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import UserAvatar from "../ui/UserAvatar";
import { cn } from "@/libs/utils";

type FolderCardProps = {
  folderId: string;
  title: string;
  items: number;
  contributors?: any[];
  onOpen?: () => void;
  view?: "grid" | "list";
  isSelected?: boolean;
  isRenaming?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onRename?: (newName: string) => void;
  onRenameSuccess?: () => void;
  canEdit?: boolean;
};

export function FolderCard({
  folderId,
  title,
  items,
  contributors = [],
  view = "grid",
  isSelected = false,
  isRenaming: isRenamingProp,
  onOpen,
  onSelect,
  onContextMenu,
  onRename,
  onRenameSuccess,
  canEdit = true,
}: FolderCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState(title);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (isRenamingProp) {
      setIsRenaming(true);
      setNewName(title);
    }
  }, [isRenamingProp, title]);

  const handleRename = async () => {
    if (isSaving) return;
    if (!newName.trim() || newName === title) {
      setIsRenaming(false);
      onRenameSuccess?.();
      return;
    }
    setIsSaving(true);
    try {
      await filesService.renameFolder(currentWorkspace?.id!, folderId, { name: newName });
      onRename?.(newName);
      onRenameSuccess?.();
    } catch (error) {
      console.error('Rename failed:', error);
    } finally {
      setIsSaving(false);
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(title);
      onRenameSuccess?.();
    }
    e.stopPropagation();
  };

  if (view === "list") {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer",
          isSelected && "bg-primary/5 hover:bg-primary/10"
        )}
        onClick={onSelect}
        onDoubleClick={onOpen}
        onContextMenu={onContextMenu}
      >
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src={Images.folder}
              alt=""
              fill
              className="object-contain"
            />
          </div>

          <div className="flex flex-col">
            {isRenaming ? (
              <input
                autoFocus
                onClick={(e) => e.stopPropagation()}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                onFocus={(e) => e.target.select()}
                className={cn(
                  "text-foreground font-medium bg-muted px-2 py-1 rounded outline-none border border-primary",
                  isSaving && "opacity-50 cursor-not-allowed"
                )}
              />
            ) : (
              <h3 className="text-foreground">{title}</h3>
            )}
            <span className="text-xs text-muted-foreground">{items} items</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              if (canEdit) {
                e.stopPropagation();
                setIsRenaming(true);
              }
            }}
            disabled={!canEdit}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
              !canEdit && "opacity-50 blur-[0.5px] cursor-not-allowed grayscale pointer-events-none"
            )}
          >
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-[200px] w-full group cursor-pointer transition-transform hover:-translate-y-1 rounded-xl overflow-hidden",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      <div className="absolute inset-0">
        <Image
          src={Images.folder}
          alt=""
          fill
          className="object-fill"
          priority
        />
      </div>

      <div className="relative z-10 h-full px-15 pt-8 pb-5 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div />
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                if (canEdit) {
                  e.stopPropagation();
                  setIsRenaming(true);
                }
              }}
              disabled={!canEdit}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border bg-card/50 transition-colors shadow-sm hover:bg-card/80",
                !canEdit && "opacity-50 blur-[0.5px] cursor-not-allowed grayscale pointer-events-none"
              )}
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border bg-card/50 hover:bg-card/80 transition-colors shadow-sm">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {isRenaming ? (
          <input
            autoFocus
            onClick={(e) => e.stopPropagation()}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            onFocus={(e) => e.target.select()}
            className={cn(
              "mt-8 text-lg text-black font-medium bg-white/80 px-2 py-1 rounded line-clamp-2 leading-tight outline-none border-2 border-primary shadow-sm",
              isSaving && "opacity-50 cursor-not-allowed"
            )}
          />
        ) : (
          <h3 className="mt-8 text-lg text-black line-clamp-2 leading-tight">
            {title}
          </h3>
        )}

        <div className="flex-1" />

        <div className="h-px w-full bg-border/50 mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {contributors.slice(0, 3).map((contributor, index) => (
              <UserAvatar key={index} user={contributor} className="w-8 h-8 border-2 border-background" size={32} />
            ))}
          </div>

          <span className="text-sm font-medium text-muted-foreground/80">
            {items} items
          </span>
        </div>
      </div>
    </div>
  );
}
