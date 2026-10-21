/* K Ref-Archive · X5 작동 시안 — 공통(상태·자료·움직임 도구)
   정본 시안 3(Main.dc.html 등, 2026-10-20 D1~D4 반영본)의 동작을 보통 자바스크립트로 옮기고 X5 규칙을 더함.
   오푸스 5.5 (B 계정 X5 적용 방) · 2026-10-21 */
'use strict';
var KR = window.KR = window.KR || {};

/* ── 저장(이 브라우저에만, 실패해도 그냥 넘어감) ── */
KR.load = function (k, d) { try { var v = localStorage.getItem('krx-' + k); return v === null ? d : v; } catch (e) { return d; } };
KR.save = function (k, v) { try { localStorage.setItem('krx-' + k, String(v)); } catch (e) {} };
KR.loadJ = function (k, d) { try { var v = localStorage.getItem('krx-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
KR.saveJ = function (k, v) { try { localStorage.setItem('krx-' + k, JSON.stringify(v)); } catch (e) {} };

/* ── 고정 값(정본 시안 그대로) ── */
KR.SEEN_MAX = 5000; KR.CMP_MAX = 30; KR.LP_MS = 1000; KR.LP_STEP = 64; KR.GD_W = 84; KR.GD_COLS = 7; KR.GD_MAX = 28; KR.DRAG_START = 8;
KR.FIELDS = [['frame', '프레임 크기'], ['tod', '시간대'], ['light', '조명'], ['ltype', '광원'], ['io', '실내·외'], ['shot', '샷 유형'], ['lsize', '렌즈'], ['comp', '구도'], ['loc', '장소 유형']];
KR.FRAME_ORDER = ['익스트림 와이드 샷', '와이드 샷', '미디엄 와이드 샷', '미디엄 샷', '미디엄 클로즈업', '클로즈업', '익스트림 클로즈업'];
KR.FRAME_CODE = ['EWS', 'WS', 'MWS', 'MS', 'MCU', 'CU', 'ECU'];
KR.SHAPES = [['1.33', 4 / 3], ['1.5', 1.5], ['1.66', 5 / 3], ['1.78', 16 / 9], ['1.85', 1.85], ['1.9', 1.9], ['2', 2], ['2.2', 2.2], ['2.35', 2.35], ['2.39', 2.39], ['2.55', 2.55], ['2.76', 2.76], ['9:16', 9 / 16]];
KR.TONE = { b: ['밝기', 0, 100, 1], k: ['색온도', 2000, 12000, 100], s: ['채도', 0, 100, 1], c: ['대비', 0, 100, 1], sh: ['선명도', 0, 100, 1] };
KR.TONE_ENDS = { b: ['어두움', '밝음'], k: ['따뜻함', '차가움'], s: ['무채색', '진함'], c: ['낮음', '높음'], sh: ['부드러움', '선명함'] };
KR.GROUPS = { light: ['b', 'k'], quality: ['s', 'c', 'sh'] };
KR.MEDIA = ['영화·TV', '광고', '뮤직비디오'];
KR.SORTS = [['mix', '섞기', '다시 누르면 새로'], ['recent', '최근 저장순', ''], ['year', '연도순', '최신 먼저'], ['title', '작품명순', '가나다']];
KR.QUICK = [['#C4403A', '빨강'], ['#DB8A2E', '주황'], ['#D8C04A', '노랑'], ['#4E9A55', '초록'], ['#2F9A96', '청록'], ['#3F6FCB', '파랑'], ['#2B3A7C', '남색'], ['#7D57B8', '보라'], ['#D25C94', '분홍'], ['#7A5233', '갈색'], ['#EBE7E0', '흰색'], ['#1E1E1E', '검정']];
KR.WORDS = { b: [[25, '어두움'], [45, '약간 어두움'], [60, '보통'], [75, '밝음'], [101, '아주 밝음']], c: [[20, '낮음'], [35, '보통'], [50, '높음'], [101, '아주 높음']], s: [[10, '거의 무채색'], [25, '낮음'], [45, '보통'], [65, '높음'], [101, '아주 높음']], k: [[3500, '아주 따뜻함'], [5000, '따뜻함'], [7000, '중간'], [9500, '차가움'], [1e9, '아주 차가움']], sh: [[15, '부드러움'], [30, '보통'], [50, '선명함'], [1e9, '아주 선명함']] };
KR.word = function (k, v) { var r = KR.WORDS[k].find(function (x) { return v < x[0]; }); return r ? r[1] : ''; };
KR.SWATCH = { '저채도': '#8a8577', '파랑': '#3b6fb6', '고채도': '#d1452f', '초록': '#3f8f4f', '흑백': 'linear-gradient(90deg,#111 50%,#eee 50%)', '따뜻한 색감': '#d08a3c', '빨강': '#c4362f', '혼합': 'linear-gradient(90deg,#3b6fb6,#d08a3c)', '노랑': '#d9b42c', '주황': '#e07b2a', '청록': '#2a9d9a', '보라': '#7d5bb5', '차가운 색감': '#4f86b0', '분홍': '#d9769a', '갈색': '#7a5232', '하양': '#eeeeee', '검정': '#111111' };

/* ── 작은 도구 ── */
KR.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
KR.$ = function (sel, root) { return (root || document).querySelector(sel); };
KR.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
KR.uniq = function (a) { var o = [], s = {}; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; };
KR.secs = function (tm) { var p = String(tm || '0').split(':').map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0); };
KR.tmShort = function (s) { var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = Math.floor(s % 60); return h + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); };
KR.hex = function (rgb) { return '#' + rgb.map(function (v) { return Math.round(v).toString(16).padStart(2, '0'); }).join('').toUpperCase(); };
KR.fromHex = function (h) { var m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim()); if (!m) return null; var n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
KR.rgbToHsv = function (rgb) { var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
  if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, mx ? d / mx : 0, mx]; };
KR.hsvToRgb = function (h, s, v) { var c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c, r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255].map(Math.round); };
function lin(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function flab(t) { return t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116; }
KR.labOf = function (r, g, b) { var R = lin(r / 255), G = lin(g / 255), B = lin(b / 255), X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883; var fx = flab(X), fy = flab(Y), fz = flab(Z); return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]; };
KR.BIN_LAB = []; for (var bi = 0; bi < 64; bi++) KR.BIN_LAB.push(KR.labOf((bi >> 4) * 64 + 32, ((bi >> 2) & 3) * 64 + 32, (bi & 3) * 64 + 32));
KR.binRgb = function (i) { return [(i >> 4) * 64 + 32, ((i >> 2) & 3) * 64 + 32, (i & 3) * 64 + 32]; };
KR.weights = function (rgb) { var q = KR.labOf(rgb[0], rgb[1], rgb[2]); return KR.BIN_LAB.map(function (l) { var d = Math.hypot(l[0] - q[0], l[1] - q[1], l[2] - q[2]); return Math.min(1, Math.max(0, 1 - (d - 22) / 23)); }); };
KR.around = function (k, v) { var t = KR.TONE[k]; if (k === 'k') return [Math.max(t[1], v / 1.15), Math.min(t[2], v * 1.15)]; var w = (t[2] - t[1]) * 0.1; return [Math.max(t[1], v - w), Math.min(t[2], v + w)]; };
KR.fmt = function (k, x) { return k === 'k' ? Math.round(x / 100) * 100 + 'K' : String(Math.round(x)); };
KR.shapeOf = function (ar) { var best = null, d = 1e9; KR.SHAPES.forEach(function (s) { var e = Math.abs(Math.log(s[1]) - Math.log(ar)); if (e < d) { d = e; best = s[0]; } }); return best; };
KR.pct = function (a, b) { return b ? Math.round(a / b * 100) : 0; };

/* 아이콘(16px 선, X5 icons/와 같은 모양) */
var IC = {
  search: '<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/>', img: '<rect x="2" y="3" width="12" height="10"/><path d="m2 11 3.5-4 3 3 2-2L14 11"/><circle cx="11" cy="6" r="1"/>',
  moon: '<path d="M13 10.5A6 6 0 0 1 5.5 3a6 6 0 1 0 7.5 7.5z"/>', sun: '<circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5 13 13M3 13l1.5-1.5M11.5 4.5 13 3"/>',
  indigo: '<path d="M4.6 12.5h6.9a3 3 0 0 0 .4-5.98A4 4 0 0 0 4.2 7.4a2.55 2.55 0 0 0 .4 5.1z"/>',   /* 인디고(남색) 테마 = 구름 — 사용자 10-21 23시 */
  shuffle: '<path d="M2 4h3l6 8h3M2 12h3l1.5-2M9.5 6 11 4h3M12 2l2 2-2 2M12 10l2 2-2 2"/>', rows: '<rect x="2" y="2" width="12" height="4"/><rect x="2" y="9" width="7" height="5"/><rect x="11" y="9" width="3" height="5"/>',
  grid: '<rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/><rect x="2" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/>',
  cmp: '<rect x="2" y="3" width="5" height="10"/><rect x="9" y="3" width="5" height="10"/>', fav: '<path d="M2 6h12v7H2zM2 6l1.5-3H14l-1.5 3M5 3l-1 3M9 3 8 6"/>',
  x: '<path d="M4 4l8 8M12 4l-8 8"/>', check: '<path d="M3 8.5 6.5 12 13 4.5"/>', clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/>', key: '<rect x="1.5" y="4" width="13" height="8" rx="1"/><path d="M4 7h1M7 7h1M10 7h1M5 10h6"/>',
  export: '<path d="M8 11V2M4 6l4-4 4 4M2 10v4h12v-4"/>', magnet: '<path d="M4 2v6a4 4 0 0 0 8 0V2M4 2h3v6a1 1 0 0 0 2 0V2h3"/>', cond: '<path d="M2 4h12M4 8h8M6 12h4"/>',
  arrowL: '<path d="M10 3 5 8l5 5"/>', arrowR: '<path d="m6 3 5 5-5 5"/>', up: '<path d="m4 10 4-4 4 4"/>', down: '<path d="m4 6 4 4 4-4"/>', reel: '<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="4" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="4" cy="8" r="1"/><circle cx="12" cy="8" r="1"/>',
  people: '<circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5"/>', works: '<rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 6h12M5 3v10"/>', ext: '<path d="M9 3h4v4M13 3 7 9M11 9v4H3V5h4"/>',
  eyedrop: '<path d="m10 3 3 3M11.5 4.5 5 11l-2 2 .5-2.5 6.5-6.5"/>'
};
KR.ic = function (n, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 16 16" aria-hidden="true">' + (IC[n] || '') + '</svg>'; };
KR.ckSvg = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 8.4 6.6 11.4 12.4 5"/></svg>';

/* ── 동작 줄이기 ── */
KR.reduce = function () { return document.documentElement.classList.contains('rm') || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };

/* ── FLIP 도우미 하나(움직임_명세 3): 이전 rect 저장 → 레이아웃 적용 → transform 역보정 → 0으로 보간 ── */
KR.rects = function (els, key) { var m = {}; els.forEach(function (el) { var k = key(el); if (!k) return; var r = el.getBoundingClientRect(); if (r.width) m[k] = r; }); return m; };
KR.flip = function (els, key, before, opt) {
  opt = opt || {}; var dur = opt.dur || 240, ease = opt.ease || 'var(--kr-ease-in-out)', vh = window.innerHeight, vw = window.innerWidth, n = 0;
  if (KR.reduce()) return 0;
  els.forEach(function (el) {
    var k = key(el), b = before[k]; if (!b) return; var a = el.getBoundingClientRect();
    if (!a.width || (a.bottom < -50 && b.bottom < -50) || (a.top > vh + 50 && b.top > vh + 50)) return;   // 화면 밖 칸은 즉시
    var dx = b.left - a.left, dy = b.top - a.top, sx = opt.scale === false ? 1 : b.width / a.width, sy = opt.scale === false ? 1 : b.height / a.height;
    if (Math.abs(dx) < .5 && Math.abs(dy) < .5 && Math.abs(sx - 1) < .005 && Math.abs(sy - 1) < .005) return;
    if (el._flip) el._flip.cancel();
    el._flip = el.animate([{ transformOrigin: '0 0', transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')' }, { transformOrigin: '0 0', transform: 'none' }], { duration: dur, easing: opt.easing || 'cubic-bezier(.4,0,.2,1)' });
    el._flip.onfinish = function () { el._flip = null; }; n++;
  });
  return n;
};

/* ── 스프링(JS) — stiffness 420 · damping 34 · mass 1, 튕김 1회 약 320ms(움직임_명세 1). 키프레임으로 뽑아 WAAPI로 ── */
KR.springFrames = function (from, to, v0, k, c) {
  k = k || 420; c = c || 34; var x = from - to, v = v0 || 0, dt = 1 / 120, out = [], t = 0;
  for (var i = 0; i < 240; i++) { out.push(to + x); var a = -k * x - c * v; v += a * dt; x += v * dt; t += dt; if (Math.abs(x) < 0.05 && Math.abs(v) < 0.05 && i > 10) break; }
  out.push(to); return { vals: out, ms: Math.round(out.length * dt * 1000) };
};
KR.springScale = function (el, from, k, c) {
  if (KR.reduce() || !el || !el.animate) return; var f = KR.springFrames(from, 1, 0, k || 420, c || 34);
  el.animate(f.vals.map(function (v) { return { transform: 'scale(' + v.toFixed(4) + ')' }; }), { duration: f.ms, easing: 'linear' });
};

/* ── 자료: 시안 사진 48장을 4번(새 id, 같은 그림) = 192장. 정본 시안과 같은 방식 ── */
(function () {
  var raw = window.KR_SAMPLE || [], out = raw.slice();
  ['b', 'c', 'd'].forEach(function (k) { raw.forEach(function (p) { out.push(Object.assign({}, p, { id: p.id + '~' + k })); }); });
  out.forEach(function (p, i) { p.shape = [KR.shapeOf(p.ar)]; p.media = ['영화·TV']; p.order = i; p.sec = KR.secs(p.tm); });
  KR.data = out; KR.byId = {}; out.forEach(function (p) { KR.byId[p.id] = p; });
  KR.works = KR.uniq(out.map(function (p) { return p.w; }));
  KR.workInfo = {}; KR.works.forEach(function (w) { var ps = out.filter(function (p) { return p.w === w; }); KR.workInfo[w] = { w: w, wk: ps[0].wk, y: ps[0].y, dir: ps[0].dir, dp: ps[0].dp, genre: ps[0].genre, list: ps }; });
  var people = {};
  out.forEach(function (p) {
    (p.dir || []).forEach(function (n) { (people[n] = people[n] || { name: n, roles: {}, works: {}, n: 0 }); people[n].roles['감독'] = 1; people[n].works[p.w] = (people[n].works[p.w] || 0) + 1; people[n].n++; });
    (p.dp || []).forEach(function (n) { (people[n] = people[n] || { name: n, roles: {}, works: {}, n: 0 }); people[n].roles['촬영'] = 1; people[n].works[p.w] = (people[n].works[p.w] || 0) + 1; if ((p.dir || []).indexOf(n) < 0) people[n].n++; });
  });
  KR.people = people; KR.peopleList = Object.keys(people).sort(function (a, b) { return people[b].n - people[a].n || a.localeCompare(b); });
})();
KR.p = function (id) { return KR.byId[id]; };
KR.title = function (p) { return KR.S.lang === 'en' ? p.w : p.wk; };
KR.workTitle = function (w) { var i = KR.workInfo[w]; return i ? (KR.S.lang === 'en' ? i.w : i.wk) : w; };

/* ── 상태 ── */
var initSel = [];
KR.S = {
  route: { name: 'search' }, theme: KR.load('theme', 'dark'), check: KR.load('check', 'check'), layout: KR.load('layout', 'just'), rmUser: KR.load('rm', '0') === '1', lang: KR.load('lang', 'ko'),
  perRow: Math.max(2, Math.min(6, Number(KR.load('perrow', '4')) || 4)), line: KR.load('line', '1') === '1', groupBy: KR.load('group', '1') === '1', sort: KR.load('sort', 'mix'), seed: 0, gOpen: {},
  filters: [], q: '', color: null, tone: {}, hideWorks: [], scope: null, simIds: [], simOf: '', img: null, imgSort: 'near', imgShot: false, imgMore: false,
  sideOpen: KR.load('side', '1') === '1', bandOpen: KR.load('band', '1') === '1', bandTwo: KR.load('band2', '0') === '1', bandMode: KR.load('bandmode', 'auto'), pins: ['frame', 'tod', 'light'],
  recent: [{ f: 'tod', v: '밤' }, { f: 'light', v: '역광' }, { f: 'frame', v: '클로즈업' }], open: KR.load('open', 'frame,tod').split(',').filter(Boolean), fq: '', worksOpen: true, lookOpen: true, aiOpen: true,
  sel: initSel, cmp: [], cmpSel: [], cmpOff: [], magnet: KR.load('magnet', '1') === '1', seen: [], dockOpen: KR.load('dock', '1') === '1', dockLevel: 1, miniHide: KR.load('minihide', '0') === '1',
  favLists: [], keysOpen: false, cond: null, draft: null, fav: null, exp: null, win: null, winMode: KR.load('winmode', 'simple'), winLeft: false, winRight: true, lp: null, cmpOpen: false, inspOpen: KR.load('insp', '1') === '1', inspFilter: null, hover: null,
  sortOpen: false, imgFind: false, toast: '', sian: false, workTab: 'all', workSub: 'scene', personTab: 'works', aiState: 'idle', aiStage: { 1: true, 2: false, 3: false }, aiScope: 'all', aiDev: 'gpu', favList: null, favInList: null, cmpNote: '', cmpConfirm: false, seenConfirm: false
};
/* D1: 섞기는 세션마다 씨앗 하나 */
KR.newSeed = function () { var v = 1 + Math.floor(Math.random() * 2147483646); try { sessionStorage.setItem('krx-seed', String(v)); } catch (e) {} KR.S.seed = v; return v; };
(function () { try { var v = Number(sessionStorage.getItem('krx-seed')); if (v > 0) { KR.S.seed = v; return; } } catch (e) {} KR.newSeed(); })();

/* 시작 상태(일하던 중처럼 — 정본 시안 'deep'과 같은 방식): 본 사진·비교함·즐겨찾기 목록을 예시로 채움. 화면에 '시안 예시'로 표시 */
(function () {
  var S = KR.S, ids = KR.data.map(function (p) { return p.id; });
  var tx = KR.data.filter(function (p) { return p.w === 'Taxi Driver'; }).map(function (p) { return p.id; });
  S.seen = tx.concat(ids.filter(function (x) { return tx.indexOf(x) < 0; }).reverse()).slice(0, 192);
  S.cmp = tx.slice(0, 6).concat(ids.filter(function (x, i) { return tx.indexOf(x) < 0 && i % 5 === 2; }).slice(0, 8));
  S.cmpSel = S.cmp.slice(0, 3);
  S.favLists = KR.loadJ('favlists', null) || [
    { id: 'l1', name: '밤 레퍼런스', color: '#3f6fcb', def: true, ids: tx.slice(0, 3) },
    { id: 'l2', name: '기본 목록', color: '#d25c94', ids: [] },
    { id: 'l3', name: '촬영 참고 — 비 오는 밤', color: '#4e9a55', ids: [] }
  ];
  S.favList = S.favLists[0].id;
})();

/* ── 결과 계산(정본 시안 result() 그대로 + X5에서 사진으로 찾기·즐겨찾기만 보기 범위) ── */
KR.has = function (p, f, v) { return (p[f] || []).indexOf(v) >= 0; };
KR.text = function (p) { return [p.wk, p.w, p.tm].concat(p.frame, p.tod, p.light, p.ltype, p.io, p.color, p.shot, p.tags, p.act, p.dir, p.dp, p.loc).join(' ').toLowerCase(); };
KR.lookOk = function (p) {
  var S = KR.S;
  for (var k in S.tone) { var r = S.tone[k], lo = r.range ? r.lo : KR.around(k, r.v)[0], hi = r.range ? r.hi : KR.around(k, r.v)[1]; if (!(p.look[k] >= lo && p.look[k] <= hi)) return false; }
  if (S.color) { var w = S.color.w, sum = 0; for (var i = 0; i < 64; i++) if (w[i] > 0) sum += p.bins[i] * w[i]; if (sum < S.color.min * 255) return false; }
  return true;
};
KR.matches = function (p, filters, skip) {
  var g = {}; filters.forEach(function (x) { if (x.f !== skip) (g[x.f] = g[x.f] || []).push(x.v); });
  for (var f in g) { var ok = false; for (var i = 0; i < g[f].length; i++) if (KR.has(p, f, g[f][i])) ok = true; if (!ok) return false; }
  return true;
};
KR.mix = function (id) { var h = (KR.S.seed | 0) ^ 0x9e3779b9; for (var i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619); h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; return h; };
KR.ordered = function (list) {
  var S = KR.S, ko = S.lang !== 'en', tt = function (p) { return ko ? p.wk : p.w; };
  var byTitle = function (a, b) { return tt(a).localeCompare(tt(b), ko ? 'ko' : 'en') || a.sec - b.sec; };
  var cmp = S.sort === 'recent' ? function (a, b) { return b.order - a.order; } : S.sort === 'year' ? function (a, b) { return (Number(b.y) || 0) - (Number(a.y) || 0) || byTitle(a, b); } : S.sort === 'title' ? byTitle : function (a, b) { return KR.mix(a.id) - KR.mix(b.id); };
  return list.slice().sort(cmp);
};
/* 사진으로 찾기: 시안에서는 사진 숫자(SigLIP) 대신 색 분포(64칸)와 태그로 가깝기를 셈 — 화면에 '형식 예시'로 표시 */
KR.histSim = function (a, b) { var s = 0, na = 0, nb = 0; for (var i = 0; i < 64; i++) { s += Math.min(a[i], b[i]); na += a[i]; nb += b[i]; } return s / Math.max(1, Math.min(na, nb)); };
KR.tagSim = function (a, b) { var w = function (x) { return [].concat(x.frame, x.light, x.tod, x.io, x.color, x.comp || [], x.shot); }, A = w(a), B = w(b), n = 0; A.forEach(function (t) { if (B.indexOf(t) >= 0) n++; }); return n / Math.max(1, Math.max(A.length, B.length)); };
KR.imgScore = function (p) {
  var I = KR.S.img; if (!I) return 0; var h = KR.histSim(I.bins, p.bins);
  if (KR.S.imgSort === 'color') return h;
  var t = I.ref ? KR.tagSim(I.ref, p) : 0.5; return I.ref ? 0.55 * h + 0.45 * t : h;
};
KR.result = function (skip) {
  var S = KR.S, words = S.q.trim().toLowerCase().split(/\s+/).filter(Boolean), list = KR.data;
  if (S.scope === 'sim') list = S.simIds.map(KR.p).filter(Boolean);
  if (S.scope === 'seen') list = S.seen.map(KR.p).filter(Boolean);
  if (S.scope === 'fav') { var all = {}; S.favLists.forEach(function (l) { l.ids.forEach(function (x) { all[x] = 1; }); }); list = list.filter(function (p) { return all[p.id]; }); }
  if (S.scope === 'img' && S.img) {
    var sc = {}; list.forEach(function (p) { sc[p.id] = KR.imgScore(p); });
    if (S.imgShot && S.img.ref) list = list.filter(function (p) { return p.frame[0] === S.img.ref.frame[0]; });
    /* 다른 작품 먼저(기능목록 4.1): 기준 사진과 같은 작품은 뒤로 */
    var refW = S.img.ref ? S.img.ref.w : null;
    list = list.filter(function (p) { return !S.img.ref || p.id !== S.img.ref.id; }).sort(function (a, b) { return ((a.w === refW) - (b.w === refW)) || sc[b.id] - sc[a.id]; });
    KR.imgScores = sc;
  } else if (S.scope !== 'seen' && S.scope !== 'sim') list = KR.ordered(list);
  return list.filter(function (p) {
    if (skip !== 'work' && S.hideWorks.indexOf(p.w) >= 0) return false;
    if (words.length) { var t = KR.text(p); for (var i = 0; i < words.length; i++) if (t.indexOf(words[i]) < 0) return false; }
    return KR.matches(p, S.filters, skip) && KR.lookOk(p);
  });
};
KR.countsIn = function (list, f) { var m = {}; list.forEach(function (p) { (p[f] || []).forEach(function (v) { m[v] = (m[v] || 0) + 1; }); }); return m; };
KR.valuesOf = function (f) {
  var all = KR.countsIn(KR.data, f), keys = Object.keys(all);
  if (f === 'frame') return KR.FRAME_ORDER.filter(function (v) { return all[v]; });
  if (f === 'shape') return keys.sort(function (a, b) { return (Number(a) || 0) - (Number(b) || 0); });
  return keys.sort(function (a, b) { return all[b] - all[a]; });
};
KR.nameOf = function (f) { if (f === 'shape') return '화면 비율'; if (f === 'media') return '매체'; if (f === 'color') return '색'; for (var i = 0; i < KR.FIELDS.length; i++) if (KR.FIELDS[i][0] === f) return KR.FIELDS[i][1]; return f; };
KR.isOn = function (f, v) { return KR.S.filters.some(function (x) { return x.f === f && x.v === v; }); };
KR.toggleFilter = function (f, v) {
  var S = KR.S, on = KR.isOn(f, v);
  S.filters = on ? S.filters.filter(function (x) { return !(x.f === f && x.v === v); }) : S.filters.concat([{ f: f, v: v }]);
  if (!on) S.recent = [{ f: f, v: v }].concat(S.recent.filter(function (x) { return !(x.f === f && x.v === v); })).slice(0, 8);
  KR.leaveCmpOff();
};
/* 비교함: 체크 푼 사진은 다음 페이지 이동 때 빠짐(정본) */
KR.leaveCmpOff = function () { var S = KR.S; if (!S.cmpOff.length) return; S.cmp = S.cmp.filter(function (x) { return S.cmpOff.indexOf(x) < 0; }); S.cmpSel = S.cmpSel.filter(function (x) { return S.cmpOff.indexOf(x) < 0; }); S.cmpOff = []; };
KR.inFav = function (id) { return KR.S.favLists.some(function (l) { return l.ids.indexOf(id) >= 0; }); };
KR.saveFav = function () { KR.saveJ('favlists', KR.S.favLists); };
