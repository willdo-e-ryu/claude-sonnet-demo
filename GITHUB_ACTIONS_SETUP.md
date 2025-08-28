# GitHub Actions権限設定ガイド

## 問題: Pull Request作成エラー

```
pull request create failed: GraphQL: GitHub Actions is not permitted to create or approve pull requests
```

## 解決方法

### 1. リポジトリ設定の変更

GitHubリポジトリの設定を以下の手順で変更してください：

1. **リポジトリにアクセス**
   - https://github.com/willdo-e-ryu/claude-sonnet-demo

2. **Settings タブをクリック**

3. **Actions → General に移動**

4. **Workflow permissions セクション**で以下を選択：
   - ☑️ **Read and write permissions**
   - ☑️ **Allow GitHub Actions to create and approve pull requests**

5. **Save** をクリック

### 2. 代替解決策

上記設定が変更できない場合は、以下のワークフローを使用：

- `simple-auto-pr.yml` - よりシンプルなPR作成
- `peter-evans/create-pull-request@v5` アクションを使用
- 権限問題を回避する設計

### 3. 確認方法

設定変更後、テストブランチで確認：

```bash
git checkout -b test/auto-pr-fix
echo "// Test PR creation fix" >> public/js/config.js  
git add .
git commit -m "test: PR作成権限修正のテスト"
git push origin test/auto-pr-fix
```

### 4. トラブルシューティング

**問題が続く場合：**
- リポジトリのオーナー権限を確認
- Organization の場合は、Organization レベルの権限も確認
- Personal Access Token の使用を検討

**成功のサイン：**
- Actions タブでワークフロー実行成功
- Pull Requests タブに新しいPRが作成される
- 自動コメントが投稿される

### 5. 追加の推奨設定

**Branch protection rules:**
- `master` ブランチの直接pushを制限
- PR レビュー必須に設定
- Status checks 必須に設定

**Notifications:**
- PR作成時の通知設定
- レビュー要求の自動化
