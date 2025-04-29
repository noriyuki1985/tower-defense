// src/ui/hud.js
// ----------------------------------
// Gold / Lives 表示用 HUD
// ----------------------------------

const hudEl = document.createElement('div');
hudEl.id = 'hud';
hudEl.style.position = 'absolute';
hudEl.style.top = '10px';
hudEl.style.left = '10px';
hudEl.style.background = 'rgba(0,0,0,0.5)';
hudEl.style.padding = '5px 10px';
hudEl.style.borderRadius = '4px';
hudEl.style.fontSize = '16px';
document.body.appendChild(hudEl);

export function updateHUD(playModel) {
  hudEl.textContent = `Gold: ${playModel.gold}    Lives: ${playModel.lives}`;
}
