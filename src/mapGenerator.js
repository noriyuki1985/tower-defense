// src/mapGenerator.js

import { CONFIG } from './config.js';

/**
 * ランダムな１本道グリッド (0: grass, 1: path) を生成
 * @param {number} rows 行数
 * @param {number} cols 列数
 * @returns {number[][]} 生成されたグリッド
 */
export function generateRandomPathGrid(rows = CONFIG.MAP_ROWS, cols = CONFIG.MAP_COLS) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  const directions = [
    [1, 0],  // down
    [0, 1],  // right
    [0, -1]  // left
  ];

  let r = 0;
  let c = Math.floor(cols / 2);
  grid[r][c] = 1;

  while (r < rows - 1) {
    const candidates = directions.filter(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      return nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0;
    });

    if (candidates.length === 0) {
      // 進行不能なら一つ戻って再挑戦
      r--;
      continue;
    }

    const [dr, dc] = candidates[Math.floor(Math.random() * candidates.length)];
    r += dr;
    c += dc;
    grid[r][c] = 1;
  }

  return grid;
}

/**
 * BFS で道に沿ったウェイポイントを抽出
 * @param {number[][]} grid 0/1 グリッド
 * @returns {{r:number,c:number}[]} ウェイポイント配列
 */
export function extractWaypoints(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  const start = { r: 0, c: grid[0].findIndex(v => v === 1) };
  const end   = { r: rows - 1, c: grid[rows - 1].findIndex(v => v === 1) };

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent  = {};
  const queue   = [start];
  visited[start.r][start.c] = true;

  while (queue.length) {
    const { r: cr, c: cc } = queue.shift();
    if (cr === end.r && cc === end.c) break;
    for (const [dr, dc] of dirs) {
      const nr = cr + dr, nc = cc + dc;
      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        !visited[nr][nc] &&
        grid[nr][nc] === 1
      ) {
        visited[nr][nc] = true;
        parent[`${nr},${nc}`] = { r: cr, c: cc };
        queue.push({ r: nr, c: nc });
      }
    }
  }

  const path = [];
  let node = visited[end.r][end.c] ? end : null;
  while (node) {
    path.push({ r: node.r, c: node.c });
    node = parent[`${node.r},${node.c}`];
  }

  return path.reverse();
}

/**
 * 新しいステージ情報を生成
 * @param {number} stageIdx ステージ番号（main.js で波調整用）
 * @returns {{
 *   map: { tiles:number[][], rows:number, cols:number, tileSize:number },
 *   path: { waypoints:{r:number,c:number}[] },
 *   waves: any[],
 *   initial: { gold:number, lives:number }
 * }}
 */
export function createRandomStage(stageIdx = 1) {
  const tiles     = generateRandomPathGrid();
  const waypoints = extractWaypoints(tiles);
  // CONFIG.WAVES_DEFS を深いコピー
  const waves     = JSON.parse(JSON.stringify(CONFIG.WAVES_DEFS));
  const initial   = { gold: CONFIG.INITIAL_GOLD, lives: CONFIG.INITIAL_LIVES };

  return {
    map:     { tiles, rows: CONFIG.MAP_ROWS, cols: CONFIG.MAP_COLS, tileSize: CONFIG.TILE_SIZE },
    path:    { waypoints },
    waves,
    initial
  };
}
