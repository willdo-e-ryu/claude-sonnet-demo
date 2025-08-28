import { CONFIG } from './config.js';

/**
 * 入力管理クラス
 * キーボード、マウス、タッチイベントを統合管理
 */
export class InputManager {
    constructor(canvas, gameStateManager) {
        this.canvas = canvas;
        this.gameStateManager = gameStateManager;
        this.keys = {};
        this.mousePressed = false;
        this.touchPressed = false;
        
        this.setupEventListeners();
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // マウスイベント
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // タッチイベント（モバイル対応）
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // デフォルトのタッチ動作を防止
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        
        // コンテキストメニューを無効化
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * キー押下イベント処理
     * @param {KeyboardEvent} e - キーボードイベント
     */
    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        // Space キーでジャンプまたはゲーム開始
        if (e.code === 'Space') {
            e.preventDefault();
            this.handleJumpInput();
        }
        
        // P キーでポーズ
        if (e.code === 'KeyP') {
            e.preventDefault();
            this.handlePauseInput();
        }
    }
    
    /**
     * キー開放イベント処理
     * @param {KeyboardEvent} e - キーボードイベント
     */
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    /**
     * マウス押下イベント処理
     * @param {MouseEvent} e - マウスイベント
     */
    handleMouseDown(e) {
        e.preventDefault();
        this.mousePressed = true;
        this.handleJumpInput();
    }
    
    /**
     * マウス開放イベント処理
     * @param {MouseEvent} e - マウスイベント
     */
    handleMouseUp(e) {
        e.preventDefault();
        this.mousePressed = false;
    }
    
    /**
     * タッチ開始イベント処理
     * @param {TouchEvent} e - タッチイベント
     */
    handleTouchStart(e) {
        e.preventDefault();
        this.touchPressed = true;
        this.handleJumpInput();
    }
    
    /**
     * タッチ終了イベント処理
     * @param {TouchEvent} e - タッチイベント
     */
    handleTouchEnd(e) {
        e.preventDefault();
        this.touchPressed = false;
    }
    
    /**
     * ジャンプ入力の処理
     */
    handleJumpInput() {
        const currentState = this.gameStateManager.getCurrentState();
        
        switch (currentState) {
            case CONFIG.STATES.START:
                this.gameStateManager.startGame();
                break;
            case CONFIG.STATES.PLAYING:
                // ジャンプイベントを発火
                document.dispatchEvent(new CustomEvent('birdJump'));
                break;
            case CONFIG.STATES.GAME_OVER:
                this.gameStateManager.restartGame();
                break;
        }
    }
    
    /**
     * ポーズ入力の処理
     */
    handlePauseInput() {
        const currentState = this.gameStateManager.getCurrentState();
        
        if (currentState === CONFIG.STATES.PLAYING) {
            this.gameStateManager.pauseGame();
        } else if (currentState === CONFIG.STATES.PAUSED) {
            this.gameStateManager.resumeGame();
        }
    }
    
    /**
     * 指定されたキーが押されているかチェック
     * @param {string} keyCode - キーコード
     * @returns {boolean} - キーが押されているかどうか
     */
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
    
    /**
     * 入力状態をリセット
     */
    reset() {
        this.keys = {};
        this.mousePressed = false;
        this.touchPressed = false;
    }
}
