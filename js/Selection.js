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

  function mark(unit) {
    // TODO: use a Symbol for currentHex
    unit.currentHex = unit.material.emissive.getHex();
    unit.material.emissive.setHex(selectedColor);
  }

  function unmark(unit) {
    unit.material.emissive.setHex(unit.currentHex);
  }

  function getScreenBoxes() {
    const screenBoxes = [];
    for (let unit of options.selectables) {
      const geometry = unit.bboxMesh.geometry.clone();
      const mat = new THREE.Matrix4().makeRotationFromQuaternion(unit.quaternion);
      geometry.applyMatrix(mat);
      const screenBox = new THREE.Box2();
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
      unmark(s);
    }
    selection.selected.length = 0;
    for (const [i, j] of selectedIndices) {
      const unit = screenBoxes[i].unit;
      mark(unit);
      selection.selected.push(unit);
    }
  }

  function checkIntersectRect(from, to) {
    const width = to.x - from.x;
    const height = to.y - from.y;
    const awidth = Math.abs(width);
    const aheight = Math.abs(height);
    if (awidth > 0) {
      selectionRectangle.scale.x = awidth;
    }
    if (aheight > 0) {
      selectionRectangle.scale.z = aheight;
    }
    selectionRectangle.position.copy(selectionRectangle.startDragPos)
    selectionRectangle.position.x += width / 2;
    selectionRectangle.position.y = selectionY;
    selectionRectangle.position.z += height / 2;

    const oldPos = selectionRectangle.startDragPos;
    oldPos.y = -1000;
    const newPos = new THREE.Vector3(width, 1000, height);
    newPos.add(selectionRectangle.startDragPos);
    newPos.y = 1000;
    const bboxes = options.getBBoxes();
    const selectionBox = new THREE.Box3();
    selectionBox.setFromPoints([selectionRectangle.startDragPos, newPos]);
    const flatSelectionBox = selectionBox.min.toArray().concat(selectionBox.max.toArray());
    const selectedIndices = options.boxIntersect(bboxes, [flatSelectionBox]);
    for (const s of selection.selected) {
      unmark(s);
    }
    selection.selected.length = 0;
    for (const [i, j] of selectedIndices) {
      const unit = bboxes[i].unit;
      mark(unit);
      selection.selected.push(unit);
    }
  }

  function checkIntersect(raycaster, selectables, camera) {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(selectables);

    if (intersects.length > 0) {
      if (intersected != intersects[0].object) {
        if (intersected) unmark(intersected);
        intersected = intersects[0].object;
        mark(intersected)
      }
    } else {
      if (intersected) unmark(intersected);
      intersected = null;
    }
    return intersected;
  }

  this.getOnMouseDown = function() {
    return function(eventData) {
      if (eventData.which === leftMouseButton) {
        event.preventDefault();

        // clear old selection
        for (const s of selection.selected) {
          unmark(s);
        }

        /*const raySelection = checkIntersect(options.raycaster, options.selectables, options.camera);
        if (raySelection) {
          selection.selected = [raySelection];
        }*/

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

        // rectangle select in world coordinates
        /*
        options.raycaster.setFromCamera(mouse, options.camera);
        const intersects = options.raycaster.intersectObject(selectionPlane);
        if (intersects.length > 0) {
          selectionRectangle.visible = true;
          selectionRectangle.position.copy(intersects[0].point);
          selectionRectangle.position.y = selectionY;
          selectionRectangle.startDragPos = intersects[0].point;
          selectionRectangle.scale.set(1, 1, 1);
        }
        */
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

  this.onMouseUp = function() {
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

      // rectangle select in world coordinates
      rectangleSelect(evt);

      /*
      if (selectionRectangle.visible) {
        options.raycaster.setFromCamera(mouse, options.camera);
        const intersects = options.raycaster.intersectObject(selectionPlane);
        if (intersects.length > 0) {
          const from = new THREE.Vector2(
              selectionRectangle.startDragPos.x,
              selectionRectangle.startDragPos.z);
          const to = new THREE.Vector2(
              intersects[0].point.x,
              intersects[0].point.z);
          checkIntersectRect(from, to);
        }
      }
      */
    };
  };

  const mouseElement = options.mouseElement;

  const handler = selection.getOnMouseMove(mouseElement);
  $(mouseElement).mousemove(handler);

  const downHandler = selection.getOnMouseDown();
  $(mouseElement).mousedown(downHandler);

  $(mouseElement).mouseup(selection.onMouseUp);
  $(mouseElement).mouseleave(selection.onMouseLeave);
}
