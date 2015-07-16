export function Util() {
  function mix(a, b, alpha) {
    return a + (b - a) * alpha;
  }

  function isInt(n) {
    return Number(n) === n && n % 1 === 0;
  }

  function clearLog() {
    const $debug = $('.debug');
    $debug.html('');
  }

  function log(...args) {
    const $debug = $('.debug');
    let s = '';
    for (let arg of args) {
      if (isFloat(arg)) {
        arg = formatFloat(arg);
      }
      s += arg + ' ';
    }
    s += '<br/>';
    $debug.append(s);
  }
};
