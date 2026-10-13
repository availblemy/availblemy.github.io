// isdebugpresent.js — 检测浏览器是否打开开发者工具
// 用于首页反调试（可选启用）
// 使用：在 index.njk 的 <script> 中引入此文件

(function () {
  'use strict';

  var devtools = { open: false, orientation: null };
  var threshold = 160;
  var emitEvent = function (state, orientation) {
    window.dispatchEvent(new CustomEvent('devtoolschange', {
      detail: { open: state, orientation: orientation }
    }));
  };

  setInterval(function () {
    var widthThreshold = window.outerWidth - window.innerWidth > threshold;
    var heightThreshold = window.outerHeight - window.innerHeight > threshold;
    var orientation = widthThreshold ? 'vertical' : 'horizontal';

    if (!(heightThreshold && widthThreshold) &&
        ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
      if (!devtools.open || devtools.orientation !== orientation) {
        emitEvent(true, orientation);
      }
      devtools.open = true;
      devtools.orientation = orientation;
    } else if (devtools.open) {
      emitEvent(false, null);
      devtools.open = false;
      devtools.orientation = null;
    }
  }, 500);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = devtools;
  }
})();
