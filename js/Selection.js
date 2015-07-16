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

  function mark(unit) {
    // TODO: use a Symbol for currentHex
    unit.currentHex = unit.material.emissive.getHex();
    unit.material.emissive.setHex(selectedColor);
  }

  function unmark(unit) {
    unit.material.emissive.setHex(unit.currentHex);
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
        // clear old selection
        for (const s of selection.selected) {
          unmark(s);
        }

        const raySelection = checkIntersect(options.raycaster, options.selectables, options.camera);
        if (raySelection) {
          selection.selected = [raySelection];
        }

        // rectangle select
        options.raycaster.setFromCamera(mouse, options.camera);
        const intersects = options.raycaster.intersectObject(selectionPlane);
        if (intersects.length > 0) {
          selectionRectangle.visible = true;
          selectionRectangle.position.copy(intersects[0].point);
          selectionRectangle.position.y = selectionY;
          selectionRectangle.startDragPos = intersects[0].point;
          selectionRectangle.scale.set(1, 1, 1);
        }
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
  }

  this.onMouseLeave = function() {
    selectionRectangle.visible = false;
  }

  this.getOnMouseMove = function(element) {
    const $element = $(element);
    return function(evt) {
      mouse.x = ( evt.clientX / $element.width() ) * 2 - 1;
      mouse.y = - ( evt.clientY / $element.height() ) * 2 + 1;
      options.config.debug.mouseX = mouse.x;
      options.config.debug.mouseY = mouse.y;

      if (selectionRectangle.visible) {
        options.raycaster.setFromCamera(mouse, options.camera);
        const intersects = options.raycaster.intersectObject(selectionPlane);
        if (intersects.length > 0) {
          const width = intersects[0].point.x - selectionRectangle.startDragPos.x;
          const height = intersects[0].point.z - selectionRectangle.startDragPos.z;
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
      }

      /*options.raycaster.setFromCamera(mouse, options.camera);
      const intersects = options.raycaster.intersectObject(options.ground);
      if (intersects.length > 0) {
        const pos = intersects[0].point;
        options.getGroundHeight(pos.x, pos.z);
      }*/
     //checkIntersect(options.raycaster, options.selectables, options.camera);
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
