// ────────────────────────────────────
// ファイル: src/main.js
// ────────────────────────────────────

// ランダムマップ生成ユーティリティ
import { createRandomStage } from './mapGenerator.js';

// 描画エンジン
import * as renderer   from './renderer.js';
import { assetLoader } from './rendererAssets.js';

// UI／ロジック
import { initSidebar }    from './ui/sidebar.js';
import { updateHUD }      from './ui/hud.js';
import { scheduleWaves }  from './gameplay/wave.js';


// ----------------------------
// ステージ初期化
// ----------------------------
const STAGE = createRandomStage();   // ページロードごとに新ステージ生成
renderer.setStage(STAGE);            // レンダラーに渡す


// ----------------------------
// 共有ゲームステート
// ----------------------------
const playModel = {
  towers:      [],
  enemies:     [],
  projectiles: [],
  gold:        STAGE.initial.gold,
  lives:       STAGE.initial.lives,
  spawned:     0
};

const totalToSpawn = STAGE.waves
  .reduce((sum, w) => sum + w.enemies[0].count, 0);

let clearShown = false;
let gameOver   = false;


// ----------------------------
// 描画関数
// ----------------------------
function render() {
  renderer.clear();

  // 地形タイル
  for (let r = 0; r < STAGE.map.rows; r++) {
    for (let c = 0; c < STAGE.map.cols; c++) {
      renderer.drawTile(r, c);
    }
  }

  // タワー・プロジェクタイル・敵
  playModel.towers.forEach(t      => renderer.drawTower(t));
  playModel.projectiles.forEach(p => renderer.drawProjectile(p));
  playModel.enemies.forEach(e     => renderer.drawEnemy(e));

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
  if (clearShown) renderer.drawClear();
}


// ----------------------------
// メインループ
// ----------------------------
function gameLoop() {
  if (gameOver) return;

  const now = Date.now();

  // タワー攻撃＆弾生成
  playModel.towers.forEach(t =>
    t.tryShoot(playModel.enemies, now, playModel.projectiles)
  );

  // 弾移動＆ヒット判定
  for (let i = playModel.projectiles.length - 1; i >= 0; i--) {
    const p = playModel.projectiles[i];
    const e = p.target;
    if (!playModel.enemies.includes(e)) {
      playModel.projectiles.splice(i, 1);
      continue;
    }
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
    if (d < p.speed) {
      e.hp -= p.damage;
      if (e.hp <= 0) {
        playModel.enemies.splice(playModel.enemies.indexOf(e), 1);
        playModel.gold += e.reward;
      }
      playModel.projectiles.splice(i, 1);
    } else {
      p.x += dx / d * p.speed;
      p.y += dy / d * p.speed;
    }
  }

  // 敵移動
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
    const dx   = tx - e.x, dy = ty - e.y;
    const dist = Math.hypot(dx, dy);
    if (dist < e.speed) e.idx++;
    else {
      e.x += dx / dist * e.speed;
      e.y += dy / dist * e.speed;
    }
  }

  // クリア判定
  if (!clearShown &&
      playModel.spawned === totalToSpawn &&
      playModel.enemies.length === 0 &&
      playModel.lives > 0) {
    clearShown = true;
  }

  render();
  requestAnimationFrame(gameLoop);
}


// ----------------------------
// 初期化
// ----------------------------
function init() {
  const app    = document.getElementById('app');
  const canvas = document.createElement('canvas');
  canvas.id    = 'game-canvas';
  canvas.width  = STAGE.map.cols * STAGE.map.tileSize;
  canvas.height = STAGE.map.rows * STAGE.map.tileSize;
  app.appendChild(canvas);

  renderer.initRenderer('game-canvas', STAGE);
  initSidebar(canvas, playModel, render);

  assetLoader.loadImages().then(() => {
    scheduleWaves(playModel);
    render();
    requestAnimationFrame(gameLoop);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
