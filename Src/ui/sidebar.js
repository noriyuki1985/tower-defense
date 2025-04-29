// src/ui/sidebar.js
// ----------------------------------
// タワー選択と設置 UI
// ----------------------------------
import { CONFIG, STAGE, grid } from '../config.js';
import { Tower } from '../gameplay/tower.js';

let selectedTowerId = null;

/**
 * サイドバーを生成し、クリック系イベントをセットアップ
 * @param {HTMLCanvasElement} canvas クリックを受け取るゲーム Canvas
 * @param {object} playModel 共有ゲーム状態
 * @param {function} renderFn 再描画コールバック
 */
export function initSidebar(canvas, playModel, renderFn) {
  // ------------------ Sidebar DOM ------------------
  const sidebar = document.createElement('div');
  sidebar.id = 'sidebar';
  sidebar.style.width = '200px';
  sidebar.style.background = 'rgba(0,0,0,0.8)';
  sidebar.style.borderLeft = '2px solid #fff';
  sidebar.style.padding = '10px';
  sidebar.innerHTML = `<h2>タワー設置</h2>`;

  CONFIG.TOWER_DEFINITIONS.forEach((def) => {
    const btn = document.createElement('button');
    btn.textContent = `${def.id.replace('_', ' ')} (${def.cost}G)`;
    btn.dataset.tower = def.id;
    btn.style.width = '100%';
    btn.style.marginBottom = '8px';
    btn.style.padding = '8px';
    btn.style.background = '#444';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '14px';

    btn.addEventListener('click', () => {
      sidebar.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTowerId = btn.dataset.tower;
      selectedSpan.textContent = selectedTowerId;
    });

    sidebar.appendChild(btn);
  });

  const selectedSpan = document.createElement('span');
  const p = document.createElement('p');
  p.style.fontSize = '14px';
  p.style.marginTop = '10px';
  p.innerText = '選択中：';
  p.appendChild(selectedSpan);
  sidebar.appendChild(p);

  document.body.appendChild(sidebar);

  // ------------------ Canvas click ------------------
  canvas.addEventListener('click', (e) => {
    if (!selectedTowerId) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const col = Math.floor(mx / CONFIG.TILE_SIZE);
    const row = Math.floor(my / CONFIG.TILE_SIZE);

    const occupied = playModel.towers.some((t) => t.x === col * CONFIG.TILE_SIZE && t.y === row * CONFIG.TILE_SIZE);

    if (grid[row][col] === 0 && !occupied) {
      const def = CONFIG.TOWER_DEFINITIONS.find((t) => t.id === selectedTowerId);
      if (playModel.gold >= def.cost) {
        playModel.gold -= def.cost;
        playModel.towers.push(new Tower(def, { r: row, c: col }));
        renderFn();
      }
    }
  });
}
