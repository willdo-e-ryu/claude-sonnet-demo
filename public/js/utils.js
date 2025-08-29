import { CONFIG } from './config.js';

/**
 * ユーティリティ関数集
 */

/**
 * 矩形同士の当たり判定
 * @param {Object} rect1 - 矩形1 {x, y, width, height}
 * @param {Object} rect2 - 矩形2 {x, y, width, height}
 * @returns {boolean} - 衝突しているかどうか
 */
export function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * 指定範囲内のランダムな整数を生成
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number} - ランダムな整数
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 値を指定範囲内にクランプ
 * @param {number} value - 値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number} - クランプされた値
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * LocalStorageから値を取得（エラーハンドリング付き）
 * @param {string} key - キー
 * @param {*} defaultValue - デフォルト値
 * @returns {*} - 取得した値またはデフォルト値
 */
export function getLocalStorage(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.warn(`LocalStorage読み込みエラー: ${key}`, e);
        return defaultValue;
    }
}

/**
 * LocalStorageに値を保存（エラーハンドリング付き）
 * @param {string} key - キー
 * @param {*} value - 保存する値
 */
export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`LocalStorage保存エラー: ${key}`, e);
    }
}

/**
 * キャンバスの高DPI対応設定
 * @param {HTMLCanvasElement} canvas - キャンバス要素
 * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
 * @param {number} width - 論理幅
 * @param {number} height - 論理高さ
 */
export function setupHiDPI(canvas, ctx, width, height) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(devicePixelRatio, devicePixelRatio);
}

/**
 * デバッグ情報をキャンバスに描画
 * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
 * @param {Object} debugData - デバッグ情報オブジェクト
 */
export function drawDebugInfo(ctx, debugData) {
    if (!CONFIG.DEBUG) return;
    
    const lines = [
        `FPS: ${debugData.fps || 0}`,
        `Frame Time: ${debugData.frameTime || 0}ms`,
        `Delta: ${debugData.deltaTime || 0}ms`,
        `Bird Y: ${debugData.birdY || 0}`,
        `Velocity: ${debugData.birdVelocity || 0}`,
        `Pipes: ${debugData.pipeCount || 0}`,
        `Speed: ${debugData.pipeSpeed || 0}`,
        `Gap: ${debugData.gapSize || 0}`,
        `Interval: ${debugData.spawnInterval || 0}`
    ];
    
    // デバッグ情報の背景
    const padding = 10;
    const lineHeight = 18;
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const backgroundHeight = lines.length * lineHeight + padding * 2;
    
    // 半透明の背景を描画
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, maxWidth + padding * 2, backgroundHeight);
    
    // テキストスタイル設定
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 各行を描画
    lines.forEach((line, index) => {
        ctx.fillText(line, 20, 20 + index * lineHeight);
    });
}

/**
 * デバッグ情報の表示（旧関数 - 後方互換性のため残す）
 * @param {Object} debugData - デバッグ情報オブジェクト
 */
export function updateDebugInfo(debugData) {
    // この関数は使用されなくなりましたが、後方互換性のため残します
    // 実際の描画はdrawDebugInfo関数で行います
}

/**
 * パフォーマンス測定用FPSカウンター
 */
export class FPSCounter {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.frameTime = 0;
    }
    
    update() {
        const currentTime = performance.now();
        this.frameTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.frameCount++;
        
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1000 / this.frameTime);
        }
        
        return {
            fps: this.fps,
            frameTime: Math.round(this.frameTime * 10) / 10
        };
    }
}
