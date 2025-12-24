'use client';

import { useState } from 'react';
import { AttachedFile } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface FileUploaderProps {
  userId: string;
  onFileUploaded: (file: AttachedFile) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export default function FileUploader({
  userId,
  onFileUploaded,
  acceptedTypes = '.pdf,.docx,.xlsx,.pptx,.txt,.png,.jpg,.jpeg',
  maxSizeMB = 0.5, // Firestore制限のため500KBに変更（Base64化後も余裕を持って1MB以内）
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeInKB = Math.round(maxSizeMB * 1024);
      alert(`ファイルサイズは${sizeInKB}KB以下にしてください\n（Firestore無料版の制限：Base64化後1MB以内）`);
      return;
    }

    setSelectedFile(file);
    setDescription('');
  };

  const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const typeMap: { [key: string]: string } = {
      pdf: 'pdf',
      doc: 'docx',
      docx: 'docx',
      xls: 'xlsx',
      xlsx: 'xlsx',
      ppt: 'pptx',
      pptx: 'pptx',
      txt: 'txt',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      gif: 'image',
    };
    return typeMap[ext] || 'other';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('ファイルを選択してください');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // ファイルをBase64に変換
      setUploadProgress(30);
      const base64Data = await fileToBase64(selectedFile);

      setUploadProgress(60);
      const timestamp = Date.now();
      const fileName = selectedFile.name;

      const attachedFile: AttachedFile = {
        id: `file_${timestamp}`,
        fileName: fileName,
        fileType: getFileType(fileName),
        fileSize: selectedFile.size,
        fileUrl: base64Data, // Base64データを直接保存
        storagePath: `firestore/${userId}/${timestamp}_${fileName}`, // 参照用
        uploadedBy: userId,
        uploadedAt: Timestamp.now(),
        description: description.trim() || null,
      };

      setUploadProgress(90);

      onFileUploaded(attachedFile);

      setUploadProgress(100);

      // リセット
      setTimeout(() => {
        setSelectedFile(null);
        setDescription('');
        setUploadProgress(0);
        setUploading(false);
        alert('アップロードが完了しました！');
      }, 500);

    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDescription('');
    setUploadProgress(0);
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <h4 className="font-bold text-gray-700 mb-4">📎 ファイルをアップロード</h4>
      <p className="text-xs text-red-600 font-semibold mb-3">
        ⚠️ 重要：最大500KBまで（Firestore無料版の制限）
      </p>
      <p className="text-xs text-gray-500 mb-3">
        💡 ヒント：PDFは圧縮、Wordは画像を減らすと小さくなります
      </p>

      {!selectedFile ? (
        <div>
          <label className="block">
            <div className="flex items-center justify-center w-full h-32 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <div className="text-center">
                <p className="text-gray-600 mb-2">📁 ファイルを選択</p>
                <p className="text-xs text-gray-500">
                  Word, PDF, Excel, PowerPoint, 画像
                </p>
                <p className="text-xs text-red-600 font-semibold">
                  最大500KB
                </p>
              </div>
            </div>
            <input
              type="file"
              onChange={handleFileSelect}
              accept={acceptedTypes}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div>
          {/* 選択されたファイル情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-semibold text-blue-900">{selectedFile.name}</p>
                <p className="text-sm text-blue-700">
                  {getFileType(selectedFile.name)} • {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-800 text-sm font-semibold"
                disabled={uploading}
              >
                ✕ キャンセル
              </button>
            </div>

            {/* ファイルの説明（オプション） */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明（オプション）
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="このファイルの説明を入力..."
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              />
            </div>
          </div>

          {/* アップロード進捗 */}
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>処理中...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* アップロードボタン */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full py-3 rounded-lg font-semibold ${
              uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {uploading ? `処理中... ${uploadProgress}%` : '📤 アップロード'}
          </button>
        </div>
      )}
    </div>
  );
}
