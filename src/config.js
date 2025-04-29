// src/config.js
// 画像フォルダは index.html からの相対パス
export const CONFIG = {
  TILE_SIZE:    32,
  MAP_ROWS:     50,
  MAP_COLS:     50,
  // assets/images 以下に全画像をまとめる前提
  ASSETS_PATH:  './assets/images',
  INITIAL_GOLD: 1000,
  INITIAL_LIVES:20,
  ENEMY_DEFINITIONS: [ /* …省略… */ ],
  TOWER_DEFINITIONS: [ /* …省略… */ ],
  PROJECTILE_DEFINITIONS: [ /* …省略… */ ],
  WAVES: [ /* …省略… */ ]
};

// グリッド・ウェイポイント生成も同じファイル内に
export const grid = generatePathGrid();
export const waypoints = bfsPath(grid, {r:0,c:24}, {r:49,c:24});

export const STAGE = {
  map:    { tiles:grid, rows:MAP_ROWS, cols:MAP_COLS, tileSize:TILE_SIZE },
  path:   { waypoints },
  waves:  WAVES,
  initial:{ gold:INITIAL_GOLD, lives:INITIAL_LIVES }
};
