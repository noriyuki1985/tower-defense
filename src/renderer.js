// src/renderer.js
// ----------------------------------
// 画像のロードと Canvas 描画ヘルパー
// ----------------------------------
import { CONFIG, STAGE } from './config.js';

export const assetLoader = {
  images: {},

  loadImages() {
    const keys = [
      'tile_grass',
      'tile_road',
      ...CONFIG.ENEMY_DEFINITIONS.map((e) => e.spriteKey),
      ...CONFIG.TOWER_DEFINITIONS.map((t) => t.spriteKey),
      ...CONFIG.PROJECTILE_DEFINITIONS.map((p) => p.spriteKey)
    ];

    return Promise.all(
      keys.map((key) => {
        let cat = 'tiles';
        if (key.startsWith('enemy_')) cat = 'enemies';
        if (key.startsWith('tower_')) cat = 'towers';
        if (key.startsWith('proj_')) cat = 'projectiles';

        const img = new Image();
        img.src = `${CONFIG.ASSETS_PATH}/${cat}/${key}.png`;
        this.images[key] = img;
        return new Promise((res) => (img.onload = res));
      })
    );
  }
};

export const renderer = {
  ctx: null,

  init(canvasId) {
    const canvas = document.getElementById(canvasId);
    canvas.width = STAGE.map.cols * STAGE.map.tileSize;
    canvas.height = STAGE.map.rows * STAGE.map.tileSize;
    this.ctx = canvas.getContext('2d');
  },

  clear() {
    this.ctx.clearRect(
      0,
      0,
      STAGE.map.cols * STAGE.map.tileSize,
      STAGE.map.rows * STAGE.map.tileSize
    );
  },

  drawTile(r, c) {
    const key = STAGE.map.tiles[r][c] === 1 ? 'tile_road' : 'tile_grass';
    this.ctx.drawImage(
      assetLoader.images[key],
      c * STAGE.map.tileSize,
      r * STAGE.map.tileSize,
      STAGE.map.tileSize,
      STAGE.map.tileSize
    );
  },

  drawTower(t) {
    this.ctx.drawImage(assetLoader.images[t.spriteKey], t.x, t.y, STAGE.map.tileSize, STAGE.map.tileSize);
  },

  drawEnemy(e) {
    this.ctx.drawImage(assetLoader.images[e.spriteKey], e.x, e.y, STAGE.map.tileSize, STAGE.map.tileSize);
  },

  drawProjectile(p) {
    this.ctx.drawImage(
      assetLoader.images[p.spriteKey],
      p.x,
      p.y,
      STAGE.map.tileSize / 2,
      STAGE.map.tileSize / 2
    );
  },

  drawClear() {
    this.ctx.fillStyle = 'yellow';
    this.ctx.font = '48px sans-serif';
    const x = (STAGE.map.cols * STAGE.map.tileSize) / 2 - 80;
    const y = (STAGE.map.rows * STAGE.map.tileSize) / 2;
    this.ctx.fillText('クリア！', x, y);
  }
};
