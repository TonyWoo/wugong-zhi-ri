// ============================================================
// prebuild.mjs —— 书稿导入（npm run build / dev 前自动执行）
//   content/zh/（前言 + 19 章）→ src/content/docs/
// ============================================================
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

execFileSync('node', ['scripts/import-novel.mjs'], { stdio: 'inherit', cwd: ROOT });

console.log('prebuild: 导入完成');
