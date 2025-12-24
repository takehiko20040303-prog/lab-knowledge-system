// Gemini API連携ユーティリティ（REST API直接呼び出し）
import { AIProcessedMinute } from '@/types';

export async function processMinuteWithAI(inputText: string): Promise<AIProcessedMinute> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const prompt = `
あなたは研究室のミーティング議事録を整理するAIアシスタントです。
以下の自由記述テキストから、研究室議事録として必要な情報を抽出し、JSON形式で出力してください。
必ず有効なJSON形式で返してください。

【抽出項目】
1. date: 議事録の日付（YYYY-MM-DD形式、テキスト中になければ今日の日付）
2. participants: 参加者の名前（配列形式、例: ["山田", "佐藤", "田中"]）
3. todayGoal: 今日のゴール（1行、30文字以内）
4. lastWeekActions: 先週やったこと・結果（配列形式、最大3つ、各50文字以内）
5. problems: 困っていること・詰まっていること（100文字以内、なければ空文字）
6. todos: 次回までのToDoリスト（配列形式、各項目は以下の形式のオブジェクト）
   - no: 番号（1から順番）
   - task: やること（成果物で記述、例: "箱ひげ図1枚＋結論1行"）
   - assignee: 誰が（名前）
   - when: いつやる（例: "今日", "明日", "水曜"）
   - deadline: 期限（例: "12/25", "金曜18:00"）
   - goal: ゴール（どこまで終わればOK？）
7. decisions: 決まったこと（配列形式、各30文字以内）
8. nextMeetingGoal: 次回のゴール（1行、30文字以内）

【重要な指示】
- ToDoは必ず「成果物」で記述すること（×「解析する」→ ○「箱ひげ図1枚＋結論1行」）
- 期限は具体的な日付または曜日まで落とすこと（×「今週中」→ ○「金曜18:00」）
- 情報が不足している場合は、合理的に推測して埋めること

--- テキスト ---
${inputText}

--- 出力形式（必ずこのJSON形式で返すこと） ---
{
  "date": "YYYY-MM-DD",
  "participants": ["参加者1", "参加者2"],
  "todayGoal": "今日のゴール",
  "lastWeekActions": ["①やったこと：結果", "②やったこと：結果"],
  "problems": "困っていること（なければ空文字）",
  "todos": [
    {
      "no": 1,
      "task": "箱ひげ図1枚＋説明文3行",
      "assignee": "山田",
      "when": "今日",
      "deadline": "12/25",
      "goal": "グラフ1枚完成＋説明文3行"
    }
  ],
  "decisions": ["決まったこと1", "決まったこと2"],
  "nextMeetingGoal": "次回のゴール"
}
`;

  try {
    // REST API直接呼び出し（v1beta API使用）
    // 正しいモデル名: gemini-2.5-flash (gemini-1.5-flashは存在しない)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Response Error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // JSONブロックを抽出（```json ... ``` のようなマークダウン形式に対応）
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

    const parsed = JSON.parse(jsonText.trim()) as AIProcessedMinute;

    // バリデーション
    if (!parsed.date || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
      parsed.date = new Date().toISOString().split('T')[0];
    }
    if (!Array.isArray(parsed.participants)) {
      parsed.participants = [];
    }
    if (!Array.isArray(parsed.lastWeekActions)) {
      parsed.lastWeekActions = [];
    }
    if (!Array.isArray(parsed.todos)) {
      parsed.todos = [];
    }
    if (!Array.isArray(parsed.decisions)) {
      parsed.decisions = [];
    }

    return parsed;
  } catch (error) {
    console.error('Gemini API エラー:', error);

    // エラー時のフォールバック
    return {
      date: new Date().toISOString().split('T')[0],
      participants: [],
      todayGoal: '（AI処理失敗）',
      lastWeekActions: [],
      problems: 'AI処理に失敗しました。手動で編集してください。',
      todos: [],
      decisions: [],
      nextMeetingGoal: '',
    };
  }
}
