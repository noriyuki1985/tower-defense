// src/gameplay/wave.js
// ----------------------------------
// Wave / スポーン制御
// ----------------------------------
import { CONFIG, STAGE, waypoints } from '../config.js';
import { Enemy } from './enemy.js';

/**
 * 敵を spawn して playModel.enemies に追加する
 * @param {object} playModel 共有ゲーム状態
 */
export function scheduleWaves(playModel) {
  STAGE.waves.forEach((wave) => {
    setTimeout(() => {
      wave.enemies.forEach((e) => {
        for (let i = 0; i < e.count; i++) {
          setTimeout(() => {
            const def = CONFIG.ENEMY_DEFINITIONS.find((d) => d.id === e.type);
            playModel.enemies.push(new Enemy(def, waypoints));
            playModel.spawned++;
          }, i * e.interval);
        }
      });
    }, wave.delay);
  });
}
