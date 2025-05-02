// src/main.js

import { CONFIG, loadConfig }    from './config.js';
import { createRandomStage }      from './mapGenerator.js';
import * as renderer              from './renderer.js';
import { assetLoader }            from './rendererAssets.js';
import { initSidebar }            from './ui/sidebar.js';
import { updateHUD }              from './ui/hud.js';
import { scheduleWaves }          from './gameplay/wave.js';

/** ── ステージ管理変数 ─────────────────────────────────── */
let stageIndex   = 1;
let STAGE        = null;
let totalToSpawn = 0;
let clearShown   = false;
let gameOver     = false;

/** ── ゲーム状態を保持するモデル ───────────────────────────── */
export const playModel = {
  towers:      [],
  enemies:     [],
  projectiles: [],
  gold:        0,
  lives:       0,
  spawned:     0,

  /**
   * 敵をスポーンして enemies 配列に追加
   * @param {string} type CONFIG.ENEMY_DEFINITIONS の id
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
    this.spawned++;
  }
};

/**
 * CONFIG.WAVES_DEFS からステージごとの波情報を組み立てる
 * @param {number} idx ステージ番号
 * @returns {Array<{waveNo:number,delay:number,enemies:Array<{type:string,count:number,interval:number}>}>}
 */
function buildWavesForStage(idx) {
  return CONFIG.WAVES_DEFS.map(wd => ({
    waveNo: wd.waveNo,
    delay:  wd.delay,
    enemies: wd.spawns.map(s => ({
      type:     s.type,
      count:    s.countBase + s.countPerStage * (idx - 1),
      interval: s.interval
    }))
  }));
}

/**
 * 新しいステージを生成し、モデル・レンダラを初期化
 * @param {number} idx ステージ番号
 */
function setupStage(idx) {
  // ステージデータを作成
  STAGE = createRandomStage(idx);
  renderer.initRenderer('game-canvas', STAGE);
  renderer.setStage(STAGE);

  // 波情報をステージに合わせて再構成
  STAGE.waves = buildWavesForStage(idx);

  // 初回ステージのみ INITIAL 値をセット、それ以降は現在の資源を維持
  if (idx === 1) {
    playModel.gold  = CONFIG.INITIAL_GOLD;
    playModel.lives = CONFIG.INITIAL_LIVES;
  }
  // STAGE.initial は HUD 描画時のリセット用
  STAGE.initial.gold  = playModel.gold;
  STAGE.initial.lives = playModel.lives;

  // モデルをリセット
  playModel.towers      = [];
  playModel.enemies     = [];
  playModel.projectiles = [];
  playModel.spawned     = 0;

  clearShown   = false;
  gameOver     = false;

  // ステージ内総出現数を計算
  totalToSpawn = STAGE.waves.reduce(
    (sum, w) => sum + w.enemies.reduce((cnt, e) => cnt + e.count, 0),
    0
  );

  // 敵出現をスケジュール
  scheduleWaves(playModel, STAGE.waves);
}

/**
 * 描画処理
 */
function render() {
  renderer.clear();

  // 地形タイル
  for (let r = 0; r < STAGE.map.rows; r++) {
    for (let c = 0; c < STAGE.map.cols; c++) {
      renderer.drawTile(r, c);
    }
  }

  // タワー・発射体・敵
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

/**
 * メインループ (約60FPS)
 */
function gameLoop() {
  if (gameOver) return;
  const now = Date.now();

  // タワー攻撃
  playModel.towers.forEach(t =>
    t.tryShoot(playModel.enemies, now, playModel.projectiles)
  );

  // 発射体移動・ヒット判定
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

  // 敵移動・ゴール判定
  for (let i = playModel.enemies.length - 1; i >= 0; i--) {
    const e  = playModel.enemies[i];
    const wp = STAGE.path.waypoints[e.idx];
    if (!wp) {
      playModel.lives--;
      playModel.enemies.splice(i, 1);
      if (playModel.lives <= 0) gameOver = true;
      continue;
    }
    const tx       = wp.c * STAGE.map.tileSize;
    const ty       = wp.r * STAGE.map.tileSize;
    const dx       = tx - e.x;
    const dy       = ty - e.y;
    const moveDist = Math.hypot(dx, dy);
    if (moveDist < e.speed) {
      e.idx++;
    } else {
      e.x += dx / moveDist * e.speed;
      e.y += dy / moveDist * e.speed;
    }
  }

  // クリア判定
  if (
    !clearShown &&
    playModel.spawned === totalToSpawn &&
    playModel.enemies.length === 0 &&
    playModel.lives > 0
  ) {
    clearShown = true;
  }

  // クリア後、次ステージへ
  if (clearShown) {
    stageIndex++;
    setupStage(stageIndex);
  }

  render();
  requestAnimationFrame(gameLoop);
}

/**
 * 初期化処理
 */
async function init() {
  // JSON 設定を読み込む
  await loadConfig();

  // Canvas 要素を生成
  const app = document.getElementById('app');
  const canvas = document.createElement('canvas');
  canvas.id     = 'game-canvas';
  canvas.width  = CONFIG.MAP_COLS * CONFIG.TILE_SIZE;
  canvas.height = CONFIG.MAP_ROWS * CONFIG.TILE_SIZE;
  app.appendChild(canvas);

  // サイドバーなど UI を初期化
  initSidebar(canvas, playModel, render);

  // 画像読み込み
  await assetLoader.loadImages();

  // 最初のステージ開始
  setupStage(stageIndex);
  render();
  requestAnimationFrame(gameLoop);
}

// ページ読み込み後に初期化を実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
