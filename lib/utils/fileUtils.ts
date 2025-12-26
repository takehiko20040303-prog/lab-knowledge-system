/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Validate file size
 * @param file - File object to validate
 * @param maxSizeKB - Maximum size in KB (default: 500KB)
 * @returns True if file size is valid
 */
export function validateFileSize(file: File, maxSizeKB: number = 500): boolean {
  const maxBytes = maxSizeKB * 1024;
  return file.size <= maxBytes;
}

/**
 * Get file extension from filename
 * @param filename - File name
 * @returns File extension (without dot)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file type is an image
 * @param mimeType - MIME type string
 * @returns True if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file type is a document
 * @param mimeType - MIME type string
 * @returns True if file is a document (PDF, Word, Excel, etc.)
 */
export function isDocumentFile(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  return documentTypes.includes(mimeType);
}

/**
 * Convert file to Base64 string
 * @param file - File object to convert
 * @returns Promise resolving to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to Base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Download a file from Base64 data
 * @param base64Data - Base64 encoded file data
 * @param filename - Name for the downloaded file
 */
export function downloadBase64File(base64Data: string, filename: string): void {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
