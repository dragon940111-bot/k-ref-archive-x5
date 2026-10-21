/* 비교함 나란히 보기 · 인스펙터(즐겨찾기·비교함에서만) */
'use strict';
(function () {
var KR = window.KR, S = KR.S, esc = KR.esc, ic = KR.ic;

/* ── 인스펙터 260px: 위 = 마우스 올린 사진, 아래 = 목록 요약(실제 목록에서 셈) ── */
KR.inspList = function (list) { var F = S.inspFilter; return F ? list.filter(function (p) { return KR.has(p, F.f, F.v); }) : list; };
KR.renderInsp = function (list, kind) {
  if (!S.inspOpen) return '<button type="button" class="insp-tab" data-act="insp" aria-label="인스펙터 펼치기 (I)">INSPECTOR</button>';
  var p = (S.hover && list.some(function (x) { return x.id === S.hover; }) ? KR.p(S.hover) : null) || list[0];
  var h = '<aside class="insp sh" id="insp" aria-label="인스펙터"><h5>INSPECTOR <span style="font-weight:400;letter-spacing:0">마우스 올린 사진' + (kind === 'cmp' && S.cmpSel.length ? ' · 선택 ' + S.cmpSel.length : '') + ' · <button type="button" data-act="insp" aria-label="인스펙터 접기 (I)">접기 ›</button></span></h5>';
  if (!p) return h + '<div class="empty">' + (kind === 'cmp' ? '비교함이 비었어요.' : '이 목록에 사진이 없어요. 검색 화면에서 F로 담아요.') + '</div></aside>';
  h += '<div class="sec2" id="insp-top"><div class="ph"><img src="' + p.src + '" alt=""></div><div class="tt"><b>' + esc(KR.title(p)) + '</b> <span class="mute">' + p.y + '</span></div><div class="meta">' + p.tm + ' · ' + esc(p.asp || '') + ' · ' + esc(p.fmt || '') + '</div><div class="pal6">' + (p.pal || []).slice(0, 6).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</div></div>';
  h += '<div class="sec2"><div class="kv"><span class="k">프레임</span><span class="v">' + esc([].concat(p.frame, p.shot.slice(0, 1)).join(' · ')) + '</span><span class="k">빛</span><span class="v">' + esc([].concat(p.light.slice(0, 2), p.ltype, p.tod).join(' · ')) + '</span><span class="k">공간</span><span class="v">' + esc([].concat(p.io, p.loc).join(' · ')) + '</span><span class="k">색온도</span><span class="v">' + KR.fmt('k', p.look.k) + ' · 채도 ' + p.look.s + '</span><span class="k">카메라</span><span class="v">' + esc([p.cam, p.lens].filter(Boolean).join(' · ')) + '</span><span class="k">AI가 본 것</span><span class="v"><span class="tag ai">[값 자리 · 점선 = 추정]</span></span></div>' +
    '<div class="acts3"><button type="button" class="btn" data-act="simof" data-pid="' + p.id + '">' + ic('search') + '비슷한 사진</button><button type="button" class="btn" data-act="open" data-pid="' + p.id + '">사진 창 <span class="kbd">Enter</span></button><button type="button" class="btn" data-act="export" data-pid="' + p.id + '">' + ic('export') + '내보내기</button></div></div>';
  /* 목록 요약 */
  var all = list, nW = KR.uniq(all.map(function (x) { return x.w; })).length;
  var dist = function (f, vals) { var m = KR.countsIn(all, f), ks = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, vals), mx = Math.max.apply(null, ks.map(function (k) { return m[k]; }).concat([1]));
    return ks.map(function (k) { var on = S.inspFilter && S.inspFilter.f === f && S.inspFilter.v === k; return '<button type="button" class="dbar' + (on ? ' on' : '') + '" data-act="inspf" data-f="' + f + '" data-v="' + esc(k) + '" aria-pressed="' + on + '"><span>' + esc(k) + '</span><span class="trk"><i style="width:' + (m[k] / mx * 100).toFixed(0) + '%"></i></span><span class="v">' + m[k] + '</span></button>'; }).join(''); };
  h += '<div class="sec2"><div class="sumh"><span>' + (kind === 'cmp' ? '비교함 요약' : '이 목록 요약') + '</span><span>' + all.length + '장 · 작품 ' + nW + '</span></div>' +
    '<div class="pal6" style="height:10px" title="사진별 대표색 띠">' + all.slice(0, 40).map(function (x) { return '<i style="background:' + (x.pal && x.pal[Math.min(3, x.pal.length - 1)] || '#333') + '"></i>'; }).join('') + '</div>' +
    '<div class="dist"><div class="dh">프레이밍</div>' + dist('frame', 5) + '<div class="dh">빛 · 시간대</div>' + dist('light', 3) + dist('tod', 2) + '</div>' +
    '<div class="mute" style="font-size:11px">' + (S.inspFilter ? '<button type="button" class="lnk" data-act="inspf" data-f="' + S.inspFilter.f + '" data-v="' + esc(S.inspFilter.v) + '">‘' + esc(S.inspFilter.v) + '’만 보는 중 · 풀기 ×</button>' : '막대를 누르면 이 목록 안에서 그 조건만') + '</div></div>';
  return h + '</aside>';
};
/* 마우스 올린 사진이 바뀌면 위 칸만 즉시 교체(정보 도구는 즉답), 사진만 80ms 크로스페이드 */
KR.inspHover = function (id) {
  if (S.hover === id) return; S.hover = id; var top = KR.$('#insp-top'); if (!top || !S.inspOpen) return;
  var p = KR.p(id); if (!p) return;
  var host = KR.$('#insp'); if (!host) return; var tmp = document.createElement('div');
  var list = S.cmpOpen ? S.cmp.map(KR.p).filter(Boolean) : KR.favPageList ? KR.favPageList() : [];
  tmp.innerHTML = KR.renderInsp(KR.inspList(list), S.cmpOpen ? 'cmp' : 'fav'); var nt = tmp.querySelector('#insp-top'), secs = tmp.querySelectorAll('.sec2');
  var olds = host.querySelectorAll('.sec2'); if (olds[0] && secs[0]) olds[0].replaceWith(secs[0]); if (olds[1] && secs[1]) olds[1].replaceWith(secs[1]);
  var ph = KR.$('#insp-top .ph'); if (ph && !KR.reduce()) { ph.classList.add('xf'); }
};
/* 인스펙터 접기·펴기: translateX(260px) 200ms, 본문 격자는 FLIP 240ms */
KR.toggleInsp = function () {
  var cells = KR.$$('[data-flip]'), before = KR.rects(cells, function (e) { return e.getAttribute('data-flip'); }), old = KR.$('#insp'), oldR = old ? old.getBoundingClientRect() : null;
  S.inspOpen = !S.inspOpen; KR.save('insp', S.inspOpen ? '1' : '0');
  if (old && !S.inspOpen && !KR.reduce()) {
    var ghost = old.cloneNode(true); ghost.removeAttribute('id'); ghost.style.cssText = 'position:fixed;left:' + oldR.left + 'px;top:' + oldR.top + 'px;width:' + oldR.width + 'px;height:' + oldR.height + 'px;z-index:66;pointer-events:none';
    document.body.appendChild(ghost); ghost.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(260px)', opacity: 0 }], { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).onfinish = function () { ghost.remove(); };
  }
  KR.render();
  var nw = KR.$('#insp'); if (nw && S.inspOpen && !KR.reduce()) nw.animate([{ transform: 'translateX(260px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
  KR.flip(KR.$$('[data-flip]'), function (e) { return e.getAttribute('data-flip'); }, before, { dur: 240 });
  KR.renderTimeline();
};

/* ── 나란히 보기 ── */
KR.renderCmp = function () {
  if (!S.cmpOpen) return '';
  var list = S.cmp.map(KR.p).filter(Boolean), view = KR.inspList(list), all = list.length > 0 && S.cmpSel.length === list.length;
  var h = '<div class="cmpv" id="cmpv" role="dialog" aria-modal="true" aria-label="나란히 보기">';
  h += '<div class="cmpbar sh"><span class="t">나란히 보기 · ' + list.length + '장</span><label><span class="cb' + (all ? ' on' : '') + '" role="checkbox" tabindex="0" aria-checked="' + all + '" data-act="cmpall"></span>전체 선택</label><span class="k">선택 ' + S.cmpSel.length + '</span>' +
    '<button type="button" class="btn" data-act="cmpdelsel"' + (S.cmpSel.length ? '' : ' disabled') + '>선택 삭제</button><button type="button" class="btn" data-act="cmpdelunsel"' + (S.cmpSel.length ? '' : ' disabled') + '>미선택 삭제</button><button type="button" class="btn' + (S.cmpConfirm ? ' warn' : '') + '" data-act="cmpdelall">' + (S.cmpConfirm ? '한 번 더 누르면 모두 삭제돼요' : '전체 삭제') + '</button>' +
    '<button type="button" class="btn' + (S.magnet ? ' acc' : '') + '" data-act="magnet" aria-pressed="' + S.magnet + '" title="자석: 켜면 체크한 사진을 끌 때 체크한 것들이 순서대로 같이 따라와요">' + ic('magnet') + (S.magnet ? '자석 켬' : '자석 끔') + '</button>' +
    '<button type="button" class="btn" data-act="export" data-ids="cmp">' + ic('export') + '내보내기</button>' +
    (S.inspFilter ? '<button type="button" class="chip on" data-act="inspf" data-f="' + S.inspFilter.f + '" data-v="' + esc(S.inspFilter.v) + '">' + esc(S.inspFilter.v) + '만 ×</button>' : '') +
    '<span class="r"><button type="button" class="btn" data-act="cmpclose">닫기 <span class="kbd">V</span></button></span></div>';
  h += '<div class="cmpbody"><div class="cg-wrap" id="cgwrap"><div class="cg" id="cg">' + view.map(function (p, i) {
    var on = S.cmpSel.indexOf(p.id) >= 0, kf = KR._cmpFocus === p.id;
    return '<div class="cgc' + (kf ? ' kfocus' : '') + '" data-cid="' + p.id + '" data-flip="c' + p.id + '"><div class="tile' + (on ? ' sel' : '') + '" data-pid="' + p.id + '"><button type="button" class="tb" data-act="cmpfocus" aria-label="' + esc(KR.title(p) + ' ' + p.tm) + ' — 끌어서 순서 바꾸기, Enter 사진 창, [ ] 한 칸 이동"><img src="' + p.src + '" alt="" draggable="false"></button><span class="ring"></span>' +
      '<button type="button" class="ckh" data-act="cmpck" aria-pressed="' + on + '" aria-label="' + esc(KR.title(p)) + ' 선택"><span class="ck' + (on ? ' on' : '') + '">' + KR.ckSvg + '</span></button><button type="button" class="xx" data-act="cmpdrop" data-pid="' + p.id + '" aria-label="비교함에서 빼기">' + ic('x') + '</button></div>' +
      '<div class="cc"><b>' + esc(KR.title(p)) + '</b> (' + p.y + ') ' + p.tm + ' · ' + esc([].concat(p.frame, p.light.slice(0, 1)).join(' · ')) + '</div></div>';
  }).join('') + '</div>' + (list.length ? '' : '<p class="mute" style="padding:20px">비교함이 비었어요.</p>') + '</div>' + KR.renderInsp(view, 'cmp') + '</div></div><div class="cmp-ins" id="cmpins" aria-hidden="true"></div>';
  return h;
};
/* 순서 바꾸기(FLIP 220ms, 튕김 1회) */
function reorder(next) {
  var cells = KR.$$('#cg .cgc'), before = KR.rects(cells, function (e) { return e.getAttribute('data-cid'); });
  S.cmp = next; KR.renderOv();
  KR.flip(KR.$$('#cg .cgc'), function (e) { return e.getAttribute('data-cid'); }, before, { dur: 220, scale: false, easing: 'cubic-bezier(.3,1.3,.5,1)' });
}
KR.cmpMove = function (d) {
  var ids = S.cmpSel.length ? S.cmp.filter(function (x) { return S.cmpSel.indexOf(x) >= 0; }) : KR._cmpFocus ? [KR._cmpFocus] : [];
  if (!ids.length) { KR.toast('먼저 사진을 고르거나 눌러서 포커스하세요'); return; }
  var rest = S.cmp.filter(function (x) { return ids.indexOf(x) < 0; }), first = S.cmp.indexOf(ids[0]), at = Math.max(0, Math.min(rest.length, first + d));
  var next = rest.slice(); Array.prototype.splice.apply(next, [at, 0].concat(ids)); if (next.join() === S.cmp.join()) return; reorder(next);
  var f = KR.$('.cgc[data-cid="' + (KR._cmpFocus || ids[0]) + '"] .tb'); if (f) try { f.focus({ preventScroll: false }); } catch (e) {}
};
/* 끌어서 순서 바꾸기: 8px 넘게 움직이면 시작, 손을 따라옴, 들어갈 자리 세로 줄 먼저(80ms) → 잠깐 멈추면/놓으면 FLIP */
KR.cmpGrab = function (e, cell) {
  if (e.button !== 0) return; if (e.target.closest('.ckh, .xx')) return;
  var id = cell.getAttribute('data-cid'), r = cell.getBoundingClientRect();
  var group = S.magnet && S.cmpSel.indexOf(id) >= 0 && S.cmpSel.length > 1 ? S.cmp.filter(function (x) { return S.cmpSel.indexOf(x) >= 0; }) : [id];
  var g = { id: id, el: cell, sx: e.clientX, sy: e.clientY, gx: e.clientX - r.left, gy: e.clientY - r.top, on: false, group: group, slot: null };
  KR.lpPress(e, id, cell, function (ev) { start(ev); });
  function start(ev) {
    g.on = true; KR._cmpDrag = g; cell.classList.add('cmp-drag');
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    if (group.length > 1) { var tip = document.createElement('div'); tip.className = 'cmp-tip'; tip.id = 'cmptip'; tip.textContent = '자석: 체크한 ' + group.length + '장이 순서대로 같이 이동 · 들어갈 자리는 세로 줄로 먼저 표시'; document.body.appendChild(tip); }
    move(ev);
  }
  function follow(el, x, y, k) {
    var base = el._base || (el._base = el.getBoundingClientRect()); el.style.transition = k && !KR.reduce() ? 'transform ' + (0.16 + k * 0.06).toFixed(2) + 's cubic-bezier(.2,.8,.2,1)' : 'none';
    el.style.transform = 'translate(' + (x - g.gx - base.left + k * 12).toFixed(1) + 'px,' + (y - g.gy - base.top + k * 10).toFixed(1) + 'px) scale(' + (k ? .94 : 1.03) + ')'; el.style.zIndex = String(30 - k);
    if (k) el.classList.add('cmp-follow');
  }
  function slotAt(x, y) {
    var over = null, after = false; KR.$$('#cg .cgc').forEach(function (f) { var cid = f.getAttribute('data-cid'); if (group.indexOf(cid) >= 0) return; var b = f._base || f.getBoundingClientRect(); if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) { over = f; after = x > b.left + b.width / 2; } });
    if (!over) return null; var rest = S.cmp.filter(function (x2) { return group.indexOf(x2) < 0; }), at = rest.indexOf(over.getAttribute('data-cid')) + (after ? 1 : 0), next = rest.slice(); Array.prototype.splice.apply(next, [at, 0].concat(group));
    if (next.join() === S.cmp.join()) return null; return { over: over, after: after, next: next, key: next.join() };
  }
  function mark(s) { var ln = KR.$('#cmpins'); if (!ln) return; if (!s) { ln.classList.remove('on'); return; } var b = s.over._base || s.over.getBoundingClientRect(), x = s.after ? b.right + 6 : b.left - 6; ln.style.left = (x - 1) + 'px'; ln.style.top = (b.top - 4) + 'px'; ln.style.height = (b.height + 8) + 'px'; ln.classList.add('on'); }
  function move(ev) {
    follow(g.el, ev.clientX, ev.clientY, 0);
    group.filter(function (x) { return x !== id; }).forEach(function (gid, i) { var f = KR.$('.cgc[data-cid="' + gid + '"]'); if (f) follow(f, ev.clientX, ev.clientY, i + 1); });
    var tip = KR.$('#cmptip'); if (tip) { tip.style.left = (ev.clientX + 18) + 'px'; tip.style.top = (ev.clientY + 22) + 'px'; }
    var s = slotAt(ev.clientX, ev.clientY); mark(s); g.slot = s; g.last = ev;
    clearTimeout(g.wait); if (s) g.wait = setTimeout(function () { if (KR._cmpDrag === g && g.slot && g.slot.key === s.key) apply(s.next); }, 380);
  }
  function apply(next) {
    /* 끄는 사진은 손에 붙인 채, 나머지만 FLIP */
    var others = KR.$$('#cg .cgc').filter(function (f) { return group.indexOf(f.getAttribute('data-cid')) < 0; }), before = KR.rects(others, function (f) { return f.getAttribute('data-cid'); });
    S.cmp = next; mark(null); g.slot = null; KR.renderOv();
    var cells = KR.$$('#cg .cgc'); cells.forEach(function (f) { f._base = null; });
    g.el = KR.$('.cgc[data-cid="' + id + '"]'); if (g.el) g.el.classList.add('cmp-drag');
    KR.flip(cells.filter(function (f) { return group.indexOf(f.getAttribute('data-cid')) < 0; }), function (f) { return f.getAttribute('data-cid'); }, before, { dur: 220, scale: false, easing: 'cubic-bezier(.3,1.3,.5,1)' });
    cells.forEach(function (f) { f._base = f.getBoundingClientRect(); });
    if (g.last) move(g.last);
  }
  function up() {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); clearTimeout(g.wait);
    var tip = KR.$('#cmptip'); if (tip) tip.remove(); mark(null);
    var seen = {}; group.forEach(function (gid) { var f = KR.$('.cgc[data-cid="' + gid + '"]'); if (f) seen[gid] = f.getBoundingClientRect(); });
    if (g.slot) { var others = KR.$$('#cg .cgc').filter(function (f) { return group.indexOf(f.getAttribute('data-cid')) < 0; }), before = KR.rects(others, function (f) { return f.getAttribute('data-cid'); }); S.cmp = g.slot.next; KR.renderOv(); KR.flip(KR.$$('#cg .cgc').filter(function (f) { return group.indexOf(f.getAttribute('data-cid')) < 0; }), function (f) { return f.getAttribute('data-cid'); }, before, { dur: 220, scale: false, easing: 'cubic-bezier(.3,1.3,.5,1)' }); }
    else KR.renderOv();
    /* 놓은 사진이 자리로 미끄러져 들어감(하나씩, 튕김 1회) */
    group.forEach(function (gid, i) { var f = KR.$('.cgc[data-cid="' + gid + '"]'), b = seen[gid]; if (!f || !b || KR.reduce()) return; var a = f.getBoundingClientRect(); f.style.zIndex = '20';
      f.animate([{ transform: 'translate(' + (b.left - a.left) + 'px,' + (b.top - a.top) + 'px)' }, { transform: 'none' }], { duration: 220, delay: i * 35, easing: 'cubic-bezier(.3,1.3,.5,1)', fill: 'backwards' }).onfinish = function () { f.style.zIndex = ''; }; });
    KR._cmpDrag = null; KR._justDragged = true; setTimeout(function () { KR._justDragged = false; }, 0);
  }
};
})();
