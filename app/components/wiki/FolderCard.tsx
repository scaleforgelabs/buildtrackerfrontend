import Image from "next/image";
import { MoreVertical, Edit2 } from "lucide-react";
import { Images } from "@/public"
import { useState } from "react";
import { filesService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import UserAvatar from "../ui/UserAvatar";

type FolderCardProps = {
  folderId: string;
  title: string;
  items: number;
  avatars: string[];
  onOpen?: () => void;
  view?: "grid" | "list";
  onRename?: (newName: string) => void;
};

export function FolderCard({ folderId, title, items, avatars, view = "grid", onOpen, onRename }: FolderCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(title);
  const { currentWorkspace } = useWorkspace();

  const handleRename = async () => {
    if (newName && newName !== title) {
      try {
        await filesService.renameFolder(currentWorkspace?.id!, folderId, { name: newName });
        onRename?.(newName);
        setIsRenaming(false);
      } catch (error) {
        console.error('Rename failed:', error);
      }
    } else {
      setIsRenaming(false);
    }
  };

  if (view === "list") {
    return (
      <div className="flex w-full items-center justify-between rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors" onClick={onOpen}>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  e.stopPropagation();
                }}
                className="text-foreground font-medium bg-muted px-2 py-1 rounded"
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
              e.stopPropagation();
              setIsRenaming(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
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
    <div className="relative h-[200px] w-full group cursor-pointer transition-transform hover:-translate-y-1" onClick={onOpen}>
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
                e.stopPropagation();
                setIsRenaming(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border bg-card/50 hover:bg-card/80 transition-colors shadow-sm"
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              e.stopPropagation();
            }}
            className="mt-8 text-lg text-black font-medium bg-white/80 px-2 py-1 rounded line-clamp-2 leading-tight"
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
            {avatars.slice(0, 3).map((avatar, index) => (
              <UserAvatar key={index} user={{ avatar }} className="w-8 h-8 border-2 border-background" size={32} />
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
