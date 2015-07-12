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
  renderer, render_stats, physics_stats, scene, light, ground, ground_geometry, ground_material, camera;
const controlsHeight = 250;
let sceneWidth = window.innerWidth;
let sceneHeight = window.innerHeight - controlsHeight; 
//$(".controls").css({ height: controlsHeight + "px" });
var raycaster;
const selectables = [];
let cameraControls;
let moveSkybox;

const config = {
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

function isObject(obj) {
  return Object.prototype.toString.call(obj) == '[object Object]';
}

function loadSkyBox() {
  const cubeMap = new THREE.Texture([]);
  cubeMap.format = THREE.RGBFormat;
  cubeMap.flipY = false;

  const loader = new THREE.ImageLoader();
  loader.load( 'images/sky.jpg', function(image) {
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
  scene.setGravity(new THREE.Vector3( 0, -100, 0 ));
  scene.addEventListener(
    'update',
    function() {
      scene.simulate( undefined, 2 );
      physics_stats.update();
    }
  );

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
    new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'images/grass.png' ) }),
    .8, // high friction
    .4 // low restitution
  );
  ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
  //ground_material.map.repeat.set( 2.5, 2.5 );
  ground_material.map.repeat.set( 10.0, 10.0 );

  // Ground
  NoiseGen = new SimplexNoise;

  const xFaces = 100;
  const yFaces = 100;
  const groundScale = 50;
  ground_geometry = new THREE.PlaneGeometry(1000, 1000, xFaces, yFaces);
  for ( var i = 0; i < ground_geometry.vertices.length; i++ ) {
    var vertex = ground_geometry.vertices[i];
    vertex.z = NoiseGen.noise( vertex.x / 100, vertex.y / 100 ) * 16;
  }
  ground_geometry.computeFaceNormals();
  ground_geometry.computeVertexNormals();

  ground = new Physijs.HeightfieldMesh(
    ground_geometry,
    ground_material,
    0, // mass
    xFaces,
    yFaces
  );
  ground.rotation.x = Math.PI / -2;
  ground.receiveShadow = true;
  //ground.scale.set(groundScale, groundScale, groundScale);
  scene.add(ground);

  const skyBox = loadSkyBox();
  scene.add(skyBox);
  moveSkybox = function() {
    skyBox.position.x = camera.position.x;
    skyBox.position.x = camera.position.y;
    skyBox.position.z = camera.position.z;
  };

  // Camera and controls
  
  // Construct semi-infinite plane, since MapControls doesn't work well with height map mesh
  const plane = new THREE.PlaneGeometry(10000, 10000, 1, 1);
  const planeMesh = new THREE.Mesh(plane, new THREE.MeshLambertMaterial());

  planeMesh.rotation.x = ground.rotation.x;
  planeMesh.visible = false;
  cameraControls = new MapControls(camera, planeMesh, () => null, renderer.domElement);
  cameraControls.minDistance = 10;
  cameraControls.maxDistance = 1000;
  camera.position.set(107, 114, 82);
  camera.lookAt(scene.position);
  scene.add(planeMesh);

  requestAnimationFrame(render);
  scene.simulate();

  createShape();
};

function initSelection() {
  const mouseElement = renderer.domElement;
  const selector = new Selection({
    raycaster,
    selectables,
    camera,
    ground
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

render = function() {
  updateCameraInfo();
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
    var texture = THREE.ImageUtils.loadTexture( 'images/bricks.jpg' );
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
      20,
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

function main() {
  initScene();
  initSelection();
  initUI();
}

$(main);
