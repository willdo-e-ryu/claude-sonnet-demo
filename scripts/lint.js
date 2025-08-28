#!/usr/bin/env node

/**
 * JavaScript Linting Script
 * 構文チェックとコード品質チェック
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * JavaScriptファイルの構文チェック
 */
async function checkSyntax(filePath) {
    try {
        await execAsync(`node -c "${filePath}"`);
        return { success: true, message: '✅ 構文チェック: OK' };
    } catch (error) {
        return { 
            success: false, 
            message: `❌ 構文エラー: ${error.message}` 
        };
    }
}

/**
 * コード品質メトリクス計算
 */
async function analyzeCodeQuality(filePath) {
    try {
        const content = await readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        
        const metrics = {
            lines: lines.length,
            functions: (content.match(/function\s+\w+|=>\s*{|\w+\s*:\s*function|class\s+\w+/g) || []).length,
            comments: (content.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length,
            complexity: calculateComplexity(content)
        };
        
        return metrics;
    } catch (error) {
        return null;
    }
}

/**
 * 簡易循環的複雑度計算
 */
function calculateComplexity(content) {
    const keywords = [
        'if', 'else', 'while', 'for', 'case', 'catch',
        '&&', '||', '?'
    ];
    
    let complexity = 1; // 基本パス
    
    keywords.forEach(keyword => {
        const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'g'));
        if (matches) {
            complexity += matches.length;
        }
    });
    
    return complexity;
}

/**
 * セキュリティチェック
 */
function checkSecurity(content) {
    const risks = [];
    const securityPatterns = [
        { pattern: /innerHTML\s*=/, message: 'innerHTML使用によるXSSリスク' },
        { pattern: /eval\s*\(/, message: 'eval()関数の使用' },
        { pattern: /document\.write\s*\(/, message: 'document.write()の使用' },
        { pattern: /setTimeout\s*\(\s*['"`]/, message: '文字列でのsetTimeout使用' },
        { pattern: /setInterval\s*\(\s*['"`]/, message: '文字列でのsetInterval使用' }
    ];
    
    securityPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(content)) {
            risks.push(message);
        }
    });
    
    return risks;
}

/**
 * JavaScriptファイルを再帰的に検索
 */
async function findJSFiles(dir) {
    const files = [];
    
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            
            if (entry.isDirectory()) {
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    files.push(...await findJSFiles(fullPath));
                }
            } else if (extname(entry.name) === '.js') {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // ディレクトリが存在しない場合は無視
    }
    
    return files;
}

/**
 * メイン処理
 */
async function main() {
    console.log('🔍 JavaScript Linting開始...\n');
    
    const jsFiles = await findJSFiles('./public');
    
    if (jsFiles.length === 0) {
        console.log('⚠️ JavaScriptファイルが見つかりませんでした');
        return;
    }
    
    let hasErrors = false;
    
    for (const file of jsFiles) {
        console.log(`📄 検査中: ${file}`);
        
        // 構文チェック
        const syntaxResult = await checkSyntax(file);
        console.log(`  ${syntaxResult.message}`);
        
        if (!syntaxResult.success) {
            hasErrors = true;
            continue;
        }
        
        // コード品質分析
        const content = await readFile(file, 'utf-8');
        const metrics = await analyzeCodeQuality(file);
        
        if (metrics) {
            console.log(`  📊 メトリクス: ${metrics.lines}行, ${metrics.functions}関数, 複雑度${metrics.complexity}`);
        }
        
        // セキュリティチェック
        const securityRisks = checkSecurity(content);
        if (securityRisks.length > 0) {
            console.log(`  ⚠️ セキュリティ注意:`);
            securityRisks.forEach(risk => {
                console.log(`    - ${risk}`);
            });
        } else {
            console.log(`  🔒 セキュリティ: OK`);
        }
        
        console.log('');
    }
    
    if (hasErrors) {
        console.log('❌ Lintingで構文エラーが検出されました');
        process.exit(1);
    } else {
        console.log('✅ 全てのファイルのLintingが完了しました');
    }
}

// 実行
main().catch(error => {
    console.error('Linting実行エラー:', error);
    process.exit(1);
});
