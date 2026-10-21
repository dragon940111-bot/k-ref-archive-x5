/* 페이지: 작품(W0 + 자세한 정보) · 사람(P0, 창작자·역할 칩) · 작가 포트폴리오 · 즐겨찾기 목록 · AI 분석 실행 */
'use strict';
(function () {
var KR = window.KR, S = KR.S, esc = KR.esc, ic = KR.ic;
function uniqSrc(list) { var s = {}; return list.filter(function (p) { if (s[p.src]) return false; s[p.src] = 1; return true; }); }
function pctOf(list, f, test) { return KR.pct(list.filter(function (p) { return (p[f] || []).some(test); }).length, list.length); }
KR.feat = function (list) {
  return [{ k: '와이드', f: 'frame', v: null, test: function (v) { return v.indexOf('와이드') >= 0; }, n: pctOf(list, 'frame', function (v) { return v.indexOf('와이드') >= 0; }) },
    { k: '부드러운 빛', f: 'light', v: '부드러운 빛', n: pctOf(list, 'light', function (v) { return v === '부드러운 빛'; }) },
    { k: '밤', f: 'tod', v: '밤', n: pctOf(list, 'tod', function (v) { return v === '밤'; }) },
    { k: '클로즈업', f: 'frame', v: null, test: function (v) { return v.indexOf('클로즈업') >= 0; }, n: pctOf(list, 'frame', function (v) { return v.indexOf('클로즈업') >= 0; }) }];
};
function featChip(ft, ctx) { return '<button type="button" class="chip" data-act="featgo" data-k="' + esc(ft.k) + '" data-ctx="' + esc(ctx) + '" title="이 조건으로 검색">' + esc(ft.k) + ' <span class="n">' + ft.n + '%</span></button>'; }
function bars(list, f, max, ctx) {
  var m = KR.countsIn(list, f), ks = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, max || 5), mx = Math.max.apply(null, ks.map(function (k) { return m[k]; }).concat([1]));
  return ks.map(function (k) { return '<button type="button" class="dbar" data-act="gofilter" data-f="' + f + '" data-v="' + esc(k) + '" data-ctx="' + esc(ctx || '') + '"><span>' + esc(k) + '</span><span class="trk"><i style="width:' + (m[k] / mx * 100).toFixed(0) + '%"></i></span><span class="v">' + KR.pct(m[k], list.length) + '%</span></button>'; }).join('');
}
function miniRows(list, k) { var host = document.createElement('div'); KR.buildRows(host, list, { k: k }); return host; }
function scenesOf(list) {
  var ps = list.slice().sort(function (a, b) { return a.sec - b.sec; }), out = [], cur = null;
  ps.forEach(function (p) { if (!cur || p.sec - cur.end > 900) { cur = { start: p.sec, end: p.sec, list: [] }; out.push(cur); } cur.list.push(p); cur.end = p.sec; });
  return out;
}
function top(list, f) { var m = KR.countsIn(list, f), ks = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }); return ks[0] || ''; }

/* ── 작품 페이지 ── */
KR.renderWork = function () {
  var w = S.route.w, info = KR.workInfo[w]; if (!info) return '<div class="page"><p style="padding:28px">작품을 찾을 수 없어요.</p></div>';
  var all = uniqSrc(info.list), uniq = all, ft = KR.feat(all), tab = S.workTab, maxS = Math.max.apply(null, all.map(function (p) { return p.sec; }));
  var rep = uniq.slice().sort(function (a, b) { return a.sec - b.sec; })[Math.floor(uniq.length / 3)] || uniq[0];
  var tabs = [['all', '모든 장면', all.length], ['wide', '와이드', ft[0].n + '%'], ['close', '클로즈업', ft[3].n + '%'], ['night', '밤', ft[2].n + '%'], ['detail', '자세한 정보', '']];
  var h = '<div class="page" id="page" data-flip-host="1"><div class="page-in">';
  h += '<div class="phead"><nav class="path" aria-label="경로"><button type="button" data-act="home">보관함</button><span>›</span><span>영화</span><span>›</span><b>' + esc(KR.workTitle(w)) + ' (' + info.y + ')</b></nav><nav class="ptabs" aria-label="작품 탭">' + tabs.map(function (t) { return '<button type="button" class="' + (tab === t[0] ? 'on' : '') + '" data-act="worktab" data-v="' + t[0] + '">' + t[1] + (t[2] !== '' ? '<span class="n">' + t[2] + '</span>' : '') + '</button>'; }).join('') + '</nav></div>';
  h += '<div class="hero"><div class="info"><span class="k">영화 · ' + info.y + ' · ' + esc(info.genre.join(', ')) + '</span><h1>' + esc(info.wk) + '</h1><span class="en">' + esc(info.w) + '</span>' +
    '<div class="cred"><span><span class="kk">감독</span>' + info.dir.map(function (n) { return '<button type="button" data-act="person" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(', ') + '</span><span><span class="kk">촬영</span>' + info.dp.map(function (n) { return '<button type="button" data-act="person" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(', ') + '</span></div>' +
    '<div class="stats"><div><button type="button" class="n num" data-act="worktab" data-v="all">' + all.length + '</button><div class="l">장 (시안 자료 — 검색의 4번 되풀이는 한 번만)</div></div><div><button type="button" class="n num" data-act="gofilter" data-f="shape" data-v="' + esc(KR.shapeOf(all[0].ar)) + '" data-ctx="w:' + esc(w) + '">' + esc(all[0].asp || '') + '</button><div class="l">화면비</div></div><div><span class="n num">' + esc((all[0].cam || '').replace(/^ARRI /, '')) + '</span><div class="l">카메라</div></div><div><span class="n num mute">[값 자리]</span><div class="l">상영 시간</div></div></div>' +
    '<span class="pnote">이 작품의 화면 — 숫자·막대·칩을 누르면 그 조건으로 검색</span><div style="display:flex;gap:4px;flex-wrap:wrap">' + ft.map(function (f) { return featChip(f, 'w:' + w); }).join('') + '</div></div>' +
    '<button type="button" class="heroimg" data-act="open" data-pid="' + rep.id + '" aria-label="대표 장면 크게 보기"><img src="' + rep.src + '" alt=""><span class="cap"><b>대표 장면</b><span class="m">' + rep.tm + ' · ' + esc([].concat(rep.frame, rep.light.slice(0, 1), rep.tod, rep.io).join(' · ')) + '</span></span></button></div>';
  /* 영화 시간 위의 장면 */
  var ticks = []; for (var i = 0; i <= 8; i++) ticks.push(KR.tmShort(maxS * i / 8));
  h += '<div class="tstripw"><div class="h"><b>영화 시간 위의 장면</b><span>점 하나 = 사진 한 장(그 장면의 색) · 끌어서 훑기 · 상영 시간 자료가 없어 마지막 장면까지로 그림 · 시안 자료 ' + uniq.length + '장</span></div>' +
    '<div class="timeband" id="timeband" data-max="' + maxS + '" role="slider" tabindex="0" aria-label="영화 시간 위의 장면 — 끌어서 훑기, ← → 로 한 장씩" aria-valuemin="0" aria-valuemax="' + maxS + '">' + uniq.map(function (p) { return '<i data-pid="' + p.id + '" style="left:' + (p.sec / maxS * 100).toFixed(2) + '%;background:' + (p.pal && p.pal[Math.min(4, p.pal.length - 1)] || '#666') + '"></i>'; }).join('') + '<span class="scrub" id="scrub"><img alt=""><span></span></span></div>' +
    '<div class="ticks">' + ticks.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div></div>';
  var list = all;
  if (tab === 'wide') list = all.filter(function (p) { return p.frame.some(function (v) { return v.indexOf('와이드') >= 0; }); });
  if (tab === 'close') list = all.filter(function (p) { return p.frame.some(function (v) { return v.indexOf('클로즈업') >= 0; }); });
  if (tab === 'night') list = all.filter(function (p) { return p.tod.indexOf('밤') >= 0; });
  if (tab === 'detail') {
    var acts = KR.uniq([].concat.apply([], uniq.map(function (p) { return p.act; })));
    h += '<div class="dgrid">' +
      '<div class="dcard"><h5>촬영 특징 · 프레이밍 <span>보관함 기준</span></h5>' + bars(all, 'frame', 6, 'w:' + w) + '</div>' +
      '<div class="dcard"><h5>조명 · 광원</h5>' + bars(all, 'light', 4, 'w:' + w) + bars(all, 'ltype', 2, 'w:' + w) + '</div>' +
      '<div class="dcard"><h5>시간대 · 실내·외 · 장소</h5>' + bars(all, 'tod', 3, 'w:' + w) + bars(all, 'io', 2, 'w:' + w) + bars(all, 'loc', 2, 'w:' + w) + '</div>' +
      '<div class="dcard"><h5>대표색 <span>누르면 그 색으로 검색</span></h5><div class="palbar">' + KR.uniq([].concat.apply([], uniq.map(function (p) { return (p.pal || []).slice(3, 6); }))).slice(0, 14).map(function (c) { return '<button type="button" data-act="colorgo" data-v="' + c + '" style="background:' + c + '" aria-label="' + c + ' 색으로 검색"></button>'; }).join('') + '</div></div>' +
      '<div class="dcard"><h5>장르 · 화면비 · 카메라 · 렌즈 · 필름</h5><div class="kv"><span class="k">장르</span><span class="v">' + esc(info.genre.join(', ')) + '</span><span class="k">화면비</span><span class="v">' + esc(all[0].asp || '') + ':1</span><span class="k">카메라</span><span class="v">' + esc(all[0].cam || '') + '</span><span class="k">렌즈</span><span class="v">' + esc(all[0].lens || '') + '</span><span class="k">필름</span><span class="v">' + esc(all[0].fmt || '') + '</span><span class="k">시대</span><span class="v mute">[값 자리]</span></div></div>' +
      '<div class="dcard"><h5>크레딧</h5><div class="kv"><span class="k">감독</span><span class="v">' + info.dir.map(function (n) { return '<button type="button" class="lnk" data-act="person" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(', ') + '</span><span class="k">촬영</span><span class="v">' + info.dp.map(function (n) { return '<button type="button" class="lnk" data-act="person" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(', ') + '</span><span class="k">출연</span><span class="v">' + acts.slice(0, 6).map(function (n) { return '<button type="button" class="lnk" data-act="person" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(', ') + '</span></div></div>' +
      '<div class="dcard"><h5>AI가 본 것 <span>점선 = 추정</span></h5><span class="tag ai">[AI 값 자리 — 단계 분석 뒤 채움]</span></div>' +
      '<div class="dcard"><h5>보관함 기준</h5><div class="kv"><span class="k">모은 장수</span><span class="v">' + all.length + '장 (시안 자료 ' + uniq.length + '장 × 4)</span><span class="k">모은 날짜</span><span class="v mute">[값 자리]</span></div></div></div>';
  } else {
    var sub = S.workSub, scenes = scenesOf(uniqSrc(list).length ? list : all), acts2 = KR.uniq([].concat.apply([], uniq.map(function (p) { return p.act; })));
    h += '<nav class="subtabs" aria-label="보기">' + [['scene', '장면별', scenes.length], ['all', '전체', list.length], ['credit', '크레딧', ''], ['cast', '출연', acts2.length], ['like', '비슷한 작품', '']].map(function (t) { return '<button type="button" class="' + (sub === t[0] ? 'on' : '') + '" data-act="worksub" data-v="' + t[0] + '">' + t[1] + (t[2] !== '' ? '<span class="n">' + t[2] + '</span>' : '') + '</button>'; }).join('') + '</nav>';
    h += '<div id="workbody"></div>';
  }
  h += '</div>';
  if (tab !== 'detail') h += '<div class="detail-card" id="dcard" role="region" aria-label="자세한 정보" style="right:' + (S.dockOpen ? 330 : 280) + 'px"><h5>자세한 정보 <span>보관함 기준 · <button type="button" class="lnk" data-act="worktab" data-v="detail">탭 열기 ›</button></span></h5><span class="mute">촬영 특징(프레이밍 · 조명 · 광원 분포, 시간대, 실내·외, 장소, 대표색) · 장르 · 화면비 · 카메라 · 렌즈 · 필름 · 크레딧 · AI가 본 것(점선) · 모은 장수와 날짜</span></div>';
  return h + '</div>';
};
KR.fillWork = function () {
  var host = KR.$('#workbody'); if (!host) return; var w = S.route.w, info = KR.workInfo[w], all = uniqSrc(info.list), tab = S.workTab, list = all;
  if (tab === 'wide') list = all.filter(function (p) { return p.frame.some(function (v) { return v.indexOf('와이드') >= 0; }); });
  if (tab === 'close') list = all.filter(function (p) { return p.frame.some(function (v) { return v.indexOf('클로즈업') >= 0; }); });
  if (tab === 'night') list = all.filter(function (p) { return p.tod.indexOf('밤') >= 0; });
  host.textContent = ''; host.className = S.line ? 'line-on' : '';
  var sub = S.workSub;
  if (sub === 'scene') {
    scenesOf(list).forEach(function (sc) {
      var d = document.createElement('section'); d.className = 'scene';
      d.innerHTML = '<div class="sh2"><button type="button" class="num" data-act="scenego" data-a="' + sc.start + '" data-b="' + sc.end + '" title="이 구간만 격자로">' + KR.tmShort(sc.start) + ' – ' + KR.tmShort(sc.end) + '</button><span class="m">' + esc([top(sc.list, 'io'), top(sc.list, 'tod')].filter(Boolean).join(' / ')) + '</span><span class="r">' + sc.list.length + '장</span></div>';
      d.appendChild(miniRows(sc.list, '~w')); host.appendChild(d);
    });
    var n = document.createElement('p'); n.className = 'pnote'; n.style.padding = '10px 28px'; n.textContent = '장면 묶음은 15분 넘게 떨어지면 나눔 · 묶음 머리줄을 누르면 그 구간만 격자로'; host.appendChild(n);
  } else if (sub === 'all') { var g = document.createElement('div'); g.className = 'pgrid'; g.appendChild(miniRows(list.slice().sort(function (a, b) { return a.sec - b.sec; }), '~w')); host.appendChild(g); }
  else if (sub === 'credit') host.innerHTML = '<div class="dgrid"><div class="dcard"><h5>크레딧</h5><div class="kv"><span class="k">감독</span><span class="v">' + info.dir.map(function (n) { return '<button type="button" class="lnk" data-act="person" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(', ') + '</span><span class="k">촬영</span><span class="v">' + info.dp.map(function (n) { return '<button type="button" class="lnk" data-act="person" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join(', ') + '</span><span class="k">미술 · 편집</span><span class="v mute">[시안 자료에 없음]</span></div></div><div class="dcard"><h5>장비</h5><div class="kv"><span class="k">카메라</span><span class="v">' + esc(all[0].cam) + '</span><span class="k">렌즈</span><span class="v">' + esc(all[0].lens) + '</span><span class="k">포맷</span><span class="v">' + esc(all[0].fmt) + '</span></div></div></div>';
  else if (sub === 'cast') { var acts = {}; all.forEach(function (p) { p.act.forEach(function (a) { acts[a] = (acts[a] || 0) + 1; }); }); host.innerHTML = '<div class="dgrid"><div class="dcard"><h5>출연 <span>나온 장면 수 (결정 B: 배우도 같은 틀)</span></h5>' + Object.keys(acts).sort(function (a, b) { return acts[b] - acts[a]; }).map(function (a) { return '<button type="button" class="dbar" data-act="person" data-n="' + esc(a) + '"><span>' + esc(a) + '</span><span class="trk"><i style="width:' + KR.pct(acts[a], all.length) + '%"></i></span><span class="v">' + acts[a] + '</span></button>'; }).join('') + '</div></div>'; }
  else if (sub === 'like') {
    var me = KR.feat(all), others = KR.works.filter(function (x) { return x !== w; }).map(function (x) { var f = KR.feat(KR.workInfo[x].list), d = 0; f.forEach(function (o, i) { d += Math.abs(o.n - me[i].n); }); return { w: x, d: d }; }).sort(function (a, b) { return a.d - b.d; });
    others.forEach(function (o) { var i = KR.workInfo[o.w], row = document.createElement('div'); row.className = 'prow'; row.innerHTML = '<div class="meta"><span class="y">' + i.y + ' · 화면 특징 차이 ' + o.d + '</span><button type="button" class="t" data-act="workpage" data-w="' + esc(o.w) + '">' + esc(KR.workTitle(o.w)) + '</button><span class="e">' + esc(i.w) + '</span><div class="chips2">' + KR.feat(i.list).slice(0, 3).map(function (f) { return '<span class="chip">' + esc(f.k) + ' <span class="n">' + f.n + '%</span></span>'; }).join('') + '</div></div><div class="pst"></div>'; var st = row.querySelector('.pst'); uniqSrc(i.list).slice(0, 4).forEach(function (p) { var t = KR.tileEl(p, { k: '~l' }); t.style.cssText = 'height:120px;width:' + Math.round(p.ar * 120) + 'px'; st.appendChild(t); }); host.appendChild(row); });
  }
};

/* ── 사람 페이지 ── */
KR.personPhotos = function (n) { return uniqSrc(KR.data.filter(function (p) { return p.dir.indexOf(n) >= 0 || p.dp.indexOf(n) >= 0 || p.act.indexOf(n) >= 0; })); };
KR.rolesOf = function (n, list) { var r = {}; list.forEach(function (p) { if (p.dir.indexOf(n) >= 0) r['감독'] = (r['감독'] || 0) + 1; if (p.dp.indexOf(n) >= 0) r['촬영'] = (r['촬영'] || 0) + 1; if (p.act.indexOf(n) >= 0) r['출연'] = (r['출연'] || 0) + 1; }); return r; };
function workRoles(n, w) { var i = KR.workInfo[w], r = []; if (i.dir.indexOf(n) >= 0) r.push('감독'); if (i.dp.indexOf(n) >= 0) r.push('촬영'); if (i.list.some(function (p) { return p.act.indexOf(n) >= 0; })) r.push('출연'); return r; }
KR.renderPerson = function () {
  var n = S.route.n, list = KR.personPhotos(n); if (!list.length) return '<div class="page"><p style="padding:28px">이 사람의 사진이 없어요.</p></div>';
  var works = KR.uniq(list.map(function (p) { return p.w; })), roles = KR.rolesOf(n, list), tab = S.personTab;
  var with_ = {}; list.forEach(function (p) { [].concat(p.dir, p.dp).forEach(function (x) { if (x !== n) with_[x] = (with_[x] || 0) + 1; }); });
  var mate = Object.keys(with_).sort(function (a, b) { return with_[b] - with_[a]; })[0];
  var rep = uniqSrc(list)[0], roleNames = Object.keys(roles), wN = {};
  works.forEach(function (w) { wN[w] = 1; });
  var h = '<div class="page" id="page"><div class="page-in">';
  h += '<div class="phead"><nav class="path" aria-label="경로"><button type="button" data-act="home">보관함</button><span>›</span><button type="button" data-act="go" data-r="portfolio">사람 · 창작자</button><span>›</span><b>' + esc(n) + '</b></nav><nav class="ptabs">' + [['works', '작품순', works.length], ['all', '모든 사진', list.length], ['cmp', '작품끼리 비교', ''], ['detail', '자세한 정보', '']].map(function (t) { return '<button type="button" class="' + (tab === t[0] ? 'on' : '') + '" data-act="persontab" data-v="' + t[0] + '">' + t[1] + (t[2] !== '' ? '<span class="n">' + t[2] + '</span>' : '') + '</button>'; }).join('') + '</nav></div>';
  h += '<div class="hero"><div class="info"><span class="k">창작자 · ' + roleNames.join(' · ') + ' — 역할 칩은 매체가 늘면 디자이너·사진가·AI 아티스트로 같은 틀(제안)</span><h1 class="pname">' + esc(n) + '</h1>' +
    '<div class="stats" style="align-items:baseline"><span><span class="n num">' + works.length + '</span> <span class="mute">개 작품</span></span><span><span class="n num">' + list.length.toLocaleString() + '</span> <span class="mute">장 (시안 자료)</span></span></div>' +
    '<div style="display:flex;gap:4px;flex-wrap:wrap">' + roleNames.map(function (r) { return '<span class="chip">' + r + ' <span class="n">' + KR.uniq(list.filter(function (p) { return (r === '감독' ? p.dir : r === '촬영' ? p.dp : p.act).indexOf(n) >= 0; }).map(function (p) { return p.w; })).length + '</span></span>'; }).join('') + (mate ? '<button type="button" class="chip" data-act="person" data-n="' + esc(mate) + '">자주 함께: ' + esc(mate) + ' <span class="n">' + KR.uniq(list.filter(function (p) { return [].concat(p.dir, p.dp).indexOf(mate) >= 0; }).map(function (p) { return p.w; })).length + '</span></button>' : '') + '</div>' +
    '<span class="pnote">[작가 소개 — 공개 포트폴리오 단계에서 창작자가 직접 씀. 개인 보관함에서는 비어 있음]</span></div>' +
    '<div style="display:flex;flex-direction:column;gap:12px"><button type="button" class="heroimg" style="width:360px;height:150px" data-act="open" data-pid="' + rep.id + '"><img src="' + rep.src + '" alt=""><span class="cap"><b>대표 장면 — ' + esc(KR.title(rep)) + '</b><span class="m">' + rep.y + ' · ' + rep.tm + '</span></span></button>' +
    '<div class="sig"><h5>작가의 시각적 특징 요약 <span style="font-weight:400">누르면 조건 검색</span></h5><div class="bar"><span>[값 자리]</span><span class="tr"></span><span class="v">—</span></div><div class="bar"><span>[값 자리]</span><span class="tr"></span><span class="v">—</span></div><span class="pnote">보관함 ' + list.length + '장을 분석한 값이 쌓이면 채움 · 지어낸 값 없음</span></div></div></div>';
  h += '<div id="personbody"></div></div></div>';
  return h;
};
KR.fillPerson = function () {
  var host = KR.$('#personbody'); if (!host) return; var n = S.route.n, list = KR.personPhotos(n), works = KR.uniq(list.map(function (p) { return p.w; })), tab = S.personTab;
  host.textContent = ''; host.className = S.line ? 'line-on' : '';
  if (tab === 'works') works.sort(function (a, b) { return Number(KR.workInfo[b].y) - Number(KR.workInfo[a].y); }).forEach(function (w) {
    var i = KR.workInfo[w], ps = list.filter(function (p) { return p.w === w; }), row = document.createElement('div'); row.className = 'prow';
    row.innerHTML = '<div class="meta"><span class="y">' + i.y + '</span><button type="button" class="t" data-act="workpage" data-w="' + esc(w) + '">' + esc(KR.workTitle(w)) + '</button><span class="e">' + esc(i.w) + ' · ' + workRoles(n, w).join(' · ') + '</span><span class="rr">' + ps.length + '장' + (i.dp.length && i.dp.indexOf(n) < 0 ? ' · 촬영 ' + esc(i.dp.join(', ')) : '') + '</span><div class="chips2">' + KR.feat(ps).slice(0, 3).map(function (f) { return featChip(f, 'w:' + w); }).join('') + '</div></div><div class="pst"></div>';
    var st = row.querySelector('.pst'); uniqSrc(ps).slice(0, 4).forEach(function (p) { var t = KR.tileEl(p, { k: '~p' }); t.style.cssText = 'height:120px;width:' + Math.round(p.ar * 120) + 'px'; st.appendChild(t); });
    var a = document.createElement('button'); a.type = 'button'; a.className = 'all'; a.setAttribute('data-act', 'workpage'); a.setAttribute('data-w', w); a.textContent = '전체 ' + ps.length + ' ›'; st.appendChild(a);
    host.appendChild(row);
  });
  else if (tab === 'all') { var g = document.createElement('div'); g.className = 'pgrid'; g.appendChild(miniRows(list, '~p')); host.appendChild(g); }
  else if (tab === 'cmp') {
    var cols = ['와이드', '부드러운 빛', '밤', '클로즈업'];
    host.innerHTML = '<div style="padding:14px 28px"><table class="airun" style="padding:0;border-collapse:collapse;width:100%;font-size:12px"><thead><tr><th style="text-align:left;padding:6px 8px;color:var(--kr-mute);font-size:11px;border-bottom:1px solid var(--kr-line)">작품</th>' + cols.map(function (c) { return '<th style="text-align:left;padding:6px 8px;color:var(--kr-mute);font-size:11px;border-bottom:1px solid var(--kr-line)">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      works.map(function (w) { var f = KR.feat(list.filter(function (p) { return p.w === w; })); return '<tr><td style="padding:8px;border-bottom:1px solid var(--kr-line)"><button type="button" class="lnk" data-act="workpage" data-w="' + esc(w) + '">' + esc(KR.workTitle(w)) + ' (' + KR.workInfo[w].y + ')</button></td>' + f.map(function (o) { return '<td style="padding:8px;border-bottom:1px solid var(--kr-line)"><span class="dbar" style="grid-template-columns:1fr 34px"><span class="trk"><i style="width:' + o.n + '%"></i></span><span class="v">' + o.n + '%</span></span></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table><p class="pnote">작품끼리 같은 잣대(보관함에 모은 사진 기준 비율)</p></div>';
  } else {
    var with_ = {}; list.forEach(function (p) { [].concat(p.dir, p.dp).forEach(function (x) { if (x !== n) with_[x] = (with_[x] || 0) + 1; }); });
    host.innerHTML = '<div class="dgrid"><div class="dcard"><h5>화면 습관 · 프레이밍</h5>' + bars(list, 'frame', 6, 'p:' + n) + '</div><div class="dcard"><h5>빛 · 시간대</h5>' + bars(list, 'light', 4, 'p:' + n) + bars(list, 'tod', 2, 'p:' + n) + '</div><div class="dcard"><h5>자주 함께한 사람</h5>' + Object.keys(with_).sort(function (a, b) { return with_[b] - with_[a]; }).map(function (x) { return '<button type="button" class="dbar" data-act="person" data-n="' + esc(x) + '"><span>' + esc(x) + '</span><span class="trk"><i style="width:' + KR.pct(with_[x], list.length) + '%"></i></span><span class="v">' + with_[x] + '</span></button>'; }).join('') + '</div></div>';
  }
};
/* ── 작가 포트폴리오(창작자 목록) ── */
KR.renderPortfolio = function () {
  var h = '<div class="page" id="page"><div class="page-in"><div class="phead"><nav class="path"><button type="button" data-act="home">보관함</button><span>›</span><b>작가 포트폴리오</b></nav></div>' +
    '<div class="hero" style="padding-bottom:0"><div class="info"><span class="k">창작자 ' + KR.peopleList.length + '명 — 지금은 보관함의 감독·촬영감독. 나중에 AI 디자이너·사진가·포스터·모션 창작자가 같은 틀로(사용자 10-21 방향)</span></div></div><div class="pcards">';
  KR.peopleList.forEach(function (n) {
    var list = uniqSrc(KR.personPhotos(n)), roles = Object.keys(KR.rolesOf(n, KR.personPhotos(n))), works = KR.uniq(list.map(function (p) { return p.w; }));
    h += '<button type="button" class="pcard" data-act="person" data-n="' + esc(n) + '"><span class="cov">' + list.slice(0, 3).map(function (p) { return '<img src="' + p.src + '" alt="" loading="lazy">'; }).join('') + '</span><span class="nm">' + esc(n) + '</span><span class="rl">' + roles.join(' · ') + ' · 작품 ' + works.length + ' · ' + KR.personPhotos(n).length + '장</span></button>';
  });
  return h + '</div></div></div>';
};

/* ── 즐겨찾기 목록 페이지 ── */
KR.favPageList = function () { var l = S.favLists.find(function (x) { return x.id === S.favList; }) || S.favLists[0]; return l ? l.ids.map(KR.p).filter(Boolean) : []; };
KR.renderFavPage = function () {
  var l = S.favLists.find(function (x) { return x.id === S.favList; }) || S.favLists[0], list = KR.favPageList(), view = KR.inspList(list), q = (S.favQ || '').trim();
  var h = '<aside class="fvl sh" aria-label="즐겨찾기 목록"><h5>즐겨찾기 목록 <button type="button" data-act="favnewl">+ 새 목록</button></h5>';
  if (S.favNewOpen) h += '<div class="newl"><label class="sr" for="favnewname">새 목록 이름</label><input id="favnewname" type="text" placeholder="새 목록 이름" maxlength="40" data-input="favnewname" value="' + esc(S.favNewName || '') + '"><button type="button" class="btn" data-act="favcreate">만들기</button></div>';
  h += '<label class="sr" for="favfind">목록 찾기</label><input id="favfind" class="find" type="search" placeholder="목록 찾기" value="' + esc(S.favQ || '') + '" data-input="favfind" style="width:100%;height:28px;background:var(--kr-panel2);border:1px solid transparent;border-radius:4px;padding:0 10px;font-size:12px">';
  S.favLists.filter(function (x) { return !q || x.name.indexOf(q) >= 0; }).forEach(function (x) { var cov = x.ids.slice(-4).map(KR.p).filter(Boolean); h += '<button type="button" class="fvcard' + (x.id === (l && l.id) ? ' on' : '') + '" data-act="favpick" data-l="' + x.id + '"><span class="cv">' + cov.map(function (p) { return '<img src="' + p.src + '" alt="">'; }).join('') + '</span><span><span class="nm" style="display:block">' + esc(x.name) + '</span><span class="ct">' + x.ids.length + '장' + (x.def ? ' · 기본' : '') + '</span></span></button>'; });
  h += '<div class="sec" style="border-top:1px solid var(--kr-line);padding-top:10px"><h5>이 목록 안에서 조건 <button type="button" data-act="favcond">' + (S.favCond ? '접기 ‹' : '펼치기 ›') + '</button></h5>';
  if (S.favCond) { var m = KR.countsIn(list, 'frame'); h += Object.keys(m).map(function (v) { var on = S.inspFilter && S.inspFilter.f === 'frame' && S.inspFilter.v === v; return '<button type="button" class="row' + (on ? ' on' : '') + '" data-act="inspf" data-f="frame" data-v="' + esc(v) + '"><span>' + esc(v) + '</span><span class="n">' + m[v] + '</span></button>'; }).join(''); var t = KR.countsIn(list, 'tod'); h += Object.keys(t).map(function (v) { var on = S.inspFilter && S.inspFilter.f === 'tod' && S.inspFilter.v === v; return '<button type="button" class="row' + (on ? ' on' : '') + '" data-act="inspf" data-f="tod" data-v="' + esc(v) + '"><span>' + esc(v) + '</span><span class="n">' + t[v] + '</span></button>'; }).join(''); }
  else h += '<p class="cp-empty">검색 화면과 같은 조건 칸이 목록 안에서도 동작 (검색의 "즐겨찾기만 보기"와 같은 상태)</p>';
  h += '</div></aside>';
  h += '<main class="fvmain" id="fvmain"><div class="fvtop sh"><nav class="path"><button type="button" data-act="home">보관함</button><span>›</span><b>즐겨찾기</b></nav><nav class="ltabs" aria-label="목록">' + S.favLists.map(function (x) { return '<button type="button" class="' + (x.id === (l && l.id) ? 'on' : '') + '" data-act="favpick" data-l="' + x.id + '">' + esc(x.name) + '<span class="n">' + x.ids.length + '</span></button>'; }).join('') + '<button type="button" data-act="favnewl">+ 새 목록</button></nav>' +
    '<span class="r"><button type="button" class="btn" data-act="export" data-ids="fav">' + ic('export') + '내보내기 (20장까지)</button><button type="button" class="btn' + (S.favManage ? ' on' : '') + '" data-act="favmanage">목록 관리</button><button type="button" class="btn" data-act="favonly">즐겨찾기만 보기</button></span></div>';
  if (S.favManage && l) h += '<div class="fvhead" style="gap:8px;flex-wrap:wrap"><label class="sr" for="favrename">목록 이름</label><input id="favrename" class="lfind" style="max-width:240px;flex:none" value="' + esc(l.name) + '" data-input="favrename"><button type="button" class="btn" data-act="favdefset"' + (l.def ? ' disabled' : '') + '>' + (l.def ? '기본 목록' : '기본 목록으로') + '</button><button type="button" class="btn' + (S.favDelConfirm ? ' warn' : '') + '" data-act="favdel">' + (S.favDelConfirm ? '한 번 더 누르면 목록이 지워져요(사진은 그대로)' : '목록 지우기') + '</button></div>';
  h += '<div class="fvhead"><b>' + esc(l ? l.name : '') + '</b><span>' + list.length + '장 · 사진마다 슬레이트 표시 = 담긴 사진 · 체크해서 여러 장 넣고 빼기</span>' + (S.inspFilter ? '<button type="button" class="chip on" data-act="inspf" data-f="' + S.inspFilter.f + '" data-v="' + esc(S.inspFilter.v) + '">' + esc(S.inspFilter.v) + '만 ×</button>' : '') + '</div>';
  var selIn = S.sel.filter(function (x) { return list.some(function (p) { return p.id === x; }); });
  if (selIn.length) h += '<div class="fvhead"><span class="selz" style="border:0;padding:0;margin:0"><span class="k">' + selIn.length + '장 선택</span><button type="button" data-act="favsel">다른 목록에도</button><button type="button" data-act="favremove">이 목록에서 빼기</button><button type="button" data-act="cmpsel">비교함에 담기</button><button type="button" class="x" data-act="clearsel">해제</button></span></div>';
  h += '<div class="grid' + (S.line ? ' line-on' : '') + '" id="favgrid" style="padding-top:4px"></div></main>';
  h += KR.renderInsp(view, 'fav');
  return h;
};
KR.fillFav = function () {
  var g = KR.$('#favgrid'); if (!g) return; var list = KR.inspList(KR.favPageList());
  g.textContent = ''; if (!list.length) { g.innerHTML = '<div class="gempty">이 목록에 사진이 없어요. 검색 화면에서 사진을 체크하고 F.</div>'; return; }
  KR.buildRows(g, list, { k: '~f' });
  KR.$$('.tile', g).forEach(function (t) { t.setAttribute('data-flip', 'f' + t.getAttribute('data-pid')); });
};

/* ── AI 분석 실행(개발판 ai-run.html을 X5 부품으로 — 시안은 실제 계산을 하지 않음) ── */
var ROWS = [['1 기본', '색·톤 (사진 화소)', '모델 없음', 1], ['1 기본', '사람 수·자세', 'RTMO-l', 1], ['1 기본', '빛 방향', '모델 없음', 1], ['1 기본', '얕은 심도', '모델 없음', 1], ['2 보강', '물체', 'OWLv2 Base', 2], ['2 보강', '깊이', 'DA V2 Base (fp32)', 2], ['3 설명', '설명 문장', '[결정 11 뒤]', 3], ['3 설명', '글자 읽기', 'Florence-2 Base', 3]];
KR.renderAi = function () {
  var A = S.aiState, st = S.aiStage, total = S.aiScope === 'first' ? 8 : 48, prog = A === 'done' ? 100 : A === 'run' ? Math.min(99, KR._aiP || 0) : 0;
  var h = '<div class="page" id="page"><div class="airun"><h1>단계 분석 실행 <small>(개발판)</small><span class="tag">데스크톱 전용 · RTX 5070</span><span class="tag ai">시안 — 실제 계산 없음</span></h1>' +
    '<p>보관함 사진을 단계별로 분석합니다. 사진과 기록은 바꾸지 않고, 보관함 폴더의 <code>ai-analysis\\</code>(분석 기록)와 <code>index\\large\\ai\\</code>(조건 색인)에만 씁니다. 모델 파일은 처음 한 번 <code>ai-models\\</code>에 받습니다.</p>' +
    '<ol><li>그래픽카드를 쓰는 다른 창(보관함 앱·탭, 게임)은 닫습니다. 모델 시험은 데스크톱(RTX 5070)에서 합니다.</li><li>‘1 기본’의 ‘색·톤 (사진 화소)’는 모델 없이 사진을 한 장씩 다시 읽어 색온도·채도·대표색을 잽니다(아주 어두운 사진 고침, 결정 12A). 그래픽카드를 쓰지 않습니다.</li><li>‘계획 보기’로 남은 사진 수와 예상 시간을 본 뒤 ‘시작’. 멈추면 그때까지 한 것은 저장되고, 다음에 이어서 합니다.</li></ol>' +
    '<div style="display:flex;gap:10px;align-items:center"><button type="button" class="btn" data-act="aiopen">보관함 폴더 열기</button><span class="sub">' + (S.aiFolder ? 'archive (시안)' : '아직 안 열림') + '</span></div>' +
    '<div class="fsrow"><fieldset><legend>범위</legend><button type="button" class="ra' + (S.aiScope === 'all' ? ' on' : '') + '" data-act="aiscope" data-v="all"><i></i>보관함 전체</button><span class="ra' + (S.aiScope === 'first' ? ' on' : '') + '"><button type="button" class="ra' + (S.aiScope === 'first' ? ' on' : '') + '" data-act="aiscope" data-v="first" style="padding:0"><i></i>처음</button><label class="sr" for="aifirst">처음 몇 장</label><input id="aifirst" type="number" min="1" value="100" style="width:56px">장만 (시험)</span></fieldset>' +
    '<fieldset><legend>단계</legend>' + [[1, '1 기본 (색·톤 (사진 화소), 사람 수·자세, 빛 방향, 얕은 심도)'], [2, '2 보강 (물체, 깊이)'], [3, '3 설명 (설명, 글자 읽기)']].map(function (x) { return '<label style="display:flex;gap:8px;align-items:center;cursor:pointer"><span class="cb' + (st[x[0]] ? ' on' : '') + '" role="checkbox" tabindex="0" aria-checked="' + !!st[x[0]] + '" data-act="aistage" data-v="' + x[0] + '"></span>' + x[1] + '</label>'; }).join('') + '</fieldset>' +
    '<fieldset><legend>모델 (10-20 결정대로)</legend><span class="sub" style="font-size:11px">사람 자세: RTMO-l · 물체: OWLv2 Base · 깊이: DA V2 Base · 설명 문장: 비어 있음(결정 11 뒤) · 글자 읽기: Florence-2 Base</span><button type="button" class="ra' + (S.aiDev === 'gpu' ? ' on' : '') + '" data-act="aidev" data-v="gpu"><i></i>그래픽카드</button><button type="button" class="ra' + (S.aiDev === 'cpu' ? ' on' : '') + '" data-act="aidev" data-v="cpu"><i></i>CPU (매우 느림)</button></fieldset></div>' +
    '<div style="display:flex;gap:8px;align-items:center"><button type="button" class="btn" data-act="aiplan"' + (S.aiFolder ? '' : ' disabled') + '>계획 보기</button><button type="button" class="btn fill" data-act="aistart"' + (S.aiFolder && A !== 'run' ? '' : ' disabled') + '>시작</button><button type="button" class="btn ghost" data-act="aistop"' + (A === 'run' ? '' : ' disabled') + '>멈추기</button><span class="sub">' + (A === 'run' ? '시안 진행 중 · ' + prog + '%' : A === 'done' ? '끝 · 시안' : A === 'plan' ? '계획만 봄' : S.aiFolder ? '준비됨' : '먼저 보관함 폴더를 엽니다') + '</span><span class="prog"><i style="width:' + prog + '%"></i></span></div>';
  if (A !== 'idle') {
    h += '<table><thead><tr><th>단계</th><th>기능</th><th>모델</th><th class="n">할 사진</th><th class="n">끝남</th><th class="n">막힘·모델 없음</th><th class="n">예상 시간</th></tr></thead><tbody>' + ROWS.map(function (r) { var on = st[r[3]], todo = on ? total : 0, done = A === 'done' && on ? total : A === 'run' && on ? Math.round(total * prog / 100) : 0; return '<tr><td>' + r[0] + (on ? '' : ' (끔)') + '</td><td>' + r[1] + '</td><td class="sub">' + r[2] + '</td><td class="n">' + (A === 'done' ? 0 : todo - done) + '</td><td class="n">' + done + '</td><td class="n">0</td><td class="n mute">[데스크톱에서 잼]</td></tr>'; }).join('') + '</tbody></table>';
    h += '<ul class="log"><li>• 계획: 할 일 ' + ROWS.filter(function (r) { return st[r[3]]; }).length * total + '건 · 예상 시간은 데스크톱 측정 뒤(시안)</li>' + (A === 'done' ? '<li class="okk">• 끝: 시안 동작 — 실제로 쓴 파일 없음</li>' : '') + '</ul>';
  }
  return h + '</div></div>';
};
})();
