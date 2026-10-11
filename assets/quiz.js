// Mustahkamlash testi. Ishlatilishi: window.quiz(elementId, savollar, darslar, kalit)
// savollar: [{ l: dars raqami, q: savol, a: [variantlar], c: to'g'ri variant indeksi, w: izoh }]
// darslar:  { 1: { t: nomi, h: havola }, ... }
// kalit:    natijani brauzerda eslab qolish uchun nom
(function () {
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function load(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

  window.quiz = function (id, QS, LESSONS, key) {
    var root = document.getElementById(id), nums = Object.keys(LESSONS).map(Number).sort(function (a, b) { return a - b; });
    var filter = 0, order = [], pos = 0, wrong = [], right = 0, perL = {}, answered = false;

    var pick = el('div', 'evo-tabs'), bar = el('div', 'quiz-bar'), card = el('div', 'quiz-card'), best = el('p', 'quiz-best');
    root.appendChild(el('p', 'pick-label', 'Qaysi dars bo\'yicha'));
    root.appendChild(pick); root.appendChild(bar); root.appendChild(card); root.appendChild(best);
    var fbtns = [];
    [0].concat(nums).forEach(function (n) {
      var cnt = n ? QS.filter(function (q) { return q.l === n; }).length : QS.length;
      var b = el('button', '', (n ? n + '-dars' : 'Hammasi') + ' (' + cnt + ')'); b.type = 'button';
      b.addEventListener('click', function () { filter = n; start(null); });
      pick.appendChild(b); fbtns.push({ n: n, b: b });
    });

    function start(list) {
      var pool = list || QS.map(function (q, i) { return i; }).filter(function (i) { return !filter || QS[i].l === filter; });
      order = shuffle(pool); pos = 0; wrong = []; right = 0; perL = {};
      fbtns.forEach(function (f) { f.b.setAttribute('aria-pressed', f.n === filter ? 'true' : 'false'); });
      show();
    }
    function showBest() {
      var r = load(key);
      best.textContent = r ? 'Oxirgi to\'liq natijangiz: ' + r.right + ' / ' + r.total + ' (' + Math.round(100 * r.right / r.total) + '%).' : '';
    }
    function show() {
      card.textContent = ''; answered = false;
      if (pos >= order.length) return finish();
      var q = QS[order[pos]], L = LESSONS[q.l];
      bar.textContent = 'Savol ' + (pos + 1) + ' / ' + order.length + '. To\'g\'ri javoblar: ' + right + '.';
      card.appendChild(el('p', 'quiz-from', q.l + '-dars. ' + L.t));
      card.appendChild(el('p', 'quiz-q', q.q));
      var opts = el('div', 'quiz-opts'), fb = el('div', 'quiz-fb'); fb.setAttribute('aria-live', 'polite');
      var idx = shuffle(q.a.map(function (_, i) { return i; })), btns = [];
      idx.forEach(function (i) {
        var b = el('button', 'quiz-opt', q.a[i]); b.type = 'button';
        b.addEventListener('click', function () {
          if (answered) return; answered = true;
          var ok = i === q.c; perL[q.l] = perL[q.l] || { r: 0, n: 0 }; perL[q.l].n++;
          if (ok) { right++; perL[q.l].r++; } else wrong.push(order[pos]);
          btns.forEach(function (x) { x.b.disabled = true; if (x.i === q.c) x.b.classList.add('ok'); });
          if (!ok) b.classList.add('no');
          fb.appendChild(el('p', 'quiz-verdict ' + (ok ? 'ok' : 'no'), ok ? 'To\'g\'ri.' : 'Noto\'g\'ri. To\'g\'ri javob: ' + q.a[q.c]));
          fb.appendChild(el('p', 'quiz-why', q.w));
          var more = el('p', 'quiz-link'), a = el('a', '', q.l + '-darsni ochish'); a.href = L.h; more.appendChild(a); fb.appendChild(more);
          var nx = el('button', 'quiz-next', pos + 1 < order.length ? 'Keyingi savol' : 'Natijani ko\'rish'); nx.type = 'button';
          nx.addEventListener('click', function () { pos++; show(); card.scrollIntoView({ block: 'nearest' }); });
          fb.appendChild(nx); nx.focus();
          bar.textContent = 'Savol ' + (pos + 1) + ' / ' + order.length + '. To\'g\'ri javoblar: ' + right + '.';
        });
        opts.appendChild(b); btns.push({ b: b, i: i });
      });
      card.appendChild(opts); card.appendChild(fb);
    }
    function finish() {
      var total = order.length, pct = total ? Math.round(100 * right / total) : 0;
      bar.textContent = 'Test tugadi.';
      card.appendChild(el('p', 'quiz-q', 'Natija: ' + right + ' / ' + total + ' (' + pct + '%)'));
      var weak = [], tbl = el('table'), tb = el('tbody'); tbl.appendChild(tb);
      nums.forEach(function (n) {
        var p = perL[n]; if (!p) return;
        var tr = el('tr'), a = el('a', '', n + '-dars. ' + LESSONS[n].t), td = el('td'); a.href = LESSONS[n].h; td.appendChild(a);
        tr.appendChild(td); tr.appendChild(el('td', 'numr', p.r + ' / ' + p.n));
        var low = p.r / p.n < 0.7; tr.appendChild(el('td', '', low ? 'qayta o\'qish kerak' : 'yaxshi')); if (low) weak.push(n);
        tb.appendChild(tr);
      });
      var sc = el('div', 'scroll'); sc.appendChild(tbl); card.appendChild(sc);
      card.appendChild(el('p', 'quiz-why', weak.length ? 'To\'g\'ri javoblar 70% dan kam bo\'lgan darslar: ' + weak.join(', ') + '. Ularni qayta o\'qib, keyin shu darslar bo\'yicha testni alohida ishlang.' : (pct === 100 ? 'Hammasi to\'g\'ri. Bo\'lim mustahkam o\'zlashtirilgan.' : 'Har bir darsda 70% dan yuqori. Xato qilgan savollaringizni qayta ishlab chiqing.')));
      var ctl = el('div', 'evo-tabs');
      if (wrong.length) { var w = wrong.slice(), b1 = el('button', '', 'Faqat xato qilganlarimni qayta ishlash (' + w.length + ')'); b1.type = 'button'; b1.addEventListener('click', function () { start(w); }); ctl.appendChild(b1); }
      var b2 = el('button', '', 'Boshidan'); b2.type = 'button'; b2.addEventListener('click', function () { start(null); }); ctl.appendChild(b2);
      card.appendChild(ctl);
      if (!filter && total === QS.length) { save(key, { right: right, total: total }); showBest(); }
    }
    showBest(); start(null);
  };
})();
