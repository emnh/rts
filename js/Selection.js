const jQuery = require('jquery');
const $ = jQuery;

export function Selection(options) {

  const leftMouseButton = 1;
  const rightMouseButton = 3;
  let intersected;
  let selected = [];
  const mouse = {};

  function checkIntersect(raycaster, selectables, camera) {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(selectables);

    if (intersects.length > 0) {
      if (intersected != intersects[0].object) {
        if (intersected) intersected.material.emissive.setHex(intersected.currentHex);
        intersected = intersects[0].object;
        intersected.currentHex = intersected.material.emissive.getHex();
        intersected.material.emissive.setHex(0xff0000);
      }
    } else {
      if (intersected) intersected.material.emissive.setHex(intersected.currentHex);
      intersected = null;
    }
    return intersected;
  }
  this.getOnMouseDown = function() {
    return function(eventData) {
      if (eventData.which === leftMouseButton) {
        const raySelection = checkIntersect(options.raycaster, options.selectables, options.camera);
        if (raySelection) {
          selected = [raySelection];
        }
      }
      if (eventData.which === rightMouseButton) {
        const raycaster = options.raycaster;
        const camera = options.camera;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(options.ground);
        if (intersects.length > 0) {
          const obj = selected[0];
          obj.position.copy(intersects[0].point);
          //obj.position.y += obj.geometry.boundingSphere.radius * obj.geometry.scale.y;
          //const height = (obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y) * obj.scale.y;
          const height = obj.geometry.boundingBox.max.y * obj.scale.y;
          obj.position.y += height;
          obj.__dirtyPosition = true;
        }
      }
    };
  }

  this.getOnMouseMove = function(config, element) {
    const $element = $(element);
    return function(evt) {
      mouse.x = ( evt.clientX / $element.width() ) * 2 - 1;
      mouse.y = - ( evt.clientY / $element.height() ) * 2 + 1;
      config.debug.mouseX = mouse.x;
      config.debug.mouseY = mouse.y;
      //checkIntersect(options.raycaster, options.selectables, options.camera);
    };
  };
}
