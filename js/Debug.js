export function Debug() {
  function debugLoadMarkers(scene) {
    function loadMarker(color) {
      const geometry = new THREE.BoxGeometry(4, 4, 4);
      const material = new THREE.MeshLambertMaterial({ color: color });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return mesh;
    }
    redMarker = loadMarker(0xFF0000);
    const blueMarkers = [];
    blueMarkers.push(loadMarker(0x0000FF));
    blueMarkers.push(loadMarker(0x0000FF));
    blueMarkers.push(loadMarker(0x0000FF));
    blueMarkers.push(loadMarker(0x0000FF));
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
      div.css({
        position: 'absolute',
        left,
        top,
        height,
        width,
        border: '1px solid black',
      });
    }
  }

}
