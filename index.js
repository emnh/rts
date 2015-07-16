/*jslint browser: true, es6: true */

/* global
 * $, THREE, Stats, Physijs, TWEEN, SimplexNoise
 */

const jQuery = require('jquery');
const $ = jQuery;
global.jQuery = jQuery;
const bootstrap = require('bootstrap');
const boxIntersect = require('box-intersect');

const MapControls = require('./js/MapControls.js').MapControls;
const Selection = require('./js/Selection.js').Selection;

Physijs.scripts.worker = 'jscache/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

const controlsHeight = 250;
const selectables = [];
const mapBounds = new THREE.Box3();
const startTime = (new Date().getTime()) / 1000.0;
const units = [];
let render;
let noiseGen;
let renderer;
let renderStats;
let physicsStats;
let scene;
let light;
let ground;
let groundGeometry;
let groundMaterial;
let camera;
let sceneWidth = window.innerWidth;
let sceneHeight = window.innerHeight - controlsHeight;
let raycaster;
let cameraControls;
let moveSkybox;
let selector;
let heightField = [];
let redSphere;
let blueSpheres;
let $unitinfo;

const config = {
  units: {
    count: 20,
    speed: 20,
    randomLocation: false,
  },
  terrain: {
    maxElevation: 32,
    xFaces: 100,
    yFaces: 100,
    width: 1000,
    height: 1000,
  },
  camera: {
    mouseControl: true,
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
  const oldGroundHeight = getGroundHeight(object.position.x, object.position.z);
  if (object.position.x + xzDirection.x <= mapBounds.min.x) {
    xzDirection.x = -xzDirection.x;
  }
  if (object.position.x + xzDirection.x >= mapBounds.max.x) {
    xzDirection.x = -xzDirection.x;
  }
  if (object.position.z + xzDirection.z <= mapBounds.min.z) {
    xzDirection.z = -xzDirection.z;
  }
  if (object.position.z + xzDirection.z >= mapBounds.max.z) {
    xzDirection.z = -xzDirection.z;
  }
  // add velocity to position
  // object.position.x += xzDirection.x;
  // object.position.z += xzDirection.z;

  // align to ground
  const groundHeight = getGroundHeight(object.position.x, object.position.z);
  const size = getSize(object.geometry);
  const yf = -object.geometry.boundingBox.min.y;
  // const yf = size.height;
  object.position.y = groundHeight + yf * object.scale.y;

  // rotate in velocity direction
  const dir = xzDirection.clone();
  dir.y = groundHeight - oldGroundHeight;
  dir.add(object.position);
  object.lookAt(dir);

  // rotate left/right. doesnt' work, so disabled
  const delta = 1;
  const yAxis = new THREE.Vector3(0, 0.1, 0);
  yAxis.applyQuaternion(object.quaternion);
  yAxis.y = 0;
  const leftGroundHeight = getGroundHeight(object.position.x + yAxis.x, object.position.z + yAxis.z);
  const yAxis2 = new THREE.Vector3(0, -0.1, 0);
  yAxis2.applyQuaternion(object.quaternion);
  yAxis2.y = 0;
  const rightGroundHeight = getGroundHeight(object.position.x + yAxis2.x, object.position.z + yAxis2.z);
  // object.rotation.z = Math.atan2(rightGroundHeight - leftGroundHeight, 0.2);
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

function mix(a, b, alpha) {
  return a + (b - a) * alpha;
}

function isInt(n){
  return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
  return n === Number(n) && n % 1 !== 0;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) == '[object Object]';
}

function worldToScreen(pos) {
  const vector = pos.project(camera);

  vector.x = (vector.x + 1) / 2 * sceneWidth;
  vector.y = -(vector.y - 1) / 2 * sceneHeight;

  return new THREE.Vector2(vector.x, vector.y);
}

function loadSkyBox() {
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
      context.drawImage(image, - x * size, - y * size);

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

  const skyBox = new THREE.Mesh(
        new THREE.BoxGeometry(boxSize, boxSize, boxSize),
        skyBoxMaterial
      );

  return skyBox;
}

function initScene() {

  $('.controls').height(controlsHeight);

  TWEEN.start();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sceneWidth, sceneHeight);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  $('#viewport').append(renderer.domElement);
  $('#viewport').height(sceneHeight);

  raycaster = new THREE.Raycaster();

  renderStats = new Stats();
  renderStats.domElement.style.position = 'absolute';
  renderStats.domElement.style.top = '0px';
  renderStats.domElement.style.zIndex = 100;
  $('body').append(renderStats.domElement);

  physicsStats = new Stats();
  physicsStats.domElement.style.position = 'absolute';
  physicsStats.domElement.style.top = '50px';
  physicsStats.domElement.style.zIndex = 100;
  $('body').append(physicsStats.domElement);

  scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
  scene.setGravity(new THREE.Vector3( 0, -100, 0));
  let count = 0;
  scene.addEventListener('update', updateSimulation);

  const frustumFar = 100000;
  const frustumNear = 1;
  camera = new THREE.PerspectiveCamera(
    35,
    sceneWidth / sceneHeight,
    frustumNear,
    frustumFar
  );
  // camera = new THREE.OrthographicCamera(sceneWidth / -2, sceneWidth / 2, sceneHeight / -2, sceneHeight, 1, 10000);

  scene.add(camera);

  // Light
  light = new THREE.DirectionalLight(0xFFFFFF);
  light.position.set(20, 40, -15);
  light.target.position.copy(scene.position);
  light.castShadow = true;
  light.shadowCameraLeft = -60;
  light.shadowCameraTop = -60;
  light.shadowCameraRight = 60;
  light.shadowCameraBottom = 60;
  light.shadowCameraNear = 20;
  light.shadowCameraFar = 200;
  light.shadowBias = -0.0001;
  light.shadowMapWidth = light.shadowMapHeight = 2048;
  light.shadowDarkness = 0.7;
  scene.add(light);

  // Materials
  groundMaterial = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'models/images/grass.jpg' ) }),
    0.8, // high friction
    0.0 // low restitution
  );
  groundMaterial.map.wrapS = groundMaterial.map.wrapT = THREE.RepeatWrapping;
  // groundMaterial.map.repeat.set( 2.5, 2.5 );
  groundMaterial.map.repeat.set( 10.0, 10.0 );

  // Ground
  noiseGen = new SimplexNoise();
  groundGeometry = new THREE.PlaneBufferGeometry(
      config.terrain.width,
      config.terrain.height,
      config.terrain.xFaces,
      config.terrain.yFaces);
  groundGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));
  for (let i = 0; i <= config.terrain.xFaces; i++) {
    heightField[i] = [];
  }
  // for (let i = 0; i < groundGeometry.vertices.length; i++) {
  // var vertex = groundGeometry.vertices[i];
  for (let i = 0; i < groundGeometry.attributes.position.length; i += 3) {
    const x = groundGeometry.attributes.position.array[i];
    const z = groundGeometry.attributes.position.array[i + 2];
    const noise = noiseGen.noise(x / 100, z / 100);
    // normalize [-1,1] to [0,1]
    const normalNoise = (noise + 1) / 2;
    const xi = (x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width;
    const yi = (z + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height;
    const y = normalNoise * config.terrain.maxElevation;
    groundGeometry.attributes.position.array[i + 1] = y;
    heightField[xi][yi] = y;
  }
  groundGeometry.computeFaceNormals();
  groundGeometry.computeVertexNormals();

  /*ground = new Physijs.HeightfieldMesh(
    groundGeometry,
    groundMaterial,
    0, // mass
    config.terrain.xFaces,
    config.terrain.yFaces
  );
  */
  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  // ground.rotation.x = Math.PI / -2;
  ground.receiveShadow = true;
  scene.add(ground);

  mapBounds.min.x = -config.terrain.width / 2;
  mapBounds.min.y = 0;
  mapBounds.min.z = -config.terrain.height / 2;
  mapBounds.max.x = config.terrain.width / 2;
  mapBounds.max.y = config.terrain.maxElevation * 2;
  mapBounds.max.z = config.terrain.height / 2;

  const skyBox = loadSkyBox();
  scene.add(skyBox);
  moveSkybox = function() {
    skyBox.position.x = camera.position.x;
    skyBox.position.y = camera.position.y;
    skyBox.position.z = camera.position.z;
  };

  // Camera and controls

  // Construct semi-infinite plane, since MapControls doesn't work well with height map mesh
  const plane = new THREE.PlaneGeometry(10000, 10000, 1, 1);
  const planeMesh = new THREE.Mesh(plane, new THREE.MeshLambertMaterial());

  planeMesh.rotation.x = Math.PI / -2;
  planeMesh.visible = false;
  cameraControls = new MapControls(
      camera,
      planeMesh,
      () => null,
      renderer.domElement);
  cameraControls.minDistance = 10;
  cameraControls.maxDistance = 1000;
  // camera.position.set(107, 114, 82);
  camera.position.set(320, 340, 245);
  camera.lookAt(scene.position);
  scene.add(planeMesh);

  $unitinfo = $('.unitinfo .content');

  requestAnimationFrame(render);
  scene.simulate();

  // the following debugging code may be useful later on
  /*
  function loadSphere(color) {
    const geometry = new THREE.BoxGeometry(4, 4, 4);
    const material = new THREE.MeshLambertMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
  }
  redSphere = loadSphere(0xFF0000);
  blueSpheres = [];
  blueSpheres.push(loadSphere(0x0000FF));
  blueSpheres.push(loadSphere(0x0000FF));
  blueSpheres.push(loadSphere(0x0000FF));
  blueSpheres.push(loadSphere(0x0000FF));
  */

  loadModels();
}

function clearLog() {
  const $debug = $('.debug');
  $debug.html('');
}

function log(...args) {
  const $debug = $('.debug');
  let s = '';
  for (let arg of args) {
    if (isFloat(arg)) {
      arg = formatFloat(arg);
    }
    s += arg + ' ';
  }
  s += '<br/>';
  $debug.append(s);
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
      xi >= heightField.length ||
      xi + 1 >= heightField.length ||
      yi >= heightField[xi].length ||
      yi + 1 >= heightField[xi].length) {
    return 0;
  }
  const fQ11 = heightField[xi][yi];
  const fQ21 = heightField[xi + 1][yi];
  const fQ12 = heightField[xi][yi + 1];
  const fQ22 = heightField[xi + 1][yi + 1];

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

function getGroundHeightRay(x, y) {
  const z = y;

  const origin = new THREE.Vector3(x, config.terrain.maxElevation + 1, z);
  const direction = new THREE.Vector3(0, -1, 0);
  raycaster.set(origin, direction);
  const intersects = raycaster.intersectObject(ground);
  if (intersects.length > 0) {
    return intersects[0].point.y;
  }
  throw new Error('failed to get height');
}

function loadModels() {

  function getOnSuccess(options) {
    const scale = options.scale;
    const rotation = options.rotation;
    const texturePath = options.texturePath;
    const textureRepeat = options.textureRepeat;
    const opacity = options.opacity;
    return function(geometry) {
      const mat = new THREE.Matrix4();
      mat.makeRotationX(rotation.x);
      geometry.applyMatrix(mat);
      mat.makeRotationY(rotation.y);
      geometry.applyMatrix(mat);
      mat.makeRotationZ(rotation.z);
      geometry.applyMatrix(mat);

      geometry.computeBoundingBox();
      // needed for proper lighting
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      const size = getSize(geometry);

      const texture = THREE.ImageUtils.loadTexture(texturePath);
      texture.anisotropy = renderer.getMaxAnisotropy();
      texture.minFilter = THREE.NearestFilter;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(textureRepeat.x, textureRepeat.y);
      const material = new THREE.MeshLambertMaterial({ color: 0xF5F5F5, map: texture, transparent: true, opacity: opacity });

      // for showing bounding box
      const boxGeometry = new THREE.BoxGeometry(size.height, size.width, size.depth);
      const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF, opacity: 0.0, transparent: true });
      const proto = new THREE.Mesh(geometry, material.clone());
      scene.add(proto);
      const bboxHelper = new THREE.BoundingBoxHelper(proto, 0);
      bboxHelper.update();
      scene.remove(proto);
      for (let vertex of boxGeometry.vertices) {
        vertex.x += (bboxHelper.box.min.x + bboxHelper.box.max.x) / 2;
        vertex.y += (bboxHelper.box.min.y + bboxHelper.box.max.y) / 2;
        vertex.z += (bboxHelper.box.min.z + bboxHelper.box.max.z) / 2;
      }

      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { type: 'f', value: 0.0 },
        },
        vertexShader: $('#loader-vertex').text(),
        fragmentShader: $('#loader-fragment').text(),
        transparent: true,
      });

      for (let i = 0; i < config.units.count; i++) {
        const object = new THREE.Mesh(geometry, material.clone());
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial.clone());
        scene.add(boxMesh);

        object.bboxMesh = boxMesh;
        object.bbox = bboxHelper.box;

        object.scale.set(scale, scale, scale);
        if (config.units.randomLocation) {
          object.position.x = (Math.random() * config.terrain.width - config.terrain.width / 2) / 2;
          object.position.z = (Math.random() * config.terrain.height - config.terrain.height / 2) / 2;
        }
        const size = getSize(object.geometry);
        const height = size.height * object.scale.y;
        const groundHeight = getGroundHeight(object.position.x, object.position.z);
        object.position.y = groundHeight + height + 10;
        object.rotation.y = Math.random() * 2 * Math.PI - Math.PI;
        object.stayUpRight = true;
        object.lastMoved = undefined;
        object.health = Math.random();

        const healthMaterial = new THREE.ShaderMaterial({
          uniforms: {
            time: { type: 'f', value: 0.0 },
            health: { type: 'f', value: object.health },
          },
          vertexShader: $('#health-vertex').text(),
          fragmentShader: $('#health-fragment').text(),
        });
        const healthGeometry = new THREE.PlaneBufferGeometry(10, 2, 1, 1);
        // healthGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        const healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
        object.healthBar = healthBar;

        units.push(object);
        selectables.push(object);
        scene.add(object);
        scene.add(healthBar);
      }
    };
  }
  const loader = new THREE.BufferGeometryLoader();


  const options = {
    scale: 1,
    rotation: new THREE.Vector3(),
    texturePath: 'models/images/camouflage.jpg',
    textureRepeat: new THREE.Vector2(1, 1),
    opacity: 1,
  };

  const models = [
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
    },
    {
      name: 'house',
      path: 'models/3d/house.json',
      scale: 0.03,
      texturePath: 'models/images/house.jpg',
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
    },
    {
      name: 'farm',
      path: 'models/3d/farm.json',
      scale: 500,
      texturePath: 'models/images/farm.jpg',
    },
  ];

  for (let model of models) {
    if (model.name !== 'house' &&
        model.name !== 'farm') {
      const modelOptions = $.extend({}, options, model);
      loader.load(model.path, getOnSuccess(modelOptions));
    }
  }
}

function initSelection() {
  const mouseElement = renderer.domElement;
  selector = new Selection({
    raycaster,
    selectables,
    camera,
    ground,
    getGroundHeight: getGroundHeight,
  });
  const handler = selector.getOnMouseMove(config, mouseElement);
  $(mouseElement).mousemove(handler);

  const downHandler = selector.getOnMouseDown();
  $(mouseElement).mousedown(downHandler);
}

function initDAT() {
  const gui = new dat.GUI();
  const controllers = {};

  // automagic dat GUI init from config
  for (let varName in config) {
    if (config.hasOwnProperty(varName)) {
      const inner = config[varName];
      if (isObject(inner)) {
        const folder = gui.addFolder(varName);
        for (let varName2 in inner) {
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
    cameraControls.enabled = config.camera.mouseControl;
  });
}

function onResize() {
  sceneWidth = window.innerWidth;
  sceneHeight = window.innerHeight - controlsHeight;
  $('#viewport').height(sceneHeight);
  $(renderer.domElement).height(sceneHeight);
  camera.aspect = sceneWidth / sceneHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(sceneWidth, sceneHeight);
}

function initUI() {
  initDAT();
  $(window).resize(onResize);
}

function updateUnitInfo() {
  if (selector.selected.length > 0) {
    const unit = selector.selected[0];
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
    s += `<td>${y}</td><td>${minx}</td><td>${maxy}</td>`;
    s += '</tr>';

    s += '<tr><th>Z</th>';
    s += `<td>${z}</td><td>${minz}</td><td>${maxz}</td>`;
    s += '</tr>';
    s +=  '</table>';

    s += '<div>';
    s += '<span>Health </span>';
    s += `<span>${health}</span>`;
    s += '</div>';
    $unitinfo.html(s);
  }
}

function updateCameraInfo() {
  const x = camera.position.x;
  const y = camera.position.y;
  const z = camera.position.z;
  const xr = camera.rotation.x;
  const yr = camera.rotation.y;
  const zr = camera.rotation.z;
  config.camera.X = x;
  config.camera.Y = y;
  config.camera.Z = z;
  config.camera.rotationX = xr;
  config.camera.rotationY = yr;
  config.camera.rotationZ = zr;
}

function updateBBoxes() {
  for (let unit of units) {
    unit.bboxMesh.position.copy(unit.position);
    unit.bboxMesh.scale.copy(unit.scale);
    unit.bboxMesh.rotation.copy(unit.rotation);
  }
}

function updateHealthBars() {
  for (let unit of units) {
    unit.healthBar.position.copy(unit.position);
    unit.healthBar.position.y += getSize(unit.geometry).height * unit.scale.y;
    unit.healthBar.lookAt(camera.position);
  }
}

function updateShaders() {
  const nowTime = (new Date().getTime()) / 1000.0;
  const time = nowTime - startTime;
  for (let unit of units) {
    let obj = unit.bboxMesh;
    if (obj.material.uniforms !== undefined && obj.material.uniforms.time !== undefined) {
      obj.material.uniforms.time.value = time;
    }
    unit.healthBar.material.uniforms.health.value = unit.health;
  }
}

function drawOutLine() {
  const viewport = $('#viewport');
  for (let unit of units) {
    // need to get corners of bbox
    // make a cube, then rotate it
    const geometry = unit.bboxMesh.geometry.clone();
    const mat = new THREE.Matrix4().makeRotationFromQuaternion(unit.quaternion);
    geometry.applyMatrix(mat);
    const screenBox = new THREE.Box2();
    for (let vertex of geometry.vertices) {
      const pos = vertex.clone().multiply(unit.scale).add(unit.position);
      const vec2 = worldToScreen(pos);
      screenBox.expandByPoint(vec2);
    }
    let div = unit.outline;
    if (div === undefined) {
      div = $('<div/>');
      unit.outline = div;
      viewport.append(div);
    }
    const left = screenBox.min.x;
    const top = screenBox.min.y;
    const width = screenBox.max.x - screenBox.min.x;
    const height = screenBox.max.y - screenBox.min.y;
    /*div.css({
      position: 'absolute',
      left,
      top,
      height,
      width,
      border: '1px solid black',
    });*/
  }
}

render = function() {
  /*
  const unit = units[0];
  if (unit !== undefined) {
    camera.position.copy(unit.position);
    camera.rotation.copy(unit.rotation);
  }
  */
  updateShaders();
  updateUnitInfo();
  updateCameraInfo();
  updateBBoxes();
  updateHealthBars();
  // drawOutLine is slow. I ended up doing health bars in 3D instead and looks pretty good.
  // drawOutLine();
  moveSkybox();
  renderer.render(scene, camera);
  renderStats.update();
  requestAnimationFrame(render);
};

function checkCollisions() {
  // prepare world-{aligned, positioned, rotated} bounding boxes
  const boxes = [];
  for (let unit of units) {
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
    if (p1new.x >= mapBounds.min.x &&
        p1new.x <= mapBounds.max.x &&
        p1new.z >= mapBounds.min.z &&
        p1new.z <= mapBounds.max.z) {
      p1.sub(d);
    }
    if (p2new.x >= mapBounds.min.x &&
        p2new.x <= mapBounds.max.x &&
        p2new.z >= mapBounds.min.z &&
        p2new.z <= mapBounds.max.z) {
      p2.add(d);
    }
  });
}

function updateSimulation() {
  for (let obj of units) {
    moveAlignedToGround(obj);
  }
  checkCollisions();
  scene.simulate(undefined, 1);
  physicsStats.update();
}

function main() {
  initScene();
  initSelection();
  initUI();
}

$(main);
