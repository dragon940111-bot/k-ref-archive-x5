/* 검색 화면: 위쪽 바 · 조건 칸 · 셀렉트 띠 · 개수 줄 · 격자 · 떠다니는 선택 토글 · 아래 검색 칸 · 사진으로 찾기 */
'use strict';
(function () {
var KR = window.KR, S = KR.S, esc = KR.esc, ic = KR.ic;

/* ── 위쪽 바(작업공간 탭) 52px ── */
KR.renderTop = function () {
  var r = S.route.name, nPeople = KR.peopleList.length;
  var th = S.theme === 'dark' ? 'moon' : S.theme === 'light' ? 'sun' : 'indigo';
  var thName = { dark: '어둡게', light: '밝게', indigo: '인디고' }[S.theme], next = { dark: '밝게', light: '인디고', indigo: '어둡게' }[S.theme];
  return '<button type="button" class="wm" data-act="home" aria-label="종합 검색으로"><span class="k">K</span><span class="t">Ref-Archive</span></button>' +
    '<nav class="wtabs" aria-label="작업공간">' +
      '<button type="button" class="wtab' + (r === 'search' ? ' on' : '') + '" data-act="go" data-r="search">종합 검색 <span class="n">' + KR.data.length + '</span></button>' +
      '<button type="button" class="wtab' + (r === 'portfolio' || r === 'person' ? ' on' : '') + '" data-act="go" data-r="portfolio">작가 포트폴리오 <span class="n">' + nPeople + '</span></button>' +
      '<button type="button" class="wtab soonT" disabled aria-disabled="true" title="데이터가 생기면 열려요">브랜드 · 캠페인 <span class="soon">준비 중</span></button>' +
      '<button type="button" class="wtab soonT" disabled aria-disabled="true" title="데이터가 생기면 열려요">큐레이팅 보드 <span class="soon">준비 중</span></button>' +
      '<button type="button" class="wtab' + (r === 'ai' ? ' on' : '') + '" data-act="go" data-r="ai">AI 분석 실행</button>' +
    '</nav>' +
    '<div class="rt">' +
      '<button type="button" class="tb-btn' + (S.imgFind || S.scope === 'img' ? ' on' : '') + '" data-act="imgfind">' + ic('img') + '<span class="lbl">사진으로 찾기</span></button>' +
      '<span class="seg" role="group" aria-label="표시 언어"><button type="button" class="' + (S.lang !== 'en' ? 'on' : '') + '" data-act="lang" data-v="ko" aria-pressed="' + (S.lang !== 'en') + '">한</button><button type="button" class="' + (S.lang === 'en' ? 'on' : '') + '" data-act="lang" data-v="en" aria-pressed="' + (S.lang === 'en') + '">EN</button></span>' +
      '<button type="button" class="tb-btn ic" data-act="theme" aria-label="밝기: ' + thName + ' (눌러서 ' + next + ')" title="밝기: ' + thName + ' → ' + next + '"><span class="thi">' + ic(th) + '</span></button>' +
    '</div>';
};

/* ── 조건 칸 220px ── */
function fold(id, open, label, hint) { return '<div class="sec-h"><button type="button" class="fold' + (open ? '' : ' shut') + '" data-act="fold" data-k="' + id + '" aria-expanded="' + open + '">' + ic('down') + esc(label) + '</button>' + (hint || '') + '</div>'; }
KR.renderCp = function () {
  var fq = S.fq.trim(), h = '';
  h += '<h5>조건 <button type="button" class="hint" data-act="side" title="조건 칸 접기 ([)">‹ 접기</button></h5>';
  h += '<label class="sr" for="cpfind">조건 찾기</label><input id="cpfind" class="find" type="search" placeholder="조건 찾기" value="' + esc(S.fq) + '" data-input="fq">';
  /* 매체 — 셀렉트 띠 끝 버튼과 연동 */
  var mc = KR.countsIn(KR.result('media'), 'media');
  h += '<div class="sec"><h5>매체 <span class="hint">연동</span></h5><div class="mchips">' + KR.MEDIA.map(function (v) { var on = KR.isOn('media', v); return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-act="filter" data-f="media" data-v="' + esc(v) + '" aria-pressed="' + on + '">' + esc(v) + '<span class="n">' + (mc[v] || 0) + '</span></button>'; }).join('') + '</div></div>';
  /* 작품 — 체크 풀어 빼기 */
  var all = KR.result('work'), per = {}, order = [];
  all.forEach(function (p) { if (!per[p.w]) { per[p.w] = 0; order.push(p.w); } per[p.w]++; });
  S.hideWorks.forEach(function (w) { if (order.indexOf(w) < 0) { order.push(w); per[w] = 0; } });
  order.sort(function (a, b) { return per[b] - per[a]; });
  h += '<div class="sec">' + fold('works', S.worksOpen, '작품', '<span class="hint mute" style="font-size:11px">' + order.length + ' · 체크 풀어 빼기' + (S.hideWorks.length ? ' · <button type="button" class="lnk" data-act="allworks">모두 다시</button>' : '') + '</span>');
  if (S.worksOpen) h += order.map(function (w) { var on = S.hideWorks.indexOf(w) < 0, i = KR.workInfo[w]; return '<button type="button" class="row wk' + (on ? '' : ' off') + '" data-act="work" data-w="' + esc(w) + '" aria-pressed="' + on + '" aria-label="' + esc(KR.workTitle(w)) + (on ? ' 결과에서 빼기' : ' 결과에 다시 넣기') + '"><span class="cb' + (on ? ' on' : '') + '" aria-hidden="true"></span><span class="nm" style="margin-left:8px">' + esc(KR.workTitle(w)) + ' (' + i.y + ')</span><span class="n">' + per[w] + '</span></button>'; }).join('');
  h += '</div>';
  /* 화면 느낌(A) — C 버튼과 같은 값 */
  var lk = KR.lookValues();
  h += '<div class="sec">' + fold('look', S.lookOpen, '화면 느낌', '<span class="hint mute" style="font-size:11px">A+C 연동</span>');
  if (S.lookOpen) h += [['color', '색'], ['light', '밝기 · 색온도'], ['quality', '채도 · 대비 · 선명도'], ['shape', '화면 비율']].map(function (x) {
    var v = lk[x[0]]; return '<button type="button" class="row' + (v ? ' on' : '') + (S.cond === x[0] ? ' on' : '') + '" data-act="cond" data-k="' + x[0] + '" aria-expanded="' + (S.cond === x[0]) + '"><span>' + x[1] + '</span><span class="' + (v ? 'n' : 'go') + '">' + esc(v || '고르기 ›') + '</span></button>';
  }).join('');
  h += '</div>';
  /* 조건 묶음 */
  KR.FIELDS.forEach(function (x) {
    var f = x[0], vals = KR.valuesOf(f);
    if (fq && x[1].indexOf(fq) < 0) { vals = vals.filter(function (v) { return v.indexOf(fq) >= 0; }); if (!vals.length) return; }
    var m = KR.countsIn(KR.result(f), f), pinned = S.pins.indexOf(f) >= 0, open = !!fq || S.open.indexOf(f) >= 0, nPick = S.filters.filter(function (y) { return y.f === f; }).length;
    h += '<div class="sec"><div class="sec-h"><button type="button" class="fold' + (open ? '' : ' shut') + '" data-act="foldf" data-f="' + f + '" aria-expanded="' + open + '">' + ic('down') + esc(x[1]) + (nPick ? ' <span style="color:var(--kr-acc);font-weight:400;letter-spacing:0">· ' + nPick + '</span>' : '') + '</button>' +
      '<button type="button" class="hint lnk" style="font-size:11px;color:var(--kr-mute)" data-act="pin" data-f="' + f + '" aria-label="' + esc(x[1]) + (pinned ? ' 띠에서 내리기' : ' 셀렉트 띠에 올리기') + '">' + (pinned ? '띠에 있음' : '띠에 올리기') + '</button></div>';
    if (open) h += vals.map(function (v) { var on = KR.isOn(f, v); return '<button type="button" class="row' + (on ? ' on' : '') + '" data-act="filter" data-f="' + f + '" data-v="' + esc(v) + '" aria-pressed="' + on + '"><span>' + esc(v) + '</span><span class="n">' + (m[v] || 0) + '</span></button>'; }).join('');
    h += '</div>';
  });
  /* AI가 본 것 — 점선 = 추정 */
  h += '<div class="sec">' + fold('ai', S.aiOpen, 'AI가 본 것', '<span class="hint mute" style="font-size:11px">점선 = 추정</span>');
  if (S.aiOpen) h += '<div class="cp-empty"><span class="ai-dot">역광 · 실루엣</span> · <span class="ai-dot">얕은 심도</span> 같은 값이 여기에 모여요. 시안 자료에는 AI 분석 값이 없어 개수를 비워 둠 — 실제 앱은 단계 분석 뒤 채움.</div>';
  h += '</div>';
  return '<div class="cp-in">' + h + '</div>';
};
KR.lookValues = function () {
  var toneText = function (keys) { return keys.filter(function (k) { return S.tone[k]; }).map(function (k) { var r = S.tone[k]; return KR.TONE[k][0] + ' ' + (r.range ? KR.fmt(k, r.lo) + '~' + KR.fmt(k, r.hi) : '약 ' + KR.fmt(k, r.v)); }).join(', '); };
  return { color: S.color ? KR.hex(S.color.rgb) + ' ' + Math.round(S.color.min * 100) + '%↑' : '', light: toneText(KR.GROUPS.light), quality: toneText(KR.GROUPS.quality),
    shape: S.filters.filter(function (x) { return x.f === 'shape'; }).map(function (x) { return x.v; }).join(', '), media: S.filters.filter(function (x) { return x.f === 'media'; }).map(function (x) { return x.v; }).join(', ') };
};

/* ── 셀렉트 띠(압축형) ── */
function chip(f, v, n) {
  var on = KR.isOn(f, v), fi = KR.FRAME_ORDER.indexOf(v), sw = f === 'color' ? KR.SWATCH[v] : null, pre = '';
  if (f === 'frame' && fi >= 0) { var sc = [0.45, 0.6, 0.75, 0.95, 1.2, 1.5, 1.9][fi]; pre = '<svg class="fr-ic" viewBox="0 0 22 16" aria-hidden="true"><rect x=".5" y=".5" width="21" height="15" rx="2" fill="none" stroke="currentColor" stroke-opacity=".45"/><g transform="translate(11 16) scale(' + sc + ') translate(-11 -16)"><circle cx="11" cy="6" r="2.4" fill="currentColor"/><path d="M6.5 16c0-3.2 2-5.2 4.5-5.2s4.5 2 4.5 5.2z" fill="currentColor"/></g></svg>'; }
  if (sw) pre = '<span class="sw" style="background:' + sw + '"></span>';
  return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-act="filter" data-f="' + f + '" data-v="' + esc(v) + '" aria-pressed="' + on + '">' + pre + esc(v) + '<span class="n">' + (n || 0) + '</span></button>';
}
KR.renderBand = function () {
  var h = '<div class="band-h">' + (S.sideOpen ? '' : '<button type="button" class="tg" data-act="side" aria-label="조건 칸 펼치기 ([)">' + ic('cond') + '조건 펼치기 <span class="kbd">[</span></button>') + '<button type="button" class="tg' + (S.bandOpen ? '' : ' shut') + '" data-act="band" aria-expanded="' + S.bandOpen + '">' + ic('down') + (S.bandOpen ? '셀렉트' : '셀렉트 (접힘)') + '</button>';
  h += [['auto', '이 결과에 많은 것'], ['pin', '고정한 조건'], ['recent', '최근 쓴 것']].map(function (m) { return '<button type="button" class="t' + (S.bandMode === m[0] ? ' on' : '') + '" data-act="bandmode" data-v="' + m[0] + '">' + m[1] + '</button>'; }).join('');
  h += '<span class="sp"></span>';
  h += '<span class="perrow" title="한 줄에 보이는 장수"><span class="dots" role="group" aria-label="한 줄에 보이는 장수">' + [2, 3, 4, 5, 6].map(function (n) { return '<button type="button" class="' + (S.perRow === n ? 'on' : '') + '" data-act="perrow" data-v="' + n + '" aria-label="한 줄 ' + n + '장" aria-pressed="' + (S.perRow === n) + '"><i></i></button>'; }).join('') + '</span> 한 줄 ' + S.perRow + '</span>';
  var lk = KR.lookValues();
  h += '<span class="cbtns">' + [['media', '매체'], ['color', '색'], ['light', '밝기'], ['quality', '채도'], ['shape', '비율']].map(function (x) { return '<button type="button" class="' + (lk[x[0]] ? 'set' : '') + '" data-act="cond" data-k="' + x[0] + '" aria-expanded="' + (S.cond === x[0]) + '" title="' + esc(lk[x[0]] || '') + '">' + x[1] + '</button>'; }).join('') + '</span>';
  h += '</div>';
  if (!S.bandOpen) return h;
  var groups = [];
  if (S.bandMode === 'auto') {
    var lim1 = { frame: 4, tod: 2, light: 3, color: 3 }, lim2 = { frame: 7, tod: 4, light: 6, color: 6, ltype: 4, io: 3 };
    var keys = S.bandTwo ? ['frame', 'tod', 'light', 'color', 'ltype', 'io'] : ['frame', 'tod', 'light', 'color'], total2 = 0, shown = 0;
    ['frame', 'tod', 'light', 'color', 'ltype', 'io'].forEach(function (f) {
      var m = KR.countsIn(KR.result(f), f), ks = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; });
      var n1 = Math.min(ks.length, lim1[f] || 0), n2 = Math.min(ks.length, lim2[f]); total2 += n2;
      var take = S.bandTwo ? n2 : n1; if (keys.indexOf(f) < 0) return; shown += take;
      var vs = ks.slice(0, take); if (f === 'frame') vs.sort(function (a, b) { return KR.FRAME_ORDER.indexOf(a) - KR.FRAME_ORDER.indexOf(b); });
      KR.S.filters.filter(function (x) { return x.f === f && vs.indexOf(x.v) < 0; }).forEach(function (x) { vs.push(x.v); });   // 고른 값은 늘 보임
      if (vs.length) groups.push({ name: KR.nameOf(f), items: vs.map(function (v) { return chip(f, v, m[v]); }) });
    });
    var more = Math.max(0, total2 - shown);
    h += '<div class="band-b"><div class="band-g' + (S.bandTwo ? ' two' : '') + '">' + groups.map(function (g, i) { return (i ? '<span class="sep" aria-hidden="true"></span>' : '') + '<span class="lab">' + esc(g.name) + '</span>' + g.items.join(''); }).join('') +
      (S.bandTwo ? '<button type="button" class="more" data-act="band2" aria-expanded="true">접기 ⌃</button>' : (more ? '<button type="button" class="more" data-act="band2" aria-expanded="false">+' + more + ' 더 ' + ic('down') + '</button>' : '')) + '</div></div>';
  } else if (S.bandMode === 'pin') {
    var gh = S.pins.map(function (f) { var m = KR.countsIn(KR.result(f), f); return '<span class="lab">' + esc(KR.nameOf(f)) + '<button type="button" data-act="pin" data-f="' + f + '" aria-label="' + esc(KR.nameOf(f)) + ' 고정 풀기" title="고정 풀기">×</button></span>' + KR.valuesOf(f).slice(0, S.bandTwo ? 12 : 5).map(function (v) { return chip(f, v, m[v]); }).join(''); });
    var add = KR.FIELDS.filter(function (x) { return S.pins.indexOf(x[0]) < 0; });
    h += '<div class="band-b"><div class="band-g' + (S.bandTwo ? ' two' : '') + '">' + gh.join('<span class="sep" aria-hidden="true"></span>') +
      (S.bandTwo ? '<span class="sep"></span><span class="lab">띠에 올릴 조건</span>' + add.map(function (x) { return '<button type="button" class="chip dash" data-act="pin" data-f="' + x[0] + '">+ ' + esc(x[1]) + '</button>'; }).join('') + '<button type="button" class="more" data-act="band2">접기 ⌃</button>' : '<button type="button" class="more" data-act="band2">+ 조건 ' + ic('down') + '</button>') + '</div>' +
      (S.filters.length || S.color || Object.keys(S.tone).length ? '' : '') + '</div>';
  } else {
    var items = S.recent.map(function (r) { var m = KR.countsIn(KR.result(r.f), r.f); return chip(r.f, r.v, m[r.v]).replace('>' + esc(r.v) + '<', '>' + esc(KR.nameOf(r.f)) + ' · ' + esc(r.v) + '<'); });
    h += '<div class="band-b">' + (items.length ? '<div class="band-g' + (S.bandTwo ? ' two' : '') + '"><span class="lab">최근에 고른 조건</span>' + items.join('') + '</div>' : '<div class="band-note">아직 쓴 조건이 없습니다.</div>') + '</div>';
  }
  return h;
};

/* ── 개수 줄 44px ── */
KR.selState = function () {
  var inCmp = S.sel.length > 0 && S.sel.every(function (x) { return S.cmp.indexOf(x) >= 0; }), inFav = S.sel.length > 0 && S.sel.every(KR.inFav);
  return { inCmp: inCmp, inFav: inFav };
};
function peek() {
  var ps = S.sel.slice(0, 12).map(KR.p).filter(Boolean);
  return '<span class="peek" role="group" aria-label="선택한 사진 ' + S.sel.length + '장">' + ps.map(function (p) { return '<button type="button" data-act="open" data-pid="' + p.id + '" aria-label="' + esc(KR.title(p) + ' ' + p.tm) + ' 열기"><img src="' + p.src + '" alt=""></button>'; }).join('') + (S.sel.length > 12 ? '<i>+' + (S.sel.length - 12) + '</i>' : '') + '</span>';
}
KR.peek = peek;
KR.heard = function () {
  var q = S.q.trim().toLowerCase(); if (!q) return [];
  var known = {}; KR.data.forEach(function (p) { [].concat(p.frame, p.tod, p.light, p.ltype, p.io, p.color, p.shot, p.loc, p.tags).forEach(function (v) { known[String(v).toLowerCase()] = v; }); });
  return KR.uniq(q.split(/\s+/).filter(function (w) { return Object.keys(known).some(function (k) { return k.indexOf(w) >= 0; }); }));
};
KR.renderCount = function (res) {
  var nW = KR.uniq(res.map(function (p) { return p.w; })).length, ss = KR.selState(), h = '';
  var shown = S.scope === 'img' && !S.imgMore ? Math.min(60, res.length) : res.length;
  h += '<span class="big num">' + shown.toLocaleString() + '</span>';
  if (S.scope === 'img') h += '<span class="u">장 · ' + (S.imgSort === 'color' ? '색감이 비슷한 순' : '사진과 가까운 순') + (res.length > 60 && !S.imgMore ? ' · 처음 60장 + 더 보기' : '') + '</span>';
  else h += '<span class="u">장 · 작품 ' + nW + '개</span>';
  if (S.scope === 'img' && S.img) h += '<span class="basepic"><img src="' + S.img.src + '" alt=""><span>기준 사진 · ' + esc(S.img.name) + (S.img.ref ? '' : ' · 올린 파일은 보관함에 넣지 않음') + '</span><button type="button" class="lnk" data-act="imgclear">× 지우기</button></span>';
  var act = KR.activeChips();
  if (act.length) h += '<span class="act-chips">' + act.map(function (a) { return '<button type="button" class="chip on" data-act="dropf" data-i="' + a.i + '" aria-label="' + esc(a.label) + ' 조건 빼기">' + esc(a.label) + ' ×</button>'; }).join('') + '<button type="button" class="lnk" data-act="clearall">모두 지우기</button></span>';
  var heard = KR.heard(); if (heard.length) h += '<span class="heard" title="용어집으로 알아들은 말">읽은 말 <b>' + heard.map(esc).join(' · ') + '</b></span>';
  if (S.sel.length) h += '<span class="selz" role="toolbar" aria-label="선택한 사진"><span class="k pk" tabindex="0">' + S.sel.length + '장 선택' + peek() + '</span>' +
    '<button type="button" data-act="favsel" data-drop="fav" class="' + (ss.inFav ? 'okk' : '') + '">' + (ss.inFav ? '즐겨찾기에 담음 ✓' : '즐겨찾기에 추가') + '</button>' +
    '<button type="button" data-act="cmpsel" data-drop="cmp" class="' + (ss.inCmp ? 'okk' : '') + '">' + (ss.inCmp ? '비교함에 담음 ✓' : '비교함에 담기') + '</button>' +
    '<button type="button" class="x" data-act="clearsel">해제</button></span>';
  h += '<span class="acts">';
  if (S.scope === 'seen' || S.scope === 'sim') h += '<span class="btn" title="이 범위는 자기 순서로 보여요">' + ic('rows') + (S.scope === 'sim' ? '비슷한 순' : '최근 본 순') + '</span>';
  else if (S.scope === 'img') h += '<span class="seg" role="group" aria-label="정렬"><button type="button" class="' + (S.imgSort !== 'color' ? 'on' : '') + '" data-act="imgsort" data-v="near">사진과 가까운 순</button><button type="button" class="' + (S.imgSort === 'color' ? 'on' : '') + '" data-act="imgsort" data-v="color">색감이 비슷한 순</button></span>' +
    (S.img && S.img.ref ? '<button type="button" class="btn' + (S.imgShot ? ' on' : '') + '" data-act="imgshot" aria-pressed="' + S.imgShot + '">샷 크기도 맞추기</button>' : '');
  else {
    var so = KR.SORTS.find(function (o) { return o[0] === S.sort; }) || KR.SORTS[0];
    h += '<span class="sortw"><button type="button" class="btn" data-act="sort" aria-haspopup="menu" aria-expanded="' + S.sortOpen + '" aria-label="정렬: ' + so[1] + ' (눌러서 바꾸기)">' + ic('shuffle') + so[1] + ' ' + ic('down') + '</button>';
    if (S.sortOpen) h += '<button type="button" class="sort-bd" data-act="sortclose" aria-label="정렬 메뉴 닫기" tabindex="-1"></button><span class="sortm" role="menu" aria-label="정렬">' + KR.SORTS.map(function (o) { var on = S.sort === o[0]; return '<button type="button" role="menuitemradio" aria-checked="' + on + '" class="sorti' + (on ? ' on' : '') + '" data-act="sortpick" data-v="' + o[0] + '"><span class="ckm">' + ic('check') + '</span>' + o[1] + '<small>' + (o[0] === 'title' && S.lang === 'en' ? 'A–Z' : o[2]) + '</small></button>'; }).join('') + '</span>';
    h += '</span>';
  }
  h += '<span class="seg" role="group" aria-label="배치"><button type="button" class="' + (S.layout === 'just' ? 'on' : '') + '" data-act="layout" data-v="just" aria-pressed="' + (S.layout === 'just') + '">' + ic('rows') + '줄 맞춤</button><button type="button" class="' + (S.layout === 'fixed' ? 'on' : '') + '" data-act="layout" data-v="fixed" aria-pressed="' + (S.layout === 'fixed') + '">' + ic('grid') + '고정 칸</button></span>';
  h += '<button type="button" class="btn' + (S.line ? ' on' : '') + '" data-act="line" aria-pressed="' + S.line + '">경계선</button>';
  h += '<button type="button" class="btn' + (S.groupBy ? ' fill' : '') + '" data-act="group" aria-pressed="' + S.groupBy + '">작품별로 묶기</button>';
  h += '</span>';
  return h;
};
KR.activeChips = function () {
  var out = []; S.filters.forEach(function (x, i) { out.push({ i: 'f' + i, label: (x.f === 'shape' ? '비율 ' : '') + x.v }); });
  if (S.color) out.push({ i: 'color', label: '색 ' + KR.hex(S.color.rgb) });
  Object.keys(S.tone).forEach(function (k) { var r = S.tone[k]; out.push({ i: 't' + k, label: KR.TONE[k][0] + ' ' + (r.range ? KR.fmt(k, r.lo) + '~' + KR.fmt(k, r.hi) : '약 ' + KR.fmt(k, r.v)) }); });
  if (S.q.trim()) out.push({ i: 'q', label: '“' + S.q.trim() + '”' });
  return out;
};

/* ── 격자: 사진 칸은 pid로 다시 씀(그림이 깜박이지 않게) ── */
var tileCache = {};
KR.tileEl = function (p, opt) {
  opt = opt || {}; var key = p.id + (opt.k || ''), el = tileCache[key];
  if (!el) {
    el = document.createElement('div'); el.className = 'tile'; el.setAttribute('data-pid', p.id);
    el.innerHTML = '<button type="button" class="tb" data-act="open" aria-label="' + esc(p.wk + ' ' + p.tm) + '"><img src="' + p.src + '" alt="" loading="lazy" decoding="async" draggable="false"></button><span class="ring" aria-hidden="true"></span>' +
      '<button type="button" class="ckh" data-act="ck" tabindex="-1"><span class="ck">' + KR.ckSvg + '</span></button>' +
      '<button type="button" class="cmpb add" data-act="cmp" tabindex="-1"></button>' +
      '<button type="button" class="slate" data-act="fav" tabindex="-1"><i></i>' + ic('fav') + '</button>' +
      '<span class="cap"></span>';
    tileCache[key] = el;
  }
  KR.markTile(el, p, opt);
  return el;
};
KR.markTile = function (el, p, opt) {
  opt = opt || el._opt || {}; el._opt = opt;
  var sel = S.sel.indexOf(p.id) >= 0, ci = S.cmp.indexOf(p.id), fav = KR.inFav(p.id);
  el.classList.toggle('sel', sel);
  var ck = el.querySelector('.ck'); if (ck.classList.contains('on') !== sel) { ck.classList.toggle('on', sel); if (sel) { ck.classList.remove('draw'); void ck.offsetWidth; ck.classList.add('draw'); } }
  el.querySelector('.ckh').setAttribute('aria-label', KR.title(p) + ' ' + p.tm + (sel ? ' 선택 풀기 (X)' : ' 선택 (Ctrl+클릭 · X)'));
  el.querySelector('.ckh').setAttribute('aria-pressed', String(sel));
  var cb = el.querySelector('.cmpb'), was = cb.classList.contains('add');
  cb.className = 'cmpb ' + (ci >= 0 ? 'on' + (was ? ' in' : '') : 'add');
  cb.innerHTML = ic('cmp') + (ci >= 0 ? (ci + 1) : '+');
  cb.setAttribute('aria-label', ci >= 0 ? '비교함 ' + (ci + 1) + '번 · 눌러서 빼기 (C)' : '비교함에 담기 (C)');
  var sl = el.querySelector('.slate'); sl.classList.toggle('on', fav); sl.setAttribute('aria-label', fav ? '즐겨찾기 목록 바꾸기 (F)' : '즐겨찾기에 담기 (F)');
  var cap = el.querySelector('.cap'), sc = opt.score != null ? '<span class="sc">' + opt.score.toFixed(2) + '</span>' : '';
  cap.innerHTML = sc + '<span>' + esc(KR.title(p)) + '</span><span class="m">' + p.y + ' · ' + p.tm + ' · ' + esc((p.frame || [])[0] || '') + '</span>';
  el.classList.toggle('showcap', opt.score != null);
  el.classList.toggle('contain', S.layout === 'fixed');
};
KR.refreshMarks = function () { KR.$$('.tile[data-pid]').forEach(function (el) { var p = KR.p(el.getAttribute('data-pid')); if (!p) return; if (el.querySelector('.cmpb')) KR.markTile(el, p); else { var on = S.sel.indexOf(p.id) >= 0 || (el.closest('#cg') && S.cmpSel.indexOf(p.id) >= 0); el.classList.toggle('sel', !!on); var ck = el.querySelector('.ck'); if (ck) ck.classList.toggle('on', !!on); } }); };

function justRows(list, n) {
  /* 정본 규칙(justified.mjs와 같음): 한 줄은 고른 장수에서 닫거나 비율 합이 n×1.75에 닿으면 닫음. 좁은 사진 줄은 1.6배 높이까지 */
  var target = n * 1.75, out = [], i = 0;
  while (i < list.length) {
    var part = [], sum = 0;
    while (i < list.length) { part.push(list[i]); sum += Math.max(0.75, list[i].ar || 1.78); i++; if (part.length >= n || sum >= target) break; }
    var room = i >= list.length && sum < target ? target - sum : sum < target / 1.6 ? target / 1.6 - sum : 0;
    out.push({ items: part, room: room });
  }
  return out;
}
function buildRows(host, list, opt) {
  opt = opt || {};
  if (S.layout === 'fixed') {
    var g = document.createElement('div'); g.style.cssText = 'display:grid;grid-template-columns:repeat(' + S.perRow + ',minmax(0,1fr));gap:' + 4 + 'px';
    list.forEach(function (p) { var t = KR.tileEl(p, { score: opt.scores ? opt.scores[p.id] : null, k: opt.k }); t.style.cssText = 'aspect-ratio:16/9;width:100%;flex:none'; g.appendChild(t); });
    host.appendChild(g); return;
  }
  var w = document.createElement('div'); w.className = 'gwrap'; w.style.gap = '4px';
  justRows(list, S.perRow).forEach(function (r) {
    var row = document.createElement('div'); row.className = 'grow'; row.style.gap = '4px';
    r.items.forEach(function (p) { var ar = Math.max(0.75, p.ar || 1.78), t = KR.tileEl(p, { score: opt.scores ? opt.scores[p.id] : null, k: opt.k }); t.style.cssText = 'flex:' + ar + ' 1 0;min-width:0;aspect-ratio:' + ar; row.appendChild(t); });
    if (r.room > 0) { var f = document.createElement('div'); f.style.cssText = 'flex:' + r.room.toFixed(3) + ' 1 0;height:0'; f.setAttribute('aria-hidden', 'true'); row.appendChild(f); }
    w.appendChild(row);
  });
  host.appendChild(w);
}
KR.buildRows = buildRows;
KR.renderGrid = function (host, res) {
  host.textContent = '';
  host.classList.toggle('line-on', S.line);
  if (!res.length) { host.innerHTML = '<div class="gempty">맞는 사진이 없습니다. 조건을 하나 빼 보세요.</div>'; return; }
  var scores = S.scope === 'img' ? KR.imgScores : null;
  if (S.scope === 'img' && !S.imgMore && res.length > 60) res = res.slice(0, 60);
  if (S.groupBy) {
    var by = {}, keys = []; res.forEach(function (p) { if (!by[p.w]) { by[p.w] = []; keys.push(p.w); } by[p.w].push(p); });
    keys.sort(function (a, b) { return by[b].length - by[a].length; });
    keys.forEach(function (w) {
      var ps = by[w], i = KR.workInfo[w], open = !!S.gOpen[w], sec = document.createElement('section'); sec.setAttribute('aria-label', KR.workTitle(w) + ' 사진 ' + ps.length + '장');
      var who = [i.dir.length ? '감독 ' + i.dir.map(function (n) { return '<button type="button" data-act="person" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(', ') : '', i.dp.length ? '촬영 ' + i.dp.map(function (n) { return '<button type="button" data-act="person" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(', ') : ''].filter(Boolean).join(' · ');
      sec.innerHTML = '<div class="wh"><button type="button" class="t" data-act="workpage" data-w="' + esc(w) + '" title="작품 페이지로">' + esc(KR.workTitle(w)) + '</button><span class="y">' + i.y + '</span><span class="c">' + who + '</span><span class="r"><span>' + ps.length + '장</span><button type="button" data-act="gopen" data-w="' + esc(w) + '" aria-expanded="' + open + '">' + (open ? '접기 ⌃' : '펼치기 ⌄') + '</button></span></div>';
      if (open) buildRows(sec, ps, { scores: scores });
      else {
        /* 작품마다 두 줄, 각 줄을 따로 좌우로 끌어서 넘김(정본) */
        var r1 = [], r2 = [], w1 = 0, w2 = 0; ps.forEach(function (p) { if (w1 <= w2 * 0.82) { r1.push(p); w1 += p.ar; } else { r2.push(p); w2 += p.ar; } });
        var hgt = S.perRow <= 3 ? 200 : S.perRow >= 6 ? 120 : 160;
        [[r1, hgt], [r2, Math.round(hgt * 0.82)]].forEach(function (rr, ri) {
          if (!rr[0].length) return; var st = document.createElement('div'); st.className = 'strip'; st.style.cssText = 'gap:4px;margin-top:' + (ri ? 4 : 0) + 'px'; st.setAttribute('data-strip', '1');
          rr[0].forEach(function (p) { var t = KR.tileEl(p, { score: scores ? scores[p.id] : null, k: '~s' }); t.style.cssText = 'height:' + rr[1] + 'px;width:' + Math.round((S.layout === 'fixed' ? 16 / 9 : p.ar) * rr[1]) + 'px'; st.appendChild(t); });
          sec.appendChild(st);
        });
      }
      host.appendChild(sec);
    });
  } else buildRows(host, res, { scores: scores });
  if (S.scope === 'img' && !S.imgMore && KR._imgTotal > 60) { var m = document.createElement('div'); m.className = 'more-row'; m.innerHTML = '<button type="button" class="btn" data-act="imgmore">더 보기 (' + (KR._imgTotal - 60) + '장)</button>'; host.appendChild(m); }
};

/* ── 검색 화면 전체 ── */
KR.renderSearch = function (opt) {
  opt = opt || {};
  var shell = KR.$('#shell');
  if (!KR.$('#main') || shell.getAttribute('data-r') !== 'search') {
    shell.setAttribute('data-r', 'search');
    shell.innerHTML = '<aside class="cp sh" id="cp" aria-label="조건"></aside><main class="main" id="main"><section class="band sh" id="band" aria-label="셀렉트"></section><div class="count sh" id="count"></div><div id="scopeh"></div><div class="grid" id="grid"></div></main><button type="button" class="edge" id="edge" data-act="side" hidden aria-label="조건 칸 펼치기 ([)">조건 · [</button>';
    KR.bindMain(KR.$('#main'));
  }
  var cp = KR.$('#cp'); cp.hidden = !S.sideOpen && !opt.keepCp;
  KR.keepFocus(cp, function () { cp.innerHTML = KR.renderCp(); });
  KR.$('#edge').hidden = S.sideOpen;
  KR.$('#band').innerHTML = KR.renderBand();
  var res = KR.result(); KR._imgTotal = res.length; KR.lastRes = res;
  KR.$('#count').innerHTML = KR.renderCount(res);
  var sh = '';
  if (S.scope === 'seen') sh = '<div class="scopeh"><b>최근 본 사진</b><span>' + S.seen.length + '장 · 마지막으로 본 순서 · 왼쪽 조건과 검색어로 이 안에서 좁힐 수 있어요</span><button type="button" class="lnk" data-act="scopeoff">← 전체 보관함</button></div>';
  if (S.scope === 'sim') sh = '<div class="scopeh"><b>비슷한 사진</b><span>' + S.simIds.length + '장 · ‘' + esc(S.simOf) + '’과 비슷한 순서</span><button type="button" class="lnk" data-act="scopeoff">← 전체 보관함</button></div>';
  if (S.scope === 'fav') sh = '<div class="scopeh"><b>즐겨찾기만 보기</b><span>모든 목록에 담긴 사진 · 왼쪽 조건으로 좁히기</span><button type="button" class="lnk" data-act="scopeoff">← 전체 보관함</button></div>';
  if (S.scope === 'img') sh = '<div class="scopeh"><span>점수는 형식 예시 — 시안은 색 분포(64칸)와 태그로 셈, 실제 앱은 사진 숫자(SigLIP 2) · 다른 작품 먼저</span></div>';
  KR.$('#scopeh').innerHTML = sh;
  if (!opt.keepGrid) KR.renderGrid(KR.$('#grid'), res);
  KR.watchCount();
};
/* 입력 중인 칸이 다시 그려져도 글자 커서를 지킴 */
KR.keepFocus = function (host, fn) {
  var a = document.activeElement, id = a && host.contains(a) ? a.id : null, s = null, e = null;
  if (id && a.setSelectionRange) { try { s = a.selectionStart; e = a.selectionEnd; } catch (x) {} }
  fn();
  if (id) { var n = document.getElementById(id); if (n) { n.focus(); if (s != null) try { n.setSelectionRange(s, e); } catch (x) {} } }
};

/* ── 개수 줄이 화면 밖이면 떠다니는 선택 토글(IntersectionObserver — 스크롤에서 레이아웃 읽지 않음) ── */
KR.watchCount = function () {
  var el = KR.$('#count'), root = KR.$('#main'); if (!el || !window.IntersectionObserver) return;
  if (KR._cio && KR._cioEl === el) return; if (KR._cio) KR._cio.disconnect();
  KR._cioEl = el; KR._cio = new IntersectionObserver(function (en) { var off = !en[en.length - 1].isIntersecting; if (off !== !!KR._countOff) { KR._countOff = off; KR.renderGlob(); } }, { root: root, threshold: 0 });
  KR._cio.observe(el);
  /* 검색 칸: 결과 맨 위에서는 면, 내리면 면2 — 두 단계 */
  var top = KR.$('#band'); if (KR._tio) KR._tio.disconnect();
  KR._tio = new IntersectionObserver(function (en) { var down = !en[en.length - 1].isIntersecting; var sb = KR.$('.search'); if (sb) sb.classList.toggle('down', down); KR._down = down; }, { root: root, threshold: 0 });
  KR._tio.observe(top);
};

/* ── 전역 떠 있는 것: 검색 칸 · 선택 토글 · 숫자 배지 · 조건 손잡이 위치 ── */
KR.searchLeft = function () { var cw = S.route.name === 'search' && S.sideOpen && window.innerWidth > 900 ? 220 : 0; return cw + (window.innerWidth - cw) / 2 - (window.innerWidth > 1100 ? 150 : 0); };
KR.renderSearchBox = function () {
  if (S.imgFind) return '<div class="imgfind" id="imgfind" role="region" aria-label="사진으로 찾기" style="left:' + KR.searchLeft() + 'px"><div class="h">' + ic('img') + '사진으로 찾기<span class="r"><button type="button" class="lnk" data-act="imgfindoff">말로 찾기로</button></span></div>' +
    '<div class="b"><div class="drop" id="drop">파일을 끌어다 놓기 · 붙여넣기 (Ctrl+V) · <label class="btn" for="imgfile">파일 고르기</label><input id="imgfile" type="file" accept="image/*" class="sr" data-input="imgfile"></div><div class="note">보관함 사진에서 시작하려면 사진 창의 "비슷한 사진 찾기". 올린 사진은 보관함에 넣지 않아요.</div></div></div>';
  var ex = ['밤 역광, 택시', '창가 부드러운 빛', '네온 간판 와이드', '두 사람 오버숄더', '낮 실외 고채도'][Math.floor(Date.now() / 6000) % 5];
  return '<label class="search' + (KR._down ? ' down' : '') + '" id="sbox" style="left:' + KR.searchLeft() + 'px">' + ic('search') + '<span class="sr">장면을 말로 찾기</span><input id="q" type="search" placeholder="장면을 말로 찾기 — 예: ' + ex + '" value="' + esc(S.q) + '" data-input="q" autocomplete="off">' +
    (S.q ? '<button type="button" class="qx" data-act="qclear" aria-label="검색어 지우기">' + ic('x') + '</button>' : '') + '<span class="kbd" aria-hidden="true">/</span><button type="button" class="ib" data-act="imgfind">' + ic('img') + '사진으로 찾기</button></label>';
};
KR.renderGlob = function () {
  var g = KR.$('#glob'), h = '', onSearch = S.route.name === 'search' && !S.cmpOpen && !S.win;
  if (!KR.$('#gsearch')) g.innerHTML = '<div id="gsearch"></div><div id="gtog"></div><div id="gtl"></div>';
  /* 검색 칸: 종류(말/사진/없음)가 바뀔 때만 새로 그림 — 입력 중에는 위치·면 색만 */
  var gs = KR.$('#gsearch'), kind = !onSearch ? 'none' : S.imgFind ? 'img' : 'q' + (S.q ? '1' : '0');
  if (gs.getAttribute('data-k') !== kind) { KR.keepFocus(gs, function () { gs.innerHTML = onSearch ? KR.renderSearchBox() : ''; }); gs.setAttribute('data-k', kind); }
  else { var bx = gs.firstElementChild; if (bx) bx.style.left = KR.searchLeft() + 'px'; }
  /* 떠다니는 선택 토글 — 개수 줄이 가려지면 */
  var showTog = onSearch && S.sel.length > 0 && (KR._countOff || KR._gd) && (!S.miniHide || KR._gd);
  if (showTog) { var ss = KR.selState(); var cx = (S.sideOpen && window.innerWidth > 900 ? 220 : 0) + (window.innerWidth - (S.sideOpen && window.innerWidth > 900 ? 220 : 0)) / 2;
    h += '<div class="ftog" id="ftog" role="toolbar" aria-label="선택한 사진" style="left:' + cx + 'px"><span class="k pk" tabindex="0">' + S.sel.length + '장 선택' + KR.peek() + '</span>' +
      '<button type="button" data-act="favsel" data-drop="fav" class="' + (ss.inFav ? 'done' : '') + '" title="즐겨찾기 (F)">' + ic('fav') + '즐겨찾기</button>' +
      '<button type="button" data-act="cmpsel" data-drop="cmp" class="' + (ss.inCmp ? 'done' : '') + '" title="비교함 (C)">' + ic('cmp') + '비교함</button>' +
      '<button type="button" data-act="group" class="' + (S.groupBy ? 'on' : '') + '" aria-pressed="' + S.groupBy + '">작품별로 묶기</button>' +
      '<button type="button" data-act="clearsel" class="x">해제</button><button type="button" data-act="hidetog" class="x" aria-label="토글 숨기기 (숫자 배지로)">' + ic('x') + '</button></div>'; }
  var badge = onSearch && S.sel.length > 0 && S.miniHide && !KR._gd;
  if (badge) h += '<button type="button" class="selbadge" id="selbadge" data-act="showtog" style="bottom:' + (KR.keysBottom() + 34) + 'px" aria-label="선택 ' + S.sel.length + '장 · 눌러서 토글 펼치기">' + ic('check') + S.sel.length + '</button>';
  var keep = KR._prevGlob || {};
  KR.$('#gtog').innerHTML = h;
  KR.renderTimeline();
  /* 등장·사라짐 움직임(움직임_명세 2.4) — 바뀐 것만 */
  var ft = KR.$('#ftog');
  if (ft && !keep.tog && !KR.reduce()) ft.animate([{ transform: 'translateX(-50%) translateY(-12px)', opacity: 0 }, { transform: 'translateX(-50%)', opacity: 1 }], { duration: 160, easing: 'cubic-bezier(.2,.8,.2,1)' });
  var bd = KR.$('#selbadge'); if (bd && !keep.badge && !KR.reduce()) bd.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: 90, fill: 'backwards' });
  KR._prevGlob = { tog: !!ft, badge: !!bd };
};
/* 단축키 버튼은 타임라인 위에 8px 띄워 붙어 다님(사용자 10-21 23시) — 값은 renderTimeline이 잼 */
KR.keysBottom = function () { return KR._keysB || 58; };
})();
