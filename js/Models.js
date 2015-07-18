const UnitType = require('./UnitType.js').UnitType;

export const Models = [
  {
    name: 'tank-m1a1',
    path: 'models/3d/tank-m1a1.json',
    scale: 0.05,
    texturePath: 'models/images/camouflage.jpg',
    textureRepeat: new THREE.Vector2(0.2, 0.2),
  },
  {
    name: 'dragon',
    path: 'models/3d/dragon.json',
    scale: 1,
    texturePath: 'models/images/dragon.jpg',
    type: UnitType.Air,
  },
  {
    name: 'house',
    path: 'models/3d/house.json',
    scale: 0.03,
    texturePath: 'models/images/house.jpg',
    type: UnitType.Building,
  },
  {
    name: 'ant',
    path: 'models/3d/ant.json',
    scale: 10,
    rotation: new THREE.Vector3(0, -Math.PI / 2, 0),
    texturePath: 'models/images/ant.jpg',
  },
  {
    name: 'tank-apc',
    path: 'models/3d/tank-apc.json',
    scale: 0.2,
    rotation: new THREE.Vector3(0, Math.PI / 2, 0),
  },
  {
    name: 'diamond',
    path: 'models/3d/diamond.json',
    scale: 3,
    texturePath: 'models/images/diamond.jpg',
    textureRepeat: new THREE.Vector2(0.01, 0.01),
    opacity: 0.6,
  },
  {
    name: 'horse',
    path: 'models/3d/horse.json',
    scale: 1.5,
    texturePath: 'models/images/horse.jpg',
  },
  {
    name: 'fighter',
    path: 'models/3d/fighter.json',
    scale: 3,
    rotation: new THREE.Vector3(0, Math.PI / 2, 0),
    texturePath: 'models/images/fighter.jpg',
    type: UnitType.Air,
  },
  {
    name: 'thor',
    path: 'models/3d/thor.json',
    scale: 5,
    texturePath: 'models/images/thor.jpg',
  },
  {
    name: 'biplane',
    path: 'models/3d/biplane.json',
    scale: 1,
    rotation: new THREE.Vector3(0, Math.PI / 2, 0),
    texturePath: 'models/images/biplane.jpg',
    type: UnitType.Air,
  },
  {
    name: 'farm',
    path: 'models/3d/farm.json',
    scale: 500,
    texturePath: 'models/images/farm.jpg',
    type: UnitType.Building,
  },
  {
    name: 'missile',
    path: 'models/3d/missile.json',
    scale: 3,
    texturePath: 'models/images/missile.jpg',
    type: UnitType.Missile,
  },
];

