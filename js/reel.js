/* 필름 릴 — 1초 누르기(또는 R): 가로 = 비슷한 사진, 세로 = 같은 작품(시간순). 정본 값 유지 + X5 질감, 멈출 때 스프링 1회 안착 */
'use strict';
(function () {
var KR = window.KR, S = KR.S, esc = KR.esc;
var HS = 162, VS = 96;   // 정본 간격

KR.lpWork = function (p) { var same = KR.sameWork(p), at = same.findIndex(function (x) { return x.src === p.src; }); return same.map(function (x, j) { return { k: j - at, p: x }; }); };
KR.lpLists = function (base) {
  var d = KR.data, words = function (x) { return [].concat(x.frame, x.light, x.tod, x.io, x.color, x.comp || []); }, mine = words(base), seen = {};
  seen[base.src] = 1;
  var sim = d.filter(function (x) { if (seen[x.src]) return false; seen[x.src] = 1; return true; }).map(function (x) {
    var n = words(x).filter(function (w) { return mine.indexOf(w) >= 0; }).length + (x.frame[0] === base.frame[0] ? 3 : 0) + (x.light[0] === base.light[0] ? 2 : 0);
    return { x: x, n: n }; }).filter(function (o) { return o.n > 0; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 40).map(function (o) { return o.x; });
  var H = [{ k: 0, p: base }]; sim.forEach(function (x, i) { H.push({ k: i % 2 === 0 ? i / 2 + 1 : -(i + 1) / 2, p: x }); });   // 가까운 것부터 오른쪽·왼쪽 번갈아
  return { H: H, V: KR.lpWork(base) };
};
KR.lpOpen = function (id) { if (!KR.p(id)) return; S.lp = { id: id, axis: null, h: 0, v: 0, vBase: id }; KR.renderOv('lpopen'); KR.renderTimeline(); };
KR.lpCur = function () {
  var lp = S.lp; if (!lp) return null; var base = KR.p(lp.id), vb = KR.p(lp.vBase) || base, L = KR.lpLists(base), V = KR.lpWork(vb), H = L.H;
  var hMin = Math.min.apply(null, H.map(function (o) { return o.k; })), hMax = Math.max.apply(null, H.map(function (o) { return o.k; })), vMin = V.length ? V[0].k : 0, vMax = V.length ? V[V.length - 1].k : 0;
  var fh = Math.max(hMin, Math.min(hMax, lp.h)), fv = Math.max(vMin, Math.min(vMax, lp.v));
  var focus = lp.axis === 'v' ? (V.find(function (o) { return o.k === fv; }) || { p: base }).p : (H.find(function (o) { return o.k === fh; }) || { p: base }).p;
  return { base: base, vb: vb, H: H, V: V, hMin: hMin, hMax: hMax, vMin: vMin, vMax: vMax, fh: fh, fv: fv, focus: focus };
};
KR.renderReel = function () {
  var c = KR.lpCur(); if (!c) return ''; var lp = S.lp, f = c.focus;
  var CH = 236, CW = Math.round(Math.min(f.ar * CH, window.innerWidth * 0.5)), ch = Math.round(CW / f.ar);
  var same = KR.sameWork(f), fn = same.findIndex(function (x) { return x.src === f.src; }) + 1;
  var hf = c.H.map(function (o) { return '<button type="button" class="rf h' + (o.k === c.fh ? ' cur' : Math.abs(o.k - c.fh) === 1 ? ' near' : '') + '" style="left:' + (o.k * HS - 70) + 'px;--d:' + Math.min(14, Math.abs(o.k)) * 35 + 'ms" data-act="lpgo" data-ax="h" data-k="' + o.k + '" aria-label="' + esc(KR.title(o.p) + ' ' + o.p.tm) + ' (비슷한 사진)"><img src="' + o.p.src + '" alt="" draggable="false"><span class="tc">' + o.p.tm + '</span></button>'; }).join('');
  var vf = c.V.map(function (o) { return '<button type="button" class="rf v' + (o.k === c.fv ? ' cur' : Math.abs(o.k - c.fv) === 1 ? ' near' : '') + '" style="top:' + (o.k * VS - 40) + 'px;--d:' + Math.min(14, Math.abs(o.k)) * 35 + 'ms" data-act="lpgo" data-ax="v" data-k="' + o.k + '" aria-label="' + esc(KR.title(o.p) + ' ' + o.p.tm) + ' (같은 작품)"><img src="' + o.p.src + '" alt="" draggable="false"><span class="tc">' + o.p.tm + '</span></button>'; }).join('');
  var away = f.id !== c.base.id && f.src !== c.base.src;
  return '<div class="reel' + (S.win ? ' under' : '') + '" id="reel" role="dialog" aria-modal="true" aria-label="필름 릴">' +
    '<div class="axis" aria-hidden="true"></div>' +
    '<div class="band-h-r' + (lp.axis === 'v' ? ' rdim' : '') + '" aria-label="비슷한 사진"><div class="rtrack h" id="trh">' + hf + '</div></div>' +
    '<div class="band-v-r' + (lp.axis === 'h' ? ' rdim' : '') + '" id="bandv" aria-label="같은 작품 사진"><div class="rtrack v" id="trv">' + vf + '</div></div>' +
    '<span class="rax" style="left:20px;top:calc(50% - 58px - 22px)">← 비슷한 사진 <em>' + (c.fh - c.hMin + 1) + ' / ' + (c.hMax - c.hMin + 1) + '</em></span>' +
    '<span class="rax" style="right:20px;top:calc(50% - 58px - 22px)">비슷한 사진 →</span>' +
    '<span class="rax" style="left:50%;transform:translateX(-50%);top:58px">↑ 같은 작품 · 앞 장면 <em>' + (c.fv - c.vMin + 1) + ' / ' + (c.vMax - c.vMin + 1) + '</em></span>' +
    '<span class="rax" style="left:50%;transform:translateX(-50%);bottom:70px">같은 작품 · 뒤 장면 ↓</span>' +
    '<div class="rcur" style="width:' + CW + 'px"><button type="button" class="rcb" data-act="lpwin" style="width:' + CW + 'px;height:' + ch + 'px" aria-label="' + esc(KR.title(f) + ' ' + f.tm) + ' 사진 창으로 열기 (Enter)"><img src="' + f.src + '" alt="" draggable="false"><i class="cn a"></i><i class="cn b"></i><i class="cn c"></i><i class="cn d"></i><span class="gtc">' + f.tm + '</span></button>' +
      '<div class="rlab"><b>' + esc(KR.title(f)) + '</b><span>(' + f.y + ')</span><span class="tc">' + f.tm + '</span><span>' + (f.dir.length ? '감독 ' + esc(f.dir.join(', ')) : '') + '</span><span class="pal5">' + (f.pal || []).slice(0, 5).map(function (x) { return '<i style="background:' + x + '"></i>'; }).join('') + '</span><span class="fn">FRAME ' + fn + ' / ' + same.length + ' · ' + esc(f.asp || '') + '</span></div></div>' +
    (away ? '<button type="button" class="rfirst" data-act="lphome" aria-label="처음 사진으로 (Home)"><img src="' + c.base.src + '" alt="" draggable="false"><span>처음 사진으로</span></button>' : '') +
    '<div class="rhint"><b>필름 릴</b><span class="kbd">←</span><span class="kbd">→</span><span>비슷한 사진</span><span class="kbd">↑</span><span class="kbd">↓</span><span>같은 작품 · 끌기 · 휠</span><span class="kbd">Enter</span><span>사진 창</span><span class="kbd">Esc</span><span>닫기 · 누른 채 좌우로 넘기기</span></div></div>';
};
/* 트랙 놓기: 끄는 중(live)은 손을 1:1로, 멈출 때는 스프링 1회로 가장 가까운 프레임에 안착(중단 가능 — 지금 위치에서 이어 감) */
function curX(el) { var m = getComputedStyle(el).transform; if (!m || m === 'none') return 0; var v = m.match(/matrix\(([^)]+)\)/); if (!v) return 0; var a = v[1].split(',').map(Number); return el.id === 'trh' ? a[4] : a[5]; }
KR.lpPlace = function (track, axis, pos, live, vel) {
  if (!track) return; var px = -pos * (axis === 'h' ? HS : VS), prop = axis === 'h' ? 'translateX' : 'translateY';
  var from = track._a ? curX(track) : (track._px == null ? px : track._px);
  if (track._a) { track._a.cancel(); track._a = null; }
  track.style.transform = prop + '(' + px.toFixed(1) + 'px)'; track._px = px;
  if (live) { KR.lpGateOff(); return; }
  if (KR.reduce() || Math.abs(from - px) < 0.5) { KR.lpGateSoon(); return; }
  KR.lpGateOff();
  var f = KR.springFrames(from, px, vel || 0);
  track._a = track.animate(f.vals.map(function (v) { return { transform: prop + '(' + v.toFixed(2) + 'px)' }; }), { duration: f.ms, easing: 'linear' });
  track._a.onfinish = function () { track._a = null; KR.lpGateSoon(); };
};
/* 멈춘 동안: 가운데 사진·이름 줄과 겹치는 띠 칸은 숨김(페이드), 움직이기 시작하면 다시 보임 */
KR.lpMoving = function () { var th = KR.$('#trh'), tv = KR.$('#trv'), g = KR._lpDrag; return !!((th && th._a) || (tv && tv._a) || (g && g.live)); };
KR.lpGateOff = function () { cancelAnimationFrame(KR._lpSoonRaf); cancelAnimationFrame(KR._lpGateRaf); KR._lpGateRaf = requestAnimationFrame(function () { KR.$$('#reel .rf.gate').forEach(function (b) { b.classList.remove('gate'); }); }); };
KR.lpGateOn = function () {
  var cur = KR.$('#reel .rcur'); if (!cur) return; var a = cur.getBoundingClientRect(), pad = 6;
  KR.$$('#reel .rf').forEach(function (b) { var r = b.getBoundingClientRect(); var hit = r.right > a.left - pad && r.left < a.right + pad && r.bottom > a.top - pad && r.top < a.bottom + pad; b.classList.toggle('gate', hit); });
};
KR.lpGateSoon = function () { cancelAnimationFrame(KR._lpSoonRaf); KR._lpSoonRaf = requestAnimationFrame(function () { if (!KR.lpMoving()) KR.lpGateOn(); }); };
KR.lpSync = function (first) {
  var c = KR.lpCur(); if (!c) return; var g = KR._lpDrag, live = g && g.live;
  var th = KR.$('#trh'), tv = KR.$('#trv');
  if (first) { if (th) { th._px = -c.fh * HS; th.style.transform = 'translateX(' + th._px + 'px)'; } if (tv) { tv._px = -c.fv * VS; tv.style.transform = 'translateY(' + tv._px + 'px)'; } }
  else { if (th && !(live && g.axis === 'h')) KR.lpPlace(th, 'h', c.fh, false); if (tv && !(live && g.axis === 'v')) KR.lpPlace(tv, 'v', c.fv, false); }
  var band = KR.$('#bandv'), w = c.vb.w;
  if (band && KR._lpLastWork && KR._lpLastWork !== w && !KR.reduce()) { band.classList.remove('rewind'); void band.offsetWidth; band.classList.add('rewind'); }
  KR._lpLastWork = w;
  KR._lpFocus = c.focus.id;
};
/* 다시 그릴 때 트랙 위치를 지키고 바뀐 부분만: 트랙 안은 새로, 트랙 자체 transform은 이어서 */
KR.lpRefresh = function () {
  var r = KR.$('#reel'); if (!r) return; var th = KR.$('#trh'), tv = KR.$('#trv'), keep = { h: th ? (th._a ? curX(th) : th._px) : null, v: tv ? (tv._a ? curX(tv) : tv._px) : null };
  if (th && th._a) th._a.cancel(); if (tv && tv._a) tv._a.cancel();
  var gated = {}; KR.$$('#reel .rf.gate').forEach(function (b) { gated[b.getAttribute('data-ax') + b.getAttribute('data-k')] = 1; });
  var tmp = document.createElement('div'); tmp.innerHTML = KR.renderReel(); var nr = tmp.firstChild;
  /* 같은 세로 작품이면 세로 띠는 그대로(감기 애니메이션이 끊기지 않게) */
  r.className = nr.className + ' settled';   /* 처음 펼침 움직임은 다시 하지 않음 */
  r.innerHTML = nr.innerHTML;
  var th2 = KR.$('#trh'), tv2 = KR.$('#trv');
  if (th2 && keep.h != null) { th2._px = keep.h; th2.style.transform = 'translateX(' + keep.h + 'px)'; }
  if (tv2 && keep.v != null) { tv2._px = keep.v; tv2.style.transform = 'translateY(' + keep.v + 'px)'; }
  KR.$$('#reel .rf').forEach(function (b) { b.style.animation = 'none'; if (gated[b.getAttribute('data-ax') + b.getAttribute('data-k')]) b.classList.add('gate'); });
  KR.lpSync(false); KR.lpGateSoon();
};
KR.lpGo = function (axis, value) {
  var lp = S.lp, c = KR.lpCur(); if (!lp || !c) return;
  if (axis === 'h') { var h = Math.max(c.hMin, Math.min(c.hMax, value)), f = c.H.find(function (o) { return o.k === h; }); if (h !== lp.h || lp.axis !== 'h') { S.lp = Object.assign({}, lp, { axis: 'h', h: h, vBase: f ? f.p.id : lp.id, v: 0 }); KR.lpRefresh(); } }
  else { var v = Math.max(c.vMin, Math.min(c.vMax, value)); if (v !== lp.v || lp.axis !== 'v') { S.lp = Object.assign({}, lp, { axis: 'v', v: v }); KR.lpRefresh(); } }
};
KR.lpStep = function (axis, d) { var lp = S.lp; if (lp) KR.lpGo(axis, (axis === 'h' ? lp.h : lp.v) + d); };
KR.lpHome = function () { var lp = S.lp; if (lp) { S.lp = { id: lp.id, axis: null, h: 0, v: 0, vBase: lp.id }; KR.lpRefresh(); } };
KR.lpClose = function () {
  var r = KR.$('#reel'); KR._lpLastWork = null;
  var fin = function () { S.lp = null; KR.renderOv(); KR.renderTimeline(); };
  if (!r || KR.reduce()) return fin(); if (r.classList.contains('closing')) return;
  r.classList.add('closing'); setTimeout(fin, 300);
};
/* 끌기: 'stick'(1초 누른 채 — 손 방향 = 넘김 방향) / 'pull'(놓은 뒤 — 필름이 손을 따라옴) */
KR.lpDragStart = function (x, y) { var lp = S.lp || { h: 0, v: 0 }; KR._lpDrag = { ax: x, ay: y, axis: null, h0: lp.h, v0: lp.v, moved: false, pts: [] }; };
KR.lpDragMove = function (x, y, mode) {
  var g = KR._lpDrag, lp = S.lp; if (!g || !lp) return;
  var dx = x - g.ax, dy = y - g.ay; if (!g.moved && Math.abs(dx) < 10 && Math.abs(dy) < 10) return; g.moved = true;
  var axis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
  if (g.axis && axis !== g.axis && Math.abs(axis === 'h' ? dx : dy) > 24) { g.ax = x; g.ay = y; g.h0 = lp.h; g.v0 = lp.v; g.axis = axis; return; }
  if (!g.axis) g.axis = axis;
  if (mode === 'stick') { if (g.axis === 'h') KR.lpGo('h', g.h0 + Math.round(dx / KR.LP_STEP)); else KR.lpGo('v', g.v0 + Math.round(dy / KR.LP_STEP)); return; }
  var c = KR.lpCur(), isH = g.axis === 'h', step = isH ? HS : VS, lo = isH ? c.hMin : c.vMin, hi = isH ? c.hMax : c.vMax;
  var raw = (isH ? g.h0 : g.v0) - (isH ? dx : dy) / step, pos = raw < lo ? lo - Math.pow(lo - raw, 0.7) * 0.35 : raw > hi ? hi + Math.pow(raw - hi, 0.7) * 0.35 : raw;
  var now = performance.now(); g.pts = g.pts.concat([[now, pos]]).filter(function (q) { return now - q[0] < 100; }); g.live = true; g.pos = pos;
  KR.lpPlace(KR.$(isH ? '#trh' : '#trv'), g.axis, pos, true);
  var r = Math.max(lo, Math.min(hi, Math.round(pos))); if (r !== (isH ? lp.h : lp.v) || lp.axis !== g.axis) KR.lpGo(g.axis, r);
};
KR.lpDragEnd = function () {
  var g = KR._lpDrag; KR._lpDrag = null; var r = KR.$('#reel'); if (r) r.classList.remove('pulling');
  if (!g || !g.moved) return false; KR._lpQuiet = performance.now() + 250;
  if (g.live) {
    var pts = g.pts, v = pts.length > 1 ? (pts[pts.length - 1][1] - pts[0][1]) / Math.max(16, pts[pts.length - 1][0] - pts[0][0]) : 0;
    var c = KR.lpCur(), isH = g.axis === 'h', lo = isH ? c.hMin : c.vMin, hi = isH ? c.hMax : c.vMax, target = Math.max(lo, Math.min(hi, Math.round(g.pos + v * 260)));
    KR.lpGo(g.axis, target);
    KR.lpPlace(KR.$(isH ? '#trh' : '#trv'), g.axis, target, false, -v * (isH ? HS : VS) * 1000);
  }
  return true;
};
KR.lpQuietNow = function () { return KR._lpQuiet && performance.now() < KR._lpQuiet; };
/* 1초 누르기 — 격자 칸·비교함 칸 공통 */
KR.lpPress = function (e, id, el, onMove) {
  if (e.button !== 0 || e.ctrlKey || e.shiftKey || e.metaKey || S.lp) return;
  KR.lpCancel(); if (el) el.classList.add('lp-wait');
  var pend = { x: e.clientX, y: e.clientY, id: id, el: el };
  pend.move = function (ev) { if (Math.abs(ev.clientX - pend.x) > 6 || Math.abs(ev.clientY - pend.y) > 6) { KR.lpCancel(); if (onMove) onMove(ev); } };
  pend.up = function () { KR.lpCancel(); };
  pend.timer = setTimeout(function () { KR.lpFire(); }, KR.LP_MS);
  window.addEventListener('pointermove', pend.move); window.addEventListener('pointerup', pend.up); window.addEventListener('pointercancel', pend.up);
  KR._lpPend = pend;
};
KR.lpCancel = function () { var p = KR._lpPend; if (!p) return; KR._lpPend = null; clearTimeout(p.timer); if (p.el) p.el.classList.remove('lp-wait'); window.removeEventListener('pointermove', p.move); window.removeEventListener('pointerup', p.up); window.removeEventListener('pointercancel', p.up); };
KR.lpFire = function () {
  var p = KR._lpPend; KR.lpCancel(); if (!p) return; KR.stopGlides && KR.stopGlides();
  var hold = {};
  hold.move = function (ev) { KR.lpDragMove(ev.clientX, ev.clientY, 'stick'); };
  hold.up = function () { window.removeEventListener('pointermove', hold.move); window.removeEventListener('pointerup', hold.up); window.removeEventListener('pointercancel', hold.up); KR._lpDrag = null; KR._lpQuiet = performance.now() + 350; };
  window.addEventListener('pointermove', hold.move); window.addEventListener('pointerup', hold.up); window.addEventListener('pointercancel', hold.up);
  KR.lpOpen(p.id); KR.lpDragStart(p.x, p.y);
};
})();
