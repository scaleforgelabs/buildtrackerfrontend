"use client";

import { useState, useEffect, Suspense } from "react";
import {
  FolderPlus,
  LayoutGrid,
  List,
  ListChecks,
  CirclePlus,
  ChevronDown,
  FilePlus,
  ArrowUpDown,
  Folder
} from "lucide-react";
import { RenameModal } from "@/app/components/wiki/RenameModal";
import { toast } from "sonner";
import { cn, getFileIcon as getUtilityIcon } from "@/libs/utils"
import { useAuth } from "@/libs/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { useSearchParams } from "next/navigation";
import { FolderCard } from "@/app/components/wiki/FolderCard"
import { FileCard } from "@/app/components/wiki/FileCard"
import { FilesAndFoldersView } from "@/app/components/wiki/FilesAndFoldersView"
import { DocumentCard } from "@/app/components/wiki/DocumentCard"
import { Images } from "@/public";
import { filesService, wikiService } from "@/libs/api/services";
import AddNewDocumentModal from "@/app/components/wiki/modal/AddNewDocumentModal";
import AddNewFolderModal from "@/app/components/wiki/modal/AddNewFolder";
import UploadFileModal from "@/app/components/wiki/modal/UploadFileModal";
import { WikiTableView } from "@/app/components/wiki/WikiTableView";
import { ContextMenu } from "@/app/components/wiki/ContextMenu";
import { DeleteConfirmationModal } from "@/app/components/wiki/modal/DeleteConfirmationModal";
import { Trash2, Download, Edit2, X, MoreVertical } from "lucide-react";

type FolderData = {
  id: string;
  name: string;
  created_by_user?: { id: string; avatar?: string; first_name?: string; last_name?: string; email?: string };
  total_size?: number;
  contributors?: any[];
  item_count?: number;
};

type FileItem = {
  id: string;
  file_name: string;
  uploaded_at: string;
  file_size?: number;
  uploaded_by_user?: { first_name: string; last_name: string; email: string; avatar?: string };
  file_url?: string;
  file?: string;
};




function getDocCover(d: any): string {
  if (d.image) return d.image;
  const attachments = (d.attachments as any[]) || [];

  // Try to find an actual image in the attachments
  const imageAttachment = attachments.find((a: any) => {
    const ext = a.file_name?.split('.').pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "tif", "heic", "heif", "ico", "avif"].includes(ext);
  });

  if (imageAttachment) {
    return imageAttachment.file_url || imageAttachment.file;
  }

  return Images.banner.src;
}

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
};

function WikiPageContent() {
  const [activeTab, setActiveTab] = useState<"docs" | "templates">("docs");
  const [showFolders, setShowFolders] = useState(true);
  const [showDocuments, setShowDocuments] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<any>(null);

  const handleRenameConfirm = async (newName: string) => {
    if (!itemToRename || !currentWorkspace?.id) return;
    try {
      if (itemToRename.kind === 'folder') {
        await filesService.renameFolder(currentWorkspace.id, itemToRename.id, { name: newName });
        fetchFolders(currentFolderId || undefined);
      } else if (itemToRename.kind === 'file') {
        await filesService.renameFile(itemToRename.id, { file_name: newName });
        fetchFolders(currentFolderId || undefined);
      } else if (itemToRename.kind === 'document') {
        await wikiService.updateDocument(currentWorkspace.id, String(itemToRename.id), { document_title: newName });
        fetchDocuments();
      }
      toast.success("Renamed successfully");
    } catch (error) {
      console.error("Rename failed:", error);
      toast.error("Failed to rename item");
    }
  };
  const [open, setOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folderFiles, setFolderFiles] = useState<{ [key: string]: FileItem[] }>({});
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null; name: string }>>([{ id: null, name: 'Root' }]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: any } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, items: any[] }>({ open: false, items: [] });
  const [renamingItem, setRenamingItem] = useState<any | null>(null);

  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [documents, setDocuments] = useState<Doc[]>([]);
  const { user } = useAuth();

  const canEditResource = (item: any) => {
    if (!currentWorkspace || !user) return false;
    if (["Owner", "Admin"].includes(currentWorkspace.user_role)) return true;

    const creatorId =
      item.author?.id ||
      item.created_by_user?.id ||
      item.uploaded_by_user?.id ||
      item.uploaded_by?.id ||
      item.created_by?.id ||
      item.owner?.id ||
      item.uploaded_by_user_id || // Some fallback if needed
      (typeof item.author === 'string' ? item.author : null);

    return creatorId === user.id;
  };

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchFolders(undefined);
      fetchDocuments();
    }
  }, [currentWorkspace?.id]);

  const fetchDocuments = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await wikiService.getDocuments(currentWorkspace.id, { _t: Date.now() });
      const docsData = res.data.results || res.data.data || res.data || []; // Handle pagination structure
      // Map backend doc to frontend Doc type
      const mappedDocs = Array.isArray(docsData) ? docsData.map((d: any) => {
        const attachments = (d.attachments as any[]) || [];
        const totalSize = attachments.reduce((acc: number, curr: any) => acc + (curr.file_size || 0), 0);
        return {
          id: d.id,
          title: d.document_title,
          type: attachments?.[0]?.file_name?.split('.').pop()?.toUpperCase() ?? 'DOC',
          time: formatDistanceToNow(new Date(d.updated_at), { addSuffix: true }),
          image: getDocCover(d),
          author: d.author,
          size: totalSize,
          attachments: d.attachments,
        };
      }) : [];
      setDocuments(mappedDocs);
    } catch (error) {
      console.error("Failed to fetch wiki documents:", error);
    }
  };

  const fetchFolders = async (folderId?: string) => {
    try {
      const res = await filesService.getFolderContents(currentWorkspace?.id!, folderId);
      console.log('Folder contents response:', res.data);
      const folders = res.data.folders || [];
      const files = res.data.files || [];
      setFolders(folders);
      setFiles(files);

      // Reverted breadcrumb update from backend
      // setBreadcrumbs([{ id: null, name: 'Wiki' }, ...backendCrumbs]);

      // No longer need to fetch subfolder files one-by-one as backend provides total_size and contributors
      setFolderFiles({});
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const getFolderStats = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId) as any;

    // Use recursive size from backend, fallback to 0
    const totalSize = folder?.total_size || 0;

    // We can only show lastModified if we have the data, for now keep it simple or hide it
    const lastModified = "–";

    // Use contributors from backend
    const members = folder?.contributors || [];

    return {
      totalSize,
      lastModified: folder?.updated_at ? formatDistanceToNow(new Date(folder.updated_at), { addSuffix: true }) : "–",
      members,
      owner: folder?.created_by_user,
      itemCount: folder?.item_count || 0
    };
  };

  const handleOpenFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
    fetchFolders(folderId);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    const folderId = newBreadcrumbs[index].id;
    setCurrentFolderId(folderId);
    fetchFolders(folderId || undefined);
    setSelectedIds([]);
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
        if (itemsToProcess[0].kind === 'folder') {
          handleOpenFolder(itemsToProcess[0].id, itemsToProcess[0].name || itemsToProcess[0].title);
        }
        break;
      case 'download':
        for (const it of itemsToProcess) {
          if (it.kind === 'file') {
            try {
              const res = await filesService.downloadFile(it.id);
              const url = res.data.file?.file_url || res.data.download_url;
              if (url) window.open(url, '_blank');
            } catch (err) { console.error(err); }
          } else if (it.kind === 'document') {
            const attachment = it.attachments?.[0];
            const url = attachment?.file_url || attachment?.file;
            if (url) window.open(url, '_blank');
          }
        }
        break;
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
        if (item.kind === 'file') {
          await filesService.deleteFile(item.id);
        } else if (item.kind === 'folder') {
          await filesService.deleteFolder(currentWorkspace.id, item.id);
        } else if (item.kind === 'document') {
          await wikiService.deleteDocument(currentWorkspace.id, String(item.id));
        }
      }
      fetchFolders(currentFolderId || undefined);
      fetchDocuments();
      setSelectedIds([]);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };


  return (
    <div className="p-6 space-y-8 bg-muted min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wiki - {currentWorkspace?.name || 'Loading...'}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage workspace documents and browse template marketplace
        </p>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-3 rounded-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors text-primary"
            >
              <X size={18} />
            </button>
            <span className="font-semibold text-primary">{selectedIds.length} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('download')}
              className="p-2 hover:bg-primary/20 rounded-lg transition-colors text-primary"
              title="Download selected"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => handleAction('delete')}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
              title="Delete selected"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="inline-flex rounded-lg bg-background p-1 border shadow-sm">
        <button
          onClick={() => setActiveTab("docs")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all",
            activeTab === "docs"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          My Documents
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
            activeTab === "templates"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
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
          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="text-primary hover:underline"
                  >
                    {crumb.name}
                  </button>
                  {index < breadcrumbs.length - 1 && <span className="text-muted-foreground">/</span>}
                </div>
              ))}
            </div>
          )}
          {/* Folders & Files Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFolders(!showFolders)}
                className="flex items-center gap-2 text-xl font-semibold text-foreground group"
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    !showFolders && "-rotate-90"
                  )}
                />
                Folders & Files <span className="text-primary text-base font-normal ml-1">{folders.length + files.length}</span>
              </button>

              <div className="flex items-center gap-2">
                <button onClick={() => setOpenFolder(true)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="New folder">
                  <FolderPlus className="h-4 w-4 text-muted-foreground" />
                </button>
                <button onClick={() => setOpenFile(true)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Upload file">
                  <FilePlus className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {showFolders && currentFolderId === null && (
              <div className="space-y-4">
                <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border w-fit">
                  <button
                    onClick={() => setGridView(false)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      !gridView ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridView(true)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      gridView ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>

                {gridView ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                      className="flex items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground hover:bg-muted hover:border-primary transition-colors cursor-pointer group"
                      onClick={() => setOpenFolder(true)}
                    >
                      <CirclePlus className="h-5 w-5 group-hover:text-primary transition-colors" />
                      <span className="font-medium">Create New Folder</span>
                    </div>

                    <div
                      className="flex items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground hover:bg-muted hover:border-primary transition-colors cursor-pointer group"
                      onClick={() => setOpenFile(true)}
                    >
                      <CirclePlus className="h-5 w-5 group-hover:text-primary transition-colors" />
                      <span className="font-medium">Upload File</span>
                    </div>

                    {(searchQuery && searchQuery.length >= 2
                      ? folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      : folders
                    ).map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folderId={folder.id}
                        title={folder.name}
                        items={folder.item_count || 0}
                        contributors={folder.contributors}
                        view="grid"
                        isSelected={selectedIds.includes(String(folder.id))}
                        isRenaming={false} // Disable inline renaming
                        onRename={() => {
                          setItemToRename({ ...folder, id: String(folder.id), kind: 'folder' });
                          setRenameModalOpen(true);
                        }}
                        onSelect={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          const isMeta = e.ctrlKey || e.metaKey;
                          if (isMeta) {
                            setSelectedIds(v => v.includes(String(folder.id)) ? v.filter(id => id !== String(folder.id)) : [...v, String(folder.id)]);
                          }
                          // Otherwise do nothing for selection on card click
                        }}
                        onContextMenu={(e: React.MouseEvent) => {
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY, item: { ...folder, id: String(folder.id), kind: 'folder' } });
                        }}
                        onRenameSuccess={() => setRenamingItem(null)}
                        onOpen={() => handleOpenFolder(folder.id, folder.name)}
                        canEdit={canEditResource(folder)}
                      />
                    ))}

                    {files.map((file) => (
                      <FileCard
                        key={file.id}
                        fileId={file.id}
                        fileName={file.file_name}
                        url={file.file_url || file.file}
                        fileType={file.file_name.split('.').pop()?.toUpperCase() || 'FILE'}
                        uploadedAt={new Date(file.uploaded_at).toLocaleDateString()}
                        isSelected={selectedIds.includes(String(file.id))}
                        isRenaming={false}
                        onRenameSuccess={() => setRenamingItem(null)}
                        onRename={() => {
                          setItemToRename({ ...file, id: String(file.id), kind: 'file' });
                          setRenameModalOpen(true);
                        }}
                        onSelect={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          const isMeta = e.ctrlKey || e.metaKey;
                          if (isMeta) {
                            setSelectedIds(v => v.includes(String(file.id)) ? v.filter(id => id !== String(file.id)) : [...v, String(file.id)]);
                          }
                          // Otherwise do nothing for selection on card click
                        }}
                        onContextMenu={(e: React.MouseEvent) => {
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY, item: { ...file, id: String(file.id), kind: 'file' } });
                        }}
                        owner={file.uploaded_by_user?.first_name ? `${file.uploaded_by_user.first_name} ${file.uploaded_by_user.last_name || ''}` : file.uploaded_by_user?.email || 'Nth'}
                        uploaded_by_user={file.uploaded_by_user}
                        ownerAvatar={file.uploaded_by_user?.avatar}
                        fileSize={file.file_size}
                        view="grid"
                        canEdit={canEditResource(file)}
                      />
                    ))}
                  </div>
                ) : (
                  <WikiTableView
                    selectedIds={selectedIds}
                    renamingItemId={renamingItem || undefined}
                    onSelectionChange={setSelectedIds}
                    onContextMenu={(e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item })}
                    onRenameSuccess={() => setRenamingItem(null)}
                    sections={[{
                      label: "Folders & Files",
                      count: folders.length + files.length,
                      items: [
                        ...(searchQuery && searchQuery.length >= 2
                          ? folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          : folders
                        ).map(folder => {
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
                            onRename: () => {
                              setItemToRename({ ...folder, id: String(folder.id), kind: 'folder' });
                              setRenameModalOpen(true);
                            },
                          };
                        }),
                        ...files.map(file => ({
                          id: String(file.id),
                          kind: "file" as const,
                          name: file.file_name,
                          url: file.file_url || file.file,
                          modifiedAt: file.uploaded_at ? formatDistanceToNow(new Date(file.uploaded_at), { addSuffix: true }) : "–",
                          size: file.file_size,
                          owner: file.uploaded_by_user,
                          members: file.uploaded_by_user ? [file.uploaded_by_user] : [],
                          onRename: () => {
                            setItemToRename({ ...file, id: String(file.id), kind: 'file' });
                            setRenameModalOpen(true);
                          },
                          onDownload: () => handleAction('download', { ...file, kind: 'file' }),
                        })),
                      ],
                    }]}
                  />
                )}
              </div>
            )}
            {showFolders && currentFolderId !== null && (
              <WikiTableView
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onContextMenu={(e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item })}
                onRenameSuccess={() => setRenamingItem(null)}
                sections={[{
                  label: "Folders & Files",
                  count: folders.length + files.length,
                  items: [
                    ...folders.map(folder => {
                      const stats = getFolderStats(folder.id);
                      return {
                        id: folder.id,
                        kind: "folder" as const,
                        name: folder.name,
                        modifiedAt: stats.lastModified,
                        size: stats.totalSize,
                        owner: stats.owner,
                        members: stats.members,
                        itemCount: folder.item_count || 0,
                        onOpen: () => handleOpenFolder(folder.id, folder.name),
                        onRename: () => {
                          setItemToRename({ ...folder, id: String(folder.id), kind: 'folder' });
                          setRenameModalOpen(true);
                        },
                        onDownload: () => handleAction('download', { ...folder, kind: 'folder' }),
                      };
                    }),
                    ...files.map(file => ({
                      id: file.id,
                      kind: "file" as const,
                      name: file.file_name,
                      url: file.file_url || file.file,
                      modifiedAt: file.uploaded_at ? formatDistanceToNow(new Date(file.uploaded_at), { addSuffix: true }) : "–",
                      size: file.file_size,
                      owner: file.uploaded_by_user,
                      members: file.uploaded_by_user ? [file.uploaded_by_user] : [],
                      onRename: () => {
                        setItemToRename({ ...file, id: String(file.id), kind: 'file' });
                        setRenameModalOpen(true);
                      },
                    })),
                  ],
                }]}
              />
            )}
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDocuments(!showDocuments)}
                className="flex items-center gap-2 text-xl font-semibold text-foreground group"
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    !showDocuments && "-rotate-90"
                  )}
                />
                Documents <span className="text-primary text-base font-normal ml-1">{documents.length}</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border">
                  <button
                    onClick={() => setGridView(false)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      !gridView ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridView(true)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      gridView ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {showDocuments && (
              <>
                {gridView ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                      className="flex items-center justify-center gap-3 rounded-3xl min-h-[260px] bg-card border border-dashed border-border text-sm text-muted-foreground hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer group"
                      onClick={() => setOpen(true)}
                    >
                      <CirclePlus className="h-5 w-5 group-hover:text-primary transition-colors" />
                      <span className="font-medium">Upload New Document</span>
                    </div>

                    {(searchQuery && searchQuery.length >= 2
                      ? documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      : documents
                    ).map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        cover={doc.image || Images.banner}
                        title={doc.title}
                        time={doc.time}
                        fileType={doc.type}
                        user={doc.author}
                        view="grid"
                        isRenaming={false} // Disable inline renaming
                        onOpen={() => handleAction('view' as any, { ...doc, kind: 'document' })}
                        onContextMenu={(e) => {
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            item: {
                              id: String(doc.id),
                              kind: 'document',
                              name: doc.title,
                              size: doc.size,
                              owner: doc.author,
                              members: doc.author ? [doc.author] : [],
                              attachments: doc.attachments,
                              onRename: () => {
                                setItemToRename({ ...doc, id: String(doc.id), kind: 'document' });
                                setRenameModalOpen(true);
                              }
                            }
                          });
                        }}
                        canEdit={canEditResource(doc)}
                      />
                    ))}
                  </div>
                ) : (
                  <WikiTableView
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    renamingItemId={renamingItem}
                    onRenameSuccess={() => setRenamingItem(null)}
                    onContextMenu={(e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item })}
                    sections={[{
                      label: "Documents",
                      count: documents.length,
                      items: (searchQuery && searchQuery.length >= 2
                        ? documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        : documents
                      ).map(doc => ({
                        id: String(doc.id),
                        kind: "document" as const,
                        name: doc.title,
                        modifiedAt: doc.time,
                        size: doc.size,
                        owner: doc.author,
                        members: doc.author ? [doc.author] : [],
                        url: doc.image,
                        onDownload: () => handleAction('download', { ...doc, kind: 'document' }),
                        attachments: doc.attachments,
                        onRename: () => {
                          setItemToRename({ ...doc, kind: 'document' });
                          setRenameModalOpen(true);
                        },
                        onDelete: () => handleAction('delete', { ...doc, kind: 'document' }),
                      })),
                    }]}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )
      }

      <AddNewDocumentModal
        open={open}
        onClose={() => setOpen(false)}
        folderId={currentFolderId || undefined}
        onDocumentCreated={() => fetchDocuments()}
      />
      <AddNewFolderModal
        open={openFolder}
        onClose={() => setOpenFolder(false)}
        parentFolderId={currentFolderId || undefined}
        onFolderCreated={() => fetchFolders(currentFolderId || undefined)}
      />
      <UploadFileModal
        open={openFile}
        onClose={() => setOpenFile(false)}
        folderId={currentFolderId || undefined}
        onUploaded={() => fetchFolders(currentFolderId || undefined)}
      />

      {
        contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            kind={contextMenu.item.kind}
            onClose={() => setContextMenu(null)}
            onOpen={contextMenu.item.kind === 'folder' ? () => handleAction('open', contextMenu.item) : undefined}
            onDownload={(contextMenu.item.kind === 'file' || contextMenu.item.kind === 'document') ? () => handleAction('download', contextMenu.item) : undefined}
            canDelete={canEditResource(contextMenu.item)}
            canRename={canEditResource(contextMenu.item)}
            onDelete={() => handleAction('delete', contextMenu.item)}
            onRename={() => {
              setItemToRename(contextMenu.item);
              setRenameModalOpen(true);
              setContextMenu(null);
            }}
          />
        )
      }

      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, items: [] })}
        onConfirm={confirmDelete}
        title={deleteModal.items[0]?.name || deleteModal.items[0]?.title || "Items"}
        count={deleteModal.items.length}
      />
      <RenameModal
        open={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false);
          setItemToRename(null);
        }}
        onConfirm={handleRenameConfirm}
        initialName={itemToRename?.name || itemToRename?.title || itemToRename?.file_name || ""}
        title={`Rename ${itemToRename?.kind || 'Item'}`}
      />
    </div >
  );
}

export default function ProjectWikiPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Loading wiki...</div>}>
      <WikiPageContent />
    </Suspense>
  );
}
