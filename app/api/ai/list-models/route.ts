// Gemini利用可能モデル一覧取得エンドポイント
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not set' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ListModels API Error:', errorText);
      return NextResponse.json(
        { error: `API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // generateContentに対応しているモデルだけをフィルタ
    const generateContentModels = data.models?.filter((model: any) =>
      model.supportedGenerationMethods?.includes('generateContent')
    );

    return NextResponse.json({
      allModels: data.models,
      generateContentModels: generateContentModels,
      count: {
        total: data.models?.length || 0,
        generateContent: generateContentModels?.length || 0
      }
    });
  } catch (error) {
    console.error('ListModels Error:', error);
    return NextResponse.json(
      { error: 'Failed to list models', details: String(error) },
      { status: 500 }
    );
  }
}
