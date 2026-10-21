/* 타임라인 3단(접힘 35px · 펼침 300px · 크게 480px) — 모든 화면에서 오른쪽 아래 같은 자리(부품규칙 13, 움직임_명세 2.7) */
'use strict';
(function () {
var KR = window.KR, S = KR.S, esc = KR.esc, ic = KR.ic;

KR.crumbs = function () {
  var c = [{ label: '보관함', go: 'home' }], r = S.route, nCond = S.filters.length + (S.color ? 1 : 0) + Object.keys(S.tone).length;
  if (S.scope === 'seen') c.push({ label: '최근 본 사진', go: 'search' });
  if (S.scope === 'sim') c.push({ label: '비슷한 사진', go: 'search' });
  if (S.scope === 'img') c.push({ label: '사진으로 찾기', go: 'search' });
  if (S.scope === 'fav') c.push({ label: '즐겨찾기만', go: 'search' });
  if (nCond || S.q.trim()) c.push({ label: (S.q.trim() ? '“' + S.q.trim() + '” ' : '') + (nCond ? '조건 ' + nCond + '개' : ''), go: 'search' });
  if (r.name === 'work') c.push({ label: KR.workTitle(r.w), go: 'work' });
  if (r.name === 'person') c.push({ label: r.n, go: 'person' });
  if (r.name === 'fav') c.push({ label: '즐겨찾기', go: 'fav' });
  if (r.name === 'portfolio') c.push({ label: '작가 포트폴리오', go: 'portfolio' });
  if (r.name === 'ai') c.push({ label: 'AI 분석 실행', go: 'ai' });
  if (S.cmpOpen) c.push({ label: '나란히 보기', go: 'cmp' });
  var p = S.win && KR.p(S.win); if (p) c.push({ label: '사진 ' + p.tm, go: 'win' });
  return c;
};
KR.tlRight = function () {
  if (S.cmpOpen) return S.inspOpen && window.innerWidth > 900 ? 284 : 20;
  if (S.route.name === 'fav') return S.inspOpen && window.innerWidth > 900 ? 284 : 20;
  return 20;
};
function thumb(p, kind, extra) {
  var here = kind === 'cmp' && KR.lastRes && KR.lastRes.length < KR.data.length && KR.lastRes.some(function (x) { return x.id === p.id; }) && S.route.name === 'search';
  return '<span class="tth' + (here ? ' here' : '') + '"' + (extra || '') + '><button type="button" data-act="open" data-pid="' + p.id + '" aria-label="' + esc(KR.title(p) + ' ' + p.tm) + ' 다시 열기" style="display:block;width:100%;height:100%;padding:0"><img src="' + p.src + '" alt="" draggable="false"></button>' +
    '<button type="button" class="x" data-act="' + (kind === 'cmp' ? 'cmpdrop' : 'seendel') + '" data-pid="' + p.id + '" aria-label="' + esc(KR.title(p) + ' ' + p.tm) + (kind === 'cmp' ? ' 비교함에서 빼기' : ' 기록에서 지우기') + '">' + ic('x') + '</button></span>';
}
function cmpZone() {
  var list = S.cmp.map(KR.p).filter(Boolean), selAdd = S.sel.filter(function (x) { return S.cmp.indexOf(x) < 0; }).length;
  var h = '<div class="cmpz" data-drop="cmp"><div class="s"><span>비교 <span class="cmpn num" style="font-size:13px">' + list.length + '</span> / ' + KR.CMP_MAX + '</span>';
  if (S.cmpNote) h += '<span class="full" title="' + esc(S.cmpNote) + '">' + esc(S.cmpNote) + '</span>';
  if (S.cmpOff.length) h += '<span class="full" style="border-style:dashed;border-color:var(--kr-line);color:var(--kr-sub)" title="체크 푼 사진은 페이지를 옮기면 빠져요">이동 시 −' + S.cmpOff.length + '</span>';
  h += '<span class="r">' + (selAdd && S.route.name === 'search' ? '<button type="button" data-act="cmpsel" title="체크한 사진을 비교함에 담기 (C)">+ 체크 ' + selAdd + ' <span class="kbd">C</span></button>' : '') +
    (list.length ? '<button type="button" data-act="cmpclear">비우기</button><span aria-hidden="true">·</span><button type="button" data-act="cmpview" title="나란히 보기 (V)">나란히</button>' : '') + '</span></div>';
  h += list.length ? '<div class="tstrip" data-strip="1" tabindex="0" aria-label="비교함 띠 — 포커스 뒤 ← → 로 넘기기" data-kstrip="1">' + list.map(function (p) { return thumb(p, 'cmp'); }).join('') + '</div>' : '<p class="note">사진의 비교 버튼(+)·C 키·끌어 놓기로 담아요. 30장까지.</p>';
  return h + '</div>';
}
KR.renderTl = function () {
  var nSteps = KR.crumbs().length, list = S.cmp, seen = S.seen.map(KR.p).filter(Boolean), right = KR.tlRight(), sty = 'right:' + right + 'px';
  if (S.lp) return '';
  if (!S.dockOpen) return '<div class="tl min sh" id="tl" role="region" aria-label="타임라인" data-drop="cmp" style="' + sty + '"><button type="button" data-act="tlopen" style="display:inline-flex;align-items:center;gap:11px;height:35px" aria-label="타임라인 펼치기">' + ic('clock') + '<span>타임라인 · 경로 ' + nSteps + ' · <span class="cmpn">비교 ' + list.length + '</span> /' + KR.CMP_MAX + '</span><span class="up" aria-hidden="true">' + ic('up') + '</span></button></div>';
  var big = S.dockLevel === 2 && seen.length > 0, h = '';
  h += '<div class="h">타임라인 <span class="sub">· 경로 ' + nSteps + '</span><span class="r">' + (seen.length ? '<button type="button" data-act="tllevel" aria-expanded="' + big + '">' + (big ? '작게' : '⌃ 크게') + '</button>' : '') + '<button type="button" data-act="tlclose" aria-label="타임라인 접기">접기</button></span></div>';
  h += '<div class="tl-in">';
  if (big) {
    h += '<nav class="path" aria-label="경로">' + KR.crumbs().map(function (c, i, a) { return (i ? '<span aria-hidden="true">›</span>' : '') + (i === a.length - 1 ? '<b>' + esc(c.label) + '</b>' : '<button type="button" data-act="crumb" data-go="' + c.go + '">' + esc(c.label) + '</button>'); }).join('') + '</nav>';
    var all = seen.length > 0 && S.sel.length > 0 && seen.every(function (p) { return S.sel.indexOf(p.id) >= 0; });
    h += '<div class="bar"><label><span class="cb' + (all ? ' on' : '') + '" role="checkbox" aria-checked="' + all + '" tabindex="0" data-act="seenall"></span>전체 선택</label><span>본 사진 ' + seen.length + '장 · 선택 ' + S.sel.length + '</span>' +
      '<span class="r"><button type="button" data-act="favsel"' + (S.sel.length ? '' : ' disabled') + '>즐겨찾기</button><button type="button" data-act="cmpsel"' + (S.sel.length ? '' : ' disabled') + '>비교함</button><button type="button" data-act="seendelsel"' + (S.sel.length ? '' : ' disabled') + '>선택 삭제</button><button type="button" data-act="seendelall" class="' + (S.seenConfirm ? 'warn' : '') + '">' + (S.seenConfirm ? '한 번 더 누르면 모두 지워져요' : '전체 삭제') + '</button><button type="button" data-act="seenmore">더보기 ›</button></span></div>';
    h += '<div class="g5" role="group" aria-label="본 사진">' + seen.slice(0, 120).map(function (p) { var on = S.sel.indexOf(p.id) >= 0; return '<div class="tile' + (on ? ' sel' : '') + '" data-pid="' + p.id + '"><button type="button" class="tb" data-act="open" aria-label="' + esc(KR.title(p) + ' ' + p.tm) + ' 다시 열기"><img src="' + p.src + '" alt="" loading="lazy"></button><span class="ring"></span><button type="button" class="ckh" data-act="ck" tabindex="-1" aria-label="선택"><span class="ck' + (on ? ' on' : '') + '">' + KR.ckSvg + '</span></button></div>'; }).join('') + '</div>';
  } else if (seen.length) {
    h += '<div class="s">최근 본 사진<span class="r"><button type="button" data-act="seenmore">더보기 (' + seen.length + ') ›</button></span></div>';
    h += '<div class="tstrip" data-strip="1" aria-label="최근 본 사진">' + seen.slice(0, 40).map(function (p) { return thumb(p, 'seen'); }).join('') + '</div>';
  } else h += '<p class="note">사진을 열면 최근 본 사진이 여기에 쌓여요.</p>';
  h += cmpZone() + '</div>';
  return '<div class="tl sh' + (big ? ' big' : '') + '" id="tl" role="region" aria-label="타임라인" style="' + sty + '">' + h + '</div>';
};
/* 다시 그리기 + FLIP(중단 가능: 지금 보이는 크기에서 새 목표로) */
KR.renderTimeline = function (anim) {
  var host = KR.$('#gtl'); if (!host) return;
  var old = KR.$('#tl'), before = old ? old.getBoundingClientRect() : null, scr = {};
  KR.$$('.tstrip', host).forEach(function (s, i) { scr[i] = s.scrollLeft; });
  var g5 = KR.$('.g5', host), g5s = g5 ? g5.scrollTop : 0;
  if (old && old._a) old._a.cancel();
  var oldKeys = KR.$('.keysbtn', host), oldKB = oldKeys ? oldKeys.getBoundingClientRect() : null;
  host.innerHTML = KR.renderTl() + (S.lp ? '' : '<button type="button" class="keysbtn sh" data-act="keys" style="bottom:' + KR.keysBottom() + 'px;right:' + KR.tlRight() + 'px" aria-expanded="' + S.keysOpen + '" title="단축키 (?)">' + ic('key') + '단축키 <span class="kbd">?</span></button>');
  /* 단축키 버튼: 타임라인 윗변 + 8px — 접힘·펼침·크게 어느 단계든 위에 붙어 따라감 */
  var tlBox = KR.$('#tl', host), kb = KR.$('.keysbtn', host);
  /* 검색 칸·자세한 정보 카드가 타임라인과 겹치지 않게(M-07·P-04) — 움직이기 전 최종 자리로 잰다 */
  KR._tlLeft = tlBox ? tlBox.getBoundingClientRect().left : null; if (KR.placeSearch) KR.placeSearch();
  var dc = KR.$('#dcard'); if (dc && window.innerWidth > 900) dc.style.right = Math.round(window.innerWidth - (KR._tlLeft != null ? KR._tlLeft : window.innerWidth - 20) + 12) + 'px';
  if (tlBox && kb) { var tr = tlBox.getBoundingClientRect(); KR._keysB = Math.round(window.innerHeight - tr.top + 8); kb.style.bottom = KR._keysB + 'px'; var bd = KR.$('#selbadge'); if (bd) bd.style.bottom = (KR._keysB + 34) + 'px'; }
  KR.$$('.tstrip', host).forEach(function (s, i) { if (scr[i]) s.scrollLeft = scr[i]; });
  var g5n = KR.$('.g5', host); if (g5n) g5n.scrollTop = g5s;
  var box = KR.$('#tl'); if (!anim || !box || !before || KR.reduce()) return;
  var after = box.getBoundingClientRect(); if (!after.width) return;
  var opening = anim === 'open' || anim === 'grow', dur = opening ? 380 : 210;
  if (anim === 'grow' || anim === 'shrink') dur = 300;
  if (kb && oldKB) { var nk = kb.getBoundingClientRect(); if (Math.abs(oldKB.top - nk.top) > 0.5) { if (kb._a) kb._a.cancel(); kb._a = kb.animate([{ transform: 'translateY(' + (oldKB.top - nk.top).toFixed(1) + 'px)' }, { transform: 'none' }], { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)' }); } }
  box._a = box.animate([{ transform: 'scale(' + (before.width / after.width).toFixed(4) + ',' + (before.height / after.height).toFixed(4) + ')' }, { transform: 'none' }], { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)' });
  var inn = KR.$('.tl-in', box), hh = KR.$('.h', box);
  [inn, hh].forEach(function (e) { if (e && opening) e.animate([{ opacity: 0 }, { opacity: 0, offset: anim === 'grow' ? .27 : .16 }, { opacity: 1, offset: anim === 'grow' ? .53 : .47 }, { opacity: 1 }], { duration: dur, easing: 'linear' }); });
};
})();
