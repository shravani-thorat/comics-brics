(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rupee(n) { return '\u20B9' + n; }
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function fmtHour(h) { return (h > 12 ? h - 12 : h) + ':00 ' + (h >= 12 ? 'pm' : 'am'); }
  function cleanPhone(v) { return v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, ''); }
  var WA = '919876543210';

  /* ---------- routing ---------- */
  var PAGES = ['home', 'comics', 'play', 'menu', 'book'];
  var TITLES = { home: 'Comics & Brics Cafe | Comics, Board Games, Lego Room and Food', comics: 'The comics wall | Comics & Brics', play: 'Games & Lego | Comics & Brics', menu: 'The menu | Comics & Brics', book: 'Book your visit | Comics & Brics' };
  function showPage(name) {
    if (PAGES.indexOf(name) < 0) { name = 'home'; }
    qsa('.page').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-page') === name); });
    qsa('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === name); });
    document.title = TITLES[name];
    closeNav();
    window.scrollTo(0, 0);
    if (name === 'home') { runCounters(); }
  }
  function route() { showPage((location.hash || '').replace('#', '')); }
  function go(name) { if (location.hash === '#' + name) { showPage(name); } else { location.hash = name; } }
  window.addEventListener('hashchange', route);
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]');
    if (!g) { return; }
    var tab = g.getAttribute('data-tab');
    go(g.getAttribute('data-go'));
    if (tab) { setTimeout(function () { setPlayTab(tab); }, 0); }
  });
  function closeNav() {
    $('nav').classList.remove('open');
    $('burger').setAttribute('aria-expanded', 'false');
    $('burger').setAttribute('aria-label', 'Open menu');
  }
  $('burger').addEventListener('click', function () {
    var open = $('nav').classList.toggle('open');
    this.setAttribute('aria-expanded', open ? 'true' : 'false');
    this.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  function runCounters() {
    qsa('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10), start = null;
      var suffix = target >= 100 ? '+' : '';
      function step(ts) {
        if (start === null) { start = ts; }
        var p = Math.min(1, (ts - start) / 1000);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
        if (p < 1) { requestAnimationFrame(step); }
      }
      el.textContent = '0';
      requestAnimationFrame(step);
    });
  }

  /* ---------- hero bubble ---------- */
  var LINES = ['Psst! Tap this bubble.', 'Fresh issue just landed on the wall!', 'Who wants to play one more round?', 'The Lego room has a new build theme.', 'Hot take: the brownie is a hero.', 'Bring a friend. Beat them at Catan.', 'Shhh, the quiet corner is open.'];
  var li = 0;
  $('bubble').addEventListener('click', function () {
    li = (li + 1) % LINES.length;
    $('bubbleText').textContent = LINES[li];
    this.classList.remove('pop');
    void this.offsetWidth;
    this.classList.add('pop');
  });

  /* ---------- quiz ---------- */
  var QUIZ = [
    { q: 'Pick a superpower.', o: [['Super strength', 'hero'], ['Time travel', 'scifi'], ['Reading minds', 'indie'], ['Endless energy', 'manga']] },
    { q: 'Your perfect Saturday?', o: [['Game night with a big crew', 'hero'], ['A quiet corner and a thick book', 'indie'], ['Binge an epic saga', 'manga'], ['Exploring a made-up world', 'scifi']] },
    { q: 'Pick a movie night.', o: [['Big action blockbuster', 'hero'], ['Space or dragons', 'scifi'], ['A quirky little film', 'indie'], ['An animated adventure', 'manga']] },
    { q: 'Snack time. What are you grabbing?', o: [['A stacked burger', 'hero'], ['Hot noodles', 'manga'], ['A strong cold brew', 'indie'], ['Loaded nachos', 'scifi']] }
  ];
  var RESULTS = {
    hero: { n: 'The Team Player', d: 'You love big heroes, big stakes and playing together.', c: 'Superhero runs and team-ups', g: 'Pandemic or Forbidden Island', f: 'Origin Story Burger' },
    manga: { n: 'The Saga Binger', d: 'Once you start a series, you read it to the final volume.', c: 'Long-running manga series', g: 'Sushi Go! or Codenames', f: 'Sequel Noodles' },
    indie: { n: 'The Deep Reader', d: 'You like stories with heart, odd art and a little silence.', c: 'Graphic novels and indie stories', g: 'Azul or Carcassonne', f: 'Slow Burn Cold Brew' },
    scifi: { n: 'The World Builder', d: 'Maps, spaceships and invented history are your happy place.', c: 'Sci-fi and fantasy epics', g: 'Catan or Terraforming Mars', f: 'Side Quest Nachos' }
  };
  var qi = 0, qScore = {};
  function renderQuiz() {
    $('qBar').style.width = (qi / QUIZ.length * 100) + '%';
    if (qi >= QUIZ.length) {
      var best = 'hero', max = -1;
      Object.keys(RESULTS).forEach(function (k) { if ((qScore[k] || 0) > max) { max = qScore[k] || 0; best = k; } });
      var r = RESULTS[best];
      $('qBody').innerHTML = '<div class="q-res"><h3>' + esc(r.n) + '</h3><p>' + esc(r.d) + '</p><dl><div><dt>Read this</dt><dd>' + esc(r.c) + '</dd></div><div><dt>Play this</dt><dd>' + esc(r.g) + '</dd></div><div><dt>Eat this</dt><dd>' + esc(r.f) + '</dd></div></dl>' +
        '<div class="btns"><button type="button" class="btn btn-red sm" id="qBook">Book a table</button><button type="button" class="btn btn-white sm" id="qAgain">Take it again</button></div></div>';
      return;
    }
    var q = QUIZ[qi];
    $('qBody').innerHTML = '<p class="q-q">' + esc(q.q) + '</p><div class="q-opts">' + q.o.map(function (o, i) { return '<button type="button" class="q-opt" data-o="' + i + '">' + esc(o[0]) + '</button>'; }).join('') + '</div>';
  }
  $('qBody').addEventListener('click', function (e) {
    var b = e.target.closest('[data-o]');
    if (b) {
      var type = QUIZ[qi].o[parseInt(b.getAttribute('data-o'), 10)][1];
      qScore[type] = (qScore[type] || 0) + 1;
      qi++;
      renderQuiz();
      return;
    }
    if (e.target.id === 'qAgain') { qi = 0; qScore = {}; renderQuiz(); }
    if (e.target.id === 'qBook') { go('book'); }
  });
  renderQuiz();

  /* ---------- comics ---------- */
  var COMICS = [
    ['Watchmen', 'Superhero', 'Dark', 340], ['Batman: Year One', 'Superhero', 'Origin', 215], ['Ms. Marvel', 'Superhero', 'Teen hero', 330], ['Spider-Man: Blue', 'Superhero', 'Classic', 205], ['X-Men: Days of Future Past', 'Superhero', 'Time bending', 355], ['Hellboy', 'Superhero', 'Supernatural', 10],
    ['One Piece', 'Manga', 'Adventure', 200], ['Naruto', 'Manga', 'Ninja saga', 25], ['Death Note', 'Manga', 'Thriller', 280], ['Fullmetal Alchemist', 'Manga', 'Fantasy', 8], ['Dragon Ball', 'Manga', 'Action', 35], ['Attack on Titan', 'Manga', 'Epic', 350],
    ['Maus', 'Graphic novel', 'History', 20], ['Persepolis', 'Graphic novel', 'Memoir', 315], ['Fun Home', 'Graphic novel', 'Memoir', 345], ['Blankets', 'Graphic novel', 'Coming of age', 215],
    ['Scott Pilgrim', 'Indie', 'Comedy', 140], ['Bone', 'Indie', 'Fantasy comedy', 125], ['Daytripper', 'Indie', 'Life story', 190], ['Nimona', 'Indie', 'Fantasy', 300],
    ['Saga', 'Sci-fi and fantasy', 'Space opera', 345], ['The Sandman', 'Sci-fi and fantasy', 'Dark fantasy', 265], ['Y: The Last Man', 'Sci-fi and fantasy', 'Post-apocalypse', 12], ['Akira', 'Sci-fi and fantasy', 'Cyberpunk', 355],
    ['Tintin', 'Kids and classics', 'Adventure', 28], ['Asterix', 'Kids and classics', 'Humour', 50], ['Calvin and Hobbes', 'Kids and classics', 'Strips', 30], ['Amar Chitra Katha', 'Kids and classics', 'Indian tales', 38], ['Tinkle', 'Kids and classics', 'Indian kids', 160], ['Chacha Chaudhary', 'Kids and classics', 'Indian classic', 48]
  ];
  var GCOL = { 'Superhero': 340, 'Manga': 25, 'Graphic novel': 215, 'Indie': 150, 'Sci-fi and fantasy': 265, 'Kids and classics': 48 };
  var GENRES = ['All', 'Superhero', 'Manga', 'Graphic novel', 'Indie', 'Sci-fi and fantasy', 'Kids and classics'];
  var cState = { g: 'All', q: '' };
  var pull = [];
  try { pull = JSON.parse(localStorage.getItem('cb_pull') || '[]').filter(function (t) { return COMICS.some(function (c) { return c[0] === t; }); }); } catch (e) { pull = []; }
  function savePull() { try { localStorage.setItem('cb_pull', JSON.stringify(pull)); } catch (e) { /* ignore */ } }

  function renderChips() {
    $('cChips').innerHTML = GENRES.map(function (g) {
      return '<button type="button" class="chip' + (g === cState.g ? ' on' : '') + '" data-g="' + esc(g) + '" aria-pressed="' + (g === cState.g) + '">' + esc(g) + '</button>';
    }).join('');
  }
  function renderCovers() {
    var out = [], n = 0;
    COMICS.forEach(function (c, i) {
      if (cState.g !== 'All' && c[1] !== cState.g) { return; }
      if (cState.q && c[0].toLowerCase().indexOf(cState.q) < 0) { return; }
      n++;
      var h = GCOL[c[1]] || 200, inList = pull.indexOf(c[0]) > -1;
      out.push('<article class="cover"><div class="art" style="background:linear-gradient(155deg,hsl(' + h + ',85%,52%),hsl(' + ((h + 40) % 360) + ',70%,28%))"><i>' + esc(c[1]) + '</i><b>' + esc(c[0]) + '</b></div><div class="cover-b"><span>' + esc(c[2]) + '</span><button type="button" class="addb' + (inList ? ' in' : '') + '" data-add="' + i + '" aria-pressed="' + inList + '">' + (inList ? 'On your list' : 'Add to list') + '</button></div></article>');
    });
    $('covers').innerHTML = out.join('');
    $('cNone').hidden = n > 0;
    $('cCount').textContent = 'Showing ' + n + ' of ' + COMICS.length + ' sample titles (thousands on our walls)';
  }
  function renderPull() {
    $('pullList').innerHTML = pull.map(function (t, i) { return '<li><span>' + esc(t) + '</span><button type="button" data-rm="' + i + '" aria-label="Remove ' + esc(t) + '">&times;</button></li>'; }).join('');
    $('pullEmpty').hidden = pull.length > 0;
  }
  $('cChips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-g]');
    if (!b) { return; }
    cState.g = b.getAttribute('data-g'); renderChips(); renderCovers();
  });
  $('cSearch').addEventListener('input', function () { cState.q = this.value.trim().toLowerCase(); renderCovers(); });
  $('cReset').addEventListener('click', function () { cState = { g: 'All', q: '' }; $('cSearch').value = ''; renderChips(); renderCovers(); });
  $('covers').addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (!b) { return; }
    var t = COMICS[parseInt(b.getAttribute('data-add'), 10)][0], k = pull.indexOf(t);
    if (k > -1) { pull.splice(k, 1); } else { pull.push(t); toast(t + ' added to your pull list'); }
    savePull(); renderCovers(); renderPull();
    var again = document.querySelector('#covers [data-add="' + b.getAttribute('data-add') + '"]');
    if (again) { again.focus(); }
  });
  $('pullList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-rm]');
    if (!b) { return; }
    pull.splice(parseInt(b.getAttribute('data-rm'), 10), 1);
    savePull(); renderCovers(); renderPull();
  });
  $('pullClear').addEventListener('click', function () { pull = []; savePull(); renderCovers(); renderPull(); toast('Pull list cleared'); });
  $('pullBook').addEventListener('click', function () {
    if (!pull.length) { toast('Add a comic to your list first'); return; }
    selectPlan('Read comics', true);
    addNote('Please have these waiting: ' + pull.join(', ') + '.');
    go('book');
  });
  renderChips(); renderCovers(); renderPull();

  /* ---------- games ---------- */
  var GAMES = [
    ['Catan', 3, 4, 90, 'Strategy'], ['Ticket to Ride', 2, 5, 60, 'Family'], ['Codenames', 4, 8, 20, 'Party'], ['Pandemic', 2, 4, 60, 'Co-op'], ['Azul', 2, 4, 40, 'Strategy'], ['Carcassonne', 2, 5, 40, 'Family'],
    ['Exploding Kittens', 2, 5, 15, 'Party'], ['Sushi Go!', 2, 5, 15, 'Family'], ['Splendor', 2, 4, 30, 'Strategy'], ['Sagrada', 1, 4, 40, 'Dice and puzzle'], ['Wingspan', 1, 5, 70, 'Strategy'], ['Terraforming Mars', 1, 5, 150, 'Epic'],
    ['Twilight Imperium', 3, 6, 180, 'Epic'], ['Werewolf', 6, 12, 30, 'Party'], ['Dixit', 3, 6, 30, 'Family'], ['Jenga', 1, 8, 15, 'Classic'], ['Uno', 2, 10, 20, 'Classic'], ['Chess', 2, 2, 45, 'Classic'],
    ['Forbidden Island', 2, 4, 30, 'Co-op'], ['Hanabi', 2, 5, 25, 'Co-op'], ['Cluedo', 3, 6, 60, 'Mystery'], ['7 Wonders', 3, 7, 45, 'Strategy'], ['Taboo', 4, 10, 30, 'Party'], ['Betrayal at House on the Hill', 3, 6, 75, 'Mystery']
  ];
  function renderGames() {
    var p = parseInt($('plRange').value, 10), t = parseInt($('tmRange').value, 10), out = [];
    $('plOut').textContent = p + (p === 1 ? ' player' : ' players');
    $('tmOut').textContent = t >= 180 ? 'Any' : 'Up to ' + (t >= 60 ? (t % 60 ? Math.floor(t / 60) + ' hr ' + (t % 60) + ' min' : (t / 60) + ' hr') : t + ' min');
    GAMES.forEach(function (g) {
      if (g[1] > p || g[2] < p) { return; }
      if (t < 180 && g[3] > t) { return; }
      out.push('<article class="gcard"><h3>' + esc(g[0]) + '</h3><p>' + g[1] + (g[1] === g[2] ? '' : ' to ' + g[2]) + ' players &middot; about ' + g[3] + ' min</p><div class="gtags"><span>' + esc(g[4]) + '</span></div></article>');
    });
    $('glist').innerHTML = out.length ? out.join('') : '<p>No games fit that mix. Try a longer time or a different group size.</p>';
    $('gCount').textContent = out.length + ' of ' + GAMES.length + ' sample games fit (hundreds on our shelves)';
  }
  $('plRange').addEventListener('input', renderGames);
  $('tmRange').addEventListener('input', renderGames);
  $('gReset').addEventListener('click', function () { $('plRange').value = 4; $('tmRange').value = 180; renderGames(); });
  renderGames();

  /* ---------- play tabs + lego ---------- */
  function setPlayTab(name) {
    qsa('.ptab').forEach(function (b) { var on = b.getAttribute('data-ptab') === name; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    $('panel-games').hidden = name !== 'games';
    $('panel-lego').hidden = name !== 'lego';
  }
  qsa('.ptab').forEach(function (b) { b.addEventListener('click', function () { setPlayTab(b.getAttribute('data-ptab')); }); });
  var SESSIONS = [
    { n: 'Free build', len: '60 minutes', who: 'Ages 6 and up', left: 11, of: 16, d: 'Grab a table and a tray of bricks and build whatever you like. Great for solo builders and friends.' },
    { n: 'Challenge build', len: '90 minutes', who: 'Ages 10 and up', left: 4, of: 10, d: 'A themed build with a timer and a vote at the end. This week: a vehicle that could cross a comic city.' },
    { n: 'Little builders', len: '60 minutes', who: 'Ages 4 to 8, with a grown-up', left: 6, of: 8, d: 'A calmer session with big bricks, simple models and a helper on hand.' }
  ];
  $('sessions').innerHTML = SESSIONS.map(function (s, i) {
    return '<article class="sess"><div class="sess-top"><h3>' + esc(s.n) + '</h3></div><div class="sess-b"><p><strong>' + esc(s.len) + '</strong> &middot; ' + esc(s.who) + '</p><p>' + esc(s.d) + '</p><div class="meter" role="img" aria-label="' + s.left + ' of ' + s.of + ' spots left"><span style="width:' + Math.round((s.of - s.left) / s.of * 100) + '%"></span></div><p><strong>' + s.left + '</strong> of ' + s.of + ' spots left today</p><button type="button" class="btn btn-red sm" data-sess="' + i + '">Save a spot</button></div></article>';
  }).join('');
  $('sessions').addEventListener('click', function (e) {
    var b = e.target.closest('[data-sess]');
    if (!b) { return; }
    var s = SESSIONS[parseInt(b.getAttribute('data-sess'), 10)];
    selectPlan('Build in the Lego room', true);
    addNote('Lego session: ' + s.n + '.');
    go('book');
    toast(s.n + ' added to your booking');
  });

  /* ---------- menu ---------- */
  var MENU = [
    ['Starters', 'Side Quest Nachos', 'Corn chips, cheese sauce, jalapenos, salsa. Made for sharing.', 239, 1],
    ['Starters', 'Hot Take Wings', 'Six crispy wings with a fiery garlic glaze.', 289, 0],
    ['Starters', 'Origin Story Fries', 'Crisp fries with peri-peri dust and garlic dip.', 169, 1],
    ['Starters', 'Easter Egg Cheese Balls', 'Hidden molten cheese inside a golden crunch.', 219, 1],
    ['Starters', 'Sidekick Garlic Bread', 'Toasted baguette, garlic butter, mozzarella.', 169, 1],
    ['Mains', 'Origin Story Burger', 'Juicy chicken patty, cheese, pickles, house sauce.', 279, 0],
    ['Mains', 'Sequel Noodles', 'Wok noodles with vegetables and a spicy soy glaze.', 249, 1],
    ['Mains', 'Crossover Pizza', 'Four cheeses on a thin crust. A crossover event.', 329, 1],
    ['Mains', 'Final Boss Pasta', 'Creamy penne with herbs, parmesan and chilli oil.', 289, 1],
    ['Mains', 'Speech Bubble Wrap', 'Tandoori chicken, onions and mint mayo in a warm wrap.', 249, 0],
    ['Mains', 'Secret Identity Sandwich', 'Grilled vegetables and cheese with a hidden chutney.', 199, 1],
    ['Sips', 'Slow Burn Cold Brew', 'Steeped overnight. Smooth, strong and serious.', 189, 1],
    ['Sips', 'Power-Up Cold Coffee', 'Thick, sweet and ready for a long game.', 169, 1],
    ['Sips', 'Issue #1 Masala Chai', 'Strong, spiced and served in a kulhad.', 99, 1],
    ['Sips', 'Mint Condition Mojito', 'Fresh mint, lime and soda.', 149, 1],
    ['Sips', 'Multiverse Shake', 'Vanilla, chocolate and caramel in one glass.', 219, 1],
    ['Sweets', 'Brick by Brick Brownie', 'Stacked squares of warm brownie with vanilla ice cream.', 189, 1],
    ['Sweets', 'Happy Ending Tiramisu', 'Coffee-soaked sponge and mascarpone in a cup.', 209, 1],
    ['Sweets', 'Panel by Panel Pancakes', 'Fluffy stack with maple syrup and berries.', 199, 1]
  ];
  var MCATS = ['All', 'Starters', 'Mains', 'Sips', 'Sweets'];
  var mCat = 'All';
  function renderMenu() {
    $('mTabs').innerHTML = MCATS.map(function (c) {
      return '<button type="button" class="chip' + (c === mCat ? ' on' : '') + '" role="tab" data-mc="' + c + '" aria-selected="' + (c === mCat) + '">' + c + '</button>';
    }).join('');
    var items = MENU.filter(function (m) { return (mCat === 'All' || m[0] === mCat) && (!$('vegOnly').checked || m[4]); });
    var sort = $('sortBy').value;
    if (sort === 'low') { items = items.slice().sort(function (a, b) { return a[3] - b[3]; }); }
    if (sort === 'high') { items = items.slice().sort(function (a, b) { return b[3] - a[3]; }); }
    $('mgrid').innerHTML = items.length ? items.map(function (m) {
      return '<article class="dish"><div class="dish-h"><h3><span class="dot' + (m[4] ? '' : ' nv') + '" title="' + (m[4] ? 'Vegetarian' : 'Non-vegetarian') + '"></span>' + esc(m[1]) + '</h3><span class="pr">' + rupee(m[3]) + '</span></div><p>' + esc(m[2]) + '</p></article>';
    }).join('') : '<p>Nothing matches. Try turning off the veg filter.</p>';
  }
  $('mTabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-mc]');
    if (!b) { return; }
    mCat = b.getAttribute('data-mc'); renderMenu();
  });
  $('vegOnly').addEventListener('change', renderMenu);
  $('sortBy').addEventListener('change', renderMenu);
  renderMenu();

  /* ---------- dialog ---------- */
  var lastFocus = null;
  function openDialog(html) {
    lastFocus = document.activeElement;
    $('dBody').innerHTML = html;
    $('overlay').hidden = false;
    document.body.style.overflow = 'hidden';
    var f = $('dBody').querySelector('a,button');
    (f || $('dClose')).focus();
  }
  function closeDialog() {
    if ($('overlay').hidden) { return; }
    $('overlay').hidden = true;
    $('dBody').innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
  }
  $('dClose').addEventListener('click', closeDialog);
  $('overlay').addEventListener('click', function (e) { if (e.target === this) { closeDialog(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDialog(); closeNav(); } });

  /* ---------- booking wizard ---------- */
  var step = 0, guests = 4, plans = [];
  function selectPlan(name, on) {
    var i = plans.indexOf(name);
    if (on && i < 0) { plans.push(name); }
    if (!on && i > -1) { plans.splice(i, 1); }
    qsa('.plan').forEach(function (b) { b.setAttribute('aria-pressed', plans.indexOf(b.getAttribute('data-plan')) > -1 ? 'true' : 'false'); });
    if (plans.length) { $('ePlan').textContent = ''; }
  }
  function addNote(text) {
    var n = $('bNote');
    if (n.value.indexOf(text) < 0) { n.value = (n.value ? n.value + ' ' : '') + text; }
  }
  $('plans').addEventListener('click', function (e) {
    var b = e.target.closest('[data-plan]');
    if (!b) { return; }
    selectPlan(b.getAttribute('data-plan'), b.getAttribute('aria-pressed') !== 'true');
  });
  function buildTimes() {
    var isToday = $('bDate').value === todayStr(), nowH = new Date().getHours(), cur = $('bTime').value, html = '<option value="">Choose a time</option>';
    for (var h = 11; h <= 22; h++) { html += '<option value="' + h + '"' + (isToday && h <= nowH ? ' disabled' : '') + '>' + fmtHour(h) + '</option>'; }
    $('bTime').innerHTML = html;
    if (cur && !(isToday && parseInt(cur, 10) <= nowH)) { $('bTime').value = cur; }
  }
  $('bDate').min = todayStr();
  $('bDate').value = todayStr();
  buildTimes();
  $('bDate').addEventListener('change', buildTimes);
  $('gm').addEventListener('click', function () { guests = Math.max(1, guests - 1); $('gc').textContent = guests; });
  $('gp').addEventListener('click', function () {
    if (guests >= 20) { toast('For groups over 20, please call us.'); return; }
    guests++; $('gc').textContent = guests;
  });
  function setErr(id, msg) { $(id).textContent = msg || ''; if ($(id).parentNode.classList.contains('f')) { $(id).parentNode.classList.toggle('bad', !!msg); } }
  function showStep(n) {
    step = n;
    qsa('.step').forEach(function (s) { s.hidden = parseInt(s.getAttribute('data-step'), 10) !== n; });
    qsa('#steps li').forEach(function (li, i) { li.classList.toggle('on', i === n); li.classList.toggle('done', i < n); });
    $('wBack').hidden = n === 0;
    $('wNext').textContent = n === 2 ? 'Confirm booking' : 'Next';
    var first = document.querySelector('.step:not([hidden]) input, .step:not([hidden]) .plan');
    if (first && n > 0) { first.focus(); }
  }
  function validate(n) {
    var ok = true;
    if (n === 0) {
      if (!plans.length) { $('ePlan').textContent = 'Pick at least one plan.'; ok = false; } else { $('ePlan').textContent = ''; }
    }
    if (n === 1) {
      var d = $('bDate').value;
      if (!d || d < todayStr()) { setErr('eDate', 'Choose today or a later date.'); ok = false; } else { setErr('eDate'); }
      if (!$('bTime').value) { setErr('eTime', 'Choose a time.'); ok = false; } else { setErr('eTime'); }
    }
    if (n === 2) {
      if ($('bName').value.trim().length < 2) { setErr('eName', 'Enter your name.'); ok = false; } else { setErr('eName'); }
      if (!/^[6-9]\d{9}$/.test(cleanPhone($('bPhone').value))) { setErr('ePhone', 'Enter a valid 10-digit mobile number.'); ok = false; } else { setErr('ePhone'); }
    }
    return ok;
  }
  $('wBack').addEventListener('click', function () { showStep(Math.max(0, step - 1)); });
  $('wiz').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(step)) { return; }
    if (step < 2) { showStep(step + 1); return; }
    var name = $('bName').value.trim(), date = $('bDate').value, hour = parseInt($('bTime').value, 10), note = $('bNote').value.trim();
    var code = 'CB-' + Math.floor(1000 + Math.random() * 9000);
    var nice = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    var msg = 'Hi Comics & Brics! Booking ' + code + '\nName: ' + name + '\nDate: ' + nice + '\nTime: ' + fmtHour(hour) + '\nGuests: ' + guests + '\nPlan: ' + plans.join(', ') + (note ? '\nNotes: ' + note : '');
    try { localStorage.setItem('cb_last_booking', JSON.stringify({ code: code, date: date, hour: hour })); } catch (err) { /* ignore */ }
    openDialog('<h2 id="dTitle">You are booked!</h2><span class="code" id="bCode">' + code + '</span><p>' + esc(name) + ', that is ' + guests + (guests === 1 ? ' guest' : ' guests') + ' on ' + esc(nice) + ' at ' + fmtHour(hour) + ' for: ' + esc(plans.join(', ')) + '.</p><p>Send the details on WhatsApp so the team can confirm.</p>' +
      '<div class="btns"><a class="btn btn-red sm" id="bWa" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '">Send on WhatsApp</a><button type="button" class="btn btn-white sm" id="bDone">Done</button></div>');
  });
  $('dBody').addEventListener('click', function (e) {
    if (e.target.id !== 'bDone') { return; }
    closeDialog();
    plans = []; selectPlan('', false);
    $('wiz').reset(); guests = 4; $('gc').textContent = 4;
    $('bDate').value = todayStr(); buildTimes();
    showStep(0);
    toast('Booking saved. See you soon!');
    go('home');
  });

  route();
})();
