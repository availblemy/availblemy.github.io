// 给 CSS/JS 自动加版本号，每次 build 强制浏览器刷新缓存

hexo.extend.filter.register('after_render:html', function (str, data) {
  const version = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  str = str.replace(/("\/css\/[^"]+\.css)"/g, `$1?v=${version}"`);
  str = str.replace(/("\/js\/[^"]+\.js)"/g, `$1?v=${version}"`);
  return str;
});
