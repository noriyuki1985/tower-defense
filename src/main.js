// src/main.js
import { CONFIG }            from './config.js';
import { createRandomStage } from './mapGenerator.js';
import * as renderer         from './renderer.js';
import { assetLoader }       from './rendererAssets.js';
import { initSidebar }       from './ui/sidebar.js';
import { updateHUD }         from './ui/hud.js';
import { scheduleWaves }     from './gameplay/wave.js';

// ステージ管理
let stageIndex   = 1;
let STAGE;
let totalToSpawn = 0;
let clearShown   = false;
let gameOver     = false;

// playModel 定義
const playModel = {
  towers:      [],
  enemies:     [],
  projectiles: [],
  gold:        0,
  lives:       0,
  spawned:     0,
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

// WAVES_DEFS からステージごとの Waves を組み立て
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

// 新ステージのセットアップ
function setupStage(idx) {
  STAGE = createRandomStage(idx);
  renderer.initRenderer('game-canvas', STAGE);
  renderer.setStage(STAGE);

  STAGE.waves = buildWavesForStage(idx);

  const gold  = Math.max(CONFIG.INITIAL_GOLD  - (idx - 1) * 100, 100);
  const lives = Math.max(CONFIG.INITIAL_LIVES - (idx - 1) *   2,   1);
  STAGE.initial.gold  = gold;
  STAGE.initial.lives = lives;

  playModel.gold        = gold;
  playModel.lives       = lives;
  playModel.towers      = [];
  playModel.enemies     = [];
  playModel.projectiles = [];
  playModel.spawned     = 0;

  clearShown   = false;
  gameOver     = false;
  totalToSpawn = STAGE.waves.reduce((sum, w) => sum + w.enemies[0].count, 0);

  scheduleWaves(playModel, STAGE.waves);
}

// 描画
function render() {
  renderer.clear();
  for (let r = 0; r < STAGE.map.rows; r++) {
    for (let c = 0; c < STAGE.map.cols; c++) {
      renderer.drawTile(r, c);
    }
  }
  playModel.towers.forEach(t => renderer.drawTower(t));
  playModel.projectiles.forEach(p => renderer.drawProjectile(p));
  playModel.enemies.forEach(e => renderer.drawEnemy(e));
  updateHUD(playModel);

  if (gameOver) {
    const ctx = document.getElementById('game-canvas').getContext('2d');
    ctx.fillStyle = 'red';
    ctx.font      = '48px sans-serif';
    ctx.fillText('ゲームオーバー', 50, 50);
    return;
  }
  if (clearShown) {
    renderer.drawClear();
  }
}

// メインループ
function gameLoop() {
  if (gameOver) return;
  const now = Date.now();

  playModel.towers.forEach(t =>
    t.tryShoot(playModel.enemies, now, playModel.projectiles)
  );

  for (let i = playModel.projectiles.length - 1; i >= 0; i--) {
    const p = playModel.projectiles[i], e = p.target;
    if (!playModel.enemies.includes(e)) {
      playModel.projectiles.splice(i, 1);
      continue;
    }
    const dx = e.x - p.x, dy = e.y - p.y, dist = Math.hypot(dx, dy);
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

  for (let i = playModel.enemies.length - 1; i >= 0; i--) {
    const e  = playModel.enemies[i];
    const wp = STAGE.path.waypoints[e.idx];
    if (!wp) {
      playModel.lives--;
      playModel.enemies.splice(i, 1);
      if (playModel.lives <= 0) gameOver = true;
      continue;
    }
    const tx   = wp.c * STAGE.map.tileSize, ty = wp.r * STAGE.map.tileSize;
    const dx   = tx - e.x, dy = ty - e.y, dist = Math.hypot(dx, dy);
    if (dist < e.speed) e.idx++;
    else {
      e.x += dx / dist * e.speed;
      e.y += dy / dist * e.speed;
    }
  }

  if (!clearShown &&
      playModel.spawned === totalToSpawn &&
      playModel.enemies.length === 0 &&
      playModel.lives > 0) {
    clearShown = true;
  }

  if (clearShown) {
    stageIndex++;
    setupStage(stageIndex);
  }

  render();
  requestAnimationFrame(gameLoop);
}

// 初期化
function init() {
  const app    = document.getElementById('app');
  const canvas = document.createElement('canvas');
  canvas.id    = 'game-canvas';
  canvas.width  = CONFIG.MAP_COLS * CONFIG.TILE_SIZE;
  canvas.height = CONFIG.MAP_ROWS * CONFIG.TILE_SIZE;
  app.appendChild(canvas);

  initSidebar(canvas, playModel, render);

  assetLoader.loadImages().then(() => {
    setupStage(stageIndex);
    render();
    requestAnimationFrame(gameLoop);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
