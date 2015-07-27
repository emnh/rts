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
};
