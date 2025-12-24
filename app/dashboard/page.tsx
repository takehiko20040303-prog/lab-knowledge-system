'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            研究室ノウハウ蓄積システム
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">ログイン中</p>
              <p className="text-sm font-semibold text-gray-900">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ようこそ、{user.displayName || 'ユーザー'}さん
          </h2>
          <p className="text-gray-600">
            議事録の作成・管理・検索をスマートに行いましょう
          </p>
        </div>

        {/* アクションカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 新規議事録作成 */}
          <button
            onClick={() => router.push('/minutes/new')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
          >
            <div className="text-4xl mb-3">✏️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              新規議事録作成
            </h3>
            <p className="text-gray-600">
              ゼミ後にテキスト入力、AIが自動整理
            </p>
          </button>

          {/* ファイルアップロード */}
          <button
            onClick={() => router.push('/upload')}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 p-6 rounded-lg shadow hover:shadow-lg transition text-left"
          >
            <div className="text-4xl mb-3">📤</div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              ファイルアップロード
            </h3>
            <p className="text-purple-700 font-medium">
              資料・動画を直接アップロード
            </p>
          </button>

          {/* 過去の議事録を見る */}
          <button
            onClick={() => router.push('/minutes')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              過去の議事録を見る
            </h3>
            <p className="text-gray-600">
              過去のノウハウを検索・閲覧
            </p>
          </button>

          {/* 先輩の資料・動画 */}
          <button
            onClick={() => router.push('/archives')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
          >
            <div className="text-4xl mb-3">🎥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              先輩の資料・動画
            </h3>
            <p className="text-gray-600">
              研究発表動画やノウハウ資料を閲覧
            </p>
          </button>
        </div>

        {/* 使い方ガイド */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📖 使い方ガイド</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">議事録を作成</h4>
                <p className="text-sm text-gray-600">
                  「新規議事録作成」から、ゼミの内容をテキストで入力します。AIが自動で整理してくれます。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">ファイルをアップロード</h4>
                <p className="text-sm text-gray-600">
                  Word、PDF、Excel、動画などのファイルを議事録に添付できます。先輩の研究発表動画も保存可能。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <div>
                <h4 className="font-semibold text-gray-900">過去のノウハウを検索</h4>
                <p className="text-sm text-gray-600">
                  「過去の議事録を見る」から、キーワード検索やタグ検索で必要な情報をすぐに見つけられます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
