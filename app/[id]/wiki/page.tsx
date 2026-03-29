"use client";

import { useState, useEffect, Suspense } from "react";
import {
  FolderPlus,
  LayoutGrid,
  List,
  ListChecks,
  CirclePlus,
  ChevronDown,
  ChevronLeft,
  FilePlus,
  ArrowUpDown,
  Folder,
  X,
  Trash2,
  Download,
  Edit2
} from "lucide-react";
import { RenameModal } from "@/app/components/wiki/RenameModal";
import { toast } from "sonner";
import { cn, getFileIcon as getUtilityIcon, triggerAuthenticatedDownload } from "@/libs/utils"
import { useAuth } from "@/libs/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { FolderCard } from "@/app/components/wiki/FolderCard"
import { FileCard } from "@/app/components/wiki/FileCard"
import { DocumentCard } from "@/app/components/wiki/DocumentCard"
import { Images } from "@/public";
import { filesService, wikiService } from "@/libs/api/services";
import dynamic from "next/dynamic";
import { WikiTableView } from "@/app/components/wiki/WikiTableView";
import { ContextMenu } from "@/app/components/wiki/ContextMenu";
import { AddActionCard } from "@/app/components/wiki/AddActionCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AddNewDocumentModal = dynamic(() => import("@/app/components/wiki/modal/AddNewDocumentModal"), { ssr: false });
const AddNewFolderModal = dynamic(() => import("@/app/components/wiki/modal/AddNewFolder"), { ssr: false });
const UploadFileModal = dynamic(() => import("@/app/components/wiki/modal/UploadFileModal"), { ssr: false });
const DeleteConfirmationModal = dynamic(() => import("@/app/components/wiki/modal/DeleteConfirmationModal").then(mod => mod.DeleteConfirmationModal), { ssr: false });

type FolderData = {
  id: string;
  name: string;
  created_by_user?: { id: string; avatar?: string; first_name?: string; last_name?: string; email?: string };
  total_size?: number;
  contributors?: any[];
  item_count?: number;
  updated_at?: string;
};

type FileItem = {
  id: string;
  file_name: string;
  uploaded_at: string;
  file_size?: number;
  uploaded_by_user?: { first_name: string; last_name: string; email: string; avatar?: string };
  file_url?: string;
  file?: string;
  path?: string;
  folder?: { id: string; name: string };
};

type Doc = {
  id: string | number;
  title: string;
  type: string;
  time: string;
  image: string;
  author: {
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  size?: number;
  attachments?: any[];
  folder?: { id: string; name: string };
};

function getDocCover(d: any): string {
  if (d.image) return d.image;
  const attachments = (d.attachments as any[]) || [];
  const imageAttachment = attachments.find((a: any) => {
    const ext = a.file_name?.split('.').pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  });
  return imageAttachment ? (imageAttachment.file_url || imageAttachment.file) : Images.banner.src;
}

function WikiPageContent() {
  const [activeTab, setActiveTab] = useState<"docs" | "templates">("docs");
  const [showFolders, setShowFolders] = useState(true);
  const [showDocuments, setShowDocuments] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<any>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const pathname = usePathname();
  const isRouteActive = pathname.includes('/wiki');

  // React Query Fetching (Standardized Extraction)
  const { data: documentsRes, isLoading: documentsLoading, refetch: fetchDocuments } = useQuery({
    queryKey: ['wikiDocuments', currentWorkspace?.id],
    queryFn: () => wikiService.getDocuments(currentWorkspace!.id),
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 5 * 60 * 1000,
  });

  const documentsResData = (documentsRes as any)?.data;
  const docsList =
    documentsResData?.results?.data ||
    documentsResData?.data?.results?.data ||
    documentsResData?.results ||
    documentsResData?.data ||
    (Array.isArray(documentsResData) ? documentsResData : []) || [];

  const documents: Doc[] = Array.isArray(docsList) ? docsList.map((d: any) => ({
    id: d.id,
    title: d.document_title || d.title || d.name || d.file_name || "Untitled Document",
    type: d.attachments?.[0]?.file_name?.split('.').pop()?.toUpperCase() ?? 'DOC',
    time: d.updated_at ? formatDistanceToNow(new Date(d.updated_at), { addSuffix: true }) : "–",
    image: getDocCover(d),
    author: d.author || d.created_by_user || d.user,
    size: d.attachments?.reduce((acc: number, curr: any) => acc + (curr.file_size || 0), 0),
    attachments: d.attachments,
    folder: d.folder,
  })) : [];

  const { data: folderContentsRes, isLoading: loadingFolders, refetch: fetchFolders } = useQuery({
    queryKey: ['folderContents', currentWorkspace?.id, currentFolderId],
    queryFn: () => filesService.getFolderContents(currentWorkspace!.id, currentFolderId || undefined),
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 5 * 60 * 1000,
  });

  const folderContents = (folderContentsRes as any)?.data?.data || (folderContentsRes as any)?.data || folderContentsRes || {};
  const folders: FolderData[] = (folderContents.folders || []).filter(Boolean);
  const files: FileItem[] = (folderContents.files || []).filter(Boolean);
  const loading = documentsLoading || loadingFolders;

  // UX State: Sorting & Filtering
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'modified'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const isFiltered = Boolean(typeFilter !== 'all' || (searchQuery && searchQuery.length >= 2));

  // Automatically switch to Table View when filtering is active (to show Location column)
  useEffect(() => {
    if (typeFilter !== 'all' || (searchQuery && searchQuery.length >= 2)) {
      setGridView(false);
    }
  }, [typeFilter, searchQuery]);

  // Global Workspace Files (for flattened filtering/search)
  const { data: workspaceFilesRes } = useQuery({
    queryKey: ['workspaceFiles', currentWorkspace?.id],
    queryFn: () => filesService.getWorkspaceFiles(currentWorkspace!.id),
    enabled: !!currentWorkspace?.id && isFiltered,
    staleTime: 5 * 60 * 1000,
  });

  const allWorkspaceFiles: FileItem[] = (workspaceFilesRes as any)?.data?.data || (workspaceFilesRes as any)?.data || [];


  // Sorting & Filtering Function
  const getProcessedItems = (items: any[], kind: 'folder' | 'file' | 'document') => {
    let sourceItems = [...items];

    // If we are filtering by a specific file type, we use the global workspace files for 'file' kind
    const isFileTypeFilter = typeFilter !== 'all' && typeFilter !== 'folder' && typeFilter !== 'templates' && typeFilter !== 'my_docs';
    if (isFileTypeFilter && kind === 'file' && allWorkspaceFiles.length > 0) {
      sourceItems = [...allWorkspaceFiles];
    }

    let filtered = sourceItems;

    // Search Query Filter
    if (searchQuery && searchQuery.length >= 2) {
      filtered = filtered.filter(it => (it.name || it.title || it.file_name || "").toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Type Filter Logic
    if (typeFilter !== 'all' && typeFilter !== 'templates' && typeFilter !== 'my_docs') {
      const targetFilter = typeFilter.toLowerCase();
      if (kind === 'folder') {
        if (targetFilter === 'folder' || targetFilter === 'folder_and_files') {
          // Show folders
        } else {
          filtered = [];
        }
      } else {
        if (targetFilter === 'folder') {
          filtered = [];
        } else if (targetFilter === 'wiki_docs') {
           if (kind !== 'document') filtered = [];
        } else {
          filtered = filtered.filter(it => {
            const ext = kind === 'file' ? (it.file_name?.split('.').pop()?.toLowerCase()) : (it.type?.toLowerCase());
            if (targetFilter === 'pdf') return ext === 'pdf';
            if (targetFilter === 'word') return ['doc', 'docx'].includes(ext || "");
            if (targetFilter === 'excel') return ['xls', 'xlsx', 'csv'].includes(ext || "");
            if (targetFilter === 'image') return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || "");
            if (targetFilter === 'video') return ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext || "");
            if (targetFilter === 'audio') return ['mp3', 'wav', 'aac', 'ogg'].includes(ext || "");
            if (targetFilter === 'zip') return ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || "");
            return ext === targetFilter || kind === targetFilter;
          });
        }
      }
    }

    return filtered;
  };

  const sortItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      let valA, valB;
      const keyA = a.name || a.title || a.file_name || "";
      const keyB = b.name || b.title || b.file_name || "";

      if (sortBy === 'name') {
        valA = keyA.toLowerCase();
        valB = keyB.toLowerCase();
      } else if (sortBy === 'size') {
        valA = a.total_size || a.file_size || a.size || 0;
        valB = b.total_size || b.file_size || b.size || 0;
      } else {
        const dateA = a.updated_at || a.uploaded_at || a.modifiedAt || (a.time === "–" ? 0 : a.time);
        const dateB = b.updated_at || b.uploaded_at || b.modifiedAt || (b.time === "–" ? 0 : b.time);
        valA = new Date(dateA).getTime() || 0;
        valB = new Date(dateB).getTime() || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleToggleSort = (column: 'name' | 'size' | 'modified') => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Segregated Suggestion Logic (Only at Root)
  const suggestedFolders = !currentFolderId ? sortItems(getProcessedItems(folders, 'folder')).slice(0, 4) : [];
  const suggestedFiles = !currentFolderId ? sortItems(getProcessedItems(documents, 'document')).slice(0, 4) : [];

  const canEditResource = (item: any) => {
    if (!currentWorkspace || !user) return false;
    // Strictly enforcing creator-based permissions for regular users
    const creatorId = 
      item.created_by?.id || item.created_by ||
      item.created_by_user?.id || 
      item.uploaded_by?.id || item.uploaded_by ||
      item.uploaded_by_user?.id || 
      item.author?.id || item.author ||
      item.owner?.id || item.owner;
    
    // Admins and Owners can still edit everything in a workspace environment
    if (["Owner", "Admin"].includes(currentWorkspace.user_role)) return true;
    
    return String(creatorId) === String(user.id);
  };

  const [open, setOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null; name: string }>>([{ id: null, name: 'Root' }]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: any } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, items: any[] }>({ open: false, items: [] });
  const [renamingItem, setRenamingItem] = useState<any | null>(null);

  const getFolderStats = (folderId: string) => {
    const folder = folders.find(f => String(f.id) === String(folderId)) as any;
    return {
      totalSize: folder?.total_size || 0,
      lastModified: folder?.updated_at ? formatDistanceToNow(new Date(folder.updated_at), { addSuffix: true }) : "–",
      members: folder?.contributors || [],
      owner: folder?.created_by_user,
      itemCount: folder?.item_count || 0
    };
  };

  const handleOpenFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
    setGridView(false); // Force table view when entering a subfolder
  };

  const handleSelect = (e: React.MouseEvent, itemId: string, allItems: any[]) => {
    e.stopPropagation();
    const isShift = e.shiftKey;
    const isMeta = e.ctrlKey || e.metaKey;

    if (isShift && selectedIds.length > 0) {
      const lastSelectedId = selectedIds[selectedIds.length - 1];
      const itemsList = allItems.map(it => String(it.id));
      const lastIdx = itemsList.indexOf(lastSelectedId);
      const currIdx = itemsList.indexOf(itemId);

      if (lastIdx !== -1 && currIdx !== -1) {
        const start = Math.min(lastIdx, currIdx);
        const end = Math.max(lastIdx, currIdx);
        const rangeIds = itemsList.slice(start, end + 1);
        setSelectedIds(prev => [...new Set([...prev, ...rangeIds])]);
        return;
      }
    }

    if (isMeta) {
      setSelectedIds(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    } else {
      setSelectedIds([itemId]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    const targetFolderId = newBreadcrumbs[index].id;
    setCurrentFolderId(targetFolderId);
    setSelectedIds([]);
    if (targetFolderId !== null) {
      setGridView(false);
    }
  };

  const handleAction = async (action: 'download' | 'delete' | 'rename' | 'open', item?: any) => {
    const itemsToProcess = item ? [item] : (selectedIds.map(id => {
      const f = files.find(f => f.id === id);
      const fold = folders.find(f => f.id === id);
      const doc = documents.find(d => String(d.id) === id);
      return f ? { ...f, kind: 'file' } : fold ? { ...fold, kind: 'folder' } : doc ? { ...doc, kind: 'document' } : null;
    }).filter(Boolean));

    if (itemsToProcess.length === 0) return;

    switch (action) {
      case 'open':
        if (itemsToProcess[0].kind === 'folder') handleOpenFolder(itemsToProcess[0].id, itemsToProcess[0].name || itemsToProcess[0].title);
        break;
      case 'download': {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.buildtrackerapp.com/api";
        for (const it of itemsToProcess) {
          const downloadUrl = it.kind === 'folder' 
            ? `${baseUrl}/files/workspaces/${currentWorkspace!.id}/folders/${it.id}/download/`
            : `${baseUrl}/files/files/${it.id}/download/`;
          
          const filename = it.kind === 'folder' ? `${it.name}.zip` : it.file_name || it.name;

          if (it.kind === 'file' || it.kind === 'folder') {
            try {
              toast.promise(
                triggerAuthenticatedDownload(downloadUrl, filename),
                {
                  loading: 'Preparing download...',
                  success: 'Download started!',
                  error: 'Download failed. Please try again.'
                }
              );
            } catch (err) { console.error(err); }
          } else if (it.kind === 'document') {
            const attachment = it.attachments?.[0];
            if (attachment?.id) {
              const docUrl = `${baseUrl}/wiki/${currentWorkspace!.id}/wiki/documents/attachments/${attachment.id}/download/`;
              const docName = attachment.file_name || attachment.name || it.title;
              triggerAuthenticatedDownload(docUrl, docName).catch(console.error);
            } else {
              const documentUrl = attachment?.file_url || attachment?.file;
              if (documentUrl) window.open(documentUrl, '_blank');
            }
          }
        }
        break;
      }
      case 'delete':
        setDeleteModal({ open: true, items: itemsToProcess });
        break;
      case 'rename':
        if (itemsToProcess.length === 1) {
          setItemToRename(itemsToProcess[0]);
          setRenameModalOpen(true);
        }
        break;
    }
    setContextMenu(null);
  };

  const confirmDelete = async () => {
    if (!currentWorkspace?.id) return;
    try {
      for (const item of deleteModal.items) {
        if (item.kind === 'file') await filesService.deleteFile(item.id);
        else if (item.kind === 'folder') await filesService.deleteFolder(currentWorkspace.id, item.id);
        else if (item.kind === 'document') await wikiService.deleteDocument(currentWorkspace.id, String(item.id));
      }
      fetchFolders();
      fetchDocuments();
      setSelectedIds([]);
      setDeleteModal({ open: false, items: [] });
      toast.success("Deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete items");
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!itemToRename || !currentWorkspace?.id) return;
    try {
      if (itemToRename.kind === 'folder') await filesService.renameFolder(currentWorkspace.id, itemToRename.id, { name: newName });
      else if (itemToRename.kind === 'file') await filesService.renameFile(itemToRename.id, { file_name: newName });
      else if (itemToRename.kind === 'document') await wikiService.updateDocument(currentWorkspace.id, String(itemToRename.id), { document_title: newName });
      fetchFolders();
      fetchDocuments();
      setRenameModalOpen(false);
      setItemToRename(null);
      toast.success("Renamed successfully");
    } catch (error) {
      console.error("Rename failed:", error);
      toast.error("Failed to rename item");
    }
  };

  return (
    <div className="p-6 space-y-8 bg-muted min-h-screen">
      {/* Selection Action Bar (Sticky contextual header) */}
      {selectedIds.length > 0 && (() => {
        const selectedItems = selectedIds.map(id => {
          const f = files.find(f => String(f.id) === id);
          const fold = folders.find(f => String(f.id) === id);
          const doc = documents.find(d => String(d.id) === id);
          return f ? { ...f, kind: 'file' } : fold ? { ...fold, kind: 'folder' } : doc ? { ...doc, kind: 'document' } : null;
        }).filter(Boolean);

        if (selectedItems.length === 0) return null;

        const allEditable = selectedItems.every(it => canEditResource(it));
        const canRenameOne = selectedItems.length === 1 && canEditResource(selectedItems[0]);

        return (
          <div className="sticky top-0 z-30 flex items-center justify-between bg-primary text-primary-foreground p-4 -mx-6 px-6 shadow-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedIds([])} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={24} />
              </button>
              <span className="font-bold text-lg">{selectedIds.length} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleAction('download')} className="p-2.5 hover:bg-white/20 rounded-xl transition-colors" title="Download selected">
                <Download size={22} strokeWidth={2.5} />
              </button>

              {selectedItems.length === 1 && (
                <button
                  onClick={() => handleAction('rename')}
                  disabled={!canRenameOne}
                  className={cn(
                    "p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white",
                    !canRenameOne && "opacity-50 blur-[0.5px] cursor-not-allowed grayscale pointer-events-none"
                  )}
                  title="Rename selected"
                >
                  <Edit2 size={22} strokeWidth={2.5} />
                </button>
              )}

              <button
                onClick={() => handleAction('delete')}
                disabled={!allEditable}
                className={cn(
                  "p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white",
                  !allEditable && "opacity-50 blur-[0.5px] cursor-not-allowed grayscale pointer-events-none"
                )}
                title="Delete selected"
              >
                <Trash2 size={22} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wiki - {currentWorkspace?.name || 'Loading...'}</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage workspace documents and browse template marketplace</p>
        </div>

        {/* Global UX Filters (Sorting & Search) */}
        {!loading && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border">
              <button
                onClick={() => handleToggleSort('name')}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", sortBy === 'name' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-muted")}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleToggleSort('size')}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", sortBy === 'size' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-muted")}
              >
                Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleToggleSort('modified')}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", sortBy === 'modified' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-muted")}
              >
                Modified {sortBy === 'modified' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>

            {/* File Type Filter */}
            <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border">
              <select 
                value={activeTab === 'templates' ? 'templates' : (typeFilter === 'all' && activeTab === 'docs' ? 'my_docs' : typeFilter)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'templates') {
                    setActiveTab('templates');
                    setTypeFilter('all');
                  } else if (val === 'my_docs') {
                    setActiveTab('docs');
                    setTypeFilter('all');
                  } else {
                    setActiveTab('docs');
                    setTypeFilter(val);
                  }
                }}
                className="bg-transparent text-xs font-medium px-2 py-1 outline-none text-muted-foreground focus:text-primary transition-colors cursor-pointer"
              >
                <option value="all">All Types</option>
                {/* <option value="my_docs">My Documents</option> */}
                <option value="templates">Template Marketplace</option>
                <option value="pdf">PDF Documents</option>
                <option value="word">Word Documents</option>
                <option value="excel">Excel Sheets</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="zip">ZIP Files</option>
                <option value="wiki_docs">Documents</option>
                <option value="folder">Folders Only</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="inline-flex rounded-lg bg-background p-1 border shadow-sm">
        <button
          onClick={() => setActiveTab("docs")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all",
            activeTab === "docs" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          My Documents
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
            activeTab === "templates" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ListChecks size={16} />
          Template Marketplace
        </button>
      </div>

      {activeTab === "templates" && (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No templates available yet.
        </div>
      )}

      {activeTab === "docs" && (
        <div className="space-y-8">
          {/* Breadcrumbs (Original Styling) */}
          {breadcrumbs.length > 1 && (
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button onClick={() => handleBreadcrumbClick(index)} className="text-primary hover:underline">
                    {crumb.name}
                  </button>
                  {index < breadcrumbs.length - 1 && <span className="text-muted-foreground">/</span>}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="p-20 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Loading wiki content...</p>
              </div>
            ) : (
              <>
                {/* Folders & Files Section (Header + Creation Buttons) */}
                {(!!currentFolderId || getProcessedItems(folders, 'folder').length > 0 || getProcessedItems(files, 'file').length > 0) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setOpenFolder(true)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="New folder">
                        <FolderPlus className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => setOpenFile(true)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Upload file">
                        <FilePlus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Unified Search Results & Filtered View */}
                {isFiltered && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <button 
                          onClick={() => { setTypeFilter('all'); router.push(pathname); }}
                          className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest hover:underline mb-1"
                        >
                          <ChevronLeft className="h-3 w-3" /> Back to Overview
                        </button>
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                          {searchQuery ? `Search: ${searchQuery}` : (typeFilter === 'wiki_docs' ? 'All Documents' : (typeFilter === 'folder_and_files' ? 'All Folders & Files' : (typeFilter === 'folder' ? 'All Folders' : `${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1).replace(/_/g, ' ')}`)))}
                          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {(getProcessedItems(folders, 'folder').length + getProcessedItems(files, 'file').length + getProcessedItems(documents, 'document').length)}
                          </span>
                        </h2>
                      </div>
                    </div>

                    <WikiTableView
                      selectedIds={selectedIds}
                      onSelectionChange={setSelectedIds}
                      onContextMenu={(e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item })}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleToggleSort}
                      sections={[{
                        label: searchQuery ? "All Matching Items" : (typeFilter === 'wiki_docs' ? 'Documents' : (typeFilter === 'folder_and_files' ? 'Folders & Files' : `${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1).replace(/_/g, ' ')}`)),
                        count: getProcessedItems(folders, 'folder').length + getProcessedItems(files, 'file').length + getProcessedItems(documents, 'document').length,
                        items: sortItems([
                          ...getProcessedItems(folders, 'folder').map(folder => {
                            const stats = getFolderStats(folder.id);
                            return {
                              id: String(folder.id),
                              kind: "folder" as const,
                              name: folder.name,
                              modifiedAt: stats.lastModified,
                              size: stats.totalSize,
                              owner: stats.owner,
                              members: stats.members,
                              itemCount: folder.item_count || 0,
                              onOpen: () => handleOpenFolder(folder.id, folder.name),
                              onSelect: (e: any) => handleSelect(e, String(folder.id), [...folders, ...files]),
                              isSelected: selectedIds.includes(String(folder.id)),
                              onDownload: () => handleAction('download', {...folder, kind: 'folder'}),
                              onDelete: () => handleAction('delete', {...folder, kind: 'folder'}),
                              onRename: () => { setItemToRename({...folder, id: String(folder.id), kind: 'folder'}); setRenameModalOpen(true); },
                              location: isFiltered ? (folder.parent?.name ? { id: folder.parent.id, name: folder.parent.name } : { id: "root", name: "Root" }) : undefined
                            };
                          }),
                          ...getProcessedItems(files, 'file').map(file => {
                            const folderName = file.folder?.name || (file.path?.split('/').slice(-2, -1)[0]) || "";
                            return {
                              id: String(file.id),
                              kind: "file" as const,
                              name: file.file_name,
                              url: file.file_url || file.file,
                              modifiedAt: formatDistanceToNow(new Date(file.uploaded_at), { addSuffix: true }),
                              size: file.file_size,
                              isSelected: selectedIds.includes(String(file.id)),
                              onSelect: (e: any) => handleSelect(e, String(file.id), [...folders, ...files]),
                              owner: file.uploaded_by_user,
                              members: file.uploaded_by_user ? [file.uploaded_by_user] : [],
                              onRename: () => { setItemToRename({...file, id: String(file.id), kind: 'file'}); setRenameModalOpen(true); },
                              onDownload: () => handleAction('download', {...file, kind: 'file'}),
                              location: isFiltered ? (folderName ? { id: file.folder?.id || "", name: folderName } : { id: "root", name: "Root" }) : undefined,
                              onOpen: file.folder ? () => handleOpenFolder(file.folder!.id, file.folder!.name) : undefined,
                            };
                          }),
                          ...getProcessedItems(documents, 'document').map(doc => ({
                            id: String(doc.id),
                            kind: "document" as const,
                            name: doc.title,
                            modifiedAt: doc.time,
                            size: doc.size,
                            owner: doc.author,
                            isSelected: selectedIds.includes(String(doc.id)),
                            onSelect: (e: any) => handleSelect(e, String(doc.id), documents),
                            members: doc.author ? [doc.author] : [],
                            url: doc.image,
                            onDownload: () => handleAction('download', { ...doc, kind: 'document' }),
                            onRename: () => { setItemToRename({ ...doc, kind: 'document' }); setRenameModalOpen(true); },
                            location: doc.folder ? { id: doc.folder.id, name: doc.folder.name } : undefined,
                            onOpen: doc.folder ? () => handleOpenFolder(doc.folder!.id, doc.folder!.name) : undefined,
                          })),
                        ]),
                      }]}
                    />
                  </div>
                )}

                {/* Segregated Segments (Only at Root) */}
                {!currentFolderId && activeTab === 'docs' && typeFilter === 'all' && !searchQuery && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Folders Section (at Root) */}
                    {(getProcessedItems(folders, 'folder').length > 0 || typeFilter === 'all' || typeFilter === 'folder') && (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between group">
                          <button
                            onClick={() => setTypeFilter('folder')}
                            className="flex items-center gap-2 text-xl font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            Folders <span className="text-primary text-base font-normal ml-1">{getProcessedItems(folders, 'folder').length}</span>
                          </button>
                          <button onClick={() => setTypeFilter('folder')} className="text-sm font-medium text-primary hover:underline transition-colors px-2 py-1 rounded-md hover:bg-primary/5">
                            View all folders
                          </button>
                        </div>

                        <div className="space-y-4">
                          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Suggested Folders</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <AddActionCard 
                              title="Create New Folder" 
                              onClick={() => setOpenFolder(true)} 
                              height="h-[200px]"
                              className="rounded-xl"
                            />
                            {suggestedFolders.map(folder => (
                              <FolderCard
                                key={folder.id}
                                folderId={folder.id}
                                title={folder.name}
                                items={folder.item_count || 0}
                                contributors={folder.contributors}
                                view="grid"
                                isSelected={selectedIds.includes(String(folder.id))}
                                onSelect={(e) => handleSelect(e, String(folder.id), [...folders, ...files])}
                                onOpen={() => handleOpenFolder(folder.id, folder.name)}
                                onDownload={() => handleAction('download', { ...folder, kind: 'folder' })}
                                onDelete={() => handleAction('delete', { ...folder, kind: 'folder' })}
                                onRename={() => { setItemToRename({ ...folder, id: String(folder.id), kind: 'folder' }); setRenameModalOpen(true); }}
                                onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, item: { ...folder, id: String(folder.id), kind: 'folder' } })}
                                canEdit={canEditResource(folder)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {(getProcessedItems(folders, 'folder').length > 0 || typeFilter === 'all' || typeFilter === 'folder') && (getProcessedItems(documents, 'document').length > 0 || typeFilter === 'all' || typeFilter === 'wiki_docs' || typeFilter !== 'all') && (
                      <div className="h-px w-full bg-border/50" />
                    )}

                    {/* Documents Section (at Root) */}
                    {(getProcessedItems(documents, 'document').length > 0 || typeFilter === 'all' || typeFilter === 'wiki_docs') && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between group">
                          <button
                            onClick={() => setTypeFilter('wiki_docs')}
                            className="flex items-center gap-2 text-xl font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            Documents <span className="text-primary text-base font-normal ml-1">{getProcessedItems(documents, 'document').length}</span>
                          </button>
                          <button onClick={() => setTypeFilter('wiki_docs')} className="text-sm font-medium text-primary hover:underline transition-colors px-2 py-1 rounded-md hover:bg-primary/5">
                            View all Documents
                          </button>
                        </div>

                        <div className="space-y-4">
                          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Suggested Files</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <AddActionCard 
                                title="Upload New Document" 
                                onClick={() => setOpen(true)} 
                                height="h-[260px]"
                                className="rounded-[24px]"
                              />
                              {suggestedFiles.map(doc => (
                                <DocumentCard
                                  key={doc.id}
                                  cover={doc.image}
                                  title={doc.title}
                                  time={doc.time}
                                  fileType={doc.type}
                                  user={doc.author}
                                  view="grid"
                                  isSelected={selectedIds.includes(String(doc.id))}
                                  onSelect={(e) => handleSelect(e, String(doc.id), documents)}
                                  onOpen={() => handleAction('download', { ...doc, kind: 'document' })}
                                  onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, item: { ...doc, id: String(doc.id), kind: 'document' } })}
                                  canEdit={canEditResource(doc)}
                                />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Content Area (Shown when in a Folder and Not Filtering) */}
                {currentFolderId && !isFiltered && (
                  <div className="space-y-4">
                    {(!isFiltered || typeFilter === 'folder' || typeFilter === 'all') && (
                      <>
                        {currentFolderId === null && (
                          <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border w-fit">
                            <button onClick={() => setGridView(false)} className={cn("p-1.5 rounded-md transition-colors", !gridView ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-muted")}><List className="h-4 w-4" /></button>
                            <button onClick={() => setGridView(true)} className={cn("p-1.5 rounded-md transition-colors", gridView ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-muted")}><LayoutGrid className="h-4 w-4" /></button>
                          </div>
                        )}

                        {gridView && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {currentFolderId === null && (
                              <>
                                <div className="flex items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground hover:bg-muted hover:border-primary transition-colors cursor-pointer group" onClick={() => setOpenFolder(true)}>
                                  <CirclePlus className="h-5 w-5 group-hover:text-primary transition-colors" /><span className="font-medium">Create New Folder</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground hover:bg-muted hover:border-primary transition-colors cursor-pointer group" onClick={() => setOpenFile(true)}>
                                  <CirclePlus className="h-5 w-5 group-hover:text-primary transition-colors" /><span className="font-medium">Upload File</span>
                                </div>
                              </>
                            )}
                            {getProcessedItems(folders, 'folder').map(folder => (
                              <FolderCard key={folder.id} folderId={folder.id} title={folder.name} items={folder.item_count || 0} contributors={folder.contributors} view="grid" isSelected={selectedIds.includes(String(folder.id))} onRename={() => { setItemToRename({...folder, id: String(folder.id), kind: 'folder'}); setRenameModalOpen(true); }} onDownload={() => handleAction('download', {...folder, kind: 'folder'})} onDelete={() => handleAction('delete', {...folder, kind: 'folder'})} onSelect={(e) => handleSelect(e, String(folder.id), [...folders, ...files])} onContextMenu={(e) => setContextMenu({ x: e.clientX, y: e.clientY, item: {...folder, id: String(folder.id), kind: 'folder'} })} onOpen={() => handleOpenFolder(folder.id, folder.name)} canEdit={canEditResource(folder)} />
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {gridView ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {getProcessedItems(files, 'file').map(file => (
                          <FileCard key={file.id} fileId={file.id} fileName={file.file_name} url={file.file_url || file.file} fileType={file.file_name.split('.').pop()?.toUpperCase() || 'FILE'} uploadedAt={new Date(file.uploaded_at).toLocaleDateString()} isSelected={selectedIds.includes(String(file.id))} onRename={() => { setItemToRename({...file, id: String(file.id), kind: 'file'}); setRenameModalOpen(true); }} onSelect={(e) => handleSelect(e, String(file.id), [...folders, ...files])} onOpen={() => handleAction('download', {...file, kind: 'file'})} onContextMenu={(e: React.MouseEvent) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, item: {...file, id: String(file.id), kind: 'file'} }); }} owner={file.uploaded_by_user?.first_name ? `${file.uploaded_by_user.first_name} ${file.uploaded_by_user.last_name || ''}` : 'Nth'} ownerAvatar={file.uploaded_by_user?.avatar} fileSize={file.file_size} view="grid" canEdit={canEditResource(file)} />
                        ))}
                      </div>
                    ) : (
                      <WikiTableView
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onContextMenu={(e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item })}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleToggleSort}
                        sections={[{
                          label: "Folders & Files",
                          count: folders.length + files.length,
                          items: sortItems([
                            ...((!isFiltered || typeFilter === 'folder' || typeFilter === 'all') ? getProcessedItems(folders, 'folder').map(folder => {
                              const stats = getFolderStats(folder.id);
                              return {
                                id: String(folder.id),
                                kind: "folder" as const,
                                name: folder.name,
                                modifiedAt: stats.lastModified,
                                size: stats.totalSize,
                                owner: stats.owner,
                                members: stats.members,
                                itemCount: folder.item_count || 0,
                                onOpen: () => handleOpenFolder(folder.id, folder.name),
                                onSelect: (e: any) => handleSelect(e, String(folder.id), [...folders, ...files]),
                                isSelected: selectedIds.includes(String(folder.id)),
                                onDownload: () => handleAction('download', {...folder, kind: 'folder'}),
                                onDelete: () => handleAction('delete', {...folder, kind: 'folder'}),
                                onRename: () => { setItemToRename({...folder, id: String(folder.id), kind: 'folder'}); setRenameModalOpen(true); },
                                location: isFiltered ? (folder.parent?.name ? { id: folder.parent.id, name: folder.parent.name } : { id: "root", name: "Root" }) : undefined
                              };
                            }) : []),
                            ...getProcessedItems(files, 'file').map(file => {
                              const folderName = file.folder?.name || (file.path?.split('/').slice(-2, -1)[0]) || "";
                              return {
                                id: String(file.id),
                                kind: "file" as const,
                                name: file.file_name,
                                url: file.file_url || file.file,
                                modifiedAt: formatDistanceToNow(new Date(file.uploaded_at), { addSuffix: true }),
                                size: file.file_size,
                                isSelected: selectedIds.includes(String(file.id)),
                                onSelect: (e: any) => handleSelect(e, String(file.id), [...folders, ...files]),
                                owner: file.uploaded_by_user,
                                members: file.uploaded_by_user ? [file.uploaded_by_user] : [],
                                onRename: () => { setItemToRename({...file, id: String(file.id), kind: 'file'}); setRenameModalOpen(true); },
                                onDownload: () => handleAction('download', {...file, kind: 'file'}),
                                location: isFiltered ? (folderName ? { id: file.folder?.id || "", name: folderName } : { id: "root", name: "Root" }) : undefined,
                                onOpen: file.folder ? () => handleOpenFolder(file.folder!.id, file.folder!.name) : undefined,
                              };
                            }),
                            ...getProcessedItems(documents, 'document').map(doc => ({
                              id: String(doc.id),
                              kind: "document" as const,
                              name: doc.title,
                              modifiedAt: doc.time,
                              size: doc.size,
                              owner: doc.author,
                              isSelected: selectedIds.includes(String(doc.id)),
                              onSelect: (e: any) => handleSelect(e, String(doc.id), documents),
                              members: doc.author ? [doc.author] : [],
                              url: doc.image,
                              onDownload: () => handleAction('download', { ...doc, kind: 'document' }),
                              onRename: () => { setItemToRename({ ...doc, kind: 'document' }); setRenameModalOpen(true); },
                              location: doc.folder ? { id: doc.folder.id, name: doc.folder.name } : undefined,
                              onOpen: doc.folder ? () => handleOpenFolder(doc.folder!.id, doc.folder!.name) : undefined,
                            })),
                          ]),
                        }]}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals scope correctly at root divider */}
      <AddNewDocumentModal open={open} onClose={() => setOpen(false)} folderId={currentFolderId || undefined} onDocumentCreated={() => fetchDocuments()} />
      <AddNewFolderModal open={openFolder} onClose={() => setOpenFolder(false)} parentFolderId={currentFolderId || undefined} onFolderCreated={() => fetchFolders()} />
      <UploadFileModal open={openFile} onClose={() => setOpenFile(false)} folderId={currentFolderId || undefined} onUploaded={() => fetchFolders()} />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          kind={contextMenu.item.kind}
          onClose={() => setContextMenu(null)}
          onOpen={contextMenu.item.kind === 'folder' ? () => handleAction('open', contextMenu.item) : undefined}
          onDownload={(contextMenu.item.kind === 'file' || contextMenu.item.kind === 'document') ? () => handleAction('download', contextMenu.item) : undefined}
          canDelete={canEditResource(contextMenu.item)}
          onDelete={() => handleAction('delete', contextMenu.item)}
          onRename={() => { setItemToRename(contextMenu.item); setRenameModalOpen(true); setContextMenu(null); }}
        />
      )}

      <DeleteConfirmationModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, items: [] })} onConfirm={confirmDelete} title="Delete items" count={deleteModal.items.length} />
      <RenameModal open={renameModalOpen} onClose={() => { setRenameModalOpen(false); setItemToRename(null); }} onConfirm={handleRenameConfirm} initialName={itemToRename?.name || itemToRename?.title || itemToRename?.file_name || ""} title={`Rename ${itemToRename?.kind || 'Item'}`} />
    </div>
  );
}

export default function ProjectWikiPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Loading wiki...</div>}>
      <WikiPageContent />
    </Suspense>
  );
}
