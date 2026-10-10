// Texnologiya bosqichlari (og'riq -> javob) ko'rsatkichi. Ishlatilishi: window.evoStepper(elementId, bosqichlar)
(function () {
  function evo(id, items) {
    var root = document.getElementById(id);
    var tabs = document.createElement('div'); tabs.className = 'evo-tabs';
    var body = document.createElement('div'); body.className = 'evo-body'; body.setAttribute('aria-live', 'polite');
    var nav = document.createElement('div'); nav.className = 'evo-nav';
    var prev = document.createElement('button'); prev.type = 'button'; prev.textContent = 'Oldingisi';
    var next = document.createElement('button'); next.type = 'button'; next.textContent = 'Keyingisi';
    nav.appendChild(prev); nav.appendChild(next);
    root.appendChild(tabs); root.appendChild(body); root.appendChild(nav);
    var idx = 0, btns = [];
    items.forEach(function (it, i) {
      var b = document.createElement('button'); b.type = 'button';
      b.textContent = (i + 1) + '. ' + it.name;
      b.addEventListener('click', function () { idx = i; render(); });
      tabs.appendChild(b); btns.push(b);
    });
    function row(label, text, cls) {
      return text ? '<dt' + (cls ? ' class="' + cls + '"' : '') + '>' + label + '</dt><dd>' + text + '</dd>' : '';
    }
    function render() {
      var it = items[idx];
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === idx ? 'true' : 'false'); });
      body.innerHTML =
        '<svg viewBox="0 0 120 100" aria-hidden="true">' + it.art + '</svg>' +
        '<div><h4>' + it.name + '</h4><p class="years">' + it.years + '</p><dl>' +
        row('Qanday ishlaydi', it.how) +
        row('Oldingisidan nimasi yaxshi', it.better) +
        row('Og\'rig\'i', it.pain, 'pain') +
        row('Misollar', it.ex) +
        '</dl></div>';
      prev.disabled = idx === 0;
      next.disabled = idx === items.length - 1;
    }
    prev.addEventListener('click', function () { if (idx > 0) { idx--; render(); } });
    next.addEventListener('click', function () { if (idx < items.length - 1) { idx++; render(); } });
    render();
  }

  window.evoStepper = evo;
})();
