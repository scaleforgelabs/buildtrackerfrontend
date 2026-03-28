import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import api from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function triggerAuthenticatedDownload(url: string, filename: string) {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Authenticated download failed", error);
    throw error;
  }
}

export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(ext)) {
    return 'https://img.icons8.com/color/48/image.png';
  }

  switch (ext) {
    case 'pdf': return 'https://img.icons8.com/color/48/pdf.png';
    case 'doc':
    case 'docx': return 'https://img.icons8.com/color/48/doc.png';
    case 'xls':
    case 'xlsx':
    case 'csv': return 'https://img.icons8.com/color/48/xls.png';
    case 'ppt':
    case 'pptx': return 'https://img.icons8.com/color/48/ppt.png';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz': return 'https://img.icons8.com/color/48/archive.png';
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm': return 'https://img.icons8.com/color/48/video.png';
    case 'mp3':
    case 'wav': return 'https://img.icons8.com/color/48/audio-file.png';
    case 'txt':
    case 'md':
    case 'rtf': return 'https://img.icons8.com/color/48/txt.png';
    case 'fig': return 'https://img.icons8.com/color/48/figma--v1.png';
    case 'sketch': return 'https://img.icons8.com/color/48/sketch.png';
    case 'psd': return 'https://img.icons8.com/color/48/adobe-photoshop--v1.png';
    case 'ai': return 'https://img.icons8.com/color/48/adobe-illustrator--v1.png';
    case 'xd': return 'https://img.icons8.com/color/48/adobe-xd--v1.png';
    default: return 'https://img.icons8.com/color/48/document--v1.png';
  }
}
