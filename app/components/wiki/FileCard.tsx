import { Download, Edit2 } from "lucide-react";
import { cn } from "@/libs/utils";
import { filesService } from "@/libs/api/services";
import { useState } from "react";
import UserAvatar from "../ui/UserAvatar";

type FileCardProps = {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  owner: string;
  ownerAvatar?: string;
  fileSize?: number;
  view?: "grid" | "list";
  onRename?: (newName: string) => void;
};

const getFileExtensionIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const iconMap: { [key: string]: string } = {
    pdf: '📄', doc: '📝', docx: '📝', txt: '📄',
    xls: '📊', xlsx: '📊', csv: '📊',
    ppt: '🎯', pptx: '🎯',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️',
    zip: '📦', rar: '📦', '7z': '📦',
    mp3: '🎵', mp4: '🎬', avi: '🎬', mov: '🎬',
    exe: '⚙️', msi: '⚙️',
  };
  return iconMap[ext] || '📎';
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
  fileType,
  uploadedAt,
  owner,
  ownerAvatar,
  fileSize,
  view = "grid",
  onRename,
}: FileCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(fileName);

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
    if (newName && newName !== fileName) {
      try {
        await filesService.renameFile(fileId, { file_name: newName });
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
      <div className="flex w-full items-center justify-between rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-2xl">{getFileExtensionIcon(fileName)}</div>
          <div className="flex flex-col flex-1">
            {isRenaming ? (
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="text-foreground font-medium bg-muted px-2 py-1 rounded"
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
            <button onClick={() => setIsRenaming(true)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[200px] w-full group cursor-pointer transition-transform hover:-translate-y-1 rounded-xl border bg-card overflow-hidden">
      <div className="h-full p-6 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{getFileExtensionIcon(fileName)}</div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleDownload} className="flex h-8 w-8 items-center justify-center rounded-full border bg-card/50 hover:bg-card/80 transition-colors shadow-sm">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => setIsRenaming(true)} className="flex h-8 w-8 items-center justify-center rounded-full border bg-card/50 hover:bg-card/80 transition-colors shadow-sm">
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
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="text-sm font-medium text-foreground bg-muted px-2 py-1 rounded mb-auto"
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
              <UserAvatar user={{ name: owner, avatar: ownerAvatar }} size={16} className="w-4 h-4 text-[8px]" />
              <span className="text-muted-foreground">{owner}</span>
            </div>
          </div>
          <span className="text-muted-foreground font-medium">{fileType}</span>
        </div>
      </div>
    </div>
  );
}
