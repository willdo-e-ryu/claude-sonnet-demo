/**
 * Flappy Bird Clone - メインゲームループ
 * ES Modules を使用したモジュラー設計
 */

import { CONFIG } from './config.js';
import { setupHiDPI, updateDebugInfo, FPSCounter } from './utils.js';
import { InputManager } from './input.js';
import { GameStateManager } from './state.js';
import { Bird } from './bird.js';
import { PipeManager } from './pipes.js';
import { ScoreManager } from './score.js';

/**
 * ゲームクラス
 * 全体のゲームループと各システムの統合を担当
 */
class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.lastTime = 0;
        
        // システム管理オブジェクト
        this.fpsCounter = new FPSCounter();
        this.gameStateManager = new GameStateManager();
        this.inputManager = null;
        this.bird = new Bird();
        this.pipeManager = new PipeManager();
        this.scoreManager = new ScoreManager(this.gameStateManager);
        
        this.initializeGame();
    }
    
    /**
     * ゲームの初期化
     */
    initializeGame() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupInputManager();
        this.startGameLoop();
    }
    
    /**
     * キャンバスの設定
     */
    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas要素が見つかりません');
        }
        
        // 高DPI対応
        setupHiDPI(this.canvas, this.ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // キャンバスのスタイル調整（レスポンシブ対応）
        this.adjustCanvasSize();
        window.addEventListener('resize', () => this.adjustCanvasSize());
    }
    
    /**
     * キャンバスサイズの調整（レスポンシブ対応）
     */
    adjustCanvasSize() {
        const container = document.getElementById('gameContainer');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // アスペクト比を維持しながら最大サイズを計算
        const aspectRatio = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
        let canvasWidth, canvasHeight;
        
        if (containerWidth / containerHeight > aspectRatio) {
            // 高さ基準
            canvasHeight = containerHeight * 0.9; // 少しマージンを取る
            canvasWidth = canvasHeight * aspectRatio;
        } else {
            // 幅基準
            canvasWidth = containerWidth * 0.9;
            canvasHeight = canvasWidth / aspectRatio;
        }
        
        // 最小サイズの制限
        canvasWidth = Math.max(canvasWidth, 320);
        canvasHeight = Math.max(canvasHeight, 480);
        
        // キャンバスのスタイルを更新
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ゲーム状態変更
        document.addEventListener('stateChanged', (e) => {
            this.handleStateChange(e.detail);
        });
        
        // 鳥の死亡
        document.addEventListener('birdDied', () => {
            this.handleBirdDeath();
        });
        
        // スコア追加
        document.addEventListener('scoreAdded', (e) => {
            console.log('Score added:', e.detail);
        });
        
        // ページの可視性変更（タブ切り替え等）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameStateManager.isPlaying()) {
                this.gameStateManager.pauseGame();
            }
        });
    }
    
    /**
     * 入力管理の設定
     */
    setupInputManager() {
        this.inputManager = new InputManager(this.canvas, this.gameStateManager);
    }
    
    /**
     * ゲーム状態変更の処理
     * @param {Object} detail - 状態変更の詳細
     */
    handleStateChange(detail) {
        const { newState, previousState } = detail;
        
        switch (newState) {
            case CONFIG.STATES.PLAYING:
                if (previousState === CONFIG.STATES.START) {
                    this.resetGame();
                }
                break;
                
            case CONFIG.STATES.GAME_OVER:
                this.scoreManager.onGameEnd();
                break;
        }
    }
    
    /**
     * 鳥の死亡処理
     */
    handleBirdDeath() {
        this.gameStateManager.endGame();
    }
    
    /**
     * ゲームリセット
     */
    resetGame() {
        this.bird.reset();
        this.pipeManager.reset();
        this.scoreManager.reset();
    }
    
    /**
     * メインゲームループの開始
     */
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    /**
     * ゲームループ
     * @param {number} currentTime - 現在時刻
     */
    gameLoop(currentTime = performance.now()) {
        // FPS計算
        const performanceData = this.fpsCounter.update();
        
        // デルタタイム計算（ラグ補正）
        const deltaTime = Math.min(currentTime - this.lastTime, CONFIG.PHYSICS.MAX_DELTA_TIME);
        this.lastTime = currentTime;
        
        // 更新処理
        this.update(deltaTime, currentTime);
        
        // 描画処理
        this.draw();
        
        // デバッグ情報更新
        if (CONFIG.DEBUG) {
            const debugData = {
                ...performanceData,
                deltaTime: Math.round(deltaTime * 10) / 10,
                ...this.bird.getDebugInfo(),
                pipeCount: this.pipeManager.getPipeCount()
            };
            updateDebugInfo(debugData);
        }
        
        // 次のフレームを予約
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * ゲーム更新処理
     * @param {number} deltaTime - フレーム間の経過時間
     * @param {number} currentTime - 現在時刻
     */
    update(deltaTime, currentTime) {
        const isPlaying = this.gameStateManager.isPlaying();
        
        // 鳥の更新
        this.bird.update(deltaTime, isPlaying);
        
        // パイプの更新
        if (isPlaying) {
            this.pipeManager.update(deltaTime, currentTime);
            
            // 当たり判定
            if (this.bird.getIsAlive()) {
                const birdRect = this.bird.getCollisionRect();
                
                if (this.pipeManager.checkCollision(birdRect)) {
                    this.bird.die();
                }
                
                // スコア計算
                const newScore = this.pipeManager.checkScoring(this.bird.x + CONFIG.BIRD.WIDTH);
                if (newScore > 0) {
                    this.scoreManager.addScore(newScore);
                }
            }
        }
    }
    
    /**
     * ゲーム描画処理
     */
    draw() {
        // 画面クリア
        this.clearScreen();
        
        // 背景描画
        this.drawBackground();
        
        // パイプ描画
        this.pipeManager.draw(this.ctx);
        
        // 地面描画
        this.drawGround();
        
        // 鳥描画
        this.bird.draw(this.ctx);
        
        // ポーズ状態の表示
        if (this.gameStateManager.isPaused()) {
            this.drawPauseOverlay();
        }
    }
    
    /**
     * 画面クリア
     */
    clearScreen() {
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }
    
    /**
     * 背景描画
     */
    drawBackground() {
        // グラデーション背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
        gradient.addColorStop(0, '#87CEEB'); // 空色
        gradient.addColorStop(0.7, '#98FB98'); // 薄緑
        gradient.addColorStop(1, '#90EE90'); // ライトグリーン
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // 雲の描画（簡易版）
        this.drawClouds();
    }
    
    /**
     * 雲の描画
     */
    drawClouds() {
        const cloudPositions = [
            { x: 100, y: 80, scale: 1 },
            { x: 300, y: 120, scale: 0.8 },
            { x: 200, y: 180, scale: 0.6 }
        ];
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        cloudPositions.forEach(cloud => {
            this.drawCloud(cloud.x, cloud.y, cloud.scale);
        });
    }
    
    /**
     * 個別の雲を描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} scale - スケール
     */
    drawCloud(x, y, scale = 1) {
        const size = 20 * scale;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.2, y + size * 0.3, size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 地面描画
     */
    drawGround() {
        const groundY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND.HEIGHT;
        
        // 地面本体
        this.ctx.fillStyle = CONFIG.GROUND.COLOR;
        this.ctx.fillRect(0, groundY, CONFIG.CANVAS_WIDTH, CONFIG.GROUND.HEIGHT);
        
        // 地面の模様（ストライプ）
        this.ctx.fillStyle = CONFIG.GROUND.STRIPE_COLOR;
        for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += 20) {
            this.ctx.fillRect(x, groundY + 10, 10, CONFIG.GROUND.HEIGHT - 10);
        }
        
        // 地面の境界線
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(CONFIG.CANVAS_WIDTH, groundY);
        this.ctx.stroke();
    }
    
    /**
     * ポーズ画面のオーバーレイ描画
     */
    drawPauseOverlay() {
        // 半透明オーバーレイ
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // ポーズテキスト
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        
        // 再開方法の説明
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press P to resume', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 60);
    }
    
    /**
     * ゲーム終了処理
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // イベントリスナーのクリーンアップ
        window.removeEventListener('resize', this.adjustCanvasSize);
    }
}

/**
 * ゲーム初期化とエラーハンドリング
 */
function initializeGame() {
    try {
        // DOM読み込み完了を確認
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeGame);
            return;
        }
        
        // ゲーム開始
        window.game = new Game();
        
        console.log('Flappy Bird Clone initialized successfully!');
        
    } catch (error) {
        console.error('ゲームの初期化に失敗しました:', error);
        
        // エラー表示
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff6b6b;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        // セキュリティのためinnerHTMLの代わりに安全なDOM操作を使用
        const title = document.createElement('h3');
        title.textContent = 'ゲームの読み込みに失敗しました';
        
        const errorParagraph = document.createElement('p');
        errorParagraph.textContent = error.message;
        
        const instructionParagraph = document.createElement('p');
        instructionParagraph.textContent = 'ページを再読み込みしてください';
        
        errorMessage.appendChild(title);
        errorMessage.appendChild(errorParagraph);
        errorMessage.appendChild(instructionParagraph);
        
        document.body.appendChild(errorMessage);
    }
}

// ゲーム初期化を実行
initializeGame();
