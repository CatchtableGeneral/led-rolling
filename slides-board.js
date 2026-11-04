/* 슬라이드 3~9 — 목표달성현황 (아웃바운드·인바운드·해지 방어율·예약 방문·예약 등록·원격대기 방문·DUV)
   공통 틀은 board.js, 숫자·그래프는 모두 시트 데이터(일별 탭 + 해지 방어율 + 목표)에서 계산합니다. */
(function () {
  const B = window.Board, ORANGE = B.ORANGE, f = B.f;
  const pad = n => String(n).padStart(2, '0');
  const num = v => { if (v === '' || v == null) return null; const n = Number(String(v).replace(/[,\s%]/g, '')); return isNaN(n) ? null : n; };
  const sign = d => (d > 0 ? '+' : '-');

  /* 시트 데이터 → 이번 달 일별 계열, 카드 값, 목표 */
  function prep(data) {
    const rows = ((data && data.rows) || []).filter(r => r && r.DATE)
      .map(r => ({ d: String(r.DATE).slice(0, 10), r })).sort((a, b) => (a.d < b.d ? -1 : 1));
    if (!rows.length) return null;
    const last = rows[rows.length - 1], prev = rows[rows.length - 2];
    const [Y, M, D] = last.d.split('-').map(Number);
    const days = new Date(Y, M, 0).getDate();
    const mrows = rows.filter(x => x.d.startsWith(Y + '-' + pad(M)));
    const col = name => {
      const a = Array(days).fill(null);
      mrows.forEach(x => { a[Number(x.d.slice(8, 10)) - 1] = num(x.r[name]); });
      return a;
    };
    const dayCard = name => {
      const cur = num(last.r[name]), pv = prev ? num(prev.r[name]) : null, d = cur != null && pv != null ? cur - pv : 0;
      return { v: cur == null ? '-' : f(cur), d: d === 0 ? '전일 대비 -' : `전일 대비 ${sign(d)}${f(Math.abs(d))}` };
    };
    const rate = (data.defense || []), cur = rate[M - 1], pv = M > 1 ? rate[M - 2] : null;
    const dd = cur != null && pv != null ? Math.round((cur - pv) * 1000) / 10 : 0;
    const defense = { v: cur == null ? '-' : (cur * 100).toFixed(1) + '%', d: dd === 0 ? '전월 대비 -' : `전월 대비 ${sign(dd)}${Math.abs(dd).toFixed(1)}%` };
    return { M, D, days, col, dayCard, defense, goals: data.goals || {}, rates: rate,
      updated: `${M}/${D}`, cats: Array.from({ length: days }, (_, i) => `${M}/${i + 1}`) };
  }

  const HEAD_A = ['더 많은 맛집과 함께,', '전략의 기틀을 세운다'];
  const LIST_A = ['전사지표: ‘예약’ 전체 매장 수 (누적)', '아웃바운드 신규가맹 수 (누적)', '인바운드 신규가맹 수 (누적)', '해지 방어율 (월 단위 집계)'];
  const HEAD_B = ['더 많은, 더 좋은', '식사 여정을 이끈다'];
  const LIST_B = ['전사지표: 예약 방문 수 (누적)', '예약 등록 수 (누적)', '원격대기 방문 수 (누적)', 'DUV'];
  const DESC_VIS = '[예약 등록 수, 예약 방문 수]는 고객들이 캐치테이블로 예약하고(등록), 실제 식사로 이어진(방문) 횟수예요. 우리가 ‘무엇을 먹을까?’하는 여정을 주도하며 만들어낸 경험의 크기를 보여줍니다.';

  const cardsA = P => [
    Object.assign({ t: '‘예약’ 전체 매장 수 (누적)' }, P.dayCard('누적 예약 가맹 매장수')),
    Object.assign({ t: '아웃바운드 신규가맹 수 (누적)' }, P.dayCard('누적 아웃바운드 신규 매장수')),
    Object.assign({ t: '인바운드 신규가맹 수 (누적)' }, P.dayCard('누적 인바운드 신규 매장수')),
    Object.assign({ t: '해지 방어율' }, P.defense),
  ];
  const cardsB = P => [
    Object.assign({ t: '예약 방문 수 (누적)' }, P.dayCard('누적 캐치 방문수')),
    Object.assign({ t: '예약 등록 수 (누적)' }, P.dayCard('누적 캐치 등록수')),
    Object.assign({ t: '원격대기 방문 수 (누적)' }, P.dayCard('누적 원격대기 방문수')),
    Object.assign({ t: 'DUV' }, P.dayCard('DAU')),
  ];

  /* 축은 데이터(와 목표선)에 맞춰 자동 계산: 눈금 칸 수 n은 고정, 칸 간격은 깔끔한 정수로 골라 값이 잘리지 않게 함 */
  function axis(n, vals) {
    const top = Math.max(...vals.filter(v => v != null), 0) * 1.04;
    for (let p = 0; p < 12; p++) for (const m of [1, 2, 2.5, 5]) {
      const s = m * Math.pow(10, p);
      if (Number.isInteger(s) && s * n >= top) return { yMax: s * n, yStep: s };
    }
    return { yMax: top, yStep: top / n };
  }

  /* 일별 막대 차트의 공통 설정. 슬라이드마다 geometry 로 덮어씀 */
  function dailyBars(P, o) {
    const ax = axis(o.n, o.series.concat(o.goalVals || []));
    return B.bars(Object.assign({
      cats: P.cats, yFmt: v => f(v), valFmt: v => f(v),
      gridColor: v => ((o.brightFn ? o.brightFn(v, ax) : Math.abs(v - ax.yMax * 0.75) < 1e-6) ? '#bdbdbd' : '#2a2a2a'),
    }, o.geo, ax, { series: o.series, goal: o.goal, legend: o.legend, valPos: o.valPos, valFs: o.valFs }));
  }

  const GEO_A = { x0: 336.7, pitch: 24.76, barW: 15, zeroY: 291, topY: 157, gx0: 326, gx1: 1098.6, yLabX: 321, yLabFs: 5.8,
    xLabY: 302.8, xLabFs: 5.9, valFs: 7 };
  const GEO_B = { x0: 351.5, pitch: 24.56, barW: 15.2, zeroY: 291, topY: 153.5, gx0: 343.6, gx1: 1100, yLabX: 339, yLabFs: 5.8,
    xLabY: 302.8, xLabFs: 5.9 };
  const LEG = (items, x) => ({ x, y: 315.8, fs: 7.2, cw: 4.9, items });

  const SLIDES = {
    outbound: {
      key: 's03', head: HEAD_A, list: LIST_A, active: 1, cards: cardsA,
      title: P => `${P.M}월 목표달성현황 [아웃바운드 신규 가맹 수]`,
      desc: '[아웃바운드 신규매장 수]는 우리가 먼저 찾아가 설득해 함께하게 된 신규 매장의 수예요. 직접 만든 성장의 결과로, 우리의 실행력이 담겨 있습니다.',
      chart: P => dailyBars(P, { n: 4, series: P.col('누적 아웃바운드 신규 매장수'), geo: GEO_A, valPos: 'center', valFs: 7,
        legend: LEG([['ACTUAL', ORANGE], ['GOAL', '#bdbdbd', 'dot']], 669) }),
    },
    inbound: {
      key: 's04', head: HEAD_A, list: LIST_A, active: 2, cards: cardsA,
      title: P => `${P.M}월 목표달성현황 [인바운드 신규 가맹 수]`,
      desc: '[인바운드 신규매장 수]는 먼저 찾아와 도입을 결정한 신규 매장의 수예요. 우리가 만드는 캐치테이블의 브랜드 신뢰와 인지도를 보여주는 자발적 성장의 지표입니다.',
      chart: P => dailyBars(P, { n: 4, series: P.col('누적 인바운드 신규 매장수'), geo: GEO_A, valPos: 'center', valFs: 7,
        legend: LEG([['ACTUAL', ORANGE], ['GOAL', '#bdbdbd', 'dot']], 669) }),
    },
    defense: {
      key: 's05', head: HEAD_A, list: LIST_A, active: 3, cards: cardsA, weekly: true,
      title: P => `${P.M}월 목표달성현황 [해지 방어율]`,
      desc: '[해지 방어율]은 가맹 해지를 원하는 매장을 얼마나 잘 지켜내고 있는지를 보여주는 지표예요. 안정적인 매장 수 성장을 지속시키는 기반이 됩니다.',
      chart: P => { const rs = Array.from({ length: 12 }, (_, i) => (P.rates[i] == null ? null : P.rates[i] * 100)), ax = axis(4, rs); return B.bars({
        cats: Array.from({ length: 12 }, (_, i) => `${i + 1}월`), x0: 364.5, pitch: 63.97, barW: 41, zeroY: 290, topY: 153,
        gx0: 346, gx1: 1100, yLabX: 338, yLabFs: 5.4, xLabY: 302.8, xLabFs: 5.2, yMax: ax.yMax, yStep: ax.yStep,
        yFmt: v => v + '%', valFmt: v => v.toFixed(1) + '%', valPos: 'center', valFs: 6.2, gridColor: v => (Math.abs(v - ax.yMax * 0.75) < 1e-6 ? '#bdbdbd' : '#2a2a2a'),
        series: rs,
        goal: { values: Array(12).fill(50), line: true, labels: 'all', fs: 5.4, dy: 4, r: 1.3, fmt: v => v + '%' },
        legend: LEG([['방어율(%)', ORANGE], ['GOAL(%)', '#bdbdbd', 'dot']], 665),
      }); },
    },
    visits: {
      key: 's06', head: HEAD_B, list: LIST_B, active: 0, cards: cardsB,
      title: P => `${P.M}월 목표달성현황 [예약 방문 수]`, desc: DESC_VIS,
      chart: P => dailyBars(P, { n: 4, series: P.col('누적 캐치 방문수'), goalVals: P.goals.visits, geo: GEO_B, valPos: 'base', valFs: 4.4,
        goal: { values: P.goals.visits || [], line: true, labels: 'all', fs: 4.4, dy: 3.2 }, legend: LEG([['ACTUAL', ORANGE], ['GOAL', '#bdbdbd', 'dot']], 669) }),
    },
    regs: {
      key: 's07', head: HEAD_B, list: LIST_B, active: 1, cards: cardsB,
      title: P => `${P.M}월 목표달성현황 [예약 등록 수]`, desc: DESC_VIS,
      chart: P => dailyBars(P, { n: 4, series: P.col('누적 캐치 등록수'), geo: GEO_B, valPos: 'base', valFs: 4.4,
        legend: LEG([['ACTUAL', ORANGE]], 685) }),
    },
    remote: {
      key: 's08', head: HEAD_B, list: LIST_B, active: 2, cards: cardsB,
      title: P => `${P.M}월 목표달성현황 [원격대기 방문 수]`,
      desc: '[원격대기 방문 수]는 캐치테이블 원격대기를 통해 실제 방문까지 이어진 누적 수예요. ‘줄 서는 경험’도 우리 안에서 더 편하게 바뀌고 있다는 걸 보여줍니다.',
      chart: P => dailyBars(P, { brightFn: (v, ax) => v > 0 && Math.round(v / ax.yStep) % 2 === 0, n: 6, series: P.col('누적 원격대기 방문수'), goalVals: P.goals.remote, geo: Object.assign({}, GEO_B, { topY: 155 }), valPos: 'base', valFs: 4.4,
        goal: { values: P.goals.remote || [], line: true, labels: 'all', fs: 4.4, dy: 3.2 }, legend: LEG([['ACTUAL', ORANGE], ['GOAL', '#bdbdbd', 'dot']], 669) }),
    },
    duv: {
      key: 's09', head: HEAD_B, list: LIST_B, active: 3, cards: cardsB,
      title: P => `${P.M}월 목표달성현황 [DUV]`,
      desc: '[Daily Unique Visitors]는 매일 캐치테이블을 찾아와 ‘무엇을 먹을까?’를 시작하는 고객의 수예요. 더 편리하고 즐거운 사용 경험을 만들수록 이 수치는 커집니다.',
      chart: P => dailyBars(P, { n: 4, series: P.col('DAU'), goalVals: Array(P.days).fill(668000), geo: Object.assign({}, GEO_B, { topY: 154.5 }), valPos: 'center', valFs: 4.4,
        goal: { values: Array(P.days).fill(668000), line: true, labels: 'last', fs: 4.6, dy: 3.2, r: 0.9, w: 0.7 }, legend: LEG([['DUV', ORANGE], ['GOAL', '#bdbdbd', 'dot']], 681) }),
    },
  };

  window.renderBoardSlide = function (name, el, logoHref, data) {
    const S = SLIDES[name], P = prep(data);
    if (!S || !P) return;
    const spec = { key: S.key, heading: S.head, list: S.list, active: S.active, cards: S.cards(P),
      title: S.title(P), updated: `${P.updated}, ${S.weekly ? '주(週)' : '일(日)'} 단위 업데이트 지표`, desc: S.desc };
    el.innerHTML = B.render(logoHref, spec, S.chart(P));
  };
  window.BOARD_SLIDE_KEYS = Object.keys(SLIDES);
})();
