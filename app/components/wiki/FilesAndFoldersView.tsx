import { useState } from "react";
import { ChevronUp, ChevronDown, Folder, Download } from "lucide-react";
import { cn } from "@/libs/utils";
import { filesService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import UserAvatar from "../ui/UserAvatar";

type SortField = "name" | "size" | "owner" | "date";
type SortOrder = "asc" | "desc";

type Item = {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: number;
  owner: string;
  ownerAvatar?: string;
  date: string;
  itemCount?: number;
};

type FilesAndFoldersViewProps = {
  items: Item[];
  onFolderOpen?: (folderId: string, folderName: string) => void;
  onRefresh?: () => void;
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
  if (!bytes) return "-";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export function FilesAndFoldersView({ items, onFolderOpen, onRefresh }: FilesAndFoldersViewProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const { currentWorkspace } = useWorkspace();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDownload = async (item: Item) => {
    if (item.type === "file") {
      try {
        const response = await filesService.downloadFile(item.id);
        const fileUrl = response.data.file?.file_url || response.data.download_url;
        if (fileUrl) {
          window.open(fileUrl, '_blank');
        }
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };



  const sortedItems = [...items].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === "name") {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortField === "size") {
      aVal = a.size || 0;
      bVal = b.size || 0;
    } else if (sortField === "owner") {
      aVal = a.owner.toLowerCase();
      bVal = b.owner.toLowerCase();
    } else if (sortField === "date") {
      aVal = new Date(a.date).getTime();
      bVal = new Date(b.date).getTime();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
    >
      {label}
      {sortField === field && (
        sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left"><SortHeader field="name" label="Name" /></th>
            <th className="px-4 py-3 text-left"><SortHeader field="size" label="Size" /></th>
            <th className="px-4 py-3 text-left"><SortHeader field="owner" label="Owner" /></th>
            <th className="px-4 py-3 text-left"><SortHeader field="date" label="Modified" /></th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <tr
              key={item.id}
              className="border-b hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3 flex items-center gap-2">
                {item.type === "folder" ? (
                  <Folder className="h-4 w-4 text-primary" />
                ) : (
                  <span className="text-lg">{getFileExtensionIcon(item.name)}</span>
                )}
                <span
                  className="font-medium text-foreground cursor-pointer"
                  onClick={() => item.type === "folder" && onFolderOpen?.(item.id, item.name)}
                >
                  {item.name}
                </span>
                {item.type === "folder" && item.itemCount !== undefined && (
                  <span className="text-xs text-muted-foreground">({item.itemCount})</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {item.type === "folder" ? "-" : formatFileSize(item.size)}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <UserAvatar user={{ name: item.owner, avatar: item.ownerAvatar }} size={24} className="w-6 h-6 text-[10px]" />
                {item.owner}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{item.date}</td>
              <td className="px-4 py-3 flex gap-2">
                {item.type === "file" && (
                  <button
                    onClick={() => handleDownload(item)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
