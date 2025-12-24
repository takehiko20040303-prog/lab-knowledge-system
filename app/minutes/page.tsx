'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Minute } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';

export default function MinutesListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [minutes, setMinutes] = useState<Minute[]>([]);
  const [filteredMinutes, setFilteredMinutes] = useState<Minute[]>([]);
  const [loadingMinutes, setLoadingMinutes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'confirmed'>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchMinutes();
    }
  }, [user]);

  // フィルタリング
  useEffect(() => {
    let filtered = [...minutes];

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // タグフィルター
    if (selectedTag) {
      filtered = filtered.filter(m => m.tags?.includes(selectedTag));
    }

    // 検索クエリ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.todayGoal?.toLowerCase().includes(query) ||
        m.decisions?.some(d => d.toLowerCase().includes(query)) ||
        m.todos?.some(t => t.task.toLowerCase().includes(query)) ||
        m.participants?.some(p => p.toLowerCase().includes(query))
      );
    }

    setFilteredMinutes(filtered);
  }, [minutes, searchQuery, selectedTag, statusFilter]);

  const fetchMinutes = async () => {
    if (!user) return;

    setLoadingMinutes(true);
    try {
      const q = query(
        collection(db, 'minutes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const minutesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Minute[];

      setMinutes(minutesData);
      setFilteredMinutes(minutesData);
    } catch (error) {
      console.error('議事録の取得に失敗:', error);
      alert('議事録の取得に失敗しました。Firebaseコンソールでインデックスを作成してください。');
    } finally {
      setLoadingMinutes(false);
    }
  };

  const handleDelete = async (minuteId: string, minuteGoal: string) => {
    if (!window.confirm(`「${minuteGoal}」を削除しますか？\n\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'minutes', minuteId));
      alert('削除しました');
      fetchMinutes(); // 再読み込み
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  // 全タグを取得
  const allTags = Array.from(
    new Set(minutes.flatMap(m => m.tags || []))
  ).sort();

  if (loading || loadingMinutes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
          >
            ← ダッシュボードに戻る
          </button>
        </div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">議事録一覧</h1>
            <p className="text-sm text-gray-600 mt-1">過去の議事録・ノウハウを検索・閲覧</p>
          </div>
          <button
            onClick={() => router.push('/minutes/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            + 新規作成
          </button>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 検索 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 キーワード検索
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ゴール・決定事項・ToDo・参加者で検索..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ステータスフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📋 ステータス
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'confirmed')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="draft">下書き</option>
                <option value="confirmed">確定済み</option>
              </select>
            </div>
          </div>

          {/* タグフィルター */}
          {allTags.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ タグで絞り込み
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    selectedTag === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  すべて
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 検索結果数 */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredMinutes.length}件の議事録が見つかりました
          </div>
        </div>

        {/* 議事録リスト */}
        <div className="space-y-4">
          {filteredMinutes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">議事録が見つかりませんでした</p>
            </div>
          ) : (
            filteredMinutes.map(minute => (
              <div
                key={minute.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => router.push(`/minutes/${minute.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-gray-500">{minute.date}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        minute.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {minute.status === 'confirmed' ? '確定' : '下書き'}
                      </span>
                      {minute.participants && minute.participants.length > 0 && (
                        <span className="text-xs text-gray-500">
                          参加者: {minute.participants.join(', ')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {minute.todayGoal || '（ゴール未設定）'}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(minute.id, minute.todayGoal || '（ゴール未設定）');
                    }}
                    className="ml-3 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    title="削除"
                  >
                    🗑️ 削除
                  </button>
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => router.push(`/minutes/${minute.id}`)}
                >
                  {/* 🔴 決まったこと */}
                  {minute.decisions && minute.decisions.length > 0 && (
                    <div className="mb-3 bg-red-50 border-l-4 border-red-400 p-3 rounded">
                      <h4 className="text-sm font-bold text-red-800 mb-1">🔴 決まったこと</h4>
                      <ul className="text-sm text-red-900 space-y-1">
                        {minute.decisions.slice(0, 2).map((decision, i) => (
                          <li key={i}>• {decision}</li>
                        ))}
                        {minute.decisions.length > 2 && (
                          <li className="text-xs text-red-600">...他{minute.decisions.length - 2}件</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* 🟠 ToDo */}
                  {minute.todos && minute.todos.length > 0 && (
                    <div className="mb-3 bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                      <h4 className="text-sm font-bold text-orange-800 mb-1">🟠 ToDo</h4>
                      <ul className="text-sm text-orange-900 space-y-1">
                        {minute.todos.slice(0, 2).map((todo, i) => (
                          <li key={i}>
                            • {todo.task} ({todo.assignee} - 期限: {todo.deadline})
                          </li>
                        ))}
                        {minute.todos.length > 2 && (
                          <li className="text-xs text-orange-600">...他{minute.todos.length - 2}件</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* タグ */}
                  {minute.tags && minute.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {minute.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
