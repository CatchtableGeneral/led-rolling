/* 슬라이드 10~12 — 매출액 (고가 광고 참여 매장 / 월정액 유료 매장 / 자동결제)
   공통 틀은 board.js. 숫자·그래프는 시트 데이터(일별 탭, 월별 유료 매장 수)에서 계산합니다. */
(function () {
  const B = window.Board, ORANGE = B.ORANGE, f = B.f;
  const pad = n => String(n).padStart(2, '0');
  const num = v => { if (v === '' || v == null) return null; const n = Number(String(v).replace(/[,\s%]/g, '')); return isNaN(n) ? null : n; };
  const BRAND_COUNT = 11;   // '기업' 광고 유치 수 — 시트에 없는 수동 값(브랜드 로고 개수)

  function prep(data) {
    const rows = ((data && data.rows) || []).filter(r => r && r.DATE)
      .map(r => ({ d: String(r.DATE).slice(0, 10), r })).sort((a, b) => (a.d < b.d ? -1 : 1));
    if (!rows.length) return null;
    const last = rows[rows.length - 1];
    const [Y, M, D] = last.d.split('-').map(Number);
    const days = new Date(Y, M, 0).getDate();
    const mrows = rows.filter(x => x.d.startsWith(Y + '-' + pad(M)));
    const col = name => { const a = Array(days).fill(null); mrows.forEach(x => { a[Number(x.d.slice(8, 10)) - 1] = num(x.r[name]); }); return a; };
    return { Y, M, D, days, col, last: last.r, paid: data.paid || [], updated: `${M}/${D}`,
      cats: Array.from({ length: days }, (_, i) => `${M}/${i + 1}`) };
  }

  const HEAD_C = ['도전, 성장을 이어가는', '기반을 만든다'];
  const LIST_C = ['고가 광고 참여 매장 수 (누적)', '월정액 유료 매장 수 (누적, 월 단위 집계)', '자동결제 (누적)'];
  const DESC_C = '[매출액]은 고객 만족을 위한 새로운 도전에 투자할 수 있게 하는 힘이자, 우리가 서비스를 지속적으로 이어갈 수 있게 만드는 기반이 됩니다.';

  /* 카드 4개(글자 위주) — 모든 매출액 슬라이드에서 같음 */
  function cardTexts(P) {
    const v = n => { const x = num(P.last[n]); return x == null ? '-' : f(x); };
    const cur = P.paid.find(p => p.m === `${P.Y}-${pad(P.M)}`);
    const monthly = x => (x == null ? ' 업데이트 중' : ' ' + f(x));
    const rate = num(P.last['자동결제 방문 대비 결제율%']);
    return [
      { id: 'c1a', t: '매출액' }, { id: 'c1b', t: '매월 MGM에서 공개' },
      { id: 'c2a', t: '고가 광고 참여 매장 수 (누적)' },
      { id: 'c2b', t: '', segs: [[`예약 ${v('누적 예약 고가 광고 참여 매장수')} | 대기 ${v('누적 대기 고가 광고 참여 매장수')} | 기업 ${BRAND_COUNT}`, 700]] },
      { id: 'c3a', t: '월정액 유료 매장 수 (누적)' },
      { id: 'c3b', t: '', segs: [['예약', 700], [monthly(cur && cur.res), 400]] },
      { id: 'c3c', t: '', segs: [['대기', 700], [monthly(cur && cur.wait), 400]] },
      { id: 'c4a', t: '자동결제 (누적)' },
      { id: 'c4b', t: '', segs: [['매장', 700], [` ${v('누적 캐치 자동결제 매장수')} | `, 400], ['등록', 700], [` ${v('누적 캐치 자동결제 등록수')} |`, 400]] },
      { id: 'c4c', t: '', segs: [['데일리 방문 대비 결제율', 700], [rate == null ? ' -' : ` ${(rate * 100).toFixed(1)}%`, 400]] },
    ];
  }

  /* 눈금 자동 계산: 구간 수를 정해 두고 데이터를 포함하는 가장 깔끔한 간격 */
  function niceAxis(vals, intervals, minStep) {
    const v = vals.filter(x => x != null);
    if (!v.length) return { yMin: 0, yMax: intervals * minStep, yStep: minStep };
    const lo = Math.min(...v), hi = Math.max(...v);
    const steps = []; for (let p = 0; p < 12; p++) [1, 2, 2.5, 5].forEach(m => { const s = m * Math.pow(10, p); if (Number.isInteger(s)) steps.push(s); });
    for (const st of steps) {
      if (st < minStep) continue;
      const base = Math.floor(lo / st) * st;
      if (base + st * intervals >= hi + (hi - base) * 0.04) return { yMin: base, yMax: base + st * intervals, yStep: st };
    }
    return { yMin: 0, yMax: hi, yStep: hi / intervals };
  }

  const dailyChart = (P, o) => {
    const ax = niceAxis(o.series.concat(o.goal || []), o.intervals, 1);
    const plot = o.plot, n = P.days, pitch = (plot.x1 - plot.x0 - 8) / 30;
    return B.lineChart(Object.assign({ cats: P.cats, catX: i => plot.x0 + 4 + i * pitch, rotate: true, xLabDy: 6, xLabFs: 3.6, valFs: 3.6, yLabFs: 4.4 }, o, ax));
  };

  /* 월별 유료 매장 수(예약/대기): 직전 해 12월부터 */
  function monthlyChart(P, o) {
    const months = [];
    for (let i = 0; i < o.count; i++) { const d = new Date(P.Y - 1, 11 + i, 1); months.push({ m: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: i === 0 ? `${d.getFullYear()}년 ${d.getMonth() + 1}월` : `${d.getMonth() + 1}월` }); }
    const series = months.map(mm => { const p = P.paid.find(x => x.m === mm.m); return p ? p[o.field] : null; });
    const ax = niceAxis(series, 4, 500), plot = o.plot, pitch = (o.lastX - o.firstX) / (o.count - 1);
    let s = `<rect x="${B.X(o.frame[0])}" y="${B.Y(o.frame[1])}" width="${B.L(o.frame[2] - o.frame[0])}" height="${B.L(o.frame[3] - o.frame[1])}" fill="none" stroke="#2a2a2a" stroke-width="${B.L(0.8)}"/>`;
    s += B.lineChart(Object.assign({ cats: months.map(m => m.label), catX: i => o.firstX + i * pitch, series, valFmt: v => f(v), yFmt: v => f(v),
      xLabFs: 4.2, xLabDy: 7, yLabFs: 4.4, valFs: 5, bright: v => v === ax.yMin + ax.yStep * 3 }, o, ax));
    return s;
  }

  const SLIDES = {
    ads: {
      key: 's10',
      title: P => `${P.M}월 목표달성현황 [고가 광고 참여 매장 수]`, active: 0,
      chart: P => {
        let s = dailyChart(P, { title: '예약 - 광고 참여 매장 수', tx: 424.4, ty: 151, plot: { x0: 315, x1: 534, y0: 169.4, y1: 301.5 }, series: P.col('누적 예약 고가 광고 참여 매장수'),
          intervals: 4, yFmt: v => f(v), valFmt: v => f(v) });
        s += dailyChart(P, { title: '대기 - 광고 참여 매장 수', tx: 710, ty: 151, plot: { x0: 584, x1: 812.7, y0: 169.4, y1: 301.5 }, series: P.col('누적 대기 고가 광고 참여 매장수'),
          intervals: 5, yFmt: v => f(v), valFmt: v => f(v) });
        s += B.text(980.6, 151, '브랜드(기업) 광고 유치', 10.5, '#ffffff', 'middle', 700);
        const a = window.BOARD_ASSETS && window.BOARD_ASSETS.brands;
        s += a ? `<image href="${a}" x="${B.X(849.6)}" y="${B.Y(159)}" width="${B.L(262.4)}" height="${B.L(164)}" preserveAspectRatio="xMidYMid slice"/>`
               : B.rect(849.6, 159, 262.4, 164, '#ffffff');
        return s;
      },
    },
    paid: {
      key: 's11',
      title: P => `${P.M}월 목표달성현황 [월정액 유료 매장 수]`, active: 1,
      chart: P => {
        let s = B.text(496.4, 151, '예약 - 월정액 유료매장 수 (누적)', 10.5, '#ffffff', 'middle', 700) + B.text(910, 151, '대기 - 월정액 유료매장 수 (누적)', 10.5, '#ffffff', 'middle', 700);
        s += monthlyChart(P, { field: 'res', count: 12, frame: [300, 159, 693, 323], plot: { x0: 313, x1: 682, y0: 170.3, y1: 307.6 }, firstX: 318.5, lastX: 670 });
        s += monthlyChart(P, { field: 'wait', count: 13, frame: [710, 159, 1112, 323], plot: { x0: 722, x1: 1100, y0: 170.3, y1: 307.6 }, firstX: 728, lastX: 1091 });
        return s;
      },
    },
    autopay: {
      key: 's12',
      title: P => `${P.M}월 목표달성현황 [자동결제]`, active: 2,
      chart: P => {
        let s = dailyChart(P, { title: '자동결제 매장 수', tx: 424, ty: 151, plot: { x0: 313, x1: 535, y0: 169.4, y1: 292 }, series: P.col('누적 캐치 자동결제 매장수'),
          intervals: 3, yFmt: v => f(v), valFmt: v => f(v) });
        s += dailyChart(P, { title: '자동결제 등록 수', tx: 695, ty: 151, plot: { x0: 584, x1: 806, y0: 169.4, y1: 292 }, series: P.col('누적 캐치 자동결제 등록수'),
          intervals: 3, yFmt: v => f(v), valFmt: v => f(v) });
        const rate = P.col('자동결제 방문 대비 결제율%').map(v => v == null ? null : v * 100);
        s += dailyChart(P, { title: '데일리 자동결제 방문 대비 결제율', tx: 966, ty: 151, plot: { x0: 855, x1: 1077, y0: 169.4, y1: 292 }, series: rate, goal: Array(P.days).fill(65),
          intervals: 4, yFmt: v => v + '%', valFmt: v => v.toFixed(1) + '%', legend: { x: 916, y: 318, items: [['ACTUAL', ORANGE], ['GOAL', '#b5b5b5']] } });
        return s;
      },
    },
  };

  window.renderRevenueSlide = function (name, el, logoHref, data) {
    const S = SLIDES[name], P = prep(data);
    if (!S || !P) return;
    const spec = { key: S.key, heading: HEAD_C, list: LIST_C, active: S.active, hi: S.active + 1, listBold: true, cardTexts: cardTexts(P),
      title: S.title(P), updated: `${P.updated}, 일(日) 단위 업데이트 지표`, desc: DESC_C };
    el.innerHTML = B.render(logoHref, spec, S.chart(P));
  };
  window.REVENUE_SLIDE_KEYS = Object.keys(SLIDES);
})();
