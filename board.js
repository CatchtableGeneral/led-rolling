/* 공통 대시보드 틀 (슬라이드 2~12) — 좌측 로고·문구·목록, 상단 카드 4개, 검은 패널.
   좌표는 원본 슬라이드 이미지(1195x351 안쪽 영역) 픽셀 기준이며, 그리는 순간 3400x1000 캔버스로 환산합니다.
   글자는 늘이거나 줄이지 않고 글자 크기(fs)로만 맞춥니다. 슬라이드별 글자 위치 보정값은 layouts.js 에 있습니다. */
(function () {
  const S = 3400 / 1195;
  const X = x => (x - 1) * S, Y = y => (y - 1) * S, L = v => v * S;
  const K = "'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif";
  const N = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  const ORANGE = '#FF3500', BG = '#0F2E35';
  const f = n => Math.round(n).toLocaleString('ko-KR');
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* 모든 슬라이드 공통 도형 */
  const BASE = {
    logo: { x: 39, y: 46, w: 108 },
    icon: { cx: 160, cy: 53, r: 5.5 },
    panel: { x0: 254, y0: 62, x1: 1143, y1: 334 },
    cards: [
      { x0: 290, y0: 24, x1: 478, y1: 96, bw: 4, bc: ORANGE },
      { x0: 501, y0: 24, x1: 688, y1: 96, bw: 3, bc: '#FFC4A9' },
      { x0: 712, y0: 24, x1: 899, y1: 96, bw: 3, bc: '#FFC4A9' },
      { x0: 924, y0: 24, x1: 1111, y1: 96, bw: 3, bc: '#FFC4A9' },
    ],
  };

  /* 글자 기본 위치(슬라이드 2에서 맞춘 값). 슬라이드별로 layouts.js 의 보정값이 덮어씀 */
  const T0 = {
    conf: { x: 167, y: 57, fs: 6.6, fill: '#ffffff', w: 400, st: 'italic', ff: K },
    h1: { x: 35, y: 122.5, fs: 22.4, fill: '#ffffff', w: 600, ff: K },
    h2: { x: 35, y: 148, fs: 22.4, fill: '#ffffff', w: 600, ff: K },
    l1: { x: 36, y: 184.5, fs: 13.8, fill: '#78888C', w: 700, ff: K },
    l2: { x: 36, y: 208.5, fs: 11.3, fill: '#5E7176', w: 400, ff: K },
    l3: { x: 36, y: 231, fs: 11.3, fill: '#5E7176', w: 400, ff: K },
    l4: { x: 36, y: 254, fs: 11.3, fill: '#5E7176', w: 400, ff: K },
    c1t: { x: 309, y: 48.5, fs: 11.3, fill: ORANGE, w: 700, ff: K },
    c1n: { x: 309, y: 82.5, fs: 32.2, fill: '#111111', w: 700, ff: K },
    c1d: { x: 404, y: 80.5, fs: 9, fill: '#E5301A', w: 400, ff: K },
    c2t: { x: 519, y: 48.5, fs: 11.3, fill: '#222222', w: 500, ff: K },
    c2n: { x: 519, y: 83, fs: 34.9, fill: '#111111', w: 700, ff: K },
    c2d: { x: 572, y: 80.5, fs: 8.8, fill: '#E5301A', w: 400, ff: K },
    c3t: { x: 730, y: 48.5, fs: 11.3, fill: '#222222', w: 500, ff: K },
    c3n: { x: 730, y: 82.5, fs: 33.9, fill: '#111111', w: 700, ff: K },
    c3d: { x: 781, y: 80.5, fs: 8.9, fill: '#E5301A', w: 400, ff: K },
    c4t: { x: 942, y: 49, fs: 11, fill: '#222222', w: 500, ff: K },
    c4n: { x: 940, y: 81.5, fs: 30.2, fill: '#111111', w: 700, ff: K },
    c4d: { x: 1029, y: 80.5, fs: 8.8, fill: '#E5301A', w: 400, ff: K },
    c1a: { x: 307, y: 45, fs: 8.4, fill: ORANGE, w: 700, ff: K },
    c1b: { x: 307, y: 68.5, fs: 11, fill: '#111111', w: 700, ff: K },
    c2a: { x: 518, y: 45, fs: 8.4, fill: '#222222', w: 400, ff: K },
    c2b: { x: 518, y: 67.5, fs: 10, fill: '#111111', w: 700, ff: K },
    c3a: { x: 729, y: 45, fs: 8.4, fill: '#222222', w: 400, ff: K },
    c3b: { x: 729, y: 61, fs: 10, fill: '#111111', w: 400, ff: K },
    c3c: { x: 729, y: 77, fs: 10, fill: '#111111', w: 400, ff: K },
    c4a: { x: 940, y: 45, fs: 8.4, fill: '#222222', w: 400, ff: K },
    c4b: { x: 940, y: 63.5, fs: 10, fill: '#111111', w: 400, ff: K },
    c4c: { x: 940, y: 77, fs: 10, fill: '#111111', w: 400, ff: K },
    pt: { x: 302, y: 120, fs: 15, fill: '#ffffff', w: 700, ff: K },
    pu: { x: 571, y: 119, fs: 9.5, fill: ORANGE, w: 700, st: 'italic', ff: K },
    pd: { x: 302, y: 136, fs: 9, fill: '#ffffff', w: 400, ff: K },
  };

  /* spec → 글자 목록. spec: {heading:[a,b], list:[..], active:i, cards:[{t,v,d}|…], title, updated, desc, key} */
  function texts(spec) {
    const ovr = (window.LAYOUT_OVR && window.LAYOUT_OVR[spec.key]) || {};
    const out = [];
    const add = (id, t, extra) => {
      const base = Object.assign({}, T0[id] || {}, ovr[id] || {}, extra || {});
      out.push(Object.assign({ id, t }, base));
    };
    add('conf', '*Confidential');
    add('h1', spec.heading[0]); add('h2', spec.heading[1]);
    (spec.list || []).forEach((t, i) => {
      const id = 'l' + (i + 1);
      const isActive = i === spec.active;
      add(id, t, Object.assign(spec.listBold ? { w: 700, fill: '#78888C', fs: 11.5 } : {}, isActive ? { fill: ORANGE, w: 700 } : {}));
    });
    (spec.cardTexts || []).forEach(c => add(c.id, c.t, c.segs ? { segs: c.segs } : {}));
    (spec.cards || []).forEach((c, i) => {
      const k = 'c' + (i + 1);
      if (c.v != null) { add(k + 't', c.t, i === 0 ? { fill: ORANGE, w: 700 } : {}); add(k + 'n', c.v); add(k + 'd', c.d); }
      else (c.lines || []).forEach(ln => add(ln.id, ln.t, ln.extra));      // 글자만 있는 카드(10~12번)
    });
    add('pt', spec.title); add('pu', '*Last Updated ' + spec.updated); add('pd', spec.desc);
    return out;
  }

  function txt(o) {
    const body = o.segs ? o.segs.map(([t, w]) => `<tspan font-weight="${w}">${esc(t)}</tspan>`).join('') : esc(o.t);
    return `<text x="${X(o.x)}" y="${Y(o.y)}" font-size="${L(o.fs)}" fill="${o.fill}" font-weight="${o.w}"` +
      `${o.st ? ` font-style="${o.st}"` : ''} font-family="${o.ff}">${body}</text>`;
  }

  /* 사람 일러스트(원본 슬라이드의 그림). 10번은 여성만, 12번은 없음 */
  function figures(key) {
    const A = window.BOARD_ASSETS || {};
    const one = a => a && a.href ? `<image href="${a.href}" x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" preserveAspectRatio="none"/>` : '';
    return (key === 's12' ? '' : one(A.woman)) + (key === 's10' || key === 's12' ? '' : one(A.man));
  }

  /* 전체 그리기. chartSvg: 패널 안 차트(이미지 좌표 헬퍼로 만든 문자열) */
  function render(logoHref, spec, chartSvg) {
    const T = texts(spec);
    const by = Object.fromEntries(T.map(o => [o.id, o]));
    let s = `<svg viewBox="0 0 3400 1000" xmlns="http://www.w3.org/2000/svg" style="width:3400px;height:1000px;display:block">`;
    s += `<rect width="3400" height="1000" fill="${BG}"/>`;
    s += `<image href="${logoHref}" x="${X(BASE.logo.x)}" y="${Y(BASE.logo.y)}" width="${L(BASE.logo.w)}"/>`;
    const ic = BASE.icon;
    s += `<circle cx="${X(ic.cx)}" cy="${Y(ic.cy)}" r="${L(ic.r)}" fill="none" stroke="${ORANGE}" stroke-width="${L(1.2)}"/>` +
         `<path d="M${X(ic.cx - 3.4)} ${Y(ic.cy + 3.4)} L${X(ic.cx + 3.4)} ${Y(ic.cy - 3.4)}" stroke="#101010" stroke-width="${L(1.3)}"/>`;
    const p = BASE.panel;
    s += `<rect x="${X(p.x0)}" y="${Y(p.y0)}" width="${L(p.x1 - p.x0)}" height="${L(p.y1 - p.y0)}" fill="#000000"/>`;
    s += chartSvg || '';
    s += figures(spec.key);
    BASE.cards.forEach(c => {
      const h = c.bw / 2;
      s += `<rect x="${X(c.x0 + h)}" y="${Y(c.y0 + h)}" width="${L(c.x1 - c.x0 - c.bw)}" height="${L(c.y1 - c.y0 - c.bw)}" rx="${L(4)}" fill="#ffffff" stroke="${c.bc}" stroke-width="${L(c.bw)}"/>`;
    });
    T.forEach(o => {
      const m = /^c(\d)([nd])$/.exec(o.id);
      if (m && m[2] === 'd' && !window.Board.SPLIT) return;            // 증감 문구는 숫자 뒤에 이어서 그림(보정 모드에서는 따로)
      if (m && m[2] === 'n' && !window.Board.SPLIT) {
        const d = by['c' + m[1] + 'd'], gap = (d && d.gap != null ? d.gap : 6.5);
        s += `<text x="${X(o.x)}" y="${Y(o.y)}" font-size="${L(o.fs)}" fill="${o.fill}" font-weight="${o.w}" font-family="${o.ff}">${esc(o.t)}` +
             `<tspan dx="${L(gap)}" dy="${L(d.y - o.y)}" font-size="${L(d.fs)}" fill="${d.fill}" font-weight="${d.w}">${esc(d.t)}</tspan></text>`;
        return;
      }
      s += txt(o);
    });
    return s + '</svg>';
  }

  /* ---- 차트 도우미 (이미지 좌표) ---- */
  const dot = (x, y, r, fill) => `<circle cx="${X(x)}" cy="${Y(y)}" r="${L(r)}" fill="${fill}"/>`;
  const line = (x1, y1, x2, y2, stroke, w) => `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${stroke}" stroke-width="${L(w)}"/>`;
  const text = (x, y, t, fs, fill, anchor, w) =>
    `<text x="${X(x)}" y="${Y(y)}" font-size="${L(fs)}" fill="${fill}" text-anchor="${anchor || 'start'}" font-weight="${w || 400}" font-family="${N}">${esc(t)}</text>`;
  const rect = (x, y, w, h, fill) => `<rect x="${X(x)}" y="${Y(y)}" width="${L(w)}" height="${L(h)}" fill="${fill}"/>`;

  /* 막대 차트(+목표선). o: 아래 필드 참고 */
  function bars(o) {
    const yOf = v => o.zeroY - v / o.yMax * (o.zeroY - o.topY);
    let s = '';
    for (let v = 0; v <= o.yMax + 1e-9; v += o.yStep) {
      const y = yOf(v);
      s += line(o.gx0, y, o.gx1, y, o.gridColor && o.gridColor(v) || '#2a2a2a', 0.9);
      s += text(o.yLabX, y + o.yLabFs * 0.36, o.yFmt(v), o.yLabFs, '#d9d9d9', 'end', 700);
    }
    o.cats.forEach((c, i) => { s += text(o.x0 + o.pitch * i, o.xLabY, c, o.xLabFs, '#d9d9d9', 'middle', o.xLabW || 400); });
    o.series.forEach((v, i) => {
      if (v == null) return;
      const cx = o.x0 + o.pitch * i, top = yOf(v), h = o.zeroY - top;
      s += rect(cx - o.barW / 2, top, o.barW, Math.max(h, 0.3), ORANGE);
      const lab = o.valFmt(v);
      let ly;
      if (o.valPos === 'base') ly = o.zeroY - 2.2; else if (o.valPos === 'top') ly = top + o.valFs + 1.5; else ly = top + h / 2 + o.valFs * 0.36;
      if (o.valPos !== 'center' || h > o.valFs * 0.9) s += text(cx, ly, lab, o.valFs, '#ffffff', 'middle', 700);
      else s += text(cx, o.zeroY - 2.2, lab, o.valFs, '#ffffff', 'middle', 700);
    });
    if (o.goal) {
      const g = o.goal, pts = g.values.map((v, i) => v == null ? null : [o.x0 + o.pitch * i, yOf(v), v]).filter(Boolean);
      if (g.line) s += `<polyline points="${pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ')}" fill="none" stroke="#9a9a9a" stroke-width="${L(g.w || 0.9)}"/>`;
      pts.forEach(([x, y, v], i) => {
        s += dot(x, y, g.r || 1.2, '#b5b5b5');
        if (g.labels === 'all' || (g.labels === 'last' && i === pts.length - 1)) s += text(x, y - (g.dy || 3.5), (g.fmt || o.valFmt)(v), g.fs || 4.6, '#d9d9d9', 'middle', 700);
      });
    }
    if (o.legend) {
      let x = o.legend.x;
      o.legend.items.forEach(([name, color, shape]) => {
        s += shape === 'dot' ? dot(x + 1.5, o.legend.y - 1.6, 1.4, color) : rect(x, o.legend.y - 3.3, 3.2, 3.2, color);
        s += text(x + 6, o.legend.y, name, o.legend.fs || 6.2, '#e6e6e6', 'start', 700);
        x += 6 + name.length * (o.legend.cw || 4.2) + 9;
      });
    }
    return s;
  }

  /* 작은 선그래프. o: {title, tx, ty, plot:{x0,x1,y0,y1}, yMin,yMax,yStep, yFmt, cats, catX(i), series, labels, rotate, goal} */
  function lineChart(o) {
    let s = '';
    if (o.title) s += text(o.tx, o.ty, o.title, o.titleFs || 10.5, '#ffffff', 'middle', 700);
    const yOf = v => o.plot.y1 - (v - o.yMin) / (o.yMax - o.yMin) * (o.plot.y1 - o.plot.y0);
    for (let v = o.yMin; v <= o.yMax + 1e-9; v += o.yStep) {
      const y = yOf(v);
      s += line(o.plot.x0, y, o.plot.x1, y, (o.bright && o.bright(v)) ? '#8a8a8a' : '#2a2a2a', 0.9);
      s += text(o.plot.x0 - 3, y + (o.yLabFs || 5) * 0.36, o.yFmt(v), o.yLabFs || 5, '#d9d9d9', 'end', 700);
    }
    o.cats.forEach((c, i) => {
      const x = o.catX(i), y = o.plot.y1 + (o.xLabDy || 8);
      s += o.rotate
        ? `<text x="${X(x)}" y="${Y(y)}" font-size="${L(o.xLabFs || 4)}" fill="#d9d9d9" text-anchor="end" font-family="${N}" transform="rotate(-90 ${X(x) + L(1.4)} ${Y(y) - L(3)})">${esc(c)}</text>`
        : text(x, y + 2, c, o.xLabFs || 4.4, '#d9d9d9', 'middle', 400);
    });
    const draw = (vals, color, withLabels, r, lw) => {
      const pts = vals.map((v, i) => v == null ? null : [o.catX(i), yOf(v), v]).filter(Boolean);
      if (!pts.length) return '';
      let t = `<polyline points="${pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${L(lw)}" stroke-linejoin="round"/>`;
      pts.forEach(([x, y, v]) => { t += dot(x, y, r, color); if (withLabels) t += text(x, y - 3.2, o.valFmt(v), o.valFs || 4.4, color, 'middle', 700); });
      return t;
    };
    if (o.goal) s += draw(o.goal, '#b5b5b5', false, 0.9, 0.5);
    s += draw(o.series, ORANGE, o.labels !== false, 1.1, 1.0);
    if (o.legend) {
      let x = o.legend.x;
      o.legend.items.forEach(([name, color, shape]) => {
        s += dot(x + 1.2, o.legend.y - 1.6, 1.3, color);
        s += text(x + 4.5, o.legend.y, name, 4.4, '#e6e6e6', 'start', 700); x += 4.5 + name.length * 3.2 + 7;
      });
    }
    return s;
  }

  window.Board = { S, X, Y, L, K, N, ORANGE, f, esc, BASE, T0, texts, render, figures, bars, lineChart, line, text, dot, rect };
})();
