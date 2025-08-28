import { CONFIG } from './config.js';
import { randomInt } from './utils.js';

/**
 * パイプクラス
 * 上下のパイプを1つのオブジェクトとして管理
 */
export class Pipe {
    constructor(x, gapY) {
        this.x = x;
        this.gapY = gapY;
        this.passed = false; // スコア計算用フラグ
    }
    
    /**
     * パイプの更新
     * @param {number} deltaTime - フレーム間の経過時間
     */
    update(deltaTime) {
        this.x -= CONFIG.PIPE.SPEED * (deltaTime / 16.67); // 60FPS基準で正規化
    }
    
    /**
     * パイプの描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    draw(ctx) {
        const pipeWidth = CONFIG.PIPE.WIDTH;
        const gapSize = CONFIG.PIPE.GAP_SIZE;
        const canvasHeight = CONFIG.CANVAS_HEIGHT;
        const groundHeight = CONFIG.GROUND.HEIGHT;
        
        // 上のパイプ
        const upperPipeHeight = this.gapY - gapSize / 2;
        
        // 下のパイプ
        const lowerPipeY = this.gapY + gapSize / 2;
        const lowerPipeHeight = canvasHeight - groundHeight - lowerPipeY;
        
        // パイプの描画（グラデーション付き）
        this.drawPipeSegment(ctx, this.x, 0, pipeWidth, upperPipeHeight);
        this.drawPipeSegment(ctx, this.x, lowerPipeY, pipeWidth, lowerPipeHeight);
        
        // パイプの端部（キャップ）
        this.drawPipeCap(ctx, this.x - 5, upperPipeHeight - 20, pipeWidth + 10, 20);
        this.drawPipeCap(ctx, this.x - 5, lowerPipeY, pipeWidth + 10, 20);
    }
    
    /**
     * パイプセグメントの描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    drawPipeSegment(ctx, x, y, width, height) {
        // グラデーション作成
        const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
        gradient.addColorStop(0, CONFIG.PIPE.COLOR);
        gradient.addColorStop(0.5, '#32CD32');
        gradient.addColorStop(1, CONFIG.PIPE.OUTLINE_COLOR);
        
        // パイプ本体
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        // 境界線
        ctx.strokeStyle = CONFIG.PIPE.OUTLINE_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    }
    
    /**
     * パイプキャップ（端部）の描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    drawPipeCap(ctx, x, y, width, height) {
        // グラデーション作成
        const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
        gradient.addColorStop(0, '#32CD32');
        gradient.addColorStop(0.5, CONFIG.PIPE.COLOR);
        gradient.addColorStop(1, CONFIG.PIPE.OUTLINE_COLOR);
        
        // キャップ本体
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        // 境界線
        ctx.strokeStyle = CONFIG.PIPE.OUTLINE_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    }
    
    /**
     * 上のパイプの当たり判定矩形を取得
     * @returns {Object} - 矩形 {x, y, width, height}
     */
    getUpperCollisionRect() {
        return {
            x: this.x,
            y: 0,
            width: CONFIG.PIPE.WIDTH,
            height: this.gapY - CONFIG.PIPE.GAP_SIZE / 2
        };
    }
    
    /**
     * 下のパイプの当たり判定矩形を取得
     * @returns {Object} - 矩形 {x, y, width, height}
     */
    getLowerCollisionRect() {
        const lowerPipeY = this.gapY + CONFIG.PIPE.GAP_SIZE / 2;
        return {
            x: this.x,
            y: lowerPipeY,
            width: CONFIG.PIPE.WIDTH,
            height: CONFIG.CANVAS_HEIGHT - CONFIG.GROUND.HEIGHT - lowerPipeY
        };
    }
    
    /**
     * パイプが画面外に出たかどうか
     * @returns {boolean} - 画面外かどうか
     */
    isOffScreen() {
        return this.x + CONFIG.PIPE.WIDTH < 0;
    }
}

/**
 * パイプ管理クラス
 * 複数のパイプの生成、更新、削除を管理
 */
export class PipeManager {
    constructor() {
        this.pipes = [];
        this.lastSpawnTime = 0;
        this.reset();
    }
    
    /**
     * パイプ管理をリセット
     */
    reset() {
        this.pipes = [];
        this.lastSpawnTime = 0;
    }
    
    /**
     * パイプの更新
     * @param {number} deltaTime - フレーム間の経過時間
     * @param {number} currentTime - 現在時刻
     */
    update(deltaTime, currentTime) {
        // 既存パイプの更新
        this.pipes.forEach(pipe => pipe.update(deltaTime));
        
        // 画面外のパイプを削除
        this.pipes = this.pipes.filter(pipe => !pipe.isOffScreen());
        
        // 新しいパイプの生成
        if (currentTime - this.lastSpawnTime >= CONFIG.PIPE.SPAWN_INTERVAL) {
            this.spawnPipe();
            this.lastSpawnTime = currentTime;
        }
    }
    
    /**
     * 新しいパイプを生成
     */
    spawnPipe() {
        const minGapY = CONFIG.PIPE.MIN_HEIGHT + CONFIG.PIPE.GAP_SIZE / 2;
        const maxGapY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND.HEIGHT - CONFIG.PIPE.MIN_HEIGHT - CONFIG.PIPE.GAP_SIZE / 2;
        
        const gapY = randomInt(minGapY, maxGapY);
        const pipe = new Pipe(CONFIG.CANVAS_WIDTH, gapY);
        
        this.pipes.push(pipe);
    }
    
    /**
     * 全パイプの描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    draw(ctx) {
        this.pipes.forEach(pipe => pipe.draw(ctx));
    }
    
    /**
     * 鳥との衝突チェック
     * @param {Object} birdRect - 鳥の当たり判定矩形
     * @returns {boolean} - 衝突したかどうか
     */
    checkCollision(birdRect) {
        return this.pipes.some(pipe => {
            const upperRect = pipe.getUpperCollisionRect();
            const lowerRect = pipe.getLowerCollisionRect();
            
            return this.isColliding(birdRect, upperRect) || 
                   this.isColliding(birdRect, lowerRect);
        });
    }
    
    /**
     * 矩形同士の当たり判定（ユーティリティ関数のローカル版）
     * @param {Object} rect1 - 矩形1
     * @param {Object} rect2 - 矩形2
     * @returns {boolean} - 衝突しているかどうか
     */
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    /**
     * 通過したパイプをチェックしてスコア計算
     * @param {number} birdX - 鳥のX座標
     * @returns {number} - 獲得スコア
     */
    checkScoring(birdX) {
        let score = 0;
        
        this.pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + CONFIG.PIPE.WIDTH < birdX) {
                pipe.passed = true;
                score++;
            }
        });
        
        return score;
    }
    
    /**
     * パイプの数を取得（デバッグ用）
     * @returns {number} - パイプの数
     */
    getPipeCount() {
        return this.pipes.length;
    }
}
