# Flappy Bird Clone

モダンなフロントエンド技術とDevOpsプラクティスを使用した、Flappy Birdのクローンゲームです。

## 📖 目次
- [🎮 ゲーム仕様](#-ゲーム仕様)
- [🏗️ アーキテクチャ](#️-アーキテクチャ)
- [🚀 クイックスタート](#-クイックスタート)
- [🔧 開発・運用](#-開発運用)
- [🏭 CI/CD パイプライン](#-cicd-パイプライン)
- [🐳 Docker構成](#-docker構成)
- [📱 モバイル対応](#-モバイル対応)
- [🎯 ゲーム機能詳細](#-ゲーム機能詳細)
- [🔒 セキュリティ](#-セキュリティ)
- [📈 監視・ログ](#-監視ログ)
- [🤝 コントリビューション](#-コントリビューション)

## 🎮 ゲーム仕様

- **操作**: Space、Click、Touchでジャンプ、Pでポーズ
- **物理**: 重力・上昇・落下制御、deltaTimeによるラグ補正
- **障害物**: 上下パイプ（隙間ランダム）、左へスクロール
- **当たり判定**: パイプ、天井、地面との衝突検知
- **スコア**: パイプ通過で+1、ベストスコアはLocalStorageに保存
- **画面状態**: 開始・プレイ中・ゲームオーバー・ポーズの4状態
- **レンダリング**: Canvas 2D、requestAnimationFrame
- **モバイル対応**: タップ操作、HiDPIスケーリング、レスポンシブデザイン

## 🏗️ アーキテクチャ

### フォルダ構成
```
/
├─ Dockerfile                  # Nginx Alpine ベースイメージ
├─ docker-compose.yml          # ローカル開発用
├─ docker-compose.prod.yml     # 本番環境用
├─ package.json               # Node.js プロジェクト設定
├─ .gitignore                 # Git追跡除外ファイル
├─ README.md
├─ GITHUB_ACTIONS_SETUP.md    # GitHub Actions 設定ガイド
├─ nginx/
│   └─ default.conf           # Nginx設定（gzip、キャッシュ制御）
├─ public/                    # 静的ファイル
│   ├─ index.html
│   ├─ css/
│   │   └─ style.css          # メインスタイルシート
│   └─ js/                    # ES Modules構成
│       ├─ config.js          # ゲーム設定定数
│       ├─ utils.js           # ユーティリティ関数
│       ├─ input.js           # 入力管理
│       ├─ state.js           # ゲーム状態管理
│       ├─ pipes.js           # パイプシステム
│       ├─ bird.js            # 鳥キャラクター
│       ├─ score.js           # スコア管理
│       └─ main.js            # メインゲームループ
├─ scripts/
│   └─ test.js               # テストスクリプト
└─ .github/workflows/
    ├─ auto-pr-review.yml    # 自動PR作成とレビュー
    └─ pr-copilot-review.yml # GitHub Copilot CLIレビュー
```

### コード設計
- **モジュラー設計**: ES Modulesによる責務分離
- **設定管理**: `config.js`に重要定数を集約
- **物理演算**: deltaTimeによるフレームレート非依存
- **状態管理**: ゲーム状態の明確な分離
- **イベント駆動**: カスタムイベントによる疎結合

## 🚀 クイックスタート

### ローカル実行

```bash
# リポジトリクローン
git clone https://github.com/willdo-e-ryu/claude-sonnet-demo.git
cd claude-sonnet-demo

# Docker Composeで起動
docker compose up --build

# または直接Dockerで起動
docker build -t flappy-bird-clone .
docker run --rm -p 8080:80 flappy-bird-clone
```

**アクセス**: http://localhost:8080

### 本番環境デプロイ

```bash
# 本番用イメージのpull
docker pull ghcr.io/<namespace>/flappy-nginx:latest

# 本番環境で起動
REGISTRY_NAMESPACE=<namespace> IMAGE_NAME=flappy-nginx IMAGE_TAG=latest \
docker compose -f docker-compose.prod.yml up -d
```

## 🔧 開発・運用

### デバッグモード
`public/js/config.js`の`DEBUG`フラグを`true`に設定すると、FPS・deltaTime・鳥の座標などの詳細情報が画面に表示されます。

### パフォーマンス最適化
- **HiDPI対応**: 高解像度ディスプレイでの鮮明な描画
- **deltaTime補正**: フレームレートの変動に対応
- **効率的な当たり判定**: 最小限の計算で正確な衝突検知
- **メモリ管理**: 画面外オブジェクトの自動削除

## 🏭 CI/CD パイプライン

### 自動Pull Request & GitHub Copilotレビュー 🤖
- **トリガー**: feature/fix/などのブランチにプッシュ時
- **自動処理**:
  - Pull Requestの自動作成
  - 適切なラベル付与（ブランチ名に基づく）
  - GitHub Copilot CLIによる詳細コードレビュー
  - セキュリティ・パフォーマンス分析
  - 改善提案の自動生成

### GitHub Actions ワークフロー
- **auto-pr-review.yml**: 自動PR作成とレビュー
- **pr-copilot-review.yml**: GitHub Copilot CLIによるコードレビュー
- **実行**: Push/PR時の自動実行

### 🤖 自動PR作成の使い方

**Option 1: 自動ワークフロー（権限設定が必要）**

1. **GitHubリポジトリ設定**:
   ```
   Settings → Actions → General → Workflow permissions
   → ☑️ "Read and write permissions"  
   → ☑️ "Allow GitHub Actions to create and approve pull requests"
   ```

2. **ブランチ作成・プッシュ**:
   ```bash
   git checkout -b feature/new-awesome-feature
   # 変更・コミット
   git push origin feature/new-awesome-feature
   # → 自動でPR作成！
   ```

**Option 2: 簡易スクリプト（即座に利用可能）**

```bash
# 1. ブランチで作業
git checkout -b feature/my-feature
# コードを変更...
git add . && git commit -m "feat: 新機能追加"

# 2. PR作成スクリプト実行
./scripts/create-pr.sh

# 3. 自動でPRが作成され、Copilotレビューが実行される
```

### 必要なSecrets設定
現在のプロジェクトでは以下のシークレットが自動的に利用可能です：
```yaml
GITHUB_TOKEN: 自動生成（GitHub Actionsデフォルト）
```

追加のデプロイ設定が必要な場合：
```yaml
SSH_PRIVATE_KEY: "-----BEGIN OPENSSH PRIVATE KEY-----"
SSH_USER: "deploy-user"
SSH_HOST: "production.example.com"
SSH_PORT: "22"
DEPLOY_DIR: "/opt/flappy"
```

## 🐳 Docker構成

### Nginx設定
- **ベースイメージ**: `nginx:alpine`
- **gzip圧縮**: JS/CSS/JSONファイル
- **キャッシュ制御**:
  - HTML: `no-store`（常に最新）
  - 静的アセット: `max-age=31536000, immutable`（1年キャッシュ）
- **セキュリティヘッダー**: `X-Content-Type-Options`, `X-Frame-Options`

### マルチステージビルド
本番用イメージは軽量化のため、必要最小限のファイルのみを含んでいます。

## 📱 モバイル対応

- **タッチ操作**: 画面タップでジャンプ
- **レスポンシブデザイン**: 画面サイズに応じたキャンバスリサイズ
- **HiDPI対応**: Retinaディスプレイでの高品質描画
- **PWA対応**: 将来的な拡張でオフライン対応可能

## 🎯 ゲーム機能詳細

### 物理エンジン
- **重力**: 一定の下向き加速度
- **ジャンプ**: 瞬間的な上向き速度
- **端末落下速度**: 過度な加速を防止
- **ラグ補正**: deltaTimeによるフレームレート非依存の動作

### スコアシステム
- **基本スコア**: パイプ通過時に+1
- **ベストスコア**: LocalStorageに永続保存
- **新記録エフェクト**: パーティクル風アニメーション
- **視覚フィードバック**: スコア取得時のスケール・カラーアニメーション

### 状態管理
- **START**: ゲーム開始前
- **PLAYING**: プレイ中
- **PAUSED**: ポーズ中
- **GAME_OVER**: ゲーム終了

## 🔒 セキュリティ

- **コンテンツタイプ検証**: MIMEスニッフィング攻撃対策
- **フレームオプション**: クリックジャッキング対策
- **XSS保護**: 反射型XSS攻撃対策
- **HTTPS推奨**: 本番環境でのセキュア通信

## 📈 監視・ログ

- **ヘルスチェックエンドポイント**: `/health`
- **アクセスログ**: Nginxによる標準ログ出力
- **エラーハンドリング**: JavaScript例外の適切な処理
- **パフォーマンス計測**: FPSカウンター（デバッグモード）

## 🤝 コントリビューション

1. Forkしてfeatureブランチを作成
2. 変更をコミット（意図的なコミットメッセージで）
3. テストを実行し、CIが通ることを確認
4. Pull Requestを作成

## 📄 ライセンス

MIT License - 自由に使用・改変・配布可能です。

## 🙋‍♂️ サポート

問題や質問がある場合は、GitHubのIssueを作成してください。

---

**楽しいゲーミングを！** 🎮✨
