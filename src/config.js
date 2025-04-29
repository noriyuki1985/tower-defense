// src/config.js
import enemies      from './data/enemies.json';
import towers       from './data/towers.json';
import projectiles  from './data/projectiles.json';
import wavesDefs    from './data/waves.json';

export const CONFIG = {
  TILE_SIZE:          32,
  MAP_ROWS:           50,
  MAP_COLS:           50,
  ASSETS_PATH:        './assets/images',
  INITIAL_GOLD:       1000,
  INITIAL_LIVES:      20,

  ENEMY_DEFINITIONS:      enemies,
  TOWER_DEFINITIONS:      towers,
  PROJECTILE_DEFINITIONS: projectiles,
  WAVES_DEFS:             wavesDefs
};
