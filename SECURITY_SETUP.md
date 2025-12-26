# 🔐 セキュリティ設定ガイド

デプロイ後に**必ず**設定してください！

## ✅ Firestoreセキュリティルールの設定（必須）

### 手順

1. **Firebaseコンソールにアクセス**
   https://console.firebase.google.com/

2. **プロジェクトを選択**

3. **Firestoreに移動**
   - サイドメニューから「Firestore Database」をクリック

4. **ルールタブを開く**
   - 上部の「ルール」タブをクリック

5. **以下のルールをコピー&ペースト**

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // 議事録（minutes）コレクション
    match /minutes/{minuteId} {
      // 認証済みユーザーのみアクセス可能
      // 自分が作成した議事録のみ読み書き可能
      allow read: if request.auth != null
                  && request.auth.uid == resource.data.userId;

      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.userId;

      allow update, delete: if request.auth != null
                            && request.auth.uid == resource.data.userId;
    }

    // 編集履歴（editHistory）コレクション - 将来の拡張用
    match /editHistory/{historyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.userId;
    }

    // その他すべてのコレクションはデフォルトで拒否
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. **「公開」ボタンをクリック**

---

## ✅ Firebase Authentication 承認済みドメインの設定

1. **Firebaseコンソール → Authentication → Settings**

2. **「Authorized domains」セクション**

3. **Vercel URLを追加**
   - 例: `lab-knowledge-system.vercel.app`
   - `localhost` はすでに含まれています

---

## ✅ セキュリティチェックリスト

デプロイ後、以下を確認してください：

- [ ] Firestoreルールを設定した
- [ ] 承認済みドメインにVercel URLを追加した
- [ ] `.env.local` がGitHubにpushされていない（.gitignoreで除外済み）
- [ ] Vercelで環境変数を設定した
- [ ] ログイン→議事録作成→保存→削除が正常に動作することを確認
- [ ] 他人のブラウザで自分の議事録が見えないことを確認（別アカウントでテスト）

---

## 🚨 重要な注意事項

### 現在のセキュリティ設定

- ✅ **ユーザー認証**: Googleログインのみ
- ✅ **データ分離**: 各ユーザーは自分の議事録のみアクセス可能
- ✅ **APIキー保護**: Gemini APIキーはサーバーサイドで管理

### もし研究室全員でデータを共有したい場合

現在の設定では各ユーザーのデータは完全に分離されています。

研究室メンバー全員で議事録を共有したい場合は、以下のように変更してください：

**firestore.rulesを以下に変更:**

```
match /minutes/{minuteId} {
  // 認証済みユーザー全員が読み取り可能
  // 自分が作成したもののみ編集・削除可能
  allow read: if request.auth != null;

  allow create: if request.auth != null
                && request.auth.uid == request.resource.data.userId;

  allow update, delete: if request.auth != null
                        && request.auth.uid == resource.data.userId;
}
```

これにより、ログインした研究室メンバー全員が全議事録を閲覧できます。

---

## 📞 トラブルシューティング

### ログインできない
→ 承認済みドメインにVercel URLが追加されているか確認

### 議事録が保存できない
→ Firestoreルールが正しく設定されているか確認

### 他人の議事録が見える
→ それが意図した動作かどうか確認（上記の共有設定を参照）

---

**設定完了後、必ずアプリの動作確認を行ってください！**
