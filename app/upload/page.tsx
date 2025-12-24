'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AttachedFile } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import FileUploader from '@/components/files/FileUploader';

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<AttachedFile[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;

    if (uploadedFiles.length === 0) {
      alert('少なくとも1つのファイルをアップロードしてください');
      return;
    }

    setSaving(true);

    try {
      console.log('=== 保存開始 ===');
      console.log('アップロード済みファイル数:', uploadedFiles.length);

      // 各ファイルのサイズをログ出力
      uploadedFiles.forEach((file, index) => {
        const base64Size = file.fileUrl ? file.fileUrl.length : 0;
        console.log(`ファイル${index + 1}: ${file.fileName}`);
        console.log(`  - 元のサイズ: ${(file.fileSize / 1024).toFixed(2)}KB`);
        console.log(`  - Base64サイズ: ${(base64Size / 1024).toFixed(2)}KB`);
      });

      // ドキュメント全体のサイズを計算（概算）
      const docData = {
        userId: user.uid,
        inputMode: 'upload',
        date: new Date().toISOString().split('T')[0],
        participants: null,
        todayGoal: title.trim() || 'ファイルアーカイブ',
        decisions: null,
        todos: null,
        problems: description.trim() || null,
        lastWeekActions: null,
        weeklySchedule: null,
        nextDeliverables: null,
        nextMeetingDate: null,
        nextMeetingGoal: null,
        midtermMilestones: null,
        finalMilestones: null,
        attachedFiles: uploadedFiles,
        tags: tags.length > 0 ? tags : null,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // ドキュメントサイズを概算（JSON文字列化）
      const docSize = new Blob([JSON.stringify(docData)]).size;
      const docSizeMB = (docSize / (1024 * 1024)).toFixed(2);
      const docSizeKB = (docSize / 1024).toFixed(2);

      console.log(`ドキュメント全体のサイズ: ${docSizeKB}KB (${docSizeMB}MB, ${docSize}バイト)`);

      if (docSize > 1048576) { // 1MB = 1048576バイト
        alert(`ドキュメントサイズが大きすぎます: ${docSizeMB}MB (${docSizeKB}KB)\n\nFirestoreの制限: 1MB以内\n\nより小さいファイルをアップロードしてください。`);
        setSaving(false);
        return;
      }

      console.log('Firestoreに保存開始...');
      // アーカイブとして保存（議事録形式で保存）
      const docRef = await addDoc(collection(db, 'minutes'), docData);
      console.log('保存成功！ドキュメントID:', docRef.id);

      alert('ファイルを保存しました！');
      router.push('/archives');
    } catch (error: any) {
      console.error('=== 保存エラー ===');
      console.error('エラーオブジェクト:', error);
      console.error('エラーメッセージ:', error.message);
      console.error('エラーコード:', error.code);
      console.error('エラースタック:', error.stack);

      let errorMsg = '保存に失敗しました\n\n';
      if (error.code) {
        errorMsg += `エラーコード: ${error.code}\n`;
      }
      if (error.message) {
        errorMsg += `詳細: ${error.message}\n`;
      }
      errorMsg += '\nブラウザのコンソール（F12）で詳細を確認してください。';

      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
          >
            ← ダッシュボードに戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900">ファイルアップロード</h1>
          <p className="text-gray-600 mt-2">
            研究資料、Word/PDF/Excelファイルなどをアップロード（最大500KB）
          </p>
          <p className="text-sm text-red-600 font-semibold mt-1">
            ⚠️ Firestore無料版のため、ファイルサイズは500KB以下に制限されています
          </p>
        </div>

        <div className="space-y-6">
          {/* タイトル */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              タイトル（任意）
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 卒業研究発表資料、実験データまとめ"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* 説明 */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              説明（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このファイルの内容や目的を説明してください"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* タグ */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              タグ（任意）
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="タグを入力してEnter（例: 研究発表、実験データ）"
                className="flex-1 p-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                追加
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(i)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ファイルアップロード */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-800 mb-1 flex items-center gap-2">
              📎 ファイルを選択
            </h3>
            <p className="text-sm text-purple-600 mb-4">
              Word、PDF、Excel、画像ファイルなど（最大500KB）
            </p>

            {user && (
              <FileUploader
                userId={user.uid}
                onFileUploaded={(file) => setUploadedFiles([...uploadedFiles, file])}
              />
            )}

            {/* アップロード済みファイル一覧 */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-purple-700 mb-3">
                  ✅ アップロード済みファイル ({uploadedFiles.length}件)
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200 shadow-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {file.fileType} • {(file.fileSize / 1024).toFixed(1)} KB
                        </p>
                        {file.description && (
                          <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
                        }
                        className="ml-3 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-6 py-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold text-lg"
              disabled={saving}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploadedFiles.length === 0}
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-bold text-lg"
            >
              {saving ? '保存中...' : 'アーカイブに保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
