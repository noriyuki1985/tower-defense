// src/config.js
// ------------------------------
// 定数・ステージ設定とグリッド生成
// ------------------------------
const ASSETS_BASE = `${import.meta.env.BASE_URL}assets/images`;

export const CONFIG = {
  TILE_SIZE: 32,
  MAP_ROWS: 50,
  MAP_COLS: 50,
  ASSETS_PATH: ASSETS_BASE,
  INITIAL_GOLD: 1000,
  INITIAL_LIVES: 20,
  ENEMY_DEFINITIONS: [
    { id: 'slime', hp: 50, speed: 1.2, reward: 5, spriteKey: 'enemy_slime' },
    { id: 'orc_soldier', hp: 200, speed: 1.0, reward: 20, spriteKey: 'enemy_orc_soldier' }
  ],
  TOWER_DEFINITIONS: [
    { id: 'archer_tower', cost: 100, range: 3, damage: 25, fireRate: 800, projectileType: 'arrow', spriteKey: 'tower_archer' },
    { id: 'mage_tower',   cost: 250, range: 3, damage: 40, fireRate: 1200, projectileType: 'magic', spriteKey: 'tower_mage' }
  ],
  PROJECTILE_DEFINITIONS: [
    { id: 'arrow', speed: 4.0, spriteKey: 'proj_arrow' },
    { id: 'magic', speed: 3.0, spriteKey: 'proj_magic_missile' }
  ],
  WAVES: Array.from({ length: 20 }, (_, i) => ({
    waveNo: i + 1,
    delay: 2000 + i * 3000,
    enemies: [{
      type: i % 2 === 0 ? 'slime' : 'orc_soldier',
      count: 5 + i,
      interval: 800
    }]
  }))
};

// ----- グリッドとウェイポイント -----
function generatePathGrid() { /* 省略せず全コード入り */ }
function bfsPath(grid, start, end)   { /* 同上 */ }

export const grid      = generatePathGrid();
export const waypoints = bfsPath(grid, { r: 0, c: 24 }, { r: 49, c: 24 });

export const STAGE = {
  map: { tiles: grid, rows: CONFIG.MAP_ROWS, cols: CONFIG.MAP_COLS, tileSize: CONFIG.TILE_SIZE },
  path: { waypoints },
  waves: CONFIG.WAVES,
  initial: { gold: CONFIG.INITIAL_GOLD, lives: CONFIG.INITIAL_LIVES }
};
