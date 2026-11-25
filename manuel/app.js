/* Manuel V2 numérique « L'anglais en mouvement » : la fiche en poche (A) et le mode séance (B). Données : data.js (export_web.py). */
(function () {
  'use strict';
  var M = window.M, app = document.getElementById('app');
  var CACHE = 'manuel-v1';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var G = {}; M.games.forEach(function (g) { G[g.k] = g; });
  var TH = {}; M.themes.forEach(function (t) { TH[t.id] = t; });
  var MOM = { 'é': ['e', 'Échauffement'], 'j': ['j', 'Jeu principal'], 'r': ['r', 'Retour au calme'] };
  var COL = { 'é': '#c2410c', 'j': '#0f766e', 'r': '#6d28d9' };
  var SPK = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9a4 4 0 010 6"/></svg>';
  var st = { q: '', mom: '', th: '' }, SEL = {}, T0 = {}, keepScroll = false, tick = null, lock = null;

  /* ---------- sons ---------- */
  var player = new Audio(), lit = null;
  function play(el) {
    var a = el.getAttribute('data-a'); if (!a) return;
    if (lit) lit.classList.remove('on');
    lit = el; el.classList.add('on');
    player.src = a; player.play().catch(function () { el.classList.remove('on'); });
  }
  player.addEventListener('ended', function () { if (lit) lit.classList.remove('on'); });
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-a]'); if (el) { ev.preventDefault(); play(el); }
  });
  document.addEventListener('keydown', function (ev) {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList && ev.target.classList.contains('say')) { ev.preventDefault(); play(ev.target); }
  });

  /* ---------- briques ---------- */
  function ph(s, cls, extra) {
    var sub = [s.fr, s.note, extra].filter(Boolean).join(' · ');
    return '<button class="' + (cls || 'ph') + '" data-a="' + esc(s.a) + '" aria-label="Écouter : ' + esc(s.en) + '"><span class="spk" style="color:' + (cls === 'psay' ? '#1c1917' : '#fff') + '">' + SPK + '</span><span class="t"><b>' + esc(s.en) + '</b><i>[' + esc(s.pr) + ']</i>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span></button>';
  }
  function tile(w) {
    return '<button class="tile" data-a="' + esc(w.a) + '" aria-label="Écouter : ' + esc(w.en) + '">' + (w.img ? '<img loading="lazy" alt="" src="' + esc(w.img) + '">' : '') + '<b>' + esc(w.en) + '</b><i>' + esc(w.pr) + '</i><span>' + esc(w.fr) + '</span></button>';
  }
  function vocab(tid) {
    var t = TH[tid]; if (!t) return '';
    if (!t.six.length) return '<p class="small">' + esc(t.note || '') + '</p>';
    var h = '<div class="tiles">' + t.six.map(tile).join('') + '</div>';
    if (t.res.length) h += '<h3>En réserve</h3><div class="res">' + t.res.map(function (w) { var x = { en: w.en, fr: w.fr, pr: w.pr, a: w.a }; return tile(x); }).join('') + '</div>';
    if (t.fc) h += '<div class="btns"><a class="btn" href="../#' + esc(t.fc) + '">Flashcards à imprimer et sons</a></div>';
    return h;
  }
  function row(g, href, sub) {
    return '<li><a class="row" href="' + href + '"><span class="num m' + MOM[g.m][0] + '">' + g.n + '</span><span class="tx"><b>' + esc(g.titre) + '</b><span>' + esc(sub || (M.thn[g.theme] + ' · ' + g.duree)) + '</span></span><span class="go" aria-hidden="true"></span></a></li>';
  }
  function dots(a, b) { var d = function (n) { return '●●●'.slice(0, n) + '○○○'.slice(0, 3 - n); }; return a === b ? d(a) : 'de ' + d(a) + ' à ' + d(b); }

  /* ---------- A · accueil ---------- */
  function listHtml() {
    var q = st.q.trim().toLowerCase();
    var out = M.games.filter(function (g) {
      if (st.mom && g.place.indexOf(st.mom) < 0) return false;
      if (st.th && g.theme !== st.th && !g.themes.some(function (t) { return t.id === st.th; })) return false;
      if (!q) return true;
      var words = (TH[g.theme].six || []).map(function (w) { return w.en + ' ' + w.fr; }).join(' ');
      return (g.titre + ' ' + g.en + ' ' + M.thn[g.theme] + ' ' + g.dispositif + ' ' + words).toLowerCase().indexOf(q) >= 0;
    });
    if (!out.length) return '<p class="empty">Aucun jeu ne correspond. Effacer la recherche ou choisir « Tous ».</p>';
    return '<ul class="list two">' + out.map(function (g) { return row(g, '#/jeu/' + g.k + (st.th && st.th !== g.theme ? '/' + st.th : '')); }).join('') + '</ul>';
  }
  function home() {
    var chip = function (v, l, c) { return '<button class="chip ' + c + '" data-mom="' + v + '" aria-pressed="' + (st.mom === v) + '">' + l + '</button>'; };
    app.innerHTML = '<div class="top"><span class="kick">L\'anglais en mouvement · GS et CP</span><h1>24 jeux</h1></div>' +
      '<div class="search"><label for="q">Chercher un jeu ou un mot</label><input id="q" type="search" autocomplete="off" placeholder="béret, colours, cerceaux…" value="' + esc(st.q) + '"></div>' +
      '<div class="chips">' + chip('', 'Tous', '') + chip('échauffement', 'Échauffement', 'e') + chip('jeu principal', 'Jeu principal', 'j') + chip('retour au calme', 'Retour au calme', 'r') +
      '<label class="small" for="th" style="align-self:center">Thème</label><select class="sel" id="th"><option value="">Tous les thèmes</option>' + M.themes.map(function (t) { return '<option value="' + t.id + '"' + (st.th === t.id ? ' selected' : '') + '>' + esc(t.nom) + '</option>'; }).join('') + '</select></div>' +
      '<div id="lst">' + listHtml() + '</div>';
    var upd = function () { document.getElementById('lst').innerHTML = listHtml(); };
    document.getElementById('q').addEventListener('input', function (e) { st.q = e.target.value; upd(); });
    document.getElementById('th').addEventListener('change', function (e) { st.th = e.target.value; upd(); });
    app.querySelectorAll('[data-mom]').forEach(function (b) { b.addEventListener('click', function () { st.mom = b.getAttribute('data-mom'); app.querySelectorAll('[data-mom]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); upd(); }); });
  }

  /* ---------- A · fiche du jeu ---------- */
  function game(k, tid) {
    var g = G[k]; if (!g) return home();
    var v = g.themes.filter(function (t) { return t.id === tid; })[0];
    var cur = v ? tid : g.theme;
    document.documentElement.style.setProperty('--a', COL[g.m]);
    var chips = [g.theme].concat(g.themes.map(function (t) { return t.id; })).map(function (id) {
      return '<button class="chip" data-th="' + id + '" aria-pressed="' + (id === cur) + '">' + esc(M.thn[id].replace(/^(Les |Le |La |L\'|Se )/, '').replace(/^./, function (c) { return c.toUpperCase(); })) + (id === g.theme ? ' · base' : '') + '</button>';
    }).join('');
    var det = function (t, h) { return '<details><summary>' + t + '</summary><div class="in">' + h + '</div></details>'; };
    var vars = '<div class="card"><b>Pour simplifier</b>' + g.simp + '</div><div class="card"><b>Pour complexifier</b>' + g.comp + '</div>' + (g.intens ? '<div class="card"><b>Pour monter ou baisser l\'intensité</b>' + g.intens + '</div>' : '') + g.autres.map(function (a) { return '<div class="card"><b>' + esc(a[0]) + '</b>' + a[1] + '</div>'; }).join('');
    var obj = '<div class="card"><b>Objectif de langue</b>' + esc(g.langue) + '<br><span class="small">Activité langagière : ' + esc(g.al.join(' · ')) + '</span></div><div class="card"><b>Objectif pour le corps</b>' + esc(g.corps) + '</div>' +
      '<div class="card"><b>Ce que l\'enseignant observe</b>' + g.observe + '</div>' + g.items.map(function (c) { var it = M.items[c]; return '<p><span class="pill">' + c + '</span>' + (it ? esc(it.cp) + (it.gs && it.gs !== '—' ? ' <span class="small">(GS : ' + esc(it.gs) + ')</span>' : '') : '') + '</p>'; }).join('');
    app.innerHTML =
      '<div class="hero" style="background:' + COL[g.m] + '"><a class="back" href="#/">‹ Les 24 jeux</a><h1>' + g.n + ' · ' + esc(g.titre) + '</h1><span class="meta">' + esc(g.place.replace(/^./, function (c) { return c.toUpperCase(); })) + ' · ' + esc(g.duree) + ' · ' + esc(g.niveau) + ' · intensité ' + dots(g.inten[0], g.inten[1]) + '</span></div>' +
      '<div class="but"><b>But pour l\'élève</b>' + esc(g.but) + '</div>' +
      '<div class="btns"><button class="btn pri" id="vbtn"><span class="tri" aria-hidden="true"></span>Voir le jeu en 30 secondes</button></div><div id="vid"></div>' +
      '<h2>Le film du jeu</h2><div class="film">' + g.vues.map(function (u, i) { return '<div class="vue">' + u.svg + '<div class="cap"><span class="n">' + (i + 1) + '</span><span>' + esc(u.fr) + '</span></div></div>'; }).join('') + '</div>' +
      '<h2>Avec quel thème ?</h2><div class="chips">' + chips + '</div>' + (v ? '<div class="change"><b class="small">Ce qui change</b><br>' + v.h + '</div>' : '') +
      '<h2>Ce que l\'on dit</h2><div class="who">L\'enseignant dit</div>' + (v ? v.ph.map(function (s) { return ph(s); }).join('') : '') + g.adulte.map(function (s) { return ph(s); }).join('') +
      (g.eleve.length ? '<div class="who">L\'élève dit</div>' + g.eleve.map(function (s) { return ph(s); }).join('') : '') +
      '<h2>Dispositif et matériel</h2><p>' + esc(g.dispositif) + '</p>' +
      '<h2>Mener le jeu</h2>' + g.mener.map(function (m) { return '<div class="card"><b>' + m.t + '</b>' + m.h + '</div>'; }).join('') + (g.regle ? '<div class="card"><b>Règle à connaître</b>' + g.regle + '</div>' : '') +
      '<div class="card vig"><b>Point de vigilance</b>' + g.vig + '</div>' +
      '<div class="btns"><a class="btn acc" href="#/go/j/' + g.k + (v ? '~' + cur : '') + '/0">Mener ce jeu dans la salle</a></div>' +
      '<h2>Le vocabulaire : ' + esc(M.thn[cur].toLowerCase()) + '</h2>' + vocab(cur) +
      det('Objectifs et observation', obj) + det('Les variables', vars) + g.extra.map(function (x) { return det(esc(x.t), x.h); }).join('') +
      '<p class="small" style="margin-top:14px">Nom du jeu chez les volontaires : <b>' + esc(g.en) + '</b> [' + esc(g.enpr) + ']</p>';
    document.getElementById('vbtn').addEventListener('click', function () {
      document.getElementById('vid').innerHTML = '<div class="video"><video controls playsinline autoplay src="' + esc(g.video) + '"></video></div>';
      this.parentNode.style.display = 'none';
    });
    app.querySelectorAll('[data-th]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-th'); keepScroll = true; location.replace('#/jeu/' + k + (id === g.theme ? '' : '/' + id)); }); });
  }

  /* ---------- thèmes, phrases de classe ---------- */
  function themes() {
    app.innerHTML = '<div class="top"><span class="kick">Six mots par séance</span><h1>Les 12 thèmes</h1></div><ul class="list two">' + M.themes.map(function (t) {
      return '<li><a class="row" href="#/theme/' + t.id + '"><span class="tx"><b>' + esc(t.nom) + '</b><span>' + esc(t.six.map(function (w) { return w.en; }).join(' · ') || 'les mots de la séance du jour') + '</span></span><span class="go" aria-hidden="true"></span></a></li>';
    }).join('') + '</ul>';
  }
  function theme(id) {
    var t = TH[id]; if (!t) return themes();
    var lk = function (ks, th) { return ks && ks.length ? '<ul class="list">' + ks.map(function (k) { return row(G[k], '#/jeu/' + k + (th ? '/' + id : ''), MOM[G[k].m][1] + ' · ' + G[k].duree); }).join('') + '</ul>' : '<p class="small">Aucun.</p>'; };
    app.innerHTML = '<div class="top"><a class="small" href="#/themes">‹ Les 12 thèmes</a><h1>' + esc(t.nom) + '</h1></div><h2>Les six mots de la séance</h2>' + vocab(id) +
      (t.six.length ? '<h2>Jeux dont c\'est le thème de base</h2>' + lk(t.base) + '<h2>Jeux où il se branche</h2>' + lk(t.branche, true) : '');
  }
  function classe() {
    app.innerHTML = '<div class="top"><span class="kick">31 phrases, toujours avec le même geste</span><h1>Phrases pour gérer la classe</h1></div><p>La phrase n\'est pas traduite aux élèves : le français est là pour l\'enseignant.</p>' +
      M.classe.map(function (c) { return '<h2>' + esc(c.t) + '</h2>' + c.rows.map(function (r) { return ph({ en: r.en, pr: r.pr, a: r.a, fr: r.fr }, 'ph', r.geste ? 'geste : ' + r.geste.replace(/^./, function (x) { return x.toLowerCase(); }) : ''); }).join(''); }).join('');
  }

  /* ---------- B · séances ---------- */
  function seances() {
    app.innerHTML = '<div class="top"><span class="kick">Composer sa séance</span><h1>Huit séances prêtes</h1></div>' +
      '<p>En GS : 30 minutes, trois jeux, six mots. En CP : 45 minutes, quatre jeux, six mots. L\'ordre suit la courbe calme, intense, calme.</p><ul class="list two">' +
      M.seances.map(function (s, i) { return '<li><a class="row" href="#/seance/' + i + '"><span class="tx"><b>' + esc(M.thn[s.theme]) + '</b><span>' + esc(s.jeux.map(function (j) { return G[j.k].titre.split(' (')[0]; }).join(' · ')) + '</span></span><span class="go" aria-hidden="true"></span></a></li>'; }).join('') + '</ul>';
  }
  function sel(i) { if (!SEL[i]) SEL[i] = [true, true, true, true, true]; return SEL[i]; }
  function entries(i) { var s = M.seances[i], on = sel(i); return s.jeux.filter(function (_, n) { return on[n]; }).map(function (j) { return { g: G[j.k], theme: s.theme, plus: j.plus, nom: j.nom }; }); }
  function audioOf(list) {
    var set = {}, add = function (a) { if (a) set[a] = 1; }, scan = function (h) { (h || '').replace(/data-a="([^"]+)"/g, function (_, a) { add(a); }); };
    list.forEach(function (en) {
      var g = en.g; g.adulte.concat(g.eleve).forEach(function (s) { add(s.a); }); g.vues.forEach(function (u) { u.says.forEach(function (s) { add(s.a); }); });
      g.themes.forEach(function (t) { if (t.id === en.theme) { t.ph.forEach(function (s) { add(s.a); }); scan(t.h); } }); scan(g.observe);
      var t = TH[en.theme]; if (t) t.six.forEach(function (w) { add(w.a); });
    });
    return Object.keys(set);
  }
  function seance(i) {
    var s = M.seances[i]; if (!s) return seances();
    var on = sel(i);
    document.documentElement.style.setProperty('--a', '#c2410c');
    app.innerHTML = '<div class="top"><a class="small" href="#/seances">‹ Les séances</a><span class="kick">Séance toute prête</span><h1>' + esc(M.thn[s.theme]) + '</h1><span id="tot" class="small"></span></div>' +
      '<p class="small">Cinq jeux, dans l\'ordre. En GS, en garder trois ; en CP, quatre ; toujours le premier et le dernier.</p><ul class="list">' +
      s.jeux.map(function (j, n) { var g = G[j.k]; return '<li class="sl"><span class="bar m' + MOM[g.m][0] + '"></span><label><input type="checkbox" data-n="' + n + '"' + (on[n] ? ' checked' : '') + '><span class="tx"><span>' + MOM[g.m][1] + ' · ' + esc(g.duree) + '</span><b>' + esc(j.nom) + '</b></span></label><a href="#/jeu/' + g.k + (g.themes.some(function (t) { return t.id === s.theme; }) ? '/' + s.theme : '') + '">Fiche</a></li>'; }).join('') + '</ul>' +
      '<div class="btns"><a class="btn acc" id="go" href="#/go/s/' + i + '/0/0">Lancer la séance</a></div><p class="status" id="off"></p>' +
      '<h2>Les six mots : ' + esc(M.thn[s.theme].toLowerCase()) + '</h2>' + vocab(s.theme);
    var tot = function () {
      var lo = 0, hi = 0, c = 0; s.jeux.forEach(function (j, n) { if (!on[n]) return; c++; var m = G[j.k].duree.match(/(\d+) à (\d+)/); if (m) { lo += +m[1]; hi += +m[2]; } });
      document.getElementById('tot').textContent = c + ' jeu' + (c > 1 ? 'x' : '') + ' · ' + lo + ' à ' + hi + ' min';
      document.getElementById('go').style.visibility = c ? 'visible' : 'hidden';
    };
    app.querySelectorAll('input[data-n]').forEach(function (b) { b.addEventListener('change', function () { on[+b.getAttribute('data-n')] = b.checked; tot(); }); });
    tot();
    var off = document.getElementById('off');
    if (window.caches && navigator.serviceWorker) {
      off.textContent = 'Enregistrement des sons de la séance…';
      var all = s.jeux.map(function (j) { return { g: G[j.k], theme: s.theme }; });
      var miss = 0;
      caches.open(CACHE).then(function (c) { return Promise.all(audioOf(all).map(function (u) { return c.match(u).then(function (r) { return r || c.add(u); }).catch(function () { miss++; }); })); })
        .then(function () { off.textContent = miss ? miss + ' son' + (miss > 1 ? 's' : '') + ' non enregistré' + (miss > 1 ? 's' : '') + ' : la séance aura besoin du réseau.' : 'Sons enregistrés : la séance se mène sans réseau (les vidéos, non).'; });
    } else off.textContent = 'Ce navigateur ne permet pas le mode sans réseau.';
  }

  /* ---------- B · pendant le jeu ---------- */
  function wake() { if (navigator.wakeLock && !lock) navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }).catch(function () {}); }
  function unwake() { if (lock) { lock.release().catch(function () {}); lock = null; } }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && document.body.classList.contains('play')) wake(); });
  function mmss(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + s % 60).slice(-2); }
  function go(p) {
    var list, pos, step, base, quit, i;
    if (p[1] === 's') { i = +p[2]; if (!M.seances[i]) return seances(); list = entries(i); pos = p[3] === 'fin' ? 'fin' : +p[3]; step = +p[4] || 0; base = '#/go/s/' + i + '/'; quit = '#/seance/' + i; }
    else { var kk = (p[2] || '').split('~'); if (!G[kk[0]]) return home(); list = [{ g: G[kk[0]], theme: kk[1] || G[kk[0]].theme }]; pos = 0; step = +p[3] || 0; base = null; quit = '#/jeu/' + kk[0] + (kk[1] ? '/' + kk[1] : ''); }
    document.body.classList.add('play'); wake();
    var key = p.slice(1, 3).join('/');
    if (!T0[key]) T0[key] = { start: Date.now(), games: {} };
    if (pos === 'fin' || !list[pos]) {
      app.innerHTML = '<div class="pend"><span class="pk">Séance terminée</span><h1>' + esc(M.thn[M.seances[i].theme]) + '</h1><p class="pstep">' + list.length + ' jeu' + (list.length > 1 ? 'x' : '') + ' · ' + mmss(Date.now() - T0[key].start) + '</p><div class="pnav2"><a href="' + quit + '">Revenir à la séance</a><a href="#/seances">Choisir une autre séance</a></div></div>';
      delete T0[key]; return;
    }
    var en = list[pos], g = en.g, u = g.vues[Math.min(3, Math.max(0, step))]; step = g.vues.indexOf(u);
    var v = en.theme !== g.theme ? g.themes.filter(function (t) { return t.id === en.theme; })[0] : null;
    if (!T0[key].games[pos]) T0[key].games[pos] = Date.now();
    var url = function (ps, stp) { return base ? base + ps + '/' + stp : '#/go/j/' + p[2] + '/' + stp; };
    var says = u.says.slice();
    if (step === 1 && v) says = v.ph.concat(says).slice(0, 2);
    if (step === 1 && !says.length && g.adulte.length) says = [g.adulte[0]];
    var note = '';
    if (step === 0) note = '<div class="pnote"><b>Dispositif et matériel</b>' + esc(g.dispositif) + '</div>' + (v ? '<div class="pnote"><b>Avec le thème ' + esc(M.thn[en.theme].toLowerCase()) + '</b>' + v.h + '</div>' : (en.plus ? '<div class="pnote"><b>Dans cette séance</b>' + esc(en.plus.replace(/^./, function (c) { return c.toUpperCase(); })) + '</div>' : ''));
    else if (step === 2 && g.eleve.length) note = '<div class="pnote"><b>L\'élève dit</b><span class="say" role="button" tabindex="0" data-a="' + esc(g.eleve[0].a) + '"><b>' + esc(g.eleve[0].en) + '</b> <i>[' + esc(g.eleve[0].pr) + ']</i>' + (g.eleve[0].fr ? ' <em>(' + esc(g.eleve[0].fr) + ')</em>' : '') + '</span></div>';
    else if (step === 3) note = '<div class="pnote"><b>Ce que l\'enseignant observe</b>' + g.observe + '</div>';
    var last = step === 3, nextG = list[pos + 1];
    var next = !last ? '<a class="next" href="' + url(pos, step + 1) + '">Étape ' + (step + 2) + ' · ' + esc(g.vues[step + 1].t.toLowerCase()) + ' ›</a>'
      : (base ? (nextG ? '<a class="next" href="' + url(pos + 1, 0) + '">Jeu suivant : ' + esc(nextG.g.titre.split(' (')[0]) + ' ›</a>' : '<a class="next" href="' + base + 'fin">Terminer la séance</a>') : '<a class="next" href="' + quit + '">Terminer le jeu</a>');
    var prev = step > 0 ? url(pos, step - 1) : (base && pos > 0 ? url(pos - 1, 3) : quit);
    app.innerHTML = '<div class="ptop"><b>' + esc(g.titre.split(' (')[0]) + '</b><span>' + (base ? 'Jeu ' + (pos + 1) + ' sur ' + list.length + ' · ' : '') + '<span id="clk">00:00</span></span><a href="' + quit + '" aria-label="Quitter le mode séance">Quitter</a></div>' +
      '<div class="segs" role="img" aria-label="Étape ' + (step + 1) + ' sur 4">' + [0, 1, 2, 3].map(function (n) { return '<span class="' + (n < step ? 'd' : n === step ? 'c' : '') + '"></span>'; }).join('') + '</div>' +
      '<div><span class="pk">Étape ' + (step + 1) + ' · ' + esc(u.t) + '</span><p class="pstep">' + esc(u.fr) + '</p></div>' +
      '<div class="pview">' + u.svg + '</div>' + says.map(function (s) { return ph(s, 'psay'); }).join('') + note +
      (last ? '<div class="pnav2"><a href="' + url(pos, 1) + '">Rejouer une manche</a></div>' : '') +
      '<div class="pnav"><a class="prev" href="' + prev + '" aria-label="Étape précédente">‹</a>' + next + '</div>';
    var clk = document.getElementById('clk'), t0 = T0[key].games[pos], up = function () { if (clk) clk.textContent = mmss(Date.now() - t0); };
    up(); tick = setInterval(up, 1000);
  }

  /* ---------- routeur ---------- */
  function route() {
    var p = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    if (tick) { clearInterval(tick); tick = null; }
    if (p[0] !== 'go') { document.body.classList.remove('play'); unwake(); }
    document.documentElement.style.setProperty('--a', '#0f766e');
    var r = 'jeux';
    if (p[0] === 'jeu') game(p[1], p[2]);
    else if (p[0] === 'themes') { r = 'themes'; themes(); }
    else if (p[0] === 'theme') { r = 'themes'; theme(p[1]); }
    else if (p[0] === 'classe') { r = 'classe'; classe(); }
    else if (p[0] === 'seances') { r = 'seances'; seances(); }
    else if (p[0] === 'seance') { r = 'seances'; seance(+p[1]); }
    else if (p[0] === 'go') { r = 'seances'; go(p); }
    else home();
    document.querySelectorAll('#nav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-r') === r); });
    if (!keepScroll) window.scrollTo(0, 0);
    keepScroll = false;
  }
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
