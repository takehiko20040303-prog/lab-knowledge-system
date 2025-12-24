# デプロイメントガイド

このアプリを公開する方法をまとめました。

## オプション1: Webアプリとして公開（推奨・無料）

### Vercelにデプロイ

**1. GitHubリポジトリ作成**
```bash
cd /Users/makiyamahiroshishirou/Desktop/lab-knowledge-system
git init
git add .
git commit -m "Initial commit"

# GitHubにpush（gh CLIを使用）
gh repo create lab-knowledge-system --public --source=. --remote=origin
git push -u origin main
```

**2. Vercelでデプロイ**
```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel --prod
```

**3. 環境変数を設定**
Vercelダッシュボード（https://vercel.com）で：
- Settings → Environment Variables
- `.env.local`の内容をすべて追加

**メリット:**
- 完全無料
- 自動HTTPS
- 高速CDN
- 自動デプロイ（Gitにpushするだけ）

---

## オプション2: PWAとして公開

すでに実装済みです！

**使い方:**
1. ブラウザでアプリにアクセス
2. スマホの場合：「ホーム画面に追加」
3. PCの場合：アドレスバーの「インストール」ボタン

**メリット:**
- ネイティブアプリのように使える
- オフライン対応可能
- プッシュ通知可能（追加実装が必要）

---

## オプション3: ネイティブアプリ化（iOS/Android）

### Capacitorを使用

**1. Capacitorをインストール**
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init "研究室ノウハウ" "com.lab.knowledge" --web-dir=out
```

**2. プラットフォームを追加**
```bash
# Static exportを有効化
# next.config.tsに追加: output: 'export'

npm run build
npx cap add ios
npx cap add android
```

**3. ネイティブプロジェクトを開く**
```bash
# iOS
npx cap open ios

# Android
npx cap open android
```

**4. ストアに提出**
- **App Store:** Apple Developer Program ($99/年)
- **Google Play:** Google Play Console ($25 一回限り)

**メリット:**
- ネイティブアプリとして配布
- App Store/Google Playで検索可能

**デメリット:**
- 年間コスト
- 審査が必要
- メンテナンスが複雑

---

## 推奨デプロイ方法

### 研究室内で使用する場合

**方法1: Vercel（推奨）**
- 完全無料
- 簡単にデプロイ
- 自動HTTPS
- URLを共有するだけ

**方法2: PWA**
- Vercelにデプロイ後
- 各自がホーム画面に追加
- アプリのように使える

### 一般公開する場合

**App Store/Google Play**
- ネイティブアプリ化が必要
- 審査とコストが発生
- より多くのユーザーにリーチ

---

## 環境変数の管理

**重要:** `.env.local`は絶対にGitにpushしないでください！

すでに`.gitignore`に含まれています：
```
.env*.local
```

**Vercelでの設定:**
1. Vercelダッシュボードを開く
2. プロジェクト → Settings → Environment Variables
3. 以下を追加：
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GEMINI_API_KEY`

---

## ドメイン設定

**Vercelの無料ドメイン:**
- `your-app.vercel.app`

**カスタムドメイン:**
1. ドメインを購入（例: Google Domains, Namecheap）
2. Vercelダッシュボードで設定
3. DNSレコードを更新

---

## セキュリティ設定

**Firebase:**
1. Firebaseコンソール → Authentication
2. 承認済みドメインに本番URLを追加

**CORS設定:**
すでにNext.jsで適切に設定されています。

---

## モニタリング

**Vercel Analytics（無料）:**
```bash
npm install @vercel/analytics
```

`app/layout.tsx`に追加：
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## トラブルシューティング

**ビルドエラー:**
```bash
# キャッシュをクリア
rm -rf .next node_modules
npm install
npm run build
```

**環境変数が読み込まれない:**
- `NEXT_PUBLIC_`プレフィックスがあるか確認
- Vercelで再デプロイ

**Firebaseエラー:**
- Firebaseコンソールで本番URLを承認済みドメインに追加
- Firestore/Storageルールを確認

---

## まとめ

**最も簡単な方法:**
1. GitHubにpush
2. Vercelに接続
3. 自動デプロイ
4. URLを共有

所要時間: 約5分

完全無料で、研究室のメンバー全員がアクセスできます！
