'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Minute } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import VideoPlayer from '@/components/files/VideoPlayer';

export default function MinuteDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const minuteId = params.id as string;

  const [minute, setMinute] = useState<Minute | null>(null);
  const [loadingMinute, setLoadingMinute] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && minuteId) {
      fetchMinute();
    }
  }, [user, minuteId]);

  const fetchMinute = async () => {
    if (!user || !minuteId) return;

    setLoadingMinute(true);
    try {
      const docRef = doc(db, 'minutes', minuteId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Check if this minute belongs to the current user
        if (data.userId !== user.uid) {
          alert('この議事録にアクセスする権限がありません');
          router.push('/minutes');
          return;
        }
        setMinute({ id: docSnap.id, ...data } as Minute);
      } else {
        alert('議事録が見つかりませんでした');
        router.push('/minutes');
      }
    } catch (error) {
      console.error('議事録の取得に失敗:', error);
      alert('議事録の取得に失敗しました');
    } finally {
      setLoadingMinute(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('この議事録を削除してもよろしいですか？')) return;

    try {
      await deleteDoc(doc(db, 'minutes', minuteId));
      alert('議事録を削除しました');
      router.push('/minutes');
    } catch (error) {
      console.error('削除に失敗:', error);
      alert('削除に失敗しました');
    }
  };

  const handleStatusChange = async () => {
    if (!minute) return;

    const newStatus = minute.status === 'draft' ? 'confirmed' : 'draft';
    try {
      await updateDoc(doc(db, 'minutes', minuteId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      setMinute({ ...minute, status: newStatus });
      alert(`ステータスを「${newStatus === 'confirmed' ? '確定済み' : '下書き'}」に変更しました`);
    } catch (error) {
      console.error('ステータス変更に失敗:', error);
      alert('ステータス変更に失敗しました');
    }
  };

  if (loading || loadingMinute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!minute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">議事録が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={() => router.push('/minutes')}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
            >
              ← 一覧に戻る
            </button>
            <h1 className="text-3xl font-bold text-gray-900">議事録詳細</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-semibold text-gray-500">{minute.date}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                minute.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {minute.status === 'confirmed' ? '確定済み' : '下書き'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleStatusChange}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {minute.status === 'draft' ? '確定する' : '下書きに戻す'}
            </button>
            <button
              onClick={() => router.push(`/minutes/${minuteId}/edit`)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              削除
            </button>
          </div>
        </div>

        {/* 🔴 決まったこと */}
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-red-800 mb-1 flex items-center gap-2">
            🔴 決まったこと（Decision）
          </h3>
          <p className="text-xs text-red-600 mb-4">最重要！ここを見れば今日の結論が分かる</p>
          {minute.decisions && minute.decisions.length > 0 ? (
            <ul className="space-y-2">
              {minute.decisions.map((decision, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-700 font-bold">{index + 1}.</span>
                  <span className="text-red-900 font-medium">{decision}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-700 italic">決定事項はありません</p>
          )}
        </div>

        {/* 🟠 ToDo */}
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-orange-800 mb-1">🟠 次回までのToDo</h3>
          <p className="text-xs text-orange-600 mb-4">誰が・いつ・何をするかを明確に！</p>
          {minute.todos && minute.todos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-orange-200">
                    <th className="border border-orange-400 px-3 py-2 text-left text-sm font-bold text-orange-900">No</th>
                    <th className="border border-orange-400 px-3 py-2 text-left text-sm font-bold text-orange-900">やること</th>
                    <th className="border border-orange-400 px-3 py-2 text-left text-sm font-bold text-orange-900">誰が</th>
                    <th className="border border-orange-400 px-3 py-2 text-left text-sm font-bold text-orange-900">いつやる</th>
                    <th className="border border-orange-400 px-3 py-2 text-left text-sm font-bold text-orange-900">期限</th>
                    <th className="border border-orange-400 px-3 py-2 text-left text-sm font-bold text-orange-900">ゴール</th>
                  </tr>
                </thead>
                <tbody>
                  {minute.todos.map((todo, index) => (
                    <tr key={index} className="hover:bg-orange-100">
                      <td className="border border-orange-300 px-3 py-2 text-orange-900">{todo.no}</td>
                      <td className="border border-orange-300 px-3 py-2 text-orange-900 font-medium">{todo.task}</td>
                      <td className="border border-orange-300 px-3 py-2 text-orange-900">{todo.assignee}</td>
                      <td className="border border-orange-300 px-3 py-2 text-orange-900">{todo.when}</td>
                      <td className="border border-orange-300 px-3 py-2 text-orange-900">{todo.deadline}</td>
                      <td className="border border-orange-300 px-3 py-2 text-orange-900">{todo.goal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-orange-700 italic">ToDoはありません</p>
          )}
        </div>

        {/* 🟡 次回MTG */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-4">🟡 次回MTG</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-yellow-700 mb-1">📅 日時</p>
              <p className="text-yellow-900">{minute.nextMeetingDate || '未定'}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-yellow-700 mb-1">🎯 次回のゴール</p>
              <p className="text-yellow-900">{minute.nextMeetingGoal || '未設定'}</p>
            </div>
          </div>
        </div>

        {/* 📝 詳細情報（折りたたみ） */}
        <div className="bg-white border border-gray-300 rounded-lg mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
          >
            <span className="text-lg font-bold text-gray-700">
              📝 詳細情報（基本情報・今日のゴール・Check・Problem等）
            </span>
            <span className="text-2xl text-gray-500">{showDetails ? '▲' : '▼'}</span>
          </button>
          {showDetails && (
            <div className="px-6 pb-6 space-y-6">
              {/* 基本情報 */}
              <div>
                <h4 className="font-bold text-gray-700 mb-2">📋 基本情報</h4>
                <div className="bg-gray-50 p-4 rounded space-y-2">
                  <p><span className="font-semibold">参加者:</span> {minute.participants?.join(', ') || 'なし'}</p>
                  {minute.daysToMidterm !== undefined && (
                    <p><span className="font-semibold">中間発表まで:</span> あと{minute.daysToMidterm}日 / {minute.meetingsToMidterm}回MTG</p>
                  )}
                  {minute.daysToFinal !== undefined && (
                    <p><span className="font-semibold">最終発表まで:</span> あと{minute.daysToFinal}日 / {minute.meetingsToFinal}回MTG</p>
                  )}
                </div>
              </div>

              {/* 今日のゴール */}
              <div>
                <h4 className="font-bold text-gray-700 mb-2">🎯 今日のゴール</h4>
                <p className="bg-blue-50 p-4 rounded text-blue-900">{minute.todayGoal || '未設定'}</p>
              </div>

              {/* Check（先週やったこと） */}
              {minute.lastWeekActions && minute.lastWeekActions.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">✅ Check（先週やったこと）</h4>
                  <ul className="bg-green-50 p-4 rounded space-y-1">
                    {minute.lastWeekActions.map((action, index) => (
                      <li key={index} className="text-green-900">• {action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Problem（困ってること） */}
              {minute.problems && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">⚠️ Problem（困ってること）</h4>
                  <p className="bg-yellow-50 p-4 rounded text-yellow-900 whitespace-pre-wrap">{minute.problems}</p>
                </div>
              )}

              {/* 今週のスケジュール */}
              {minute.weeklySchedule && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">📅 今週のスケジュール</h4>
                  <div className="bg-purple-50 p-4 rounded space-y-1 text-sm">
                    {minute.weeklySchedule.monday && <p><span className="font-semibold">月:</span> {minute.weeklySchedule.monday}</p>}
                    {minute.weeklySchedule.tuesday && <p><span className="font-semibold">火:</span> {minute.weeklySchedule.tuesday}</p>}
                    {minute.weeklySchedule.wednesday && <p><span className="font-semibold">水:</span> {minute.weeklySchedule.wednesday}</p>}
                    {minute.weeklySchedule.thursday && <p><span className="font-semibold">木:</span> {minute.weeklySchedule.thursday}</p>}
                    {minute.weeklySchedule.friday && <p><span className="font-semibold">金:</span> {minute.weeklySchedule.friday}</p>}
                    {minute.weeklySchedule.weekend && <p><span className="font-semibold">週末:</span> {minute.weeklySchedule.weekend}</p>}
                  </div>
                </div>
              )}

              {/* 次回持っていくもの */}
              {minute.nextDeliverables && Object.keys(minute.nextDeliverables).length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">📦 次回持っていくもの（Do）</h4>
                  <div className="bg-indigo-50 p-4 rounded grid grid-cols-2 gap-2 text-sm">
                    {minute.nextDeliverables.figures !== undefined && (
                      <p><span className="font-semibold">図:</span> {minute.nextDeliverables.figures}個</p>
                    )}
                    {minute.nextDeliverables.tables !== undefined && (
                      <p><span className="font-semibold">表:</span> {minute.nextDeliverables.tables}個</p>
                    )}
                    {minute.nextDeliverables.slides !== undefined && (
                      <p><span className="font-semibold">スライド:</span> {minute.nextDeliverables.slides}枚</p>
                    )}
                    {minute.nextDeliverables.words !== undefined && (
                      <p><span className="font-semibold">文章:</span> {minute.nextDeliverables.words}文字</p>
                    )}
                  </div>
                </div>
              )}

              {/* タグ */}
              {minute.tags && minute.tags.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">🏷️ タグ</h4>
                  <div className="flex flex-wrap gap-2">
                    {minute.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 📊 マイルストーン（折りたたみ） */}
        <div className="bg-white border border-gray-300 rounded-lg mb-6">
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
          >
            <span className="text-lg font-bold text-gray-700">
              📊 マイルストーン（進捗の階段）
            </span>
            <span className="text-2xl text-gray-500">{showMilestones ? '▲' : '▼'}</span>
          </button>
          {showMilestones && (
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 中間発表までの階段 */}
              {minute.midtermMilestones && minute.midtermMilestones.length > 0 && (
                <div>
                  <h4 className="font-bold text-blue-700 mb-3">🎯 中間発表までの階段</h4>
                  <div className="space-y-2">
                    {minute.midtermMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          disabled
                          className="w-5 h-5"
                        />
                        <span className={milestone.completed ? 'line-through text-gray-500' : 'text-blue-900'}>
                          {milestone.label}
                        </span>
                        {milestone.progress !== undefined && (
                          <span className="ml-auto text-xs text-blue-600 font-semibold">
                            {milestone.progress}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 最終発表までの階段 */}
              {minute.finalMilestones && minute.finalMilestones.length > 0 && (
                <div>
                  <h4 className="font-bold text-purple-700 mb-3">🏆 最終発表までの階段</h4>
                  <div className="space-y-2">
                    {minute.finalMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-purple-50 rounded">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          disabled
                          className="w-5 h-5"
                        />
                        <span className={milestone.completed ? 'line-through text-gray-500' : 'text-purple-900'}>
                          {milestone.label}
                        </span>
                        {milestone.progress !== undefined && (
                          <span className="ml-auto text-xs text-purple-600 font-semibold">
                            {milestone.progress}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 📎 添付ファイル */}
        {minute.attachedFiles && minute.attachedFiles.length > 0 && (
          <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-700 mb-4">📎 添付ファイル</h3>

            {/* 動画ファイル（専用表示） */}
            {minute.attachedFiles.filter(f => f.fileType === 'video').length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">🎥 動画</h4>
                <div className="grid grid-cols-1 gap-6">
                  {minute.attachedFiles.filter(f => f.fileType === 'video').map((file) => (
                    <div key={file.id}>
                      <VideoPlayer videoUrl={file.fileUrl} fileName={file.fileName} />
                      {file.description && (
                        <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded">
                          {file.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* その他のファイル */}
            {minute.attachedFiles.filter(f => f.fileType !== 'video').length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">📄 ドキュメント・画像</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {minute.attachedFiles.filter(f => f.fileType !== 'video').map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">{file.fileName}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            {file.fileType} • {(file.fileSize / 1024).toFixed(1)} KB
                          </p>
                          {file.description && (
                            <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                          )}
                        </div>
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          開く
                        </a>
                      </div>

                      {/* 画像プレビュー */}
                      {file.fileType === 'image' && (
                        <div className="mt-3">
                          <img
                            src={file.fileUrl}
                            alt={file.fileName}
                            className="w-full h-48 object-cover rounded border border-gray-200"
                          />
                        </div>
                      )}
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
