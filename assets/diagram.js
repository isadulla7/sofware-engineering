// Arxitektura chizmalari uchun umumiy yordamchilar.
// DG.S(svg, teg, atributlar, matn, ota)  SVG element yaratadi
// DG.marker(svg, id)                     strelka uchi
// DG.group(svg, x, y, w, h, nom)         punktir ramkali guruh, burchagida yorliq
// DG.box(svg, x, y, w, h, nom, izoh, cls) ikki qator yozuvli quti
window.DG = (function () {
  var NS = 'http://www.w3.org/2000/svg';
  function S(svg, tag, attrs, text, parent) { var e = document.createElementNS(NS, tag), a; for (a in attrs) e.setAttribute(a, attrs[a]); if (text !== undefined && text !== null) e.textContent = text; (parent || svg).appendChild(e); return e; }
  function marker(svg, id) { var d = S(svg, 'defs', {}), m = S(svg, 'marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto' }, null, d); S(svg, 'path', { d: 'M0 0L10 5L0 10z', 'class': 'mk' }, null, m); }
  function group(svg, x, y, w, h, title) { S(svg, 'rect', { x: x, y: y, width: w, height: h, rx: 4, 'class': 'grp' }); S(svg, 'rect', { x: x, y: y, width: title.length * 8.4 + 22, height: 24, 'class': 'tab' }); S(svg, 'text', { x: x + 10, y: y + 17, 'class': 'tabt' }, title); }
  function box(svg, x, y, w, h, title, sub, cls) { S(svg, 'rect', { x: x, y: y, width: w, height: h, rx: 5, 'class': 'box' + (cls ? ' ' + cls : '') }); S(svg, 'text', { x: x + 16, y: y + 28, 'class': 'ttl' }, title); if (sub) S(svg, 'text', { x: x + 16, y: y + 47, 'class': 'sub' }, sub); }
  // DG.stack(svgId, qavatlar, faol, yorliq): yuqoridan pastga qavatlar ustuni.
  // qavatlar: [{ title, sub, ex, link }], link = shu qavatdan pastdagisiga boradigan strelka yozuvi
  // faol: shu dars qaysi qavat(lar) haqida ekani (indekslar)
  function stack(svgId, layers, active, label) {
    var svg = document.getElementById(svgId), H = 30 + layers.length * 88;
    svg.setAttribute('viewBox', '0 0 1240 ' + H); svg.style.width = '1240px'; svg.style.height = H + 'px';
    marker(svg, svgId + 'mk');
    layers.forEach(function (l, i) {
      var y = 20 + i * 88, on = active.indexOf(i) !== -1;
      box(svg, 40, y, 430, 62, l.title, l.sub, on ? 'on' : '');
      S(svg, 'text', { x: 500, y: y + 28, 'class': 'sub' }, 'Misolda:');
      S(svg, 'text', { x: 500, y: y + 48, 'class': 'mono' }, l.ex);
      if (i < layers.length - 1) {
        S(svg, 'line', { x1: 255, y1: y + 62, x2: 255, y2: y + 86, 'class': 'arr', 'marker-end': 'url(#' + svgId + 'mk)' });
        S(svg, 'text', { x: 267, y: y + 79, 'class': 'lbl' }, l.link);
      }
    });
    var first = Math.min.apply(null, active), last = Math.max.apply(null, active);
    var y1 = 20 + first * 88, y2 = 20 + last * 88 + 62;
    S(svg, 'path', { d: 'M930 ' + y1 + 'h14v' + (y2 - y1) + 'h-14', 'class': 'arr' });
    S(svg, 'rect', { x: 960, y: (y1 + y2) / 2 - 31, width: 250, height: 62, rx: 5, 'class': 'box live' });
    S(svg, 'text', { x: 976, y: (y1 + y2) / 2 - 5, 'class': 'ttl' }, 'Bu dars shu yerda');
    S(svg, 'text', { x: 976, y: (y1 + y2) / 2 + 15, 'class': 'sub' }, label);
  }
  return { S: S, marker: marker, group: group, box: box, stack: stack };
})();
