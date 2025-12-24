'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AIProcessedMinute, TodoItem, MilestoneItem } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// デフォルトのマイルストーン
const DEFAULT_MIDTERM_MILESTONES: MilestoneItem[] = [
  { label: 'テーマ・目的', completed: false },
  { label: '研究背景', completed: false },
  { label: '研究目的', completed: false },
  { label: '研究仮説', completed: false },
  { label: '研究目標', completed: false },
  { label: '検証方法', completed: false },
  { label: '検証計画表', completed: false },
];

const DEFAULT_FINAL_MILESTONES: MilestoneItem[] = [
  { label: 'テーマ・目的', completed: false },
  { label: '研究背景', completed: false },
  { label: '研究目的', completed: false },
  { label: '研究仮説', completed: false },
  { label: '研究目標', completed: false },
  { label: '検証方法', completed: false },
  { label: '検証結果', completed: false },
  { label: '考察', completed: false },
  { label: '結論', completed: false },
  { label: '今後の課題', completed: false },
];

export default function NewMinute() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<AIProcessedMinute | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // 基本情報
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState('');

  // 発表日程
  const [midtermDate, setMidtermDate] = useState('');
  const [finalDate, setFinalDate] = useState('');

  // フォーム項目
  const [todayGoal, setTodayGoal] = useState('');
  const [lastWeekActions, setLastWeekActions] = useState<string[]>(['', '', '']);
  const [problems, setProblems] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [nextDeliverablesFigures, setNextDeliverablesFigures] = useState<number>(0);
  const [nextDeliverablesTables, setNextDeliverablesTables] = useState<number>(0);
  const [nextDeliverablesSlides, setNextDeliverablesSlides] = useState<number>(0);
  const [nextDeliverablesWords, setNextDeliverablesWords] = useState<number>(0);
  const [decisions, setDecisions] = useState<string[]>(['', '']);
  const [nextMeetingDate, setNextMeetingDate] = useState('');
  const [nextMeetingGoal, setNextMeetingGoal] = useState('');
  const [midtermMilestones, setMidtermMilestones] = useState<MilestoneItem[]>(DEFAULT_MIDTERM_MILESTONES);
  const [finalMilestones, setFinalMilestones] = useState<MilestoneItem[]>(DEFAULT_FINAL_MILESTONES);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // AI結果を反映
  useEffect(() => {
    if (aiResult) {
      setDate(aiResult.date);
      setParticipants(aiResult.participants);
      setTodayGoal(aiResult.todayGoal);
      setLastWeekActions([...aiResult.lastWeekActions, '', '', ''].slice(0, 3));
      setProblems(aiResult.problems);
      setTodos(aiResult.todos);
      setDecisions([...aiResult.decisions, '', '']);
      setNextMeetingGoal(aiResult.nextMeetingGoal);
    }
  }, [aiResult]);

  const handleProcessWithAI = async () => {
    if (inputText.trim().length < 50) {
      setError('最低50文字以上入力してください');
      return;
    }

    setError('');
    setProcessing(true);

    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText }),
      });

      if (!response.ok) {
        throw new Error('AI処理に失敗しました');
      }

      const result: AIProcessedMinute = await response.json();
      setAiResult(result);
    } catch (err) {
      setError('AI処理中にエラーが発生しました');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async (status: 'draft' | 'confirmed') => {
    if (!user) return;

    if (!todayGoal.trim()) {
      setError('今日のゴールは必須です');
      return;
    }

    setSaving(true);
    setError('');

    // 発表までの日数を計算
    const today = new Date();
    const calcDaysTo = (targetDate: string) => {
      if (!targetDate) return undefined;
      const target = new Date(targetDate);
      return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    try {
      await addDoc(collection(db, 'minutes'), {
        userId: user.uid,
        inputMode: 'manual',
        date,
        participants,
        midtermDate: midtermDate || null,
        finalDate: finalDate || null,
        daysToMidterm: calcDaysTo(midtermDate),
        daysToFinal: calcDaysTo(finalDate),
        meetingsToMidterm: null, // TODO: 計算ロジック追加
        meetingsToFinal: null,
        todayGoal: todayGoal.trim(),
        lastWeekActions: lastWeekActions.filter(a => a.trim()),
        problems: problems.trim(),
        todos: todos.filter(t => t.task.trim()),
        weeklySchedule: null,
        nextDeliverables: {
          figures: nextDeliverablesFigures || undefined,
          tables: nextDeliverablesTables || undefined,
          slides: nextDeliverablesSlides || undefined,
          words: nextDeliverablesWords || undefined,
        },
        decisions: decisions.filter(d => d.trim()),
        nextMeetingDate: nextMeetingDate || null,
        nextMeetingGoal: nextMeetingGoal.trim(),
        midtermMilestones,
        finalMilestones,
        tags,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push('/dashboard');
    } catch (err) {
      setError('保存中にエラーが発生しました');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addParticipant = () => {
    if (participantInput.trim() && !participants.includes(participantInput.trim())) {
      setParticipants([...participants, participantInput.trim()]);
      setParticipantInput('');
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const addTodo = () => {
    setTodos([
      ...todos,
      {
        no: todos.length + 1,
        task: '',
        assignee: '',
        when: '',
        deadline: '',
        goal: '',
      },
    ]);
  };

  const updateTodo = (index: number, field: keyof TodoItem, value: string | number) => {
    const newTodos = [...todos];
    newTodos[index] = { ...newTodos[index], [field]: value };
    setTodos(newTodos);
  };

  const removeTodo = (index: number) => {
    const newTodos = todos.filter((_, i) => i !== index);
    // 番号を振り直し
    newTodos.forEach((todo, i) => {
      todo.no = i + 1;
    });
    setTodos(newTodos);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const toggleMilestone = (type: 'midterm' | 'final', index: number) => {
    if (type === 'midterm') {
      const newMilestones = [...midtermMilestones];
      newMilestones[index].completed = !newMilestones[index].completed;
      setMidtermMilestones(newMilestones);
    } else {
      const newMilestones = [...finalMilestones];
      newMilestones[index].completed = !newMilestones[index].completed;
      setFinalMilestones(newMilestones);
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
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">研究会議 議事録作成</h1>

        {/* Step 1: AI処理 */}
        {!aiResult && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Step 1: 議事録テキストを入力
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              自由記述で議事録の内容を入力してください。AIが自動的に整理します。
            </p>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例:&#10;2024年12月24日の研究室MTGを実施。参加者は山田、佐藤、田中。&#10;今日のゴールは中間発表の構成を決めること。&#10;先週は文献調査を実施し、論文10本をレビューした。&#10;問題点として、データ収集の遅れがある。&#10;次回までに山田がグラフ3枚作成、佐藤が分析結果まとめ、明後日までに完成させる。&#10;決まったことは、中間発表は1月15日に実施することと、週2回ミーティングを行うこと。&#10;次回のゴールは分析結果の共有。"
            />
            <button
              onClick={handleProcessWithAI}
              disabled={processing || inputText.trim().length < 50}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {processing ? '処理中...' : 'AI処理する'}
            </button>
          </div>
        )}

        {/* Step 2: 編集・確認 */}
        {aiResult && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Step 2: 内容を確認・編集
              </h2>
              <button
                onClick={() => setAiResult(null)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← テキスト入力に戻る
              </button>
            </div>

            {/* 基本情報 */}
            <div className="mb-8 pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日付
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    参加者
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={participantInput}
                      onChange={(e) => setParticipantInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                      placeholder="名前を入力してEnter"
                      className="flex-1 p-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={addParticipant}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      追加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {participants.map((p, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                      >
                        {p}
                        <button onClick={() => removeParticipant(i)} className="text-blue-600 hover:text-blue-800">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 発表日程 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    中間発表日
                  </label>
                  <input
                    type="date"
                    value={midtermDate}
                    onChange={(e) => setMidtermDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最終発表日
                  </label>
                  <input
                    type="date"
                    value={finalDate}
                    onChange={(e) => setFinalDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* 今日のゴール */}
            <div className="mb-8 pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">今日のゴール（1行）</h3>
              <input
                type="text"
                value={todayGoal}
                onChange={(e) => setTodayGoal(e.target.value)}
                maxLength={30}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="例: 中間発表の構成を決める"
              />
            </div>

            {/* Check（先週やったこと） */}
            <div className="mb-8 pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Check（先週やったこと・結果）※最大3つ
              </h3>
              {lastWeekActions.map((action, i) => (
                <div key={i} className="mb-2">
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => {
                      const newActions = [...lastWeekActions];
                      newActions[i] = e.target.value;
                      setLastWeekActions(newActions);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder={`${i + 1}やったこと：結果（数字/一言）`}
                    maxLength={50}
                  />
                </div>
              ))}
            </div>

            {/* Problem */}
            <div className="mb-8 pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Problem（困ってること・詰まり）
              </h3>
              <textarea
                value={problems}
                onChange={(e) => setProblems(e.target.value)}
                className="w-full h-24 p-2 border border-gray-300 rounded-lg"
                placeholder="なければ空欄でOK"
                maxLength={100}
              />
            </div>

            {/* Plan（ToDoリスト） */}
            <div className="mb-8 pb-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Plan（次回までの予定：ToDoリスト）
                </h3>
                <button
                  onClick={addTodo}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + ToDo追加
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-2 text-sm">No</th>
                      <th className="border border-gray-300 p-2 text-sm">やること</th>
                      <th className="border border-gray-300 p-2 text-sm">誰が</th>
                      <th className="border border-gray-300 p-2 text-sm">いつやる</th>
                      <th className="border border-gray-300 p-2 text-sm">期限</th>
                      <th className="border border-gray-300 p-2 text-sm">ゴール</th>
                      <th className="border border-gray-300 p-2 text-sm">削除</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todos.map((todo, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 p-2 text-center">{todo.no}</td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={todo.task}
                            onChange={(e) => updateTodo(i, 'task', e.target.value)}
                            className="w-full p-1 border border-gray-200 rounded"
                            placeholder="例: 箱ひげ図1枚+説明文3行"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={todo.assignee}
                            onChange={(e) => updateTodo(i, 'assignee', e.target.value)}
                            className="w-full p-1 border border-gray-200 rounded"
                            placeholder="山田"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={todo.when}
                            onChange={(e) => updateTodo(i, 'when', e.target.value)}
                            className="w-full p-1 border border-gray-200 rounded"
                            placeholder="明日"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={todo.deadline}
                            onChange={(e) => updateTodo(i, 'deadline', e.target.value)}
                            className="w-full p-1 border border-gray-200 rounded"
                            placeholder="12/25"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={todo.goal}
                            onChange={(e) => updateTodo(i, 'goal', e.target.value)}
                            className="w-full p-1 border border-gray-200 rounded"
                            placeholder="グラフ1枚完成"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <button
                            onClick={() => removeTodo(i)}
                            className="text-red-600 hover:text-red-800"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Do（次回持っていくもの） */}
            <div className="mb-8 pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Do（次回持っていくもの）
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">図</label>
                  <input
                    type="number"
                    value={nextDeliverablesFigures}
                    onChange={(e) => setNextDeliverablesFigures(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">表</label>
                  <input
                    type="number"
                    value={nextDeliverablesTables}
                    onChange={(e) => setNextDeliverablesTables(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">スライド</label>
                  <input
                    type="number"
                    value={nextDeliverablesSlides}
                    onChange={(e) => setNextDeliverablesSlides(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">文章（字数）</label>
                  <input
                    type="number"
                    value={nextDeliverablesWords}
                    onChange={(e) => setNextDeliverablesWords(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Decision（決まったこと） */}
            <div className="mb-8 pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Decision（決まったこと）</h3>
              {decisions.map((decision, i) => (
                <div key={i} className="mb-2">
                  <input
                    type="text"
                    value={decision}
                    onChange={(e) => {
                      const newDecisions = [...decisions];
                      newDecisions[i] = e.target.value;
                      setDecisions(newDecisions);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder={`決まったこと ${i + 1}`}
                    maxLength={30}
                  />
                </div>
              ))}
              <button
                onClick={() => setDecisions([...decisions, ''])}
                className="mt-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
              >
                + 追加
              </button>
            </div>

            {/* 次回 */}
            <div className="mb-8 pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">次回</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    次回MTG日時
                  </label>
                  <input
                    type="datetime-local"
                    value={nextMeetingDate}
                    onChange={(e) => setNextMeetingDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    次回のゴール
                  </label>
                  <input
                    type="text"
                    value={nextMeetingGoal}
                    onChange={(e) => setNextMeetingGoal(e.target.value)}
                    maxLength={30}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="例: 分析結果の共有"
                  />
                </div>
              </div>
            </div>

            {/* マイルストーン */}
            <div className="mb-8 pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">マイルストーン管理</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 中間発表 */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">中間発表までの階段</h4>
                  <div className="space-y-2">
                    {midtermMilestones.map((milestone, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => toggleMilestone('midterm', i)}
                          className="w-4 h-4"
                        />
                        <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                          {milestone.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 最終発表 */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">最終発表までの階段</h4>
                  <div className="space-y-2">
                    {finalMilestones.map((milestone, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => toggleMilestone('final', i)}
                          className="w-4 h-4"
                        />
                        <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                          {milestone.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* タグ */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">タグ</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="タグを入力してEnter"
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  追加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button onClick={() => removeTag(i)} className="text-green-600 hover:text-green-800">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* 保存ボタン */}
            <div className="flex gap-4">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-300 transition"
              >
                {saving ? '保存中...' : '下書き保存'}
              </button>
              <button
                onClick={() => handleSave('confirmed')}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition"
              >
                {saving ? '保存中...' : '確定して保存'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
