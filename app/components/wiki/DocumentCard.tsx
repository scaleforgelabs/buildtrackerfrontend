import UserAvatar from "../ui/UserAvatar";
import Image, { StaticImageData } from "next/image";
import { Clock, MoreVertical } from "lucide-react";
import { Images } from "@/public";

const FILE_ICONS = [
  "/images/pdf_icon.svg", "/images/doc_icon.svg", "/images/docx_icon.svg",
  "/images/xls_icon.svg", "/images/ppt_icon.svg", "/images/pptx_icon.svg",
  "/images/png_icon.svg", "/images/jpg_icon.svg", "/images/jpeg_icon.svg",
  "/images/gif_icon.svg", "/images/webp_icon.svg", "/images/svg_icon.svg",
  "/images/txt_icon.svg", "/images/csv_icon.svg", "/images/zip_icon.svg",
  "/images/mp4_icon.svg", "/images/mp3_icon.svg",
];

function isFileIcon(src: string | StaticImageData): boolean {
  return typeof src === "string" && FILE_ICONS.some(icon => src.endsWith(icon));
}

type DocumentCardProps = {
  cover: string | StaticImageData;
  title: string;
  time: string;
  fileType: string;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar?: string;
    name?: string;
  };
  view?: "grid" | "list";
};

export function DocumentCard({
  cover,
  title,
  time,
  fileType,
  user,
  view = "grid",
}: DocumentCardProps) {
  if (view === "list") {
    return (
      <div className="relative h-[82px] w-full rounded-xl overflow-hidden bg-card shadow-sm border flex items-center">
        {/* Cover Image - Left side */}
        <div className="relative h-full w-[120px] flex-shrink-0 bg-muted">
          {isFileIcon(cover) ? (
            <div className="flex h-full w-full items-center justify-center">
              <Image src={cover as string} alt={title} width={48} height={48} unoptimized />
            </div>
          ) : (
            <Image src={cover} alt={title} fill className="object-cover" unoptimized />
          )}
        </div>

        {/* Content - Right side */}
        <div className="flex-1 flex items-center justify-between px-4 py-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <UserAvatar user={user} size={32} />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="h-3 w-3 rounded-full bg-primary" />
              {fileType}
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="relative h-[260px] w-full rounded-[24px] overflow-hidden bg-card shadow-sm">
      {/* Cover Image - Full height */}
      <div className="absolute inset-0 bg-muted">
        {isFileIcon(cover) ? (
          <div className="flex h-full w-full items-center justify-center">
            <Image src={cover as string} alt={title} width={80} height={80} unoptimized />
          </div>
        ) : (
          <Image src={cover} alt={title} fill className="object-cover" unoptimized />
        )}
      </div>

      {/* Overlay Sheet */}
      <div className="absolute bottom-0 left-0 right-0 h-fit">
        <div className="relative w-full h-fit">
          {/* Background Image for Sheet */}
          <div className="absolute inset-0 z-0 h-full">
            <Image
              src={Images.documentCover}
              alt=""
              fill
              className="object-cover object-top"
            />
          </div>

          <div className="relative z-10 px-4 pt-4 pb-3">
            {/* Floating menu */}
            <button className="absolute right-7 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow">
              <MoreVertical className="h-6 w-6 text-muted-foreground" />
            </button>

            {/* Time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>

            {/* Title */}
            <h3 className="mt-2 text-lg text-black">
              {title}
            </h3>

            {/* Divider */}
            <div className="my-3 h-px bg-border" />

            {/* Footer */}
            <div className="flex items-center justify-between">
              <UserAvatar user={user} size={32} />

              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="h-3 w-3 rounded-full bg-primary" />
                {fileType}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
