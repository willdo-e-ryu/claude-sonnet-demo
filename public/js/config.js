/**
 * Flappy Bird Clone - 設定定数
 * ゲーム全体で使用される定数や設定値
 */

export const CONFIG = {
    // キャンバスサイズ（大きく設定）
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    
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
        GAP_SIZE: 280, // さらに広い間隔に設定
        GAP_SIZE_MIN: 120, // 最小間隔を120に設定
        GAP_SIZE_DECREMENT: 0.05, // パイプ間隔減少率（5%）
        SPEED: 1.0, // より遅いスピードに設定
        SPEED_INCREMENT: 0.05, // スコア取得時の速度増加率（5%）
        MAX_SPEED: 2.5, // 最大速度も抑えめに
        SPAWN_INTERVAL: 4400, // パイプ間距離の初期値（2200の200%）
        SPAWN_INTERVAL_MIN: 1760, // パイプ間距離の最小値（2200の80%）
        SPAWN_INTERVAL_DECREMENT: 0.05, // パイプ間距離減少率（5%）
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
    DEBUG: false, // デバッグモードを無効化
    
    // ゲーム状態
    STATES: {
        START: 'START',
        PLAYING: 'PLAYING',
        GAME_OVER: 'GAME_OVER',
        PAUSED: 'PAUSED'
    }
};
