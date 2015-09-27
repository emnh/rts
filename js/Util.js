export const Util = {
  // http://stackoverflow.com/questions/3318565/any-way-to-clone-html5-canvas-element-with-its-content
  cloneCanvas: (oldCanvas) => {
    //create a new canvas
    const newCanvas = document.createElement('canvas');
    const context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
  },

  // http://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
  arraysEqual: (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  },

  formatFloat: (f, decimals=2) => {
    const mul = Math.pow(10, decimals);
    return Math.round(f * mul) / mul;
  },

  mix: (a, b, alpha) => {
    return a + (b - a) * alpha;
  },

  isInt: (n) => {
    return Number(n) === n && n % 1 === 0;
  },

  isFloat: (n) => {
    return n === Number(n) && n % 1 !== 0;
  },

  clearLog: () => {
    const $debug = $('.debug');
    $debug.html('');
  },

  log: function(...args) {
    const $debug = $('.debug');
    let s = '';
    for (let arg of args) {
      if (Util.isFloat(arg)) {
        arg = Util.formatFloat(arg);
      }
      s += arg + ' ';
    }
    s += '<br/>';
    $debug.append(s);
  },

  createAttributeMatrix: function(geo, maxInstances) {
    geo.addAttribute(
          'a_mv0',
          new THREE.InstancedBufferAttribute(new Float32Array(maxInstances * 4), 4, 1, true)
        );
    geo.addAttribute(
          'a_mv1',
          new THREE.InstancedBufferAttribute(new Float32Array(maxInstances * 4), 4, 1, true)
        );
    geo.addAttribute(
          'a_mv2',
          new THREE.InstancedBufferAttribute(new Float32Array(maxInstances * 4), 4, 1, true)
        );
    geo.addAttribute(
          'a_mv3',
          new THREE.InstancedBufferAttribute(new Float32Array(maxInstances * 4), 4, 1, true)
        );
  },

  updateAttributeMatrix: function(geo, matrix, index) {
      const a_mv = [];
      a_mv.push(geo.getAttribute('a_mv0'));
      a_mv.push(geo.getAttribute('a_mv1'));
      a_mv.push(geo.getAttribute('a_mv2'));
      a_mv.push(geo.getAttribute('a_mv3'));
      for (let k = 0; k < a_mv.length; k++) {
        a_mv[k].setXYZW(index,
            matrix.elements[k * 4 + 0], 
            matrix.elements[k * 4 + 1], 
            matrix.elements[k * 4 + 2], 
            matrix.elements[k * 4 + 3]); 
        a_mv[k].needsUpdate = true;
      }
  },

  download: function(name, data) {
    const uri = 'data:Application/octet-stream,' + encodeURIComponent(data);
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    link.click();
  },

};
