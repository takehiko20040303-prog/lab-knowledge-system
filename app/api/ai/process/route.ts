// AI要約APIエンドポイント
import { NextRequest, NextResponse } from 'next/server';
import { processMinuteWithAI } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { inputText } = await request.json();

    if (!inputText || inputText.trim().length < 50) {
      return NextResponse.json(
        { error: '入力テキストは50文字以上必要です' },
        { status: 400 }
      );
    }

    const result = await processMinuteWithAI(inputText);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'AI処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
