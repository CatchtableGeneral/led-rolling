/* 송출 채널 등록부 — 송출 화면(index.html)과 관리자(Admin)가 함께 사용합니다.
   채널마다 화면 크기·비율과 기본 슬라이드가 다릅니다.
     led : 카페테리아 LED (3400×1000, 지표 12장)      → index.html
     tv  : 사무실 TV     (1920×1080, 리더십 원칙 10장) → index.html?ch=tv
           TV 기본 화면은 이미지 파일(tv/01.png …)입니다. 원본: 구글 슬라이드 '[판교] 일반 TV'.
           내용이 바뀌면 같은 이름의 파일을 1920×1080 PNG로 바꿔 올리면 됩니다.
     tv2 : 카페테리아 세로 TV (1080×1920 세로, 기본 화면 없음 · 올린 이미지만) → index.html?ch=tv2
     tv3 : 스낵바 세로 TV     (1080×1920 세로, 기본 화면 없음 · 올린 이미지만) → index.html?ch=tv3
     tv4 : 판교사무실B-라운지TV (TV 2대를 가로로 이어 붙인 3840×1080, 기본 화면 없음 · 올린 이미지·영상) → index.html?ch=tv4
           video:true 인 채널만 영상(MP4·WEBM, 30MB)과 유튜브 링크(type:'youtube', 용량 제한 없음)를 넣을 수 있음.
           영상·유튜브는 소리 없이 끝까지 재생된 뒤 다음 화면으로 넘어감
           켜진 이미지가 하나도 없으면 송출 화면에는 검은 바탕에 로고(대기 화면)가 나옵니다.
           이름·크기는 아래 name/desc/w/h/ratio 만 바꾸면 됩니다(Code.gs 의 CHANNELS_ 와 id 를 맞출 것).
   기본 슬라이드를 추가할 때: 해당 채널 slides 에 한 줄 추가 + index.html 에 그리는 코드 추가.
   업로드한 이미지 슬라이드는 여기에 적지 않고 관리자 설정(config)에 type:'image' 로 저장됩니다(채널별 설정). */
window.CHANNELS = {
  led: {
    name: '카페테리아 LED', desc: '카페테리아 대형 LED', w: 3400, h: 1000, ratio: '3.4:1', cfgKey: 'config',
    slides: [
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
    ],
  },
  tv: {
    name: '사무실 TV', desc: '사무실 TV', w: 1920, h: 1080, ratio: '16:9', cfgKey: 'tvconfig',
    slides: [
      { id: 'tv01', name: 'Leadership Principles (표지)', sec: 10, img: 'tv/01.png' },
      { id: 'tv02', name: '결과로 말한다', sec: 10, img: 'tv/02.png' },
      { id: 'tv03', name: '고객 집착', sec: 10, img: 'tv/03.png' },
      { id: 'tv04', name: '속도가 경쟁력', sec: 10, img: 'tv/04.png' },
      { id: 'tv05', name: '우리≠고객', sec: 10, img: 'tv/05.png' },
      { id: 'tv06', name: '오너십', sec: 10, img: 'tv/06.png' },
      { id: 'tv07', name: '다이브 딥', sec: 10, img: 'tv/07.png' },
      { id: 'tv08', name: '효율이 곧 전략', sec: 10, img: 'tv/08.png' },
      { id: 'tv09', name: '최고 인재 채용과 육성', sec: 10, img: 'tv/09.png' },
      { id: 'tv10', name: '더더더', sec: 10, img: 'tv/10.png' },
    ],
  },
  tv2: { name: '카페테리아 세로 TV', desc: '카페테리아 세로 TV', w: 1080, h: 1920, ratio: '9:16 세로', cfgKey: 'tv2config', slides: [] },
  tv3: { name: '스낵바 세로 TV', desc: '스낵바 세로 TV', w: 1080, h: 1920, ratio: '9:16 세로', cfgKey: 'tv3config', slides: [] },
  tv4: { name: '판교사무실B-라운지TV', desc: '판교사무실B 라운지 TV 2대(가로로 이어 붙임)', w: 3840, h: 1080, ratio: '32:9 (TV 2대)', cfgKey: 'tv4config', video: true, slides: [] },
};
window.chanOf = function (ch) { return window.CHANNELS[ch] || window.CHANNELS.led; };
window.SLIDES = window.CHANNELS.led.slides;   // 이전 코드 호환(LED 기본 슬라이드 목록)

/* 송출 시간(모든 송출 화면 공통): 이 시간에만 순환 송출, 그 밖의 시간과 주말엔 검은 바탕 로고(대기 화면)만.
   한국 시간 기준. days: 0=일 1=월 … 6=토 / from 이상 to 미만(시). 바꾸려면 이 줄만 고치면 됨(slides.js 와 Admin 둘 다) */
window.ON_AIR = { days: [1, 2, 3, 4, 5], from: 8, to: 23, label: '평일 08:00~23:00' };
window.onAir = function (ms) {
  const k = new Date((ms || Date.now()) + 9 * 3600 * 1000), h = k.getUTCHours() + k.getUTCMinutes() / 60;   // 한국 시간
  return window.ON_AIR.days.indexOf(k.getUTCDay()) >= 0 && h >= window.ON_AIR.from && h < window.ON_AIR.to;
};

window.todayStr = function () {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
};
const dateOk = s => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)) ? s : '';

/* 저장된 설정을 정리(채널 기준): 등록부에 없는 기본 슬라이드는 제거, 새 기본 슬라이드는 맨 뒤에 ON으로 추가,
   업로드 이미지·영상(type:'image'|'video')은 그대로 유지. 켜 두지 않은 한 OFF */
window.normalizeConfig = function (cfg, ch) {
  const saved = (cfg && Array.isArray(cfg.slides)) ? cfg.slides : [];
  const known = new Map(window.chanOf(ch).slides.map(s => [s.id, s]));
  const out = [];
  saved.forEach(s => {
    const base = known.get(s.id);
    if (base) {
      out.push({ id: s.id, on: s.on !== false, sec: Math.max(3, +s.sec || base.sec) });
      known.delete(s.id);
    } else if ((s.type === 'image' || s.type === 'video') && s.file) {
      const vid = s.type === 'video';   // 영상: sec = 영상 길이(초). 송출 화면은 끝까지 재생된 뒤 넘어감
      out.push({ id: s.id, type: s.type, name: String(s.name || (vid ? '업로드 영상' : '업로드 이미지')), file: String(s.file),
        start: dateOk(s.start), end: dateOk(s.end), on: s.on === true, sec: vid ? Math.max(1, Math.min(3600, +s.sec || 30)) : Math.max(3, +s.sec || 12) });
    } else if (s.type === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(String(s.yt || ''))) {   // 유튜브(일부 공개) 링크: 파일 없이 영상 ID 만. sec = 영상 길이
      out.push({ id: s.id, type: 'youtube', name: String(s.name || '유튜브 영상'), yt: String(s.yt),
        start: dateOk(s.start), end: dateOk(s.end), on: s.on === true, sec: Math.max(1, Math.min(14400, +s.sec || 60)) });
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

/* 지금 송출할 목록: 단독 송출이면 그 한 장(켜짐 여부·기간과 무관),
   아니면 ON이고 노출 기간 안인 슬라이드를 순서대로. 하나도 없으면 그 채널의 첫 기본 슬라이드 */
window.pickActive = function (cfg, today, ch) {
  const c = window.normalizeConfig(cfg, ch);
  if (c.solo) return c.slides.filter(s => s.id === c.solo);
  const on = c.slides.filter(s => s.on && window.inWindow(s, today));
  return on.length ? on : c.slides.filter(s => !s.type).slice(0, 1);
};
