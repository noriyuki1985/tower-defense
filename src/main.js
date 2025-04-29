// src/main.js
import { STAGE }           from './config.js';
import { assetLoader, renderer } from './renderer.js';
import { initSidebar }     from './ui/sidebar.js';
import { updateHUD }       from './ui/hud.js';
import { scheduleWaves }   from './gameplay/wave.js';

// 共有モデル
const playModel = { towers:[], enemies:[], projectiles:[], gold:STAGE.initial.gold, lives:STAGE.initial.lives, spawned:0 };
const totalToSpawn = STAGE.waves.reduce((s,w)=>s+w.enemies[0].count,0);
let clearShown = false;

// 描画・ゲームループはこれまでのコードをそのまま貼り付け
function render(){ /* …省略… */ }
function gameLoop(){ /* …省略… */ }

// 初期化
function init(){
  const app = document.getElementById('app');
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  app.appendChild(canvas);
  renderer.init('game-canvas');
  initSidebar(canvas, playModel, render);
  assetLoader.loadImages().then(()=>{
    scheduleWaves(playModel);
    render();
    requestAnimationFrame(gameLoop);
  });
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();
