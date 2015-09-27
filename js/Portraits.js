const Util = require('./Util.js').Util;

export function Portraits(options) {

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, options.width / options.height, 1, 10000);
  camera.position.set(-12, 12, 12);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const light = new THREE.AmbientLight(0xFFFFFF);
  //light.position.set(5, 10, -4);
  scene.add(light);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(options.width, options.height);
  renderer.setClearColor(0xffffff, 1);

  this.renderUnit = function(unit) {
    const geometry = unit.model.geometry;
    const material = unit.model.material.clone();
    //const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const unitClone = new THREE.Mesh(geometry, material);

    scene.add(unitClone);

    renderer.render(scene, camera);

    scene.remove(unitClone);

    return Util.cloneCanvas(renderer.domElement);
  }
}
