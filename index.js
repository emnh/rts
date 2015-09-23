/*jslint browser: true, es6: true */

/* global
 * $, THREE, Stats, SimplexNoise, dat
 */

const jQuery = require('jquery');
const $ = jQuery;
window.jQuery = jQuery;
window.$ = jQuery;
const bootstrap = require('bootstrap');
const boxIntersect = require('box-intersect');
const kdtree = require('static-kdtree');
const TWEEN = require('tween.js');
const howler = require('howler');
window.StackTrace = require('stacktrace-js');

window.logstack = function() {
  const callback = function(stackframes) {
    const stringifiedStack = stackframes.map(function(sf) { 
        return sf.toString(); 
    }).join('\n'); 
    console.log(stringifiedStack); 
  };

  const errback = function(err) { console.log(err.message); };

  StackTrace.get().then(callback).catch(errback);
};

require('./js/Keys.js');
const MapControls = require('./js/MapControls.js').MapControls;
const Selection = require('./js/Selection.js').Selection;
const Util = require('./js/Util.js').Util;
const Models = require('./js/Models.js').Models;
const UnitType = require('./js/UnitType.js').UnitType;
const Debug = require('./js/Debug.js').Debug;
const ModelLoader = require('./js/ModelLoader.js').ModelLoader;

const Mouse = {
  LBUTTON: 0,
  MBUTTON: 1,
  RBUTTON: 2
}

const TeamColors = [
  // red
  new THREE.Color(0xFF0000),
  // blue
  new THREE.Color(0x0000FF),
  // teal
  new THREE.Color(0x008080),
  // purple
  new THREE.Color(0x800080),
  // orange
  new THREE.Color(0xFFA500),
  // brown
  new THREE.Color(0xA52A2A),
  // white
  new THREE.Color(0xFFFFFF),
  // yellow
  new THREE.Color(0xFFFF00),
];

const outOfSight = Number.NEGATIVE_INFINITY;

const config = {
  audio: {
    sounds: false,
    music: false
  },
  dom: {
    controlsHeight: 250,
  },
  effects: {
    explosionPool: 20,
    missilePool: 2000,
  },
  units: {
    maxUnits: 20 * 20,
    count: 20,
    m3count: 0,
    speed: 50,
    randomLocation: false,
    airAltitude: 40,
    animated: true,
    collisionBounce: 0.2,
  },
  terrain: {
    seaLevel: 0,
    minElevation: 10,
    maxElevation: 48,
    xFaces: 200,
    yFaces: 200,
    width: 4000,
    height: 4000,
  },
  camera: {
    mouseControl: false,
    X: 0,
    Y: 0,
    Z: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
  },
  debug: {
    mouseX: 0,
    mouseY: 0,
  },
};

const game = {
  dom: {
  },
  scene: {
    width: window.innerWidth,
    height: window.innerHeight - config.dom.controlsHeight,
    ground: undefined,
  },
  selector: undefined,
  mapBounds: new THREE.Box3(),
  startTime: (new Date().getTime()) / 1000.0,
  units: [],
  newUnits: [],
  heightField: [],
  heightFieldIndex: [],
  components: [],
  models: {},
  emitters: [],
  selector: {},
  renderOrders: {
    teamBar: -1,
    healthBar: -2,
    explosion: -3,
    missile: -4,
    ground: -5,
  },
  paused: {
    state: false,
    startTime: 0,
    totalTime: 0,
  },
};

// for debugging in JS console
window.game = game;

function getTime() {
  return (new Date().getTime()) / 1000.0;
}

function getGameTime() {
  return getTime() - game.startTime - game.paused.totalTime;
}

function getSize(box) {
  return {
    height: box.max.x - box.min.x,
    width: box.max.y - box.min.y,
    depth: box.max.z - box.min.z,
  };
}

function formatFloat(f, decimals=2) {
  const mul = Math.pow(10, decimals);
  return Math.round(f * mul) / mul;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function worldToScreen(pos) {
  const vector = pos.clone().project(game.scene.camera);

  vector.x = (vector.x + 1) / 2 * game.scene.width;
  vector.y = -(vector.y - 1) / 2 * game.scene.height;

  return new THREE.Vector2(vector.x, vector.y);
}

function removeFromScene(mesh) {
  game.scene.scene3.remove(mesh);
  //mesh.geometry.dispose();
  if (mesh.material) {
    mesh.material.dispose();
  }
}

function addToScene(mesh) {
  game.scene.scene3.add(mesh);
}

function SkyBox() {
  const cubeMap = new THREE.Texture([]);
  cubeMap.format = THREE.RGBFormat;
  cubeMap.flipY = false;

  const loader = new THREE.ImageLoader();
  loader.load( 'models/images/sky.jpg', function(image) {
    const getSide = function(x, y) {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext('2d');
      context.drawImage(image, -x * size, -y * size);

      return canvas;
    };

    cubeMap.image[0] = getSide(2, 1); // px
    cubeMap.image[1] = getSide(0, 1); // nx
    cubeMap.image[2] = getSide(1, 0); // py
    cubeMap.image[3] = getSide(1, 2); // ny
    cubeMap.image[4] = getSide(1, 1); // pz
    cubeMap.image[5] = getSide(3, 1); // nz
    cubeMap.needsUpdate = true;
  });

  const cubeShader = THREE.ShaderLib.cube;
  cubeShader.uniforms.tCube.value = cubeMap;

  const skyBoxMaterial = new THREE.ShaderMaterial( {
    fragmentShader: cubeShader.fragmentShader,
    vertexShader: cubeShader.vertexShader,
    uniforms: cubeShader.uniforms,
    depthWrite: false,
    side: THREE.BackSide,
  });

  const boxSize = 10000;

  const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(boxSize, boxSize, boxSize),
        skyBoxMaterial
      );

  addToScene(mesh);

  this.render = function() {
    mesh.position.copy(game.scene.camera.position);
  };
}

function initLight() {
  // Light
  const light = new THREE.DirectionalLight(0xFFFFFF);
  game.scene.light = light;
  light.position.set(500, 1000, -400);
  light.target.position.copy(game.scene.scene3.position);
  light.castShadow = true;
  light.shadowCameraLeft = -config.terrain.width;
  light.shadowCameraTop = -config.terrain.height;
  light.shadowCameraRight = config.terrain.width;
  light.shadowCameraBottom = config.terrain.height;
  light.shadowCameraNear = 0;
  light.shadowCameraFar = 2000;
  // light.shadowCameraVisible = true;
  light.shadowBias = -0.0001;
  light.shadowMapWidth = light.shadowMapHeight = 2048;
  light.shadowDarkness = 0.7;
  addToScene(light);

  // const ambient = new THREE.AmbientLight(0xFFFFFF);
  // addToScene(ambient);
}

function initStats() {
  game.scene.renderStats = new Stats();
  game.scene.renderStats.domElement.style.position = 'absolute';
  game.scene.renderStats.domElement.style.top = '0px';
  game.scene.renderStats.domElement.style.zIndex = 100;
  $('body').append(game.scene.renderStats.domElement);

  game.scene.physicsStats = new Stats();
  game.scene.physicsStats.domElement.style.position = 'absolute';
  game.scene.physicsStats.domElement.style.top = '50px';
  game.scene.physicsStats.domElement.style.zIndex = 100;
  $('body').append(game.scene.physicsStats.domElement);
}

function getSampler() {
  return new Promise((resolve, reject) => {
    const loader = new THREE.ImageLoader();
    
    const sampler = {};

    loader.load('models/maps/man.jpg', function(image) {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, image.width, image.height);

      sampler.getHeight = (x, y) => {
        x = Math.round(x * image.width) % image.width;
        y = Math.round(y * image.height) % image.height;
        const i = (x + y * image.width) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        return new THREE.Color(r, g, b).getHSL().l;
      };

      resolve(sampler);
    });
  });
}

function initGround() {

  const samplerPromise = getSampler();

  // Materials
  const groundMaterial = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture( 'models/images/grass.jpg'),
  });
  groundMaterial.map.wrapS = groundMaterial.map.wrapT = THREE.RepeatWrapping;
  groundMaterial.map.repeat.set(config.terrain.width / 100.0, config.terrain.height / 100.0);

  // Ground
  game.noiseGen = new SimplexNoise();
  const groundGeometry = new THREE.PlaneBufferGeometry(
      config.terrain.width,
      config.terrain.height,
      config.terrain.xFaces,
      config.terrain.yFaces);
  groundGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));
  for (let i = 0; i <= config.terrain.xFaces; i++) {
    game.heightField[i] = [];
    game.heightFieldIndex[i] = [];
  }
  const stride = 3;
  let positionsLength;
  if (THREE.REVISION === '71') {
    positionsLength = groundGeometry.attributes.position.length;
  } else {
    positionsLength = groundGeometry.attributes.position.count * stride;
  }
  // TODO: for three r72dev use setX setY setZ on the attribute
  for (let i = 0; i < positionsLength; i += stride) {
    const x = groundGeometry.attributes.position.array[i];
    const z = groundGeometry.attributes.position.array[i + 2];
    let y = 0;
    // let edges of map be 0
    const eps = 0.01;
    if (x > -config.terrain.width / 2 + eps &&
        x < config.terrain.width / 2 - eps &&
        z > -config.terrain.height / 2 + eps &&
        z < config.terrain.height / 2 - eps) {
      const noise = game.noiseGen.noise(x / 100, z / 100);
      // normalize [-1,1] to [0,1]
      const normalNoise = (noise + 1) / 2;
      y = normalNoise * config.terrain.maxElevation + config.terrain.minElevation;
      groundGeometry.attributes.position.array[i + 1] = y;
    }

    const xi = (x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width;
    const yi = (z + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height;
    game.heightField[xi][yi] = y;
    game.heightFieldIndex[xi][yi] = i;
  }
  groundGeometry.computeFaceNormals();
  groundGeometry.computeVertexNormals();

  game.scene.ground = new THREE.Mesh(groundGeometry, groundMaterial);
  // ground.rotation.x = Math.PI / -2;
  game.scene.ground.receiveShadow = true;
  game.scene.ground.renderOrder = game.renderOrders.ground;
  addToScene(game.scene.ground);

  samplerPromise.then((sampler) => {
    for (let i = 0; i < positionsLength; i += 3) {
      const x = groundGeometry.attributes.position.array[i];
      const z = groundGeometry.attributes.position.array[i + 2];
      const xt = (x + config.terrain.width / 2) / config.terrain.width;
      const yt = (z + config.terrain.height / 2) / config.terrain.height;
      const xi = Math.round(xt * config.terrain.xFaces);
      const yi = Math.round(yt * config.terrain.yFaces);
      let y = sampler.getHeight(xt, yt) + config.terrain.minElevation;
      // const y = config.terrain.minElevation;
      if (!Util.isInt(y) && !Util.isFloat(y)) {
        throw 'doesnt work'
      }
      // XXX: disabled
      // groundGeometry.attributes.position.array[i + 1] = y;
      // game.heightField[xi][yi] = y;
    };
    game.scene.ground.geometry.computeFaceNormals();
    game.scene.ground.geometry.computeVertexNormals();
    game.scene.ground.geometry.attributes.position.needsUpdate = true;
  });

  game.mapBounds.min.x = -config.terrain.width / 2;
  game.mapBounds.min.y = 0;
  game.mapBounds.min.z = -config.terrain.height / 2;
  game.mapBounds.max.x = config.terrain.width / 2;
  game.mapBounds.max.y = config.terrain.maxElevation * 2;
  game.mapBounds.max.z = config.terrain.height / 2;
}

function Sea() {
  const plane = new THREE.PlaneGeometry(config.terrain.width * 2, config.terrain.height * 2, 1, 1);

  plane.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      iGlobalTime: { type: 'f', value: 0.0 },
      angv: { type: 'v3', value: new THREE.Vector2(0, 0, 0) },
      ang: { type: 'v3', value: new THREE.Vector2(0, 0, 0) },
      ori: { type: 'v3', value: new THREE.Vector2(0, 0, 0) },
      dir: { type: 'v3', value: new THREE.Vector2(0, 0, 0) },
      light: { type: 'v3', value: new THREE.Vector2(0, 0, 0) },
    },
    vertexShader: $('#water-vertex').text(),
    fragmentShader: $('#water-fragment').text(),
    transparent: true,
  });

  const seaMesh = new THREE.Mesh(plane, material);

  seaMesh.position.y = config.terrain.seaLevel;

  addToScene(seaMesh);

  const startTime = (new Date().getTime()) / 1000.0;

  this.render = function() {
    const endTime = (new Date().getTime()) / 1000.0;
    const time = endTime - startTime;
    // seaMesh.position = camera.position.clone();
    // seaMesh.position.x = camera.position.x - 3;
    material.uniforms.iGlobalTime.value = time;
    // material.uniforms.ang.value = new THREE.Vector3(-0.38, 1.02, 0.33);
    material.uniforms.ang.value = new THREE.Vector3(0, Math.PI / 2, 0);
    material.uniforms.light.value = game.scene.light.position;
    // material.uniforms.ang.value = camera.rotation;
    const angv = game.scene.camera.position.clone();
    // angv.normalize();
    angv.applyQuaternion(game.scene.camera.quaternion);
    material.uniforms.angv.value = angv;
    const ori = new THREE.Vector3(4, 5.5, 5.0).multiplyScalar(10.0);
    // ori.x = camera.position.x;
    // ori.y = camera.position.z;
    // ori.z = camera.position.y;
    material.uniforms.ori.value = ori;
    // material.uniforms.dir.value = dir;
  };
}

function resetCamera() {
  // camera.position.set(107, 114, 82);
  // camera.position.set(320, 340, 245);
  game.scene.camera.position.set(330, 300, 0);
  //game.scene.camera.position.set(0, 4500, 0);
  const x = game.scene.scene3.position.x;
  const z = game.scene.scene3.position.z;
  const y = getGroundHeight(x, z);
  const pos = new THREE.Vector3(x, y, z);
  game.scene.camera.lookAt(pos);
  //game.scene.camera.position.set(308, 502, -71);
  //game.scene.camera.rotation.set(-1.71, 0.8, 1.76);
}

function initCameraControls() {
  // Construct semi-infinite plane, since MapControls doesn't work well with height map mesh
  const plane = new THREE.PlaneGeometry(10000, 10000, 1, 1);
  game.scene.navigationPlane = new THREE.Mesh(plane, new THREE.MeshLambertMaterial());
  game.scene.navigationPlane.rotation.x = Math.PI / -2;
  game.scene.navigationPlane.material.visible = false;
  addToScene(game.scene.navigationPlane);

  game.scene.cameraControls = new MapControls(
      game.scene.camera,
      game.scene.navigationPlane,
      () => null,
      game.scene.renderer.domElement,
      resetCamera
      );
  game.scene.cameraControls.minDistance = 10;
  game.scene.cameraControls.maxDistance = 1000;
  game.scene.cameraControls.enabled = config.camera.mouseControl;
}

function getGroundHeight(x, y) {
  const xd = (x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width;
  const yd = (y + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height;
  const xi = Math.floor(xd);
  const yi = Math.floor(yd);

  // https:// en.wikipedia.org/wiki/Bilinear_interpolation
  const x1 = x - (xd % 1) * config.terrain.width / config.terrain.xFaces;
  const x2 = x1 + 1 * config.terrain.width / config.terrain.xFaces;
  const y1 = y - (yd % 1) * config.terrain.height / config.terrain.yFaces;
  const y2 = y1 + 1 * config.terrain.height / config.terrain.yFaces;
  if (xi < 0 ||
      yi < 0 ||
      xi >= game.heightField.length ||
      xi + 1 >= game.heightField.length ||
      yi >= game.heightField[xi].length ||
      yi + 1 >= game.heightField[xi].length) {
    return 0;
  }
  const fQ11 = game.heightField[xi][yi];
  const fQ21 = game.heightField[xi + 1][yi];
  const fQ12 = game.heightField[xi][yi + 1];
  const fQ22 = game.heightField[xi + 1][yi + 1];

  const fxy1 = ((x2 - x) / (x2 - x1)) * fQ11 + ((x - x1) / (x2 - x1)) * fQ21;
  const fxy2 = ((x2 - x) / (x2 - x1)) * fQ12 + ((x - x1) / (x2 - x1)) * fQ22;
  const fyy = ((y2 - y) / (y2 - y1)) * fxy1 + ((y - y1) / (y2 - y1)) * fxy2;

  /*
  redSphere.position.x = x;
  redSphere.position.y = fyy;
  redSphere.position.z = y;

  blueSpheres[0].position.x = x1;
  blueSpheres[0].position.y = fQ11;
  blueSpheres[0].position.z = y1;

  blueSpheres[1].position.x = x2;
  blueSpheres[1].position.y = fQ21;
  blueSpheres[1].position.z = y1;

  blueSpheres[2].position.x = x1;
  blueSpheres[2].position.y = fQ12;
  blueSpheres[2].position.z = y2;

  blueSpheres[3].position.x = x2;
  blueSpheres[3].position.y = fQ22;
  blueSpheres[3].position.z = y2;
  */

  return fyy;
}

function getGroundAlignment(unit) {
  const groundHeight = getGroundHeight(unit.position.x, unit.position.z);
  let y = groundHeight - unit.bbox.min.y * unit.scale.y;
  if (unit.type === UnitType.Air) {
    y += config.units.airAltitude;
  }
  return y;
}

function moveAlignedToGround(object) {
  const nowTime = getGameTime();
  if (object.lastMoved === undefined) {
    object.lastMoved = nowTime;
    return;
  }
  const oldTime = object.lastMoved;
  let timeDelta = nowTime - oldTime;
  // prevent big jumps in time. happens when user switches window and comes back.
  if (timeDelta > 1) {
    timeDelta = 1;
  }
  object.lastMoved = nowTime;
  const eps = 1e-7;
  if (timeDelta < eps) {
    // prevent zero time from making direction vector zero.
    // in that case units turn to original rotation.
    return;
  }
  const speed = config.units.speed * object.moveSpeed * timeDelta;
  const zAxis = new THREE.Vector3(0, 0, speed);
  zAxis.applyQuaternion(object.quaternion);
  zAxis.y = 0;
  const xzDirection = zAxis;
  const oldGroundHeight = getGroundAlignment(object);
  if (object.position.x + xzDirection.x <= game.mapBounds.min.x) {
    xzDirection.x = -xzDirection.x;
  }
  if (object.position.x + xzDirection.x >= game.mapBounds.max.x) {
    xzDirection.x = -xzDirection.x;
  }
  if (object.position.z + xzDirection.z <= game.mapBounds.min.z) {
    xzDirection.z = -xzDirection.z;
  }
  if (object.position.z + xzDirection.z >= game.mapBounds.max.z) {
    xzDirection.z = -xzDirection.z;
  }
  // add velocity to position
  object.position.x += xzDirection.x;
  object.position.z += xzDirection.z;

  // align to ground
  object.position.y = getGroundAlignment(object);
  const groundHeight = object.position.y;

  // rotate in velocity direction
  const dir = xzDirection.clone();
  dir.y = groundHeight - oldGroundHeight;
  dir.add(object.position);
  object.lookAt(dir);

  // rotate left/right. doesnt' work, so disabled
  /*
  const yAxis = new THREE.Vector3(0, 0.1, 0);
  yAxis.applyQuaternion(object.quaternion);
  yAxis.y = 0;
  const leftGroundHeight = getGroundHeight(object.position.x + yAxis.x, object.position.z + yAxis.z);
  const yAxis2 = new THREE.Vector3(0, -0.1, 0);
  yAxis2.applyQuaternion(object.quaternion);
  yAxis2.y = 0;
  const rightGroundHeight = getGroundHeight(object.position.x + yAxis2.x, object.position.z + yAxis2.z);
  */
}

function Missiles() {

  const material = game.models.missile.material;
  const geometry = game.models.missile.geometry;

  const igeo = new THREE.InstancedBufferGeometry();

  igeo.addAttribute('position', geometry.getAttribute('position'));
  igeo.addAttribute('uv', geometry.getAttribute('uv'));

  const maxInstances = config.effects.missilePool;
  Util.createAttributeMatrix(igeo, maxInstances);

  const vertexShader = $('#generic-vertex').text();
  const fragmentShader = $('#generic-fragment').text();

  const newMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      map: { type: 't', value: material.map },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  const imesh = new THREE.Mesh(igeo, newMaterial);
  addToScene(imesh);

  this.pool = [];
  this.active = {};

  this.updateMissiles = function() {
    const focus = getCameraFocus(0, 0);
    imesh.position.copy(focus);
    for (const missileId in this.active) {
      if (this.active.hasOwnProperty(missileId)) {
        const missile = this.active[missileId];
        const matrix = new THREE.Matrix4();
        matrix.multiply(game.scene.camera.matrixWorldInverse);
        missile.updateMatrixWorld();
        matrix.multiply(missile.matrixWorld);
        Util.updateAttributeMatrix(igeo, matrix, missile.missileId);
      }
    }
  }
  
  this.createMissile = function() {
    let mesh;
    if (this.pool.length > 0) {
      mesh = this.pool.pop();
      this.active[mesh.missileId] = mesh;
    } else {
      // TODO: scale missile pool
      throw new Error('missile pool too small');
    }
    return mesh;
  }

  this.returnMissile = function(mesh) {
    delete this.active[mesh.missileId];
    mesh.position.set(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    mesh.updateMatrix();
    Util.updateAttributeMatrix(igeo, mesh.matrix, mesh.missileId);
    this.pool.push(mesh);
  }

  var newpool = [];
  for (let i = 0; i < maxInstances; i++) {
    const mesh = new THREE.Object3D();
    mesh.renderOrder = game.renderOrders.missile;
    mesh.missileId = i;
    newpool.push(mesh);
  }
  this.pool = newpool;
}

function setUnitProperties(unit, modelOptions) {
  // game properties
  unit.health = 1.0
  unit.type = modelOptions.type;
  unit.moveSpeed = modelOptions.moveSpeed;
  unit.weapon = {
    range: 100.0,
    damage: 0.1,
    reload: 0.5,
  };
  unit.shots = []
  unit.team = Math.floor(Math.random() * TeamColors.length);
  unit.attackTarget = null;
  unit.dead = false;
}

function initialPlaceUnit(unit, size) {
  if (config.units.randomLocation) {
    unit.position.x = (Math.random() * config.terrain.width - config.terrain.width / 2) / 2;
    unit.position.z = (Math.random() * config.terrain.height - config.terrain.height / 2) / 2;
  }
  const height = size.height * unit.scale.y;
  //const groundHeight = getGroundHeight(unit.position.x, unit.position.z);
  const groundHeight = getGroundAlignment(unit);
  unit.position.y = groundHeight; // + height;
  unit.rotation.y = Math.random() * 2 * Math.PI - Math.PI;
  unit.stayUpRight = true;
  unit.lastMoved = undefined;
}

function UnitPool() {
  this.instanceIds = [];

  for (let i = 0; i < config.units.maxUnits; i++) {
    this.instanceIds.push(i);
  }

  this.createUnit = function(unit) {
    if (this.instanceIds.length === 0) {
      throw new Error('max units reached');
    }
    unit.unitId = this.instanceIds.pop();
  }

  this.returnUnit = function(unit) {
    this.instanceIds.push(unit.unitId);
  }
}

function createM3Unit(modelOptions, instance) {
  const unit = instance;
  game.unitPool.createUnit(unit);
  const size = getSize(modelOptions.bboxHelper.box);
  setUnitProperties(unit, modelOptions);
  unit.bbox = modelOptions.bboxHelper.box;

  // set team color
  instance.instance.setTeamColor(unit.team);
  for (const geomat of instance.geomats) {
    const [geo, mat] = geomat;
    const a_teamColor = geo.getAttribute('a_teamColor');
    const c = TeamColors[unit.team].clone().multiplyScalar(255);
    a_teamColor.setXYZ(unit.instanceId, c.r, c.g, c.b);
    a_teamColor.needsUpdate = true;
  }
  
  const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.height, size.width, size.depth),
      new THREE.MeshLambertMaterial( { color: 0xFFFFFF, transparent: true, opacity: 0.5 }));
  const mat2 = (new THREE.Matrix4()).makeRotationX(modelOptions.rotation.x);
  boxMesh.geometry.applyMatrix(mat2);
  const mat3 = (new THREE.Matrix4()).makeRotationZ(modelOptions.rotation.z);
  boxMesh.geometry.applyMatrix(mat3);
  const mat = (new THREE.Matrix4()).makeTranslation(
      (unit.bbox.min.x + unit.bbox.max.x) / 2,
      (unit.bbox.min.y + unit.bbox.max.y) / 2,
      (unit.bbox.min.z + unit.bbox.max.z) / 2);
  boxMesh.geometry.applyMatrix(mat);
  // const boxMesh2 = modelOptions.bboxHelper.clone();
  // addToScene(boxMesh);
  // TODO: fix boxMesh alignment to unit
  unit.bboxMesh = boxMesh;

  initialPlaceUnit(unit, size);
  unit.healthBar = game.healthBars.createHealthBar();
  unit.teamBar = game.teamBars.createTeamBar(unit);
  
  unit.castShadow = true;
  unit.receiveShadow = true;

  unit.renderOrder = modelOptions.id;
  for (const child of unit.children) {
    child.renderOrder = modelOptions.id;
  }

  addToScene(unit);

  unit.createNew = () => {
    const instancePromise = game.m3loader.addInstance(modelOptions);
    return new Promise((resolve, reject) => {
        instancePromise.then((obj3d) => {
        const unit = createM3Unit(modelOptions, obj3d);
        resolve(unit);
      });
    });
  };

  unit.removeUnit = () => {
    for (const geomat of unit.geomats) {
      const [geo, mat] = geomat;
      mat.dispose();
    }
    game.unitPool.returnUnit(unit);
    removeUnit(unit);
  };

  return instance;
}

function createM3Units() {
  const m3loader = game.m3loader;

  const models = m3loader.getModels();
  const instancePromises = [];
  for (const model of models) {
    for (let i = 0; i < config.units.m3count; i++) {
      const instancePromise = m3loader.addInstance(model);
      instancePromise.then((obj3d) => {
        const unit = createM3Unit(model, obj3d);
        game.units.push(unit);
      });
      instancePromises.push(instancePromise);
    }
  }

  return Promise.all(instancePromises);
}

function HealthBars() {
  function HealthBar() {
  }

  const healthMaterial = new THREE.RawShaderMaterial({
    uniforms: {
    },
    transparent: true,
    vertexShader: $('#health-vertex').text(),
    fragmentShader: $('#health-fragment').text(),
    depthTest: false,
    depthWrite: false,
  });
  const geo = new THREE.BufferGeometry();
  const maxInstances = config.units.maxUnits;
  const positionArray = new Float32Array(maxInstances * 3);
  geo.addAttribute('position', new THREE.BufferAttribute(positionArray, 3));
  positionArray.fill(outOfSight);

  const healthAttribute = new THREE.BufferAttribute(new Float32Array(maxInstances), 1);
  geo.addAttribute('a_health', healthAttribute);

  const mesh = new THREE.Points(geo, healthMaterial);
  mesh.renderOrder = game.renderOrders.healthBar;
  addToScene(mesh);

  // TODO: remove health bar of dead units.
  // doesn't see the problem now, because new units are created.
  this.updateHealthBars = function(units) {
    const focus = getCameraFocus(0, 0);
    // necessary for bars to be visible
    // console.log("focus", focus.x, focus.y, focus.z);
    mesh.position.copy(focus);
    for (const unit of units) {
      const position = unit.position.clone().sub(focus);
      position.y += getSize(unit.bbox).height * unit.scale.y;
      geo.attributes.position.setXYZ(unit.unitId, position.x, position.y, position.z);
      geo.attributes.position.needsUpdate = true;
      geo.verticesNeedUpdate = true;

      healthAttribute.setX(unit.unitId, unit.health);
      healthAttribute.needsUpdate = true;
      
      geo.needsUpdate = true;
    }
  }
  
  this.createHealthBar = function(unit) {
    const healthBar = new HealthBar();
    return healthBar;
  }
}

function TeamBars() {
  function TeamBar() {
  }

  const teamMaterial = new THREE.RawShaderMaterial({
    uniforms: {
    },
    transparent: true,
    vertexShader: $('#teambar-vertex').text(),
    fragmentShader: $('#teambar-fragment').text(),
    depthTest: false,
    depthWrite: false,
  });
  const geo = new THREE.BufferGeometry();
  const maxInstances = config.units.maxUnits;
  const positionArray = new Float32Array(maxInstances * 3);
  geo.addAttribute('position', new THREE.BufferAttribute(positionArray, 3));
  positionArray.fill(outOfSight);

  const colorAttribute = new THREE.BufferAttribute(new Float32Array(maxInstances * 3), 3);
  geo.addAttribute('a_color', colorAttribute);

  const mesh = new THREE.Points(geo, teamMaterial);
  mesh.renderOrder = game.renderOrders.teamBar;
  addToScene(mesh);

  this.updateTeamBars = function(units) {
    const focus = getCameraFocus(0, 0);
    // necessary for bars to be visible
    mesh.position.copy(focus);
    for (const unit of units) {
      const position = unit.position.clone().sub(focus);
      position.y += getSize(unit.bbox).height * unit.scale.y + 4;
      geo.attributes.position.setXYZ(unit.unitId, position.x, position.y, position.z);
      geo.attributes.position.needsUpdate = true;
      geo.verticesNeedUpdate = true;

      const color = TeamColors[unit.team];
      colorAttribute.setXYZ(unit.unitId, color.r, color.g, color.b);
      colorAttribute.needsUpdate = true;
      
      geo.needsUpdate = true;
    }
  }

  this.createTeamBar = function(unit) {
    const teamBar = new TeamBar();
    return teamBar;
  }
}

function createUnit(options) {
  const material = options.material;
  const geometry = options.geometry;
  const boxGeometry = options.boxGeometry;
  const boxMaterial = options.boxMaterial;
  const bboxHelper = options.bboxHelper;
  const size = options.size;

  const materialClone = material.clone();
  const unit = new THREE.Mesh(geometry, materialClone);
  game.unitPool.createUnit(unit);
  unit.model = options;

  setUnitProperties(unit, options);

  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial.clone());
  addToScene(boxMesh);

  unit.bboxMesh = boxMesh;
  unit.bbox = bboxHelper.box;

  initialPlaceUnit(unit, size);
  unit.healthBar = game.healthBars.createHealthBar();
  unit.teamBar = game.teamBars.createTeamBar(unit);

  unit.castShadow = true;
  unit.receiveShadow = true;

  unit.renderOrder = options.id;

  addToScene(unit);

  unit.createNew = () => {
    return new Promise((resolve, reject) => {
      const unit = createUnit(options);
      resolve(unit);
    });
  };

  unit.removeUnit = () => { 
    game.unitPool.returnUnit(unit);
    removeUnit(unit);
  };
  return unit;
}

function removeUnit(unit) {
  /*unit.healthBar.geometry.dispose();
  unit.teamBar.geometry.dispose();
  unit.healthBar.material.dispose();
  unit.teamBar.material.dispose();*/
  unit.bboxMesh.geometry.dispose();
  unit.bboxMesh.material.dispose();
  removeFromScene(unit.bboxMesh);
  //removeFromScene(unit.healthBar);
  removeFromScene(unit.teamBar);
  removeFromScene(unit);
}

function loadModels(finishCallback) {
  function getLoadTextureSuccess(options, material, units) {
    return function(texture) {
      options.downloadedTexture = 1.0;
      texture.anisotropy = game.scene.renderer.getMaxAnisotropy();
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(options.textureRepeat.x, options.textureRepeat.y);
      material.map = texture;
      for (const unit of units) {
        unit.material = material.clone();
        //unit.material.emissive.set(TeamColors[unit.team]);
      }
    }
  }

  function getOnSuccess(options) {
    const scale = options.scale;
    const rotation = options.rotation;
    const texturePath = options.texturePath;
    const textureRepeat = options.textureRepeat;
    const opacity = options.opacity;
    return function(geometry) {
      //options.downloadedModel = 1.0;
      const mat = new THREE.Matrix4();
      mat.makeRotationX(rotation.x);
      geometry.applyMatrix(mat);
      mat.makeRotationY(rotation.y);
      geometry.applyMatrix(mat);
      mat.makeRotationZ(rotation.z);
      geometry.applyMatrix(mat);
      mat.makeScale(scale, scale, scale);
      geometry.applyMatrix(mat);

      geometry.computeBoundingSphere();
      geometry.computeBoundingBox();
      // needed for proper lighting
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();


      const material = new THREE.MeshLambertMaterial({ color: 0xF5F5F5, transparent: false, opacity: opacity });

      // for showing bounding box
      const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF, opacity: 0.0, transparent: true });
      const proto = new THREE.Mesh(geometry, material.clone());
      addToScene(proto);
      const bboxHelper = new THREE.BoundingBoxHelper(proto, 0);
      bboxHelper.update();
      removeFromScene(proto);
      const size = getSize(bboxHelper.box);
      const boxGeometry = new THREE.BoxGeometry(size.height, size.width, size.depth);
      for (const vertex of boxGeometry.vertices) {
        vertex.add(bboxHelper.box.min).add(bboxHelper.box.max).divideScalar(2);
      }

      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { type: 'f', value: 0.0 },
        },
        vertexShader: $('#loader-vertex').text(),
        fragmentShader: $('#loader-fragment').text(),
        transparent: true,
      });

      options.material = material;
      options.geometry = geometry;
      options.boxGeometry = boxGeometry;
      options.boxMaterial = boxMaterial;
      options.bboxHelper = bboxHelper;
      options.size = size;

      game.models[options.name] = options;

      const units = [];
      if (options.type === UnitType.Air ||
          options.type === UnitType.Ground) {
        for (let i = 0; i < config.units.count; i++) {
          const unit = createUnit(options);
          units.push(unit);
          game.units.push(unit);
        }
      }

      textureLoader.load(
        texturePath,
        getLoadTextureSuccess(options, material, units),
        getLoadTextureProgress(options));
    };
  }

  const options = {
    scale: 1,
    rotation: new THREE.Vector3(),
    texturePath: 'models/images/camouflage.jpg',
    textureRepeat: new THREE.Vector2(1, 1),
    opacity: 1,
    type: UnitType.Ground,
    downloadedModel: 0,
    downloadedTexture: 0,
    moveSpeed: 1.0,
  };

  function setProgress(value) {
    const val = Math.round(value * 100);
    $progress.attr("aria-valuenow", val);
    $progress.css({
      width: val + "%",
    });
    $progressText.html(val + "% JSON Units");
  }

  function setModelProgress() {
    let downloadedSize = 0;
    let totalSize = 0;
    for (const model of optionList) {
      downloadedSize += model.downloadedModel * model.modelSize;
      downloadedSize += model.downloadedTexture * model.textureSize;
      totalSize += model.modelSize;
      totalSize += model.textureSize;
    }
    const progress = downloadedSize / totalSize; 
    setProgress(progress);
    if (progress < 1) {
      requestAnimationFrame(setModelProgress);
    } else {
      finishCallback();
    }
  }

  function getOnProgress(modelOptions) {
    return function(xhr) {
      modelOptions.downloadedModel = xhr.loaded / xhr.total;
    }
  }
  
  function getLoadTextureProgress(modelOptions) {
    return function(xhr) {
      modelOptions.downloadedTexture = xhr.loaded / xhr.total;
    }; 
  }

  const $modelSizes = $("#modelSizes");
  const modelSizes = JSON.parse($modelSizes.html());

  const $progress = $("#units .progress-bar");
  const $progressText = $progress; //.find("span");

  const optionList = [];

  const loader = new THREE.BufferGeometryLoader();
  const textureLoader = new THREE.TextureLoader();

  let i = 1;
  for (const model of Models) {
    const modelOptions = $.extend({}, options, model);
    modelOptions.id = i;
    i++;
    modelOptions.modelSize = modelSizes.models[modelOptions.path];
    modelOptions.textureSize = modelSizes.images[modelOptions.texturePath];
    optionList.push(modelOptions);
    loader.load(
      model.path,
      getOnSuccess(modelOptions),
      getOnProgress(modelOptions));
  }
  requestAnimationFrame(setModelProgress);
}

function placeUnit(unit, pos) {
  const newPos = pos.clone();
  newPos.y = getGroundAlignment(unit);
  unit.position.copy(newPos);
}

function getBBoxes() {
  // prepare world-{aligned, positioned, rotated} bounding boxes
  const boxes = [];
  for (const unit of game.units) {
    const pos = unit.position;
    const bbox = unit.bbox.clone();
    // rotate bounding box with object
    const mat = new THREE.Matrix4().makeRotationFromQuaternion(unit.quaternion);
    bbox.applyMatrix4(mat);
    const box = [
      pos.x + bbox.min.x * unit.scale.x,
      pos.y + bbox.min.y * unit.scale.y,
      pos.z + bbox.min.z * unit.scale.z,
      pos.x + bbox.max.x * unit.scale.x,
      pos.y + bbox.max.y * unit.scale.y,
      pos.z + bbox.max.z * unit.scale.z,
    ];
    box.unit = unit;
    boxes.push(box);
  }
  return boxes;
}

function mark(unit) {
  const size = getSize(unit.bbox);
  const radius = Math.max(size.height, Math.max(size.width, size.depth)) / 2;
  const geometry = new THREE.CircleGeometry(radius, 32);
  geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));
  const material = new THREE.MeshLambertMaterial({
    color: 0x00FF00,
    opacity: 0.5
  });
  const mesh = new THREE.Mesh(geometry, material);
  unit.add(mesh);
  unit.selectedMesh = mesh;
}

function unmark(unit) {
  if (unit.selectedMesh) {
    unit.selectedMesh.geometry.dispose();
    unit.selectedMesh.material.dispose();
    unit.remove(unit.selectedMesh);
    unit.selectedMesh = undefined;
  };
}

function initSelection() {
  //const mouseElement = game.scene.renderer.domElement;
  const mouseElement = game.scene.$overlay[0];
  game.selector = new Selection({
    mark,
    unmark,
    placeUnit,
    boxIntersect,
    getBBoxes,
    mouseElement,
    worldToScreen,
    game,
    raycaster: game.scene.raycaster,
    camera: game.scene.camera,
    ground: game.scene.ground,
    scene: game.scene.scene3,
    config,
    planeMesh: game.scene.navigationPlane,
    getGroundHeight: getGroundHeight,
  });
}

function initDAT() {
  const gui = new dat.GUI();
  const controllers = {};

  // automagic dat GUI init from config
  for (const varName in config) {
    if (config.hasOwnProperty(varName)) {
      const inner = config[varName];
      if (isObject(inner)) {
        const folder = gui.addFolder(varName);
        for (const varName2 in inner) {
          if (inner.hasOwnProperty(varName2)) {
            const controller = folder.add(inner, varName2);
            controller.listen();
            controllers[varName + '.' + varName2] = controller;
          }
        }
        folder.open();
      } else {
        const controller = gui.add(config, varName);
        controller.listen();
        controllers[varName] = controller;
      }
    }
  }
  controllers['camera.rotationX'].step(0.01);
  controllers['camera.rotationY'].step(0.01);
  controllers['camera.rotationZ'].step(0.01);
  controllers['debug.mouseX'].step(0.01);
  controllers['debug.mouseY'].step(0.01);
  controllers['camera.mouseControl'].onChange(() => {
    game.scene.cameraControls.enabled = config.camera.mouseControl;
  });

  gui.close();
}

function onResize() {
  game.scene.width = window.innerWidth;
  game.scene.height = window.innerHeight - config.dom.controlsHeight;
  $('#viewport').height(game.scene.height);
  $(game.scene.renderer.domElement).height(game.scene.height);
  game.scene.camera.aspect = game.scene.width / game.scene.height;
  game.scene.camera.updateProjectionMatrix();
  game.scene.renderer.setSize(game.scene.width, game.scene.height);

  game.scene.$overlay[0].width = game.scene.width;
  game.scene.$overlay[0].height = game.scene.height;
}

function isModalOpen() {
  return $(".modal.in").length > 0;
}

function elevateGround(amount) {
  const focus = getCameraFocus(0, 0);
  const x = focus.x;
  const z = focus.z;
  
  const xi = Math.round((x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width);
  const yi = Math.round((z + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height);
  const i = game.heightFieldIndex[xi][yi];
  const y = game.heightField[xi][yi] + amount;
  game.scene.ground.geometry.attributes.position.array[i + 1] = y;
  game.heightField[xi][yi] = y;

  game.scene.ground.geometry.computeFaceNormals();
  game.scene.ground.geometry.computeVertexNormals();
  game.scene.ground.geometry.attributes.position.needsUpdate = true;
}

function shortcutHandler(evt) {
  switch (evt.keyCode) {
    case window.KeyEvent.DOM_VK_P:
      if (game.paused.state) {
        const endTime = getTime();
        const elapsed = endTime - game.paused.startTime;
        game.paused.totalTime += elapsed;
        game.paused.state = false;
      } else {
        game.paused.startTime = getTime();
        game.paused.state = true;
      }
      break;
    case window.KeyEvent.DOM_VK_F9:
      evt.preventDefault();
      if (isModalOpen()) {
        const $modal = $(".modal.in");
        $modal.modal('hide');
        if (!$modal.is($('#menu #Help'))) {
          $('#menuHelp').trigger('click');
        }
      } else {
        $('#menuHelp').trigger('click');
      }
      break;
    case window.KeyEvent.DOM_VK_F10:
      evt.preventDefault();
      if (isModalOpen()) {
        const $modal = $(".modal.in");
        $modal.modal('hide');
        if (!$modal.is($('#menu #Menu'))) {
          $('#menuMenu').trigger('click');
        }
      } else {
        $('#menuMenu').trigger('click');
      }
      break;
    case window.KeyEvent.DOM_VK_ESCAPE:
      if (isModalOpen()) {
        evt.preventDefault();
        $(".modal.in").modal('hide');
      }
      break;
    case window.KeyEvent.DOM_VK_SPACE:
      if (evt.shiftKey) {
        elevateGround(-5);
      } else {
        elevateGround(5);
      }
      break;
  }
}

function initShortcuts() {
  const body = document.body;
  body.addEventListener('keydown', shortcutHandler);
}

function initMenu() {
  $('#menuHelp').click((evt) => {
    if (isModalOpen()) return;
    const $modal = $('#menu #Help');
    $modal.modal();
  });
  $('#menuMenu').click((evt) => {
    if (isModalOpen()) return;
    const $modal = $('#menu #Menu');
    $modal.modal();
  });
}

function initUI() {
  initShortcuts();
  initDAT();
  initMenu();
  $(window).resize(onResize);
}

function updateUnitInfo() {
  if (game.selector.selected.length > 0) {
    const unit = game.selector.selected[0];
    const x = formatFloat(unit.position.x);
    const y = formatFloat(unit.position.y);
    const z = formatFloat(unit.position.z);
    const min = unit.bbox.min;
    const minx = formatFloat(min.x);
    const miny = formatFloat(min.y);
    const minz = formatFloat(min.z);
    const max = unit.bbox.max;
    const maxx = formatFloat(max.x);
    const maxy = formatFloat(max.y);
    const maxz = formatFloat(max.z);
    const health = formatFloat(unit.health);
    let s = '<table>';
    s += '<tr><th></th><th>Position|</th><th>BBox-</th><th>BBox+</th></tr>';

    s += '<tr><th>X</th>';
    s += `<td>${x}</td><td>${minx}</td><td>${maxx}</td>`;
    s += '</tr>';

    s += '<tr><th>Y</th>';
    s += `<td>${y}</td><td>${miny}</td><td>${maxy}</td>`;
    s += '</tr>';

    s += '<tr><th>Z</th>';
    s += `<td>${z}</td><td>${minz}</td><td>${maxz}</td>`;
    s += '</tr>';
    s += '</table>';

    s += '<div>';
    s += '<span>Health </span>';
    s += `<span>${health}</span>`;
    s += '</div>';
    game.dom.$unitinfo.html(s);
  }
}

function updateCameraInfo() {
  const x = game.scene.camera.position.x;
  const y = game.scene.camera.position.y;
  const z = game.scene.camera.position.z;
  const xr = game.scene.camera.rotation.x;
  const yr = game.scene.camera.rotation.y;
  const zr = game.scene.camera.rotation.z;
  config.camera.X = x;
  config.camera.Y = y;
  config.camera.Z = z;
  config.camera.rotationX = xr;
  config.camera.rotationY = yr;
  config.camera.rotationZ = zr;
}

function updateBBoxes() {
  for (const unit of game.units) {
    unit.bboxMesh.position.copy(unit.position);
    //unit.bboxMesh.scale.copy(unit.scale);
    //unit.bboxMesh.rotation.copy(unit.rotation);
  }
}

function updateBars() {
  game.healthBars.updateHealthBars(game.units);
  game.teamBars.updateTeamBars(game.units);
}

function funTerrain() {
  const time = (new Date().getTime()) / 1000.0 - game.startTime;
  for (let i = 0; i < game.scene.ground.geometry.attributes.position.length; i += 3) {
    const x = game.scene.ground.geometry.attributes.position.array[i];
    const z = game.scene.ground.geometry.attributes.position.array[i + 2];
    const noise = game.noiseGen.noise3d(x / 100, z / 100, time);
    const normalNoise = (noise + 1) / 2;
    const y = normalNoise * config.terrain.maxElevation;
    game.scene.ground.geometry.attributes.position.array[i + 1] = y;

    const xi = (x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width;
    const yi = (z + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height;
    game.heightField[xi][yi] = y;
  }
  game.scene.ground.geometry.computeFaceNormals();
  game.scene.ground.geometry.computeVertexNormals();
  game.scene.ground.geometry.attributes.position.needsUpdate = true;
}

function getCameraFocus(mouseX, mouseY) {
  // TODO: move/use this function in MapControls

  // http://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
  const camera = game.scene.camera;
  const vector = new THREE.Vector3();
  vector.set(mouseX, mouseY, camera.near);
  vector.unproject(camera);

  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.y / dir.y;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));

  return pos;
}

function MiniMap() {
  const minimapHeight = config.dom.controlsHeight - 2;
  const minimapWidth = minimapHeight;
  const $minimap = $('.minimap');
  const minimapRenderer = new THREE.WebGLRenderer({ antialias: true });
  minimapRenderer.setSize(minimapWidth, minimapHeight);
  minimapRenderer.setPixelRatio(minimapWidth / minimapHeight);
  minimapRenderer.autoClear = true;
  $minimap.append(minimapRenderer.domElement);
  const $renderElement = $(minimapRenderer.domElement);
  $renderElement.css({
    border: '1px solid white',
  });
  const minimapScene = new THREE.Scene();
  const minimapCamera = new THREE.PerspectiveCamera(35, minimapWidth, minimapHeight, 0, 1000);
  minimapCamera.position.set(0, 3.5, 0);
  minimapCamera.lookAt(minimapScene.position);
  minimapCamera.aspect = minimapWidth / minimapHeight;
  minimapCamera.updateProjectionMatrix();
  minimapScene.add(minimapCamera);
  const minimapMaterial = new THREE.PointsMaterial({ size: 0.1 });
  const light = new THREE.AmbientLight(0xFFFFFF);
  minimapScene.add(light);

  let oldCloud;
  let mouseDown = false;
  let oldCameraRectMesh;

  const cameraRectMaterial = new THREE.MeshLambertMaterial({
      wireframe: false,
      color: 0x00FF00,
      transparent: true,
      opacity: 0.5,
    });

  // translate coords to minimap
  function translate(pos) {
    const v = new THREE.Vector3(pos.x * 2 / config.terrain.width, 0, pos.z * 2 / config.terrain.height);
    return v;
  }

  let first = true;

  let renderCount = 0;

  this.render = function() {
    if (oldCloud !== undefined) {
      minimapScene.remove(oldCloud);
      oldCloud.geometry.dispose();
    }
    const geom = new THREE.Geometry();
    let i = 0;
    for (const unit of game.units) {
      if (unit.minimap === undefined) {
        unit.minimap = {};
      }
      const v = translate(unit.position);
      geom.vertices[i] = v;
      i++;
    }
    const pointCloud = new THREE.Points(geom, minimapMaterial);
    minimapScene.add(pointCloud);
    oldCloud = pointCloud;

    const cameraRectGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    
    // XXX: fails on first render for some reason
    if (!first) {
      cameraRectGeometry.vertices[0] = translate(getCameraFocus(-1, -1));
      cameraRectGeometry.vertices[1] = translate(getCameraFocus(-1, 1));
      cameraRectGeometry.vertices[2] = translate(getCameraFocus(1, -1));
      cameraRectGeometry.vertices[3] = translate(getCameraFocus(1, 1));
      cameraRectGeometry.verticesNeedUpdate = true;
    }
    const cameraRectMesh = new THREE.Mesh(cameraRectGeometry, cameraRectMaterial);
    if (oldCameraRectMesh) {
      oldCameraRectMesh.geometry.dispose();
      minimapScene.remove(oldCameraRectMesh);
    }
    minimapScene.add(cameraRectMesh);
    oldCameraRectMesh = cameraRectMesh;

    minimapRenderer.render(minimapScene, minimapCamera);
    first = false;
    renderCount++;
  };

  function setPos(evt) {
    const x = evt.offsetX / $renderElement.width() * 2 - 1;
    const y = -evt.offsetY / $renderElement.height() * 2 + 1;

    // swapping x and z because of camera rotation
    const mapZ = -x * config.terrain.width / 2;
    const mapX = -y * config.terrain.height / 2;

    const camera = game.scene.camera;

    const focus = getCameraFocus(0, 0);
    const offset = camera.position.clone().sub(focus);

    camera.position.x = mapX + offset.x;
    camera.position.z = mapZ + offset.z;
  }

  function onMouseClick(evt) {
    setPos(evt);
  }

  function onMouseDown(evt) {
    if (evt.button === Mouse.LBUTTON) {
      mouseDown = true;
    }
  }

  function onMouseUp(evt) {
    mouseDown = false;
  }
  
  function onMouseMove(evt) {
    if (mouseDown) {
      setPos(evt);
    }
  }

  $renderElement.click(onMouseClick);
  $renderElement.mousemove(onMouseMove);
  $renderElement.mousedown(onMouseDown);
  $renderElement.mouseup(onMouseUp);
  $renderElement.mouseenter((evt) => { game.scene.cameraControls.edgeScrollEnabled = false; });
  $renderElement.mouseleave((evt) => { game.scene.cameraControls.edgeScrollEnabled = true; });

}

function updateDebug() {
  if (game.debugSphere) {
    game.debugSphere.position.copy(getCameraFocus(0, 0));
  }
}

let oldChangeProgramCount = 0;
let oldChangeMaterialCount = 0;
function render() {
  /*
  // 1st person perspective of a unit
  const unit = units[0];
  if (unit !== undefined) {
    camera.position.copy(unit.position);
    camera.rotation.copy(unit.rotation);
  }
  */

  // funTerrain();

  // drawOutLine is slow. I ended up doing health bars in 3D instead and looks pretty good.
  // Debug.drawOutLine(game.units, worldToScreen, game.scene.$overlay[0], game.scene.camera);
  
  if (game.m3loader && config.units.animated) {
    game.m3loader.update();
  }
  TWEEN.update();
  updateDebug();
  updateUnitInfo();
  updateCameraInfo();
  updateBBoxes();
  updateBars();
  if (game.missiles) {
    game.missiles.updateMissiles();
  }
  game.components.forEach((x) => { x.render(); });
  game.scene.renderer.render(game.scene.scene3, game.scene.camera);
  Util.clearLog();
  Util.log("change program", game.scene.renderer.changeProgramCount - oldChangeProgramCount);
  Util.log("change material", game.scene.renderer.changeMaterialCount - oldChangeMaterialCount);
  oldChangeProgramCount = game.scene.renderer.changeProgramCount;
  oldChangeMaterialCount = game.scene.renderer.changeMaterialCount;
  game.scene.renderStats.update();
  requestAnimationFrame(render);
}

function checkCollisions() {
  const boxes = getBBoxes();

  // intersect boxes
  boxIntersect(boxes, function(i, j) {
    const p1 = boxes[i].unit.position;
    const p2 = boxes[j].unit.position;
    const d = p2.clone();
    // clearLog();
    // log(i, j, p1, p2, d);
    d.sub(p1);
    d.y = 0;
    // randomize if they have same position
    if (d.equals(new THREE.Vector3(0, 0, 0))) {
      d.x = Math.random();
      d.z = Math.random();
    }
    d.normalize();
    d.multiplyScalar(config.units.collisionBounce);
    const p1new = p1.clone().sub(d);
    const p2new = p2.clone().add(d);
    if (p1new.x >= game.mapBounds.min.x &&
        p1new.x <= game.mapBounds.max.x &&
        p1new.z >= game.mapBounds.min.z &&
        p1new.z <= game.mapBounds.max.z) {
      p1.sub(d);
    }
    if (p2new.x >= game.mapBounds.min.x &&
        p2new.x <= game.mapBounds.max.x &&
        p2new.z >= game.mapBounds.min.z &&
        p2new.z <= game.mapBounds.max.z) {
      p2.add(d);
    }
  });
}

function findTargets() {
  const points = [];
  for (const unit of game.units) {
    const pos = unit.position.toArray();
    pos.unit = unit;
    points.push(pos);
  }
  const tree = kdtree(points);
  for (const unit of game.units) {
    let minHealth = Number.POSITIVE_INFINITY;
    unit.attackTarget = null;
    tree.rnn(unit.position.toArray(), unit.weapon.range, function(idx) {
      const target = points[idx].unit;
      if (target === unit || target.team === unit.team) {
        return;
      }
      // TODO: more complex target selection
      if (target.health < minHealth) {
        unit.attackTarget = target;
        minHealth = unit.health;
      }
    });
  }
}

function Explosions() {
  const texture = THREE.ImageUtils.loadTexture('models/images/explosion.png');
  texture.anisotropy = game.scene.renderer.getMaxAnisotropy();
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

  const material = new THREE.ShaderMaterial({
    uniforms: { 
      tExplosion: { 
        type: "t", 
        value: texture, 
      },
      time: { 
        type: "f", 
        value: 0.0,
      },
      opacity: { 
        type: "f", 
        value: 0.0,
      }
    },
    vertexShader: $('#explosion-vertex').text(),
    fragmentShader: $('#explosion-fragment').text(),
    transparent: true
  });
  const geometry = new THREE.IcosahedronGeometry(20, 4);
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  this.pool = [];

  this.createExplosion = function() {
    let mesh;
    if (this.pool.length > 0) {
      mesh = this.pool.pop();
    } else {
      const newMaterial = material.clone();
      newMaterial.uniforms.tExplosion.value = texture;
      mesh = new THREE.Mesh(geometry, newMaterial);
      mesh.renderOrder = game.renderOrders.explosion;
    }
    return mesh;
  }

  this.returnExplosion = function(explosion) {
    this.pool.push(explosion);
  }
  
  var newpool = [];
  for (let i = 0; i < config.effects.explosionPool; i++) {
    const mesh = this.createExplosion();
    newpool.push(mesh);
  }
  this.pool = newpool;
}

function getApplyShot(unit, target, shotMesh) {
  return function() {
    const oldHealth = target.health;
    target.health -= unit.weapon.damage;
    game.missiles.returnMissile(shotMesh);
    shotMesh = null;
    if (target.health <= 0 && oldHealth > 0) {
      target.dead = true;
      const pos = target.position.clone();
      target = null;
      let explosion = game.explosions.createExplosion();
      explosion.position.copy(pos);
      const explosionTween = {
        time: 0,
        tscale: 0,
        opacity: 2,
      };
      explosion.material.uniforms.time.value = this.time;
      addToScene(explosion);
      const seed = Math.random();
      game.sound.blast();
      const tween = new TWEEN.Tween(explosionTween)
        .to({ time: 1, tscale: 1, opacity: 0 }, 1000)
        .onUpdate(function() {
          explosion.material.uniforms.time.value = this.time + seed;
          explosion.material.uniforms.opacity.value = this.opacity;
          const scale = this.tscale;
          explosion.scale.set(scale, scale, scale);
        })
        .onComplete(function() {
          game.explosions.returnExplosion(explosion);
          explosion = null;
        }).start();
    }
  };
}

function attackTargets() {
  for (const unit of game.units) {
    if (unit.attackTarget !== null) {
      const time = getGameTime();
      const target = unit.attackTarget;
      if ((unit.lastShot === undefined ||
           unit.lastShot + unit.weapon.reload < time)) {
        const shot = {
          delta: 0,
        };
        game.sound.shot();
        const shotMesh = game.missiles.createMissile();
        const startPos = unit.position.clone();
        const tween = new TWEEN.Tween(shot)
          .to({
            delta: 1,
          }, 500).onUpdate(function() {
            const diff = target.position.clone().sub(startPos).multiplyScalar(this.delta);
            diff.add(startPos);
            shotMesh.position.x = diff.x;
            shotMesh.position.y = diff.y;
            shotMesh.position.z = diff.z;
            shotMesh.lookAt(target.position);
          })
          .onComplete(getApplyShot(unit, target, shotMesh));
        unit.lastShot = getGameTime();
        tween.start();
      }
    }
  }
}

function removeDead() {
  game.units = game.units.filter((unit) => {
    if (unit.dead) {
      unit.removeUnit();
      const newUnitPromise = unit.createNew();
      newUnitPromise.then((newUnit) => {
        game.newUnits.push(newUnit);
      });
    }
    return !unit.dead;
  });
  const toAdd = game.newUnits;
  // TODO: what if newUnits.push happens here? can it happen?
  game.newUnits = [];
  toAdd.forEach((u) => {
    game.units.push(u);
  });
}

function updateSimulation() {
  if (!game.paused.state) {
    for (const unit of game.units) {
      moveAlignedToGround(unit);
    }
    checkCollisions();
    findTargets();
    attackTargets();
    removeDead();
    game.scene.physicsStats.update();
  }
  requestAnimationFrame(updateSimulation);
}

function initM3Models() {
  const modelLoader = new ModelLoader({
    camera: game.scene.camera,
    scene: game.scene.scene3,
    light: game.scene.light,
    getCameraFocus,
    maxInstancesPerModel: config.units.m3count * 2,
  });
  const $modal = $('#m3progress');
  const $modalBody = $modal.find('.modal-body');
  const sources = {};
  $modal.modal();
  
  const progress = (evt) => {
    // function handles progress events of two types:
    // from Viewer.addEventListener('load') and from THREE.CompressedTextureLoader
    const source = evt.target.source || evt.target.responseURL;
    if (sources[source] === undefined) {
      const $progress = $('#m3unit.progress').clone();
      $progress.attr('id', '');
      $progress.removeClass('invisible');
      $modalBody.append($progress);
      sources[source] = {
        $progress,
      };
    }
    const $progressParent = sources[source].$progress;
    const $progress = sources[source].$progress.find('.progress-bar');
    const $progressText = $progress;
    function setProgress(value, text) {
      const val = Math.round(value * 100);
      if (val === 100) {
        $progressParent.remove();
      } else {
        $progress.attr("aria-valuenow", val);
        $progress.css({
          width: val + "%",
        });
        $progressText.html(val + "% " + text);
      }
    }
    const filename = source.replace(/^.*[\\\/]/, '');
    setProgress(evt.loaded / evt.total, filename);
  };

  const modelPromise = modelLoader.loadModels(progress);
  modelPromise.then(() => {
    game.m3loader = modelLoader;
    $modalBody.append("<p>All M3 models loaded!</p>");
    if ($('#units.progress .progress-bar').attr('aria-valuenow') === '100') {
      $modal.modal('hide');
    }
    createM3Units();
  });
}

function isMapEditor() {
  return $('input[name=mapEditor]')[0].checked;
}

function initScene() {
  $('.controls').height(config.dom.controlsHeight);

  game.scene.renderer = new THREE.WebGLRenderer({ antialias: true });
  game.scene.renderer.setSize(game.scene.width, game.scene.height);
  if (THREE.REVISION === '71') {
    game.scene.renderer.shadowMapEnabled = true;
    game.scene.renderer.shadowMapSoft = true;
  } else {
    game.scene.renderer.shadowMap.enabled = true;
    game.scene.renderer.shadowMap.soft = true;
  }
  $('#viewport').append(game.scene.renderer.domElement);
  $(game.scene.renderer.domElement).css({
    position: 'absolute',
    top: 0,
    left: 0,
    'z-index': 0,
  });
  const $overlay = $('<canvas/>');
  $overlay.css({
    position: 'absolute',
    top: 0,
    left: 0,
    'z-index': 1,
  });
  game.scene.$overlay = $overlay;
  $('#viewport').append($overlay);
  $('#viewport').height(game.scene.height);

  game.scene.raycaster = new THREE.Raycaster();

  initStats();

  game.scene.scene3 = new THREE.Scene();

  const frustumFar = 1000000;
  const frustumNear = 1;
  game.scene.camera = new THREE.PerspectiveCamera(
    35,
    game.scene.width / game.scene.height,
    frustumNear,
    frustumFar
  );
  addToScene(game.scene.camera);

  initLight();
  initGround();
  initCameraControls();
  game.components.push(new Sea());
  game.components.push(new SkyBox());
  game.components.push(new MiniMap());

  resetCamera();

  game.dom.$unitinfo = $('.unitinfo .content');

  game.unitPool = new UnitPool();
  game.explosions = new Explosions();
  game.healthBars = new HealthBars();
  game.teamBars = new TeamBars();

  requestAnimationFrame(render);

  loadModels(() => {
    //setInterval(updateSimulation, 1000 / 120);
    game.missiles = new Missiles();
    requestAnimationFrame(updateSimulation);
  });

  //updateSimulation();
}

function Sound() {
  let shotPlaying = 0;
  const maxShots = 10;
  const shot = new Howl({ 
    urls: ['models/sounds/bomb.mp3'],
    onend: () => {
      shotPlaying -= 1;
    },
    sprite: {
      shot: [0, 500]
    }
  });
  
  this.shot = function() {
    if (config.audio.sounds) {
      if (shotPlaying < 10) {
        shotPlaying += 1;
        shot.play('shot');
      }
    }
  }

  let blastPlaying = 0;
  const maxBlasts = 3;
  const blast = new Howl({ 
    urls: ['models/sounds/blast.mp3'],
    onend: () => {
      blastPlaying -= 1;
    },
    sprite: {
      blast: [0, 1000]
    }
  });

  this.blast = function() {
    if (config.audio.sounds) {
      if (blastPlaying < maxBlasts) {
        blastPlaying += 1;
        blast.play('blast');
      }
    }
  }

  if (config.audio.music) {
    const music = new Howl({ 
      urls: ['models/sounds/Whitehouse_Blues.mp3'],
      loop: true
    })
    music.play();
  }
}

function initDebug() {
  const geometry = new THREE.SphereGeometry(100, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sphere = new THREE.Mesh(geometry, material);
  // game.scene.scene3.add(sphere);
  // game.debugSphere = sphere;
}

function main() {
  game.sound = new Sound();
  initScene();
  initSelection();
  // initM3Models();
  initUI();
  onResize();
  initDebug();
}

$(main);
