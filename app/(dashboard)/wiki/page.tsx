"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FolderPlus,
  Upload,
  LayoutGrid,
  List,
  MoreVertical,
  ListChecks,
  CirclePlus,
  ChevronDown,
  FilePlus,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/libs/utils";

import { FolderCard } from "@/app/components/wiki/FolderCard";
import { DocumentCard } from "@/app/components/wiki/DocumentCard";
import { Images } from "@/public";
import AddNewDocumentModal from "@/app/components/wiki/modal/AddNewDocumentModal";
import AddNewFolderModal from "@/app/components/wiki/modal/AddNewFolder";

type Folder = {
  id: number;
  name: string;
  size: number;
  time: string;
  owner: string;
  members: number;
};

type Doc = {
  id: number;
  title: string;
  type: string;
  time: string;
  size: string;
  owner: string;
  members: number;
};

const folders: Folder[] = [
  {
    id: 1,
    name: "Product Brief",
    size: 0,
    time: "Mar 28, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 2,
    name: "Brand File",
    size: 0,
    time: "Mar 15, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 3,
    name: "MVP Document",
    size: 0,
    time: "Mar 10, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 4,
    name: "Company Docs",
    size: 0,
    time: "Feb 20, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 5,
    name: "Development Docs",
    size: 0,
    time: "Feb 5, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 6,
    name: "Registration",
    size: 0,
    time: "Jan 30, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 3,
    name: "MVP Document",
    size: 0,
    time: "Mar 10, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 4,
    name: "Company Docs",
    size: 0,
    time: "Feb 20, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 5,
    name: "Development Docs",
    size: 0,
    time: "Feb 5, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 6,
    name: "Registration",
    size: 0,
    time: "Jan 30, 2024",
    owner: "Muaz Balogun",
    members: 3,
  },
];

const documents: Doc[] = [
  {
    id: 1,
    title: "Pain Research",
    type: "XSL",
    time: "35 min ago",
    size: "7 KB",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 2,
    title: "Scaleforge Business Idea",
    type: "PNG",
    time: "5 hours ago",
    size: "135 KB",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 3,
    title: "Interface Design",
    type: "JPEG",
    time: "Yesterday 2:20 pm",
    size: "16.5 MB",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 4,
    title: "Development Report",
    type: "DOC",
    time: "Jun 28, 2025",
    size: "99 KB",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 5,
    title: "Skills Empowerment",
    type: "PDF",
    time: "Apr 1, 2024",
    size: "2.4 MB",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 6,
    title: "Company Lead Database",
    type: "XLSX",
    time: "Aug 20, 2023",
    size: "57 KB",
    owner: "Muaz Balogun",
    members: 3,
  },
  {
    id: 7,
    title: "Video Instagram Idea",
    type: "MP4",
    time: "Mar 25, 2024",
    size: "—",
    owner: "Muaz Balogun",
    members: 3,
  },
];

// Function to get the right icon based on document type
const getDocumentIcon = (fileType: string) => {
  const type = fileType.toUpperCase();

  if (type === "XLS" || type === "XLSX" || type === "CSV") {
    return Images.xls_icon;
  }
  if (type === "DOC" || type === "DOCX") {
    return Images.docx_icon;
  }
  if (type === "PDF") {
    return Images.pdf_icon;
  }
  if (type === "PPT" || type === "PPTX") {
    return Images.pptx_icon;
  }

  // Default icon for other file types
  return Images.doc_icon;
};

export default function ProjectWikiPage() {
  const [activeTab, setActiveTab] = useState<"docs" | "templates">("docs");
  const [showFolders, setShowFolders] = useState(true);
  const [showDocuments, setShowDocuments] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [showMoreFolders, setShowMoreFolders] = useState(false);

  const [open, setOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);

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
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {/* Icon could be added here if needed */}
          My Documents
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
            activeTab === "templates"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ListChecks size={16} />
          Template Marketplace
        </button>
      </div>

      {/* Template section (EMPTY by requirement) */}
      {activeTab === "templates" && (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No templates available yet.
        </div>
      )}

      {activeTab === "docs" && (
        <div className="space-y-8">
          {/* Folders Section */}
          <div className="space-y-4">
            {/* Folders Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFolders(!showFolders)}
                className="flex items-center gap-2 text-xl font-semibold text-foreground group"
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    !showFolders && "-rotate-90",
                  )}
                />
                Folders{" "}
                <span className="text-primary text-base font-normal ml-1">
                  {folders.length}
                </span>
              </button>

              <div className="flex items-center gap-2">
                {/* Action Icons */}
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <FolderPlus className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border">
                  <button
                    onClick={() => setGridView(false)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      !gridView
                        ? "bg-white shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridView(true)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      gridView
                        ? "bg-white shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Folders List/Grid */}
            {showFolders && (
              <div className="space-y-3">
                {gridView ? (
                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Create Folder */}
                    <div
                      className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground hover:bg-muted hover:border-primary transition-colors cursor-pointer group gap-3 p-6"
                      onClick={() => setOpenFolder(true)}
                    >
                      <CirclePlus className="h-5 w-5 group-hover:text-primary transition-colors" />
                      <span className="font-medium">Create New Folder</span>
                    </div>

                    {folders
                      .slice(0, showMoreFolders ? folders.length : 6)
                      .map((folder) => (
                        <FolderCard
                          key={folder.id}
                          title={folder.name}
                          items={folder.items}
                          avatars={["/images/avatar.jpg", "/images/avatar.jpg"]}
                          view="grid"
                        />
                      ))}
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 border-b font-medium text-sm text-muted-foreground sticky top-0">
                      <div className="col-span-3">Name</div>
                      <div className="col-span-2">Last modified</div>
                      <div className="col-span-1">size</div>
                      <div className="col-span-3">Owner</div>
                      <div className="col-span-2">Member</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Table Rows */}
                    {folders
                      .slice(0, showMoreFolders ? folders.length : 6)
                      .map((folder) => (
                        <div
                          key={folder.id}
                          className="grid grid-cols-12 gap-4 px-6 py-4 border-b items-center hover:bg-muted transition-colors0"
                        >
                          {/* Name */}
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="w-10 h-10 flex-shrink-0">
                              <Image
                                src={Images.folder}
                                alt="folder"
                                width={40}
                                height={40}
                                className="w-full h-full"
                              />
                            </div>
                            <span className="text-md font-medium text-foreground truncate">
                              {folder.name}
                            </span>
                          </div>

                          {/* Last modified */}
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {folder.time}
                          </div>

                          {/* Items count */}
                          <div className="col-span-1 text-sm text-muted-foreground">
                            {folder.size || "-"}
                          </div>

                          {/* Owner */}
                          <div className="col-span-3 flex items-center gap-2">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white bg-orange-200">
                              <Image
                                src={Images.user}
                                alt={folder.owner}
                                fill
                                className="object-cover"
                                sizes="28px"
                              />
                            </div>

                            <span className="text-sm text-foreground">
                              {folder.owner}
                            </span>
                          </div>

                          {/* Members */}
                          <div className="col-span-2">
                            <div className="flex items-center -space-x-2">
                              {[...Array(folder.members)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-7 h-7 rounded-full bg-orange-200 border-1 border-white relative"
                                >
                                  <Image
                                    src={Images.user}
                                    alt={`Member ${i + 1}`}
                                    fill
                                    className="rounded-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 flex justify-end">
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Show More Folders Button */}
          {folders.length > 6 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowMoreFolders(!showMoreFolders)}
                className="px-6 py-2 rounded-lg border border-border bg-card text-foreground font-medium hover:bg-muted transition-colors"
              >
                {showMoreFolders ? "Show Less" : "Show More"}
              </button>
            </div>
          )}

          {/* Documents Section */}
          <div className="space-y-4">
            {/* Documents Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDocuments(!showDocuments)}
                className="flex items-center gap-2 text-xl font-semibold text-foreground group"
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    !showDocuments && "-rotate-90",
                  )}
                />
                Documents{" "}
                <span className="text-primary text-base font-normal ml-1">
                  {documents.length}
                </span>
              </button>

              <div className="flex items-center gap-2">
                {/* Action Icons */}
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <FilePlus className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border">
                  <button
                    onClick={() => setGridView(false)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      !gridView
                        ? "bg-card shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridView(true)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      gridView
                        ? "bg-card shadow-sm text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {showDocuments && (
              <div className="space-y-3">
                {gridView ? (
                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Upload Document */}
                    <div
                      className="flex items-center justify-center bg-card border border-dashed border-border text-sm text-muted-foreground hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer group gap-3 rounded-[24px] min-h-[260px]"
                      onClick={() => setOpen(true)}
                    >
                      <CirclePlus className="h-5 w-5 group-hover:text-primary transition-colors" />
                      <span className="font-medium">Upload New Document</span>
                    </div>

                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        cover={Images.banner}
                        title={doc.title}
                        time={doc.time}
                        fileType={doc.type}
                        avatar="/images/avatar.jpg"
                        view="grid"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b font-medium text-sm text-muted-foreground sticky top-0">
                      <div className="col-span-3">Name</div>
                      <div className="col-span-2">Last modified</div>
                      <div className="col-span-1">Size</div>
                      <div className="col-span-3">Owner</div>
                      <div className="col-span-2">Member</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Table Rows */}
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 border-b items-center hover:bg-muted/30 transition-colors last:border-b-0"
                      >
                        {/* Name */}
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0">
                            <Image
                              src={getDocumentIcon(doc.type)}
                              alt={doc.type}
                              width={40}
                              height={40}
                              className="w-full h-full"
                            />
                          </div>
                          <span className="text-md font-medium text-foreground truncate">
                            {doc.title}
                          </span>
                        </div>

                        {/* Last modified */}
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {doc.time}
                        </div>

                        {/* Size */}
                        <div className="col-span-1 text-sm text-muted-foreground">
                          {doc.size}
                        </div>

                        {/* Owner */}
                        <div className="col-span-3 flex items-center gap-2">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white bg-orange-200">
                            <Image
                              src={Images.user}
                              alt={doc.owner}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>

                          <span className="text-sm text-foreground">
                            {doc.owner}
                          </span>
                        </div>

                        {/* Members */}
                        <div className="col-span-2">
                          <div className="flex items-center -space-x-2">
                            {[...Array(doc.members)].map((_, i) => (
                              <div
                                key={i}
                                className="w-7 h-7 rounded-full bg-orange-200 border-2 border-white relative"
                              >
                                <Image
                                  src={Images.user}
                                  alt={`Member ${i + 1}`}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex justify-end">
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <AddNewDocumentModal open={open} onClose={() => setOpen(false)} />
      <AddNewFolderModal
        open={openFolder}
        onClose={() => setOpenFolder(false)}
      />
    </div>
  );
}
