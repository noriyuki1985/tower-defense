// src/gameplay/tower.js
// ----------------------------------
// Tower クラス
// ----------------------------------
import { STAGE, CONFIG } from '../config.js';

export class Tower {
  constructor(def, gridPos) {
    Object.assign(this, def);
    this.x = gridPos.c * STAGE.map.tileSize;
    this.y = gridPos.r * STAGE.map.tileSize;
    this.lastFire = 0;
  }

  /** @returns {boolean} 発射できたか */
  tryShoot(enemies, now, projectiles) {
    if (now - this.lastFire < this.fireRate) return false;

    // 射程内の敵を検索
    const inRange = enemies.filter((e) => {
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      return Math.hypot(dx, dy) <= this.range * STAGE.map.tileSize;
    });

    if (inRange.length === 0) return false;

    // 最も近い敵をターゲット
    const target = inRange.reduce((a, b) => {
      const da = Math.hypot(a.x - this.x, a.y - this.y);
      const db = Math.hypot(b.x - this.x, b.y - this.y);
      return da < db ? a : b;
    });

    const pDef = CONFIG.PROJECTILE_DEFINITIONS.find((p) => p.id === this.projectileType);

    projectiles.push({
      spriteKey: pDef.spriteKey,
      x: this.x + STAGE.map.tileSize / 4,
      y: this.y + STAGE.map.tileSize / 4,
      speed: pDef.speed,
      damage: this.damage,
      target
    });

    this.lastFire = now;
    return true;
  }
}
