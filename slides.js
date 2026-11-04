/* 슬라이드 등록부 — 송출 화면(index.html)과 관리자(admin.html)가 함께 사용.
   기본 슬라이드를 추가할 때: 여기에 한 줄 추가 + index.html에 <section class="slide" data-id="..."> 추가.
   업로드한 이미지 슬라이드는 여기에 적지 않고 관리자 설정(config)에 type:'image' 로 저장됩니다. */
window.SLIDES = [
  { id: 'intro', name: 'One Goal (인트로)', sec: 12 },
  { id: 'stores', name: '예약 전체 매장 수', sec: 15 },
  { id: 'outbound', name: '아웃바운드 신규 가맹 수', sec: 15 },
  { id: 'inbound', name: '인바운드 신규 가맹 수', sec: 15 },
  { id: 'defense', name: '해지 방어율', sec: 15 },
  { id: 'visits', name: '예약 방문 수', sec: 15 },
  { id: 'regs', name: '예약 등록 수', sec: 15 },
  { id: 'remote', name: '원격대기 방문 수', sec: 15 },
  { id: 'duv', name: 'DUV', sec: 15 },
  { id: 'ads', name: '고가 광고 참여 매장 수', sec: 15 },
  { id: 'paid', name: '월정액 유료 매장 수', sec: 15 },
  { id: 'autopay', name: '자동결제', sec: 15 },
];

window.todayStr = function () {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
};
const dateOk = s => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)) ? s : '';

/* 저장된 설정을 정리: 등록부에 없는 기본 슬라이드는 제거, 새 기본 슬라이드는 맨 뒤에 ON으로 추가,
   업로드 이미지(type:'image')는 그대로 유지 */
window.normalizeConfig = function (cfg) {
  const saved = (cfg && Array.isArray(cfg.slides)) ? cfg.slides : [];
  const known = new Map(window.SLIDES.map(s => [s.id, s]));
  const out = [];
  saved.forEach(s => {
    const base = known.get(s.id);
    if (base) {
      out.push({ id: s.id, on: s.on !== false, sec: Math.max(3, +s.sec || base.sec) });
      known.delete(s.id);
    } else if (s.type === 'image' && s.file) {
      out.push({ id: s.id, type: 'image', name: String(s.name || '업로드 이미지'), file: String(s.file),
        start: dateOk(s.start), end: dateOk(s.end), on: s.on !== false, sec: Math.max(3, +s.sec || 12) });
    }
  });
  known.forEach(base => out.push({ id: base.id, on: true, sec: base.sec }));
  const solo = cfg && cfg.solo && out.some(s => s.id === cfg.solo) ? cfg.solo : null;
  return { slides: out, solo: solo, updatedAt: (cfg && cfg.updatedAt) || 0 };
};

/* 노출 기간 안인지 (시작/종료일은 포함, 비워 두면 제한 없음) */
window.inWindow = function (s, today) {
  today = today || window.todayStr();
  return (!s.start || today >= s.start) && (!s.end || today <= s.end);
};

/* 지금 송출할 목록: 단독 송출이면 그 한 장(기간과 무관),
   아니면 ON이고 노출 기간 안인 슬라이드를 순서대로. 하나도 없으면 첫 기본 슬라이드 */
window.pickActive = function (cfg, today) {
  const c = window.normalizeConfig(cfg);
  if (c.solo) return c.slides.filter(s => s.id === c.solo);
  const on = c.slides.filter(s => s.on && window.inWindow(s, today));
  return on.length ? on : c.slides.filter(s => !s.type).slice(0, 1);
};
