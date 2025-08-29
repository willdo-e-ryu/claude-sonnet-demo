import { CONFIG } from './config.js';

/**
 * ゲーム状態管理クラス
 * ゲームの状態遷移を担当（UI描画はキャンバスで実行）
 */
export class GameStateManager {
    constructor() {
        this.currentState = CONFIG.STATES.START;
        this.previousState = null;
    }
    
    /**
     * 現在の状態を取得
     * @returns {string} - 現在の状態
     */
    getCurrentState() {
        return this.currentState;
    }
    
    /**
     * 状態を変更
     * @param {string} newState - 新しい状態
     */
    setState(newState) {
        if (this.currentState !== newState) {
            this.previousState = this.currentState;
            this.currentState = newState;
            this.updateUIVisibility();
            
            // 状態変更イベントを発火
            document.dispatchEvent(new CustomEvent('stateChanged', {
                detail: {
                    newState,
                    previousState: this.previousState
                }
            }));
        }
    }
    
    /**
     * ゲーム開始
     */
    startGame() {
        this.setState(CONFIG.STATES.PLAYING);
    }
    
    /**
     * ゲーム終了
     */
    endGame() {
        this.setState(CONFIG.STATES.GAME_OVER);
    }
    
    /**
     * ゲーム再開始
     */
    restartGame() {
        this.setState(CONFIG.STATES.START);
        // 少し遅延してからプレイング状態に移行
        setTimeout(() => {
            if (this.currentState === CONFIG.STATES.START) {
                this.setState(CONFIG.STATES.PLAYING);
            }
        }, 100);
    }
    
    /**
     * ゲームポーズ
     */
    pauseGame() {
        if (this.currentState === CONFIG.STATES.PLAYING) {
            this.setState(CONFIG.STATES.PAUSED);
        }
    }
    
    /**
     * ゲーム再開
     */
    resumeGame() {
        if (this.currentState === CONFIG.STATES.PAUSED) {
            this.setState(CONFIG.STATES.PLAYING);
        }
    }
    
    /**
     * UI表示の更新（キャンバス描画用）
     * この関数は現在は何もしませんが、将来的な拡張のために残しています
     */
    updateUIVisibility() {
        // キャンバスベースのゲームでは、UI描画は別の場所で行います
    }
    
    /**
     * スコア表示の更新（キャンバス描画用）
     * @param {number} currentScore - 現在のスコア
     * @param {number} bestScore - ベストスコア
     */
    updateScore(currentScore, bestScore) {
        // キャンバスベースのゲームでは、スコア描画は別の場所で行います
        // この関数は互換性のために残しています
    }
    
    /**
     * ゲームが進行中かどうか
     * @returns {boolean} - ゲームが進行中かどうか
     */
    isPlaying() {
        return this.currentState === CONFIG.STATES.PLAYING;
    }
    
    /**
     * ゲームがポーズ中かどうか
     * @returns {boolean} - ゲームがポーズ中かどうか
     */
    isPaused() {
        return this.currentState === CONFIG.STATES.PAUSED;
    }
    
    /**
     * ゲームが終了しているかどうか
     * @returns {boolean} - ゲームが終了しているかどうか
     */
    isGameOver() {
        return this.currentState === CONFIG.STATES.GAME_OVER;
    }
    
    /**
     * ゲームが開始前かどうか
     * @returns {boolean} - ゲームが開始前かどうか
     */
    isStart() {
        return this.currentState === CONFIG.STATES.START;
    }
}
