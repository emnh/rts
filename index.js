/*jslint browser: true, es6: true */

/* global
 * $, THREE, Stats, Physijs, TWEEN
 */

const jQuery = require('jquery');
const $ = jQuery;
global.jQuery = jQuery;
const bootstrap = require('bootstrap');

const MapControls = require('./js/MapControls.js').MapControls;
const Selection = require('./js/Selection.js').Selection;

Physijs.scripts.worker = 'jscache/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var render, createShape, NoiseGen,
  renderer, render_stats, physics_stats, scene, light, ground, groundGeometry, ground_material, camera;
const controlsHeight = 250;
let sceneWidth = window.innerWidth;
let sceneHeight = window.innerHeight - controlsHeight; 
//$(".controls").css({ height: controlsHeight + "px" });
var raycaster;
const selectables = [];
let cameraControls;
let moveSkybox;
let selector;
let heightField = [];
let redSphere;
let blueSpheres;
const units = [];

const config = {
  terrain: {
    maxHeight: 32,
    xFaces: 100,
    yFaces: 100,
    width: 1000,
    height: 1000
  },
  camera: {
    mouseControl: true,
    X: 0,
    Y: 0,
    Z: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0
  },
  debug: {
    mouseX: 0,
    mouseY: 0,
  }
};

function moveAlignedToGround(object) {
  // set velocity
  const zAxis = new THREE.Vector3(0, 0, 0.1);
  zAxis.applyQuaternion(object.quaternion);
  zAxis.y = 0;
  const xzDirection = zAxis;
  //object.setLinearVelocity(xzDirection);
  const oldGroundHeight = getGroundHeight(object.position.x, object.position.z);
  object.position.x += xzDirection.x;
  object.position.z += xzDirection.z;
  
  // align to ground
  const groundHeight = getGroundHeight(object.position.x, object.position.z);
  const size = getSize(object.geometry);
  object.position.y = groundHeight + size.height * object.scale.y;

  // rotate in velocity direction
  const dir = xzDirection.clone();
  dir.y = groundHeight - oldGroundHeight;
  dir.add(object.position);
  object.lookAt(dir);
}

function getSize(geometry) {
  return {
    height: geometry.boundingBox.max.x - geometry.boundingBox.min.x,
    width: geometry.boundingBox.max.y - geometry.boundingBox.min.y,
    depth: geometry.boundingBox.max.z - geometry.boundingBox.min.z
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

function loadSkyBox() {
  const cubeMap = new THREE.Texture([]);
  cubeMap.format = THREE.RGBFormat;
  cubeMap.flipY = false;

  const loader = new THREE.ImageLoader();
  loader.load( 'models/images/sky.jpg', function(image) {
    const getSide = function(x, y) {
      var size = 1024;
      var canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      var context = canvas.getContext('2d');
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

  var cubeShader = THREE.ShaderLib['cube'];
  cubeShader.uniforms['tCube'].value = cubeMap;

  var skyBoxMaterial = new THREE.ShaderMaterial( {
    fragmentShader: cubeShader.fragmentShader,
    vertexShader: cubeShader.vertexShader,
    uniforms: cubeShader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
  });

  const boxSize = 10000;

  var skyBox = new THREE.Mesh(
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

  render_stats = new Stats();
  render_stats.domElement.style.position = 'absolute';
  render_stats.domElement.style.top = '0px';
  render_stats.domElement.style.zIndex = 100;
  $('body').append(render_stats.domElement);

  physics_stats = new Stats();
  physics_stats.domElement.style.position = 'absolute';
  physics_stats.domElement.style.top = '50px';
  physics_stats.domElement.style.zIndex = 100;
  $('body').append(physics_stats.domElement);

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
  //camera = new THREE.OrthographicCamera(sceneWidth / -2, sceneWidth / 2, sceneHeight / -2, sceneHeight, 1, 10000);

  scene.add(camera);

  // Light
  light = new THREE.DirectionalLight( 0xFFFFFF );
  light.position.set( 20, 40, -15 );
  light.target.position.copy( scene.position );
  light.castShadow = true;
  light.shadowCameraLeft = -60;
  light.shadowCameraTop = -60;
  light.shadowCameraRight = 60;
  light.shadowCameraBottom = 60;
  light.shadowCameraNear = 20;
  light.shadowCameraFar = 200;
  light.shadowBias = -.0001
  light.shadowMapWidth = light.shadowMapHeight = 2048;
  light.shadowDarkness = .7;
  scene.add( light );

  // Materials
  ground_material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'models/images/grass.png' ) }),
    0.8, // high friction
    0.0 // low restitution
  );
  ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
  //ground_material.map.repeat.set( 2.5, 2.5 );
  ground_material.map.repeat.set( 10.0, 10.0 );

  // Ground
  NoiseGen = new SimplexNoise;

  const groundWidth = 1000;
  const groundHeight = 1000;
  groundGeometry = new THREE.PlaneGeometry(
      config.terrain.width,
      config.terrain.height,
      config.terrain.xFaces,
      config.terrain.yFaces);
  groundGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));
  for (let i = 0; i <= config.terrain.xFaces; i++) {
    heightField[i] = [];
  }
  for (let i = 0; i < groundGeometry.vertices.length; i++ ) {
    var vertex = groundGeometry.vertices[i];
    const noise = NoiseGen.noise(vertex.x / 100, vertex.z / 100);
    //const noise = Math.sin(vertex.x / 100) + Math.sin(vertex.y / 10);
    // normalize [-1,1] to [0,1]
    const normalNoise = (noise + 1) / 2;
    const xi = (vertex.x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width;
    const yi = (vertex.z + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height;
    vertex.y = normalNoise * config.terrain.maxHeight;
    heightField[xi][yi] = vertex.y;
    //console.log(i, vertex.x, vertex.y, xi, yi, gh);
  }
  groundGeometry.computeFaceNormals();
  groundGeometry.computeVertexNormals();

  ground = new Physijs.HeightfieldMesh(
    groundGeometry,
    ground_material,
    0, // mass
    config.terrain.xFaces,
    config.terrain.yFaces
  );
  //ground.rotation.x = Math.PI / -2;
  ground.receiveShadow = true;
  scene.add(ground);

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

  planeMesh.rotation.x = Math.PI / -2; //ground.rotation.x;
  planeMesh.visible = false;
  cameraControls = new MapControls(camera, planeMesh, () => null, renderer.domElement);
  cameraControls.minDistance = 10;
  cameraControls.maxDistance = 1000;
  //camera.position.set(107, 114, 82);
  camera.position.set(320, 340, 245);
  camera.lookAt(scene.position);
  scene.add(planeMesh);

  requestAnimationFrame(render);
  scene.simulate();

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
  const greenSpheres = [];
  for (let i = 0; i < groundGeometry.vertices.length; i++) {
    const vertex = groundGeometry.vertices[i];
    console.log("v", vertex.x, vertex.y, vertex.z);
    let gh;
    try {
      gh = getGroundHeight(vertex.x, vertex.y);
    } catch(err) {
      gh = -137;
    }
    /*const sphere = loadSphere(0x00FF00);
    sphere.position.x = vertex.x;
    sphere.position.y = vertex.y;
    sphere.position.z = gh;*/
  }

  loadTank();
  //createShape();
};

function clearLog() {
  const $debug = $(".debug");
  $debug.html("");
}

function log(...args) {
  const $debug = $(".debug");
  let s = "";
  for (let arg of args) {
    if (isFloat(arg)) {
      arg = formatFloat(arg);
    }
    s += arg + " ";
  }
  s += "<br/>"
  $debug.append(s);
}

function getGroundHeight(x, y) {
  const xd = (x + config.terrain.width / 2) * config.terrain.xFaces / config.terrain.width;
  const yd = (y + config.terrain.height / 2) * config.terrain.yFaces / config.terrain.height;
  const xi = Math.floor(xd);
  const yi = Math.floor(yd);

  // https://en.wikipedia.org/wiki/Bilinear_interpolation
  const x1 = x - (xd % 1) * config.terrain.width / config.terrain.xFaces;
  const x2 = x1 + 1 * config.terrain.width / config.terrain.xFaces;
  const y1 = y - (yd % 1) * config.terrain.height / config.terrain.yFaces;
  const y2 = y1 + 1 * config.terrain.height / config.terrain.yFaces;
  //clearLog();
  //log("x, y", x, y, "x1, x2", x1, x2, "y1, y2", y1, y2); 
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
  //log("xi, yi", xi, yi, "f", fQ11, fQ21, fQ12, fQ22, "fx", fxy1, fxy2);

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

  const origin = new THREE.Vector3(x, config.terrain.maxHeight + 1, z);
  const direction = new THREE.Vector3(0, -1, 0);
  raycaster.set(origin, direction);
  const intersects = raycaster.intersectObject(ground);
  if (intersects.length > 0) {
    return intersects[0].point.y;
  }
  console.warn("failed to get height");
  return 0;
}

function loadTank() {
  function onSuccess(geometry) {
    //const sphereGeometry = new THREE.SphereGeometry(150, 32, 32);
    geometry.computeBoundingBox();
    const size = getSize(geometry);

    // for showing bounding box
    const boxGeometry = new THREE.BoxGeometry(size.height, size.width, size.depth);
    for (let vertex of boxGeometry.vertices) {
      //vertex.x += (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      //vertex.y += (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
      //vertex.z += (geometry.boundingBox.max.z - geometry.boundingBox.min.z);
      // TODO: figure out why this magic number is needed
      vertex.x += 25;
    }
    const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF, opacity: 0.0, transparent: true });

    const texture = THREE.ImageUtils.loadTexture('models/images/camouflage.jpg');
    texture.anisotropy = renderer.getMaxAnisotropy();
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set( 0.2, 0.2 );
    const scale = 0.05;
    const material = new THREE.MeshLambertMaterial({ color: 0xF5F5F5, map: texture });
    const friction = 0.8; // high friction
    const restitution = 0.0; // low restitution
    const pmaterial = Physijs.createMaterial(material, friction, restitution);
    //const object = new THREE.Mesh(geometry, material);
    //const wheelRadius = size.depth / 2 * scale; 
    const wheelRadius = 1.0;
    const wheel = new THREE.SphereGeometry(wheelRadius, 20, 20);
    //const wheel = boxGeometry.clone();
    //wheel.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));
    //const wheel = new THREE.CylinderGeometry(wheelRadius, wheelRadius, size.width * scale, 20);
    //wheel.applyMatrix(new THREE.Matrix4().makeTranslation(0, length / 2, 0));
    //wheel.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00, map: texture });
    wheel.computeFaceNormals();
    wheel.computeVertexNormals();
    
    for (let i = 0; i < 100; i++) {
      const mass = 100.0;
      //const object = new Physijs.BoxMesh(geometry, pmaterial.clone(), mass);
      const object = new THREE.Mesh(geometry, pmaterial.clone());
      //const object = new THREE.Mesh(geometry, pmaterial.clone());
      const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial.clone());
      scene.add(boxMesh);

      object.bboxMesh = boxMesh;
    
      object.scale.set(scale, scale, scale);
      const areaSize = 1000;
      object.position.x = Math.random() * areaSize - areaSize / 2;
      object.position.z = Math.random() * areaSize - areaSize / 2;
      const size = getSize(object.geometry);
      const height = size.height * object.scale.y;
      const groundHeight = getGroundHeight(object.position.x, object.position.z);
      object.position.y = groundHeight + height + 10;
      object.rotation.y = Math.random() * 2 * Math.PI - Math.PI;
      object.stayUpRight = true;

      units.push(object);
      selectables.push(object);
      scene.add(object);

      //object.setDamping(0.4, 1.0);
    }
  }
  const loader = new THREE.BufferGeometryLoader();
  loader.load("models/3d/tank-m1a1.json", onSuccess);
}

function initSelection() {
  const mouseElement = renderer.domElement;
  selector = new Selection({
    raycaster,
    selectables,
    camera,
    ground,
    getGroundHeight: getGroundHeight
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
            controllers[varName + "." + varName2] = controller;
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
    // TODO: optimize
    const $unitinfo = $(".unitinfo .content");
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
    unit.bboxMesh.position.copy(unit.position)
    unit.bboxMesh.scale.copy(unit.scale);
    unit.bboxMesh.rotation.copy(unit.rotation);
  }
}

render = function() {
  updateUnitInfo();
  updateCameraInfo();
  updateBBoxes();
  moveSkybox();
  renderer.render(scene, camera);
  render_stats.update();
  requestAnimationFrame(render);
};

createShape = (function() {
  var addshapes = true,
    shapes = 0,
    box_geometry = new THREE.BoxGeometry( 3, 3, 3 ),
    sphere_geometry = new THREE.SphereGeometry( 1.5, 32, 32 ),
    cylinder_geometry = new THREE.CylinderGeometry( 2, 2, 1, 32 ),
    cone_geometry = new THREE.CylinderGeometry( 0, 2, 4, 32 ),
    octahedron_geometry = new THREE.OctahedronGeometry( 1.7, 1 ),
    torus_geometry = new THREE.TorusKnotGeometry ( 1.7, .2, 32, 4 ),
    doCreateShape;

  doCreateShape = function() {
    var shape;
    // material = new THREE.MeshLambertMaterial({ opacity: 0, transparent: true });
    var texture = THREE.ImageUtils.loadTexture( 'models/images/bricks.jpg' );
    texture.anisotropy = renderer.getMaxAnisotropy();
    texture.minFilter = THREE.NearestFilter;

    var material = new THREE.MeshLambertMaterial( { map: texture } );

    switch ( Math.floor(Math.random() * 2) ) {
      case 0:
        shape = new Physijs.BoxMesh(
          box_geometry,
          material
        );
        break;

      case 1:
        shape = new Physijs.SphereMesh(
          sphere_geometry,
          material,
          undefined,
          { restitution: Math.random() * 1.5 }
        );
        break;
    }

    shape.material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
    shape.castShadow = true;
    shape.receiveShadow = true;

    shape.position.set(
      Math.random() * 30 - 15,
      40,
      Math.random() * 30 - 15
    );

    shape.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    shapes++;
    if (shapes < 200 && addshapes ) {
      shape.addEventListener( 'ready', createShape );
    }
    scene.add(shape);
    selectables.push(shape);

    new TWEEN.Tween(shape.material).to({opacity: 1}, 500).start();
  };

  return function() {
    setTimeout( doCreateShape, 1 );
  };
})();

function updateSimulation() {
  for (let obj of selectables) {
    if (obj.stayUpRight) {
      // make tanks drive around a bit
      moveAlignedToGround(obj);
    }
  }
  scene.simulate(undefined, 1);
  physics_stats.update();
}

function main() {
  initScene();
  initSelection();
  initUI();
}

$(main);
