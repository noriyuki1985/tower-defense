// ────────────────────────────────────
// ファイル: src/rendererAssets.js
// ────────────────────────────────────
import { CONFIG } from './config.js';

export const assetLoader = {
  images: {},

  /**
   * すべての画像を読み込んでから resolve する Promise を返す
   */
  loadImages() {
    const keys = [
      'tile_grass', 'tile_road',
      ...CONFIG.ENEMY_DEFINITIONS.map(e => e.spriteKey),
      ...CONFIG.TOWER_DEFINITIONS.map(t => t.spriteKey),
      ...CONFIG.PROJECTILE_DEFINITIONS.map(p => p.spriteKey)
    ];

    return Promise.all(keys.map(key => {
      let cat = 'tiles';
      if (key.startsWith('enemy_'))  cat = 'enemies';
      if (key.startsWith('tower_'))  cat = 'towers';
      if (key.startsWith('proj_'))   cat = 'projectiles';

      const img = new Image();
      img.src = `${CONFIG.ASSETS_PATH}/${cat}/${key}.png`;
      this.images[key] = img;
      return new Promise(res => (img.onload = res));
    }));
  }
};
