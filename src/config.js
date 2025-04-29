// src/config.js

// ―――――――――――――――――――
// 静的設定
// ―――――――――――――――――――
export const CONFIG = {
  TILE_SIZE:    32,
  MAP_ROWS:     50,
  MAP_COLS:     50,
  ASSETS_PATH:  './assets/images',
  INITIAL_GOLD: 1000,
  INITIAL_LIVES:20,

  // 後で fetch で読み込むので空配列で初期化
  ENEMY_DEFINITIONS:      [],
  TOWER_DEFINITIONS:      [],
  PROJECTILE_DEFINITIONS: [],
  WAVES_DEFS:             []
};

// ―――――――――――――――――――
// JSON 設定を fetch で読み込む
// ―――――――――――――――――――
export async function loadConfig() {
  const [enemies, towers, projectiles, waves] = await Promise.all([
    fetch('./src/data/enemies.json').then(r => r.json()),
    fetch('./src/data/towers.json').then(r => r.json()),
    fetch('./src/data/projectiles.json').then(r => r.json()),
    fetch('./src/data/waves.json').then(r => r.json())
  ]);

  CONFIG.ENEMY_DEFINITIONS      = enemies;
  CONFIG.TOWER_DEFINITIONS      = towers;
  CONFIG.PROJECTILE_DEFINITIONS = projectiles;
  CONFIG.WAVES_DEFS             = waves;
}

// ―――――――――――――――――――
// マップ（道）生成 & ウェイポイント
// ―――――――――――――――――――
export function generatePathGrid() {
  const { MAP_ROWS: rows, MAP_COLS: cols } = CONFIG;
  const g = Array.from({ length: rows }, () => Array(cols).fill(0));
  const dv = (c, r0, r1) => {
    const step = r0 <= r1 ? 1 : -1;
    for (let r = r0; r !== r1 + step; r += step) g[r][c] = 1;
  };
  const dh = (r, c0, c1) => {
    const step = c0 <= c1 ? 1 : -1;
    for (let c = c0; c !== c1 + step; c += step) g[r][c] = 1;
  };

  dv(24, 0, 9);
  dh(9, 24, 35);
  dv(35, 9, 19);
  dh(19, 35, 20);
  dv(20, 19, 29);
  dh(29, 20, 30);
  dv(30, 29, 39);
  dh(39, 30, 25);
  dv(24, 39, 49);

  return g;
}

export function bfsPath(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = {};
  const q = [start];
  visited[start.r][start.c] = true;

  while (q.length) {
    const cur = q.shift();
    if (cur.r === end.r && cur.c === end.c) break;
    for (const [dr,dc] of dirs) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&!visited[nr][nc]&&grid[nr][nc]===1) {
        visited[nr][nc] = true;
        parent[`${nr},${nc}`] = cur;
        q.push({ r:nr, c:nc });
      }
    }
  }

  let node = visited[end.r][end.c] ? end : null;
  const path = [];
  while (node) {
    path.push({ r: node.r, c: node.c });
    node = parent[`${node.r},${node.c}`];
  }
  return path.reverse();
}

// 一度だけ生成してキャッシュ
export const grid = generatePathGrid();
export const waypoints = bfsPath(grid, {r:0,c:24}, {r:49,c:24});
