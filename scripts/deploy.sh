#!/bin/bash

# Deploy script for Flappy Bird Clone
# デプロイ先サーバでの自動デプロイスクリプト

set -e

# 環境変数の設定
DEPLOY_DIR="${DEPLOY_DIR:-/opt/flappy}"
REGISTRY_NAMESPACE="${REGISTRY_NAMESPACE:-your-namespace}"
IMAGE_NAME="${IMAGE_NAME:-flappy-nginx}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-ghcr.io}"

echo "Starting deployment..."
echo "Deploy directory: $DEPLOY_DIR"
echo "Image: $REGISTRY/$REGISTRY_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG"

# デプロイディレクトリの作成
sudo mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# .env ファイルの作成/更新
cat > .env << EOF
REGISTRY=$REGISTRY/$REGISTRY_NAMESPACE
IMAGE_NAME=$IMAGE_NAME
IMAGE_TAG=$IMAGE_TAG
NODE_ENV=production
EOF

echo "Environment file created:"
cat .env

# Docker Compose設定が存在するかチェック
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "Error: docker-compose.prod.yml not found in $DEPLOY_DIR"
    echo "Please ensure the deployment files are properly transferred."
    exit 1
fi

# Docker login (必要に応じて)
if [ -n "$DOCKER_REGISTRY_PASSWORD" ] && [ -n "$DOCKER_REGISTRY_USERNAME" ]; then
    echo "Logging into Docker registry..."
    echo "$DOCKER_REGISTRY_PASSWORD" | docker login "$REGISTRY" -u "$DOCKER_REGISTRY_USERNAME" --password-stdin
fi

# 既存コンテナの停止
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml --env-file .env down || true

# 最新イメージの取得
echo "Pulling latest images..."
docker compose -f docker-compose.prod.yml --env-file .env pull

# コンテナの起動
echo "Starting containers..."
docker compose -f docker-compose.prod.yml --env-file .env up -d

# 不要なイメージの削除
echo "Cleaning up unused images..."
docker image prune -f || true

# ヘルスチェック
echo "Performing health check..."
sleep 10

if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Deployment successful! Application is running."
else
    echo "❌ Health check failed. Checking container status..."
    docker compose -f docker-compose.prod.yml --env-file .env logs
    exit 1
fi

# デプロイ情報の記録
echo "Recording deployment info..."
cat > deployment.log << EOF
Deployment completed at: $(date)
Image: $REGISTRY/$REGISTRY_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG
Git commit: ${GITHUB_SHA:-unknown}
Deployed by: ${GITHUB_ACTOR:-local}
EOF

echo "Deployment completed successfully!"
echo "Application is available at: http://localhost:8080"
