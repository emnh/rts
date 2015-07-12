/*jslint browser: true, es6: true */

/* global
 * $, THREE, Stats, Physijs, TWEEN
 */

const jQuery = require('jquery');
const $ = jQuery;
global.jQuery = jQuery;
const bootstrap = require('bootstrap');

Physijs.scripts.worker = 'jscache/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var initScene, render, createShape, NoiseGen,
  renderer, render_stats, physics_stats, scene, light, ground, ground_geometry, ground_material, camera;
var INTERSECTED, mouse = {};
const controlsHeight = 250;
const sceneWidth = window.innerWidth;
const sceneHeight = window.innerHeight - controlsHeight; 
//$(".controls").css({ height: controlsHeight + "px" });
var raycaster;
const selectable = [];

initScene = function() {
  
  $(".controls").height(controlsHeight);
  
  TWEEN.start();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sceneWidth, sceneHeight);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  document.getElementById('viewport').appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();

  render_stats = new Stats();
  render_stats.domElement.style.position = 'absolute';
  render_stats.domElement.style.top = '0px';
  render_stats.domElement.style.zIndex = 100;
  document.getElementById( 'viewport' ).appendChild( render_stats.domElement );

  physics_stats = new Stats();
  physics_stats.domElement.style.position = 'absolute';
  physics_stats.domElement.style.top = '50px';
  physics_stats.domElement.style.zIndex = 100;
  document.getElementById( 'viewport' ).appendChild( physics_stats.domElement );

  scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
  scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
  scene.addEventListener(
    'update',
    function() {
      scene.simulate( undefined, 2 );
      physics_stats.update();
    }
  );

  const frustumFar = 10000;
  const frustumNear = 1;
  camera = new THREE.PerspectiveCamera(
    35,
    sceneWidth / sceneHeight,
    frustumNear,
    frustumFar
  );
  //camera = new THREE.OrthographicCamera(sceneWidth / -2, sceneWidth / 2, sceneHeight / -2, sceneHeight, 1, 10000);
  //const controls = new THREE.OrbitControls(camera, renderer.domElement);


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
  ground_material.map.repeat.set( 2.5, 2.5 );

  // Ground
  NoiseGen = new SimplexNoise;

  const xFaces = 100;
  const yFaces = 100;
  const groundScale = 50;
  ground_geometry = new THREE.PlaneGeometry(250, 250, xFaces, yFaces);
  for ( var i = 0; i < ground_geometry.vertices.length; i++ ) {
    var vertex = ground_geometry.vertices[i];
    vertex.z = NoiseGen.noise( vertex.x / 10, vertex.y / 10 ) * 4;
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

  // Camera and controls
  
  // Construct semi-infinite plane, since MapControls doesn't work well with height map mesh
  const plane = new THREE.PlaneGeometry(10000, 10000, 1, 1);
  const planeMesh = new THREE.Mesh(plane, new THREE.Material());

  planeMesh.rotation.x = ground.rotation.x;
  const controls = new MapControls(camera, planeMesh, () => null, renderer.domElement);
  controls.minDistance = 10;
  controls.maxDistance = 1000;
  camera.position.set(107, 114, 82);
  //camera.rotation.set(-0.94, 0.65, 0.70);
  camera.lookAt(scene.position);
  scene.add(planeMesh);

  requestAnimationFrame(render);
  scene.simulate();

  createShape();

  const mouseElement = renderer.domElement;
  $(mouseElement).mousemove(getOnMouseMove(mouseElement));
};

function checkIntersect(raycaster, selectable, mouse, camera) {
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects(selectable);

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );

    }

  } else {

    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;

  }
}

function getOnMouseMove(element) {
  const $mouseinfo = $(".mouseinfo");
  const $element = $(element);
  return function(evt) {
    mouse.x = ( evt.clientX / $element.width() ) * 2 - 1;
    mouse.y = - ( evt.clientY / $element.height() ) * 2 + 1;
    $mouseinfo.html(`<h4>Mouse</h4><div>X: ${mouse.x}</div><div>Y: ${mouse.y}</div>`);
  };
}

function updateCameraInfo() {
  const $cameraInfo = $(".camerainfo");
  const x = camera.position.x;
  const y = camera.position.y;
  const z = camera.position.z;
  const xr = camera.rotation.x;
  const yr = camera.rotation.y;
  const zr = camera.rotation.z;
  let s = "<h4>Camera</h4>";
  s += `<div>X: ${x}, ${xr}</div>`;
  s += `<div>Y: ${y}, ${yr}</div>`;
  s += `<div>Z: ${z}, ${zr}</div>`;
  $cameraInfo.html(s);
}

render = function() {
  updateCameraInfo();
  checkIntersect(raycaster, selectable, mouse, camera);
  renderer.render(scene, camera);
  render_stats.update();
  requestAnimationFrame(render);
};

createShape = (function() {
  var addshapes = true,
    shapes = 0,
    box_geometry = new THREE.CubeGeometry( 3, 3, 3 ),
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
    if (shapes < 100 && addshapes ) {
      shape.addEventListener( 'ready', createShape );
    }
    scene.add(shape);
    selectable.push(shape);

    new TWEEN.Tween(shape.material).to({opacity: 1}, 500).start();
  };

  return function() {
    setTimeout( doCreateShape, 1 );
  };
})();

$(initScene);
