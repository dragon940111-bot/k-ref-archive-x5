/* 뒤로 가기 기록 — 사용자 10-21 23시:
   "상세보기에서 다른사진으로 넘어가도 마우스 뒤로가기나 크롬 뒤로가기를 누르면 이전에 봣던 사진이 나오면 좋겟어"
   "검색창에서 상세보기를 누르고 다음동작으로 뒤로가기를 했으면 이전검색결과창이 나와야하고"
   "검색결과에서 조건변경을 계속 변경하면서 했다면 그 기록들이 남아서 뒤로가면 하나씩 뒤의 결과로"
   "상세보기에서 더보기를 누르면 비슷한사진이 뜬 검색창으로 가는데 여기서 뒤로가기를 누르면 이전에 보던 상세보기가"
   방식: 한 동작이 끝날 때마다 지금 화면의 '자리'(페이지·검색 조건·사진 창·필름 릴·나란히 보기)를 기록과 비교해 달라졌으면 한 칸 쌓음.
   창·릴·나란히 보기를 화면 버튼(닫기·Esc)으로 닫으면 그 창을 연 칸까지 기록을 되돌아감 → 뒤로 가기와 같은 결과. */
'use strict';
(function () {
var KR = window.KR, S = KR.S;
function rkey(r) { return r ? r.name + ':' + (r.w || r.n || '') : ''; }
KR._lastSc = null; KR._histHold = 0; KR._lastPush = { t: 0, kind: '' };

KR.snap = function () {
  var sc = KR.scroller();
  return {
    v: 1, r: S.route, win: S.win || null, ref: S.winRef || null, prev: S.winPrev || null, wm: S.winMode, lp: S.lp ? Object.assign({}, S.lp) : null, cmp: !!S.cmpOpen,
    s: { scope: S.scope, simIds: S.simIds, simOf: S.simOf, filters: S.filters, q: S.q, color: S.color, tone: S.tone, img: S.img ? { name: S.img.name, src: S.img.src, big: S.img.big || null, bins: S.img.bins, refId: S.img.ref ? S.img.ref.id : null } : null, imgMore: S.imgMore, hideWorks: S.hideWorks, sort: S.sort },
    pg: { workTab: S.workTab, workSub: S.workSub, range: KR._sceneRange || null, personTab: S.personTab, favList: S.favList },
    sc: sc ? sc.scrollTop : 0
  };
};
/* '다른 화면'으로 볼 것만: 선택·비교함 내용·창 모드(간단히/상세히)·릴 안 이동은 칸을 쌓지 않음 */
function navParts(st) {
  var s = st.s || {}, pg = st.pg || {}, n = st.r ? st.r.name : '';
  return {
    r: rkey(st.r),
    s: n === 'search' ? JSON.stringify([s.scope || null, s.simOf || '', s.filters || [], (s.q || '').trim(), s.color || null, s.tone || {}, s.img ? s.img.name : null, s.hideWorks || [], s.sort || '']) : '',
    q: n === 'search' ? (s.q || '').trim() : '',
    pg: n === 'work' ? (pg.workTab + '/' + pg.workSub + (pg.range ? '/' + pg.range.join('-') : '')) : n === 'person' ? pg.personTab : n === 'fav' ? String(pg.favList) : '',
    win: st.win || null, lp: st.lp ? st.lp.id : null, cmp: !!st.cmp
  };
}
function key(p, noQ) { return JSON.stringify([p.r, noQ ? p.s.replace(JSON.stringify(p.q), '""') : p.s, p.pg, p.win, p.lp, p.cmp]); }
function rep(st) { try { history.replaceState(st, ''); } catch (e) {} }

KR.histSync = function () {
  if (KR._popping || KR._histNav || Date.now() < KR._histHold) return;
  var cur = history.state, n = KR.snap();
  if (!cur || !cur.v) { n.winD = n.win ? 1 : 0; n.lpD = n.lp ? 1 : 0; n.cmpD = n.cmp ? 1 : 0; rep(n); KR._lastSc = n.sc; return; }
  var a = navParts(cur), b = navParts(n);
  if (key(a) === key(b)) { n.winD = cur.winD || 0; n.lpD = cur.lpD || 0; n.cmpD = cur.cmpD || 0; rep(n); return; }
  var now = Date.now(), kind = '';
  if (key(a, true) === key(b, true) && a.q !== b.q) kind = 'q';                       /* 검색어만 바뀜(글자 입력) */
  else if (a.win && b.win && a.win !== b.win && JSON.stringify([a.r, a.s, a.lp, a.cmp]) === JSON.stringify([b.r, b.s, b.lp, b.cmp])) kind = 'win';
  var merge = (kind === 'q' && KR._lastPush.kind === 'q' && now - KR._lastPush.t < 1200) || (kind === 'win' && KR._lastPush.kind === 'win' && KR._keyRepeat && now - KR._lastPush.t < 300);   /* M-06(10-22): 따로 누른 넘김은 한 장씩 기록, 키를 누르고 있을 때(자동 반복)만 한 칸 */
  if (merge) { n.winD = cur.winD || 0; n.lpD = cur.lpD || 0; n.cmpD = cur.cmpD || 0; rep(n); KR._lastPush.t = now; return; }
  /* 지금 칸의 스크롤 위치를 바뀌기 전 값으로 고쳐 두고 새 칸을 쌓음 */
  rep(Object.assign({}, cur, { sc: KR._lastSc != null ? KR._lastSc : cur.sc }));
  n.winD = n.win ? (cur.win ? (cur.winD || 1) + 1 : 1) : 0;
  n.lpD = n.lp ? (cur.lp ? (cur.lpD || 1) + 1 : 1) : 0;
  n.cmpD = n.cmp ? (cur.cmp ? (cur.cmpD || 1) + 1 : 1) : 0;
  try { history.pushState(n, ''); } catch (e) {}
  KR._lastPush = { t: now, kind: kind }; KR._lastSc = n.sc;
};
/* 한 동작(누르기·키·입력)이 끝난 뒤 한 번 비교 */
var due = 0;
function soon() { clearTimeout(due); due = setTimeout(KR.histSync, 0); }
document.addEventListener('keydown', function (e) { KR._keyRepeat = !!e.repeat; }, true);
document.addEventListener('pointerdown', function () { KR._keyRepeat = false; }, true);
['click', 'keydown', 'input', 'change', 'pointerup', 'drop', 'paste'].forEach(function (t) { document.addEventListener(t, soon, true); window.addEventListener(t, soon); });
/* 스크롤 위치: 바뀌기 전 값을 들고 있다가 칸을 쌓을 때 씀. 멈추면 지금 칸에도 적어 둠 */
var scT = 0;
document.addEventListener('scroll', function (e) {
  var sc = KR.scroller(); if (!sc || e.target !== sc) return; KR._lastSc = sc.scrollTop;
  clearTimeout(scT); scT = setTimeout(function () { if (KR._popping || KR._histNav) return; var st = history.state; if (st && st.v) rep(Object.assign({}, st, { sc: sc.scrollTop })); }, 300);
}, true);

/* 화면 버튼으로 닫기 = 그 창을 연 칸까지 되돌아감 */
function backOver(d, fallback) {
  KR._histNav = true; var done = false;
  var onPop = function () { done = true; window.removeEventListener('popstate', onPop); };
  window.addEventListener('popstate', onPop);
  try { history.go(-d); } catch (e) { done = true; KR._histNav = false; fallback(); return; }
  setTimeout(function () { if (!done) { window.removeEventListener('popstate', onPop); KR._histNav = false; fallback(); } }, 500);
}
var rawCloseWin = KR.closeWin, rawLpClose = KR.lpClose, rawCmpClose = KR.ACT.cmpclose;
KR.closeWin = function () { var st = history.state; if (!KR._popping && st && st.v && st.win && st.win === S.win && st.winD > 0) return backOver(st.winD, rawCloseWin); rawCloseWin(); };
KR.lpClose = function () { var st = history.state; if (!KR._popping && !S.win && st && st.v && st.lp && S.lp && st.lp.id === S.lp.id && st.lpD > 0) return backOver(st.lpD, rawLpClose); rawLpClose(); };
KR.ACT.cmpclose = function (el) { var st = history.state; if (!KR._popping && !S.win && st && st.v && st.cmp && S.cmpOpen && st.cmpD > 0) return backOver(st.cmpD, function () { rawCmpClose(el); }); rawCmpClose(el); };

/* 뒤로·앞으로: 그 칸의 화면으로 되돌림 */
function setScroll(y) { var sc = KR.scroller(); if (sc && y != null) { sc.scrollTop = y; KR._lastSc = sc.scrollTop; } }
KR.applySnap = function (st) {
  KR._popping = true; KR._histHold = Date.now() + 260;
  try {
    var prevWin = S.win, prevLp = S.lp, s = st.s || {}, pg = st.pg || {}, routeChange = rkey(S.route) !== rkey(st.r);
    var before = navParts(KR.snap());
    S.scope = s.scope || null; S.simIds = s.simIds || []; S.simOf = s.simOf || ''; S.filters = s.filters || []; S.q = s.q || ''; S.color = s.color || null; S.tone = s.tone || {};
    S.img = s.img ? { name: s.img.name, src: s.img.src, big: s.img.big || null, bins: s.img.bins, ref: s.img.refId ? KR.p(s.img.refId) : null } : null; S.imgMore = !!s.imgMore; S.hideWorks = s.hideWorks || []; if (s.sort) S.sort = s.sort;
    if (pg.workTab) S.workTab = pg.workTab; if (pg.workSub) S.workSub = pg.workSub; KR._sceneRange = pg.range || null; if (pg.personTab) S.personTab = pg.personTab; S.favList = pg.favList == null ? S.favList : pg.favList;
    if (st.ref) S.winRef = st.ref;   /* 간단히/상세히는 사용자 설정이라 기록에서 되돌리지 않음 */ S.cmpOpen = !!st.cmp; S.cond = null; S.imgFind = false; S.sortOpen = false; S.inspFilter = null;
    if (routeChange) {
      S.win = st.win || null; S.lp = st.lp || null; if (st.win) { S.winRef = st.ref || st.win; S.winPrev = st.prev || null; }
      KR.go(st.r, { nohist: true, keepTabs: true }); setScroll(st.sc);
      return;
    }
    if (prevWin && !st.win) rawCloseWin();                       /* 닫힘 움직임은 창을 남긴 채 시작 */
    var after = navParts(st);
    if (before.s !== after.s || before.pg !== after.pg || before.cmp !== after.cmp) { KR.render(); setScroll(st.sc); }
    if (!prevWin && st.win) KR.openWin(st.win); else if (prevWin && st.win && prevWin !== st.win) KR.winGo(st.win); else if (st.win) KR.renderOv();
    /* G-02(10-22): 창을 다시 열면 openWin이 기준 사진·바로 전 사진을 지금 사진으로 덮음 → 그 칸에 적힌 값으로 되돌림 */
    if (st.win && S.win === st.win && (S.winRef !== (st.ref || st.win) || (S.winPrev || null) !== (st.prev || null))) { S.winRef = st.ref || st.win; S.winPrev = st.prev || null; KR.renderOv(); }
    if (prevLp && !st.lp) rawLpClose();
    else if (!prevLp && st.lp) { S.lp = Object.assign({}, st.lp); KR.renderOv('lpopen'); KR.renderTimeline(); }
    else if (prevLp && st.lp && JSON.stringify(prevLp) !== JSON.stringify(st.lp)) { S.lp = Object.assign({}, st.lp); KR.lpRefresh(); }
    KR.renderGlob();
  } finally { KR._popping = false; }
};
window.addEventListener('popstate', function (e) { KR._histNav = false; var st = e.state; if (!st || !st.v) return; KR.applySnap(st); });
})();
