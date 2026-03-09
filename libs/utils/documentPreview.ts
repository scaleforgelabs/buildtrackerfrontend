const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp"];
const PDF_TYPE = "application/pdf";

const FILE_ICON_MAP: Record<string, string> = {
    "application/pdf": "/images/pdf_icon.svg",
    "application/msword": "/images/doc_icon.svg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "/images/docx_icon.svg",
    "application/vnd.ms-excel": "/images/xls_icon.svg",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "/images/xls_icon.svg",
    "application/vnd.ms-powerpoint": "/images/ppt_icon.svg",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "/images/pptx_icon.svg",
    "text/plain": "/images/txt_icon.svg",
    "text/csv": "/images/csv_icon.svg",
    "image/png": "/images/png_icon.svg",
    "image/jpeg": "/images/jpg_icon.svg",
    "image/gif": "/images/gif_icon.svg",
    "image/webp": "/images/webp_icon.svg",
    "image/svg+xml": "/images/svg_icon.svg",
    "application/zip": "/images/zip_icon.svg",
    "application/x-rar-compressed": "/images/zip_icon.svg",
    "video/mp4": "/images/mp4_icon.svg",
    "audio/mpeg": "/images/mp3_icon.svg",
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

async function renderPdfFirstPage(file: File): Promise<string> {
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob ? URL.createObjectURL(blob) : "/images/pdf_icon.svg");
        }, "image/jpeg", 0.85);
    });
}

export async function generateDocumentPreview(file: File): Promise<string> {
    if (IMAGE_TYPES.includes(file.type)) {
        return URL.createObjectURL(file);
    }

    if (file.type === PDF_TYPE) {
        try {
            return await renderPdfFirstPage(file);
        } catch {
            return "/images/pdf_icon.svg";
        }
    }

    const fromMime = FILE_ICON_MAP[file.type];
    if (fromMime) return fromMime;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    return EXT_ICON_MAP[ext] ?? "/images/doc_icon.svg";
}

export function getFileTypeName(file: File): string {
    const ext = file.name.split(".").pop()?.toUpperCase();
    return ext ?? "DOC";
}
