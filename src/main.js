// src/main.js
// ----------------------------------------------------
//  エントリーポイント：ランダムマップ生成 + ゲームループ
// ----------------------------------------------------
import { createRandomStage }  from './mapGenerator.js';
import * as renderer          from './renderer.js';        // drawTile など名前空間 import
import { assetLoader }        from './renderer.js';        // 画像ローダはそのまま流用

import { initSidebar }        from './ui/sidebar.js';
import { updateHUD }          from './ui/hud.js';
import { scheduleWaves }      from './gameplay/wave.js';

// ----------------------------
// ステージをランダム生成
// ----------------------------
const STAGE = createRandomStage();   // ← 毎リロード違うマップ
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
  spawned:     0                 // wave.js が増やす
};

const totalToSpawn = STAGE.waves
  .reduce((sum, w) => sum + w.enemies[0].count, 0);

let clearShown = false;

// ----------------------------
// 描画
// ----------------------------
function render() {
  renderer.clear();

  // 地形タイル
  for (let r = 0; r < STAGE.map.rows; r++) {
    for (let c = 0; c < STAGE.map.cols; c++) {
      renderer.drawTile(r, c);
    }
  }

  // タワー・弾・敵
  playModel.towers.forEach(t      => renderer.drawTower(t));
  playModel.projectiles.forEach(p => renderer.drawProjectile(p));
  playModel.enemies.forEach(e     => renderer.drawEnemy(e));

  // HUD
  updateHUD(playModel);

  if (clearShown) renderer.drawClear();
}

// ----------------------------
// メインループ
// ----------------------------
function gameLoop() {
  const now = Date.now();

  // タワー攻撃 & 弾生成
  playModel.towers.forEach(t =>
    t.tryShoot(playModel.enemies, now, playModel.projectiles)
  );

  // 弾移動 & ヒット判定
  for (let i = playModel.projectiles.length - 1; i >= 0; i--) {
    const p = playModel.projectiles[i];
    const e = p.target;
    if (!playModel.enemies.includes(e)) {               // ターゲットが死んだ
      playModel.projectiles.splice(i, 1);
      continue;
    }
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
    if (d < p.speed) {                                  // 命中
      e.hp -= p.damage;
      if (e.hp <= 0) {
        playModel.enemies.splice(playModel.enemies.indexOf(e), 1);
        playModel.gold += e.reward;
      }
      playModel.projectiles.splice(i, 1);
    } else {                                            // 飛翔中
      p.x += dx / d * p.speed;
      p.y += dy / d * p.speed;
    }
  }

  // 敵移動
  for (let i = playModel.enemies.length - 1; i >= 0; i--) {
    const e  = playModel.enemies[i];
    const wp = STAGE.path.waypoints[e.idx];
    if (!wp) {                                         // ゴール到達
      playModel.lives--;
      playModel.enemies.splice(i, 1);
      continue;
    }
    const tx = wp.c * STAGE.map.tileSize;
    const ty = wp.r * STAGE.map.tileSize;
    const dx = tx - e.x, dy = ty - e.y, dist = Math.hypot(dx, dy);
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
  // Canvas を動的生成
  const app    = document.getElementById('app');
  const canvas = document.createElement('canvas');
  canvas.id    = 'game-canvas';
  app.appendChild(canvas);

  // レンダラー初期化（ステージ情報付き）
  renderer.initRenderer('game-canvas', STAGE);

  // タワー設置 UI
  initSidebar(canvas, playModel, render);

  // 画像ロード後にゲーム開始
  assetLoader.loadImages().then(() => {
    scheduleWaves(playModel);   // 敵スポーンを予約
    render();                   // 初回描画
    requestAnimationFrame(gameLoop);
  });
}

// DOMContentLoaded 後に init()
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
