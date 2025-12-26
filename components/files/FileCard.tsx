'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface FileCardProps {
  file: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    description?: string;
    minuteId: string;
    minuteDate: string;
    minuteGoal: string;
  };
  onDelete: (minuteId: string, minuteGoal: string) => void;
}

/**
 * Memoized file card component for displaying file information
 * Used in archive views to prevent unnecessary re-renders
 */
const FileCard: React.FC<FileCardProps> = React.memo(({ file, onDelete }) => {
  const router = useRouter();

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'video': return '🎥';
      case 'pdf': return '📕';
      case 'docx': return '📘';
      case 'xlsx': return '📗';
      case 'pptx': return '📙';
      case 'image': return '🖼️';
      default: return '📄';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">
          {getFileIcon(file.fileType)}
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {file.fileType.toUpperCase()}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{file.fileName}</h3>
      {file.description && (
        <p className="text-sm text-gray-600 mb-2">{file.description}</p>
      )}
      <div className="text-xs text-gray-500 mb-3">
        <p>{(file.fileSize / 1024).toFixed(1)} KB</p>
        <p>{file.minuteDate}</p>
      </div>
      <div className="flex gap-2">
        <a
          href={file.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          開く
        </a>
        <button
          onClick={() => router.push(`/minutes/${file.minuteId}`)}
          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
        >
          議事録
        </button>
        <button
          onClick={() => onDelete(file.minuteId, file.minuteGoal || file.fileName)}
          className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          title="削除"
        >
          🗑️
        </button>
      </div>
    </div>
  );
});

FileCard.displayName = 'FileCard';

export default FileCard;
