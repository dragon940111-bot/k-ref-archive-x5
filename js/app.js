/* 앱 틀: 페이지 이동 · 그리기 · 누르기/키/끌기 처리 · 끌어 담기 · 시안 설정 상자 · 장면(바로 가기) */
'use strict';
(function () {
var KR = window.KR, S = KR.S, esc = KR.esc, ic = KR.ic, $ = KR.$, $$ = KR.$$;

/* ── 테마·설정 반영 ── */
KR.applyLook = function () {
  var h = document.documentElement; h.setAttribute('data-kr-theme', S.theme);
  h.classList.toggle('ck-color', S.check === 'color'); h.classList.toggle('rm', !!S.rmUser);
};

/* ── 페이지 이동(뒤로 가기 = 격자 위치 복원) ── */
var scrollMem = {};
function rkey(r) { return r.name + ':' + (r.w || r.n || ''); }
KR.go = function (route, opt) {
  opt = opt || {};
  var cur = S.route, sc = KR.scroller(); if (sc) scrollMem[rkey(cur)] = sc.scrollTop;
  if (rkey(cur) !== rkey(route)) KR.leaveCmpOff();
  var pageChange = cur.name !== route.name || rkey(cur) !== rkey(route);
  S.route = route; S.cond = null; S.draft = null; S.inspFilter = null; S.sortOpen = false;
  if (route.name === 'work' && opt.tab) S.workTab = opt.tab; else if (route.name === 'work' && pageChange && !opt.keepTabs) { S.workTab = 'all'; S.workSub = 'scene'; }
  if (route.name === 'person' && pageChange && !opt.keepTabs) S.personTab = 'works';
  /* 뒤로 가기 기록은 js/history.js가 동작마다 쌓음 */
  KR.render({ page: pageChange });
  var sc2 = KR.scroller(); if (sc2) sc2.scrollTop = opt.restore ? (scrollMem[rkey(route)] || 0) : (opt.keepScroll ? sc2.scrollTop : 0);
  /* 페이지 전환: 페이드 160ms(움직임_명세 2.10). 타임라인은 전역이라 움직이지 않음 */
  if (pageChange && !KR.reduce()) { var sh = $('#shell'); if (sh) sh.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
};
KR.scroller = function () { return $('#main') || $('#page') || $('#fvmain'); };
KR.home = function () { S.scope = null; S.img = null; S.imgFind = false; KR.go({ name: 'search' }); };

/* ── 그리기 ── */
KR.render = function (opt) {
  opt = opt || {}; KR.applyLook();
  var tb = $('#topbar'); KR.keepFocus(tb, function () { tb.innerHTML = KR.renderTop(); });
  var r = S.route.name, shell = $('#shell');
  document.body.classList.toggle('app-dim', !!S.cond && r === 'search');
  if (r === 'search') KR.renderSearch(opt);
  else {
    var sc = KR.scroller(), keep = !opt.page && sc ? sc.scrollTop : 0;
    shell.setAttribute('data-r', r);
    if (r === 'work') { shell.innerHTML = KR.renderWork(); KR.fillWork(); }
    else if (r === 'person') { shell.innerHTML = KR.renderPerson(); KR.fillPerson(); }
    else if (r === 'portfolio') shell.innerHTML = KR.renderPortfolio();
    else if (r === 'fav') { KR.keepFocus(shell, function () { shell.innerHTML = KR.renderFavPage(); }); KR.fillFav(); }
    else if (r === 'ai') shell.innerHTML = KR.renderAi();
    var sc2 = KR.scroller(); if (sc2 && keep) sc2.scrollTop = keep;
    KR.refreshMarks();
  }
  KR.renderOv(); KR.renderGlob();
};
/* 겹친 것(창·릴·나란히): 바뀐 칸만 다시 씀 */
function put(id, html, keepSel) {
  var el = $('#' + id); if (!el) return false; if (el._h === html) return false;
  var mem = {}; (keepSel || []).forEach(function (s) { var x = $(s, el); if (x) mem[s] = [x.scrollLeft, x.scrollTop]; });
  KR.keepFocus(el, function () { el.innerHTML = html; }); el._h = html;
  (keepSel || []).forEach(function (s) { var x = $(s, el); if (x && mem[s]) { x.scrollLeft = mem[s][0]; x.scrollTop = mem[s][1]; } });
  return true;
}
KR.renderOv = function (mode) {
  put('ovcond', S.route.name === 'search' ? KR.renderCond() : '');
  if (put('ovcmp', KR.renderCmp(), ['#cgwrap', '#insp'])) { if (S.cmpOpen) KR.refreshMarks(); }
  var wasWin = !!$('#pwin'), changed = put('ovwin', KR.renderWin(), ['.rp', '.pleft', '.pcenter']);
  if (mode === 'winopen' || (changed && !wasWin && S.win)) KR.winEnter();
  var rv = $('#ovreel');
  if (!S.lp) { rv.innerHTML = ''; rv._h = ''; }
  else if (mode === 'lpopen' || !$('#reel')) { rv.innerHTML = KR.renderReel(); KR._lpLastWork = null; KR.lpSync(true); clearTimeout(KR._lpOpenT); KR._lpOpenT = setTimeout(KR.lpGateSoon, KR.reduce() ? 0 : 560); }
  else { var r = $('#reel'); if (r) r.classList.toggle('under', !!S.win); }
  put('ovfav', KR.renderFav()); if (S.fav) S.fav._shown = true;
  put('ovkeys', KR.renderKeys()); put('ovexp', KR.renderExport());
};

/* ── 동작 모음 ── */
function pidOf(el) { var t = el.closest('[data-pid]'); return t ? t.getAttribute('data-pid') : el.getAttribute('data-pid'); }
KR.toggleSel = function (id) { KR._lastSel = id; var i = S.sel.indexOf(id); S.sel = i >= 0 ? S.sel.filter(function (x) { return x !== id; }) : S.sel.concat([id]); KR.afterSel(); };
KR.afterSel = function () {
  KR.refreshMarks();
  if (S.route.name === 'search') { var c = $('#count'); if (c) c.innerHTML = KR.renderCount(KR.lastRes || KR.result()); }
  else if (S.route.name === 'fav') KR.render();
  if (S.cmpOpen) KR.renderOv();
  KR.renderGlob();
};
KR.rangeSel = function (id) {
  var order = (KR.lastRes || []).map(function (p) { return p.id; }), a = order.indexOf(KR._lastSel), b = order.indexOf(id);
  if (a < 0 || b < 0) return KR.toggleSel(id);
  var part = order.slice(Math.min(a, b), Math.max(a, b) + 1); KR._lastSel = id; S.sel = S.sel.concat(part.filter(function (x) { return S.sel.indexOf(x) < 0; })); KR.afterSel();
};
KR.flashCmp = function (t) { S.cmpNote = t; KR.renderTimeline(); clearTimeout(KR._cnt); KR._cnt = setTimeout(function () { S.cmpNote = ''; KR.renderTimeline(); }, 2500); };
KR.addCmp = function (ids) {
  var room = KR.CMP_MAX - S.cmp.length, add = ids.filter(function (x) { return S.cmp.indexOf(x) < 0; });
  if (!add.length) { KR.flashCmp('이미 비교함에 있어요'); return; }
  if (add.length > room) KR.flashCmp('가득 참 — ' + KR.CMP_MAX + '장까지');
  S.cmp = add.slice(0, Math.max(0, room)).reverse().concat(S.cmp); KR.afterSel();
};
KR.delCmp = function (ids) { S.cmp = S.cmp.filter(function (x) { return ids.indexOf(x) < 0; }); S.cmpSel = S.cmpSel.filter(function (x) { return ids.indexOf(x) < 0; }); S.cmpConfirm = false; if (!S.cmp.length) S.cmpOpen = false; KR.afterSel(); };
KR.targetIds = function () { return S.sel.length ? S.sel.slice() : KR._hoverId ? [KR._hoverId] : KR.focusPid() ? [KR.focusPid()] : []; };
KR.focusPid = function () { var a = document.activeElement; if (!a || !a.closest) return null; var t = a.closest('.tile[data-pid], .cgc[data-cid]'); return t ? (t.getAttribute('data-pid') || t.getAttribute('data-cid')) : null; };
KR.openExport = function (ids) { if (!ids.length) return; S.exp = { ids: ids, csv: true }; KR.renderOv(); };
function sideToggle() {
  /* 조건 칸 접기 → 격자 FLIP 240ms, 조건 칸은 translateX(-220px)+opacity 200ms, 손잡이는 뒤에 120ms 페이드 */
  if (S.route.name !== 'search') { S.sideOpen = !S.sideOpen; KR.save('side', S.sideOpen ? '1' : '0'); return; }
  var tiles = $$('#grid .tile'), before = KR.rects(tiles, function (e) { return e.getAttribute('data-pid') + (e.closest('.strip') ? 's' : ''); });
  var cp = $('#cp'), cr = cp ? cp.getBoundingClientRect() : null, closing = S.sideOpen;
  if (closing && cp && !KR.reduce()) { var ghost = cp.cloneNode(true); ghost.removeAttribute('id'); ghost.style.cssText = 'position:fixed;left:' + cr.left + 'px;top:' + cr.top + 'px;width:' + cr.width + 'px;height:' + cr.height + 'px;z-index:15;pointer-events:none;overflow:hidden'; document.body.appendChild(ghost);
    ghost.animate([{ transform: 'none', opacity: .6 }, { transform: 'translateX(-220px)', opacity: 0 }], { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).onfinish = function () { ghost.remove(); }; }
  S.sideOpen = !S.sideOpen; KR.save('side', S.sideOpen ? '1' : '0');
  KR.render();
  KR.flip($$('#grid .tile'), function (e) { return e.getAttribute('data-pid') + (e.closest('.strip') ? 's' : ''); }, before, { dur: 240 });
  var ncp = $('#cp'); if (!closing && ncp && !KR.reduce()) ncp.animate([{ transform: 'translateX(-220px)', opacity: 0 }, { transform: 'translateX(-220px)', opacity: .3, offset: .18 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
  var ed = $('#edge'); if (ed && closing && !KR.reduce()) ed.animate([{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }], { duration: 320 });
}
function bandToggle(kind) {
  /* 셀렉트 띠 높이 변화 → 아래 요소 FLIP 180ms, 칩은 8px 아래서 올라오며 120ms */
  var els = $$('#count, #scopeh, #grid'), before = KR.rects(els, function (e) { return e.id; });
  if (kind === 'two') { S.bandTwo = !S.bandTwo; KR.save('band2', S.bandTwo ? '1' : '0'); } else { S.bandOpen = !S.bandOpen; KR.save('band', S.bandOpen ? '1' : '0'); }
  KR.render();
  KR.flip(els.map(function (e) { return $('#' + e.id); }).filter(Boolean), function (e) { return e.id; }, before, { dur: 180, scale: false, easing: 'cubic-bezier(.2,.8,.2,1)' });
  var g = $('.band-g'); if (g && !KR.reduce()) g.animate([{ transform: 'translateY(8px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 120, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
KR.setTheme = function (t) {
  S.theme = t || { dark: 'light', light: 'indigo', indigo: 'dark' }[S.theme]; KR.save('theme', S.theme);
  var ic0 = $('.thi'); if (ic0 && !KR.reduce()) ic0.classList.add('spin');
  /* 테마는 껍데기 색만 바꿈: 격자를 다시 그리지 않음(녹화 C1에서 다시 그리기 때문에 한 번 100~150ms 멈춤) */
  setTimeout(function () { KR.applyLook(); var tb = $('#topbar'); if (tb) KR.keepFocus(tb, function () { tb.innerHTML = KR.renderTop(); }); if (KR.renderSian) KR.renderSian(); var n = $('.thi'); if (n && !KR.reduce()) n.animate([{ transform: 'rotate(-90deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 160, easing: 'cubic-bezier(.2,.8,.2,1)' }); }, KR.reduce() ? 0 : 80);
};
function filterSearch(f, v, ctx) {
  S.scope = null; S.img = null; S.imgFind = false;
  if (ctx && ctx.indexOf('w:') === 0) { var w = ctx.slice(2); S.hideWorks = KR.works.filter(function (x) { return x !== w; }); }
  else if (ctx && ctx.indexOf('p:') === 0) { var n = ctx.slice(2), ws = KR.uniq(KR.personPhotos(n).map(function (p) { return p.w; })); S.hideWorks = KR.works.filter(function (x) { return ws.indexOf(x) < 0; }); }
  if (f && !KR.isOn(f, v)) KR.toggleFilter(f, v);
  S.win = null; KR.go({ name: 'search' });
}
function featGo(k, ctx) {
  var map = { '와이드': ['frame', ['익스트림 와이드 샷', '와이드 샷', '미디엄 와이드 샷']], '클로즈업': ['frame', ['미디엄 클로즈업', '클로즈업', '익스트림 클로즈업']], '부드러운 빛': ['light', ['부드러운 빛']], '밤': ['tod', ['밤']] }[k];
  if (!map) return; S.filters = S.filters.filter(function (x) { return x.f !== map[0]; }); map[1].forEach(function (v) { S.filters.push({ f: map[0], v: v }); }); filterSearch(null, null, ctx);
}

/* ── 사진으로 찾기: 올린 사진의 색 분포(64칸) — 보관함에는 넣지 않음 ── */
KR.imgFromFile = function (file) {
  if (!file || !/^image\//.test(file.type)) { KR.toast('사진 파일만 올릴 수 있어요'); return; }
  var rd = new FileReader();
  rd.onload = function () { var im = new Image(); im.onload = function () {
    var c = document.createElement('canvas'), w = 96, h = Math.max(1, Math.round(96 * im.height / im.width)); c.width = w; c.height = h; var x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data, bins = new Array(64).fill(0), n = 0;
    for (var i = 0; i < d.length; i += 4) { bins[(d[i] >> 6) * 16 + (d[i + 1] >> 6) * 4 + (d[i + 2] >> 6)]++; n++; }
    S.img = { name: file.name.slice(0, 40), src: c.toDataURL('image/jpeg', .8), bins: bins.map(function (b) { return Math.round(b / n * 255); }), ref: null };
    S.scope = 'img'; S.imgFind = false; S.imgMore = false; KR.go({ name: 'search' });
  }; im.src = rd.result; };
  rd.readAsDataURL(file);
};
KR.imgFromPhoto = function (p) { S.img = { name: KR.title(p) + ' ' + p.tm, src: p.src, bins: p.bins, ref: p }; S.scope = 'img'; S.imgFind = false; S.imgMore = false; S.win = null; KR.go({ name: 'search' }); };

/* ── 누르기 ── */
var ACT = {
  home: function () { KR.home(); }, go: function (el) { var r = el.getAttribute('data-r'); if (r === 'search') KR.home(); else KR.go({ name: r }); },
  lang: function (el) { S.lang = el.getAttribute('data-v'); KR.save('lang', S.lang); $$('.tile[data-pid]').forEach(function () {}); KR.render(); },
  theme: function () { KR.setTheme(); },
  imgfind: function () { if (S.route.name !== 'search') KR.go({ name: 'search' }); S.imgFind = !S.imgFind; KR.renderGlob(); KR.render(); if (S.imgFind) setTimeout(function () { var dz = $('#drop'); if (dz) dz.scrollIntoView({ block: 'nearest' }); }, 0); },
  imgfindoff: function () { S.imgFind = false; KR.render(); }, imgclear: function () { S.scope = null; S.img = null; KR.render(); },
  imgsort: function (el) { S.imgSort = el.getAttribute('data-v'); KR.render(); }, imgshot: function () { S.imgShot = !S.imgShot; KR.render(); }, imgmore: function () { S.imgMore = true; KR.render({ keepScroll: true }); },
  side: function () { sideToggle(); }, band: function () { bandToggle(); }, band2: function () { bandToggle('two'); },
  bandmode: function (el) { S.bandMode = el.getAttribute('data-v'); KR.save('bandmode', S.bandMode); KR.render(); },
  perrow: function (el) { var b = KR.rects($$('#grid .tile'), function (e) { return e.getAttribute('data-pid') + (e.closest('.strip') ? 's' : ''); }); S.perRow = Number(el.getAttribute('data-v')); KR.save('perrow', S.perRow); KR.render(); KR.flip($$('#grid .tile'), function (e) { return e.getAttribute('data-pid') + (e.closest('.strip') ? 's' : ''); }, b, { dur: 240 }); },
  layout: function (el) { var b = KR.rects($$('#grid .tile'), function (e) { return e.getAttribute('data-pid') + (e.closest('.strip') ? 's' : ''); }); S.layout = el.getAttribute('data-v'); KR.save('layout', S.layout); KR.render(); if (S.route.name === 'search') KR.flip($$('#grid .tile'), function (e) { return e.getAttribute('data-pid') + (e.closest('.strip') ? 's' : ''); }, b, { dur: 240 }); },
  line: function () { S.line = !S.line; KR.save('line', S.line ? '1' : '0'); KR.render({ keepScroll: true }); },
  group: function () { S.groupBy = !S.groupBy; KR.save('group', S.groupBy ? '1' : '0'); KR.render(); },
  gopen: function (el) { var w = el.getAttribute('data-w'); S.gOpen[w] = !S.gOpen[w]; KR.render(); },
  sort: function () { S.sortOpen = !S.sortOpen; KR.render(); }, sortclose: function () { S.sortOpen = false; KR.render(); },
  sortpick: function (el) { var v = el.getAttribute('data-v'); if (v === 'mix' && S.sort === 'mix') KR.newSeed(); S.sort = v; S.sortOpen = false; KR.save('sort', v); KR.render(); },
  fold: function (el) { var k = el.getAttribute('data-k'); if (k === 'works') S.worksOpen = !S.worksOpen; if (k === 'look') S.lookOpen = !S.lookOpen; if (k === 'ai') S.aiOpen = !S.aiOpen; KR.render(); },
  foldf: function (el) { var f = el.getAttribute('data-f'); S.open = S.open.indexOf(f) >= 0 ? S.open.filter(function (x) { return x !== f; }) : S.open.concat([f]); KR.save('open', S.open.join(',')); KR.render(); },
  pin: function (el) { var f = el.getAttribute('data-f'); S.pins = S.pins.indexOf(f) >= 0 ? S.pins.filter(function (x) { return x !== f; }) : S.pins.concat([f]); if (S.pins.indexOf(f) >= 0) { S.bandMode = 'pin'; S.bandOpen = true; } KR.render(); },
  filter: function (el) { KR.toggleFilter(el.getAttribute('data-f'), el.getAttribute('data-v')); KR.render(); },
  work: function (el) { var w = el.getAttribute('data-w'); S.hideWorks = S.hideWorks.indexOf(w) >= 0 ? S.hideWorks.filter(function (x) { return x !== w; }) : S.hideWorks.concat([w]); KR.leaveCmpOff(); KR.render(); },
  allworks: function () { S.hideWorks = []; KR.render(); },
  dropf: function (el) { var i = el.getAttribute('data-i'); if (i === 'color') S.color = null; else if (i === 'q') S.q = ''; else if (i[0] === 't') { var t = Object.assign({}, S.tone); delete t[i.slice(1)]; S.tone = t; } else S.filters.splice(Number(i.slice(1)), 1); KR.leaveCmpOff(); KR.render(); var qi = $('#q'); if (qi && i === 'q') qi.value = ''; },
  clearall: function () { S.filters = []; S.color = null; S.tone = {}; S.q = ''; KR.leaveCmpOff(); KR.render(); var qi = $('#q'); if (qi) qi.value = ''; },
  scopeoff: function () { S.scope = null; KR.render(); },
  qclear: function () { S.q = ''; KR.render(); var qi = $('#q'); if (qi) { qi.value = ''; qi.focus(); } },
  cond: function (el) { KR.openCond(el.getAttribute('data-k'), el.closest('#cp') ? 'side' : 'band'); },
  cclose: function () { S.cond = null; S.draft = null; KR.render(); },
  capply: function () { KR.condApply(S.draft, S.cond); S.cond = null; S.draft = null; KR.leaveCmpOff(); KR.render(); },
  cclear: function () { var k = S.cond; if (k === 'color') S.color = null; else if (k === 'shape' || k === 'media') S.filters = S.filters.filter(function (x) { return x.f !== k; }); else { var t = Object.assign({}, S.tone); KR.GROUPS[k].forEach(function (x) { delete t[x]; }); S.tone = t; } S.cond = null; S.draft = null; KR.render(); },
  qc: function (el) { var rgb = KR.fromHex(el.getAttribute('data-v')), x = KR.rgbToHsv(rgb); Object.assign(S.draft, { rgb: rgb, h: x[0], s: x[1], v: x[2] }); KR.renderOv(); },
  eyedrop: function () { if (!window.EyeDropper) { KR.toast('이 브라우저에서는 화면에서 색 집기를 못 써요(크롬 데스크톱 앱에서는 됨)'); return; } try { new window.EyeDropper().open().then(function (r) { var rgb = KR.fromHex(r.sRGBHex), x = KR.rgbToHsv(rgb); Object.assign(S.draft, { rgb: rgb, h: x[0], s: x[1], v: x[2] }); KR.renderOv(); }).catch(function () {}); } catch (e) { KR.toast('화면에서 색 집기를 열 수 없어요'); } },
  cpick: function (el) { var v = el.getAttribute('data-v'), p = S.draft.picks; S.draft.picks = p.indexOf(v) >= 0 ? p.filter(function (x) { return x !== v; }) : p.concat([v]); KR.renderOv(); },
  tonetog: function (el) { var k = el.getAttribute('data-k'); S.draft[k].on = !S.draft[k].on; KR.renderOv(); },
  tonerange: function (el) { S.draft.range = el.getAttribute('data-v') === '1'; KR.renderOv(); },
  /* 선택 */
  ck: function (el) { var id = pidOf(el); if (id) KR.toggleSel(id); },
  clearsel: function () { S.sel = []; KR.afterSel(); },
  favsel: function () { var ids = KR.targetIds(); if (ids.length) KR.openFav(ids); },
  cmpsel: function () { var ids = S.sel.length ? S.sel : KR.targetIds(); if (ids.length) KR.addCmp(ids); },
  hidetog: function () { var t = $('#ftog'); S.miniHide = true; KR.save('minihide', '1'); if (t && !KR.reduce()) { var g = t.cloneNode(true); g.removeAttribute('id'); document.body.appendChild(g); g.animate([{ transform: 'translateX(-50%)', opacity: 1 }, { transform: 'translateX(-50%) scale(.3)', opacity: 0 }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).onfinish = function () { g.remove(); }; } KR.renderGlob(); },
  showtog: function () { S.miniHide = false; KR.save('minihide', '0'); KR.renderGlob(); if (!KR._countOff) { var c = $('#count'); if (c) c.scrollIntoView({ block: 'nearest', behavior: KR.reduce() ? 'auto' : 'smooth' }); } },
  cmp: function (el) { var id = pidOf(el); if (!id) return; if (S.cmp.indexOf(id) >= 0) KR.delCmp([id]); else if (S.cmp.length >= KR.CMP_MAX) KR.flashCmp('가득 참 — ' + KR.CMP_MAX + '장까지'); else { S.cmp = [id].concat(S.cmp); KR.afterSel(); var b = $('.tile[data-pid="' + id + '"] .cmpb'); if (b) KR.springScale(b, .6); } },
  fav: function (el) { var id = pidOf(el); if (id) KR.openFav([id]); },
  /* 사진 창 */
  open: function (el, e) {
    if (KR._justDragged || KR.lpQuietNow()) return; var id = pidOf(el); if (!id) return;
    if (e && (e.ctrlKey || e.metaKey) && el.closest('#grid, #favgrid, #workbody, #personbody')) { e.preventDefault(); KR.toggleSel(id); return; }
    if (e && e.shiftKey && el.closest('#grid')) { e.preventDefault(); KR.rangeSel(id); return; }
    var inGrid = el.closest('#grid, #favgrid, #workbody, #personbody, .g5');
    KR.winCtx = inGrid ? KR.$$('.tile[data-pid]', inGrid.closest('#grid, #favgrid, #workbody, #personbody, .g5')).map(function (t) { return KR.p(t.getAttribute('data-pid')); }).filter(Boolean) : null;
    if (KR.winCtx) { var s = {}; KR.winCtx = KR.winCtx.filter(function (p) { if (s[p.id]) return false; s[p.id] = 1; return true; }); }
    KR.openWin(id, el.querySelector ? el.querySelector('img') : null); KR.renderGlob();
  },
  winclose: function () { KR.closeWin(); },
  winmode: function (el) { S.winMode = el.getAttribute('data-v'); KR.save('winmode', S.winMode); KR.renderOv(); if (!KR.reduce()) { var b = $('#pwin'); if (b) b.animate([{ opacity: .6 }, { opacity: 1 }], { duration: 160 }); } },
  winprev: function () { var l = KR.winList(), i = l.findIndex(function (p) { return p.id === S.win; }); if (i > 0) KR.winGo(l[i - 1].id); },
  winnext: function () { var l = KR.winList(), i = l.findIndex(function (p) { return p.id === S.win; }); if (i >= 0 && i < l.length - 1) KR.winGo(l[i + 1].id); },
  wsame: function (el) { var p = KR.p(S.win), same = KR.sameWork(p), i = same.findIndex(function (x) { return x.src === p.src; }), j = i + Number(el.getAttribute('data-d')); if (same[j]) KR.winGo(same[j].id); },
  winref: function () { if (S.winRef && S.winRef !== S.win) KR.winGo(S.winRef); },
  winsetref: function () { if (S.win) { S.winRef = S.win; KR.renderOv(); if (KR.toast) KR.toast('지금 사진을 기준 사진으로 정했어요'); } },
  winpick: function (el) { if (KR._justDragged) return; KR.winGo(el.getAttribute('data-pid')); },
  winleft: function () { S.winLeft = !S.winLeft; KR.renderOv(); }, winright: function () { S.winRight = !S.winRight; KR.renderOv(); },
  wfav: function () { KR.openFav([S.win]); }, wcmp: function () { var id = S.win; if (S.cmp.indexOf(id) >= 0) KR.delCmp([id]); else KR.addCmp([id]); KR.renderOv(); },
  wfilter: function (el) { S.filters = []; S.color = null; S.tone = {}; S.q = ''; S.hideWorks = []; filterSearch(el.getAttribute('data-f'), el.getAttribute('data-v')); },
  simfind: function () { var p = KR.p(S.win); if (p) KR.imgFromPhoto(p); },
  simmore: function () { var p = KR.p(S.win); if (!p) return; S.scope = 'sim'; S.simIds = KR.similar(p).map(function (x) { return x.id; }); S.simOf = KR.title(p) + ' ' + p.tm; S.filters = []; S.q = ''; S.color = null; S.tone = {}; S.win = null; KR.go({ name: 'search' }); },
  simof: function (el) { var p = KR.p(el.getAttribute('data-pid')); if (!p) return; S.cmpOpen = false; S.scope = 'sim'; S.simIds = KR.similar(p).map(function (x) { return x.id; }); S.simOf = KR.title(p) + ' ' + p.tm; S.win = null; KR.go({ name: 'search' }); },
  orig: function () { KR.toast('시안 — 원본 페이지 주소는 실제 보관함 자료에 있어요(ShotDeck·Frameset)'); },
  workpage: function (el) { var w = el.getAttribute('data-w'); S.win = null; S.cmpOpen = false; KR.go({ name: 'work', w: w }); },
  person: function (el) { S.win = null; S.cmpOpen = false; KR.go({ name: 'person', n: el.getAttribute('data-n') }); },
  worktab: function (el) { S.workTab = el.getAttribute('data-v'); KR.render(); }, worksub: function (el) { S.workSub = el.getAttribute('data-v'); KR.render(); },
  persontab: function (el) { S.personTab = el.getAttribute('data-v'); KR.render(); },
  featgo: function (el) { featGo(el.getAttribute('data-k'), el.getAttribute('data-ctx')); },
  gofilter: function (el) { S.filters = []; filterSearch(el.getAttribute('data-f'), el.getAttribute('data-v'), el.getAttribute('data-ctx')); },
  colorgo: function (el) { var rgb = KR.fromHex(el.getAttribute('data-v')); S.color = { rgb: rgb, min: 0.1, w: KR.weights(rgb) }; filterSearch(null, null, 'w:' + S.route.w); },
  scenego: function (el) { var a = Number(el.getAttribute('data-a')), b = Number(el.getAttribute('data-b')); S.workSub = 'all'; KR._sceneRange = [a, b]; KR.render(); },
  /* 타임라인 */
  tlopen: function () { S.dockOpen = true; KR.save('dock', '1'); KR.renderTimeline('open'); }, tlclose: function () { S.dockOpen = false; KR.save('dock', '0'); KR.renderTimeline('close'); },
  tllevel: function () { var g = S.dockLevel !== 2; S.dockLevel = g ? 2 : 1; KR.renderTimeline(g ? 'grow' : 'shrink'); },
  seenmore: function () { S.scope = 'seen'; S.filters = []; S.q = ''; S.color = null; S.tone = {}; S.cmpOpen = false; S.win = null; KR.go({ name: 'search' }); },
  seendel: function (el) { if (KR._justDragged) return; var id = el.getAttribute('data-pid'); S.seen = S.seen.filter(function (x) { return x !== id; }); KR.renderTimeline(); },
  seenall: function () { var all = S.seen.slice(0, 120); S.sel = S.sel.length && all.every(function (x) { return S.sel.indexOf(x) >= 0; }) ? [] : all; KR.afterSel(); },
  seendelsel: function () { S.seen = S.seen.filter(function (x) { return S.sel.indexOf(x) < 0; }); S.sel = []; KR.afterSel(); },
  seendelall: function () { if (!S.seenConfirm) { S.seenConfirm = true; KR.renderTimeline(); clearTimeout(KR._sct); KR._sct = setTimeout(function () { S.seenConfirm = false; KR.renderTimeline(); }, 3500); return; } S.seen = []; S.sel = []; S.seenConfirm = false; S.dockLevel = 1; KR.afterSel(); },
  crumb: function (el) { var g = el.getAttribute('data-go'); if (g === 'home') KR.home(); else if (g === 'search') { S.win = null; S.cmpOpen = false; KR.go({ name: 'search' }); } else if (g === 'cmp') { S.win = null; KR.renderOv(); } },
  cmpdrop: function (el) { if (KR._justDragged) return; KR.delCmp([el.getAttribute('data-pid')]); },
  cmpclear: function () { S.cmp = []; S.cmpSel = []; S.cmpOpen = false; KR.afterSel(); },
  cmpview: function () { if (!S.cmp.length) return; S.cmpOpen = true; S.inspFilter = null; KR.render(); }, cmpclose: function () { S.cmpOpen = false; S.inspFilter = null; KR.render(); },
  cmpall: function () { S.cmpSel = S.cmpSel.length === S.cmp.length ? [] : S.cmp.slice(); KR.renderOv(); },
  cmpck: function (el) { var id = pidOf(el); S.cmpSel = S.cmpSel.indexOf(id) >= 0 ? S.cmpSel.filter(function (x) { return x !== id; }) : S.cmpSel.concat([id]); KR.renderOv(); var c = $('.cgc[data-cid="' + id + '"] .ck'); if (c && S.cmpSel.indexOf(id) >= 0) KR.springScale(c, .9); },
  cmpfocus: function (el) { if (KR._justDragged || KR.lpQuietNow()) return; var id = pidOf(el); KR._cmpFocus = id; KR.inspHover(id); $$('.cgc').forEach(function (c) { c.classList.toggle('kfocus', c.getAttribute('data-cid') === id); }); },
  cmpdelsel: function () { KR.delCmp(S.cmpSel.slice()); }, cmpdelunsel: function () { KR.delCmp(S.cmp.filter(function (x) { return S.cmpSel.indexOf(x) < 0; })); },
  cmpdelall: function () { if (!S.cmpConfirm) { S.cmpConfirm = true; KR.renderOv(); clearTimeout(KR._cct); KR._cct = setTimeout(function () { S.cmpConfirm = false; KR.renderOv(); }, 3500); return; } S.cmp = []; S.cmpSel = []; S.cmpConfirm = false; S.cmpOpen = false; KR.render(); },
  magnet: function () { S.magnet = !S.magnet; KR.save('magnet', S.magnet ? '1' : '0'); KR.renderOv(); },
  insp: function () { KR.toggleInsp(); },
  inspf: function (el) { var f = el.getAttribute('data-f'), v = el.getAttribute('data-v'); S.inspFilter = S.inspFilter && S.inspFilter.f === f && S.inspFilter.v === v ? null : { f: f, v: v }; if (S.cmpOpen) KR.renderOv(); else KR.render(); },
  /* 즐겨찾기 */
  favclose: function () { var w = $('#fwin'); S.fav = null; KR.saveFav(); if (w && !KR.reduce()) { w.style.animation = 'none'; w.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.98)' }], { duration: 120, fill: 'forwards' }).onfinish = function () { KR.render(); }; } else KR.render(); },
  favundo: function () { var F = S.fav, l = S.favLists.find(function (x) { return x.id === F.quick; }); if (!l) return; if (F.undone) { l.ids = l.ids.concat(F.ids.filter(function (x) { return l.ids.indexOf(x) < 0; })); F.undone = false; } else { l.ids = l.ids.filter(function (x) { return F.ids.indexOf(x) < 0; }); F.undone = true; } KR.saveFav(); KR.refreshMarks(); KR.render(); },
  favdef: function () { var F = S.fav; F.makeDef = !F.makeDef; if (F.makeDef && F.pick) S.favLists.forEach(function (l) { l.def = l.id === F.pick; }); else if (!F.makeDef) S.favLists.forEach(function (l) { l.def = l.id === F.quick; }); KR.saveFav(); KR.renderOv(); },
  favothers: function () { S.fav.others = !S.fav.others; KR.renderOv(); var g = $('.lcards'); if (g && S.fav.others && !KR.reduce()) g.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' }); },
  favtoggle: function (el) { var F = S.fav, l = S.favLists.find(function (x) { return x.id === el.getAttribute('data-l'); }); if (!l) return; var all = F.ids.every(function (x) { return l.ids.indexOf(x) >= 0; }); l.ids = all ? l.ids.filter(function (x) { return F.ids.indexOf(x) < 0; }) : l.ids.concat(F.ids.filter(function (x) { return l.ids.indexOf(x) < 0; })); if (!all && l.id !== F.quick) F.pick = l.id; if (F.makeDef && F.pick) S.favLists.forEach(function (x) { x.def = x.id === F.pick; }); KR.saveFav(); KR.refreshMarks(); KR.renderOv(); },
  favnew: function () { var F = S.fav, nm = (F.q || '').trim() || '새 목록 ' + (S.favLists.length + 1); var l = { id: 'l' + Date.now(), name: nm, color: ['#3f6fcb', '#d25c94', '#4e9a55', '#7d57b8', '#2f9a96'][S.favLists.length % 5], ids: F.ids.slice() }; S.favLists.unshift(l); F.pick = l.id; F.q = ''; KR.saveFav(); KR.refreshMarks(); KR.renderOv(); },
  favq: function () { var F = S.fav, q = (F.q || '').trim(); if (!q) return; var l = S.favLists.find(function (x) { return x.name === q; }); if (l) { l.ids = l.ids.concat(F.ids.filter(function (x) { return l.ids.indexOf(x) < 0; })); F.pick = l.id; F.q = ''; KR.saveFav(); KR.refreshMarks(); KR.renderOv(); } else ACT.favnew(); },
  favpick: function (el) { S.favList = el.getAttribute('data-l'); S.inspFilter = null; S.favManage = false; KR.render(); },
  favnewl: function () { S.favNewOpen = !S.favNewOpen; KR.render(); setTimeout(function () { var i = $('#favnewname'); if (i) i.focus(); }, 0); },
  favcreate: function () { var nm = (S.favNewName || '').trim() || '새 목록 ' + (S.favLists.length + 1); var l = { id: 'l' + Date.now(), name: nm, color: '#7d57b8', ids: [] }; S.favLists.push(l); S.favList = l.id; S.favNewOpen = false; S.favNewName = ''; KR.saveFav(); KR.render(); },
  favcond: function () { S.favCond = !S.favCond; KR.render(); }, favmanage: function () { S.favManage = !S.favManage; S.favDelConfirm = false; KR.render(); },
  favdefset: function () { S.favLists.forEach(function (l) { l.def = l.id === S.favList; }); KR.saveFav(); KR.render(); },
  favdel: function () { if (!S.favDelConfirm) { S.favDelConfirm = true; KR.render(); return; } S.favLists = S.favLists.filter(function (l) { return l.id !== S.favList; }); if (!S.favLists.length) S.favLists.push({ id: 'l' + Date.now(), name: '기본 목록', color: '#3f6fcb', def: true, ids: [] }); if (!S.favLists.some(function (l) { return l.def; })) S.favLists[0].def = true; S.favList = S.favLists[0].id; S.favDelConfirm = false; S.favManage = false; KR.saveFav(); KR.render(); },
  favonly: function () { S.scope = 'fav'; S.filters = []; S.q = ''; KR.go({ name: 'search' }); },
  favremove: function () { var l = S.favLists.find(function (x) { return x.id === S.favList; }); if (!l) return; l.ids = l.ids.filter(function (x) { return S.sel.indexOf(x) < 0; }); S.sel = []; KR.saveFav(); KR.render(); },
  /* 창들 */
  keys: function () { S.keysOpen = !S.keysOpen; KR.renderOv(); KR.renderTimeline(); },
  export: function (el) { var k = el.getAttribute('data-ids'), ids = k === 'cmp' ? (S.cmpSel.length ? S.cmpSel.slice() : S.cmp.slice()) : k === 'fav' ? KR.favPageList().map(function (p) { return p.id; }) : el.getAttribute('data-pid') ? [el.getAttribute('data-pid')] : KR.targetIds(); KR.openExport(ids); },
  expclose: function () { S.exp = null; KR.renderOv(); }, expcsv: function () { S.exp.csv = !S.exp.csv; KR.renderOv(); },
  expfolder: function () { KR.toast('시안 — 폴더 고르기는 PC 앱에서 열려요'); },
  expgo: function () { var n = Math.min(20, S.exp.ids.length), c = S.exp.csv; S.exp = null; KR.renderOv(); KR.toast('시안이라 파일은 쓰지 않았어요 — 실제 앱은 ' + n + '장' + (c ? ' + shots-info.csv' : '') + '을 고른 폴더에 복사'); },
  /* 필름 릴 */
  lpgo: function (el) { if (KR.lpQuietNow()) return; KR.lpGo(el.getAttribute('data-ax'), Number(el.getAttribute('data-k'))); },
  lpwin: function () { if (KR.lpQuietNow()) return; if (KR._lpFocus) { KR.winCtx = null; KR._winFrom = $('.rcb img') ? $('.rcb img').getBoundingClientRect() : null; S.win = KR._lpFocus; S.winRef = S.win; S.winPrev = null; S.seen = [S.win].concat(S.seen.filter(function (x) { return x !== S.win; })); KR.renderOv('winopen'); } },
  lphome: function (el, e) { if (e) e.stopPropagation(); KR.lpHome(); },
  /* 분석 실행(시안) */
  aiopen: function () { S.aiFolder = true; KR.render(); }, aiscope: function (el) { S.aiScope = el.getAttribute('data-v'); KR.render(); }, aidev: function (el) { S.aiDev = el.getAttribute('data-v'); KR.render(); },
  aistage: function (el) { var v = el.getAttribute('data-v'); S.aiStage[v] = !S.aiStage[v]; KR.render(); }, aiplan: function () { S.aiState = 'plan'; KR.render(); },
  aistart: function () { S.aiState = 'run'; KR._aiP = 0; clearInterval(KR._ait); KR._ait = setInterval(function () { KR._aiP += 7; if (KR._aiP >= 100) { clearInterval(KR._ait); S.aiState = 'done'; } if (S.route.name === 'ai') KR.render(); }, 160); KR.render(); },
  aistop: function () { clearInterval(KR._ait); S.aiState = 'plan'; KR.render(); },
  sian: function () { S.sian = !S.sian; KR.renderSian(); }, scene: function (el) { KR.scene(el.getAttribute('data-v')); },
  sset: function (el) { var k = el.getAttribute('data-k'), v = el.getAttribute('data-v'); if (k === 'theme') KR.setTheme(v); if (k === 'check') { S.check = v; KR.save('check', v); KR.applyLook(); } if (k === 'layout') ACT.layout(el); if (k === 'rm') { S.rmUser = v === '1'; KR.save('rm', v); KR.applyLook(); } KR.renderSian(); },
  sreset: function () { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('krx-') === 0) localStorage.removeItem(k); }); sessionStorage.removeItem('krx-seed'); } catch (e) {} location.reload(); },
  scopy: function () { var i = $('#sianurl'); if (!i) return; try { navigator.clipboard.writeText(i.value).then(function () { KR.toast('주소를 복사했어요'); }, function () { i.select(); }); } catch (e) { i.select(); } }
};
KR.ACT = ACT;
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  var a = el.getAttribute('data-act'); if (!ACT[a]) return;
  if (KR._holdFired && el.hasAttribute('data-hold')) { KR._holdFired = false; return; }
  if (el.tagName === 'A') e.preventDefault();
  ACT[a](el, e);
});
document.addEventListener('keydown', function (e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role=checkbox][data-act]')) { e.preventDefault(); e.target.click(); }
});

/* ── 입력 ── */
document.addEventListener('input', function (e) {
  var el = e.target, k = el.getAttribute && el.getAttribute('data-input'); if (!k) return;
  if (k === 'q') { S.q = el.value; clearTimeout(KR._qt); KR._qt = setTimeout(function () { KR.leaveCmpOff(); KR.renderSearch(); KR.renderGlob(); }, 120); }
  if (k === 'fq') { S.fq = el.value; KR.renderSearch({ keepGrid: true }); }
  var d = S.draft;
  if (k === 'hue') { d.h = Number(el.value); d.rgb = KR.hsvToRgb(d.h, d.s, d.v); KR.renderOv(); }
  if (k === 'hex') { var rgb = KR.fromHex(el.value); if (rgb) { var x = KR.rgbToHsv(rgb); Object.assign(d, { rgb: rgb, h: x[0], s: x[1], v: x[2] }); KR.renderOv(); } }
  if (k === 'area') { d.min = Number(el.value) / 100; KR.renderOv(); }
  if (k === 'tv' || k === 'tlo' || k === 'thi') { var key = el.getAttribute('data-k'); d[key][k === 'tv' ? 'v' : k === 'tlo' ? 'lo' : 'hi'] = Number(el.value); KR.renderOv(); }
  if (k === 'favq') { S.fav.q = el.value; KR.renderOv(); }
  if (k === 'favfind') { S.favQ = el.value; KR.render(); }
  if (k === 'favnewname') S.favNewName = el.value;
  if (k === 'favrename') { var l = S.favLists.find(function (x) { return x.id === S.favList; }); if (l) { l.name = el.value || l.name; KR.saveFav(); clearTimeout(KR._rnt); KR._rnt = setTimeout(function () { KR.render(); }, 400); } }
});
document.addEventListener('change', function (e) { if (e.target.id === 'imgfile' && e.target.files && e.target.files[0]) KR.imgFromFile(e.target.files[0]); });
document.addEventListener('paste', function (e) { if (!S.imgFind) return; var it = e.clipboardData && Array.prototype.find.call(e.clipboardData.items || [], function (x) { return x.type && x.type.indexOf('image/') === 0; }); if (it) { e.preventDefault(); KR.imgFromFile(it.getAsFile()); } });
document.addEventListener('dragover', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
document.addEventListener('dragleave', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) d.classList.remove('over'); });
document.addEventListener('drop', function (e) { var d = e.target.closest && e.target.closest('#drop'); if (d) { e.preventDefault(); d.classList.remove('over'); if (e.dataTransfer.files[0]) KR.imgFromFile(e.dataTransfer.files[0]); } });

/* ── 키(대체 입력 포함 — 체크리스트 B) ── */
window.addEventListener('keydown', function (e) {
  /* Alt+←/→ 는 브라우저 뒤로·앞으로(마우스 뒤로 버튼을 이 키로 보내는 마우스도 있음) — 가로채지 않음. 10-22 사용자: 뒤로 가기를 눌렀는데 사진 창 사진이 바뀜 */
  if (e.altKey || e.key === 'BrowserBack' || e.key === 'BrowserForward') return;
  var t = e.target, tag = t && t.tagName, typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable);
  var k = e.key;
  if (S.lp && !S.win) {
    if (k === 'Escape') { e.preventDefault(); KR.lpClose(); } else if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); KR.lpStep('h', k === 'ArrowLeft' ? -1 : 1); } else if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); KR.lpStep('v', k === 'ArrowUp' ? -1 : 1); }
    else if (k === 'Home' || k === 'Backspace') { e.preventDefault(); KR.lpHome(); } else if (k === 'Enter') { e.preventDefault(); ACT.lpwin(); }
    return;
  }
  if (S.win) {
    if (typing) return;
    if (k === 'Escape') { e.preventDefault(); KR.closeWin(); return; }
    if (k === 'Home') { e.preventDefault(); ACT.winref(); return; }
    if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); if (S.winMode === 'detail') ACT.wsame({ getAttribute: function () { return k === 'ArrowLeft' ? '-1' : '1'; } }); else (k === 'ArrowLeft' ? ACT.winprev : ACT.winnext)(); return; }
    if (k === 'f' || k === 'F') { e.preventDefault(); ACT.wfav(); return; } if (k === 'c' || k === 'C') { e.preventDefault(); ACT.wcmp(); return; }
    return;
  }
  if (S.fav || S.exp || S.keysOpen) { if (k === 'Escape') { if (S.fav) ACT.favclose(); else if (S.exp) ACT.expclose(); else ACT.keys(); } return; }
  if (S.cond && k === 'Escape' && !typing) { ACT.cclose(); return; }
  if (typing) { if (k === 'Escape' && t.blur) t.blur(); return; }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  /* 비교함 띠에 포커스: ← → 한 칸 */
  if (t && t.getAttribute && t.getAttribute('data-kstrip') && (k === 'ArrowLeft' || k === 'ArrowRight')) { e.preventDefault(); t.scrollBy({ left: k === 'ArrowLeft' ? -56 : 56, behavior: KR.reduce() ? 'auto' : 'smooth' }); return; }
  var low = k.toLowerCase();
  if (k === '?') { e.preventDefault(); ACT.keys(); return; }
  if (k === '/' && S.route.name === 'search' && !S.cmpOpen) { var q = $('#q'); if (q) { e.preventDefault(); q.focus(); } return; }
  if (k === 'Escape') { if (S.cmpOpen) { ACT.cmpclose(); return; } if (S.sortOpen) { ACT.sortclose(); return; } if (S.sel.length) { ACT.clearsel(); return; } if (S.imgFind) { ACT.imgfindoff(); return; } return; }
  if (S.cmpOpen) {
    if (k === '[' || k === ']') { e.preventDefault(); KR.cmpMove(k === '[' ? -1 : 1); return; }
    if (low === 'v') { e.preventDefault(); ACT.cmpclose(); return; }
    if (low === 'i') { e.preventDefault(); KR.toggleInsp(); return; }
    if (low === 'r') { var fid = KR._cmpFocus || KR.focusPid() || S.cmpSel[0] || S.cmp[0]; if (fid) { e.preventDefault(); KR.lpOpen(fid); } return; }
    if (k === 'Enter') { var f2 = KR.focusPid(); if (f2) { e.preventDefault(); KR.openWin(f2); } return; }
    if (low === 'x' || k === ' ') { var f3 = KR.focusPid(); if (f3) { e.preventDefault(); ACT.cmpck({ closest: function () { return { getAttribute: function () { return f3; } }; }, getAttribute: function () { return f3; } }); } return; }
    if (low === 'c') { var f4 = KR.focusPid() || KR._cmpFocus; if (f4) { e.preventDefault(); KR.delCmp([f4]); } return; }
    if (low === 'f') { var ids0 = S.cmpSel.length ? S.cmpSel.slice() : KR.focusPid() ? [KR.focusPid()] : []; if (ids0.length) { e.preventDefault(); KR.openFav(ids0); } return; }
    return;
  }
  if (k === '[' && S.route.name === 'search') { e.preventDefault(); sideToggle(); return; }
  if (low === 'i' && S.route.name === 'fav') { e.preventDefault(); KR.toggleInsp(); return; }
  if (low === 'v') { if (S.cmp.length) { e.preventDefault(); ACT.cmpview(); } return; }
  var ids = KR.targetIds();
  if (low === 'r') { var rid = KR._hoverId || KR.focusPid() || S.sel[0]; if (rid) { e.preventDefault(); KR.lpOpen(rid); } return; }
  if (k === 'Enter') { var ep = KR.focusPid(); if (ep && t.classList && !t.classList.contains('tb')) { e.preventDefault(); KR.openWin(ep); } return; }
  if (low === 'x') { var xid = KR._hoverId || KR.focusPid(); if (xid) { e.preventDefault(); KR.toggleSel(xid); } return; }
  if (!ids.length) return;
  if (low === 'c') { e.preventDefault(); if (!S.sel.length && S.cmp.indexOf(ids[0]) >= 0) KR.delCmp(ids); else KR.addCmp(ids); }
  else if (low === 'f') { e.preventDefault(); KR.openFav(ids); }
});
document.addEventListener('mouseover', function (e) {
  var t = e.target.closest && e.target.closest('.tile[data-pid], .cgc[data-cid]'); KR._hoverId = t ? (t.getAttribute('data-pid') || t.getAttribute('data-cid')) : null;
  if (t && (S.cmpOpen || S.route.name === 'fav') && t.closest('#cg, #favgrid')) KR.inspHover(KR._hoverId);
});

/* ── 끌기: 가로 띠(관성 0.9965/ms, 끝 고무줄) · 결과 칸 세로 끌기(0.93/프레임) ── */
var glide = null, vglide = null;
KR.stopGlides = function () { if (glide) cancelAnimationFrame(glide); if (vglide) cancelAnimationFrame(vglide); glide = vglide = null; KR._drag = KR._vdrag = null; };
function springBack(el) { el.style.transition = 'transform .5s cubic-bezier(.18,1.45,.4,1)'; el.style.transform = ''; setTimeout(function () { el.style.transition = ''; }, 520); }
function bump(el, v) { if (KR.reduce()) return; var px = -Math.sign(v) * Math.min(46, Math.abs(v) * 2.2); el.style.transition = 'transform .14s ease-out'; el.style.transform = 'translateX(' + px.toFixed(1) + 'px)'; setTimeout(function () { springBack(el); }, 140); }
function stripDown(e, el) {
  if (glide) { cancelAnimationFrame(glide); glide = null; } el.classList.remove('gliding');
  KR._drag = { x: e.clientX, left: el.scrollLeft, el: el, id: e.pointerId, moved: false, pts: [[performance.now(), e.clientX]], v: 0, lastT: performance.now() };
}
function stripMove(e) {
  var d = KR._drag; if (!d) return; var dx = e.clientX - d.x;
  if (!d.moved && Math.abs(dx) > KR.DRAG_START) { d.moved = true; KR.lpCancel(); d.el.classList.add('dragging'); try { d.el.setPointerCapture(d.id); } catch (x) {} }
  if (!d.moved) return;
  var want = d.left - dx, max = d.el.scrollWidth - d.el.clientWidth, over = want < 0 ? want : want > max ? want - max : 0;
  d.el.scrollLeft = Math.max(0, Math.min(max, want)); d.over = KR.reduce() ? 0 : -Math.sign(over) * Math.min(90, Math.pow(Math.abs(over), 0.82) * 0.55);
  d.el.style.transform = d.over ? 'translateX(' + d.over.toFixed(1) + 'px)' : '';
  var now = performance.now(); d.pts.push([now, e.clientX]); while (d.pts.length > 2 && now - d.pts[0][0] > 90) d.pts.shift();
  var a = d.pts[0]; d.v = (e.clientX - a[1]) / Math.max(8, now - a[0]); d.lastT = now;
}
function stripUp() {
  var d = KR._drag; KR._drag = null; if (!d || !d.moved) return; d.el.classList.remove('dragging');
  KR._justDragged = true; setTimeout(function () { KR._justDragged = false; }, 0);
  if (d.over) { springBack(d.el); return; } if (performance.now() - d.lastT > 80) return;
  var v = -d.v, el = d.el, pos = el.scrollLeft, last = performance.now(); if (KR.reduce() || Math.abs(v) < 0.05) return;
  el.classList.add('gliding'); var stop = function () { glide = null; el.classList.remove('gliding'); };
  var step = function (now) { var dt = Math.min(40, Math.max(1, now - last)); last = now; var max = el.scrollWidth - el.clientWidth; pos += v * dt; v *= Math.pow(0.9965, dt);
    if (pos <= 0 || pos >= max) { el.scrollLeft = pos <= 0 ? 0 : max; stop(); if (Math.abs(v) > 0.12) bump(el, v * 16); return; } el.scrollLeft = pos; if (Math.abs(v) > 0.02) glide = requestAnimationFrame(step); else stop(); };
  glide = requestAnimationFrame(step);
}
function vDown(e, el) { if (vglide) { cancelAnimationFrame(vglide); vglide = null; } KR._vdrag = { y: e.clientY, top: el.scrollTop, el: el, id: e.pointerId, moved: false, lastY: e.clientY, lastT: performance.now(), v: 0 }; }
function vMove(e) { var d = KR._vdrag; if (!d) return; var dy = e.clientY - d.y; if (!d.moved && Math.abs(dy) > KR.DRAG_START) { d.moved = true; KR.lpCancel(); d.el.classList.add('vdrag'); try { var sl = window.getSelection(); if (sl && sl.rangeCount) sl.removeAllRanges(); } catch (x) {} try { d.el.setPointerCapture(d.id); } catch (x) {} } if (!d.moved) return; d.el.scrollTop = d.top - dy; var now = performance.now(), dt = Math.max(1, now - d.lastT), v = (e.clientY - d.lastY) / dt; d.v = d.v * 0.6 + v * 0.4; d.lastY = e.clientY; d.lastT = now; }
function vUp() { var d = KR._vdrag; KR._vdrag = null; if (!d || !d.moved) return; d.el.classList.remove('vdrag'); KR._justDragged = true; setTimeout(function () { KR._justDragged = false; }, 0); if (performance.now() - d.lastT > 80 || KR.reduce()) return;
  var v = -d.v * 16, el = d.el, pos = el.scrollTop, last = performance.now(); if (Math.abs(v) < 0.5) return;
  var step = function (now) { var dt = Math.min(40, Math.max(1, now - last)); last = now; pos += v * dt / 16.7; v *= Math.pow(0.93, dt / 16.7); el.scrollTop = pos; if (Math.abs(v) > 0.3 && pos > 0 && pos < el.scrollHeight - el.clientHeight && Math.abs(el.scrollTop - pos) < 3) vglide = requestAnimationFrame(step); else vglide = null; };
  vglide = requestAnimationFrame(step); }
/* 검색 칸 면 투명도: 0px → 1, 900px 이상 → 0.7 (한 프레임에 한 번만 씀, 레이아웃 읽기는 scrollTop 하나) */
KR.SB_FADE = 900; KR.SB_MAX = 0.9; KR.SB_MIN = 0.6;   /* 10-22 사용자 '지금기준 10%만 투명하게': 맨 위 100%→90%, 가장 내렸을 때 70%→60% */   /* 사용자 10-21 23시: 600px·0.6 → '조금 더 내려야' 900px, '10%만 불투명하게' 0.7 */
KR.sbAlpha = function (top) { var t = Math.max(0, Math.min(1, top / KR.SB_FADE)); return KR.SB_MAX - (KR.SB_MAX - KR.SB_MIN) * t; };
KR.setSbAlpha = function (top) { document.documentElement.style.setProperty('--kr-sb-a', KR.sbAlpha(top).toFixed(3)); };
KR.bindMain = function (main) {
  KR.setSbAlpha(main.scrollTop);
  main.addEventListener('scroll', function () { if (!KR._sbRaf) KR._sbRaf = requestAnimationFrame(function () { KR._sbRaf = 0; KR.setSbAlpha(main.scrollTop); }); }, { passive: true });
  main.addEventListener('scroll', function () { if (!main.classList.contains('scrolling')) main.classList.add('scrolling'); clearTimeout(KR._scr); KR._scr = setTimeout(function () { main.classList.remove('scrolling'); }, 140); }, { passive: true });
};

/* ── 끌어 담기(체크한 사진): 7장씩 줄, 빠르면 꼬리, 놓을 곳 부풂 → 빨려 들어감 ── */
KR.gdStart = function (x, y) {
  var ids = S.sel.slice(), list = ids.map(KR.p).filter(Boolean); if (!list.length || KR._gd) return;
  var W = KR.GD_W, items = list.slice(0, KR.GD_MAX).map(function (p) { var tw = $('#grid .tile[data-pid="' + p.id + '"]'), r = tw ? tw.getBoundingClientRect() : null, h = Math.round(W / Math.max(0.75, p.ar || 1.78)); return { id: p.id, src: p.src, h: h, cx: r && r.width ? r.left + r.width / 2 : x, cy: r && r.width ? r.top + r.height / 2 : y, sc: r && r.width ? r.width / W : 1 }; });
  var G = { ids: ids, items: items, rowH: Math.max.apply(null, items.map(function (it) { return it.h; })), px: x, py: y, ax: x, ay: y, mode: 'grid', t0: performance.now(), last: performance.now(), hot: null };
  G.move = function (ev) { G.px = ev.clientX; G.py = ev.clientY; G.last = performance.now(); gdHot(ev.clientX, ev.clientY); };
  G.up = function () { gdEnd(); };
  window.addEventListener('pointermove', G.move); window.addEventListener('pointerup', G.up); window.addEventListener('pointercancel', G.up);
  try { var sl = window.getSelection(); if (sl && sl.rangeCount) sl.removeAllRanges(); } catch (x) {}
  KR._gd = G; document.documentElement.classList.add('gd-dragging'); KR.renderGlob();
  var layer = $('#ovgd'); layer.innerHTML = '<div class="gd-layer" aria-hidden="true">' + items.map(function (it, i) { return '<img class="gd-th" data-gi="' + i + '" src="' + it.src + '" alt="" draggable="false" style="width:' + W + 'px;height:' + it.h + 'px;transform:translate(' + (it.cx - W / 2).toFixed(1) + 'px,' + (it.cy - it.h / 2).toFixed(1) + 'px) scale(' + it.sc.toFixed(3) + ')">'; }).join('') + (ids.length > KR.GD_MAX ? '<span class="gd-more">+' + (ids.length - KR.GD_MAX) + '</span>' : '') + '<div class="gd-tip" id="gdtip" hidden></div></div>';
  var loop = function () { if (KR._gd !== G) return; gdFrame(); G.raf = requestAnimationFrame(loop); }; G.raf = requestAnimationFrame(loop);
};
function gdFrame() {
  var G = KR._gd; if (!G) return; var now = performance.now(), reduce = KR.reduce(), n = G.items.length, W = KR.GD_W, gap = 6, cols = KR.GD_COLS, hot = !!G.hot;
  if (G.mode === 'tail' && now - G.last > 220) { G.mode = 'grid'; G.ax = G.px; G.ay = G.py; G.t0 = now; }
  if (G.mode === 'grid' && Math.hypot(G.px - G.ax, G.py - G.ay) > 48) G.mode = 'tail';
  var bw = Math.min(n, cols) * (W + gap) - gap, bh = Math.ceil(n / cols) * (G.rowH + gap) - gap, ox = G.ax + 20, oy = G.ay + 20;
  if (ox + bw > innerWidth - 8) ox = Math.max(8, G.ax - 20 - bw); if (oy + bh > innerHeight - 8) oy = Math.max(8, G.ay - 20 - bh);
  var lead = null;
  G.items.forEach(function (it, i) {
    var waiting = !reduce && G.mode === 'grid' && !hot && now - G.t0 < i * 30;
    if (!waiting) { var tx, ty, sc, k;
      if (G.mode === 'grid' && !hot) { tx = ox + (i % cols) * (W + gap) + W / 2; ty = oy + Math.floor(i / cols) * (G.rowH + gap) + G.rowH / 2; sc = 1; k = 0.24; }
      else if (!lead) { tx = G.px + 22; ty = G.py + 18; sc = hot ? 0.6 : 1; k = 0.45; } else { tx = lead.cx + (hot ? 3 : 9); ty = lead.cy + (hot ? 2 : 7); sc = hot ? 0.56 : 0.9; k = 0.28; }
      it.cx += (tx - it.cx) * (reduce ? 1 : k); it.cy += (ty - it.cy) * (reduce ? 1 : k); it.sc += (sc - it.sc) * (reduce ? 1 : 0.25); }
    lead = it; var el = $('.gd-th[data-gi="' + i + '"]'); if (!el) return;
    el.style.transform = 'translate(' + (it.cx - W / 2).toFixed(1) + 'px,' + (it.cy - it.h / 2).toFixed(1) + 'px) scale(' + it.sc.toFixed(3) + ')'; el.style.zIndex = String(n - i);
  });
  var more = $('.gd-more'); if (more) more.style.transform = 'translate(' + (G.px + 14) + 'px,' + (G.py - 26) + 'px)';
  var tip = $('#gdtip'); if (tip && G.hot) { var r = G.hot.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, below = r.top - th - 14 < 8; tip.style.transform = 'translate(' + Math.max(8, Math.min(innerWidth - tw - 8, r.left + r.width / 2 - tw / 2)).toFixed(0) + 'px,' + (below ? r.bottom + 12 : r.top - th - 12).toFixed(0) + 'px)'; }
}
function gdHot(x, y) {
  var G = KR._gd; if (!G) return; var ft = $('#ftog'); if (ft) { var fr = ft.getBoundingClientRect(); ft.classList.toggle('near', x > fr.left - 60 && x < fr.right + 60 && y > fr.top - 50 && y < fr.bottom + 50); }
  var best = null; $$('[data-drop]').forEach(function (el) { var b = el.getBoundingClientRect(); if (!b.width) return; if (x >= b.left - 6 && x <= b.right + 6 && y >= b.top - 6 && y <= b.bottom + 6) best = el; });
  if (best === G.hot) return; if (G.hot) G.hot.classList.remove('drop-hot'); if (best) best.classList.add('drop-hot'); G.hot = best;
  var tip = $('#gdtip'); if (!tip) return; if (!best) { tip.hidden = true; return; }
  var kind = best.getAttribute('data-drop'), inCmp = G.ids.filter(function (z) { return S.cmp.indexOf(z) >= 0; }).length;
  tip.hidden = false; tip.innerHTML = kind === 'fav' ? ic('fav') + '<b>즐겨찾기에 담기</b><span>놓으면 기본 목록에 담고 고를 수 있어요</span><b class="n">' + G.ids.length + '장</b>' : ic('cmp') + '<b>비교함에 담기</b><span>' + (inCmp ? '이미 담긴 ' + inCmp + '장은 빼고 담아요' : '놓으면 비교함 ' + S.cmp.length + '/' + KR.CMP_MAX + ' 에 더해요') + '</span><b class="n">' + G.ids.length + '장</b>';
}
function gdEnd() {
  var G = KR._gd; if (!G) return; KR._gd = null; cancelAnimationFrame(G.raf);
  window.removeEventListener('pointermove', G.move); window.removeEventListener('pointerup', G.up); window.removeEventListener('pointercancel', G.up);
  document.documentElement.classList.remove('gd-dragging'); KR._justDragged = true; setTimeout(function () { KR._justDragged = false; }, 0);
  var hot = G.hot, kind = hot ? hot.getAttribute('data-drop') : null, reduce = KR.reduce(), W = KR.GD_W, n = G.items.length, q = function (i) { return $('.gd-th[data-gi="' + i + '"]'); };
  var tip = $('#gdtip'); if (tip) tip.hidden = true; var more = $('.gd-more'); if (more) more.style.opacity = '0';
  var clear = function () { $('#ovgd').innerHTML = ''; KR.renderGlob(); };
  if (hot) {
    hot.classList.remove('drop-hot'); var r = hot.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2;
    G.items.forEach(function (it, i) { var el = q(i); if (!el) return; el.style.transition = reduce ? 'none' : 'transform 200ms cubic-bezier(.4,0,.2,1) ' + (i * 0.028).toFixed(3) + 's, opacity .16s ease-in ' + (i * 0.028 + 0.06).toFixed(3) + 's'; el.style.transform = 'translate(' + (tx - W / 2).toFixed(1) + 'px,' + (ty - it.h / 2).toFixed(1) + 'px) scale(.06)'; el.style.opacity = '0'; });
    setTimeout(function () {
      if (kind === 'fav') KR.openFav(G.ids); else KR.addCmp(G.ids);
      var h2 = kind === 'fav' ? $('#ftog [data-drop=fav]') || $('.selz [data-drop=fav]') : $('#tl'); KR.springScale(h2, 1.12);
      clear();
    }, reduce ? 0 : 200 + n * 28);
    return;
  }
  G.items.forEach(function (it, i) { var el = q(i); if (!el) return; var tw = $('#grid .tile[data-pid="' + it.id + '"]'), b = tw ? tw.getBoundingClientRect() : null; el.style.transition = reduce ? 'none' : 'transform .34s cubic-bezier(.3,1.1,.5,1) ' + (i * 0.02).toFixed(3) + 's, opacity .3s ease ' + (i * 0.02 + 0.06).toFixed(3) + 's'; if (b && b.width) el.style.transform = 'translate(' + (b.left + b.width / 2 - W / 2).toFixed(1) + 'px,' + (b.top + b.height / 2 - it.h / 2).toFixed(1) + 'px) scale(' + (b.width / W).toFixed(3) + ')'; el.style.opacity = '0'; });
  setTimeout(clear, reduce ? 0 : 380 + n * 20);
}

/* ── 누르기 시작(pointerdown) 모음 ── */
document.addEventListener('pointerdown', function (e) {
  if (e.button !== 0) return; var t = e.target;
  /* 필름 릴 안 */
  var reel = t.closest && t.closest('#reel');
  if (reel) { KR.lpDragStart(e.clientX, e.clientY); KR._lpEl = reel; return; }
  /* 비교함 칸 */
  var cell = t.closest('.cgc'); if (cell && e.pointerType !== 'touch') { KR.cmpGrab(e, cell); return; }
  /* 누르고 있으면 계속(사진 창 화살표) */
  var hb = t.closest('[data-hold]'); if (hb && !hb.disabled) { var act = hb.getAttribute('data-act'); clearTimeout(KR._ht); clearInterval(KR._hi); KR._holdFired = false; KR._ht = setTimeout(function () { KR._holdFired = true; ACT[act](hb); KR._hi = setInterval(function () { if (hb.isConnected && !hb.disabled) ACT[act](hb); else { var n2 = $('[data-act="' + act + '"]'); if (n2 && !n2.disabled) ACT[act](n2); } }, 160); }, 400); var stopH = function () { clearTimeout(KR._ht); clearInterval(KR._hi); window.removeEventListener('pointerup', stopH); }; window.addEventListener('pointerup', stopH); return; }
  /* 영화 시간 띠 훑기 */
  var tbd = t.closest('#timeband'); if (tbd) { KR._scrub = true; scrubAt(tbd, e.clientX); try { tbd.setPointerCapture(e.pointerId); } catch (x) {} return; }
  /* 색판 */
  var sv = t.closest('#svbox'); if (sv) { KR._sv = true; svPick(sv, e); try { sv.setPointerCapture(e.pointerId); } catch (x) {} return; }
  /* 사진 칸: 1초 누르기 / 체크한 사진이면 끌어 담기 */
  var tile = t.closest('.tile[data-pid]'); var inStrip = t.closest('[data-strip]');
  if (tile && !t.closest('.ckh, .cmpb, .slate') && e.pointerType !== 'touch' && !t.closest('.g5')) {
    var id = tile.getAttribute('data-pid'), selected = S.sel.indexOf(id) >= 0 && S.route.name === 'search' && tile.closest('#grid');
    KR.lpPress(e, id, tile, function (ev) { if (selected) KR.gdStart(ev.clientX, ev.clientY); });
    if (selected) return;
  }
  if (inStrip && e.pointerType === 'mouse') { stripDown(e, inStrip); return; }
  var main = t.closest('#main, #page, #fvmain'); if (main && e.pointerType === 'mouse' && !t.closest('input, button:not(.tb), select, textarea, .cp, [data-strip]')) vDown(e, main);
});
window.addEventListener('pointermove', function (e) {
  if (KR._lpEl) { var g = KR._lpDrag, was = g && g.moved; KR.lpDragMove(e.clientX, e.clientY, 'pull'); if (g && !was && g.moved) KR._lpEl.classList.add('pulling'); }
  if (KR._drag) stripMove(e); if (KR._vdrag) vMove(e);
  if (KR._scrub) { var tb = $('#timeband'); if (tb) scrubAt(tb, e.clientX); }
  if (KR._sv) { var sv = $('#svbox'); if (sv) svPick(sv, e); }
});
window.addEventListener('pointerup', function (e) {
  if (KR._lpEl) { var moved = KR.lpDragEnd(); var reel = KR._lpEl; KR._lpEl = null; if (!moved && e.target === reel || (!moved && e.target.closest && e.target.closest('#reel') && !e.target.closest('.rf, .rcb, .rfirst') && !KR.lpQuietNow())) KR.lpClose(); }
  stripUp(); vUp();
  if (KR._scrub) { KR._scrub = false; var tb = $('#timeband'); if (tb && KR._scrubPid && Math.abs(e.clientX - (KR._scrubX || e.clientX)) < 3) KR.openWin(KR._scrubPid); }
  KR._sv = false;
});
/* 바퀴: 필름 릴 안에서만 넘김(브라우저 스크롤은 가로채지 않음) */
window.addEventListener('wheel', function (e) { if (!S.lp || S.win) return; if (!e.target.closest || !e.target.closest('#reel')) return; e.preventDefault(); var now = performance.now(); if (KR._lpw && now - KR._lpw < 140) return; KR._lpw = now; if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) KR.lpStep('h', e.deltaX > 0 ? 1 : -1); else KR.lpStep('v', e.deltaY > 0 ? 1 : -1); }, { passive: false });
function scrubAt(tb, x) {
  var r = tb.getBoundingClientRect(), f = Math.max(0, Math.min(1, (x - r.left) / r.width)), max = Number(tb.getAttribute('data-max')), sec = f * max, best = null, d = 1e9;
  KR.$$('i[data-pid]', tb).forEach(function (i) { var p = KR.p(i.getAttribute('data-pid')), dd = Math.abs(p.sec - sec); if (dd < d) { d = dd; best = i; } });
  KR.$$('i.on', tb).forEach(function (i) { i.classList.remove('on'); }); if (!best) return; best.classList.add('on');
  var p = KR.p(best.getAttribute('data-pid')), sc = $('#scrub'); KR._scrubPid = p.id; if (KR._scrubX == null || !KR._scrub) KR._scrubX = x;
  if (sc) { sc.style.left = (p.sec / max * 100) + '%'; sc.querySelector('img').src = p.src; sc.querySelector('span').textContent = p.tm; sc.style.display = 'block'; }
  tb.setAttribute('aria-valuenow', String(Math.round(p.sec))); tb.setAttribute('aria-valuetext', p.tm);
}
document.addEventListener('pointerover', function (e) { var tb = e.target.closest && e.target.closest('#timeband'); if (tb && !KR._scrub) { KR._scrubX = null; scrubAt(tb, e.clientX); } });
document.addEventListener('pointermove', function (e) { var tb = e.target.closest && e.target.closest('#timeband'); if (tb && !KR._scrub) { KR._scrubX = null; scrubAt(tb, e.clientX); } });
document.addEventListener('pointerout', function (e) { if (e.target.id === 'timeband' && !KR._scrub) { var sc = $('#scrub'); if (sc) sc.style.display = ''; } });
document.addEventListener('click', function (e) { var tb = e.target.closest && e.target.closest('#timeband'); if (tb && KR._scrubPid && !KR._justDragged) KR.openWin(KR._scrubPid); });
document.addEventListener('keydown', function (e) { if (e.altKey) return; var tb = e.target.id === 'timeband' ? e.target : null; if (!tb) return; var pts = KR.$$('i[data-pid]', tb).map(function (i) { return KR.p(i.getAttribute('data-pid')); }).sort(function (a, b) { return a.sec - b.sec; }), cur = pts.findIndex(function (p) { return p.id === KR._scrubPid; });
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = pts[Math.max(0, Math.min(pts.length - 1, (cur < 0 ? 0 : cur) + (e.key === 'ArrowRight' ? 1 : -1)))], r = tb.getBoundingClientRect(); scrubAt(tb, r.left + r.width * n.sec / Number(tb.getAttribute('data-max'))); } else if (e.key === 'Enter' && KR._scrubPid) { e.preventDefault(); KR.openWin(KR._scrubPid); } });
function svPick(sv, e) { var r = sv.getBoundingClientRect(), s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)), d = S.draft; d.s = s; d.v = v; d.rgb = KR.hsvToRgb(d.h, s, v); KR.renderOv(); }
document.addEventListener('keydown', function (e) { if (e.altKey || e.target.id !== 'svbox') return; var d = S.draft, st = 0.04; if (e.key === 'ArrowRight') d.s = Math.min(1, d.s + st); else if (e.key === 'ArrowLeft') d.s = Math.max(0, d.s - st); else if (e.key === 'ArrowUp') d.v = Math.min(1, d.v + st); else if (e.key === 'ArrowDown') d.v = Math.max(0, d.v - st); else return; e.preventDefault(); d.rgb = KR.hsvToRgb(d.h, d.s, d.v); KR.renderOv(); var n = $('#svbox'); if (n) n.focus(); });

/* ── 시안 설정 상자 ── */
var SCENES = [['search', '검색 기본'], ['sel', '선택 상태 · 토글'], ['wide', '조건 칸 접힘'], ['cond', '조건 창 (색)'], ['imgfind', '사진으로 찾기'], ['reel', '필름 릴'], ['photos', '사진 창 간단히'], ['photod', '사진 창 상세히'], ['cmp', '비교함 나란히'], ['tl', '타임라인 크게'], ['fav', '즐겨찾기 + F2'], ['work', '작품 페이지'], ['person', '사람 페이지'], ['keys', '단축키 · 내보내기'], ['ai', '단계 분석 실행']];
KR.SCENES = SCENES;
KR.renderSian = function () {
  var h = $('#sian'); if (!h) return; if (KR.embed) { h.innerHTML = ''; return; }
  var row = function (k, label, opts, cur) { return '<span class="k">' + label + '</span><span class="seg">' + opts.map(function (o) { return '<button type="button" class="' + (cur === o[0] ? 'on' : '') + '" data-act="sset" data-k="' + k + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</span>'; };
  var url = location.href.split('#')[0].split('?')[0] + '?theme=' + S.theme + (S.check === 'color' ? '&check=color' : '') + (S.layout === 'fixed' ? '&layout=fixed' : '') + (S.rmUser ? '&rm=1' : '');
  h.innerHTML = '<div class="sian"><button type="button" data-act="sian" aria-expanded="' + S.sian + '">시안 설정</button>' + (S.sian ? '<div class="sianp" role="dialog" aria-label="시안 설정"><h5>시안 설정 <button type="button" class="btn ghost" data-act="sian" aria-label="닫기">' + ic('x') + '</button></h5>' +
    '<div class="r2">' + row('theme', '테마', [['dark', '어둡게'], ['light', '밝게'], ['indigo', '인디고']], S.theme) + row('check', '체크', [['check', '체크'], ['color', '색만']], S.check) + row('layout', '배치', [['just', '줄 맞춤'], ['fixed', '고정 칸']], S.layout) + row('rm', '동작 줄이기', [['0', '끔'], ['1', '켬']], S.rmUser ? '1' : '0') + '</div>' +
    '<h5>화면 바로 가기</h5><div class="scenes">' + SCENES.map(function (s) { return '<button type="button" data-act="scene" data-v="' + s[0] + '">' + s[1] + '</button>'; }).join('') + '</div>' +
    '<p>이 상태로 여는 주소(파일로 열 때) — 링크로 볼 때는 끝에 #reel, #photod.light 처럼 붙여도 됨</p><div class="url"><input id="sianurl" readonly value="' + esc(url) + '"><button type="button" class="btn" data-act="scopy">복사</button></div>' +
    '<p>사진은 정본 시안 3의 48장을 4번 되풀이(192장). EN은 작품 제목·정렬만 영어. 시안이라 파일을 쓰지 않음.</p><p><a class="lnk" href="boards.html" target="_blank" rel="noopener">화면 15종 나란히 보기 ↗</a> · <button type="button" class="lnk" data-act="sreset">처음 상태로</button></p></div>' : '') + '</div>';
};

/* ── 장면(바로 가기·녹화·나란히 보기용) ── */
KR.scene = function (name) {
  S.win = null; S.lp = null; S.cmpOpen = false; S.cond = null; S.fav = null; S.exp = null; S.keysOpen = false; S.imgFind = false; S.scope = null; S.img = null; S.sian = false;
  var joker = KR.data.find(function (p) { return p.w === 'Joker' && p.tm === '00:45:29'; }) || KR.data.find(function (p) { return p.w === 'Joker'; });
  var taxi = KR.data.find(function (p) { return p.w === 'Taxi Driver' && p.tm === '00:14:55'; }) || KR.data.find(function (p) { return p.w === 'Taxi Driver'; });
  var go = function (r) { KR.go(r, { nohist: true }); };
  if (name === 'search' || name === 'sel' || name === 'wide' || name === 'cond' || name === 'imgfind' || name === 'reel' || name === 'photos' || name === 'photod' || name === 'cmp' || name === 'tl' || name === 'keys') { if (name === 'wide') S.sideOpen = false; else if (name !== 'tl') S.sideOpen = true; go({ name: 'search' }); }
  if (name === 'sel') { S.sel = KR.lastRes.slice(1, 4).map(function (p) { return p.id; }); KR.afterSel(); var m = $('#main'); if (m) setTimeout(function () { m.scrollTop = 260; }, 30); }
  if (name === 'cond') KR.openCond('color', 'side');
  if (name === 'imgfind') { S.imgFind = true; KR.render(); }
  if (name === 'reel') KR.lpOpen(joker.id);
  if (name === 'photos' || name === 'photod') { S.winMode = name === 'photos' ? 'simple' : 'detail'; KR.winCtx = null; KR.openWin(taxi.id); KR.renderGlob(); }
  if (name === 'cmp') { S.cmpOpen = true; KR.render(); }
  if (name === 'tl') { S.dockOpen = true; S.dockLevel = 2; KR.renderTimeline(); }
  if (name === 'keys') { S.keysOpen = true; KR.renderOv(); }
  if (name === 'fav') { go({ name: 'fav' }); var l0 = S.favLists[0], extra = KR.data.filter(function (p) { return p.w === 'Taxi Driver' && l0.ids.indexOf(p.id) < 0; }).slice(0, 3).map(function (p) { return p.id; }); KR.openFav(extra); S.fav.others = true; KR.renderOv(); }
  if (name === 'work') go({ name: 'work', w: 'Parasite' });
  if (name === 'person') go({ name: 'person', n: 'Sean Baker' });
  if (name === 'ai') { S.aiFolder = true; S.aiState = 'done'; go({ name: 'ai' }); }
  KR.renderSian();
};

/* ── 시작 ── */
KR.boot = function () {
  var qs = {}; location.search.replace(/^\?/, '').split('&').forEach(function (kv) { if (!kv) return; var p = kv.split('='); qs[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
  var hs = (location.hash || '').replace(/^#/, '').split('.').filter(Boolean);
  hs.forEach(function (t) { if (['dark', 'light', 'indigo'].indexOf(t) >= 0) qs.theme = t; else if (t === 'color') qs.check = 'color'; else if (t === 'fixed') qs.layout = 'fixed'; else if (t === 'rm') qs.rm = '1'; else qs.scene = t; });
  if (qs.theme) S.theme = qs.theme; if (qs.check) S.check = qs.check; if (qs.layout) S.layout = qs.layout; if (qs.rm) S.rmUser = qs.rm === '1'; KR.embed = qs.embed === '1';
  if (qs.dock === '0') S.dockOpen = false;
  if (window.innerWidth < 1200 && !qs.scene) S.sideOpen = false; if (window.innerWidth < 1100 && !qs.scene) S.dockOpen = false;   /* 좁은 폭 임시 규칙 */
  try { history.replaceState(null, ''); } catch (e) {}
  KR.render(); KR.renderSian(); if (KR.histSync) KR.histSync();
  if (qs.scene) setTimeout(function () { KR.scene(qs.scene); }, 30);
  window.addEventListener('resize', function () { clearTimeout(KR._rz); KR._rz = setTimeout(function () { KR.renderGlob(); }, 100); });
  setInterval(function () { var q = $('#q'); if (q && document.activeElement !== q && !q.value) { var ex = ['밤 역광, 택시', '창가 부드러운 빛', '네온 간판 와이드', '두 사람 오버숄더', '낮 실외 고채도'][Math.floor(Date.now() / 6000) % 5]; q.placeholder = '장면을 말로 찾기 — 예: ' + ex; } }, 6000);
};
})();
