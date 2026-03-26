import { Download, Edit2 } from "lucide-react";
import { cn } from "@/libs/utils";
import { filesService } from "@/libs/api/services";
import { useState, useEffect } from "react";
import UserAvatar from "../ui/UserAvatar";
import { getFileIcon as getUtilityIcon } from "@/libs/utils";

type FileCardProps = {
  fileId: string;
  fileName: string;
  url?: string;
  fileType: string;
  uploadedAt: string;
  owner: string;
  uploaded_by_user?: any;
  ownerAvatar?: string;
  fileSize?: number;
  view?: "grid" | "list";
  isSelected?: boolean;
  isRenaming?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onRename?: (newName: string) => void;
  onRenameSuccess?: () => void;
  canEdit?: boolean;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export function FileCard({
  fileId,
  fileName,
  url,
  fileType,
  uploadedAt,
  uploaded_by_user,
  owner,
  ownerAvatar,
  fileSize,
  view = "grid",
  isSelected = false,
  isRenaming: isRenamingProp,
  onSelect,
  onContextMenu,
  onRename,
  onRenameSuccess,
  canEdit = true,
}: FileCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState(fileName);

  useEffect(() => {
    if (isRenamingProp) {
      setIsRenaming(true);
      setNewName(fileName);
    }
  }, [isRenamingProp, fileName]);

  const handleDownload = async () => {
    try {
      const response = await filesService.downloadFile(fileId);
      const fileUrl = response.data.file?.file_url || response.data.download_url;
      if (fileUrl) {
        window.open(fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRename = async () => {
    if (isSaving) return;
    if (!newName.trim() || newName === fileName) {
      setIsRenaming(false);
      onRenameSuccess?.();
      return;
    }
    setIsSaving(true);
    try {
      await filesService.renameFile(fileId, { file_name: newName });
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
      setNewName(fileName);
      onRenameSuccess?.();
    }
    e.stopPropagation();
  };

  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "tif", "heic", "heif", "ico", "avif"].includes(ext);

  if (view === "list") {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer",
          isSelected && "bg-primary/5 hover:bg-primary/10"
        )}
        onClick={onSelect}
        onContextMenu={onContextMenu}
      >
        <div className="flex items-center gap-4 flex-1">
          {isImage && url ? (
            <div className="h-8 w-8 shrink-0 rounded overflow-hidden border border-border/50">
              <img src={url} alt={fileName} className="h-full w-full object-cover" />
            </div>
          ) : (
            <img src={getUtilityIcon(fileName)} alt="" className="h-8 w-8 object-contain" />
          )}
          <div className="flex flex-col flex-1">
            {isRenaming ? (
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                onFocus={(e) => {
                  const val = e.target.value;
                  const lastDotIndex = val.lastIndexOf(".");
                  if (lastDotIndex > 0) {
                    e.target.setSelectionRange(0, lastDotIndex);
                  } else {
                    e.target.select();
                  }
                }}
                className={cn(
                  "text-foreground font-medium bg-muted px-2 py-1 rounded outline-none border border-primary",
                  isSaving && "opacity-50 cursor-not-allowed"
                )}
              />
            ) : (
              <h3 className="text-foreground font-medium">{fileName}</h3>
            )}
            <span className="text-xs text-muted-foreground">{uploadedAt}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">{owner}</span>
            <span className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={handleDownload} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => { if (canEdit) setIsRenaming(true); }}
              disabled={!canEdit}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
                !canEdit && "opacity-50 blur-[0.5px] cursor-not-allowed grayscale pointer-events-none"
              )}
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-[200px] w-full group cursor-pointer transition-transform hover:-translate-y-1 rounded-xl border bg-card overflow-hidden",
        isSelected && "bg-primary/5 hover:bg-primary/10 ring-2 ring-primary/20"
      )}
      onClick={onSelect}
      onContextMenu={onContextMenu}
    >
      <div className="h-full p-6 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          {isImage && url ? (
            <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-border/50 shadow-sm">
              <img src={url} alt={fileName} className="h-full w-full object-cover" />
            </div>
          ) : (
            <img src={getUtilityIcon(fileName)} alt="" className="h-12 w-12 object-contain" />
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleDownload} className="flex h-8 w-8 items-center justify-center rounded-full border bg-card/50 hover:bg-card/80 transition-colors shadow-sm">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => { if (canEdit) setIsRenaming(true); }}
              disabled={!canEdit}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border bg-card/50 transition-colors shadow-sm hover:bg-card/80",
                !canEdit && "opacity-50 blur-[0.5px] cursor-not-allowed grayscale pointer-events-none"
              )}
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {isRenaming ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            onFocus={(e) => {
              const val = e.target.value;
              const lastDotIndex = val.lastIndexOf(".");
              if (lastDotIndex > 0) {
                e.target.setSelectionRange(0, lastDotIndex);
              } else {
                e.target.select();
              }
            }}
            className={cn(
              "text-sm font-medium text-foreground bg-muted px-2 py-1 rounded mb-auto outline-none border border-primary",
              isSaving && "opacity-50 cursor-not-allowed"
            )}
          />
        ) : (
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-auto">
            {fileName}
          </h3>
        )}

        <div className="h-px w-full bg-border/50 my-3" />

        <div className="flex items-center justify-between text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">{uploadedAt}</span>
            <div className="flex items-center gap-2">
              <UserAvatar user={uploaded_by_user} size={16} className="w-4 h-4 text-[8px]" />
              <span className="text-muted-foreground">{owner}</span>
            </div>
          </div>
          <span className="text-muted-foreground font-medium">{fileType}</span>
        </div>
      </div>
    </div>
  );
}
