import { CONFIG } from './config.js';
import { clamp } from './utils.js';

/**
 * 鳥クラス
 * プレイヤーキャラクターの動作と描画を担当
 */
export class Bird {
    constructor() {
        this.reset();
        this.setupEventListeners();
    }
    
    /**
     * 鳥の状態をリセット
     */
    reset() {
        this.x = CONFIG.BIRD.X;
        this.y = CONFIG.BIRD.INITIAL_Y;
        this.velocity = 0;
        this.rotation = 0;
        this.isAlive = true;
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        document.addEventListener('birdJump', () => this.jump());
    }
    
    /**
     * 鳥の更新処理
     * @param {number} deltaTime - フレーム間の経過時間
     * @param {boolean} isPlaying - ゲームが進行中かどうか
     */
    update(deltaTime, isPlaying) {
        if (!isPlaying || !this.isAlive) {
            return;
        }
        
        // 物理演算（重力適用）
        this.velocity += CONFIG.BIRD.GRAVITY * (deltaTime / 16.67);
        this.velocity = clamp(this.velocity, -CONFIG.BIRD.MAX_FALL_SPEED * 2, CONFIG.BIRD.MAX_FALL_SPEED);
        
        // 位置更新
        this.y += this.velocity * (deltaTime / 16.67);
        
        // 回転計算（速度に基づく）
        this.updateRotation();
        
        // 境界チェック
        this.checkBounds();
    }
    
    /**
     * ジャンプ処理
     */
    jump() {
        if (this.isAlive) {
            this.velocity = CONFIG.BIRD.JUMP_VELOCITY;
        }
    }
    
    /**
     * 回転の更新
     */
    updateRotation() {
        if (this.velocity < 0) {
            // 上昇中は上向き
            this.rotation = Math.max(this.rotation - CONFIG.BIRD.ROTATION_SPEED, -CONFIG.BIRD.MAX_ROTATION);
        } else {
            // 落下中は下向き
            this.rotation = Math.min(this.rotation + CONFIG.BIRD.ROTATION_SPEED, CONFIG.BIRD.MAX_ROTATION);
        }
    }
    
    /**
     * 境界チェック
     */
    checkBounds() {
        // 地面との衝突
        if (this.y + CONFIG.BIRD.HEIGHT >= CONFIG.CANVAS_HEIGHT - CONFIG.GROUND.HEIGHT) {
            this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND.HEIGHT - CONFIG.BIRD.HEIGHT;
            this.velocity = 0;
            this.die();
        }
        
        // 天井との衝突
        if (this.y <= 0) {
            this.y = 0;
            this.velocity = 0;
            this.die();
        }
    }
    
    /**
     * 鳥の死亡処理
     */
    die() {
        this.isAlive = false;
        document.dispatchEvent(new CustomEvent('birdDied'));
    }
    
    /**
     * 鳥の描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    draw(ctx) {
        ctx.save();
        
        // 回転の中心を鳥の中心に設定
        ctx.translate(this.x + CONFIG.BIRD.WIDTH / 2, this.y + CONFIG.BIRD.HEIGHT / 2);
        ctx.rotate(this.rotation);
        
        // 鳥の本体（楕円形）
        this.drawBirdBody(ctx);
        
        // 鳥の翼
        this.drawBirdWing(ctx);
        
        // 鳥の目
        this.drawBirdEye(ctx);
        
        // 鳥のくちばし
        this.drawBirdBeak(ctx);
        
        ctx.restore();
    }
    
    /**
     * 鳥の本体を描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    drawBirdBody(ctx) {
        const centerX = -CONFIG.BIRD.WIDTH / 2;
        const centerY = -CONFIG.BIRD.HEIGHT / 2;
        
        // グラデーション作成
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, CONFIG.BIRD.WIDTH / 2);
        gradient.addColorStop(0, CONFIG.BIRD.COLOR);
        gradient.addColorStop(0.7, '#FFA500');
        gradient.addColorStop(1, CONFIG.BIRD.OUTLINE_COLOR);
        
        // 楕円形の鳥体
        ctx.beginPath();
        ctx.ellipse(0, 0, CONFIG.BIRD.WIDTH / 2, CONFIG.BIRD.HEIGHT / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // アウトライン
        ctx.strokeStyle = CONFIG.BIRD.OUTLINE_COLOR;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    /**
     * 鳥の翼を描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    drawBirdWing(ctx) {
        const wingOffset = Math.sin(Date.now() * 0.02) * 2; // 羽ばたきアニメーション
        
        ctx.beginPath();
        ctx.ellipse(-2, wingOffset, 8, 12, Math.PI / 6, 0, Math.PI * 2);
        ctx.fillStyle = '#FF8C00';
        ctx.fill();
        ctx.strokeStyle = CONFIG.BIRD.OUTLINE_COLOR;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * 鳥の目を描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    drawBirdEye(ctx) {
        // 白い部分
        ctx.beginPath();
        ctx.arc(5, -3, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 黒い瞳
        ctx.beginPath();
        ctx.arc(6, -2, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        
        // ハイライト
        ctx.beginPath();
        ctx.arc(6.5, -2.5, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
    
    /**
     * 鳥のくちばしを描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    drawBirdBeak(ctx) {
        ctx.beginPath();
        ctx.moveTo(CONFIG.BIRD.WIDTH / 2 - 2, 2);
        ctx.lineTo(CONFIG.BIRD.WIDTH / 2 + 6, 0);
        ctx.lineTo(CONFIG.BIRD.WIDTH / 2 - 2, -2);
        ctx.closePath();
        ctx.fillStyle = '#FFA500';
        ctx.fill();
        ctx.strokeStyle = CONFIG.BIRD.OUTLINE_COLOR;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * 当たり判定用の矩形を取得
     * @returns {Object} - 矩形 {x, y, width, height}
     */
    getCollisionRect() {
        // 実際のサイズより少し小さくして、より自然な当たり判定に
        const margin = 2;
        return {
            x: this.x + margin,
            y: this.y + margin,
            width: CONFIG.BIRD.WIDTH - margin * 2,
            height: CONFIG.BIRD.HEIGHT - margin * 2
        };
    }
    
    /**
     * 鳥が生きているかどうか
     * @returns {boolean} - 生存状態
     */
    getIsAlive() {
        return this.isAlive;
    }
    
    /**
     * デバッグ情報を取得
     * @returns {Object} - デバッグ情報
     */
    getDebugInfo() {
        return {
            birdY: Math.round(this.y * 10) / 10,
            birdVelocity: Math.round(this.velocity * 100) / 100
        };
    }
}
