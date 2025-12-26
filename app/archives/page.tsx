'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Minute, AttachedFile } from '@/types';
import { useMinutes } from '@/lib/hooks/useMinutes';
import { getFiscalYear } from '@/lib/utils/dateUtils';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { SuccessBanner } from '@/components/common/SuccessBanner';
import VideoPlayer from '@/components/files/VideoPlayer';

export default function ArchivesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { minutes, loading: loadingData, error, deleteMinute: deleteMinuteHook } = useMinutes(user?.uid || null);
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'video' | 'pdf' | 'docx' | 'xlsx' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [groupByYear, setGroupByYear] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  /**
   * Delete a minute with confirmation
   */
  const handleDeleteMinute = async (minuteId: string, minuteGoal: string) => {
    if (!window.confirm(`「${minuteGoal}」を削除しますか？\n\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      await deleteMinuteHook(minuteId);
      setSuccessMessage('削除しました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  /**
   * Memoized: Extract all files from minutes with file attachments
   */
  const allFiles = useMemo(() => {
    return minutes
      .filter(m => m.attachedFiles && m.attachedFiles.length > 0)
      .flatMap(m =>
        (m.attachedFiles || []).map(file => ({
          ...file,
          minuteId: m.id,
          minuteDate: m.date,
          minuteGoal: m.todayGoal,
        }))
      );
  }, [minutes]);

  /**
   * Memoized: Extract all unique fiscal years from files
   */
  const allYears = useMemo(() => {
    return Array.from(
      new Set(allFiles.map(f => getFiscalYear(f.minuteDate)))
    ).sort((a, b) => b - a); // 降順
  }, [allFiles]);

  /**
   * Memoized: Filter files based on year, type, and search query
   */
  const filteredFiles = useMemo(() => {
    let filtered = allFiles;

    // 年度フィルター
    if (selectedYear !== 'all') {
      const yearNum = parseInt(selectedYear);
      filtered = filtered.filter(f => getFiscalYear(f.minuteDate) === yearNum);
    }

    // ファイルタイプフィルター
    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(f => f.fileType === fileTypeFilter);
    }

    // 検索クエリフィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.fileName.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query) ||
        f.minuteGoal?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allFiles, selectedYear, fileTypeFilter, searchQuery]);

  /**
   * Memoized: File type counts
   */
  const { videosCount, docsCount, imagesCount } = useMemo(() => {
    return {
      videosCount: allFiles.filter(f => f.fileType === 'video').length,
      docsCount: allFiles.filter(f =>
        f.fileType === 'pdf' ||
        f.fileType === 'docx' ||
        f.fileType === 'xlsx' ||
        f.fileType === 'pptx'
      ).length,
      imagesCount: allFiles.filter(f => f.fileType === 'image').length,
    };
  }, [allFiles]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Error and Success Banners */}
        <ErrorBanner message={error || ''} onDismiss={() => {}} />
        <SuccessBanner message={successMessage} onDismiss={() => setSuccessMessage('')} />

        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
            >
              ← ダッシュボードに戻る
            </button>
            <h1 className="text-3xl font-bold text-gray-900">先輩の資料・動画アーカイブ</h1>
            <p className="text-gray-600 mt-2">
              研究発表動画やノウハウ資料を閲覧・検索できます
            </p>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl mb-2">🎥</div>
            <p className="text-sm text-gray-600">動画</p>
            <p className="text-2xl font-bold text-gray-900">{videosCount}件</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm text-gray-600">ドキュメント</p>
            <p className="text-2xl font-bold text-gray-900">{docsCount}件</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl mb-2">🖼️</div>
            <p className="text-sm text-gray-600">画像</p>
            <p className="text-2xl font-bold text-gray-900">{imagesCount}件</p>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年度</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">すべての年度 ({allFiles.length}件)</option>
                {allYears.map(year => {
                  const yearFiles = allFiles.filter(f => getFiscalYear(f.minuteDate) === year);
                  return (
                    <option key={year} value={year}>
                      {year}年度 ({yearFiles.length}件)
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ファイルタイプ</label>
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">すべて ({allFiles.length}件)</option>
                <option value="video">動画 ({videosCount}件)</option>
                <option value="pdf">PDF</option>
                <option value="docx">Word</option>
                <option value="xlsx">Excel</option>
                <option value="image">画像 ({imagesCount}件)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ファイル名、説明で検索..."
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* 年度別グループ化トグル */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="groupByYear"
              checked={groupByYear}
              onChange={(e) => setGroupByYear(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="groupByYear" className="text-sm text-gray-700 cursor-pointer">
              年度別にグループ化して表示
            </label>
          </div>
        </div>

        {/* ファイル一覧 */}
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">
              {allFiles.length === 0
                ? 'まだファイルがアップロードされていません'
                : '条件に一致するファイルがありません'}
            </p>
            <button
              onClick={() => router.push('/minutes/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              議事録を作成してファイルをアップロード
            </button>
          </div>
        ) : groupByYear ? (
          // 年度別グループ化表示
          <div className="space-y-8">
            {allYears
              .filter(year => filteredFiles.some(f => getFiscalYear(f.minuteDate) === year))
              .map(year => {
                const yearFiles = filteredFiles.filter(f => getFiscalYear(f.minuteDate) === year);
                return (
                  <div key={year} className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-3">
                      📅 {year}年度 ({yearFiles.length}件)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {yearFiles.map((file: any) => (
                        <div key={file.id} className="border rounded-lg p-3 hover:shadow-md transition">
                          <div className="text-3xl mb-2 text-center">
                            {file.fileType === 'video' && '🎥'}
                            {file.fileType === 'pdf' && '📕'}
                            {file.fileType === 'docx' && '📘'}
                            {file.fileType === 'xlsx' && '📗'}
                            {file.fileType === 'image' && '🖼️'}
                          </div>
                          <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                            {file.fileName}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">{file.minuteDate}</p>
                          <div className="flex gap-1">
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              開く
                            </a>
                            <button
                              onClick={() => handleDeleteMinute(file.minuteId, file.minuteGoal || file.fileName)}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              title="削除"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          // 通常表示（ファイルタイプ別）
          <div className="space-y-6">
            {/* 動画セクション */}
            {filteredFiles.filter(f => f.fileType === 'video').length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">🎥 動画</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredFiles.filter(f => f.fileType === 'video').map((file: any) => (
                    <div key={file.id} className="bg-white rounded-lg shadow overflow-hidden">
                      <VideoPlayer videoUrl={file.fileUrl} fileName={file.fileName} />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{file.fileName}</h3>
                        {file.description && (
                          <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                        )}
                        <div className="text-xs text-gray-500 mb-3">
                          <p>議事録: {file.minuteGoal || '未設定'}</p>
                          <p>日付: {file.minuteDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/minutes/${file.minuteId}`)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            議事録を見る
                          </button>
                          <button
                            onClick={() => handleDeleteMinute(file.minuteId, file.minuteGoal || file.fileName)}
                            className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            title="削除"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ドキュメントセクション */}
            {filteredFiles.filter(f => f.fileType !== 'video' && f.fileType !== 'image').length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">📄 ドキュメント</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.filter(f => f.fileType !== 'video' && f.fileType !== 'image').map((file: any) => (
                    <div key={file.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">
                          {file.fileType === 'pdf' && '📕'}
                          {file.fileType === 'docx' && '📘'}
                          {file.fileType === 'xlsx' && '📗'}
                          {file.fileType === 'pptx' && '📙'}
                          {!['pdf', 'docx', 'xlsx', 'pptx'].includes(file.fileType) && '📄'}
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
                          onClick={() => handleDeleteMinute(file.minuteId, file.minuteGoal || file.fileName)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          title="削除"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 画像セクション */}
            {filteredFiles.filter(f => f.fileType === 'image').length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">🖼️ 画像</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.filter(f => f.fileType === 'image').map((file: any) => (
                    <div key={file.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                      <img
                        src={file.fileUrl}
                        alt={file.fileName}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">{file.fileName}</p>
                        <p className="text-xs text-gray-500">{file.minuteDate}</p>
                        <div className="flex gap-1 mt-2">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            開く
                          </a>
                          <button
                            onClick={() => router.push(`/minutes/${file.minuteId}`)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                          >
                            議事録
                          </button>
                          <button
                            onClick={() => handleDeleteMinute(file.minuteId, file.minuteGoal || file.fileName)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            title="削除"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
