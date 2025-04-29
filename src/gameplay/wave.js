// src/gameplay/wave.js

/**
 * playModel.spawnEnemy(type) を使って敵を順次出現させる
 * @param {object} playModel  // must have spawnEnemy(type) and enemies[]
 * @param {Array} waves       // 各 wave: { waveNo, delay, enemies:[{type,count,interval}] }
 */
export function scheduleWaves(playModel, waves) {
  playModel.spawned = 0;
  waves.forEach(wave => {
    setTimeout(() => {
      wave.enemies.forEach(eDef => {
        for (let i = 0; i < eDef.count; i++) {
          setTimeout(() => {
            playModel.spawnEnemy(eDef.type);
            playModel.spawned++;
          }, i * eDef.interval);
        }
      });
    }, wave.delay);
  });
}
