/* 창: 사진 창(간단히·상세히) · 조건 창 · 즐겨찾기 담기 F2 · 단축키 · 내보내기 · 알림 */
'use strict';
(function () {
var KR = window.KR, S = KR.S, esc = KR.esc, ic = KR.ic;

/* ── 정보 그림(정본 Detail·Tile의 그림 규칙을 그대로 옮김) ── */
function n(x) { return Math.round(x * 10) / 10; }
function circ(cx, cy, r) { return 'M' + n(cx - r) + ' ' + n(cy) + 'a' + n(r) + ' ' + n(r) + ' 0 1 0 ' + n(2 * r) + ' 0a' + n(r) + ' ' + n(r) + ' 0 1 0 ' + n(-2 * r) + ' 0Z'; }
function person(x, base, h) { var hr = h * 0.13, hy = base - h + hr, w = h * 0.22, sh = base - h * 0.66; return circ(x, hy, hr) + 'M' + n(x - w) + ' ' + n(base) + 'L' + n(x - w) + ' ' + n(sh + h * 0.12) + 'Q' + n(x - w) + ' ' + n(sh) + ' ' + n(x) + ' ' + n(sh) + 'Q' + n(x + w) + ' ' + n(sh) + ' ' + n(x + w) + ' ' + n(sh + h * 0.12) + 'L' + n(x + w) + ' ' + n(base) + 'Z'; }
function cam(x, y) { return 'M' + n(x - 4) + ' ' + n(y - 3) + 'h7v6h-7Z' + 'M' + n(x + 3) + ' ' + n(y - 1.5) + 'l3 -1.5v6l-3 -1.5Z'; }
var FRAME_FIG = [[8, 34], [16, 36], [32, 46], [46, 54], [64, 68], [92, 94], [170, 158]];
function fig(o) {
  o = Object.assign({ soft: '', grid: '', fill: '', stroke: '', dash: '', accent: '' }, o || {});
  return '<svg viewBox="0 0 64 40" aria-hidden="true" style="width:60px;height:40px;display:block"><path d="' + o.soft + '" fill="currentColor" fill-opacity=".22"/><path d="' + o.grid + '" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width=".6"/><path d="' + o.fill + '" fill="currentColor"/><path d="' + o.stroke + '" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="' + o.dash + '" fill="none" stroke="var(--kr-acc)" stroke-width="1.6" stroke-dasharray="3 2"/><path d="' + o.accent + '" fill="var(--kr-acc)"/></svg>';
}
KR.figFrame = function (v) { var i = KR.FRAME_ORDER.indexOf(v); if (i < 0) return null; var f = FRAME_FIG[i]; return fig({ fill: person(32, f[1], f[0]), stroke: i === 0 ? 'M2 36H62' : '' }); };
var ANGLES = ['하이 앵글', '로우 앵글', '더치 앵글', '탑샷', '항공 샷', '아이 레벨'];
KR.figAngle = function (v) {
  var ground = 'M4 36H60', subj = person(46, 36, 24);
  if (v === '하이 앵글') return fig({ stroke: ground, fill: subj, dash: 'M15 9L44 20', accent: cam(12, 7) });
  if (v === '로우 앵글') return fig({ stroke: ground, fill: subj, dash: 'M15 32L44 22', accent: cam(12, 33) });
  if (v === '탑샷') return fig({ stroke: ground, fill: subj, dash: 'M46 7V11', accent: cam(46, 4) });
  if (v === '항공 샷') return fig({ stroke: ground, fill: person(46, 36, 10), dash: 'M16 8L44 30', accent: 'M8 6h12l-3 4h-6Z' });
  if (v === '아이 레벨') return fig({ stroke: ground, fill: subj, dash: 'M15 17H40', accent: cam(12, 17) });
  if (v === '더치 앵글') return fig({ stroke: 'M14 10L50 4L54 30L18 36Z', fill: person(34, 34, 22) });
  return null;
};
var LENS = { '초광각·어안': 55, '광각': 38, '표준': 22, '망원': 8 };
KR.figLens = function (v) { var a = LENS[v]; if (a === undefined) return null; var L = 32, dx = Math.min(30, L * Math.tan(a * Math.PI / 180)); return fig({ soft: 'M32 36L' + n(32 - dx) + ' ' + n(36 - L) + 'L' + n(32 + dx) + ' ' + n(36 - L) + 'Z', stroke: 'M32 36L' + n(32 - dx) + ' ' + n(36 - L) + 'M32 36L' + n(32 + dx) + ' ' + n(36 - L), accent: 'M28 34h8v5h-8Z' }); };
function cell(c, r) { var w = 64 / 3, h = 40 / 3; return 'M' + n(c * w + 1) + ' ' + n(r * h + 1) + 'h' + n(w - 2) + 'v' + n(h - 2) + 'h' + n(2 - w) + 'Z'; }
KR.figComp = function (vals) {
  var o = { grid: 'M21.3 0V40M42.7 0V40M0 13.3H64M0 26.7H64', soft: '', accent: '', dash: '', fill: '', stroke: '' };
  vals.forEach(function (v) {
    if (v === '중앙 구도') o.accent += cell(1, 1);
    if (v === '좌측 집중 구도') o.soft += cell(0, 0) + cell(0, 1) + cell(0, 2);
    if (v === '우측 집중 구도') o.soft += cell(2, 0) + cell(2, 1) + cell(2, 2);
    if (v === '균형 구도') { o.soft += cell(0, 1) + cell(2, 1); o.fill += 'M28 39L32 33L36 39Z'; }
    if (v === '대칭 구도') { o.dash += 'M32 1V39'; o.soft += cell(0, 1) + cell(2, 1); }
    if (v === 'Short side' || v === '숏 사이드') { o.accent += cell(2, 1); o.stroke += 'M50 20H61M58 17L61 20L58 23'; }
  });
  return fig(o);
};
var DIR = { '역광': [32, 4, '뒤에서'], '윤곽광': [52, 5, '뒤 옆에서'], '측광': [5, 22, '옆에서'], '탑라이트': [32, 22, '위에서'], '아래쪽 조명': [32, 38, '아래에서'] };
var QUAL = { '강한 직광': '강한 빛', '부드러운 빛': '부드러운 빛', '고대비': '대비 큼', '저대비': '대비 작음' };
KR.figLight = function (vals) {
  var d = null; vals.forEach(function (v) { if (!d && DIR[v]) d = DIR[v].concat([v]); });
  if (!d) return fig({ stroke: circ(32, 22, 6), accent: cam(32, 36) });
  return fig({ stroke: circ(32, 22, 6), dash: 'M' + d[0] + ' ' + d[1] + 'L32 22', accent: circ(d[0], d[1], 3.5) + cam(32, 36) });
};
KR.lightText = function (p) { var dv = p.light.filter(function (v) { return DIR[v]; }), q = p.light.filter(function (v) { return QUAL[v]; }).map(function (v) { return QUAL[v]; }); return (dv.length ? DIR[dv[0]][2] + ' (' + dv[0] + ')' : '방향 기록 없음') + (q.length ? ' · ' + q.join(', ') : ''); };

/* ── 비슷한 사진(정본 Detail과 같은 순서 규칙: 프레임·빛 같은 것 → 프레임 같은 것 → 낱말 겹침, 다른 작품 먼저) ── */
KR.similar = function (p) {
  var d = KR.data, sim = d.filter(function (x) { return x.src !== p.src && x.frame[0] === p.frame[0] && x.light[0] === p.light[0]; });
  sim = sim.concat(d.filter(function (x) { return x.src !== p.src && sim.indexOf(x) < 0 && x.frame[0] === p.frame[0]; }));
  var words = function (x) { return [].concat(x.frame, x.light, x.tod, x.io, x.color, x.comp || []); }, mine = words(p);
  sim = sim.concat(d.filter(function (x) { return x.src !== p.src && sim.indexOf(x) < 0; }).map(function (x) { return { x: x, n: words(x).filter(function (w) { return mine.indexOf(w) >= 0; }).length }; }).filter(function (o) { return o.n > 0; }).sort(function (a, b) { return b.n - a.n; }).map(function (o) { return o.x; }));
  var seenSrc = {}; sim = sim.filter(function (x) { if (seenSrc[x.src]) return false; seenSrc[x.src] = 1; return true; });
  return sim.sort(function (a, b) { return (a.w === p.w) - (b.w === p.w); });
};
KR.sameWork = function (p) { var seen = {}; return KR.data.filter(function (x) { if (x.w !== p.w || seen[x.src]) return false; seen[x.src] = 1; return true; }).sort(function (a, b) { return a.sec - b.sec; }); };

/* ── 사진 창 ── */
KR.winList = function () { return KR.winCtx && KR.winCtx.length ? KR.winCtx : (KR.lastRes || KR.data); };
function chipsFor(p) {
  var c = [].concat(p.frame.map(function (v) { return ['frame', v]; }), p.shot.map(function (v) { return ['shot', v]; }), p.light.map(function (v) { return ['light', v]; }), p.ltype.map(function (v) { return ['ltype', v]; }), p.tod.map(function (v) { return ['tod', v]; }), p.io.map(function (v) { return ['io', v]; }), p.loc.map(function (v) { return ['loc', v]; }));
  return c.map(function (x) { return '<button type="button" class="tag" data-act="wfilter" data-f="' + x[0] + '" data-v="' + esc(x[1]) + '" title="' + esc(x[1]) + '로 검색">' + esc(x[1]) + '</button>'; }).join('') +
    (p.asp ? '<span class="tag">' + esc(p.asp) + ':1</span>' : '') + (p.fmt ? '<span class="tag">' + esc(p.fmt) + '</span>' : '') + '<span class="tag ai" title="AI가 추측한 값은 점선으로 보여요">AI 추정 · 점선</span>';
}
function people(names, role) { return (names || []).map(function (x) { return '<button type="button" data-act="person" data-n="' + esc(x) + '">' + esc(x) + '</button>'; }).join(', '); }
KR.renderWin = function () {
  var p = KR.p(S.win); if (!p) return '';
  var list = KR.winList(), at = list.findIndex(function (x) { return x.id === p.id; }), ci = S.cmp.indexOf(p.id) >= 0, fv = KR.inFav(p.id);
  var langSeg = '<span class="seg" role="group" aria-label="표시 언어"><button type="button" class="' + (S.lang !== 'en' ? 'on' : '') + '" data-act="lang" data-v="ko">한</button><button type="button" class="' + (S.lang === 'en' ? 'on' : '') + '" data-act="lang" data-v="en">EN</button></span>';
  var modeSeg = '<span class="seg" role="group" aria-label="보기"><button type="button" class="' + (S.winMode === 'simple' ? 'on' : '') + '" data-act="winmode" data-v="simple" aria-pressed="' + (S.winMode === 'simple') + '">간단히</button><button type="button" class="' + (S.winMode === 'detail' ? 'on' : '') + '" data-act="winmode" data-v="detail" aria-pressed="' + (S.winMode === 'detail') + '">상세히</button></span>';
  var dirs = (p.dir || []).join(', '), dps = (p.dp || []).join(', ');
  var refP = KR.p(S.winRef);
  var refBox = refP ? (refP.src === p.src ? '<span class="refbox on" title="검색에서 연 사진 또는 기준으로 정한 사진"><img src="' + refP.src + '" alt="">기준 사진</span>' :
    '<span class="refbox"><button type="button" class="rb" data-act="winref" title="기준 사진으로 돌아가기 (Home)"><img src="' + refP.src + '" alt="">↩ 기준 사진으로</button><button type="button" class="rs" data-act="winsetref" title="지금 사진을 기준 사진으로 정하기">이 사진을 기준으로</button></span>') : '';
  if (S.winMode === 'simple') {
    return '<div class="dim" data-act="winclose" aria-hidden="true"></div><div class="pwin" id="pwin" role="dialog" aria-modal="true" aria-label="사진 창 — ' + esc(KR.title(p) + ' ' + p.tm) + '">' +
      '<div class="head"><span class="ix">' + list.length + '장 중 ' + (at + 1) + '번째</span><button type="button" class="t" data-act="workpage" data-w="' + esc(p.w) + '" title="작품 페이지로">' + esc(KR.title(p)) + '</button><span class="yr">(' + p.y + ')</span><span>' + p.tm + '</span>' + refBox +
        '<span class="r">' + langSeg + modeSeg + '<button type="button" class="btn ic" data-act="winprev" data-hold="1" aria-label="앞 사진 (←)"' + (at <= 0 ? ' disabled' : '') + '>' + ic('arrowL') + '</button><button type="button" class="btn ic" data-act="winnext" data-hold="1" aria-label="다음 사진 (→)"' + (at >= list.length - 1 ? ' disabled' : '') + '>' + ic('arrowR') + '</button><button type="button" class="btn" data-act="winclose" aria-label="창 닫기 (Esc)">' + ic('x') + '</button></span></div>' +
      '<div class="pimg" id="pimg"><img src="' + p.src + '" alt="' + esc(KR.title(p) + ' ' + p.tm) + ' 장면" draggable="false"></div>' +
      '<button type="button" class="parr l" data-act="winprev" data-hold="1" aria-label="앞 사진 (←)"' + (at <= 0 ? ' disabled' : '') + '>' + ic('arrowL') + '</button><button type="button" class="parr r" data-act="winnext" data-hold="1" aria-label="다음 사진 (→)"' + (at >= list.length - 1 ? ' disabled' : '') + '>' + ic('arrowR') + '</button>' +
      '<div class="pfoot"><div class="l1"><span class="lt">' + esc(p.w) + '</span>' + (S.lang === 'en' ? '' : '<span class="kt">' + esc(p.wk) + '</span>') + '<span class="mute">' + p.y + '</span><span class="cr">' + (dirs ? '감독 ' + people(p.dir) : '') + (dps ? ' · 촬영 ' + people(p.dp) : '') + '</span></div>' +
        '<div class="l3">' + chipsFor(p) + '</div>' +
        '<div class="l3"><button type="button" class="btn" data-act="simfind">' + ic('search') + '비슷한 사진 찾기</button><button type="button" class="btn" data-act="workpage" data-w="' + esc(p.w) + '">이 작품의 다른 장면</button>' +
          '<button type="button" class="btn' + (fv ? ' on' : '') + '" data-act="wfav">' + ic('fav') + (fv ? '즐겨찾기 ✓' : '즐겨찾기') + ' <span class="kbd">F</span></button><button type="button" class="btn' + (ci ? ' on' : '') + '" data-act="wcmp">' + ic('cmp') + (ci ? '비교함 ✓' : '비교함') + ' <span class="kbd">C</span></button>' +
          '<button type="button" class="btn" data-act="export" data-pid="' + p.id + '">' + ic('export') + '내보내기</button><span class="sp"></span><button type="button" class="btn ghost" data-act="orig">원본 페이지 ' + ic('ext') + '</button><button type="button" class="btn" data-act="winmode" data-v="detail">상세히 →</button></div></div></div>';
  }
  /* 상세히 — 정본 '개선 2차 · 표' 구조 그대로 */
  var areas = []; (p.bins || []).forEach(function (b, i) { if (b / 255 >= 0.02) areas.push({ share: b / 255, rgb: KR.binRgb(i) }); }); areas.sort(function (a, b) { return b.share - a.share; });
  var tones = [['b', '밝기'], ['c', '대비'], ['s', '채도'], ['k', '색온도'], ['sh', '선명도']].map(function (t) {
    var T = KR.TONE[t[0]], v = p.look[t[0]], f = Math.max(0, Math.min(1, (v - T[1]) / (T[2] - T[1])));
    return '<div class="v"><div class="k"><span>' + t[1] + '</span><b>' + KR.fmt(t[0], v) + '</b></div><div class="tr' + (t[0] === 'k' ? ' kk' : '') + '"><i style="' + (t[0] === 'k' ? 'left:calc(' + (f * 100).toFixed(1) + '% - 3px)' : 'width:' + (f * 100).toFixed(1) + '%') + '"></i></div><div class="l">' + KR.word(t[0], v) + '</div></div>';
  }).join('');
  var sim = KR.similar(p), same = KR.sameWork(p), sat = same.findIndex(function (x) { return x.src === p.src; });
  /* 비슷한 사진·다른 장면: 10장씩 5열 2줄 — 누르면 그 사진으로 바뀌고 두 목록도 그 사진 기준으로 다시 셈(사용자 10-21 23시) */
  /* 비슷한 사진 첫 칸 = 바로 전에 보던 사진(사용자 10-22 "첫칸을 바로전사진으로") — 검색에서 처음 열었을 땐 없음 */
  var prevP = S.winPrev && S.winPrev !== p.id ? KR.p(S.winPrev) : null; if (prevP && prevP.src === p.src) prevP = null;
  var grid = function (arr, cur, prv) { return arr.map(function (x, gi) { var isRef = refP && x.src === refP.src, isPrev = prv && gi === 0; return '<button type="button" data-act="winpick" data-pid="' + x.id + '" class="' + (cur && x.src === p.src ? 'on' : '') + '" aria-label="' + esc(KR.title(x) + ' ' + x.tm) + (isRef ? ' (기준 사진)' : '') + (isPrev ? ' (바로 전 사진)' : '') + ' 보기"><img src="' + x.src + '" alt="" draggable="false" loading="lazy"><span class="gtm">' + x.tm + '</span>' + (isRef ? '<span class="gref">기준</span>' : '') + (isPrev ? '<span class="gprev">바로 전</span>' : '') + '</button>'; }).join(''); };
  var s0 = Math.max(0, Math.min(same.length - 10, sat - 4)), sameWin = same.slice(s0, s0 + 10);
  var pics = '';
  p.frame.forEach(function (v) { var g = KR.figFrame(v); if (g) pics += '<div class="pic"><span class="g">' + g + '</span><span class="k">프레임 크기</span><button type="button" class="v" data-act="wfilter" data-f="frame" data-v="' + esc(v) + '" style="text-align:left">' + esc(v) + '</button></div>'; });
  p.shot.filter(function (v) { return ANGLES.indexOf(v) >= 0; }).forEach(function (v) { pics += '<div class="pic"><span class="g">' + KR.figAngle(v) + '</span><span class="k">앵글</span><button type="button" class="v" data-act="wfilter" data-f="shot" data-v="' + esc(v) + '" style="text-align:left">' + esc(v) + '</button></div>'; });
  p.lsize.forEach(function (v) { var g = KR.figLens(v); if (g) pics += '<div class="pic"><span class="g">' + g + '</span><span class="k">화각</span><button type="button" class="v" data-act="wfilter" data-f="lsize" data-v="' + esc(v) + '" style="text-align:left">' + esc(v) + '</button></div>'; });
  if (p.comp.length) pics += '<div class="pic"><span class="g">' + KR.figComp(p.comp) + '</span><span class="k">구도</span><span class="v">' + esc(p.comp.map(function (c) { return c.replace(' 구도', ''); }).join(' · ')) + '</span></div>';
  pics += '<div class="pic"><span class="g">' + KR.figLight(p.light) + '</span><span class="k">빛</span><span class="v">' + esc(KR.lightText(p)) + '</span></div>';
  var tv = function (vs, f) { return vs.map(function (v) { return f ? '<button type="button" class="tag" data-act="wfilter" data-f="' + f + '" data-v="' + esc(v) + '">' + esc(v) + '</button>' : '<span class="tag">' + esc(v) + '</span>'; }).join(''); };
  var kinds = p.shot.filter(function (v) { return ANGLES.indexOf(v) < 0; });
  var tbl = '<div class="tbl">' + (kinds.length ? '<span class="k">샷 유형</span><span class="v">' + tv(kinds, 'shot') + '</span>' : '') + '<span class="k">빛과 시간</span><span class="v">' + tv(p.light, 'light') + tv(p.ltype, 'ltype') + tv(p.tod, 'tod') + '</span><span class="k">공간</span><span class="v">' + tv(p.io, 'io') + tv(p.loc, 'loc') + '</span>' +
    '<span class="k">촬영</span><span class="v">' + (p.asp ? '<span class="tag">' + esc(p.asp) + ':1</span>' : '') + (p.fmt ? '<span class="tag">' + esc(p.fmt) + '</span>' : '') + '</span><span class="k">카메라 · 렌즈</span><span class="v">' + (p.cam ? '<span class="tag">' + esc(p.cam) + '</span>' : '') + (p.lens ? '<span class="tag">' + esc(p.lens) + '</span>' : '') + '</span>' +
    '<span class="k">AI가 본 것</span><span class="v"><span class="tag ai">[AI 값 자리 — 점선 = 추정 · 신뢰도]</span></span><span class="k">파일</span><span class="v mute">[원본 파일명 · 크기]</span></div>';
  var left = S.winLeft ? '<aside class="pleft" aria-label="크레딧·정보·태그"><h5>크레딧 · 정보 · 태그 <button type="button" data-act="winleft">‹ 접기</button></h5><div class="aibox"><span class="tag ai">AI 설명 · 기본</span><br>[AI 설명 문장 — 분석하면 이 자리에 나옵니다. 점선 = AI 추정]</div>' +
    '<div class="kv"><span class="k">감독</span><span class="v">' + people(p.dir) + '</span><span class="k">촬영</span><span class="v">' + people(p.dp) + '</span>' + (p.act.length ? '<span class="k">배우</span><span class="v">' + esc(p.act.join(', ')) + '</span>' : '') + '<span class="k">장르</span><span class="v">' + esc(p.genre.join(', ')) + '</span><span class="k">연도</span><span class="v">' + p.y + '</span></div>' +
    '<h5>태그</h5><div style="display:flex;flex-wrap:wrap;gap:4px">' + p.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div></aside>' : '<div class="pside"><button type="button" class="tab" data-act="winleft" aria-expanded="false">크레딧 · 정보 · 태그</button></div>';
  var right = S.winRight ? '<aside class="rp" aria-label="연구"><h5>연구 <button type="button" data-act="winright">접기 ›</button></h5>' + pics + tbl +
    '<div class="acts2"><button type="button" class="btn' + (fv ? ' on' : '') + '" data-act="wfav">' + ic('fav') + '즐겨찾기</button><button type="button" class="btn' + (ci ? ' on' : '') + '" data-act="wcmp">' + ic('cmp') + '비교함</button><button type="button" class="btn" data-act="export" data-pid="' + p.id + '">' + ic('export') + '내보내기</button><button type="button" class="btn ghost" data-act="orig">원본 페이지 ' + ic('ext') + '</button></div></aside>' : '<div class="pside" style="border-right:0;border-left:1px solid var(--kr-line)"><button type="button" class="tab" data-act="winright" aria-expanded="false">연구</button></div>';
  return '<div class="pwin detail" id="pwin" role="dialog" aria-modal="true" aria-label="사진 창 상세히 — ' + esc(KR.title(p) + ' ' + p.tm) + '">' +
    '<div class="head"><button type="button" class="t" data-act="workpage" data-w="' + esc(p.w) + '">' + esc(KR.title(p)) + '</button><span class="yr">(' + p.y + ')</span><span>' + p.tm + '</span><span class="sub">' + (dirs ? '감독 ' + people(p.dir) : '') + (dps ? ' · 촬영 ' + people(p.dp) : '') + '</span>' + refBox +
      '<span class="r">' + langSeg + modeSeg + '<button type="button" class="btn" data-act="wsame" data-d="-1" data-hold="1"' + (sat <= 0 ? ' disabled' : '') + ' aria-label="같은 작품 앞 장면 (←)">‹ 앞 장면</button><button type="button" class="btn" data-act="wsame" data-d="1" data-hold="1"' + (sat >= same.length - 1 ? ' disabled' : '') + ' aria-label="같은 작품 뒤 장면 (→)">뒤 장면 ›</button><button type="button" class="btn" data-act="winclose">' + ic('x') + '닫기</button></span></div>' +
    '<div class="pin">' + left + '<div class="pcenter"><div class="pimg" id="pimg"><img src="' + p.src + '" alt="' + esc(KR.title(p) + ' ' + p.tm) + ' 장면" draggable="false"></div>' +
      '<div class="tonebar"><div class="h">색 분포 ' + p.color.map(function (c) { return '<b>' + esc(c) + '</b>'; }).join(' ') + '<span class="r">시안 값 — 실제 앱은 화소 기준으로 고침(개발일지 5.33)</span></div><div class="bar" role="img" aria-label="이 사진의 색 분포">' + areas.map(function (a) { return '<i style="flex:' + a.share.toFixed(3) + ';background:rgb(' + a.rgb.join(',') + ')" title="넓이 ' + Math.round(a.share * 100) + '%"></i>'; }).join('') + '</div></div>' +
      '<div class="vals">' + tones + '</div>' +
      '<div class="strips"><div><h6>비슷한 사진 — 다른 작품 먼저 <span class="hn">' + (prevP ? '첫 칸 = 바로 전 사진, 그 뒤 비슷한 9장' : '지금 사진과 비슷한 10장') + '</span><button type="button" data-act="simmore">더보기 (' + sim.length + ') ›</button></h6><div class="wgrid">' + grid(prevP ? [prevP].concat(sim.filter(function (x) { return x.src !== prevP.src && x.src !== p.src; }).slice(0, 9)) : sim.slice(0, 10), false, prevP) + '</div></div>' +
        '<div><h6>이 작품의 다른 장면 — 영화 순서 <span class="hn">' + (s0 + 1) + '–' + (s0 + sameWin.length) + ' / ' + same.length + '</span><button type="button" data-act="workpage" data-w="' + esc(p.w) + '">더보기 (' + same.length + ') ›</button></h6><div class="wgrid" id="samestrip">' + grid(sameWin, true) + '</div></div></div></div>' + right + '</div></div>';
};
/* P-06(10-22, 사용자 '3 가'): 상세히 — 창 높이가 모자라면 사진을 줄여 아래 10장 묶음 두 줄이 늘 다 보이게(최소 300px) */
KR.fitWinImg = function () {
  var pc = KR.$('.pwin.detail .pcenter'), pi = pc && pc.querySelector('.pimg'); if (!pi) return;
  pi.style.height = ''; var over = pc.scrollHeight - pc.clientHeight;
  if (over > 0) pi.style.height = Math.max(300, Math.round(pi.getBoundingClientRect().height - over - 2)) + 'px';
};
KR.openWin = function (id, from) {
  var S = KR.S; if (!KR.p(id)) return;
  var t = from || KR.$('.tile[data-pid="' + id + '"] img');
  KR._winFrom = t && t.getBoundingClientRect ? t.getBoundingClientRect() : null;
  S.win = id; S.winRef = id; S.winPrev = null; S.seen = [id].concat(S.seen.filter(function (x) { return x !== id; })).slice(0, KR.SEEN_MAX);
  KR.renderOv('winopen');
};
/* 공유 요소 전환: 격자 칸의 사진이 창 자리로 커짐(220ms), 닫으면 원래 칸으로(180ms) */
KR.winEnter = function () {
  var img = KR.$('#pimg img'), from = KR._winFrom, box = KR.$('#pwin'); KR._winFrom = null;
  if (!img || KR.reduce()) return;
  var go = function () {
    var to = img.getBoundingClientRect();
    if (box) box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'cubic-bezier(.2,.8,.2,1)' });
    if (!from || !to.width) return;
    var sx = from.width / to.width, sy = from.height / to.height;
    img.animate([{ transformOrigin: '0 0', transform: 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px) scale(' + sx + ',' + sy + ')' }, { transformOrigin: '0 0', transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };
  if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
};
KR.closeWin = function () {
  /* M-10(10-22): 상세히에서도 사진이 원래 칸(릴 위면 가운데 프레임)으로 줄어들며 돌아가게 — .pin 통째 페이드·잘림을 뺌 */
  var S = KR.S, id = S.win, img = KR.$('#pimg img'), box = KR.$('#pwin'), tile = id && (S.lp ? KR.$('#reel .rcur .rcb img') : KR.$('.tile[data-pid="' + id + '"] img'));
  var done = function () { S.win = null; KR.renderOv(); KR.renderGlob(); var t = KR.$('.tile[data-pid="' + id + '"] .tb'); if (t && !S.lp) try { t.focus({ preventScroll: true }); } catch (e) {} };
  if (!img || KR.reduce() || !box) return done();
  var a = img.getBoundingClientRect(), b = tile ? tile.getBoundingClientRect() : null, vis = b && b.width && b.bottom > 0 && b.top < innerHeight;
  if (vis) img.animate([{ transformOrigin: '0 0', transform: 'none' }, { transformOrigin: '0 0', transform: 'translate(' + (b.left - a.left) + 'px,' + (b.top - a.top) + 'px) scale(' + (b.width / a.width) + ',' + (b.height / a.height) + ')' }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
  box.classList.add('closing');
  KR.$$('.pwin > :not(.pimg):not(.pin), .pwin .pcenter > :not(.pimg), .pwin .head, .pwin .pfoot, .pwin .parr, .pwin .pside, .pwin .rp, .pwin .pleft, .pwin .tonebar, .pwin .vals, .pwin .strips').forEach(function (e) { e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }); });
  box.animate([{ backgroundColor: getComputedStyle(box).backgroundColor, borderColor: getComputedStyle(box).borderColor }, { backgroundColor: 'transparent', borderColor: 'transparent', boxShadow: 'none' }], { duration: 160, fill: 'forwards' });
  var dim = KR.$('#ov .dim'); if (dim) dim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
  setTimeout(done, 180);
};
/* 넘기기: 사진만 120ms 크로스페이드, 좌우 이동 없음 */
KR.winGo = function (id) {
  if (!id || id === KR.S.win) return; var old = KR.$('#pimg img'), oldSrc = old ? old.src : null;
  KR.S.winPrev = KR.S.win; KR.S.win = id; KR.S.seen = [id].concat(KR.S.seen.filter(function (x) { return x !== id; })).slice(0, KR.SEEN_MAX);
  var scr = {}; KR.$$('#pwin .pstrip').forEach(function (s, i) { scr[i] = s.scrollLeft; });
  var rp = KR.$('#pwin .rp'), rps = rp ? rp.scrollTop : 0;
  KR.renderOv();
  KR.$$('#pwin .pstrip').forEach(function (s, i) { if (scr[i]) s.scrollLeft = scr[i]; });
  var rp2 = KR.$('#pwin .rp'); if (rp2) rp2.scrollTop = rps;
  var cur = KR.$('#samestrip .on'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  var img = KR.$('#pimg img'); if (!img || !oldSrc || KR.reduce()) return;
  var ghost = document.createElement('img'); ghost.src = oldSrc; ghost.style.cssText = 'position:absolute;max-width:100%;max-height:100%;pointer-events:none'; ghost.alt = '';
  img.parentNode.appendChild(ghost); img.style.opacity = '0';
  var fade = function () { img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }); ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }).onfinish = function () { ghost.remove(); img.style.opacity = ''; }; };
  if (img.complete && img.naturalWidth) fade(); else { img.onload = fade; setTimeout(function () { if (ghost.isConnected) fade(); }, 300); }
};

/* ── 조건 창(색 · 밝기·색온도 · 채도·대비·선명도 · 화면 비율 · 매체) ── */
var CNAME = { color: '색 — 화면 느낌', light: '밝기 · 색온도', quality: '채도 · 대비 · 선명도', shape: '화면 비율', media: '매체' };
KR.openCond = function (kind, from) {
  var S = KR.S; if (S.cond === kind) { S.cond = null; S.draft = null; KR.render(); return; }
  var d;
  if (kind === 'color') d = { rgb: S.color ? S.color.rgb.slice() : [196, 64, 58], min: S.color ? S.color.min : 0.1 };
  else if (kind === 'shape' || kind === 'media') d = { picks: S.filters.filter(function (x) { return x.f === kind; }).map(function (x) { return x.v; }) };
  else { d = { range: false }; KR.GROUPS[kind].forEach(function (k) { var t = KR.TONE[k], cur = S.tone[k]; if (cur && cur.range) d.range = true; d[k] = cur ? Object.assign({ on: true }, cur) : { on: false, range: false, v: Math.round((t[1] + t[2]) / 2), lo: t[1], hi: t[2] }; }); }
  var hsv = kind === 'color' ? KR.rgbToHsv(d.rgb) : null; if (hsv) { d.h = hsv[0]; d.s = hsv[1]; d.v = hsv[2]; }
  S.cond = kind; S.draft = d; S.condFrom = from || 'band'; KR.render();
};
KR.condApply = function (d, kind) {
  var S = KR.S, t;
  if (kind === 'color') S.color = { rgb: d.rgb.slice(), min: d.min, w: KR.weights(d.rgb) };
  else if (kind === 'shape' || kind === 'media') S.filters = S.filters.filter(function (x) { return x.f !== kind; }).concat(d.picks.map(function (v) { return { f: kind, v: v }; }));
  else { t = Object.assign({}, S.tone); KR.GROUPS[kind].forEach(function (k) { if (d[k].on) t[k] = { range: d.range, v: d[k].v, lo: Math.min(d[k].lo, d[k].hi), hi: Math.max(d[k].lo, d[k].hi) }; else delete t[k]; }); S.tone = t; }
};
KR.condPreview = function () {
  var S = KR.S, keep = { color: S.color, tone: S.tone, filters: S.filters }; KR.condApply(S.draft, S.cond);
  var n = KR.result().length; S.color = keep.color; S.tone = keep.tone; S.filters = keep.filters; return n;
};
KR.renderCond = function () {
  var S = KR.S, k = S.cond, d = S.draft; if (!k || !d) return '';
  var body = '';
  if (k === 'color') {
    var rgb = d.rgb;
    body = '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap"><div style="display:flex;flex-direction:column;gap:10px"><div class="svbox" id="svbox" role="slider" tabindex="0" aria-label="채도와 밝기 고르기 (화살표 키)" aria-valuetext="' + KR.hex(rgb) + '" style="background-color:hsl(' + Math.round(d.h) + ',100%,50%);background-image:linear-gradient(to top,#000,rgba(0,0,0,0)),linear-gradient(to right,#fff,rgba(255,255,255,0))"><span class="dot" style="left:' + (d.s * 100).toFixed(1) + '%;top:' + ((1 - d.v) * 100).toFixed(1) + '%"></span></div>' +
      '<label class="mute" style="font-size:11px;display:flex;flex-direction:column;gap:6px">색상<input class="hue" id="hue" type="range" min="0" max="360" step="1" value="' + Math.round(d.h) + '" data-input="hue"></label></div>' +
      '<div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:12px"><div style="display:flex;align-items:center;gap:10px"><span style="width:34px;height:34px;border-radius:4px;background:' + KR.hex(rgb) + ';box-shadow:0 0 0 1px rgba(127,127,127,.5)"></span><label class="mute" style="font-size:11px;display:flex;flex-direction:column;gap:2px">색 코드<input class="hexin" id="hexin" type="text" maxlength="7" spellcheck="false" value="' + KR.hex(rgb) + '" data-input="hex"></label><button type="button" class="btn ghost" data-act="eyedrop" style="margin-left:auto" title="화면에서 색 집기">' + ic('eyedrop') + '화면에서 색 집기</button></div>' +
      '<div class="qcs" role="group" aria-label="자주 쓰는 색">' + KR.QUICK.map(function (q) { return '<button type="button" class="qc" style="background:' + q[0] + '" data-act="qc" data-v="' + q[0] + '" aria-label="' + q[1] + '" title="' + q[1] + '"></button>'; }).join('') + '</div>' +
      '<label class="mute" style="font-size:11px;display:flex;flex-direction:column;gap:6px">이 색이 사진에서 차지하는 넓이<input class="rng" id="area" type="range" min="2" max="60" step="1" value="' + Math.round(d.min * 100) + '" data-input="area"><span style="color:var(--kr-ink);font-size:12px">' + Math.round(d.min * 100) + '% 이상</span></label></div></div>';
  } else if (k === 'shape' || k === 'media') {
    var vals = k === 'media' ? KR.MEDIA : KR.valuesOf('shape'), m = KR.countsIn(KR.result(k), k);
    body = '<div style="display:flex;flex-wrap:wrap;gap:8px">' + vals.map(function (v) {
      var on = d.picks.indexOf(v) >= 0, sh = KR.SHAPES.find(function (s) { return s[0] === v; }), w = sh ? Math.min(44, Math.round(14 * sh[1])) : 0, h2 = sh ? Math.min(28, Math.round(w / sh[1])) : 0;
      return '<button type="button" class="shape-b' + (on ? ' on' : '') + '" data-act="cpick" data-v="' + esc(v) + '" aria-pressed="' + on + '">' + (k === 'shape' ? '<i style="width:' + w + 'px;height:' + h2 + 'px"></i>' : '') + '<span>' + esc(v) + ' ' + (m[v] || 0) + '</span></button>';
    }).join('') + '</div>' + (k === 'shape' ? '<p class="mute" style="margin:0;font-size:11px">원본 화면비를 표준 비율로 묶음 · 세로 사진 포함 · 표시 비율과 배치 계산용 최소 비율(.75)은 분리</p>' : '<p class="mute" style="margin:0;font-size:11px">왼쪽 조건 칸 맨 위 ‘매체’와 같은 값</p>');
  } else {
    body = KR.GROUPS[k].map(function (key) {
      var T = KR.TONE[key], r = d[key], ends = KR.TONE_ENDS[key];
      var ctl = !d.range ? '<input class="rng" type="range" min="' + T[1] + '" max="' + T[2] + '" step="' + T[3] + '" value="' + r.v + '" data-input="tv" data-k="' + key + '" aria-label="' + T[0] + '"' + (r.on ? '' : ' disabled') + '>' :
        '<span style="display:flex;gap:8px"><input class="rng" type="range" min="' + T[1] + '" max="' + T[2] + '" step="' + T[3] + '" value="' + r.lo + '" data-input="tlo" data-k="' + key + '" aria-label="' + T[0] + ' 부터"' + (r.on ? '' : ' disabled') + '><input class="rng" type="range" min="' + T[1] + '" max="' + T[2] + '" step="' + T[3] + '" value="' + r.hi + '" data-input="thi" data-k="' + key + '" aria-label="' + T[0] + ' 까지"' + (r.on ? '' : ' disabled') + '></span>';
      return '<div class="tone-r"><button type="button" class="cb' + (r.on ? ' on' : '') + '" data-act="tonetog" data-k="' + key + '" role="checkbox" aria-checked="' + r.on + '" aria-label="' + T[0] + (r.on ? ' 끄기' : ' 켜기') + '"></button><span>' + T[0] + '</span>' + ctl + '<span class="v">' + (!r.on ? '<span class="mute">안 씀</span>' : d.range ? KR.fmt(key, Math.min(r.lo, r.hi)) + '~' + KR.fmt(key, Math.max(r.lo, r.hi)) : KR.fmt(key, r.v)) + '</span><span></span><span></span><span class="w"><span>' + ends[0] + '</span><span>' + ends[1] + '</span></span></div>';
    }).join('') + '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="seg" role="group" aria-label="값 고르는 법"><button type="button" class="' + (!d.range ? 'on' : '') + '" data-act="tonerange" data-v="0">값 하나 근처</button><button type="button" class="' + (d.range ? 'on' : '') + '" data-act="tonerange" data-v="1">지정 범위</button></span><span class="mute" style="font-size:11px">분석된 사진만 걸림 · 1단계 ‘색·톤 (사진 화소)’를 돌린 사진은 화소 값으로</span></div>';
  }
  var left = window.innerWidth <= 900 ? 12 : (S.sideOpen ? 300 : 80) + (S.condFrom === 'band' && k !== 'color' ? Math.max(0, window.innerWidth - (S.sideOpen ? 300 : 80) - 560 - 280) : 0), top = '';
  /* 제안 M-12(10-22 사용자 반영): 띠에서 연 조건 창은 누른 버튼 바로 아래, 오른쪽 끝을 버튼에 맞춤 */
  var bt = S.condFrom === 'band' && window.innerWidth > 900 && KR.$('.cbtns [data-act=cond][data-k="' + k + '"]');
  if (bt) { var br = bt.getBoundingClientRect(); left = Math.max(12, Math.min(window.innerWidth - 560 - 12, Math.round(br.right - 560))); top = ';top:' + Math.round(br.bottom + 8) + 'px'; }
  return '<div class="win cwin" id="cwin" role="dialog" aria-label="' + CNAME[k] + '" style="left:' + left + 'px' + top + '">' +
    '<div class="wh2">' + CNAME[k] + '<span class="r"><button type="button" class="btn ghost" data-act="cclear">지우기</button><button type="button" class="btn ghost" data-act="cclose">닫기</button><button type="button" class="btn acc" data-act="capply">적용</button></span></div>' +
    '<div class="body">' + body + '</div><div class="foot"><span class="l" aria-live="polite">적용하면 ' + KR.condPreview() + '장</span></div></div>';
};

/* ── 즐겨찾기 담기 F2: 열리자마자 기본 목록에 담김 + 되돌리기 ── */
KR.openFav = function (ids) {
  var S = KR.S; ids = ids.filter(function (x) { return KR.p(x); }); if (!ids.length) return;
  var def = S.favLists.find(function (l) { return l.def; }) || S.favLists[0], already = ids.every(function (x) { return def.ids.indexOf(x) >= 0; });
  /* G-05: 되돌리기는 이번에 새로 들어간 사진(added)만 뺀다 — 이미 있던 사진은 그대로 */
  var added = ids.filter(function (x) { return def.ids.indexOf(x) < 0; });
  if (!already) def.ids = def.ids.concat(added);
  S.fav = { ids: ids, added: added, quick: def.id, already: already, others: false, makeDef: false, pick: null, q: '', undone: false };
  KR.saveFav(); KR.refreshMarks(); KR.render();
};
KR.renderFav = function () {
  var S = KR.S, F = S.fav; if (!F) return '';
  var ids = F.ids, ls = S.favLists, quick = ls.find(function (l) { return l.id === F.quick; }) || ls[0], ps = ids.map(KR.p).filter(Boolean);
  var h = '<div class="dim clear" data-act="favclose"></div><div class="win fwin' + (F.others ? ' wide' : '') + (F._shown ? '' : ' in') + '" id="fwin" role="dialog" aria-label="즐겨찾기에 담기">' +
    '<div class="wh2">' + ic('fav') + (F.undone ? '즐겨찾기 — 되돌렸어요' : '즐겨찾기에 담았어요') + '<span style="display:inline-flex;gap:3px;margin-left:6px">' + ps.slice(0, 4).map(function (p) { return '<img src="' + p.src + '" alt="" style="width:30px;height:20px;object-fit:cover;display:block">'; }).join('') + (ps.length > 4 ? '<span class="mute" style="font-size:11px;margin-left:2px">+' + (ps.length - 4) + '</span>' : '') + '</span><span class="r"><button type="button" class="btn ghost" data-act="favclose" aria-label="닫기">' + ic('x') + '</button></span></div><div class="body">';
  h += '<div class="okline"><span class="o">' + ic('check') + '</span><span>' + (F.undone ? '‘' + esc(quick.name) + '’에서 ' + F.added.length + '장 다시 뺐어요' : F.already ? '이미 ‘' + esc(quick.name) + '’에 ' + ids.length + '장 담겨 있어요' : '‘' + esc(quick.name) + '’에 ' + F.added.length + '장 담았어요' + (F.added.length < ids.length ? ' <span class="mute">· ' + (ids.length - F.added.length) + '장은 이미 있었음</span>' : '')) + '</span>' + (F.already ? '' : '<button type="button" class="btn" data-act="favundo">' + (F.undone ? '다시 담기' : '되돌리기') + '</button>') + '</div>';
  var pk = F.pick && ls.find(function (l) { return l.id === F.pick; });
  h += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><span class="cb' + (F.makeDef ? ' on' : '') + '" role="checkbox" tabindex="0" aria-checked="' + F.makeDef + '" data-act="favdef"></span>앞으로 기본 목록으로 설정 <span class="mute" style="font-size:11px">' + (F.makeDef && pk ? '다음부터 ‘' + esc(pk.name) + '’에 바로 담겨요' : pk ? '→ ‘' + esc(pk.name) + '’' : F.makeDef ? '다른 목록을 고르면 그 목록이 기본이 돼요' : '') + '</span></label>';
  h += '<button type="button" class="lnk" data-act="favothers" aria-expanded="' + F.others + '" style="text-align:left">' + (F.others ? '▾' : '▸') + ' 다른 목록에도 담기 <span class="mute">— 최근 쓴 목록 먼저 · 표지 카드</span></button>';
  if (F.others) {
    var q = F.q.trim(), rows = ls.filter(function (l) { return !q || l.name.indexOf(q) >= 0; });
    h += '<div class="lcards">' + rows.map(function (l) {
      var inN = ids.filter(function (x) { return l.ids.indexOf(x) >= 0; }).length, all = inN === ids.length, some = inN > 0 && !all, cov = l.ids.slice(-4).map(KR.p).filter(Boolean);
      return '<button type="button" class="lcard' + (all ? ' on' : '') + '" data-act="favtoggle" data-l="' + l.id + '" aria-pressed="' + all + '"><span class="cov">' + cov.map(function (p) { return '<img src="' + p.src + '" alt="">'; }).join('') + '</span><span class="nm"><span style="width:8px;height:8px;border-radius:50%;background:' + l.color + ';flex:none"></span>' + esc(l.name) + (l.def ? ' <span class="def">기본</span>' : '') + '</span><span class="ct"><span>' + l.ids.length + '장' + (some ? ' · 일부' : '') + '</span><span class="cb' + (all ? ' on' : '') + '" aria-hidden="true"></span></span></button>';
    }).join('') + '<button type="button" class="lcard" data-act="favnew" style="align-items:center;justify-content:center;min-height:110px;border-style:dashed;color:var(--kr-sub)">+ 새 목록</button></div>';
    h += '<div style="display:flex;gap:6px"><label class="sr" for="favq">목록 찾기</label><input id="favq" class="lfind" type="search" placeholder="목록 찾기 · 없으면 새 이름" value="' + esc(F.q) + '" data-input="favq"><button type="button" class="btn" data-act="favq">담기</button></div>';
  }
  h += '</div><div class="foot"><span class="l">F2 — 담는 즉시 저장 · 되돌리기 가능</span><button type="button" class="lnk" data-act="go" data-r="fav" style="margin-left:auto;margin-right:12px">즐겨찾기 목록 ›</button><button type="button" class="btn fill" data-act="favclose">완료</button></div></div>';
  return h;
};

/* ── 단축키 창 ── */
KR.renderKeys = function () {
  if (!KR.S.keysOpen) return '';
  var k = function (s) { return '<span class="kbd">' + s + '</span>'; };
  var rows = [['선택', k('Ctrl') + ' +클릭 · ' + k('Shift') + ' +클릭 · ' + k('X') + ' 체크'], ['즐겨찾기 담기', k('F')], ['비교함 담기', k('C')], ['나란히 보기', k('V')], ['선택 해제', k('Esc')],
    ['필름 릴', '1초 누르기 · ' + k('R') + ' · ' + k('←') + k('→') + ' 비슷한 · ' + k('↑') + k('↓') + ' 같은 작품 · ' + k('Home') + ' 처음'], ['사진 창', k('Enter') + ' 열기 · ' + k('←') + k('→') + ' 넘기기 · ' + k('Esc') + ' 닫기'],
    ['검색 칸', k('/')], ['조건 칸 접기', k('[')], ['비교함 순서', '나란히 보기에서만 · 선택 뒤 ' + k('Shift') + ' + ' + k('[') + ' ' + k(']') + ' 한 칸'], ['인스펙터', k('I') + ' (즐겨찾기·비교함)'], ['비교 띠 넘기기', '띠에 포커스 뒤 ' + k('←') + k('→')], ['이 도움말', k('?')]];
  return '<div class="dim" data-act="keys"></div><div class="win" role="dialog" aria-label="단축키" style="left:50%;top:50%;width:460px;transform:translate(-50%,-50%);animation:winInC 160ms var(--kr-ease-out) both"><div class="wh2">단축키<span class="r"><button type="button" class="btn ghost" data-act="keys">' + ic('x') + '닫기</button></span></div><div class="body" style="gap:0">' +
    rows.map(function (r) { return '<div style="display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-bottom:1px solid var(--kr-line)"><span>' + r[0] + '</span><span style="text-align:right">' + r[1] + '</span></div>'; }).join('') + '<p class="mute" style="margin:10px 0 0;font-size:11px">R·[·Shift+[ ]·I는 X5에서 더한 키(누르기·끌기 대신 쓰는 대체 입력)</p></div></div>';
};

/* ── 내보내기 창 ── */
KR.renderExport = function () {
  var E = KR.S.exp; if (!E) return '';
  var ps = E.ids.map(KR.p).filter(Boolean), over = ps.length > 20;
  return '<div class="dim" data-act="expclose"></div><div class="win" role="dialog" aria-label="내보내기" style="left:50%;top:50%;width:440px;transform:translate(-50%,-50%);animation:winInC 160ms var(--kr-ease-out) both"><div class="wh2">내보내기 · ' + Math.min(20, ps.length) + '장<span class="r"><button type="button" class="btn ghost" data-act="expclose">' + ic('x') + '닫기</button></span></div><div class="body">' +
    '<div style="display:flex;gap:4px;flex-wrap:wrap">' + ps.slice(0, 6).map(function (p) { return '<img src="' + p.src + '" alt="" style="width:96px;height:54px;object-fit:cover;display:block">'; }).join('') + (ps.length > 6 ? '<span class="mute" style="align-self:center">+' + (ps.length - 6) + '</span>' : '') + '</div>' +
    '<div class="kv"><span class="k">사진</span><span class="v">그대로 복사 · 파일명 ‘제목 (연도) - id’</span><span class="k">정보</span><span class="v">shots-info.csv (엑셀로 열림)</span><span class="k">한도</span><span class="v">한 번에 20장까지 · 보관함은 바뀌지 않음</span><span class="k">폴더</span><span class="v"><button type="button" class="btn" data-act="expfolder">폴더 고르기…</button></span></div>' +
    (over ? '<p style="margin:0;color:var(--kr-warn)">' + ps.length + '장 중 앞의 20장만 내보내요.</p>' : '') +
    '<label style="display:flex;gap:8px;align-items:center;cursor:pointer"><span class="cb' + (E.csv ? ' on' : '') + '" role="checkbox" tabindex="0" aria-checked="' + E.csv + '" data-act="expcsv"></span>정보 파일 함께 내보내기</label></div>' +
    '<div class="foot"><button type="button" class="btn ghost" data-act="expclose">취소</button><button type="button" class="btn fill" data-act="expgo">내보내기</button></div></div>';
};
KR.toast = function (t) { var S = KR.S; S.toast = t; KR.renderToast(); clearTimeout(KR._tt); KR._tt = setTimeout(function () { S.toast = ''; KR.renderToast(); }, 2600); };
KR.renderToast = function () { var h = KR.$('#toast'); if (h) h.innerHTML = KR.S.toast ? '<div class="toast" role="status">' + esc(KR.S.toast) + '</div>' : ''; };
})();
