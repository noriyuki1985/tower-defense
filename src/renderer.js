// ────────────────────────────────────
// ファイル: src/renderer.js
// ────────────────────────────────────
import { assetLoader } from './rendererAssets.js';

let ctx   = null;
let stage = null;

/**
 * Canvas 初期化時に呼ぶ
 * @param {string} canvasId
 * @param {object} stageObj
 */
export function initRenderer(canvasId, stageObj) {
  const canvas = document.getElementById(canvasId);
  canvas.width  = stageObj.map.cols * stageObj.map.tileSize;
  canvas.height = stageObj.map.rows * stageObj.map.tileSize;
  ctx   = canvas.getContext('2d');
  stage = stageObj;
}

/** 外部からステージを差し替えたいときに呼ぶ */
export function setStage(stageObj) {
  stage = stageObj;
}

export function clear() {
  ctx.clearRect(
    0, 0,
    stage.map.cols * stage.map.tileSize,
    stage.map.rows * stage.map.tileSize
  );
}

export function drawTile(r, c) {
  const key = stage.map.tiles[r][c] === 1 ? 'tile_road' : 'tile_grass';
  ctx.drawImage(
    assetLoader.images[key],
    c * stage.map.tileSize,
    r * stage.map.tileSize,
    stage.map.tileSize,
    stage.map.tileSize
  );
}

export function drawTower(t) {
  ctx.drawImage(
    assetLoader.images[t.spriteKey],
    t.x, t.y,
    stage.map.tileSize,
    stage.map.tileSize
  );
}

export function drawEnemy(e) {
  ctx.drawImage(
    assetLoader.images[e.spriteKey],
    e.x, e.y,
    stage.map.tileSize,
    stage.map.tileSize
  );
}

export function drawProjectile(p) {
  ctx.drawImage(
    assetLoader.images[p.spriteKey],
    p.x, p.y,
    stage.map.tileSize / 2,
    stage.map.tileSize / 2
  );
}

export function drawClear() {
  ctx.fillStyle = 'yellow';
  ctx.font      = '48px sans-serif';
  const x = (stage.map.cols * stage.map.tileSize) / 2 - 80;
  const y = (stage.map.rows * stage.map.tileSize) / 2;
  ctx.fillText('クリア！', x, y);
}
