/**
 * LED 롤링 페이지용 JSON API
 * 'HR 메인 지표 최신화' 시트 > 확장 프로그램 > Apps Script 에 붙여넣기
 *
 * 설정: 프로젝트 설정 > 스크립트 속성에 TOKEN 추가 (추측하기 어려운 긴 문자열)
 * 배포: 배포 > 새 배포 > 웹 앱 > 실행: 나 / 액세스: 모든 사용자 → URL 복사
 * 송출 화면 읽기: <웹앱 URL>?action=config&token=<TOKEN>
 * 관리자 저장: POST {action:'save', token:<ADMIN_TOKEN>, config:{...}}  (ADMIN_TOKEN 도 스크립트 속성에 추가, TOKEN 과 다르게)
 * 지표 데이터: <웹앱 URL>?token=<TOKEN>
 * 이미지 업로드: POST {action:'upload'|'delete_asset', token:<ADMIN_TOKEN>, ...}  /  GET ?action=asset&id=<파일ID>&token=<TOKEN>
 *   (업로드 파일은 내 드라이브의 'LED 업로드' 폴더에 저장됨. 처음 쓸 때 드라이브 권한 승인 필요)
 */
const SHEET_NAME = '(HR)DATA - 일별';
const KEEP_ROWS = 62;      // 최근 N일 (이번 달 + 지난 달 그래프용)
const CACHE_SEC = 30;

function doGet(e) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('TOKEN'), admin = props.getProperty('ADMIN_TOKEN');
  const given = e && e.parameter ? e.parameter.token : '';
  if (!given || (given !== token && given !== admin)) return json_({ error: 'unauthorized' });

  if (e.parameter.action === 'asset') {
    try {
      const f = assetFile_(e.parameter.id);
      const out = JSON.stringify({ mime: f.getMimeType(), data: Utilities.base64Encode(f.getBlob().getBytes()) });
      return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
    } catch (x) { return json_({ error: 'not found' }); }
  }
  if (e.parameter.action === 'config') {
    const saved = props.getProperty('CONFIG');
    return ContentService.createTextOutput(saved || JSON.stringify({ slides: [], solo: null, updatedAt: 0 }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const cache = CacheService.getScriptCache();
  const hit = cache.get('payload');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);

  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const values = sh.getDataRange().getValues();
  const header = values[0].map(String);
  const rows = values.slice(1)
    .filter(r => r[0] !== '' && r[0] !== null)
    .slice(-KEEP_ROWS)
    .map(r => {
      const o = {};
      header.forEach((h, i) => {
        const v = r[i];
        o[h] = v instanceof Date
          ? Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd')
          : (typeof v === 'string' ? v.replace(/,/g, '').trim() : v);
      });
      return o;
    });

  const payload = JSON.stringify({ updatedAt: new Date().toISOString(), rows: rows, defense: defenseRates_(), goals: goalsFromSheet_(), paid: paidStores_() });
  cache.put('payload', payload, CACHE_SEC);
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** 관리자 페이지: 설정 저장 / 이미지 업로드 / 업로드 파일 삭제 */
const MAX_BYTES = 8 * 1024 * 1024;
const OK_MIME = ['image/png', 'image/jpeg', 'image/webp'];

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (x) { return json_({ error: 'bad request' }); }
  const admin = props.getProperty('ADMIN_TOKEN');
  if (!admin || body.token !== admin) return json_({ error: 'unauthorized' });

  if (body.action === 'save') {
    if (!body.config || !Array.isArray(body.config.slides)) return json_({ error: 'bad request' });
    const c = body.config;
    const clean = {
      slides: c.slides.map(s => {
        const o = { id: String(s.id), on: s.on !== false, sec: Math.max(3, Math.min(600, +s.sec || 12)) };
        if (s.type === 'image') {
          o.type = 'image';
          o.name = String(s.name || '').slice(0, 60);
          o.file = String(s.file || '');
          o.start = dateStr_(s.start);
          o.end = dateStr_(s.end);
        }
        return o;
      }),
      solo: c.solo ? String(c.solo) : null,
      updatedAt: Date.now(),
    };
    props.setProperty('CONFIG', JSON.stringify(clean));
    return json_({ ok: true, updatedAt: clean.updatedAt });
  }

  if (body.action === 'upload') {
    if (OK_MIME.indexOf(body.mime) < 0) return json_({ error: 'PNG, JPG, WEBP 이미지만 올릴 수 있습니다' });
    let bytes;
    try { bytes = Utilities.base64Decode(String(body.data || '')); } catch (x) { return json_({ error: 'bad data' }); }
    if (!bytes.length || bytes.length > MAX_BYTES) return json_({ error: '파일은 8MB 이하여야 합니다' });
    const name = String(body.name || 'image').replace(/[^\w가-힣.\- ]/g, '_').slice(0, 60);
    const file = uploadFolder_().createFile(Utilities.newBlob(bytes, body.mime, name));
    return json_({ ok: true, file: file.getId() });
  }

  if (body.action === 'delete_asset') {
    try { assetFile_(body.file).setTrashed(true); return json_({ ok: true }); }
    catch (x) { return json_({ error: 'not found' }); }
  }
  return json_({ error: 'bad request' });
}

function dateStr_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) ? String(s) : ''; }

/** 업로드 폴더(없으면 만듦). 이 폴더 밖의 파일은 읽거나 지울 수 없게 막음 */
function uploadFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('UPLOAD_FOLDER');
  if (id) { try { return DriveApp.getFolderById(id); } catch (x) {} }
  const f = DriveApp.createFolder('LED 업로드');
  props.setProperty('UPLOAD_FOLDER', f.getId());
  return f;
}
function assetFile_(id) {
  const folder = uploadFolder_(), f = DriveApp.getFileById(String(id));
  const parents = f.getParents();
  while (parents.hasNext()) if (parents.next().getId() === folder.getId()) return f;
  throw new Error('not in folder');
}

/** 'DATA - 기타' 탭의 '해지 방어율 (제외)' 행(1~12월)을 소수 배열로. 값이 없거나 0이면 null */
function defenseRates_() {
  const sh = SpreadsheetApp.getActive().getSheetByName('DATA - 기타');
  if (!sh) return [];
  const v = sh.getDataRange().getValues();
  for (let r = 0; r < v.length; r++) {
    if (String(v[r][0]).trim() === '해지 방어율 (제외)') {
      return v[r].slice(1, 13).map(x => {
        if (x === '' || x == null) return null;
        const n = typeof x === 'number' ? x : parseFloat(String(x).replace('%', '')) / 100;
        return isNaN(n) || n === 0 ? null : n;
      });
    }
  }
  return [];
}

/** '목표' 탭: 일별 누적 목표(예약 등록·방문, 원격대기 방문, 아웃바운드·인바운드). 날짜 순서대로 1~31일 배열, 없으면 null */
function goalsFromSheet_() {
  const sh = SpreadsheetApp.getActive().getSheetByName('목표');
  const out = { regs: [], visits: [], remote: [], outbound: [], inbound: [] };
  Object.keys(out).forEach(k => { for (let i = 0; i < 31; i++) out[k].push(null); });
  if (!sh) return out;
  const v = sh.getDataRange().getValues();
  const dayOf = x => {
    if (x instanceof Date) return x.getDate();
    const m = /^(\d{1,2})\/(\d{1,2})$/.exec(String(x).trim());
    return m ? Number(m[2]) : null;
  };
  const n = x => { const q = typeof x === 'number' ? x : parseFloat(String(x).replace(/,/g, '')); return isNaN(q) ? null : q; };
  let mode = null;
  for (let r = 0; r < v.length; r++) {
    const a = String(v[r][0]).trim();
    if (a === 'DT') { mode = 'A'; continue; }
    if (a.indexOf('인바운드/아웃바운드') === 0) { mode = 'B'; continue; }
    const d = dayOf(v[r][0]);
    if (!d || d < 1 || d > 31) continue;
    if (mode === 'A') { out.regs[d - 1] = n(v[r][1]); out.visits[d - 1] = n(v[r][2]); out.remote[d - 1] = n(v[r][3]); }
    else if (mode === 'B') { out.outbound[d - 1] = n(v[r][2]); out.inbound[d - 1] = n(v[r][3]); }
  }
  return out;
}

/** 'DATA - 기타' 탭: 월별 유료 가맹 매장 수(예약/대기) → [{m:'2026-07', res, wait}] */
function paidStores_() {
  const sh = SpreadsheetApp.getActive().getSheetByName('DATA - 기타');
  if (!sh) return [];
  const v = sh.getDataRange().getValues(), out = [];
  const n = x => { const q = typeof x === 'number' ? x : parseFloat(String(x).replace(/,/g, '')); return isNaN(q) ? null : q; };
  let on = false;
  for (let r = 0; r < v.length; r++) {
    const a = v[r][0];
    if (String(a).trim() === 'MONTH') { on = true; continue; }
    if (!on) continue;
    let ym = null;
    if (a instanceof Date) ym = Utilities.formatDate(a, 'Asia/Seoul', 'yyyy-MM');
    else { const m = /^(\d{4})-(\d{2})/.exec(String(a)); if (m) ym = m[1] + '-' + m[2]; }
    if (!ym) { if (out.length) break; else continue; }
    out.push({ m: ym, res: n(v[r][1]), wait: n(v[r][2]) });
  }
  return out;
}
