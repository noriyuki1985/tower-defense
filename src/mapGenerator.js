// src/mapGenerator.js
// --------------------------------------------------
// ランダムステージ生成ユーティリティ
// ・迷路ライクな 1 本道を自動生成
// --------------------------------------------------

import { CONFIG } from './config.js';

/**
 * ランダムな 1 本道グリッドを返す
 * 0 = 草, 1 = 道
 * @param {number} rows
 * @param {number} cols
 * @returns {number[][]}
 */
export function generateRandomPathGrid(rows, cols) {
  // 全部 0 で初期化
  const g = Array.from({ length: rows }, () => Array(cols).fill(0));

  // 方向ベクトル
  const dirs = [
    [1, 0],   // down
    [0, 1],   // right
    [0, -1]   // left
  ];

  // スタートは上端の中央あたり
  let r = 0;
  let c = Math.floor(cols / 2);
  g[r][c] = 1;

  // ゴールまでランダムウォーク（下端に着くまで）
  while (r < rows - 1) {
    // 進める候補方向を抽出（場外 & 後戻りを除外）
    const candidates = dirs.filter(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      return (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        g[nr][nc] === 0      // まだ草
      );
    });

    // 行き止まりなら上に 1 マス戻って分岐を探す
    if (candidates.length === 0) {
      r -= 1;
      continue;
    }

    // 1 方向ランダム選択
    const [dr, dc] = candidates[Math.floor(Math.random() * candidates.length)];
    r += dr;
    c += dc;
    g[r][c] = 1;
  }

  return g;
}

/**
 * BFS で道に沿ったウェイポイントを抽出
 * @param {number[][]} grid
 * @returns {{r:number,c:number}[]}
 */
export function extractWaypoints(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];

  // スタート(上端で grid=1 の最初のマス)
  const startC = grid[0].findIndex(v => v === 1);
  const start  = { r: 0, c: startC };
  const end    = { r: rows - 1, c: grid[rows - 1].findIndex(v => v === 1) };

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent  = {};
  const q = [start];
  visited[start.r][start.c] = true;

  while (q.length) {
    const cur = q.shift();
    if (cur.r === end.r && cur.c === end.c) break;
    for (const [dr, dc] of dirs) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        !visited[nr][nc] &&
        grid[nr][nc] === 1
      ) {
        visited[nr][nc] = true;
        parent[`${nr},${nc}`] = cur;
        q.push({ r: nr, c: nc });
      }
    }
  }

  // 逆順でたどって正順に戻す
  let node = end;
  const path = [];
  while (node) {
    path.push(node);
    node = parent[`${node.r},${node.c}`];
  }
  return path.reverse();
}

/**
 * ステージ生成 (rows/cols 省略なら設定値と同じ)
 * @param {number} [rows]
 * @param {number} [cols]
 * @returns {import('./config.js').STAGE}
 */
export function createRandomStage(rows = CONFIG.MAP_ROWS, cols = CONFIG.MAP_COLS) {
  const tiles     = generateRandomPathGrid(rows, cols);
  const waypoints = extractWaypoints(tiles);

  return {
    map: {
      tiles,
      rows,
      cols,
      tileSize: CONFIG.TILE_SIZE
    },
    path:   { waypoints },
    waves:  CONFIG.WAVES,
    initial:{ gold: CONFIG.INITIAL_GOLD, lives: CONFIG.INITIAL_LIVES }
  };
}
