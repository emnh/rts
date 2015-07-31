export const Util = {
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
        arg = formatFloat(arg);
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
