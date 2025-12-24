# ✅ デプロイ前チェックリスト

アプリを公開する前に確認してください！

## 📋 必須項目

### ✅ ローカル環境
- [x] アプリがローカルで正常に動作している
- [x] すべての機能をテスト済み
  - [x] ログイン
  - [x] 議事録作成
  - [x] ファイルアップロード（500KB以下）
  - [x] ファイル削除
  - [x] 年度別フィルター
  - [x] 検索機能

### ✅ Firebase設定
- [ ] Firebaseプロジェクトを作成済み
- [ ] Authentication（Google）を有効化済み
- [ ] Firestoreを有効化済み
- [ ] Firestore Rulesを設定済み
- [ ] Firebase APIキーを取得済み

### ✅ Gemini API
- [ ] Gemini APIキーを取得済み
- [ ] APIが正常に動作することを確認

### ✅ 環境変数
- [ ] `.env.local`ファイルが存在する
- [ ] すべての環境変数が設定されている
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
  - [ ] `GEMINI_API_KEY`

### ✅ Git & GitHub
- [ ] Gitリポジトリを初期化済み
- [ ] すべてのファイルをコミット済み
- [ ] GitHubアカウントを持っている
- [ ] GitHubリポジトリを作成済み（または作成準備完了）

### ✅ Vercel
- [ ] Vercelアカウントを作成済み（または作成準備完了）

---

## 🚀 デプロイ手順

すべてのチェックボックスにチェックが入ったら、デプロイ開始！

### ステップ1: GitHubにpush
```bash
# リモートを追加（YOUR_USERNAMEを変更）
git remote add origin https://github.com/YOUR_USERNAME/lab-knowledge-system.git

# Push
git push -u origin main
```

### ステップ2: Vercelでデプロイ
1. https://vercel.com にアクセス
2. GitHubリポジトリをインポート
3. 環境変数を設定（`.env.local`の内容をコピー）
4. デプロイ！

### ステップ3: Firebase設定更新
1. Firebaseコンソールで承認済みドメインにVercel URLを追加
2. Firestore Indexを作成（エラーメッセージのリンクから作成可能）

---

## 🧪 デプロイ後テスト

デプロイが完了したら、以下を確認：

### ✅ 基本機能
- [ ] 本番URLにアクセスできる
- [ ] ログインが正常に動作する
- [ ] 議事録を作成できる
- [ ] ファイルをアップロードできる
- [ ] ファイルを削除できる
- [ ] 年度フィルターが動作する
- [ ] 検索が動作する

### ✅ PWA
- [ ] manifest.jsonが読み込まれている
- [ ] スマホで「ホーム画面に追加」が表示される
- [ ] PCで「インストール」ボタンが表示される

### ✅ パフォーマンス
- [ ] ページの読み込みが速い
- [ ] 画像が正しく表示される
- [ ] レスポンシブデザインが動作する

---

## 🔧 よくある問題

### ログインできない
→ Firebaseの承認済みドメインにVercel URLを追加

### ビルドエラー
→ 環境変数が正しく設定されているか確認

### Firestoreエラー
→ Firebaseコンソールでインデックスを作成

### ファイルアップロードエラー
→ ファイルサイズが500KB以下か確認

---

## 📚 参考資料

- [QUICK_START.md](./QUICK_START.md) - 簡単デプロイ手順
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 詳細ガイド
- [README.md](./README.md) - プロジェクト概要
- [デプロイ手順.txt](./デプロイ手順.txt) - 日本語簡易版

---

## 🎉 完了！

すべてのチェックが完了したら、研究室メンバーにURLを共有しましょう！

**URLの例:**
https://lab-knowledge-system.vercel.app

**共有メッセージの例:**
```
研究室ノウハウ蓄積システムを公開しました！

URL: https://lab-knowledge-system.vercel.app

Googleアカウントでログインして使ってください。
議事録の作成やファイルのアップロードができます。

使い方がわからない場合は気軽に聞いてください！
```

---

**Good Luck! 🚀**
