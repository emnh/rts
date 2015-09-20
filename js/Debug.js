const $ = require('jquery');

export const Debug = {

  debugLoadMarkers: function(scene) {
    function loadMarker(color) {
      const geometry = new THREE.BoxGeometry(4, 4, 4);
      const material = new THREE.MeshLambertMaterial({ color: color });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return mesh;
    }
    this.redMarker = loadMarker(0xFF0000);
    this.blueMarkers = [];
    blueMarkers.push(loadMarker(0x0000FF));
    blueMarkers.push(loadMarker(0x0000FF));
    blueMarkers.push(loadMarker(0x0000FF));
    blueMarkers.push(loadMarker(0x0000FF));
  },

  drawOutLine: function(units, worldToScreen, canvas, camera) {
    const frustum = new THREE.Frustum();
    const cameraViewProjectionMatrix = new THREE.Matrix4();
    camera.updateMatrixWorld(); // make sure the camera matrix is updated
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromMatrix(cameraViewProjectionMatrix);

    const viewport = $('#viewport');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = "1";
    ctx.strokeStyle = "black";
    ctx.beginPath();
    for (let unit of units) {
      if (!frustum.intersectsObject(unit)) {
        continue;
      }
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
      const left = screenBox.min.x;
      const top = screenBox.min.y;
      const width = screenBox.max.x - screenBox.min.x;
      const height = screenBox.max.y - screenBox.min.y;
      ctx.rect(left, top, width, height);
    }
    ctx.stroke();
  }

}
