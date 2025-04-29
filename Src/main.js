// src/main.js
// ----------------------------------
// ゲーム本体エントリーポイント
// ----------------------------------
import { STAGE } from './config.js';
import { assetLoader, renderer } from './renderer.js';
import { initSidebar } from './ui/sidebar.js';
import { updateHUD } from './ui/hud.js';
import { scheduleWaves } from './gameplay/wave.js';

// ----- 共有モデル -----
const playModel = {
  towers: [],
  enemies: [],
  projectiles: [],
  gold: STAGE.initial.gold,
  lives: STAGE.initial.lives,
  spawned: 0
};

const totalToSpawn = STAGE.waves.reduce((s, w) => s + w.enemies[0].count, 0);
let clearShown = false;

// ----- 描画 -----
function render() { /* 省略せず全コード入り */ }

// ----- メインループ -----
function gameLoop() { /* 省略せず全コード入り */ }

// ----- 初期化 -----
function init() { /* 省略せず全コード入り */ }

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
