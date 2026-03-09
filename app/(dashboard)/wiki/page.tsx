"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderPlus,
  LayoutGrid,
  List,
  ListChecks,
  CirclePlus,
  ChevronDown,
  FilePlus,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/libs/utils";

import { FolderCard } from "@/app/components/wiki/FolderCard";
import { DocumentCard } from "@/app/components/wiki/DocumentCard";
import { Images } from "@/public";
import AddNewDocumentModal from "@/app/components/wiki/modal/AddNewDocumentModal";
import AddNewFolderModal from "@/app/components/wiki/modal/AddNewFolder";
import { wikiService } from "@/libs/api/services";
import { useWorkspace } from "@/libs/hooks/useWorkspace";

type Folder = {
  id: number;
  name: string;
  items: number;
};

type WikiDocument = {
  id: string;
  document_title: string;
  document_description?: string;
  visibility: string;
  author?: { email: string; first_name: string; last_name: string; avatar?: string };
  created_at: string;
  updated_at: string;
};

const folders: Folder[] = [
  { id: 1, name: "Product Brief", items: 3 },
  { id: 2, name: "Brand File", items: 3 },
  { id: 3, name: "MVP Document", items: 3 },
  { id: 4, name: "Company Docs", items: 3 },
  { id: 5, name: "Development Docs", items: 3 },
  { id: 6, name: "Registration", items: 3 },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ProjectWikiPage() {
  const { currentWorkspace } = useWorkspace();

  const [activeTab, setActiveTab] = useState<"docs" | "templates">("docs");
  const [showFolders, setShowFolders] = useState(true);
  const [showDocuments, setShowDocuments] = useState(true);
  const [gridView, setGridView] = useState(true);

  const [open, setOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);

  const [documents, setDocuments] = useState<WikiDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoadingDocs(true);
    try {
      const res = await wikiService.getDocuments(currentWorkspace.id);
      const data = res.data;
      setDocuments(Array.isArray(data) ? data : data.results ?? data.documents ?? []);
    } catch (err) {
      console.error("Failed to fetch wiki documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDocumentCreated = () => {
    fetchDocuments();
  };

  return (
    <div className="p-6 space-y-8 bg-muted min-h-screen">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Wiki</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage workspace documents and browse template marketplace
        </p>
      </div>

      {/* Tabs */}
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
          {/* Folders Section */}
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
                Folders <span className="text-primary text-base font-normal ml-1">{folders.length}</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <FolderPlus className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border">
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
              </div>
            </div>

            {showFolders && (
              <div
                className={cn(
                  "gap-4",
                  gridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "flex flex-col"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground hover:bg-muted hover:border-primary transition-colors cursor-pointer group",
                    gridView ? "gap-3 p-6" : "h-[82px] w-full gap-2 p-4"
                  )}
                  onClick={() => setOpenFolder(true)}
                >
                  <CirclePlus className="h-5 w-5 group-hover:text-primary transition-colors" />
                  <span className="font-medium">Create New Folder</span>
                </div>

                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folderId={folder.id.toString()}
                    title={folder.name}
                    items={folder.items}
                    avatars={["/images/avatar.jpg", "/images/avatar.jpg"]}
                    view={gridView ? "grid" : "list"}
                  />
                ))}
              </div>
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
                Documents{" "}
                <span className="text-primary text-base font-normal ml-1">{documents.length}</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <FilePlus className="h-4 w-4 text-muted-foreground" />
                  </button>
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
              <div
                className={cn(
                  "gap-4",
                  gridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "flex flex-col"
                )}
              >
                {/* Upload trigger */}
                <div
                  className={cn(
                    "flex items-center justify-center bg-card border border-dashed border-border text-sm text-muted-foreground hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer group",
                    gridView ? "gap-3 rounded-[24px] min-h-[260px]" : "h-[82px] w-full gap-2 p-4 rounded-xl"
                  )}
                  onClick={() => setOpen(true)}
                >
                  <CirclePlus className="h-5 w-5 group-hover:text-primary transition-colors" />
                  <span className="font-medium">Upload New Document</span>
                </div>

                {loadingDocs ? (
                  <div className="flex items-center justify-center col-span-full py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                    No documents yet. Upload your first document.
                  </div>
                ) : (
                  documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      cover={Images.banner}
                      title={doc.document_title}
                      time={timeAgo(doc.updated_at)}
                      fileType="DOC"
                      avatar={doc.author?.avatar ?? "/images/avatar.jpg"}
                      view={gridView ? "grid" : "list"}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <AddNewDocumentModal
        open={open}
        onClose={() => setOpen(false)}
        onDocumentCreated={handleDocumentCreated}
      />
      <AddNewFolderModal open={openFolder} onClose={() => setOpenFolder(false)} />
    </div>
  );
}
