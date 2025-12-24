# 🚀 クイックスタート - アプリを公開する

## ステップ1: GitHubにコードをアップロード

### 方法1: GitHub Web UI（簡単）

1. **GitHub.comでリポジトリ作成**
   - https://github.com/new にアクセス
   - Repository name: `lab-knowledge-system`
   - Public を選択
   - 「Create repository」をクリック

2. **既存のコードをpush**
   ```bash
   cd /Users/makiyamahiroshishirou/Desktop/lab-knowledge-system

   # リモートを追加（YOUR_USERNAMEを自分のGitHubユーザー名に変更）
   git remote add origin https://github.com/YOUR_USERNAME/lab-knowledge-system.git

   # Push
   git branch -M main
   git push -u origin main
   ```

### 方法2: GitHub Desktop（GUI）

1. GitHub Desktopをダウンロード: https://desktop.github.com/
2. アプリを開いて「File」→「Add Local Repository」
3. `/Users/makiyamahiroshishirou/Desktop/lab-knowledge-system` を選択
4. 「Publish repository」をクリック

---

## ステップ2: Vercelでデプロイ（無料）

### 2-1. Vercelアカウント作成

1. https://vercel.com にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントで登録

### 2-2. プロジェクトをインポート

1. Vercelダッシュボードで「Add New...」→「Project」
2. GitHubリポジトリ一覧から `lab-knowledge-system` を選択
3. 「Import」をクリック

### 2-3. 環境変数を設定

**重要:** デプロイ前に環境変数を設定してください！

Vercelの設定画面で「Environment Variables」に以下を追加：

```
NEXT_PUBLIC_FIREBASE_API_KEY=あなたのFirebase APIキー
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=あなたのプロジェクト.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=あなたのプロジェクトID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=あなたのプロジェクト.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=あなたのSender ID
NEXT_PUBLIC_FIREBASE_APP_ID=あなたのApp ID
GEMINI_API_KEY=あなたのGemini APIキー
```

**環境変数の値を確認:**
```bash
cat .env.local
```

### 2-4. デプロイ

1. 「Deploy」ボタンをクリック
2. 数分待つ
3. デプロイ完了！🎉

あなたのアプリのURL: `https://lab-knowledge-system.vercel.app`

---

## ステップ3: Firebaseの設定を更新

### 3-1. 承認済みドメインを追加

1. Firebaseコンソール: https://console.firebase.google.com/
2. あなたのプロジェクトを選択
3. 「Authentication」→「Settings」→「Authorized domains」
4. 「Add domain」をクリック
5. Vercelから発行されたURLを追加（例: `lab-knowledge-system.vercel.app`）

これでログイン機能が使えるようになります！

---

## ステップ4: PWAとしてインストール（オプション）

### スマホの場合

1. デプロイしたURLをブラウザで開く
2. メニューから「ホーム画面に追加」を選択
3. アプリのようにホーム画面から起動できます！

### PCの場合（Chrome）

1. デプロイしたURLをChromeで開く
2. アドレスバー右側の「インストール」ボタンをクリック
3. アプリとして使えます！

---

## 完了！ 🎉

これで研究室のメンバー全員がアクセスできるWebアプリが完成しました！

**URLを共有:**
- Vercelから発行されたURL（例: `https://lab-knowledge-system.vercel.app`）を研究室メンバーに共有

**今後の更新:**
1. コードを編集
2. `git add .`
3. `git commit -m "更新内容"`
4. `git push`
5. Vercelが自動的に再デプロイ！

---

## トラブルシューティング

### ログインできない
→ Firebaseの承認済みドメインにVercel URLを追加したか確認

### ファイルアップロードできない
→ ブラウザのコンソール（F12）でエラーを確認

### ビルドエラー
→ 環境変数が正しく設定されているか確認

### その他の問題
→ `DEPLOYMENT_GUIDE.md` を参照

---

## コスト

- **Vercel:** 完全無料（Hobbyプラン）
- **Firebase:** 無料枠内で使用可能
- **Gemini API:** 無料枠あり

合計: **$0/月** 🎉
