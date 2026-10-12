// Darsni ovoz chiqarib o'qish. Brauzerdagi o'zbekcha ovozdan foydalanadi
// (Microsoft Edge'da: Madina va Sardor neyron ovozlari). Sahifaga qo'shish:
// <script src="../assets/listen.js"></script>
(function () {
  var synth = window.speechSynthesis, main = document.querySelector('main');
  if (!main) return;
  var SEL = 'h1, h2, h3, h4, p, li, dt, dd, figcaption, summary, td, th';
  var SKIP = 'svg, pre, script, style, .say, .crumbs, .pager, .controls, .slider, .evo-tabs, .pick-label, .listen, button, #quiz, .bench, .scope, .toc';

  function blocks() {
    var out = [];
    main.querySelectorAll(SEL).forEach(function (el) {
      if (el.closest(SKIP)) return;
      if (el.querySelector('p, li, dt, dd, ul, ol')) return; // ichida boshqa blok bor: o'zi emas, ichidagilari o'qiladi
      if (el.closest('figure') && el.tagName !== 'FIGCAPTION') return;
      var c = el.cloneNode(true); c.querySelectorAll('.part, .tag').forEach(function (x) { x.textContent += '. '; });
      var t = clean(c.textContent); if (t.length < 2) return;
      out.push({ el: el, t: t });
    });
    return out;
  }
  function clean(t) {
    t = t.replace(/\s+/g, ' ').trim();
    for (var i = 0; i < 3; i++) t = t.replace(/(\d) (\d{3})(?!\d)/g, '$1$2'); // 2 147 483 647 -> 2147483647
    t = t.replace(/[«»"]/g, '').replace(/−/g, 'minus ').replace(/×/g, ' ko\'paytiruv ').replace(/≈/g, 'taxminan ');
    return t;
  }
  function pieces(t) { // uzun matnni gaplarga bo'lish: ba'zi brauzerlar uzun matnni yarmida to'xtatadi
    var s = t.match(/[^.!?]+[.!?]*\s*/g) || [t], out = [], cur = '';
    s.forEach(function (x) { if ((cur + x).length > 220 && cur) { out.push(cur); cur = x; } else cur += x; });
    if (cur.trim()) out.push(cur);
    return out;
  }

  var bar = document.createElement('div'); bar.className = 'listen';
  bar.innerHTML =
    '<button type="button" data-a="play">Tinglash</button>' +
    '<button type="button" data-a="prev" title="Oldingi bo\'lak">Orqaga</button>' +
    '<button type="button" data-a="next" title="Keyingi bo\'lak">Oldinga</button>' +
    '<button type="button" data-a="stop">To\'xtatish</button>' +
    '<label>Tezlik <select data-a="rate"><option>0.8</option><option selected>1</option><option>1.15</option><option>1.3</option><option>1.5</option></select></label>' +
    '<label>Ovoz <select data-a="voice"></select></label>' +
    '<span class="listen-st" aria-live="polite"></span>';
  var lead = main.querySelector('.lead') || main.querySelector('h1');
  lead.parentNode.insertBefore(bar, lead.nextSibling);
  var $ = function (a) { return bar.querySelector('[data-a="' + a + '"]'); }, st = bar.querySelector('.listen-st');

  if (!synth) { st.textContent = 'Bu brauzer ovoz chiqarib o\'qishni qo\'llamaydi. Microsoft Edge\'da oching.'; bar.classList.add('off'); return; }

  var voices = [], B = [], idx = 0, part = 0, parts = [], playing = false, paused = false;
  function loadVoices() {
    var all = synth.getVoices();
    voices = all.filter(function (v) { return /^uz/i.test(v.lang); });
    voices.sort(function (a, b) { return score(b) - score(a); });
    var sel = $('voice'); sel.innerHTML = '';
    voices.forEach(function (v, i) { var o = document.createElement('option'); o.value = i; o.textContent = v.name.replace(/^Microsoft /, '').replace(/ Online \(Natural\)/, ''); sel.appendChild(o); });
    if (!voices.length) { st.textContent = all.length ? 'Bu brauzerda o\'zbekcha ovoz yo\'q. Sahifani Microsoft Edge\'da oching: unda Madina va Sardor ovozlari bor.' : 'Ovozlar yuklanmoqda...'; }
    else if (!playing) st.textContent = 'O\'qishni boshlash uchun «Tinglash» ni bosing. O\'qish paytida istalgan xatboshini bossangiz, o\'sha joydan davom etadi.';
  }
  function score(v) { return (/natural|online|neural/i.test(v.name) ? 10 : 0) + (/^uz-UZ/i.test(v.lang) ? 1 : 0); }
  loadVoices(); if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
  setTimeout(loadVoices, 1200);

  function mark() {
    main.querySelectorAll('.reading').forEach(function (e) { e.classList.remove('reading'); });
    var b = B[idx]; if (!b) return;
    b.el.classList.add('reading');
    var d = b.el.closest('details'); if (d && !d.open) d.open = true;
    var r = b.el.getBoundingClientRect(); if (r.top < 90 || r.bottom > window.innerHeight - 40) b.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function speak() {
    if (!playing) return;
    if (idx >= B.length) { stop(); st.textContent = 'Dars oxiriga yetdi.'; return; }
    if (part === 0) { parts = pieces(B[idx].t); mark(); }
    var u = new SpeechSynthesisUtterance(parts[part]), v = voices[+$('voice').value || 0];
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'uz-UZ';
    u.rate = parseFloat($('rate').value) || 1;
    u.onend = function () { if (!playing || paused) return; part++; if (part >= parts.length) { part = 0; idx++; } speak(); };
    u.onerror = function (e) { if (e.error === 'interrupted' || e.error === 'canceled') return; st.textContent = 'Ovozda xato: ' + e.error; };
    st.textContent = 'O\'qilmoqda: ' + (idx + 1) + ' / ' + B.length;
    synth.speak(u);
  }
  function go(i) { synth.cancel(); idx = Math.max(0, Math.min(B.length - 1, i)); part = 0; paused = false; $('play').textContent = 'Pauza'; speak(); }
  function stop() { playing = false; paused = false; synth.cancel(); $('play').textContent = 'Tinglash'; main.querySelectorAll('.reading').forEach(function (e) { e.classList.remove('reading'); }); }

  $('play').addEventListener('click', function () {
    if (!voices.length) { loadVoices(); if (!voices.length) return; }
    if (!playing) { B = blocks(); playing = true; paused = false; $('play').textContent = 'Pauza'; go(idx < B.length ? idx : 0); return; }
    if (!paused) { paused = true; synth.pause(); $('play').textContent = 'Davom etish'; st.textContent = 'Pauza.'; }
    else { paused = false; synth.resume(); $('play').textContent = 'Pauza'; st.textContent = 'O\'qilmoqda: ' + (idx + 1) + ' / ' + B.length; if (!synth.speaking) speak(); }
  });
  $('stop').addEventListener('click', function () { stop(); idx = 0; st.textContent = 'To\'xtatildi.'; });
  $('next').addEventListener('click', function () { if (playing) go(idx + 1); });
  $('prev').addEventListener('click', function () { if (playing) go(idx - 1); });
  $('rate').addEventListener('change', function () { if (playing && !paused) go(idx); });
  $('voice').addEventListener('change', function () { if (playing && !paused) go(idx); });
  main.addEventListener('click', function (e) {
    if (!playing || e.target.closest('a, button, input, select, svg, .listen')) return;
    for (var i = 0; i < B.length; i++) if (B[i].el.contains(e.target)) { go(i); return; }
  });
  window.addEventListener('beforeunload', function () { synth.cancel(); });
})();
