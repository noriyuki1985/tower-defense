// main.js で省略していた部分を以下で置き換え

// ------------------ 描画 ------------------
function render(){
  renderer.clear();

  // 地形タイル
  for(let r=0; r<STAGE.map.rows; r++){
    for(let c=0; c<STAGE.map.cols; c++){
      renderer.drawTile(r,c);
    }
  }

  // タワー
  playModel.towers.forEach(t => renderer.drawTower(t));

  // プロジェクタイル
  playModel.projectiles.forEach(p => renderer.drawProjectile(p));

  // 敵
  playModel.enemies.forEach(e => renderer.drawEnemy(e));

  // HUD
  updateHUD(playModel);

  if(clearShown) renderer.drawClear();
}

// ------------------ メインループ ------------------
function gameLoop(){
  const now = Date.now();

  // タワー攻撃 & プロジェクタイル生成
  playModel.towers.forEach(t => {
    t.tryShoot(playModel.enemies, now, playModel.projectiles);
  });

  // プロジェクタイル移動＆ヒット判定
  for(let i = playModel.projectiles.length-1; i>=0; i--){
    const p = playModel.projectiles[i], e = p.target;
    if(!playModel.enemies.includes(e)){   // ターゲットが死んだ
      playModel.projectiles.splice(i,1);
      continue;
    }
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx,dy);
    if(d < p.speed){
      e.hp -= p.damage;
      if(e.hp <= 0){
        playModel.enemies.splice(playModel.enemies.indexOf(e),1);
        playModel.gold += e.reward;
      }
      playModel.projectiles.splice(i,1);
    }else{
      p.x += dx/d * p.speed;
      p.y += dy/d * p.speed;
    }
  }

  // 敵移動
  for(let i = playModel.enemies.length-1; i>=0; i--){
    const e  = playModel.enemies[i];
    const wp = STAGE.path.waypoints[e.idx];
    if(!wp){                // ゴールに到達
      playModel.lives--;
      playModel.enemies.splice(i,1);
      continue;
    }
    const tx = wp.c*STAGE.map.tileSize, ty = wp.r*STAGE.map.tileSize;
    const dx = tx-e.x, dy = ty-e.y, dist = Math.hypot(dx,dy);
    if(dist < e.speed) e.idx++;
    else{
      e.x += dx/dist * e.speed;
      e.y += dy/dist * e.speed;
    }
  }

  // クリア判定
  if(!clearShown &&
     playModel.spawned === totalToSpawn &&
     playModel.enemies.length === 0 &&
     playModel.lives > 0){
    clearShown = true;
  }

  render();
  requestAnimationFrame(gameLoop);
}
