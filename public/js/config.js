/**
 * Flappy Bird Clone - 設定定数
 * ゲーム全体で使用される定数や設定値
 * v1.1.0 - ゲーム統計システム対応
 */
export const CONFIG = {
    // バージョン情報
    VERSION: '1.1.0',
    
    // キャンバスサイズ
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 600,
    
    // 鳥の設定
    BIRD: {
        WIDTH: 30,
        HEIGHT: 24,
        X: 100,
        INITIAL_Y: 250,
        JUMP_VELOCITY: -8,
        GRAVITY: 0.4,
        MAX_FALL_SPEED: 8,
        ROTATION_SPEED: 0.15,
        MAX_ROTATION: 0.8,
        COLOR: '#FFD700',
        OUTLINE_COLOR: '#FF8C00'
    },
    
    // パイプ設定
    PIPE: {
        WIDTH: 60,
        GAP_SIZE: 150,
        SPEED: 2.5,
        SPAWN_INTERVAL: 1800, // ミリ秒
        MIN_HEIGHT: 50,
        COLOR: '#228B22',
        OUTLINE_COLOR: '#006400'
    },
    
    // 地面設定
    GROUND: {
        HEIGHT: 80,
        COLOR: '#DEB887',
        STRIPE_COLOR: '#D2B48C'
    },
    
    // 物理演算
    PHYSICS: {
        MAX_DELTA_TIME: 1000 / 30, // 最大30FPS相当の時間差
        TIME_SCALE: 1.0
    },
    
    // スコア設定
    SCORE: {
        FONT_SIZE: '48px',
        FONT_FAMILY: 'Arial',
        COLOR: '#ffffff',
        SHADOW_COLOR: '#000000'
    },
    
    // デバッグ設定
    DEBUG: false, // 本番では false
    
    // ゲーム状態
    STATES: {
        START: 'START',
        PLAYING: 'PLAYING',
        GAME_OVER: 'GAME_OVER',
        PAUSED: 'PAUSED'
    }
};
// Test auto PR creation system - Thu Aug 28 06:51:43 PM JST 2025
