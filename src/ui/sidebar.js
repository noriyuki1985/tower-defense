// ────────────────────────────────────
// ファイル: src/ui/sidebar.js
// ────────────────────────────────────
import { CONFIG, grid } from '../config.js';

/**
 * サイドバー（タワー設置 UI）を動的に生成して、
 * クリックでタワー設置できるようにする
 * @param {HTMLCanvasElement} canvas
 * @param {object} playModel
 * @param {Function} render
 */
export function initSidebar(canvas, playModel, render) {
  // サイドバー要素を生成
  const sidebar = document.createElement('div');
  sidebar.id = 'sidebar';
  Object.assign(sidebar.style, {
    width: '200px',
    background: 'rgba(0,0,0,0.8)',
    borderLeft: '2px solid #fff',
    padding: '10px',
    boxSizing: 'border-box'
  });
  document.body.appendChild(sidebar);

  // 見出し
  const h2 = document.createElement('h2');
  h2.textContent = 'タワー設置';
  h2.style.marginBottom = '10px';
  h2.style.fontSize = '18px';
  sidebar.appendChild(h2);

  // タワー選択ボタン
  let selectedDef = null;
  CONFIG.TOWER_DEFINITIONS.forEach(def => {
    const btn = document.createElement('button');
    btn.textContent = `${def.id} (${def.cost}G)`;
    btn.dataset.tower = def.id;
    Object.assign(btn.style, {
      width: '100%',
      marginBottom: '8px',
      padding: '8px',
      background: '#444',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      boxSizing: 'border-box'
    });
    sidebar.appendChild(btn);

    btn.addEventListener('click', () => {
      // 選択状態の切り替え
      sidebar.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDef = def;
      selectedSpan.textContent = def.id;
    });
  });

  // 選択中表示
  const p = document.createElement('p');
  p.style.marginTop = '10px';
  p.style.fontSize = '14px';
  p.textContent = '選択中：';
  const selectedSpan = document.createElement('span');
  selectedSpan.id = 'selected-tower';
  selectedSpan.textContent = 'なし';
  p.appendChild(selectedSpan);
  sidebar.appendChild(p);

  // キャンバスクリックでタワー設置
  canvas.addEventListener('click', e => {
    if (!selectedDef) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top ) * scaleY;
    const col = Math.floor(mx / CONFIG.TILE_SIZE);
    const row = Math.floor(my / CONFIG.TILE_SIZE);

    // 範囲外 or 道 or すでにタワーがある or ゴールド不足 は設置不可
    if (
      row < 0 || row >= CONFIG.MAP_ROWS ||
      col < 0 || col >= CONFIG.MAP_COLS ||
      grid[row][col] === 1 ||
      playModel.towers.some(t => t.x === col*CONFIG.TILE_SIZE && t.y === row*CONFIG.TILE_SIZE) ||
      playModel.gold < selectedDef.cost
    ) return;

    // 設置処理
    playModel.gold -= selectedDef.cost;
    playModel.towers.push({
      ...selectedDef,
      x: col * CONFIG.TILE_SIZE,
      y: row * CONFIG.TILE_SIZE,
      lastFire: 0
    });
    selectedSpan.textContent = selectedDef.id;
    render();
  });
}
