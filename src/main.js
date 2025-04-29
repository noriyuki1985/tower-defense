// ────────────────────────────────────
// ファイル: src/main.js
// ────────────────────────────────────

// 設定・ユーティリティ
import { CONFIG }            from './config.js';
import { createRandomStage } from './mapGenerator.js';

// 描画エンジン
import * as renderer         from './renderer.js';
import { assetLoader }       from './rendererAssets.js';

// UI／ゲームロジック
import { initSidebar }       from './ui/sidebar.js';
import { updateHUD }         from './ui/hud.js';
import { scheduleWaves }     from './gameplay/wave.js';

// ────────────────
// ステージ管理
// ────────────────
let stageIndex   = 1;
let STAGE        = null;
let totalToSpawn = 0;
let clearShown   = false;
let gameOver     = false;

/**
 * ステージごとに敵の数と種類を調整した WAVES を返す
 */
function generateWavesForStage(idx) {
  return CONFIG.WAVES.map(wave => ({
    ...wave,
    enemies: wave.enemies.map(e => ({
      ...e,
      count: e.count + idx * 5,  // ステージが進むごとに＋5体
      type:  (idx % 3 === 0 && e.type === 'slime')
             ? 'orc_soldier'
             : e.type            // 3ステージごとにオーク混入
    }))
  }));
}

/**
 * 新しいステージを生成し、レンダラ・モデルを初期化
 */
function setupStage(idx) {
  // マップ＆ウェイポイント生成
  STAGE = createRandomStage(idx);
  renderer.initRenderer('game-canvas', STAGE);
  renderer.setStage(STAGE);

  // 波情報を調整
  STAGE.waves = generateWavesForStage(idx);

  // 初期金・ライフを段階的に減少
  const gold  = Math.max(CONFIG.INITIAL_GOLD  - (idx - 1) * 100, 100);
  const lives = Math.max(CONFIG.INITIAL_LIVES - (idx - 1) *   2,   1);
  STAGE.initial.gold  = gold;
  STAGE.initial.lives = lives;

  // プレイモデル初期化
  playModel.gold        = gold;
  playModel.lives       = lives;
  playModel.towers      = [];
  playModel.enemies     = [];
  playModel.projectiles = [];
  playModel.spawned     = 0;

  clearShown   = false;
  gameOver     = false;
  totalToSpawn = STAGE.waves.reduce((sum, w) => sum + w.enemies[0].count, 0);

  // 敵スポーンをスケジュール
  scheduleWaves(playModel, STAGE.waves);
}

// ────────────────
// 共有ゲームステート
// ────────────────
const playModel = {
  towers:      [],
  enemies:     [],
  projectiles: [],
  gold:         0,
  lives:        0,
  spawned:      0,

  /**
   * 敵を生成して playModel.enemies に追加
   * @param {string} type 敵ID
   */
  spawnEnemy(type) {
    const def = CONFIG.ENEMY_DEFINITIONS.find(e => e.id === type);
    const wp0 = STAGE.path.waypoints[0];
    this.enemies.push({
      ...def,
      hp:   def.hp,
      x:    wp0.c * STAGE.map.tileSize,
      y:    wp0.r * STAGE.map.tileSize,
      idx:  1
    });
  }
};

// ────────────────
// 描画関数
// ────────────────
function render() {
  renderer.clear();

  // 地形タイル
  for (let r = 0; r < STAGE.map.rows; r++) {
    for (let c = 0; c < STAGE.map.cols; c++) {
      renderer.drawTile(r, c);
    }
  }

  // タワー・弾・敵
  playModel.towers.forEach(t => renderer.drawTower(t));
  playModel.projectiles.forEach(p => renderer.drawProjectile(p));
  playModel.enemies.forEach(e => renderer.drawEnemy(e));

  // HUD 更新
  updateHUD(playModel);

  // ゲームオーバー表示
  if (gameOver) {
    const ctx = document.getElementById('game-canvas').getContext('2d');
    ctx.fillStyle = 'red';
    ctx.font      = '48px sans-serif';
    ctx.fillText('ゲームオーバー', 50, 50);
    return;
  }

  // クリア表示
  if (clearShown) {
    renderer.drawClear();
  }
}

// ────────────────
// メインループ (60fps)
// ────────────────
function gameLoop() {
  if (gameOver) return;
  const now = Date.now();

  // タワー攻撃 & 弾生成
  playModel.towers.forEach(t =>
    t.tryShoot(playModel.enemies, now, playModel.projectiles)
  );

  // 弾移動 & ヒット判定
  for (let i = playModel.projectiles.length - 1; i >= 0; i--) {
    const p = playModel.projectiles[i];
    const e = p.target;
    if (!playModel.enemies.includes(e)) {
      playModel.projectiles.splice(i, 1);
      continue;
    }
    const dx   = e.x - p.x;
    const dy   = e.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < p.speed) {
      e.hp -= p.damage;
      if (e.hp <= 0) {
        playModel.enemies.splice(playModel.enemies.indexOf(e), 1);
        playModel.gold += e.reward;
      }
      playModel.projectiles.splice(i, 1);
    } else {
      p.x += dx / dist * p.speed;
      p.y += dy / dist * p.speed;
    }
  }

  // 敵移動 & ゴールチェック
  for (let i = playModel.enemies.length - 1; i >= 0; i--) {
    const e  = playModel.enemies[i];
    const wp = STAGE.path.waypoints[e.idx];
    if (!wp) {
      playModel.lives--;
      playModel.enemies.splice(i, 1);
      if (playModel.lives <= 0) gameOver = true;
      continue;
    }
    const tx   = wp.c * STAGE.map.tileSize;
    const ty   = wp.r * STAGE.map.tileSize;
    const dx   = tx - e.x;
    const dy   = ty - e.y;
    const dist = Math.hypot(dx, dy);
    if (dist < e.speed) {
      e.idx++;
    } else {
      e.x += dx / dist * e.speed;
      e.y += dy / dist * e.speed;
    }
  }

  // ステージクリア判定
  if (!clearShown &&
      playModel.spawned === totalToSpawn &&
      playModel.enemies.length === 0 &&
      playModel.lives > 0) {
    clearShown = true;
  }

  // クリア後、次ステージへ移行
  if (clearShown) {
    stageIndex++;
    setupStage(stageIndex);
  }

  render();
  requestAnimationFrame(gameLoop);
}

// ────────────────
// 初期化
// ────────────────
function init() {
  // Canvas 要素を動的生成
  const app    = document.getElementById('app');
  const canvas = document.createElement('canvas');
  canvas.id    = 'game-canvas';
  canvas.width  = CONFIG.MAP_COLS * CONFIG.TILE_SIZE;
  canvas.height = CONFIG.MAP_ROWS * CONFIG.TILE_SIZE;
  app.appendChild(canvas);

  // サイドバー UI の初期化
  initSidebar(canvas, playModel, render);

  // 画像読み込み後に最初のステージをセット
  assetLoader.loadImages().then(() => {
    setupStage(stageIndex);
    render();
    requestAnimationFrame(gameLoop);
  });
}

// ページロード時に init() を実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
