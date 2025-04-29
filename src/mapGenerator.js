// src/mapGenerator.js
import { CONFIG } from './config.js';

/**
 * ランダムな１本道グリッド (0=草, 1=道) を返す
 */
export function generateRandomPathGrid(rows = CONFIG.MAP_ROWS, cols = CONFIG.MAP_COLS) {
  const g = Array.from({ length: rows }, () => Array(cols).fill(0));
  const dirs = [[1,0],[0,1],[0,-1]]; // down/right/left

  let r = 0, c = Math.floor(cols/2);
  g[r][c] = 1;

  while (r < rows-1) {
    const candidates = dirs.filter(([dr,dc]) => {
      const nr = r+dr, nc = c+dc;
      return nr>=0 && nr<rows && nc>=0 && nc<cols && g[nr][nc]===0;
    });
    if (candidates.length===0) { r--; continue; }
    const [dr,dc] = candidates[Math.floor(Math.random()*candidates.length)];
    r += dr; c += dc; g[r][c]=1;
  }
  return g;
}

/**
 * BFS で道に沿ったウェイポイントを返す
 */
export function extractWaypoints(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const start  = { r:0, c:grid[0].findIndex(v=>v===1) };
  const end    = { r:rows-1, c:grid[rows-1].findIndex(v=>v===1) };
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent  = {};
  const q = [start];
  visited[start.r][start.c] = true;

  while (q.length) {
    const cur = q.shift();
    if (cur.r===end.r && cur.c===end.c) break;
    for (const [dr,dc] of dirs) {
      const nr=cur.r+dr, nc=cur.c+dc;
      if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&!visited[nr][nc]&&grid[nr][nc]===1) {
        visited[nr][nc]=true;
        parent[`${nr},${nc}`]=cur;
        q.push({r:nr,c:nc});
      }
    }
  }

  const path = [];
  let node = end;
  while (node) {
    path.push(node);
    node = parent[`${node.r},${node.c}`];
  }
  return path.reverse();
}

/**
 * createRandomStage(): map/path/waves/initial を返す
 */
export function createRandomStage(stageIdx=1) {
  const tiles     = generateRandomPathGrid();
  const waypoints = extractWaypoints(tiles);
  // waves は main.js で調整するので一旦コピーしておくだけ
  const waves = JSON.parse(JSON.stringify(CONFIG.WAVES));
  // 初期金・ライフも main.js 側で上書きする
  return { map:{tiles,rows:CONFIG.MAP_ROWS,cols:CONFIG.MAP_COLS,tileSize:CONFIG.TILE_SIZE},
           path:{waypoints}, waves, initial:{gold:CONFIG.INITIAL_GOLD, lives:CONFIG.INITIAL_LIVES} };
}
