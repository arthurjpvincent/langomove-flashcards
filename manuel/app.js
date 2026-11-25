/* Manuel V2 numérique « L'anglais en mouvement » : la fiche en poche (A), le mode séance (B), le carnet de classe (C). Français et anglais.
   Données : data.js et data-en.js (export_web.py). Le carnet reste sur l'appareil (localStorage), sans nom d'élève. */
(function () {
  'use strict';
  var MD = window.MD, app = document.getElementById('app'), nav = document.getElementById('nav');
  var CACHE = 'manuel-v2', LANG = 'fr', M, G, TH;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var cap = function (s) { return s.replace(/^./, function (c) { return c.toUpperCase(); }); };
  var COL = { 'é': '#c2410c', 'j': '#0f766e', 'r': '#6d28d9' }, MC = { 'é': 'e', 'j': 'j', 'r': 'r' };
  var SPK = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9a4 4 0 010 6"/></svg>';
  var st = { q: '', mom: '', th: '' }, SEL = {}, T0 = {}, keepScroll = false, tick = null, lock = null;
  var prep = { theme: 'couleurs', niv: 'gs', mode: 'connus', off: {} };

  /* ---------- textes de l'interface ---------- */
  var T = {
    fr: {
      nav: ['Jeux', 'Thèmes', 'Phrases', 'Séances', 'Carnet'], other: 'English', kick: "L'anglais en mouvement · GS et CP", h24: '24 jeux', search: 'Chercher un jeu ou un mot', sph: 'béret, colours, cerceaux…',
      all: 'Tous', mom: { 'é': 'Échauffement', 'j': 'Jeu principal', 'r': 'Retour au calme' }, theme: 'Thème', allth: 'Tous les thèmes', none: 'Aucun jeu ne correspond. Effacer la recherche ou choisir « Tous ».',
      back24: '‹ Les 24 jeux', inten: 'intensité', de: 'de {} à {}', but: "But pour l'élève", vid: 'Voir le jeu en 30 secondes', film: 'Le film du jeu', which: 'Avec quel thème ?', base: 'base', change: 'Ce qui change',
      dire: "Ce que l'on dit", ens: "L'enseignant dit", el: "L'élève dit", disp: 'Dispositif et matériel', mener: 'Mener le jeu', regle: 'Règle à connaître', vig: 'Point de vigilance', room: 'Mener ce jeu dans la salle',
      vocab: 'Le vocabulaire : ', reserve: 'En réserve', fc: 'Flashcards à imprimer et sons', objobs: 'Objectifs et observation', langue: 'Objectif de langue', al: 'Activité langagière', corps: 'Objectif pour le corps',
      obs: "Ce que l'enseignant observe", vars: 'Les variables', simp: 'Pour simplifier', comp: 'Pour complexifier', intens: "Pour monter ou baisser l'intensité", altname: 'Nom du jeu chez les volontaires : ', listen: 'Écouter : ',
      k6: 'Six mots par séance', h12: 'Les 12 thèmes', back12: '‹ Les 12 thèmes', six: 'Les six mots de la séance', gbase: "Jeux dont c'est le thème de base", gplug: 'Jeux où il se branche', nonegame: 'Aucun.', today6: 'les mots de la séance du jour',
      kcl: '31 phrases, toujours avec le même geste', hcl: 'Phrases pour gérer la classe', pcl: "La phrase n'est pas traduite aux élèves : le français est là pour l'enseignant.", geste: 'geste : ',
      kse: 'Composer sa séance', hse: 'Huit séances prêtes', pse: "En GS : 30 minutes, trois jeux, six mots. En CP : 45 minutes, quatre jeux, six mots. L'ordre suit la courbe calme, intense, calme.", prepbtn: 'Préparer une séance en trois questions',
      backse: '‹ Les séances', kready: 'Séance toute prête', keep: "Cinq jeux, dans l'ordre. En GS, en garder trois ; en CP, quatre ; toujours le premier et le dernier.", fiche: 'Fiche', launch: 'Lancer la séance', game1: 'jeu', gameN: 'jeux',
      sixof: 'Les six mots : ', caching: 'Enregistrement des sons de la séance…', cached: 'Sons enregistrés : la séance se mène sans réseau (les vidéos, non).', miss1: ' son non enregistré : la séance aura besoin du réseau.', missN: ' sons non enregistrés : la séance aura besoin du réseau.', nocache: 'Ce navigateur ne permet pas le mode sans réseau.',
      quit: 'Quitter', quitl: 'Quitter le mode séance', gameof: 'Jeu {} sur {}', step: 'Étape', withth: 'Avec le thème ', inthis: 'Dans cette séance', replay: 'Rejouer une manche', nextg: 'Jeu suivant : ', endse: 'Terminer la séance', endg: 'Terminer le jeu', prev: 'Étape précédente',
      done: 'Séance terminée', done1: 'Jeu terminé', noteit: 'Noter dans le carnet', backto: 'Revenir', other2: 'Choisir une autre séance',
      kprep: 'Préparer', hprep: 'Trois questions, une séance', q1: '1 · Quel thème ?', q2: '2 · Quelle classe ?', gs: 'GS · 3 jeux · 30 min', cp: 'CP · 4 jeux · 45 min', q3: '3 · Des jeux connus ou un jeu nouveau ?', connus: 'Plutôt des jeux déjà joués', nouveaux: 'Plutôt des jeux nouveaux',
      prop: 'La séance proposée', swap: 'Changer', already: 'déjà joué', newg: 'nouveau', again: 'à rejouer', nover: 'pas de version écrite pour ce thème : reprendre ses six mots', later: 'Garder pour plus tard', prepnote: "Le choix suit le manuel : un échauffement, un ou deux jeux principaux, un retour au calme, pris parmi les jeux de ce thème ou ceux où il se branche.",
      kcar: 'Carnet', hcar: 'Le carnet de la classe', priv: "Enregistré sur cet appareil seulement. Aucun nom d'élève : le carnet décrit la classe, pas les enfants.", nostore: "Ce navigateur n'enregistre rien : le carnet sera perdu à la fermeture de la page.", cname: 'Nom de la classe', cnph: 'CP de Mme …',
      planned: 'Séances prévues', played: 'Séances jouées', empty: "Rien encore. Une séance s'inscrit ici quand elle est préparée ou menée jusqu'au bout.", toreplay: 'À rejouer', suite: { tel: 'à rejouer tel quel', simp: 'à simplifier', comp: 'à complexifier' },
      thplayed: 'Thèmes joués', gplayed: 'Jeux joués', of24: ' sur 24', times: ' fois', obsgrid: "Observation : dernier relevé par item", lev: ['', 'Pas encore', 'Quelques-uns', 'La plupart'], exp: 'Exporter le carnet (fichier)', erase: 'Effacer le carnet', erase2: 'Confirmer : tout effacer',
      knote: 'Noter la séance', next: 'Pour la prochaine fois', seen: "Ce que j'ai observé", free: 'Notes', freeph: 'Ce qui a marché, ce qui est à changer…', finish: 'Terminé', del: 'Supprimer cette séance', del2: 'Confirmer la suppression', backcar: '‹ Le carnet', start: 'Lancer', gsl: 'GS : ', min: 'min', to: 'à'
    },
    en: {
      nav: ['Games', 'Themes', 'Phrases', 'Sessions', 'Logbook'], other: 'Français', kick: 'English on the move · ages 5 to 7', h24: '24 games', search: 'Search for a game or a word', sph: 'flag, colours, hoops…',
      all: 'All', mom: { 'é': 'Warm-up', 'j': 'Main game', 'r': 'Cool-down' }, theme: 'Theme', allth: 'All themes', none: 'No game matches. Clear the search or choose “All”.',
      back24: '‹ The 24 games', inten: 'intensity', de: '{} to {}', but: "The child's goal", vid: 'Watch the game in 30 seconds', film: 'The game in four pictures', which: 'With which theme?', base: 'base', change: 'What changes',
      dire: 'What is said', ens: 'The teacher says', el: 'The child says', disp: 'Set-up and equipment', mener: 'Running the game', regle: 'Rule to know', vig: 'Watch out', room: 'Run this game in the hall',
      vocab: 'Vocabulary: ', reserve: 'Extra words', fc: 'Printable flashcards and sounds', objobs: 'Aims and observation', langue: 'Language aim', al: 'Language activity', corps: 'Movement aim',
      obs: 'What the teacher looks for', vars: 'Variations', simp: 'Easier', comp: 'Harder', intens: 'More or less intense', altname: 'Name in the French handbook: ', listen: 'Listen: ',
      k6: 'Six words per session', h12: 'The 12 themes', back12: '‹ The 12 themes', six: 'The six words of the session', gbase: 'Games with this base theme', gplug: 'Games it plugs into', nonegame: 'None.', today6: "the words of the day's session",
      kcl: '31 phrases, always with the same gesture', hcl: 'Classroom-management phrases', pcl: 'Phrases to keep in English for the whole session. Each one always goes with the same gesture.', geste: 'gesture: ',
      kse: 'Building a session', hse: 'Eight ready-made sessions', pse: 'Ages 5 to 6 (GS): 30 minutes, three games, six words. Ages 6 to 7 (CP): 45 minutes, four games, six words. The order follows a calm, intense, calm curve.', prepbtn: 'Plan a session in three questions',
      backse: '‹ Sessions', kready: 'Ready-made session', keep: 'Five games, in order. Keep three in GS and four in CP, always the first and the last.', fiche: 'Sheet', launch: 'Start the session', game1: 'game', gameN: 'games',
      sixof: 'The six words: ', caching: 'Saving the sounds of the session…', cached: 'Sounds saved: the session runs without a network (the videos do not).', miss1: ' sound not saved: the session will need a network.', missN: ' sounds not saved: the session will need a network.', nocache: 'This browser cannot work offline.',
      quit: 'Quit', quitl: 'Quit session mode', gameof: 'Game {} of {}', step: 'Step', withth: 'With the theme: ', inthis: 'In this session', replay: 'Play another round', nextg: 'Next game: ', endse: 'End the session', endg: 'End the game', prev: 'Previous step',
      done: 'Session over', done1: 'Game over', noteit: 'Record in the logbook', backto: 'Go back', other2: 'Choose another session',
      kprep: 'Plan', hprep: 'Three questions, one session', q1: '1 · Which theme?', q2: '2 · Which class?', gs: 'GS · 3 games · 30 min', cp: 'CP · 4 games · 45 min', q3: '3 · Familiar games or a new one?', connus: 'Mostly games already played', nouveaux: 'Mostly new games',
      prop: 'Suggested session', swap: 'Change', already: 'played before', newg: 'new', again: 'play again', nover: 'no written version for this theme: reuse its six words', later: 'Keep for later', prepnote: 'The choice follows the handbook: a warm-up, one or two main games, a cool-down, taken from the games of this theme or those it plugs into.',
      kcar: 'Logbook', hcar: 'The class logbook', priv: 'Saved on this device only. No child names: the logbook describes the class, not the children.', nostore: 'This browser saves nothing: the logbook will be lost when the page is closed.', cname: 'Class name', cnph: "Ms …'s class",
      planned: 'Planned sessions', played: 'Sessions played', empty: 'Nothing yet. A session appears here once it has been planned or run to the end.', toreplay: 'To play again', suite: { tel: 'play again as is', simp: 'make easier', comp: 'make harder' },
      thplayed: 'Themes played', gplayed: 'Games played', of24: ' of 24', times: ' times', obsgrid: 'Observation: latest record per item', lev: ['', 'Not yet', 'A few', 'Most'], exp: 'Export the logbook (file)', erase: 'Erase the logbook', erase2: 'Confirm: erase everything',
      knote: 'Record the session', next: 'For next time', seen: 'What I observed', free: 'Notes', freeph: 'What worked, what to change…', finish: 'Done', del: 'Delete this session', del2: 'Confirm deletion', backcar: '‹ Logbook', start: 'Start', gsl: 'GS: ', min: 'min', to: 'to'
    }
  };
  var L;
  function setLang(l) {
    LANG = MD[l] ? l : 'fr'; M = MD[LANG]; L = T[LANG]; G = {}; TH = {};
    M.games.forEach(function (g) { G[g.k] = g; }); M.themes.forEach(function (t) { TH[t.id] = t; });
    document.documentElement.lang = LANG;
  }
  function H(p) { return '#/' + (LANG === 'en' ? 'en/' : '') + (p || ''); }
  function shortT(g) { return g.titre.split(' (')[0]; }
  function nGames(c) { return c + ' ' + (c > 1 ? L.gameN : L.game1); }
  function fdate(d) { try { return new Date(d + 'T12:00:00').toLocaleDateString(LANG === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { return d; } }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  /* ---------- carnet : stockage sur l'appareil ---------- */
  var KEY = 'aem-carnet-v1', DB = { v: 1, classe: '', seances: [] }, persists = true;
  try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); if (o && o.seances) DB = o; } localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { persists = false; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { persists = false; } }
  function rec(id) { return DB.seances.filter(function (s) { return s.id === id; })[0]; }
  function newRec(theme, niv, jeux, fait) { var r = { id: 's' + Date.now().toString(36), d: today(), theme: theme, niv: niv || '', jeux: jeux.map(function (j) { return { k: j.k, plus: j.plus || '', suite: '', obs: {} }; }), note: '', fait: !!fait }; DB.seances.unshift(r); save(); return r; }
  function stats() {
    var n = {}, th = {}, suite = {}, obs = {};
    DB.seances.slice().reverse().forEach(function (s) {
      if (!s.fait) return; th[s.theme] = (th[s.theme] || 0) + 1;
      s.jeux.forEach(function (j) { n[j.k] = (n[j.k] || 0) + 1; suite[j.k] = j.suite || ''; Object.keys(j.obs || {}).forEach(function (c) { if (j.obs[c]) obs[c] = j.obs[c]; }); });
    });
    return { n: n, th: th, suite: suite, obs: obs };
  }

  /* ---------- sons ---------- */
  var player = new Audio(), lit = null;
  function play(el) { var a = el.getAttribute('data-a'); if (!a) return; if (lit) lit.classList.remove('on'); lit = el; el.classList.add('on'); player.src = a; player.play().catch(function () { el.classList.remove('on'); }); }
  player.addEventListener('ended', function () { if (lit) lit.classList.remove('on'); });
  document.addEventListener('click', function (ev) { var el = ev.target.closest('[data-a]'); if (el) { ev.preventDefault(); play(el); } });
  document.addEventListener('keydown', function (ev) { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList && ev.target.classList.contains('say')) { ev.preventDefault(); play(ev.target); } });

  /* ---------- briques ---------- */
  function ph(s, cls, extra) {
    var sub = [s.fr, s.note, extra].filter(Boolean).join(' · ');
    return '<button class="' + (cls || 'ph') + '" data-a="' + esc(s.a) + '" aria-label="' + L.listen + esc(s.en) + '"><span class="spk" style="color:' + (cls === 'psay' ? '#1c1917' : '#fff') + '">' + SPK + '</span><span class="t"><b>' + esc(s.en) + '</b>' + (s.pr ? '<i>[' + esc(s.pr) + ']</i>' : '') + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span></button>';
  }
  function sayInline(s) { return '<span class="say" role="button" tabindex="0" data-a="' + esc(s.a) + '"><b>' + esc(s.en) + '</b>' + (s.pr ? ' <i>[' + esc(s.pr) + ']</i>' : '') + (s.fr ? ' <em>(' + esc(s.fr) + ')</em>' : '') + '</span>'; }
  function tile(w) { return '<button class="tile" data-a="' + esc(w.a) + '" aria-label="' + L.listen + esc(w.en) + '">' + (w.img ? '<img loading="lazy" alt="" src="' + esc(w.img) + '">' : '') + '<b>' + esc(w.en) + '</b>' + (w.pr ? '<i>' + esc(w.pr) + '</i>' : '') + '<span>' + esc(w.fr) + '</span></button>'; }
  function vocab(tid) {
    var t = TH[tid]; if (!t) return '';
    if (!t.six.length) return '<p class="small">' + esc(t.note || '') + '</p>';
    var h = '<div class="tiles">' + t.six.map(tile).join('') + '</div>';
    if (t.res.length) h += '<h3>' + L.reserve + '</h3><div class="res">' + t.res.map(function (w) { return tile({ en: w.en, fr: w.fr, pr: w.pr, a: w.a }); }).join('') + '</div>';
    if (t.fc) h += '<div class="btns"><a class="btn" href="../#' + esc(t.fc) + '">' + L.fc + '</a></div>';
    return h;
  }
  function row(g, href, sub) { return '<li><a class="row" href="' + href + '"><span class="num m' + MC[g.m] + '">' + g.n + '</span><span class="tx"><b>' + esc(g.titre) + '</b><span>' + esc(sub || (M.thn[g.theme] + ' · ' + g.duree)) + '</span></span><span class="go" aria-hidden="true"></span></a></li>'; }
  function dots(a, b) { var d = function (n) { return '●●●'.slice(0, n) + '○○○'.slice(0, 3 - n); }; return a === b ? d(a) : L.de.replace('{}', d(a)).replace('{}', d(b)); }
  function top(kick, h1, back) { return '<div class="top">' + (back ? '<a class="small" href="' + back[0] + '">' + back[1] + '</a>' : '') + (kick ? '<span class="kick">' + kick + '</span>' : '') + '<h1>' + esc(h1) + '</h1></div>'; }
  function thChip(id) { return cap(M.thn[id].replace(/^(Les |Le |La |L'|Se |The )/, '')); }

  /* ---------- A · accueil ---------- */
  function listHtml() {
    var q = st.q.trim().toLowerCase();
    var out = M.games.filter(function (g) {
      if (st.mom && g.ms.indexOf(st.mom) < 0) return false;
      if (st.th && g.theme !== st.th && !g.themes.some(function (t) { return t.id === st.th; })) return false;
      if (!q) return true;
      var words = (TH[g.theme].six || []).map(function (w) { return w.en + ' ' + w.fr; }).join(' ');
      return (g.titre + ' ' + g.titre_fr + ' ' + g.en + ' ' + M.thn[g.theme] + ' ' + g.dispositif + ' ' + words).toLowerCase().indexOf(q) >= 0;
    });
    if (!out.length) return '<p class="empty">' + L.none + '</p>';
    return '<ul class="list two">' + out.map(function (g) { return row(g, H('jeu/' + g.k + (st.th && st.th !== g.theme ? '/' + st.th : ''))); }).join('') + '</ul>';
  }
  function home() {
    var chip = function (v, l, c) { return '<button class="chip ' + c + '" data-mom="' + v + '" aria-pressed="' + (st.mom === v) + '">' + l + '</button>'; };
    app.innerHTML = top(L.kick, L.h24) + '<div class="search"><label for="q">' + L.search + '</label><input id="q" type="search" autocomplete="off" placeholder="' + L.sph + '" value="' + esc(st.q) + '"></div>' +
      '<div class="chips">' + chip('', L.all, '') + chip('é', L.mom['é'], 'e') + chip('j', L.mom.j, 'j') + chip('r', L.mom.r, 'r') +
      '<label class="small" for="th" style="align-self:center">' + L.theme + '</label><select class="sel" id="th"><option value="">' + L.allth + '</option>' + M.themes.map(function (t) { return '<option value="' + t.id + '"' + (st.th === t.id ? ' selected' : '') + '>' + esc(t.nom) + '</option>'; }).join('') + '</select></div><div id="lst">' + listHtml() + '</div>';
    var upd = function () { document.getElementById('lst').innerHTML = listHtml(); };
    document.getElementById('q').addEventListener('input', function (e) { st.q = e.target.value; upd(); });
    document.getElementById('th').addEventListener('change', function (e) { st.th = e.target.value; upd(); });
    app.querySelectorAll('[data-mom]').forEach(function (b) { b.addEventListener('click', function () { st.mom = b.getAttribute('data-mom'); app.querySelectorAll('[data-mom]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); upd(); }); });
  }

  /* ---------- A · fiche du jeu ---------- */
  function game(k, tid) {
    var g = G[k]; if (!g) return home();
    var v = g.themes.filter(function (t) { return t.id === tid; })[0], cur = v ? tid : g.theme;
    document.documentElement.style.setProperty('--a', COL[g.m]);
    var chips = [g.theme].concat(g.themes.map(function (t) { return t.id; })).map(function (id) { return '<button class="chip" data-th="' + id + '" aria-pressed="' + (id === cur) + '">' + esc(thChip(id)) + (id === g.theme ? ' · ' + L.base : '') + '</button>'; }).join('');
    var det = function (t, h) { return '<details><summary>' + t + '</summary><div class="in">' + h + '</div></details>'; };
    var vars = '<div class="card"><b>' + L.simp + '</b>' + g.simp + '</div><div class="card"><b>' + L.comp + '</b>' + g.comp + '</div>' + (g.intens ? '<div class="card"><b>' + L.intens + '</b>' + g.intens + '</div>' : '') + g.autres.map(function (a) { return '<div class="card"><b>' + esc(a[0]) + '</b>' + a[1] + '</div>'; }).join('');
    var obj = '<div class="card"><b>' + L.langue + '</b>' + esc(g.langue) + '<br><span class="small">' + L.al + ' : ' + esc(g.al.join(' · ')) + '</span></div><div class="card"><b>' + L.corps + '</b>' + esc(g.corps) + '</div><div class="card"><b>' + L.obs + '</b>' + g.observe + '</div>' +
      g.items.map(function (c) { var it = M.items[c]; return '<p><span class="pill">' + c + '</span>' + (it ? esc(it.cp) + (it.gs && it.gs !== '—' ? ' <span class="small">(' + L.gsl + esc(it.gs) + ')</span>' : '') : '') + '</p>'; }).join('');
    var alt = LANG === 'fr' ? '<b>' + esc(g.en) + '</b> [' + esc(g.enpr) + ']' : '<b>' + esc(g.titre_fr) + '</b>';
    app.innerHTML = '<div class="hero" style="background:' + COL[g.m] + '"><a class="back" href="' + H() + '">' + L.back24 + '</a><h1>' + g.n + ' · ' + esc(g.titre) + '</h1><span class="meta">' + esc(cap(g.place)) + ' · ' + esc(g.duree) + ' · ' + esc(g.niveau) + ' · ' + L.inten + ' ' + dots(g.inten[0], g.inten[1]) + '</span></div>' +
      '<div class="but"><b>' + L.but + '</b>' + esc(g.but) + '</div><div class="btns"><button class="btn pri" id="vbtn"><span class="tri" aria-hidden="true"></span>' + L.vid + '</button></div><div id="vid"></div>' +
      '<h2>' + L.film + '</h2><div class="film">' + g.vues.map(function (u, i) { return '<div class="vue">' + u.svg + '<div class="cap"><span class="n">' + (i + 1) + '</span><span>' + esc(u.fr) + '</span></div></div>'; }).join('') + '</div>' +
      '<h2>' + L.which + '</h2><div class="chips">' + chips + '</div>' + (v ? '<div class="change"><b class="small">' + L.change + '</b><br>' + v.h + '</div>' : '') +
      '<h2>' + L.dire + '</h2><div class="who">' + L.ens + '</div>' + (v ? v.ph.map(function (s) { return ph(s); }).join('') : '') + g.adulte.map(function (s) { return ph(s); }).join('') +
      (g.eleve.length ? '<div class="who">' + L.el + '</div>' + g.eleve.map(function (s) { return ph(s); }).join('') : '') +
      '<h2>' + L.disp + '</h2><p>' + esc(g.dispositif) + '</p><h2>' + L.mener + '</h2>' + g.mener.map(function (m) { return '<div class="card"><b>' + m.t + '</b>' + m.h + '</div>'; }).join('') + (g.regle ? '<div class="card"><b>' + L.regle + '</b>' + g.regle + '</div>' : '') +
      '<div class="card vig"><b>' + L.vig + '</b>' + g.vig + '</div><div class="btns"><a class="btn acc" href="' + H('go/j/' + g.k + (v ? '~' + cur : '') + '/0') + '">' + L.room + '</a></div>' +
      '<h2>' + L.vocab + esc(M.thn[cur].toLowerCase()) + '</h2>' + vocab(cur) + det(L.objobs, obj) + det(L.vars, vars) + g.extra.map(function (x) { return det(esc(x.t), x.h); }).join('') +
      '<p class="small" style="margin-top:14px">' + L.altname + alt + '</p>';
    document.getElementById('vbtn').addEventListener('click', function () { document.getElementById('vid').innerHTML = '<div class="video"><video controls playsinline autoplay src="' + esc(g.video) + '"></video></div>'; this.parentNode.style.display = 'none'; });
    app.querySelectorAll('[data-th]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-th'); keepScroll = true; location.replace(H('jeu/' + k + (id === g.theme ? '' : '/' + id))); }); });
  }

  /* ---------- thèmes, phrases de classe ---------- */
  function themes() {
    app.innerHTML = top(L.k6, L.h12) + '<ul class="list two">' + M.themes.map(function (t) { return '<li><a class="row" href="' + H('theme/' + t.id) + '"><span class="tx"><b>' + esc(t.nom) + '</b><span>' + esc(t.six.map(function (w) { return w.en; }).join(' · ') || L.today6) + '</span></span><span class="go" aria-hidden="true"></span></a></li>'; }).join('') + '</ul>';
  }
  function theme(id) {
    var t = TH[id]; if (!t) return themes();
    var lk = function (ks, th) { return ks && ks.length ? '<ul class="list">' + ks.map(function (k) { return row(G[k], H('jeu/' + k + (th ? '/' + id : '')), L.mom[G[k].m] + ' · ' + G[k].duree); }).join('') + '</ul>' : '<p class="small">' + L.nonegame + '</p>'; };
    app.innerHTML = top('', t.nom, [H('themes'), L.back12]) + '<h2>' + L.six + '</h2>' + vocab(id) + (t.six.length ? '<h2>' + L.gbase + '</h2>' + lk(t.base) + '<h2>' + L.gplug + '</h2>' + lk(t.branche, true) : '');
  }
  function classe() {
    app.innerHTML = top(L.kcl, L.hcl) + '<p>' + L.pcl + '</p>' + M.classe.map(function (c) { return '<h2>' + esc(c.t) + '</h2>' + c.rows.map(function (r) { return ph({ en: r.en, pr: r.pr, a: r.a, fr: r.fr }, 'ph', r.geste ? L.geste + r.geste.replace(/^./, function (x) { return x.toLowerCase(); }) : ''); }).join(''); }).join('');
  }

  /* ---------- B · séances ---------- */
  function seances() {
    app.innerHTML = top(L.kse, L.hse) + '<p>' + L.pse + '</p><div class="btns"><a class="btn pri" href="' + H('preparer') + '">' + L.prepbtn + '</a></div><ul class="list two">' +
      M.seances.map(function (s, i) { return '<li><a class="row" href="' + H('seance/' + i) + '"><span class="tx"><b>' + esc(M.thn[s.theme]) + '</b><span>' + esc(s.jeux.map(function (j) { return shortT(G[j.k]); }).join(' · ')) + '</span></span><span class="go" aria-hidden="true"></span></a></li>'; }).join('') + '</ul>';
  }
  function sel(i) { if (!SEL[i]) SEL[i] = [true, true, true, true, true]; return SEL[i]; }
  function audioOf(list) {
    var set = {}, add = function (a) { if (a) set[a] = 1; }, scan = function (h) { (h || '').replace(/data-a="([^"]+)"/g, function (_, a) { add(a); }); };
    list.forEach(function (en) {
      var g = en.g; g.adulte.concat(g.eleve).forEach(function (s) { add(s.a); }); g.vues.forEach(function (u) { u.says.forEach(function (s) { add(s.a); }); });
      g.themes.forEach(function (t) { if (t.id === en.theme) { t.ph.forEach(function (s) { add(s.a); }); scan(t.h); } }); scan(g.observe);
      var t = TH[en.theme]; if (t) t.six.forEach(function (w) { add(w.a); });
    });
    return Object.keys(set);
  }
  function precache(list, off) {
    if (!off) return;
    if (!(window.caches && navigator.serviceWorker)) { off.textContent = L.nocache; return; }
    off.textContent = L.caching; var miss = 0;
    caches.open(CACHE).then(function (c) { return Promise.all(audioOf(list).map(function (u) { return c.match(u).then(function (r) { return r || c.add(u); }).catch(function () { miss++; }); })); })
      .then(function () { off.textContent = miss ? miss + (miss > 1 ? L.missN : L.miss1) : L.cached; });
  }
  function range(ks) { var lo = 0, hi = 0; ks.forEach(function (k) { var m = G[k].duree.match(/(\d+) \D+ (\d+)/); if (m) { lo += +m[1]; hi += +m[2]; } }); return lo + ' ' + L.to + ' ' + hi + ' ' + L.min; }
  function seance(i) {
    var s = M.seances[i]; if (!s) return seances();
    var on = sel(i); document.documentElement.style.setProperty('--a', '#c2410c');
    app.innerHTML = top(L.kready, M.thn[s.theme], [H('seances'), L.backse]) + '<p id="tot" class="small"></p><p class="small">' + L.keep + '</p><ul class="list">' +
      s.jeux.map(function (j, n) { var g = G[j.k]; return '<li class="sl"><span class="bar m' + MC[g.m] + '"></span><label><input type="checkbox" data-n="' + n + '"' + (on[n] ? ' checked' : '') + '><span class="tx"><span>' + L.mom[g.m] + ' · ' + esc(g.duree) + '</span><b>' + esc(j.nom) + '</b></span></label><a href="' + H('jeu/' + g.k + (g.themes.some(function (t) { return t.id === s.theme; }) ? '/' + s.theme : '')) + '">' + L.fiche + '</a></li>'; }).join('') + '</ul>' +
      '<div class="btns"><a class="btn acc" id="go" href="' + H('go/s/' + i + '/0/0') + '">' + L.launch + '</a></div><p class="status" id="off"></p><h2>' + L.sixof + esc(M.thn[s.theme].toLowerCase()) + '</h2>' + vocab(s.theme);
    var tot = function () { var ks = s.jeux.filter(function (_, n) { return on[n]; }).map(function (j) { return j.k; }); document.getElementById('tot').textContent = nGames(ks.length) + ' · ' + range(ks); document.getElementById('go').style.visibility = ks.length ? 'visible' : 'hidden'; };
    app.querySelectorAll('input[data-n]').forEach(function (b) { b.addEventListener('change', function () { on[+b.getAttribute('data-n')] = b.checked; tot(); }); });
    tot(); precache(s.jeux.map(function (j) { return { g: G[j.k], theme: s.theme }; }), document.getElementById('off'));
  }

  /* ---------- C · préparer en trois questions ---------- */
  function candidates(m, used, S) {
    var th = prep.theme;
    return M.games.filter(function (g) { return g.ms.indexOf(m) >= 0 && used.indexOf(g.k) < 0; }).map(function (g) {
      var sc = g.theme === th ? 3 : (g.themes.some(function (t) { return t.id === th; }) ? 2 : (g.theme === 'revision' || th === 'revision' ? 1 : 0));
      var known = !!S.n[g.k], again = !!S.suite[g.k];
      var bonus = prep.mode === 'connus' ? (known ? 1.5 : 0) + (again ? 2 : 0) : (known ? 0 : 1.5);
      return { g: g, sc: sc, tot: (sc ? sc + bonus : 0), known: known, again: again };
    }).sort(function (a, b) { return b.tot - a.tot || a.g.n - b.g.n; });
  }
  function proposal() {
    var S = stats(), slots = prep.niv === 'gs' ? ['é', 'j', 'r'] : ['é', 'j', 'j', 'r'], used = [], out = [];
    slots.forEach(function (m, i) { var c = candidates(m, used, S); if (!c.length) return; var p = c[(prep.off[i] || 0) % c.length]; used.push(p.g.k); out.push(p); });
    return out;
  }
  function preparer() {
    document.documentElement.style.setProperty('--a', '#5b21b6');
    var chip = function (grp, v, l) { return '<button class="chip" data-' + grp + '="' + v + '" aria-pressed="' + (prep[grp] === v) + '">' + esc(l) + '</button>'; };
    var P = proposal();
    app.innerHTML = top(L.kprep, L.hprep, [H('carnet'), L.backcar]) +
      '<h2>' + L.q1 + '</h2><div class="chips">' + M.themes.map(function (t) { return chip('theme', t.id, thChip(t.id)); }).join('') + '</div>' +
      '<h2>' + L.q2 + '</h2><div class="chips">' + chip('niv', 'gs', L.gs) + chip('niv', 'cp', L.cp) + '</div>' +
      '<h2>' + L.q3 + '</h2><div class="chips">' + chip('mode', 'connus', L.connus) + chip('mode', 'nouveaux', L.nouveaux) + '</div>' +
      '<h2>' + L.prop + ' · ' + range(P.map(function (p) { return p.g.k; })) + '</h2><ul class="list">' + P.map(function (p, i) {
        var tags = [L.mom[p.g.ms.indexOf(['é', 'j', 'j', 'r'][prep.niv === 'gs' && i === 2 ? 3 : i]) >= 0 ? ['é', 'j', 'j', 'r'][prep.niv === 'gs' && i === 2 ? 3 : i] : p.g.m], p.g.duree, p.again ? L.again : (p.known ? L.already : L.newg)];
        if (!p.sc) tags.push(L.nover);
        return '<li class="sl"><span class="bar m' + MC[p.g.m] + '"></span><label><span class="tx"><span>' + esc(tags.join(' · ')) + '</span><b>' + esc(shortT(p.g)) + '</b></span></label><button class="lnk" data-swap="' + i + '">' + L.swap + '</button></li>';
      }).join('') + '</ul><p class="small" style="margin-top:8px">' + L.prepnote + '</p>' +
      '<div class="btns"><button class="btn acc" id="pgo">' + L.launch + '</button><button class="btn" id="pkeep">' + L.later + '</button></div>';
    ['theme', 'niv', 'mode'].forEach(function (grp) { app.querySelectorAll('[data-' + grp + ']').forEach(function (b) { b.addEventListener('click', function () { prep[grp] = b.getAttribute('data-' + grp); prep.off = {}; keepScroll = true; route(); }); }); });
    app.querySelectorAll('[data-swap]').forEach(function (b) { b.addEventListener('click', function () { var i = b.getAttribute('data-swap'); prep.off[i] = (prep.off[i] || 0) + 1; keepScroll = true; route(); }); });
    var mk = function () { return newRec(prep.theme, prep.niv, P.map(function (p) { return { k: p.g.k }; }), false); };
    document.getElementById('pgo').addEventListener('click', function () { location.hash = H('go/c/' + mk().id + '/0/0'); });
    document.getElementById('pkeep').addEventListener('click', function () { mk(); location.hash = H('carnet'); });
  }

  /* ---------- C · carnet ---------- */
  function carnet() {
    document.documentElement.style.setProperty('--a', '#5b21b6');
    var S = stats(), plan = DB.seances.filter(function (s) { return !s.fait; }), done = DB.seances.filter(function (s) { return s.fait; });
    var line = function (s) {
      var flags = s.jeux.filter(function (j) { return j.suite; }).map(function (j) { return shortT(G[j.k]) + ' : ' + L.suite[j.suite]; });
      return '<li><a class="row" href="' + H((s.fait ? 'note/' : 'plan/') + s.id) + '"><span class="tx"><span>' + esc(fdate(s.d)) + (s.niv ? ' · ' + s.niv.toUpperCase() : '') + '</span><b>' + esc(M.thn[s.theme]) + '</b><span>' + esc(s.jeux.map(function (j) { return shortT(G[j.k]); }).join(' · ')) + '</span>' + (flags.length ? '<span class="flag">' + esc(flags.join(' ; ')) + '</span>' : '') + '</span><span class="go" aria-hidden="true"></span></a></li>';
    };
    var again = Object.keys(S.suite).filter(function (k) { return S.suite[k]; });
    var thp = Object.keys(S.th), codes = Object.keys(M.items);
    app.innerHTML = top(L.kcar, L.hcar) + '<p class="small">' + (persists ? L.priv : L.nostore) + '</p>' +
      '<div class="search"><label for="cn">' + L.cname + '</label><input id="cn" type="text" autocomplete="off" placeholder="' + esc(L.cnph) + '" value="' + esc(DB.classe) + '"></div>' +
      '<div class="btns"><a class="btn acc" href="' + H('preparer') + '">' + L.prepbtn + '</a></div>' +
      (DB.seances.length ? '' : '<p class="empty">' + L.empty + '</p>') +
      (plan.length ? '<h2>' + L.planned + '</h2><ul class="list">' + plan.map(line).join('') + '</ul>' : '') +
      (again.length ? '<h2>' + L.toreplay + '</h2><ul class="list">' + again.map(function (k) { return row(G[k], H('jeu/' + k), L.suite[S.suite[k]]); }).join('') + '</ul>' : '') +
      (done.length ? '<h2>' + L.played + '</h2><ul class="list">' + done.map(line).join('') + '</ul>' +
        '<h2>' + L.thplayed + '</h2><p>' + thp.map(function (t) { return '<span class="pill">' + esc(thChip(t)) + ' · ' + S.th[t] + '</span>'; }).join(' ') + '</p>' +
        '<h2>' + L.gplayed + ' : ' + Object.keys(S.n).length + L.of24 + '</h2><p class="small">' + Object.keys(S.n).map(function (k) { return esc(shortT(G[k])) + ' (' + S.n[k] + ')'; }).join(' · ') + '</p>' +
        '<h2>' + L.obsgrid + '</h2><div class="ogrid">' + codes.map(function (c) { var v = S.obs[c] || 0; return '<div class="og l' + v + '"><b>' + c + '</b><span>' + esc(M.items[c].cp) + '</span><i>' + (v ? L.lev[v] : '—') + '</i></div>'; }).join('') + '</div>' : '') +
      (DB.seances.length ? '<div class="btns"><button class="btn" id="exp">' + L.exp + '</button><button class="btn danger" id="era">' + L.erase + '</button></div>' : '');
    document.getElementById('cn').addEventListener('input', function (e) { DB.classe = e.target.value; save(); });
    var ex = document.getElementById('exp'); if (ex) ex.addEventListener('click', function () {
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 1)], { type: 'application/json' })); a.download = 'carnet-anglais-en-mouvement_' + today() + '.json'; document.body.appendChild(a); a.click(); a.remove();
    });
    var er = document.getElementById('era'); if (er) er.addEventListener('click', function () { if (er.getAttribute('data-sure')) { DB = { v: 1, classe: DB.classe, seances: [] }; save(); route(); } else { er.setAttribute('data-sure', '1'); er.textContent = L.erase2; } });
  }
  function plan(id) {
    var s = rec(id); if (!s) return carnet();
    document.documentElement.style.setProperty('--a', '#5b21b6');
    app.innerHTML = top(L.planned, M.thn[s.theme], [H('carnet'), L.backcar]) + '<p class="small">' + nGames(s.jeux.length) + ' · ' + range(s.jeux.map(function (j) { return j.k; })) + (s.niv ? ' · ' + s.niv.toUpperCase() : '') + '</p><ul class="list">' +
      s.jeux.map(function (j) { var g = G[j.k]; return row(g, H('jeu/' + g.k + (g.themes.some(function (t) { return t.id === s.theme; }) ? '/' + s.theme : '')), L.mom[g.m] + ' · ' + g.duree); }).join('') + '</ul>' +
      '<div class="btns"><a class="btn acc" href="' + H('go/c/' + s.id + '/0/0') + '">' + L.launch + '</a><button class="btn danger" id="del">' + L.del + '</button></div><p class="status" id="off"></p><h2>' + L.sixof + esc(M.thn[s.theme].toLowerCase()) + '</h2>' + vocab(s.theme);
    delBtn(s); precache(s.jeux.map(function (j) { return { g: G[j.k], theme: s.theme }; }), document.getElementById('off'));
  }
  function delBtn(s) { var d = document.getElementById('del'); d.addEventListener('click', function () { if (d.getAttribute('data-sure')) { DB.seances = DB.seances.filter(function (x) { return x !== s; }); save(); location.hash = H('carnet'); } else { d.setAttribute('data-sure', '1'); d.textContent = L.del2; } }); }
  function note(id) {
    var s = rec(id); if (!s) return carnet();
    document.documentElement.style.setProperty('--a', '#5b21b6');
    app.innerHTML = top(L.knote, M.thn[s.theme], [H('carnet'), L.backcar]) + '<p class="small">' + esc(fdate(s.d)) + (s.niv ? ' · ' + s.niv.toUpperCase() : '') + '</p>' +
      s.jeux.map(function (j, n) {
        var g = G[j.k];
        return '<div class="card nc"><h2 style="margin:0 0 6px">' + g.n + ' · ' + esc(shortT(g)) + '</h2><div class="who">' + L.next + '</div><div class="chips">' + ['tel', 'simp', 'comp'].map(function (v) { return '<button class="chip" data-suite="' + n + ':' + v + '" aria-pressed="' + (j.suite === v) + '">' + cap(L.suite[v]) + '</button>'; }).join('') + '</div>' +
          '<div class="who">' + L.seen + '</div>' + g.items.map(function (c) { return '<div class="orow"><span><span class="pill">' + c + '</span>' + esc(M.items[c] ? M.items[c].cp : '') + '</span><div class="seg">' + [3, 2, 1].map(function (v) { return '<button data-obs="' + n + ':' + c + ':' + v + '" aria-pressed="' + ((j.obs || {})[c] === v) + '">' + L.lev[v] + '</button>'; }).join('') + '</div></div>'; }).join('') + '</div>';
      }).join('') +
      '<div class="search"><label for="nt">' + L.free + '</label><textarea id="nt" rows="4" placeholder="' + esc(L.freeph) + '">' + esc(s.note || '') + '</textarea></div>' +
      '<div class="btns"><a class="btn acc" href="' + H('carnet') + '">' + L.finish + '</a><button class="btn danger" id="del">' + L.del + '</button></div>';
    app.querySelectorAll('[data-suite]').forEach(function (b) { b.addEventListener('click', function () { var p = b.getAttribute('data-suite').split(':'), j = s.jeux[+p[0]]; j.suite = j.suite === p[1] ? '' : p[1]; save(); keepScroll = true; route(); }); });
    app.querySelectorAll('[data-obs]').forEach(function (b) { b.addEventListener('click', function () { var p = b.getAttribute('data-obs').split(':'), j = s.jeux[+p[0]]; j.obs = j.obs || {}; j.obs[p[1]] = j.obs[p[1]] === +p[2] ? 0 : +p[2]; save(); keepScroll = true; route(); }); });
    document.getElementById('nt').addEventListener('input', function (e) { s.note = e.target.value; save(); });
    delBtn(s);
  }

  /* ---------- B · pendant le jeu ---------- */
  function wake() { if (navigator.wakeLock && !lock) navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }).catch(function () {}); }
  function unwake() { if (lock) { lock.release().catch(function () {}); lock = null; } }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && document.body.classList.contains('play')) wake(); });
  function mmss(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + s % 60).slice(-2); }
  function go(p) {
    var list, pos, step, base, quit, theme, niv = '', r = null, multi = true;
    if (p[1] === 's') { var i = +p[2], s = M.seances[i]; if (!s) return seances(); var on = sel(i); theme = s.theme; list = s.jeux.filter(function (_, n) { return on[n]; }).map(function (j) { return { g: G[j.k], theme: theme, plus: j.plus, k: j.k }; }); base = 'go/s/' + i + '/'; quit = H('seance/' + i); }
    else if (p[1] === 'c') { r = rec(p[2]); if (!r) return carnet(); theme = r.theme; niv = r.niv; list = r.jeux.map(function (j) { return { g: G[j.k], theme: theme, plus: j.plus, k: j.k }; }); base = 'go/c/' + r.id + '/'; quit = H((r.fait ? 'note/' : 'plan/') + r.id); }
    else { var kk = (p[2] || '').split('~'); if (!G[kk[0]]) return home(); theme = kk[1] || G[kk[0]].theme; list = [{ g: G[kk[0]], theme: theme, k: kk[0] }]; base = 'go/j/' + p[2] + '/'; quit = H('jeu/' + kk[0] + (kk[1] ? '/' + kk[1] : '')); multi = false; }
    pos = multi ? (p[3] === 'fin' ? 'fin' : +p[3]) : (p[3] === 'fin' ? 'fin' : 0); step = multi ? (+p[4] || 0) : (+p[3] || 0);
    document.body.classList.add('play'); wake();
    var key = p.slice(1, 3).join('/');
    var url = function (ps, stp) { return H(base + (multi ? ps + '/' + stp : stp)); };
    if (pos === 'fin' || !list[pos]) {
      var t = T0[key], nid = '';
      if (t) { if (r) { r.fait = true; r.d = today(); save(); nid = r.id; } else nid = newRec(theme, niv, list, true).id; t.rec = nid; }
      app.innerHTML = '<div class="pend"><span class="pk">' + (multi ? L.done : L.done1) + '</span><h1>' + esc(multi ? M.thn[theme] : shortT(list[0].g)) + '</h1><p class="pstep">' + nGames(list.length) + (t ? ' · ' + mmss(Date.now() - t.start) : '') + '</p><div class="pnav2">' +
        (nid ? '<a class="hi" href="' + H('note/' + nid) + '">' + L.noteit + '</a>' : '') + '<a href="' + quit + '">' + L.backto + '</a>' + (multi ? '<a href="' + H('seances') + '">' + L.other2 + '</a>' : '') + '</div></div>';
      delete T0[key]; return;
    }
    if (!T0[key]) T0[key] = { start: Date.now(), games: {} };
    var en = list[pos], g = en.g; step = Math.min(3, Math.max(0, step)); var u = g.vues[step];
    var v = en.theme !== g.theme ? g.themes.filter(function (x) { return x.id === en.theme; })[0] : null;
    if (!T0[key].games[pos]) T0[key].games[pos] = Date.now();
    var says = u.says.slice();
    if (step === 1 && v) says = v.ph.concat(says).slice(0, 2);
    if (step === 1 && !says.length && g.adulte.length) says = [g.adulte[0]];
    var nt = '';
    if (step === 0) nt = '<div class="pnote"><b>' + L.disp + '</b>' + esc(g.dispositif) + '</div>' + (v ? '<div class="pnote"><b>' + L.withth + esc(M.thn[en.theme].toLowerCase()) + '</b>' + v.h + '</div>' : (en.plus ? '<div class="pnote"><b>' + L.inthis + '</b>' + esc(cap(en.plus)) + '</div>' : ''));
    else if (step === 2 && g.eleve.length) nt = '<div class="pnote"><b>' + L.el + '</b>' + sayInline(g.eleve[0]) + '</div>';
    else if (step === 3) nt = '<div class="pnote"><b>' + L.obs + '</b>' + g.observe + '</div>';
    var last = step === 3, nextG = list[pos + 1];
    var next = !last ? '<a class="next" href="' + url(pos, step + 1) + '">' + L.step + ' ' + (step + 2) + ' · ' + esc(g.vues[step + 1].t.toLowerCase()) + ' ›</a>'
      : (nextG ? '<a class="next" href="' + url(pos + 1, 0) + '">' + L.nextg + esc(shortT(nextG.g)) + ' ›</a>' : '<a class="next" href="' + H(base + 'fin') + '">' + (multi ? L.endse : L.endg) + '</a>');
    var prev = step > 0 ? url(pos, step - 1) : (pos > 0 ? url(pos - 1, 3) : quit);
    app.innerHTML = '<div class="ptop"><b>' + esc(shortT(g)) + '</b><span>' + (multi ? L.gameof.replace('{}', pos + 1).replace('{}', list.length) + ' · ' : '') + '<span id="clk">00:00</span></span><a href="' + quit + '" aria-label="' + L.quitl + '">' + L.quit + '</a></div>' +
      '<div class="segs" role="img" aria-label="' + L.step + ' ' + (step + 1) + ' / 4">' + [0, 1, 2, 3].map(function (n) { return '<span class="' + (n < step ? 'd' : n === step ? 'c' : '') + '"></span>'; }).join('') + '</div>' +
      '<div><span class="pk">' + L.step + ' ' + (step + 1) + ' · ' + esc(u.t) + '</span><p class="pstep">' + esc(u.fr) + '</p></div><div class="pview">' + u.svg + '</div>' + says.map(function (x) { return ph(x, 'psay'); }).join('') + nt +
      (last ? '<div class="pnav2"><a href="' + url(pos, 1) + '">' + L.replay + '</a></div>' : '') + '<div class="pnav"><a class="prev" href="' + prev + '" aria-label="' + L.prev + '">‹</a>' + next + '</div>';
    var clk = document.getElementById('clk'), t0 = T0[key].games[pos], up = function () { if (clk) clk.textContent = mmss(Date.now() - t0); };
    up(); tick = setInterval(up, 1000);
  }

  /* ---------- routeur ---------- */
  function route() {
    var p = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    var l = p[0] === 'en' ? 'en' : 'fr'; if (l === 'en') p.shift();
    if (l !== LANG || !M) setLang(l);
    if (tick) { clearInterval(tick); tick = null; }
    if (p[0] !== 'go') { document.body.classList.remove('play'); unwake(); }
    document.documentElement.style.setProperty('--a', '#0f766e');
    var r = 0;
    if (p[0] === 'jeu') game(p[1], p[2]);
    else if (p[0] === 'themes') { r = 1; themes(); }
    else if (p[0] === 'theme') { r = 1; theme(p[1]); }
    else if (p[0] === 'classe') { r = 2; classe(); }
    else if (p[0] === 'seances') { r = 3; seances(); }
    else if (p[0] === 'seance') { r = 3; seance(+p[1]); }
    else if (p[0] === 'go') { r = p[1] === 'c' ? 4 : 3; go(p); }
    else if (p[0] === 'preparer') { r = 4; preparer(); }
    else if (p[0] === 'carnet') { r = 4; carnet(); }
    else if (p[0] === 'plan') { r = 4; plan(p[1]); }
    else if (p[0] === 'note') { r = 4; note(p[1]); }
    else home();
    var paths = ['', 'themes', 'classe', 'seances', 'carnet'];
    nav.innerHTML = paths.map(function (x, i) { return '<a href="' + H(x) + '"' + (i === r ? ' class="on" aria-current="page"' : '') + '>' + L.nav[i] + '</a>'; }).join('');
    if (!document.body.classList.contains('play')) {
      var rest = p.join('/'), a = document.createElement('a'); a.className = 'lang'; a.textContent = L.other; a.setAttribute('lang', LANG === 'fr' ? 'en' : 'fr');
      a.href = '#/' + (LANG === 'fr' ? 'en/' : '') + rest; app.insertBefore(a, app.firstChild);
    }
    document.title = LANG === 'fr' ? "L'anglais en mouvement · le manuel" : 'English on the move · the handbook';
    if (!keepScroll) window.scrollTo(0, 0);
    keepScroll = false;
  }
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
