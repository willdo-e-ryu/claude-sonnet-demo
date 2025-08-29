import { CONFIG } from './config.js';
import { getLocalStorage, setLocalStorage } from './utils.js';

/**
 * スコア管理クラス
 * 現在のスコアとベストスコアの管理を担当
 */
export class ScoreManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.currentScore = 0;
        this.bestScore = this.loadBestScore();
        this.isNewBest = false;
        
        this.updateDisplay();
    }
    
    /**
     * ベストスコアをLocalStorageから読み込み
     * @returns {number} - ベストスコア
     */
    loadBestScore() {
        return getLocalStorage('flappyBirdBestScore', 0);
    }
    
    /**
     * ベストスコアをLocalStorageに保存
     */
    saveBestScore() {
        setLocalStorage('flappyBirdBestScore', this.bestScore);
    }
    
    /**
     * スコアをリセット
     */
    reset() {
        this.currentScore = 0;
        this.isNewBest = false;
        this.updateDisplay();
    }
    
    /**
     * スコアを追加
     * @param {number} points - 追加するポイント
     */
    addScore(points = 1) {
        this.currentScore += points;
        
        // ベストスコア更新チェック
        if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
            this.isNewBest = true;
            this.saveBestScore();
        }
        
        this.updateDisplay();
        
        // スコア獲得エフェクト（オプション）
        this.triggerScoreEffect();
    }
    
    /**
     * 表示を更新（キャンバス描画用）
     */
    updateDisplay() {
        if (this.gameStateManager) {
            this.gameStateManager.updateScore(this.currentScore, this.bestScore);
        }
        // キャンバスベースのゲームでは、スコア描画は別の場所で行います
    }
    
    /**
     * スコア獲得エフェクト（キャンバス描画用）
     */
    triggerScoreEffect() {
        // キャンバスベースのゲームでは、エフェクトは別の場所で実装します
        
        // カスタムイベント発火
        document.dispatchEvent(new CustomEvent('scoreAdded', {
            detail: {
                currentScore: this.currentScore,
                isNewBest: this.isNewBest
            }
        }));
    }
    
    /**
     * ゲーム終了時の処理
     */
    onGameEnd() {
        this.updateDisplay();
        
        // 新記録達成時の特別エフェクト
        if (this.isNewBest) {
            this.triggerNewBestEffect();
        }
    }
    
    /**
     * 新記録達成エフェクト
     */
    triggerNewBestEffect() {
        const bestScoreElement = document.getElementById('bestScore');
        if (bestScoreElement) {
            bestScoreElement.style.color = '#FFD700';
            bestScoreElement.style.textShadow = '0 0 10px #FFD700';
            bestScoreElement.textContent = `NEW BEST: ${this.bestScore}`;
            
            // パーティクル風エフェクト（簡易版）
            this.createCelebrationEffect();
        }
    }
    
    /**
     * お祝いエフェクトの作成（簡易版）
     */
    createCelebrationEffect() {
        // DOM要素を使った簡易パーティクルエフェクト
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: #FFD700;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: 50%;
                top: 50%;
                animation: celebrate 1s ease-out forwards;
            `;
            
            // ランダムな方向
            const angle = (i / 10) * Math.PI * 2;
            const velocity = 50 + Math.random() * 50;
            
            particle.style.setProperty('--dx', `${Math.cos(angle) * velocity}px`);
            particle.style.setProperty('--dy', `${Math.sin(angle) * velocity}px`);
            
            document.body.appendChild(particle);
            
            // エフェクト終了後に削除
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
        
        // CSS アニメーションを動的に追加（一度だけ）
        if (!document.querySelector('#celebrateKeyframes')) {
            const style = document.createElement('style');
            style.id = 'celebrateKeyframes';
            style.textContent = `
                @keyframes celebrate {
                    0% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * 現在のスコアを取得
     * @returns {number} - 現在のスコア
     */
    getCurrentScore() {
        return this.currentScore;
    }
    
    /**
     * ベストスコアを取得
     * @returns {number} - ベストスコア
     */
    getBestScore() {
        return this.bestScore;
    }
    
    /**
     * 新記録かどうかを取得
     * @returns {boolean} - 新記録かどうか
     */
    isNewBestScore() {
        return this.isNewBest;
    }
    
    /**
     * スコアデータをエクスポート（デバッグ用）
     * @returns {Object} - スコアデータ
     */
    exportScoreData() {
        return {
            currentScore: this.currentScore,
            bestScore: this.bestScore,
            isNewBest: this.isNewBest
        };
    }
    
    /**
     * スコアデータをインポート（デバッグ用）
     * @param {Object} scoreData - スコアデータ
     */
    importScoreData(scoreData) {
        if (scoreData && typeof scoreData === 'object') {
            this.currentScore = scoreData.currentScore || 0;
            this.bestScore = scoreData.bestScore || 0;
            this.isNewBest = scoreData.isNewBest || false;
            this.updateDisplay();
        }
    }
}
