// Arxitektura chizmalari uchun umumiy yordamchilar.
// DG.S(svg, teg, atributlar, matn, ota)  SVG element yaratadi
// DG.marker(svg, id)                     strelka uchi
// DG.group(svg, x, y, w, h, nom)         punktir ramkali guruh, burchagida yorliq
// DG.box(svg, x, y, w, h, nom, izoh, cls) ikki qator yozuvli quti
window.DG = (function () {
  var NS = 'http://www.w3.org/2000/svg';
  function S(svg, tag, attrs, text, parent) { var e = document.createElementNS(NS, tag), a; for (a in attrs) e.setAttribute(a, attrs[a]); if (text !== undefined && text !== null) e.textContent = text; (parent || svg).appendChild(e); return e; }
  function marker(svg, id) { var d = S(svg, 'defs', {}), m = S(svg, 'marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto' }, null, d); S(svg, 'path', { d: 'M0 0L10 5L0 10z', 'class': 'mk' }, null, m); }
  function group(svg, x, y, w, h, title) { S(svg, 'rect', { x: x, y: y, width: w, height: h, rx: 4, 'class': 'grp' }); S(svg, 'rect', { x: x, y: y, width: title.length * 7.6 + 20, height: 24, 'class': 'tab' }); S(svg, 'text', { x: x + 10, y: y + 17, 'class': 'tabt' }, title); }
  function box(svg, x, y, w, h, title, sub, cls) { S(svg, 'rect', { x: x, y: y, width: w, height: h, rx: 5, 'class': 'box' + (cls ? ' ' + cls : '') }); S(svg, 'text', { x: x + 16, y: y + 28, 'class': 'ttl' }, title); if (sub) S(svg, 'text', { x: x + 16, y: y + 47, 'class': 'sub' }, sub); }
  return { S: S, marker: marker, group: group, box: box };
})();
