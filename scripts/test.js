#!/usr/bin/env node

/**
 * Test Runner Script
 * 基本的な機能テスト
 */

import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * HTMLファイルの基本検証
 */
async function testHTML() {
    console.log('🔍 HTMLファイルのテスト...');
    
    try {
        const html = await readFile('./public/index.html', 'utf-8');
        
        // 必須要素のチェック
        const requiredElements = [
            { element: 'canvas', id: 'gameCanvas' },
            { element: 'div', id: 'gameContainer' },
            { element: 'div', id: 'ui' }
        ];
        
        let passed = 0;
        
        requiredElements.forEach(({ element, id }) => {
            if (html.includes(`id="${id}"`)) {
                console.log(`  ✅ ${element}#${id} が存在します`);
                passed++;
            } else {
                console.log(`  ❌ ${element}#${id} が見つかりません`);
            }
        });
        
        // JavaScriptモジュールの読み込みチェック
        if (html.includes('type="module"')) {
            console.log('  ✅ ES Modulesが正しく設定されています');
            passed++;
        } else {
            console.log('  ❌ ES Modulesの設定が見つかりません');
        }
        
        return passed === requiredElements.length + 1;
        
    } catch (error) {
        console.log(`  ❌ HTMLファイルの読み込みエラー: ${error.message}`);
        return false;
    }
}

/**
 * CSSファイルの基本検証
 */
async function testCSS() {
    console.log('\n🎨 CSSファイルのテスト...');
    
    try {
        const css = await readFile('./public/css/style.css', 'utf-8');
        
        // 基本的なCSSルールのチェック
        const requiredRules = [
            '#gameContainer',
            '#gameCanvas',
            '.game-ui',
            '.score'
        ];
        
        let passed = 0;
        
        requiredRules.forEach(rule => {
            if (css.includes(rule)) {
                console.log(`  ✅ ${rule} スタイルが定義されています`);
                passed++;
            } else {
                console.log(`  ❌ ${rule} スタイルが見つかりません`);
            }
        });
        
        return passed === requiredRules.length;
        
    } catch (error) {
        console.log(`  ❌ CSSファイルの読み込みエラー: ${error.message}`);
        return false;
    }
}

/**
 * JavaScriptモジュールの依存関係チェック
 */
async function testJSModules() {
    console.log('\n📦 JavaScriptモジュールのテスト...');
    
    const modules = [
        { file: './public/js/config.js', exports: ['CONFIG'] },
        { file: './public/js/utils.js', exports: ['setupHiDPI', 'updateDebugInfo', 'FPSCounter'] },
        { file: './public/js/input.js', exports: ['InputManager'] },
        { file: './public/js/state.js', exports: ['GameStateManager'] },
        { file: './public/js/bird.js', exports: ['Bird'] },
        { file: './public/js/pipes.js', exports: ['PipeManager'] },
        { file: './public/js/score.js', exports: ['ScoreManager'] }
    ];
    
    let passed = 0;
    
    for (const { file, exports } of modules) {
        try {
            const content = await readFile(file, 'utf-8');
            
            let moduleValid = true;
            exports.forEach(exportName => {
                if (!content.includes(`export`) || !content.includes(exportName)) {
                    console.log(`  ❌ ${file}: ${exportName} がエクスポートされていません`);
                    moduleValid = false;
                }
            });
            
            if (moduleValid) {
                console.log(`  ✅ ${file}: 全てのエクスポートが確認されました`);
                passed++;
            }
            
        } catch (error) {
            console.log(`  ❌ ${file}: 読み込みエラー - ${error.message}`);
        }
    }
    
    return passed === modules.length;
}

/**
 * Docker設定のテスト
 */
async function testDocker() {
    console.log('\n🐳 Docker設定のテスト...');
    
    try {
        // Dockerfileの存在確認
        const dockerfile = await readFile('./Dockerfile', 'utf-8');
        console.log('  ✅ Dockerfileが存在します');
        
        // 基本設定のチェック
        const requiredDirectives = ['FROM', 'COPY', 'EXPOSE'];
        let dockerValid = true;
        
        requiredDirectives.forEach(directive => {
            if (!dockerfile.includes(directive)) {
                console.log(`  ❌ ${directive} 指示が見つかりません`);
                dockerValid = false;
            }
        });
        
        if (dockerValid) {
            console.log('  ✅ Dockerfileの基本設定が確認されました');
        }
        
        return dockerValid;
        
    } catch (error) {
        console.log(`  ❌ Dockerfileが見つかりません: ${error.message}`);
        return false;
    }
}

/**
 * メイン処理
 */
async function main() {
    console.log('🧪 テスト実行開始...\n');
    
    const tests = [
        { name: 'HTML', test: testHTML },
        { name: 'CSS', test: testCSS },
        { name: 'JavaScript Modules', test: testJSModules },
        { name: 'Docker', test: testDocker }
    ];
    
    let passedTests = 0;
    
    for (const { name, test } of tests) {
        const result = await test();
        if (result) {
            passedTests++;
        }
    }
    
    console.log(`\n📊 テスト結果: ${passedTests}/${tests.length} 通過`);
    
    if (passedTests === tests.length) {
        console.log('🎉 全てのテストが通過しました！');
        process.exit(0);
    } else {
        console.log('❌ 一部のテストが失敗しました');
        process.exit(1);
    }
}

// 実行
main().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
});
