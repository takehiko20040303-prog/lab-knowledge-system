# 📚 研究室ノウハウ蓄積システム

研究室のゼミ議事録とファイルを管理するWebアプリケーション

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/lab-knowledge-system)

## ✨ 主な機能

### 📝 議事録管理
- **AI自動整理**: Gemini 2.5 FlashでテキストをAI処理
- **構造化データ**: 決まったこと、ToDo、問題点などを整理
- **検索・フィルタリング**: タグ、日付、ステータスで検索

### 📎 ファイルアーカイブ
- **ファイルアップロード**: Word、PDF、Excel、画像（最大500KB）
- **Base64保存**: Firebase Storage不要で完全無料
- **年度別整理**: 年度フィルターとグループ化表示
- **検索機能**: ファイル名、説明、タグで検索

### 🔒 認証・セキュリティ
- **Google認証**: Firebase Authentication
- **ユーザー別管理**: 各ユーザーのデータを分離

### 📱 PWA対応
- **ホーム画面追加**: スマホアプリのように使用可能
- **オフライン対応**: （今後実装可能）

---

## 🚀 デプロイ方法

詳細は [QUICK_START.md](./QUICK_START.md) を参照

### クイックスタート

1. **GitHubにpush**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/lab-knowledge-system.git
   git push -u origin main
   ```

2. **Vercelでデプロイ**
   - https://vercel.com でGitHubリポジトリをインポート
   - 環境変数を設定
   - デプロイ！

3. **Firebase設定更新**
   - 承認済みドメインにVercel URLを追加

---

## 💻 ローカル開発

### 必要なもの
- Node.js 18以上
- Firebase プロジェクト
- Gemini API キー

### セットアップ

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lab-knowledge-system.git
   cd lab-knowledge-system
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **環境変数を設定**
   `.env.local`ファイルを作成：
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

5. **ブラウザで開く**
   http://localhost:3000

---

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React, TypeScript
- **スタイリング**: Tailwind CSS
- **認証**: Firebase Authentication
- **データベース**: Cloud Firestore
- **AI**: Google Gemini 2.5 Flash API
- **デプロイ**: Vercel
- **PWA**: manifest.json

---

## 📁 プロジェクト構成

```
lab-knowledge-system/
├── app/
│   ├── api/              # API Routes
│   │   └── ai/          # Gemini AI処理
│   ├── archives/        # ファイルアーカイブ
│   ├── dashboard/       # ダッシュボード
│   ├── minutes/         # 議事録管理
│   ├── upload/          # ファイルアップロード
│   └── page.tsx         # トップページ（ログイン）
├── components/
│   ├── auth/            # 認証コンポーネント
│   └── files/           # ファイル関連コンポーネント
├── lib/
│   ├── firebase.ts      # Firebase設定
│   └── gemini.ts        # Gemini API
├── types/
│   └── index.ts         # TypeScript型定義
└── public/
    └── manifest.json    # PWA設定
```

---

## 📊 データ構造

### Minute（議事録）
```typescript
{
  id: string;
  userId: string;
  date: string;
  todayGoal: string;
  decisions: string[];
  todos: TodoItem[];
  problems: string;
  attachedFiles: AttachedFile[];
  tags: string[];
  status: 'draft' | 'confirmed';
  createdAt: Timestamp;
}
```

### AttachedFile
```typescript
{
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string; // Base64エンコード
  uploadedAt: Timestamp;
  description?: string;
}
```

---

## 🔐 セキュリティ

- **環境変数**: `.env.local`はGitにコミットされません
- **Firebase Rules**: Firestoreセキュリティルールで保護
- **認証必須**: すべての機能で認証が必要

---

## 💰 コスト

### 完全無料で運用可能！

- **Vercel**: 無料（Hobbyプラン）
- **Firebase**: 無料枠内で使用可能
  - Authentication: 無料
  - Firestore: 1GB無料、50,000読み取り/日
  - Hosting: 10GB無料
- **Gemini API**: 無料枠あり
  - 15 requests/分
  - 1,500 requests/日

---

## 📝 ライセンス

MIT License

---

## 🤝 貢献

プルリクエスト歓迎！

1. Fork
2. Feature branchを作成 (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Pull Requestを作成

---

## 📮 お問い合わせ

質問や提案は [Issues](https://github.com/YOUR_USERNAME/lab-knowledge-system/issues) にお願いします。

---

## 🎓 使用例

このシステムは研究室のゼミ議事録管理に最適です：

- ✅ ゼミ後すぐに議事録を作成
- ✅ AIで自動整理
- ✅ 先輩の資料をアーカイブ
- ✅ 年度別に整理
- ✅ 検索で過去の議論を参照

---

**Made with ❤️ for Research Labs**
