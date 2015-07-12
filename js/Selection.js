const jQuery = require('jquery');
const $ = jQuery;

export function Selection() {

  this.getOnMouseMove = function(mouse, element) {
    const $mouseinfo = $(".mouseinfo");
    const $element = $(element);
    return function(evt) {
      mouse.x = ( evt.clientX / $element.width() ) * 2 - 1;
      mouse.y = - ( evt.clientY / $element.height() ) * 2 + 1;
      $mouseinfo.html(`<h4>Mouse</h4><div>X: ${mouse.x}</div><div>Y: ${mouse.y}</div>`);
    };
  };
}
