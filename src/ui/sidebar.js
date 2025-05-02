// src/ui/sidebar.js

import { CONFIG, grid } from '../config.js';
import { Tower }        from '../gameplay/tower.js';

/**
 * サイドバー（タワー設置 UI）を生成し、
 * クリックでタワーを設置できるようにする
 * @param {HTMLCanvasElement} canvas - ゲーム用キャンバス
 * @param {object} playModel - ゲームモデル（towers, gold などを保持）
 * @param {Function} render - 描画関数
 */
export function initSidebar(canvas, playModel, render) {
  // サイドバー用の div を作成
  const sidebar = document.createElement('div');
  sidebar.id = 'sidebar';
  Object.assign(sidebar.style, {
    width: '200px',
    background: 'rgba(0,0,0,0.8)',
    borderLeft: '2px solid #fff',
    padding: '10px',
    boxSizing: 'border-box',
    color: '#fff',
    fontFamily: 'sans-serif'
  });
  document.body.appendChild(sidebar);

  // 見出し
  const header = document.createElement('h2');
  header.textContent = 'タワー設置';
  header.style.marginBottom = '10px';
  header.style.fontSize = '18px';
  sidebar.appendChild(header);

  // タワー選択ボタンを作成
  let selectedDef = null;
  const selectedSpan = document.createElement('span');
  CONFIG.TOWER_DEFINITIONS.forEach(def => {
    const button = document.createElement('button');
    button.textContent = `${def.id} (${def.cost}G)`;
    button.dataset.tower = def.id;
    Object.assign(button.style, {
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
    sidebar.appendChild(button);

    button.addEventListener('click', () => {
      // ボタンの選択ハイライト
      const buttons = sidebar.querySelectorAll('button');
      buttons.forEach(b => b.classList.remove('selected'));
      button.classList.add('selected');
      selectedDef = def;
      selectedSpan.textContent = def.id;
    });
  });

  // 選択中のタワー表示
  const info = document.createElement('p');
  info.style.marginTop = '10px';
  info.style.fontSize = '14px';
  info.textContent = '選択中：';
  selectedSpan.id = 'selected-tower';
  selectedSpan.textContent = 'なし';
  info.appendChild(selectedSpan);
  sidebar.appendChild(info);

  // キャンバスをクリックしたときのタワー設置処理
  canvas.addEventListener('click', e => {
    if (!selectedDef) {
      return;
    }

    // クリック位置をマップのグリッド座標に変換
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    const col = Math.floor(mx / CONFIG.TILE_SIZE);
    const row = Math.floor(my / CONFIG.TILE_SIZE);

    // 設置禁止条件
    if (
      row < 0 ||
      row >= CONFIG.MAP_ROWS ||
      col < 0 ||
      col >= CONFIG.MAP_COLS ||
      grid[row][col] === 1 ||  // 道上は設置不可
      playModel.towers.some(t => t.x === col * CONFIG.TILE_SIZE && t.y === row * CONFIG.TILE_SIZE) ||
      playModel.gold < selectedDef.cost
    ) {
      return;
    }

    // ゴールドを減らし、Tower インスタンスを生成して追加
    playModel.gold -= selectedDef.cost;
    const tower = new Tower(selectedDef, { r: row, c: col });
    playModel.towers.push(tower);
    selectedSpan.textContent = selectedDef.id;

    // 再描画
    render();
  });
}
