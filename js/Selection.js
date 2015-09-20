const jQuery = require('jquery');
const $ = jQuery;

export function Selection(options) {

  const leftMouseButton = 1;
  const rightMouseButton = 3;
  let intersected;
  this.selected = [];
  const mouse = {};
  const selection = this;
  const selectedColor = 0xff0000;

  const selectionY = options.config.terrain.maxElevation;
  
  // plane for intersecting mouse cursor to select units
  const selectionPlaneGeometry = new THREE.PlaneBufferGeometry(options.config.terrain.width, options.config.terrain.height, 1, 1);
  selectionPlaneGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));
  const selectionPlaneMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  const selectionPlane = new THREE.Mesh(selectionPlaneGeometry, selectionPlaneMaterial);
  selectionPlane.visible = false;
  selectionPlane.position.y = selectionY;
  options.scene.add(selectionPlane);

  const selectionRectangleGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  selectionRectangleGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / -2));
  const selectionRectangleMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00, opacity: 0.5, transparent: true });
  const selectionRectangle = new THREE.Mesh(selectionRectangleGeometry, selectionRectangleMaterial);
  selectionRectangle.position.y = selectionY;
  selectionRectangle.visible = false;
  options.scene.add(selectionRectangle);

  const $selectionDiv = $('<div/>').css({
    visibility: 'hidden'
  })
    .addClass("selectionRect")
    .appendTo('#viewport')
    .mouseup((evt) => {
      // needed because mouseup may be received on it instead
      $selectionDiv.css({
        visibility: 'hidden'
      });
    })
    .mousemove((evt) => {
      rectangleSelect(evt);
    });;

  function getScreenBoxes() {
    const screenBoxes = [];
    for (let unit of options.game.units) {
      const geometry = unit.bboxMesh.geometry.clone();
      const mat = new THREE.Matrix4().makeRotationFromQuaternion(unit.quaternion);
      geometry.applyMatrix(mat);
      const screenBox = new THREE.Box2();

      // test
      // const vec2 = options.worldToScreen(unit.position);
      // screenBox.expandByPoint(vec2);

      for (let vertex of geometry.vertices) {
        const pos = vertex.clone().multiply(unit.scale).add(unit.position);
        const vec2 = options.worldToScreen(pos);
        screenBox.expandByPoint(vec2);
      }
      const box = [screenBox.min.x, screenBox.min.y, screenBox.max.x, screenBox.max.y];
      box.unit = unit;
      screenBoxes.push(box);
    }
    return screenBoxes;
  }

  function checkIntersectScreen(x1, y1, x2, y2) {
    const screenBoxes = getScreenBoxes();
    const flatSelectionBox = [x1, y1, x2, y2];
    const selectedIndices = options.boxIntersect(screenBoxes, [flatSelectionBox]);
    for (const s of selection.selected) {
      options.unmark(s);
    }
    selection.selected.length = 0;
    for (const [i, j] of selectedIndices) {
      const unit = screenBoxes[i].unit;
      options.mark(unit);
      selection.selected.push(unit);
    }
  }

  this.getOnMouseDown = function() {
    return function(eventData) {
      eventData.preventDefault();
      if (eventData.which === leftMouseButton) {
        // clear old selection
        for (const s of selection.selected) {
          options.unmark(s);
        }

        const eps = 1;
        const x = eventData.clientX;
        const y = eventData.clientY;
        checkIntersectScreen(x - eps, y - eps, x + eps, y + eps);
        $selectionDiv.startPos = [x, y];
        $selectionDiv.css({
          visibility: 'visible',
          position: 'absolute',
          left: x, 
          top: y,
          width: eps,
          height: eps,
        });
      }
      if (eventData.which === rightMouseButton) {
        const raycaster = options.raycaster;
        const camera = options.camera;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(options.ground);
        if (intersects.length > 0 && selection.selected.length > 0) {
          for (const unit of selection.selected) {
            options.placeUnit(unit, intersects[0].point);
          }
        }
      }
    };
  }

  this.onMouseUp = function(evt) {
    evt.preventDefault();
    selectionRectangle.visible = false;
    $selectionDiv.css({
      'visibility': 'hidden'
    });
  }

  this.onMouseLeave = function() {
    selectionRectangle.visible = false;
  }

  function rectangleSelect(evt) {
    // rectangle select in screen coordinates
    if ($selectionDiv.css('visibility') === 'visible') {
      let x1 = $selectionDiv.startPos[0];
      let y1 = $selectionDiv.startPos[1];
      let x2 = evt.clientX;
      let y2 = evt.clientY;
      if (x2 < x1) {
        [x1, x2] = [x2, x1];
      }
      if (y2 < y1) {
        [y1, y2] = [y2, y1];
      }
      $selectionDiv.css({
        position: 'absolute',
        left: x1,
        top: y1,
        width: x2 - x1,
        height: y2 - y1,
      });

      checkIntersectScreen(x1, y1, x2, y2);
    }
  }

  this.getOnMouseMove = function(element) {
    const $element = $(element);
    return function(evt) {
      mouse.x = ( evt.clientX / $element.width() ) * 2 - 1;
      mouse.y = - ( evt.clientY / $element.height() ) * 2 + 1;
      options.config.debug.mouseX = mouse.x;
      options.config.debug.mouseY = mouse.y;

      // rectangle select in screen coordinates
      rectangleSelect(evt);
    };
  };

  const mouseElement = options.mouseElement;

  const handler = selection.getOnMouseMove(mouseElement);
  $(mouseElement).mousemove(handler);

  const downHandler = selection.getOnMouseDown();
  $(mouseElement).mousedown(downHandler);

  $(mouseElement).mouseup(selection.onMouseUp);
  $(mouseElement).mouseleave(selection.onMouseLeave);

  $(mouseElement).on('contextmenu', (evt) => {
    console.log("overlayCanvas preventDefault contextmenu");
    evt.preventDefault();
  });
}
