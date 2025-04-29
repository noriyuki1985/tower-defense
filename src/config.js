// src/config.js

// ==============================
// 定数設定
// ==============================
export const CONFIG = {
  TILE_SIZE:    32,
  MAP_ROWS:     50,
  MAP_COLS:     50,
  ASSETS_PATH:  './assets/images',
  INITIAL_GOLD: 1000,
  INITIAL_LIVES:20,
  ENEMY_DEFINITIONS: [ /* … */ ],
  TOWER_DEFINITIONS: [ /* … */ ],
  PROJECTILE_DEFINITIONS: [ /* … */ ],
  WAVES: [ /* … */ ]
};

// ==============================
// グリッド生成関数
// ==============================
export function generatePathGrid() {
  const { MAP_ROWS: rows, MAP_COLS: cols } = CONFIG;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  // ここに dv(), dh() の実装を入れて道を描画
  // 例:
  // function dv(col, from, to){ … }
  // …
  return grid;
}

// ==============================
// 経路探索関数
// ==============================
export function bfsPath(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = {};
  const queue = [ start ];
  visited[start.r][start.c] = true;

  // BFS ループ
  while (queue.length) {
    const cur = queue.shift();
    if (cur.r === end.r && cur.c === end.c) break;
    for (const [dr,dc] of dirs) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        !visited[nr][nc] &&
        grid[nr][nc] === 1
      ) {
        visited[nr][nc] = true;
        parent[`${nr},${nc}`] = cur;
        queue.push({ r: nr, c: nc });
      }
    }
  }

  // パスをたどってリスト化
  let node = visited[end.r][end.c] ? end : null;
  const path = [];
  while (node) {
    path.push({ r: node.r, c: node.c });
    node = parent[`${node.r},${node.c}`];
  }
  return path.reverse();
}

// ==============================
// グリッド＆ウェイポイント生成
// ==============================
export const grid      = generatePathGrid();
export const waypoints = bfsPath(grid, { r: 0, c: 24 }, { r: 49, c: 24 });

// ==============================
// ステージ定義オブジェクト
// ==============================
export const STAGE = {
  map:    { tiles: grid, rows: CONFIG.MAP_ROWS, cols: CONFIG.MAP_COLS, tileSize: CONFIG.TILE_SIZE },
  path:   { waypoints },
  waves:  CONFIG.WAVES,
  initial:{ gold: CONFIG.INITIAL_GOLD, lives: CONFIG.INITIAL_LIVES }
};
