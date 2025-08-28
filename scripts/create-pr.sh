#!/bin/bash

# GitHub Actions の権限問題を回避する簡易PR作成スクリプト
# 使い方: ./scripts/create-pr.sh "feature/新機能" "新機能の説明"

set -e

BRANCH_NAME="${1:-$(git branch --show-current)}"
PR_TITLE="${2:-🚀 Pull Request for $BRANCH_NAME}"
BASE_BRANCH="${3:-master}"

echo "🤖 自動PR作成スクリプト"
echo "ブランチ: $BRANCH_NAME"
echo "ベース: $BASE_BRANCH" 
echo "タイトル: $PR_TITLE"

# 現在のブランチを確認
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    echo "⚠️ 警告: 現在のブランチ ($CURRENT_BRANCH) と指定されたブランチ ($BRANCH_NAME) が異なります"
    read -p "続行しますか? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "キャンセルしました"
        exit 1
    fi
fi

# 変更をプッシュ（まだの場合）
echo "📤 リモートにプッシュ中..."
git push origin "$BRANCH_NAME" || echo "プッシュ済みまたはエラー"

# PR本文を生成
cat > /tmp/pr_body.md << EOF
## 🤖 手動作成されたPull Request

**ブランチ**: \`$BRANCH_NAME\`
**ベース**: \`$BASE_BRANCH\`

### 📝 変更内容
$(git log --oneline $BASE_BRANCH..HEAD | head -5)

### 📊 変更ファイル
\`\`\`
$(git diff --name-only $BASE_BRANCH..HEAD | head -10)
\`\`\`

### 🔍 チェックリスト
- [ ] コードレビュー完了
- [ ] テスト実行確認  
- [ ] ドキュメント更新（必要に応じて）
- [ ] セキュリティチェック完了

### 🚀 次のステップ
1. GitHub Copilot レビューが自動実行されます
2. CI/CD パイプラインが実行されます
3. レビュー完了後、マージ可能になります

---
🛠️ このPRは \`create-pr.sh\` スクリプトにより作成されました
EOF

# GitHub CLI でPR作成
echo "📋 Pull Request作成中..."
if command -v gh &> /dev/null; then
    PR_URL=$(gh pr create \
        --title "$PR_TITLE" \
        --body-file /tmp/pr_body.md \
        --base "$BASE_BRANCH" \
        --head "$BRANCH_NAME")
    
    echo "✅ PR作成成功: $PR_URL"
    
    # PR番号を抽出
    PR_NUMBER=$(echo "$PR_URL" | sed 's|.*/||')
    
    # ラベルを追加
    echo "🏷️ ラベル追加中..."
    LABELS="auto-generated,needs-review"
    
    if [[ "$BRANCH_NAME" == feature/* ]]; then
        LABELS="$LABELS,enhancement"
    elif [[ "$BRANCH_NAME" == fix/* ]] || [[ "$BRANCH_NAME" == bugfix/* ]]; then
        LABELS="$LABELS,bug"  
    elif [[ "$BRANCH_NAME" == hotfix/* ]]; then
        LABELS="$LABELS,hotfix,priority-high"
    elif [[ "$BRANCH_NAME" == docs/* ]]; then
        LABELS="$LABELS,documentation"
    fi
    
    gh pr edit "$PR_NUMBER" --add-label "$LABELS" || echo "ラベル追加をスキップ"
    
    # Copilot レビュー開始コメント
    echo "🤖 Copilotレビューコメント追加中..."
    gh pr comment "$PR_NUMBER" --body "## 🤖 GitHub Copilot レビュー開始

このPRに対して自動コード分析を実行します：

- ✅ コード品質チェック
- ✅ セキュリティ脆弱性スキャン
- ✅ パフォーマンス最適化提案
- ✅ ベストプラクティス検証

分析結果はCI実行完了後にコメントされます。

---
💡 より詳細な分析が必要な場合は \`@github-actions\` にメンションしてください。"

    echo "🎉 PR #$PR_NUMBER が正常に作成されました！"
    echo "🔗 URL: $PR_URL"
    
else
    echo "❌ GitHub CLI (gh) がインストールされていません"
    echo "手動でPRを作成してください: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/compare/$BASE_BRANCH...$BRANCH_NAME"
fi

# 一時ファイル削除
rm -f /tmp/pr_body.md

echo "✨ 完了！GitHubでPRとCI実行状況を確認してください。"
