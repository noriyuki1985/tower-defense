// src/gameplay/tower.js
// ----------------------------------
// Tower クラス
// ----------------------------------
import { CONFIG } from '../config.js';

export class Tower {
  constructor(def, gridPos) {
    Object.assign(this, def);
    // STAGE.map.tileSize → CONFIG.TILE_SIZE に変更
    this.x = gridPos.c * CONFIG.TILE_SIZE;
    this.y = gridPos.r * CONFIG.TILE_SIZE;
    this.lastFire = 0;
  }

  /** @returns {boolean} 発射できたか */
  tryShoot(enemies, now, projectiles) {
    if (now - this.lastFire < this.fireRate) return false;

    // 射程内の敵を検索
    const inRange = enemies.filter((e) => {
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      // STAGE.map.tileSize → CONFIG.TILE_SIZE に変更
      return Math.hypot(dx, dy) <= this.range * CONFIG.TILE_SIZE;
    });

    if (inRange.length === 0) return false;

    // 最も近い敵をターゲット
    const target = inRange.reduce((a, b) => {
      const da = Math.hypot(a.x - this.x, a.y - this.y);
      const db = Math.hypot(b.x - this.x, b.y - this.y);
      return da < db ? a : b;
    });

    // 弾定義はそのまま CONFIG から取得
    const pDef = CONFIG.PROJECTILE_DEFINITIONS.find((p) => p.id === this.projectileType);

    projectiles.push({
      spriteKey: pDef.spriteKey,
      // 発射位置のオフセットも CONFIG.TILE_SIZE で計算
      x: this.x + CONFIG.TILE_SIZE / 4,
      y: this.y + CONFIG.TILE_SIZE / 4,
      speed: pDef.speed,
      damage: this.damage,
      target
    });

    this.lastFire = now;
    return true;
  }
}
