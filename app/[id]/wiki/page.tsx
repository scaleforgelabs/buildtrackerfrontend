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
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/libs/utils"
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

type Folder = {
  id: string;
  name: string;
  created_by_user?: { avatar?: string };
};

type FileItem = {
  id: string;
  file_name: string;
  uploaded_at: string;
  file_size?: number;
  uploaded_by_user?: { first_name: string; last_name: string; email: string; avatar?: string };
};


const EXT_ICON_MAP: Record<string, string> = {
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

function getDocCover(d: any): string {
  if (d.image) return d.image;
  const firstName = (d.attachments as any[])?.find((a: any) => a.file_name)?.file_name ?? "";
  const ext = firstName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_ICON_MAP[ext] ?? "";
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
};

function WikiPageContent() {
  const [activeTab, setActiveTab] = useState<"docs" | "templates">("docs");
  const [showFolders, setShowFolders] = useState(true);
  const [showDocuments, setShowDocuments] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [open, setOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folderFiles, setFolderFiles] = useState<{ [key: string]: FileItem[] }>({});
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null; name: string }>>([{ id: null, name: 'Root' }]);
  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [documents, setDocuments] = useState<Doc[]>([]);

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

      const filesMap: { [key: string]: FileItem[] } = {};
      for (const folder of folders) {
        const folderRes = await filesService.getFolderContents(currentWorkspace?.id!, folder.id);
        filesMap[folder.id] = folderRes.data.files || [];
      }
      setFolderFiles(filesMap);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const getFolderStats = (folderId: string) => {
    const filesInFolder = folderFiles[folderId] || [];
    let totalSize = 0;
    let lastModified: Date | null = null;
    const membersMap = new Map<string, { avatar?: string; name: string }>();

    for (const file of filesInFolder) {
      totalSize += file.file_size || 0;
      const fileDate = new Date(file.uploaded_at);
      if (!lastModified || fileDate > lastModified) {
        lastModified = fileDate;
      }
      if (file.uploaded_by_user) {
        const name = `${file.uploaded_by_user.first_name} ${file.uploaded_by_user.last_name}`.trim() || file.uploaded_by_user.email;
        membersMap.set(file.uploaded_by_user.email, {
          avatar: file.uploaded_by_user.avatar,
          name: name
        });
      }
    }

    const membersList = Array.from(membersMap.values());

    return {
      totalSize,
      lastModified: lastModified ? lastModified.toLocaleDateString() : "–",
      members: membersList.map(m => ({ avatar: m.avatar })),
      // Use the first person who uploaded a file as owner, fallback to folder creator if possible
      owner: membersList[0] || (folders.find(f => f.id === folderId)?.created_by_user ? { avatar: folders.find(f => f.id === folderId)?.created_by_user?.avatar, name: "Folder Creator" } : undefined)
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
  };

  return (
    <div className="p-6 space-y-8 bg-muted min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wiki - {currentWorkspace?.name || 'Loading...'}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage workspace documents and browse template marketplace
        </p>
      </div>

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
                        items={folderFiles[folder.id]?.length || 0}
                        avatars={[folder.created_by_user?.avatar].filter((a): a is string => Boolean(a))}
                        view="grid"
                        onOpen={() => handleOpenFolder(folder.id, folder.name)}
                        onRename={() => fetchFolders(currentFolderId || undefined)}
                      />
                    ))}

                    {files.map((file) => (
                      <FileCard
                        key={file.id}
                        fileId={file.id}
                        fileName={file.file_name}
                        fileType={file.file_name.split('.').pop()?.toUpperCase() || 'FILE'}
                        uploadedAt={new Date(file.uploaded_at).toLocaleDateString()}
                        owner={file.uploaded_by_user
                          ? `${file.uploaded_by_user.first_name} ${file.uploaded_by_user.last_name}`.trim() || file.uploaded_by_user.email
                          : 'Unknown'}
                        ownerAvatar={file.uploaded_by_user?.avatar}
                        fileSize={file.file_size}
                        view="grid"
                        onRename={() => fetchFolders(currentFolderId || undefined)}
                      />
                    ))}
                  </div>
                ) : (
                  <WikiTableView
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
                            id: folder.id,
                            kind: "folder" as const,
                            name: folder.name,
                            modifiedAt: stats.lastModified,
                            size: stats.totalSize,
                            owner: stats.owner,
                            members: stats.members,
                            itemCount: folderFiles[folder.id]?.length || 0,
                            onOpen: () => handleOpenFolder(folder.id, folder.name),
                            onRename: () => fetchFolders(currentFolderId || undefined),
                          };
                        }),
                        ...files.map(file => ({
                          id: file.id,
                          kind: "file" as const,
                          name: file.file_name,
                          modifiedAt: new Date(file.uploaded_at).toLocaleDateString(),
                          size: file.file_size,
                          owner: file.uploaded_by_user,
                          members: file.uploaded_by_user ? [{ avatar: file.uploaded_by_user.avatar }] : [],
                          onRename: () => fetchFolders(currentFolderId || undefined),
                        })),
                      ],
                    }]}
                  />
                )}
              </div>
            )}
            {showFolders && currentFolderId !== null && (
              <WikiTableView
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
                        itemCount: folderFiles[folder.id]?.length || 0,
                        onOpen: () => handleOpenFolder(folder.id, folder.name),
                        onRename: () => fetchFolders(currentFolderId || undefined),
                      };
                    }),
                    ...files.map(file => ({
                      id: file.id,
                      kind: "file" as const,
                      name: file.file_name,
                      modifiedAt: new Date(file.uploaded_at).toLocaleDateString(),
                      size: file.file_size,
                      owner: file.uploaded_by_user,
                      members: file.uploaded_by_user ? [{ avatar: file.uploaded_by_user.avatar }] : [],
                      onRename: () => fetchFolders(currentFolderId || undefined),
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
                      />
                    ))}
                  </div>
                ) : (
                  <WikiTableView
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
                        members: doc.author ? [{ avatar: doc.author?.avatar }] : [],
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
