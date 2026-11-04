/* 2p — 목표달성현황 ['예약' 전체 매장 수]
   좌표는 모두 원본 슬라이드 이미지(1197x353, 1px 테두리 포함) 픽셀 기준이고,
   그리는 순간 캔버스(3400x1000)로 환산합니다. 글자는 늘이거나 줄이지 않고 글자 크기(fs)로만 맞춥니다.
   LAYOUT 값은 원본 이미지를 렌더링해 겹쳐 보며 보정한 값입니다. */
(function () {
  const S = 3400 / 1195;                       // 원본 1px = 캔버스 2.845px
  const X = x => (x - 1) * S, Y = y => (y - 1) * S, L = v => v * S;
  const K = "'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif";
  const N = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  const ORANGE = '#FF3500', f = n => n.toLocaleString('ko-KR');

  /*LAYOUT*/
  const LAYOUT = {
    bg: '#0F2E35',
    texts: [
      { id:'conf',  t:'*Confidential', x:167, y:57,  fs:7,  fill:'#ffffff', w:400, st:'italic', ff:K },
      { id:'h1',    t:'더 많은 맛집과 함께,', x:35.00, y:122.50, fs:22.443, fill:'#ffffff', w:600, ff:K },
      { id:'h2',    t:'전략의 기틀을 세운다', x:35.00, y:148.00, fs:22.368, fill:'#ffffff', w:600, ff:K },
      { id:'l1',    t:'전사지표: ‘예약’ 전체 매장 수 (누적)', x:36.00, y:184.50, fs:13.794, fill:'#FF3500', w:700, ff:K },
      { id:'l2',    t:'아웃바운드 신규가맹 수 (누적)', x:36.00, y:208.50, fs:11.256, fill:'#5E7176', w:400, ff:K },
      { id:'l3',    t:'인바운드 신규가맹 수 (누적)', x:36.00, y:231.00, fs:11.275, fill:'#5E7176', w:400, ff:K },
      { id:'l4',    t:'해지 방어율 (월 단위 집계)', x:36.00, y:254.00, fs:11.292, fill:'#5E7176', w:400, ff:K },
      { id:'c1t', t:'‘예약’ 전체 매장 수 (누적)', x:309.00, y:48.50, fs:11.306, fill:'#FF3500', w:700, ff:K },
      { id:'c1n', t:'18,746', x:309.00, y:82.50, fs:32.185, fill:'#111111', w:700, ff:K },
      { id:'c1d', t:'전일 대비 +27', x:404.00, y:80.50, fs:8.960, fill:'#E5301A', w:400, ff:K },
      { id:'c2t', t:'아웃바운드 신규가맹 수 (누적)', x:519.00, y:48.50, fs:11.258, fill:'#222222', w:500, ff:K },
      { id:'c2n', t:'134', x:519.00, y:83.00, fs:34.857, fill:'#111111', w:700, ff:K },
      { id:'c2d', t:'전일 대비 +22', x:572.00, y:80.50, fs:8.842, fill:'#E5301A', w:400, ff:K },
      { id:'c3t', t:'인바운드 신규가맹 수 (누적)', x:730.00, y:48.50, fs:11.283, fill:'#222222', w:500, ff:K },
      { id:'c3n', t:'173', x:730.00, y:82.50, fs:33.872, fill:'#111111', w:700, ff:K },
      { id:'c3d', t:'전일 대비 +7', x:781.00, y:80.50, fs:8.853, fill:'#E5301A', w:400, ff:K },
      { id:'c4t', t:'해지 방어율', x:942.00, y:49.00, fs:11.000, fill:'#222222', w:500, ff:K },
      { id:'c4n', t:'39.6%', x:940.00, y:81.50, fs:30.239, fill:'#111111', w:700, ff:K },
      { id:'c4d', t:'전월 대비 +0.9%', x:1029.00, y:80.50, fs:8.787, fill:'#E5301A', w:400, ff:K },
      { id:'pt',  t:'10월 목표달성현황 [‘예약’ 전체 매장 수]', x:302.00, y:120.00, fs:14.963, fill:'#ffffff', w:700, ff:K },
      { id:'pu',  t:'*Last Updated 10/28, 일(日) 단위 업데이트 지표', x:540.00, y:119.50, fs:8.962, fill:'#FF3500', w:400, st:'italic', ff:K },
      { id:'pd',  t:'[‘예약’ 전체 매장 수]는 고객이 만날 수 있는 맛집의 폭이에요. 풍부한 선택지가 있을수록, 우리가 만드는 모든 경험의 깊이도 커집니다.', x:301.00, y:136.00, fs:9.996, fill:'#ffffff', w:400, ff:K },
    ],
    logo: { x:39, y:46, w:108 },
    icon: { cx:160, cy:53, r:5.5 },
    panel: { x0:254, y0:62, x1:1143, y1:334, fill:'#000000' },
    cards: [
      { x0:290, y0:24, x1:478,  y1:96, bw:4, bc:'#FF3500' },
      { x0:501, y0:24, x1:688,  y1:96, bw:3, bc:'#FFC4A9' },
      { x0:712, y0:24, x1:899,  y1:96, bw:3, bc:'#FFC4A9' },
      { x0:924, y0:24, x1:1111, y1:96, bw:3, bc:'#FFC4A9' },
    ],
    chart: { gx0:327, gx1:1110, gy0:158.5, gdy:21.43, px0:332.5, pdx:25.45, labFs:6.4, ptFs:6, yTick:[18450,18800,50], line:1.3, dot:1.7 },
  };
  /*END*/

  const pad = n => String(n).padStart(2, '0');
  const num = v => { if (v === '' || v == null) return null; const n = Number(String(v).replace(/[,\s]/g, '')); return isNaN(n) ? null : n; };
  const sign = d => (d > 0 ? '+' : '-');

  /* 시트 데이터 → 카드 값·전일 대비·이번 달 일별 계열·갱신 날짜 */
  function derive(data) {
    const rows = ((data && data.rows) || []).filter(r => r && r.DATE)
      .map(r => ({ d: String(r.DATE).slice(0, 10), r })).sort((a, b) => (a.d < b.d ? -1 : 1));
    if (!rows.length) return null;
    const last = rows[rows.length - 1], prev = rows[rows.length - 2];
    const [Y, M, D] = last.d.split('-').map(Number);
    const days = new Date(Y, M, 0).getDate();
    const mrows = rows.filter(x => x.d.startsWith(Y + '-' + pad(M)));
    const dayCard = col => {
      const cur = num(last.r[col]), pv = prev ? num(prev.r[col]) : null;
      const d = cur != null && pv != null ? cur - pv : 0;
      return { v: cur == null ? '-' : f(cur), d: d === 0 ? '전일 대비 -' : `전일 대비 ${sign(d)}${f(Math.abs(d))}` };
    };
    const rate = (data.defense || []);
    const cur = rate[M - 1], pv = M > 1 ? rate[M - 2] : null;
    const dd = cur != null && pv != null ? Math.round((cur - pv) * 1000) / 10 : 0;
    const defense = {
      v: cur == null ? '-' : (cur * 100).toFixed(1) + '%',
      d: dd === 0 ? '전월 대비 -' : `전월 대비 ${sign(dd)}${Math.abs(dd).toFixed(1)}%`,
    };
    const series = Array(days).fill(null);
    mrows.forEach(x => { series[Number(x.d.slice(8, 10)) - 1] = num(x.r['누적 예약 가맹 매장수']); });
    return { M, D, days, series,
      cards: [dayCard('누적 예약 가맹 매장수'), dayCard('누적 아웃바운드 신규 매장수'), dayCard('누적 인바운드 신규 매장수'), defense],
      updated: `${M}/${D}` };
  }

  /* 세로축: 눈금 8개(간격 7칸)로 데이터가 들어가는 가장 작은 '깔끔한' 간격 */
  function axis(vals) {
    const v = vals.filter(x => x != null);
    let lo = Math.min(...v), hi = Math.max(...v);
    const pad5 = (hi - lo) * 0.05 || Math.max(1, Math.abs(hi) * 0.001);
    lo -= pad5; hi += pad5;
    const steps = [];
    for (let p = 0; p < 12; p++) [1, 2, 2.5, 5].forEach(m => steps.push(m * Math.pow(10, p)));
    for (const st of steps) {
      if (st * 7 < hi - lo) continue;
      const base = Math.floor(lo / st) * st;
      if (base + st * 7 >= hi) return { min: base, step: st };
    }
    return { min: Math.floor(lo), step: Math.ceil((hi - lo) / 7) };
  }

  function build(logoHref, data) {
    const D = derive(data);
    if (!D) return '';
    const C = LAYOUT.chart, ax = axis(D.series), top = ax.min + ax.step * 7;
    const px = i => C.px0 + C.pdx * i;
    const py = v => C.gy0 + (top - v) / ax.step * C.gdy;
    const T = Object.fromEntries(LAYOUT.texts.map(o => [o.id, o]));
    let s = `<svg viewBox="0 0 3400 1000" xmlns="http://www.w3.org/2000/svg" style="width:3400px;height:1000px;display:block">`;
    s += `<rect width="3400" height="1000" fill="${LAYOUT.bg}"/>`;
    s += `<image href="${logoHref}" x="${X(LAYOUT.logo.x)}" y="${Y(LAYOUT.logo.y)}" width="${L(LAYOUT.logo.w)}"/>`;
    const ic = LAYOUT.icon;
    s += `<circle cx="${X(ic.cx)}" cy="${Y(ic.cy)}" r="${L(ic.r)}" fill="none" stroke="${ORANGE}" stroke-width="${L(1.2)}"/>` +
         `<path d="M${X(ic.cx - 3.4)} ${Y(ic.cy + 3.4)} L${X(ic.cx + 3.4)} ${Y(ic.cy - 3.4)}" stroke="#101010" stroke-width="${L(1.3)}"/>`;
    const p = LAYOUT.panel;
    s += `<rect x="${X(p.x0)}" y="${Y(p.y0)}" width="${L(p.x1 - p.x0)}" height="${L(p.y1 - p.y0)}" fill="${p.fill}"/>`;
    for (let k = 0; k < 8; k++) {
      const v = top - ax.step * k, y = Y(C.gy0 + C.gdy * k);
      s += `<line x1="${X(C.gx0)}" x2="${X(C.gx1)}" y1="${y}" y2="${y}" stroke="${k === 6 ? '#555555' : '#2c2c2c'}" stroke-width="${L(1.1)}"/>`;
      s += `<text x="${X(327)}" y="${y + L(C.labFs * 0.36)}" font-size="${L(C.labFs)}" fill="#d9d9d9" text-anchor="end" font-family="${N}">${f(v)}</text>`;
    }
    for (let d = 0; d < D.days; d++) {
      s += `<text x="${X(px(d))}" y="${Y(317.4)}" font-size="${L(C.labFs)}" fill="#d9d9d9" text-anchor="middle" font-family="${N}">${D.M}/${d + 1}</text>`;
    }
    const pts = D.series.map((v, i) => v == null ? null : [i, v]).filter(Boolean);
    s += `<polyline points="${pts.map(([i, v]) => `${X(px(i)).toFixed(1)},${Y(py(v)).toFixed(1)}`).join(' ')}" fill="none" stroke="${ORANGE}" stroke-width="${L(C.line)}" stroke-linejoin="round"/>`;
    pts.forEach(([i, v]) => {
      s += `<circle cx="${X(px(i))}" cy="${Y(py(v))}" r="${L(C.dot)}" fill="${ORANGE}"/>`;
      s += `<text x="${X(px(i))}" y="${Y(py(v) - 4.2)}" font-size="${L(C.ptFs)}" fill="${ORANGE}" text-anchor="middle" font-family="${N}">${f(v)}</text>`;
    });
    s += (window.Board && window.Board.figures ? window.Board.figures('s02') : '');
    // 카드 — 차트 패널 위에 겹쳐야 하므로 마지막
    LAYOUT.cards.forEach(c => {
      const h = c.bw / 2;
      s += `<rect x="${X(c.x0 + h)}" y="${Y(c.y0 + h)}" width="${L(c.x1 - c.x0 - c.bw)}" height="${L(c.y1 - c.y0 - c.bw)}" rx="${L(4)}" fill="#ffffff" stroke="${c.bc}" stroke-width="${L(c.bw)}"/>`;
    });
    const dyn = { pu: `*Last Updated ${D.updated}, 일(日) 단위 업데이트 지표`, pt: `${D.M}월 목표달성현황 [‘예약’ 전체 매장 수]` };
    LAYOUT.texts.forEach(o => {
      const m = /^c(\d)([tnd])$/.exec(o.id);
      if (m && m[2] === 'd') return;                               // 전일 대비는 숫자 뒤에 이어서 그림
      if (m && m[2] === 'n') {
        const i = +m[1] - 1, d = T['c' + m[1] + 'd'], card = D.cards[i];
        s += `<text x="${X(o.x)}" y="${Y(o.y)}" font-size="${L(o.fs)}" fill="${o.fill}" font-weight="${o.w}" font-family="${o.ff}">${card.v}` +
             `<tspan dx="${L(6.5)}" dy="${L(d.y - o.y)}" font-size="${L(d.fs)}" fill="${d.fill}" font-weight="${d.w}">${card.d}</tspan></text>`;
        return;
      }
      s += txt(Object.assign({}, o, dyn[o.id] ? { t: dyn[o.id] } : {}));
    });
    return s + '</svg>';
  }

  function txt(o) {
    return `<text x="${X(o.x)}" y="${Y(o.y)}" font-size="${L(o.fs)}" fill="${o.fill}" font-weight="${o.w}"` +
           `${o.st ? ` font-style="${o.st}"` : ''} font-family="${o.ff}">${o.t}</text>`;
  }

  window.renderStoresSlide = function (el, logoHref, data) { const h = build(logoHref, data); if (h) el.innerHTML = h; };
})();
