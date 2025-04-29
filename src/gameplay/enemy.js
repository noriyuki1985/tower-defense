// src/gameplay/enemy.js
// ----------------------------------
// シンプルな Enemy クラス
// ----------------------------------
import { STAGE } from '../config.js';

export class Enemy {
  constructor(def, waypoints) {
    Object.assign(this, def);
    this.hp = def.hp;
    this.waypoints = waypoints;
    const wp0 = waypoints[0];
    this.x = wp0.c * STAGE.map.tileSize;
    this.y = wp0.r * STAGE.map.tileSize;
    this.idx = 1; // 次のウェイポイントインデックス
  }

  /** 移動処理。ゴールしたら true を返す */
  update() {
    const wp = this.waypoints[this.idx];
    if (!wp) return true; // ゴール

    const tx = wp.c * STAGE.map.tileSize;
    const ty = wp.r * STAGE.map.tileSize;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.speed) {
      this.idx++;
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
    return false;
  }
}
