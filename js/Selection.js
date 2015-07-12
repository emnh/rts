const jQuery = require('jquery');
const $ = jQuery;

export function Selection() {

  this.getOnMouseMove = function(config, mouse, element) {
    const $element = $(element);
    return function(evt) {
      mouse.x = ( evt.clientX / $element.width() ) * 2 - 1;
      mouse.y = - ( evt.clientY / $element.height() ) * 2 + 1;
      config.debug.mouseX = mouse.x;
      config.debug.mouseY = mouse.y;
    };
  };
}
