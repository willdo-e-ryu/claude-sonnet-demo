/**
 * Flappy Bird Clone - 設定定数
 * ゲーム全体で使用される定数や設定値
 */

export const CONFIG = {
    // キャンバスサイズ（400x600に変更）
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 600,
    
    // 鳥の設定
    BIRD: {
        WIDTH: 30,
        HEIGHT: 24,
        X: 100,
        INITIAL_Y: 300, // 画面の中央（600/2）に調整
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
        GAP_SIZE: 200, // 400px幅に合わせて調整
        GAP_SIZE_MIN: 120, // 最小間隔を120に設定
        GAP_SIZE_DECREMENT: 0.05, // パイプ間隔減少率（5%）
        SPEED: 1.0, // より遅いスピードに設定
        SPEED_INCREMENT: 0.05, // スコア取得時の速度増加率（5%）
        MAX_SPEED: 2.5, // 最大速度も抑えめに
        SPAWN_INTERVAL: 3000, // 400px幅に合わせて調整
        SPAWN_INTERVAL_MIN: 1500, // パイプ間距離の最小値も調整
        SPAWN_INTERVAL_DECREMENT: 0.05, // パイプ間距離減少率（5%）
        MIN_HEIGHT: 50,
        COLOR: '#228B22',
        OUTLINE_COLOR: '#006400',
        // 新機能: ランダム色パイプ
        RANDOM_COLOR_ENABLED: false, // デフォルトは無効
        RANDOM_COLORS: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
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
        FONT_SIZE: '36px', // 400px幅に合わせて小さく調整
        FONT_FAMILY: 'Arial',
        COLOR: '#ffffff',
        SHADOW_COLOR: '#000000'
    },
    
    // デバッグ設定
    DEBUG: false, // デバッグモードを無効化
    
    // 新機能: パワーアップアイテム設定
    POWERUPS: {
        ENABLED: false, // デフォルトは無効
        SPAWN_CHANCE: 0.3, // 30%の確率で出現
        TYPES: {
            SLOW_TIME: {
                name: '時間減速',
                color: '#FFD700',
                duration: 5000, // 5秒間
                effect: 0.5 // 時間が半分に
            },
            EXTRA_LIFE: {
                name: '追加ライフ',
                color: '#FF69B4',
                effect: 1 // ライフ+1
            },
            DOUBLE_SCORE: {
                name: 'スコア2倍',
                color: '#00CED1',
                duration: 10000, // 10秒間
                effect: 2 // スコア2倍
            }
        }
    },
    
    // ゲーム状態
    STATES: {
        START: 'START',
        PLAYING: 'PLAYING',
        GAME_OVER: 'GAME_OVER',
        PAUSED: 'PAUSED'
    }
};
