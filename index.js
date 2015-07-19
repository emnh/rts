/*jslint browser: true, es6: true */

/* global
 * $, THREE, Stats, SimplexNoise, dat
 */

const jQuery = require('jquery');
const $ = jQuery;
window.jQuery = jQuery;
const bootstrap = require('bootstrap');
const boxIntersect = require('box-intersect');
const kdtree = require('static-kdtree');
const TWEEN = require('tween');
const howler = require('howler');

require('./js/Keys.js');
const MapControls = require('./js/MapControls.js').MapControls;
const Selection = require('./js/Selection.js').Selection;
const Util = new (require('./js/Util.js').Util)();
const Models = require('./js/Models.js').Models;
const UnitType = require('./js/UnitType.js').UnitType;
const Debug = require('./js/Debug.js').Debug;

const Mouse = {
  LBUTTON: 0,
  MBUTTON: 1,
  RBUTTON: 2
}

const config = {
  audio: {
    sounds: false,
    music: false
  },
  dom: {
    controlsHeight: 250,
  },
  units: {
    count: 20,
    speed: 50,
    randomLocation: false,
    airAltitude: 40,
  },
  terrain: {
    seaLevel: 0,
    minElevation: 0,
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
  heightField: [],
  components: [],
  models: {},
  emitters: [],
};

function getGameTime() {
  return (new Date().getTime()) / 1000.0 - game.startTime;
}

function getSize(geometry) {
  return {
    height: geometry.boundingBox.max.x - geometry.boundingBox.min.x,
    width: geometry.boundingBox.max.y - geometry.boundingBox.min.y,
    depth: geometry.boundingBox.max.z - geometry.boundingBox.min.z,
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
  const vector = pos.project(game.scene.camera);

  vector.x = (vector.x + 1) / 2 * game.scene.width;
  vector.y = -(vector.y - 1) / 2 * game.scene.height;

  return new THREE.Vector2(vector.x, vector.y);
}

function removeFromScene(mesh) {
  game.scene.scene3.remove(mesh);
  //mesh.geometry.dispose();
  mesh.material.dispose();
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

function initGround() {
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
  }
  for (let i = 0; i < groundGeometry.attributes.position.length; i += 3) {
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
  }
  groundGeometry.computeFaceNormals();
  groundGeometry.computeVertexNormals();

  game.scene.ground = new THREE.Mesh(groundGeometry, groundMaterial);
  // ground.rotation.x = Math.PI / -2;
  game.scene.ground.receiveShadow = true;
  addToScene(game.scene.ground);

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
  game.scene.camera.lookAt(game.scene.scene3.position);
}

function initCameraControls() {
  // Construct semi-infinite plane, since MapControls doesn't work well with height map mesh
  const plane = new THREE.PlaneGeometry(10000, 10000, 1, 1);
  game.scene.navigationPlane = new THREE.Mesh(plane, new THREE.MeshLambertMaterial());
  game.scene.navigationPlane.rotation.x = Math.PI / -2;
  game.scene.navigationPlane.visible = false;
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
  const nowTime = (new Date().getTime()) / 1000.0;
  if (object.lastMoved === undefined) {
    object.lastMoved = nowTime;
    return;
  }
  const oldTime = object.lastMoved;
  const timeDelta = nowTime - oldTime;
  object.lastMoved = nowTime;
  const eps = 1e-7;
  if (timeDelta < eps) {
    // prevent zero time from making direction vector zero.
    // in that case units turn to original rotation.
    return;
  }
  const zAxis = new THREE.Vector3(0, 0, config.units.speed * timeDelta);
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

function createMissile(options) {
  const material = options.material;
  const geometry = options.geometry;
  const materialClone = material.clone();
  const unit = new THREE.Mesh(geometry, materialClone);
  return unit;
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
  unit.model = options;

  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial.clone());
  addToScene(boxMesh);

  unit.bboxMesh = boxMesh;
  unit.bbox = bboxHelper.box;

  //unit.scale.set(scale, scale, scale);
  if (config.units.randomLocation) {
    unit.position.x = (Math.random() * config.terrain.width - config.terrain.width / 2) / 2;
    unit.position.z = (Math.random() * config.terrain.height - config.terrain.height / 2) / 2;
  }
  const height = size.height * unit.scale.y;
  const groundHeight = getGroundHeight(unit.position.x, unit.position.z);
  unit.position.y = groundHeight + height + 10;
  unit.rotation.y = Math.random() * 2 * Math.PI - Math.PI;
  unit.stayUpRight = true;
  unit.lastMoved = undefined;

  const healthMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { type: 'f', value: 0.0 },
      health: { type: 'f', value: 0.0},
    },
    vertexShader: $('#health-vertex').text(),
    fragmentShader: $('#health-fragment').text(),
  });
  const healthGeometry = new THREE.PlaneBufferGeometry(10, 2, 1, 1);
  // healthGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
  const healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
  unit.healthBar = healthBar;

  unit.castShadow = true;
  unit.receiveShadow = true;

  // game properties
  unit.health = 1.0 //Math.random();
  unit.type = options.type;
  unit.weapon = {
    range: 100.0,
    damage: 0.1,
    reload: 0.5,
  };
  unit.shots = []
  unit.team = Math.floor(Math.random() * 2);
  unit.attackTarget = null;
  unit.dead = false;

  /*
  const rangeGeometry = new THREE.SphereGeometry(unit.weapon.range, 32, 32);
  const rangeMaterial = new THREE.MeshLambertMaterial({
    transparent: true,
    opacity: 0.1
  });
  const rangeMesh = new THREE.Mesh(rangeGeometry, rangeMaterial);
  */
  //unit.add(rangeMesh);
  //addToScene(rangeMesh);

  game.units.push(unit);
  addToScene(unit);
  addToScene(healthBar);

  return unit;
}

function loadModels(finishCallback) {
  function getLoadTextureSuccess(options, material, units) {
    return function(texture) {
      options.downloadedTexture = options.textureSize;
      texture.anisotropy = game.scene.renderer.getMaxAnisotropy();
      texture.minFilter = THREE.NearestFilter;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(options.textureRepeat.x, options.textureRepeat.y);
      material.map = texture;
      for (const unit of units) {
        unit.material = material.clone();
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
      //options.downloadedModel = options.modelSize;
      const mat = new THREE.Matrix4();
      mat.makeRotationX(rotation.x);
      geometry.applyMatrix(mat);
      mat.makeRotationY(rotation.y);
      geometry.applyMatrix(mat);
      mat.makeRotationZ(rotation.z);
      geometry.applyMatrix(mat);
      mat.makeScale(scale, scale, scale);
      geometry.applyMatrix(mat);

      geometry.computeBoundingBox();
      // needed for proper lighting
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      const size = getSize(geometry);

      const material = new THREE.MeshLambertMaterial({ color: 0xF5F5F5, transparent: true, opacity: opacity });

      // for showing bounding box
      const boxGeometry = new THREE.BoxGeometry(size.height, size.width, size.depth);
      const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF, opacity: 0.0, transparent: true });
      const proto = new THREE.Mesh(geometry, material.clone());
      addToScene(proto);
      const bboxHelper = new THREE.BoundingBoxHelper(proto, 0);
      bboxHelper.update();
      removeFromScene(proto);
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
    downloadedTexture: 0
  };

  function setProgress(value) {
    const val = Math.round(value * 100);
    $progress.attr("aria-valuenow", val);
    $progress.css({
      width: val + "%",
    });
    $progressText.html(val + "% Complete");
  }

  function setModelProgress() {
    let downloadedSize = 0;
    let totalSize = 0;
    for (const model of optionList) {
      downloadedSize += model.downloadedModel;
      downloadedSize += model.downloadedTexture;
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
      modelOptions.downloadedModel = xhr.loaded;
    }
  }
  
  function getLoadTextureProgress(modelOptions) {
    return function(xhr) {
      modelOptions.downloadedTexture = xhr.loaded;
    }; 
  }

  const $modelSizes = $("#modelSizes");
  const modelSizes = JSON.parse($modelSizes.html());

  const $progress = $(".unitinfo .progress-bar");
  const $progressText = $progress; //.find("span");

  const optionList = [];

  const loader = new THREE.BufferGeometryLoader();
  const textureLoader = new THREE.TextureLoader();

  for (const model of Models) {
    const modelOptions = $.extend({}, options, model);
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


function initSelection() {
  const mouseElement = game.scene.renderer.domElement;
  game.selector = new Selection({
    placeUnit,
    boxIntersect,
    getBBoxes,
    mouseElement,
    worldToScreen,
    units: game.units,
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
}

function initUI() {
  initDAT();
  $(window).resize(onResize);
}

function updateUnitInfo() {
  if (game.selector.selected.length > 0) {
    const unit = game.selector.selected[0];
    const x = formatFloat(unit.position.x);
    const y = formatFloat(unit.position.y);
    const z = formatFloat(unit.position.z);
    const min = unit.geometry.boundingBox.min;
    const minx = formatFloat(min.x);
    const miny = formatFloat(min.y);
    const minz = formatFloat(min.z);
    const max = unit.geometry.boundingBox.max;
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
    unit.bboxMesh.scale.copy(unit.scale);
    unit.bboxMesh.rotation.copy(unit.rotation);
  }
}

function updateHealthBars() {
  for (const unit of game.units) {
    unit.healthBar.position.copy(unit.position);
    unit.healthBar.position.y += getSize(unit.geometry).height * unit.scale.y;
    unit.healthBar.lookAt(game.scene.camera.position);
  }
}

function updateShaders() {
  const nowTime = (new Date().getTime()) / 1000.0;
  const time = nowTime - game.startTime;
  for (const unit of game.units) {
    const mesh = unit.bboxMesh;
    if (mesh.material.uniforms !== undefined && mesh.material.uniforms.time !== undefined) {
      mesh.material.uniforms.time.value = time;
    }
    unit.healthBar.material.uniforms.health.value = unit.health;
  }
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
  // TODO: optimize to not use raycasting
  // TODO: move/use this function in MapControls
  const camera = game.scene.camera;
  const vector = new THREE.Vector3(mouseX, mouseY, camera.near);
  const mesh = game.scene.navigationPlane;
  vector.unproject(camera);
  const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
  const intersects = raycaster.intersectObject(mesh);
  if (intersects.length > 0) {
    return intersects[0].point;
  } else {
    console.log("ray", mouseX, mouseY, intersects, camera.position);
    console.warn("nav fail");
    return new THREE.Vector3(0, 0, 0);
  }
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
  const minimapMaterial = new THREE.PointCloudMaterial({ size: 0.1 });
  const light = new THREE.AmbientLight(0xFFFFFF);
  minimapScene.add(light);

  let oldCloud;
  let mouseDown = false;
  let oldCameraRectMesh;

  const cameraRectGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
  const cameraRectMaterial = new THREE.MeshLambertMaterial();
  const cameraRectMesh = new THREE.Mesh(cameraRectGeometry, cameraRectMaterial);

  // translate coords to minimap
  function translate(pos) {
    const v = new THREE.Vector3(pos.x * 2 / config.terrain.width, 0, pos.z * 2 / config.terrain.height);
    return v;
  }

  let first = true;

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
    const pointCloud = new THREE.PointCloud(geom, minimapMaterial);
    minimapScene.add(pointCloud);
    oldCloud = pointCloud;

    // XXX: fails on first render for some reason
    if (!first) {
      cameraRectGeometry.vertices[0] = translate(getCameraFocus(-1, -1));
      cameraRectGeometry.vertices[1] = translate(getCameraFocus(-1, 1));
      cameraRectGeometry.vertices[2] = translate(getCameraFocus(1, -1));
      cameraRectGeometry.vertices[3] = translate(getCameraFocus(1, 1));
    }
    if (oldCameraRectMesh) {
      minimapScene.remove(oldCameraRectMesh);
    }
    const wireframe = new THREE.EdgesHelper(cameraRectMesh, 0x00ff00);
    minimapScene.add(wireframe);
    oldCameraRectMesh = wireframe;

    minimapRenderer.render(minimapScene, minimapCamera);
    first = false;
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
  // Debug.drawOutLine(game.units, worldToScreen);

  TWEEN.update();
  updateShaders();
  updateUnitInfo();
  updateCameraInfo();
  updateBBoxes();
  updateHealthBars();
  game.components.forEach((x) => { x.render(); });
  game.scene.renderer.render(game.scene.scene3, game.scene.camera);
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
    d.multiplyScalar(1.0);
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
      if (target === unit) {
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

  this.createExplosion = function(pos) {
    const newMaterial = material.clone();
    newMaterial.uniforms.tExplosion.value = texture;
    const mesh = new THREE.Mesh(geometry, newMaterial);
    mesh.position.copy(pos);

    return mesh;
  }
}

function getApplyShot(unit, target, shotMesh) {
  return function() {
    const oldHealth = target.health;
    target.health -= unit.weapon.damage;
    removeFromScene(shotMesh);
    shotMesh = null;
    if (target.health <= 0 && oldHealth > 0) {
      target.dead = true;
      let explosion = game.explosions.createExplosion(target.position);
      target = null;
      explosion.time = 0;
      explosion.tscale = 0;
      explosion.opacity = 2;
      explosion.material.uniforms.time.value = this.time;
      //explosion.material.uniforms.tExplosion.value = game.explosion;
      addToScene(explosion);
      const seed = Math.random();
      game.sound.blast();
      const tween = new TWEEN.Tween(explosion)
        .to({ time: 1, tscale: 1, opacity: 0 }, 1000)
        .onUpdate(function() {
          this.material.uniforms.time.value = this.time + seed;
          this.material.uniforms.opacity.value = this.opacity;
          let scale = this.tscale;
          this.scale.set(scale, scale, scale);
        })
        .onComplete(function() {
          removeFromScene(explosion);
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
        const shotMesh = createMissile(game.models.missile);
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
        addToScene(shotMesh);
        unit.lastShot = getGameTime();
        tween.start();
      }
    }
  }
}

function removeDead() {
  const toAdd = [];
  game.units = game.units.filter((unit) => {
    if (unit.dead) {
      removeFromScene(unit.bboxMesh);
      removeFromScene(unit.healthBar);
      removeFromScene(unit);
      const newUnit = createUnit(unit.model);
      toAdd.push(newUnit);
    }
    return !unit.dead;
  });
  toAdd.forEach((u) => game.units.push(u));
}

function updateSimulation() {
  for (const unit of game.units) {
    moveAlignedToGround(unit);
  }
  checkCollisions();
  findTargets();
  attackTargets();
  removeDead();
  game.scene.physicsStats.update();
  requestAnimationFrame(updateSimulation);
}

function initScene() {
  $('.controls').height(config.dom.controlsHeight);

  game.scene.renderer = new THREE.WebGLRenderer({ antialias: true });
  game.scene.renderer.setSize(game.scene.width, game.scene.height);
  game.scene.renderer.shadowMapEnabled = true;
  game.scene.renderer.shadowMapSoft = true;
  $('#viewport').append(game.scene.renderer.domElement);
  $('#viewport').height(game.scene.height);

  game.scene.raycaster = new THREE.Raycaster();

  initStats();

  game.scene.scene3 = new THREE.Scene();

  const frustumFar = 100000;
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

  game.explosions = new Explosions();

  requestAnimationFrame(render);

  loadModels(() => {
    //setInterval(updateSimulation, 1000 / 120);
    requestAnimationFrame(updateSimulation);
  });
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

function main() {
  game.sound = new Sound();
  initScene();
  initSelection();
  initUI();
}

$(main);
