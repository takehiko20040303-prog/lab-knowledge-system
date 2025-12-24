'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import LoginButton from '@/components/auth/LoginButton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex flex-col items-center justify-center gap-8 px-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            研究室ノウハウ蓄積システム
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            電力システム研究室
          </p>
          <p className="text-gray-500">
            議事録の作成・管理・検索をスマートに
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-2">大学のGoogleアカウントでログイン</p>
            <p className="text-sm text-gray-500">研究室メンバー限定</p>
          </div>
          <LoginButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">✏️</div>
            <h3 className="font-bold text-lg mb-2">手入力で簡単</h3>
            <p className="text-sm text-gray-600">
              ゼミ後5分でテキスト入力、AIが自動整理
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold text-lg mb-2">AI要約</h3>
            <p className="text-sm text-gray-600">
              日付・テーマ・内容・結論・ToDoに自動整理
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold text-lg mb-2">高速検索</h3>
            <p className="text-sm text-gray-600">
              過去のノウハウをキーワードで即座に検索
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
