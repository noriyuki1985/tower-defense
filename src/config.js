// src/config.js

// ------------------------------
// 定数・ステージ設定
// ------------------------------
export const CONFIG = {
  TILE_SIZE:    32,
  MAP_ROWS:     50,
  MAP_COLS:     50,
  ASSETS_PATH:  './assets/images',
  INITIAL_GOLD: 1000,
  INITIAL_LIVES:20,
  ENEMY_DEFINITIONS: [
    { id:'slime',       hp:50,  speed:1.2, reward: 5, spriteKey:'enemy_slime'       },
    { id:'orc_soldier', hp:200, speed:1.0, reward:20, spriteKey:'enemy_orc_soldier' }
  ],
  TOWER_DEFINITIONS: [
    { id:'archer_tower', cost:100, range:3,  damage:25, fireRate:800,  projectileType:'arrow', spriteKey:'tower_archer' },
    { id:'mage_tower',   cost:250, range:3,  damage:40, fireRate:1200, projectileType:'magic', spriteKey:'tower_mage'   }
  ],
  PROJECTILE_DEFINITIONS: [
    { id:'arrow', speed:4.0, spriteKey:'proj_arrow' },
    { id:'magic', speed:3.0, spriteKey:'proj_magic_missile' }
  ],
  WAVES: Array.from({length:20},(_,i)=>({
    waveNo: i+1,
    delay: 2000 + i*3000,
    enemies:[{ type: i%2===0 ? 'slime' : 'orc_soldier', count:5 + i, interval:800 }]
  }))
};

// ------------------------------
// グリッド（道）生成
// ------------------------------
export function generatePathGrid() {
  const { MAP_ROWS: rows, MAP_COLS: cols } = CONFIG;
  const g = Array.from({ length: rows }, () => Array(cols).fill(0));

  const dv = (col, r0, r1) => {
    const step = r0 <= r1 ? 1 : -1;
    for (let r = r0; r !== r1 + step; r += step) g[r][col] = 1;
  };
  const dh = (row, c0, c1) => {
    const step = c0 <= c1 ? 1 : -1;
    for (let c = c0; c !== c1 + step; c += step) g[row][c] = 1;
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

// ------------------------------
// 経路探索（BFS）
// ------------------------------
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
      if (
        nr>=0 && nr<rows &&
        nc>=0 && nc<cols &&
        !visited[nr][nc] &&
        grid[nr][nc]===1
      ) {
        visited[nr][nc] = true;
        parent[`${nr},${nc}`] = cur;
        q.push({r:nr, c:nc});
      }
    }
  }

  let node = visited[end.r][end.c] ? end : null;
  const path = [];
  while (node) {
    path.push({r:node.r, c:node.c});
    node = parent[`${node.r},${node.c}`];
  }
  return path.reverse();
}

// ------------------------------
// グリッド＆ウェイポイント生成
// ------------------------------
export const grid      = generatePathGrid();
export const waypoints = bfsPath(grid, {r:0, c:24}, {r:49, c:24});

// ------------------------------
// ステージ定義
// ------------------------------
export const STAGE = {
  map:    { tiles: grid, rows: CONFIG.MAP_ROWS, cols: CONFIG.MAP_COLS, tileSize: CONFIG.TILE_SIZE },
  path:   { waypoints },
  waves:  CONFIG.WAVES,
  initial:{ gold: CONFIG.INITIAL_GOLD, lives: CONFIG.INITIAL_LIVES }
};
