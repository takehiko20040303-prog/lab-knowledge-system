'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AIProcessedMinute, TodoItem, MilestoneItem, AttachedFile } from '@/types';
import { minuteRepository } from '@/lib/repositories/minuteRepository';
import { calcDaysTo } from '@/lib/utils/dateUtils';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { SuccessBanner } from '@/components/common/SuccessBanner';
import { Timestamp } from 'firebase/firestore';
import FileUploader from '@/components/files/FileUploader';

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

  // フォーム項目（優先順位順）
  const [decisions, setDecisions] = useState<string[]>(['', '']);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [nextMeetingDate, setNextMeetingDate] = useState('');
  const [nextMeetingGoal, setNextMeetingGoal] = useState('');
  const [todayGoal, setTodayGoal] = useState('');
  const [lastWeekActions, setLastWeekActions] = useState<string[]>(['', '', '']);
  const [problems, setProblems] = useState('');
  const [nextDeliverablesFigures, setNextDeliverablesFigures] = useState<number>(0);
  const [nextDeliverablesTables, setNextDeliverablesTables] = useState<number>(0);
  const [nextDeliverablesSlides, setNextDeliverablesSlides] = useState<number>(0);
  const [nextDeliverablesWords, setNextDeliverablesWords] = useState<number>(0);
  const [midtermMilestones, setMidtermMilestones] = useState<MilestoneItem[]>(DEFAULT_MIDTERM_MILESTONES);
  const [finalMilestones, setFinalMilestones] = useState<MilestoneItem[]>(DEFAULT_FINAL_MILESTONES);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  // 折りたたみ状態
  const [showDetails, setShowDetails] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);

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

  /**
   * Save minute to Firestore using repository pattern
   */
  const handleSave = async (status: 'draft' | 'confirmed') => {
    if (!user) return;

    if (!todayGoal.trim()) {
      setError('今日のゴールは必須です');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // undefinedフィールドを除外してFirestoreに保存
      const minuteData: any = {
        userId: user.uid,
        inputMode: 'manual' as const,
        date,
        participants: participants.length > 0 ? participants : [],
        todayGoal: todayGoal.trim(),
        lastWeekActions: lastWeekActions.filter(a => a.trim()),
        problems: problems.trim(),
        todos: todos.filter(t => t.task.trim()),
        decisions: decisions.filter(d => d.trim()),
        nextMeetingGoal: nextMeetingGoal.trim(),
        midtermMilestones,
        finalMilestones,
        attachedFiles,
        tags,
        status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // オプショナルなフィールドは値がある場合のみ追加
      if (midtermDate) {
        minuteData.midtermDate = midtermDate;
        minuteData.daysToMidterm = calcDaysTo(midtermDate);
      }
      if (finalDate) {
        minuteData.finalDate = finalDate;
        minuteData.daysToFinal = calcDaysTo(finalDate);
      }
      if (nextMeetingDate) {
        minuteData.nextMeetingDate = nextMeetingDate;
      }

      // nextDeliverablesは値があるフィールドのみ含める
      const nextDeliverables: any = {};
      if (nextDeliverablesFigures) nextDeliverables.figures = nextDeliverablesFigures;
      if (nextDeliverablesTables) nextDeliverables.tables = nextDeliverablesTables;
      if (nextDeliverablesSlides) nextDeliverables.slides = nextDeliverablesSlides;
      if (nextDeliverablesWords) nextDeliverables.words = nextDeliverablesWords;
      if (Object.keys(nextDeliverables).length > 0) {
        minuteData.nextDeliverables = nextDeliverables;
      }

      await minuteRepository.create(minuteData);

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
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            ← ダッシュボードに戻る
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">研究会議 議事録作成</h1>
        <p className="text-sm text-gray-600 mb-8">重要な情報から順に表示されます</p>

        {/* Step 1: AI処理 */}
        {!aiResult && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              議事録を入力してAI整理
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              自由記述で議事録の内容を入力してください。AIが重要な情報を整理します。
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
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
            >
              {processing ? '処理中...' : 'AI整理する'}
            </button>
          </div>
        )}

        {/* Step 2: 編集・確認（優先順位順） */}
        {aiResult && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                内容を確認・編集
              </h2>
              <button
                onClick={() => setAiResult(null)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← テキスト入力に戻る
              </button>
            </div>

            {/* 🔴 最優先: 決まったこと（赤） */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-red-800 mb-1 flex items-center gap-2">
                🔴 決まったこと（Decision）
              </h3>
              <p className="text-xs text-red-600 mb-4">最重要！ここを見れば今日の結論が分かる</p>
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
                    className="w-full p-3 border-2 border-red-200 rounded-lg text-lg font-semibold"
                    placeholder={`決まったこと ${i + 1}`}
                    maxLength={50}
                  />
                </div>
              ))}
              <button
                onClick={() => setDecisions([...decisions, ''])}
                className="mt-2 px-4 py-2 bg-red-200 rounded-lg hover:bg-red-300 text-sm font-semibold"
              >
                + 追加
              </button>
            </div>

            {/* 🟠 次回までのToDo（オレンジ） */}
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2">
                    🟠 次回までのToDo
                  </h3>
                  <p className="text-xs text-orange-600">誰が・いつ・何を・どこまで</p>
                </div>
                <button
                  onClick={addTodo}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
                >
                  + ToDo追加
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-orange-300">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="border border-orange-300 p-2 text-sm font-bold">No</th>
                      <th className="border border-orange-300 p-2 text-sm font-bold">やること（成果物）</th>
                      <th className="border border-orange-300 p-2 text-sm font-bold">誰が</th>
                      <th className="border border-orange-300 p-2 text-sm font-bold">いつ</th>
                      <th className="border border-orange-300 p-2 text-sm font-bold">期限</th>
                      <th className="border border-orange-300 p-2 text-sm font-bold">ゴール</th>
                      <th className="border border-orange-300 p-2 text-sm font-bold">削除</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todos.map((todo, i) => (
                      <tr key={i} className="bg-white">
                        <td className="border border-orange-300 p-2 text-center font-bold">{todo.no}</td>
                        <td className="border border-orange-300 p-2">
                          <input
                            type="text"
                            value={todo.task}
                            onChange={(e) => updateTodo(i, 'task', e.target.value)}
                            className="w-full p-2 border border-orange-200 rounded font-semibold"
                            placeholder="例: グラフ3枚+説明文"
                          />
                        </td>
                        <td className="border border-orange-300 p-2">
                          <input
                            type="text"
                            value={todo.assignee}
                            onChange={(e) => updateTodo(i, 'assignee', e.target.value)}
                            className="w-full p-2 border border-orange-200 rounded"
                            placeholder="山田"
                          />
                        </td>
                        <td className="border border-orange-300 p-2">
                          <input
                            type="text"
                            value={todo.when}
                            onChange={(e) => updateTodo(i, 'when', e.target.value)}
                            className="w-full p-2 border border-orange-200 rounded"
                            placeholder="明日"
                          />
                        </td>
                        <td className="border border-orange-300 p-2">
                          <input
                            type="text"
                            value={todo.deadline}
                            onChange={(e) => updateTodo(i, 'deadline', e.target.value)}
                            className="w-full p-2 border border-orange-200 rounded font-semibold text-red-600"
                            placeholder="12/25"
                          />
                        </td>
                        <td className="border border-orange-300 p-2">
                          <input
                            type="text"
                            value={todo.goal}
                            onChange={(e) => updateTodo(i, 'goal', e.target.value)}
                            className="w-full p-2 border border-orange-200 rounded"
                            placeholder="完成"
                          />
                        </td>
                        <td className="border border-orange-300 p-2 text-center">
                          <button
                            onClick={() => removeTodo(i)}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🟡 次回MTG（黄色） */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
                🟡 次回ミーティング
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-yellow-800 mb-1">
                    次回MTG日時
                  </label>
                  <input
                    type="datetime-local"
                    value={nextMeetingDate}
                    onChange={(e) => setNextMeetingDate(e.target.value)}
                    className="w-full p-3 border-2 border-yellow-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-yellow-800 mb-1">
                    次回のゴール
                  </label>
                  <input
                    type="text"
                    value={nextMeetingGoal}
                    onChange={(e) => setNextMeetingGoal(e.target.value)}
                    maxLength={30}
                    className="w-full p-3 border-2 border-yellow-300 rounded-lg font-semibold"
                    placeholder="例: 分析結果の共有"
                  />
                </div>
              </div>
            </div>

            {/* 詳細情報（折りたたみ） */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-semibold text-gray-800">
                  📝 詳細情報（基本情報・今日のゴール・Check・Problem等）
                </span>
                <span className="text-gray-500">{showDetails ? '▲' : '▼'}</span>
              </button>

              {showDetails && (
                <div className="p-6 border-t space-y-6">
                  {/* 基本情報 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">基本情報</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">参加者</label>
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
                            <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                              {p}
                              <button onClick={() => removeParticipant(i)} className="text-blue-600 hover:text-blue-800">×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">中間発表日</label>
                        <input
                          type="date"
                          value={midtermDate}
                          onChange={(e) => setMidtermDate(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">最終発表日</label>
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
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">今日のゴール</h4>
                    <input
                      type="text"
                      value={todayGoal}
                      onChange={(e) => setTodayGoal(e.target.value)}
                      maxLength={30}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="例: 中間発表の構成を決める"
                    />
                  </div>

                  {/* Check */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Check（先週やったこと）</h4>
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
                          placeholder={`${i + 1}. やったこと：結果`}
                          maxLength={50}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Problem */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Problem（困っていること）</h4>
                    <textarea
                      value={problems}
                      onChange={(e) => setProblems(e.target.value)}
                      className="w-full h-20 p-2 border border-gray-300 rounded-lg"
                      placeholder="なければ空欄でOK"
                      maxLength={100}
                    />
                  </div>

                  {/* 次回持っていくもの */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">次回持っていくもの</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">図</label>
                        <input type="number" value={nextDeliverablesFigures} onChange={(e) => setNextDeliverablesFigures(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg" min="0" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">表</label>
                        <input type="number" value={nextDeliverablesTables} onChange={(e) => setNextDeliverablesTables(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg" min="0" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">スライド</label>
                        <input type="number" value={nextDeliverablesSlides} onChange={(e) => setNextDeliverablesSlides(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg" min="0" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">文章（字数）</label>
                        <input type="number" value={nextDeliverablesWords} onChange={(e) => setNextDeliverablesWords(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg" min="0" />
                      </div>
                    </div>
                  </div>

                  {/* タグ */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">タグ</h4>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="タグを入力してEnter"
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                      />
                      <button onClick={addTag} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">追加</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                          {tag}
                          <button onClick={() => removeTag(i)} className="text-green-600 hover:text-green-800">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ファイルアップロード（常に表示） */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-purple-800 mb-1 flex items-center gap-2">
                📎 ファイル添付
              </h3>
              <p className="text-sm text-purple-600 mb-4">
                研究資料、発表動画、Word/PDF/Excelファイルなどをアップロード
              </p>

              {user && (
                <FileUploader
                  userId={user.uid}
                  onFileUploaded={(file) => setAttachedFiles([...attachedFiles, file])}
                />
              )}

              {/* アップロード済みファイル一覧 */}
              {attachedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-purple-700 mb-3">
                    ✅ アップロード済みファイル ({attachedFiles.length}件)
                  </h4>
                  <div className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200 shadow-sm">
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
                          onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== index))}
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

            {/* マイルストーン（折りたたみ） */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setShowMilestones(!showMilestones)}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-semibold text-gray-800">
                  🎯 マイルストーン管理（中間・最終発表の進捗）
                </span>
                <span className="text-gray-500">{showMilestones ? '▲' : '▼'}</span>
              </button>

              {showMilestones && (
                <div className="p-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">中間発表までの階段</h4>
                      <div className="space-y-2">
                        {midtermMilestones.map((milestone, i) => (
                          <label key={i} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input type="checkbox" checked={milestone.completed} onChange={() => toggleMilestone('midterm', i)} className="w-5 h-5" />
                            <span className={milestone.completed ? 'line-through text-gray-500' : 'font-medium'}>{milestone.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">最終発表までの階段</h4>
                      <div className="space-y-2">
                        {finalMilestones.map((milestone, i) => (
                          <label key={i} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                            <input type="checkbox" checked={milestone.completed} onChange={() => toggleMilestone('final', i)} className="w-5 h-5" />
                            <span className={milestone.completed ? 'line-through text-gray-500' : 'font-medium'}>{milestone.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg border-2 border-red-300 font-semibold">
                {error}
              </div>
            )}

            {/* 保存ボタン */}
            <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="flex-1 bg-gray-600 text-white px-6 py-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-300 transition font-bold text-lg"
              >
                {saving ? '保存中...' : '下書き保存'}
              </button>
              <button
                onClick={() => handleSave('confirmed')}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition font-bold text-lg"
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
