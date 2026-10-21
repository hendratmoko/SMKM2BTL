/**
 * Backend Portofolio Digital (Google Apps Script)
 * Setup:
 * 1. Buka Google Sheet > Extensions > Apps Script, tempel kode ini.
 * 2. Project Settings > Script Properties > tambah ADMIN_KEY = kata sandi admin Anda.
 * 3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 * 4. Salin URL /exec ke GAS_URL di config.js.
 * Sheet "Profiles" dan "Works" dibuat otomatis bila belum ada.
 */
const HEAD = {
  Profiles: ['id', 'name', 'status', 'department', 'wa', 'access_code', 'consent', 'created', 'avatar'],
  Works: ['key', 'id', 'title', 'desc', 'category', 'cls', 'year', 'link', 'image', 'guru', 'mapel', 'stars', 'certified', 'date']
};
const CATS = ['Game', 'Video', 'Website', 'Poster', 'Media Pembelajaran'];
const TZ = 'Asia/Jakarta';

function sheet_(n) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(n);
  if (!s) {
    s = ss.insertSheet(n); s.appendRow(HEAD[n]); s.setFrozenRows(1);
    if (n === 'Profiles') s.getRange('E:F').setNumberFormat('@'); // WA & kode tetap teks
  }
  return s;
}
function rows_(n) {
  const v = sheet_(n).getDataRange().getValues(), h = v.shift();
  return v.map((r, i) => { const o = { _row: i + 2 }; h.forEach((k, j) => o[k] = r[j]); return o; });
}
const out_ = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const safe_ = v => { v = String(v == null ? '' : v).trim(); return /^[=+\-@]/.test(v) ? "'" + v : v; };
const https_ = u => /^https:\/\/\S+$/i.test(u || '');
const day_ = d => d instanceof Date ? Utilities.formatDate(d, TZ, 'yyyy-MM-dd') : String(d || '');
const yes_ = v => v === true || String(v).toUpperCase() === 'TRUE';

function doGet(e) {
  if (e.parameter.action === 'works') return out_({ ok: true, data: { works: publicWorks_() } });
  return out_({ ok: false, error: 'Aksi tidak dikenal' });
}
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    const fn = { register: register_, addWork: addWork_, adminList: adminList_, adminUpdateLinks: adminUpdateLinks_ }[b.action];
    if (!fn) throw new Error('Aksi tidak dikenal');
    return out_({ ok: true, data: fn(b) });
  } catch (err) { return out_({ ok: false, error: err.message }); }
  finally { lock.releaseLock(); }
}

// Kode akses: 3 huruf dari nama + 3 angka acak, unik. Wintolo -> WIN123
function makeCode_(name, used) {
  const letters = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z]/g, '').toUpperCase();
  const pre = (letters + 'XXX').slice(0, 3);
  for (let i = 0; i < 3000; i++) {
    const c = pre + ('00' + Math.floor(Math.random() * 1000)).slice(-3);
    if (!used[c]) return c;
  }
  throw new Error('Kode untuk nama ini sudah penuh. Tambahkan variasi pada nama atau hubungi admin.');
}
function register_(b) {
  const name = String(b.name || '').trim(), status = b.status === 'Guru' ? 'Guru' : 'Siswa';
  const wa = String(b.wa || '').replace(/\D/g, '');
  if (name.length < 3 || name.length > 80) throw new Error('Nama minimal 3 karakter');
  if (!/^62\d{8,13}$/.test(wa)) throw new Error('Nomor WhatsApp tidak valid');
  if (b.publish_consent !== true) throw new Error('Izin publikasi wajib disetujui');
  const P = rows_('Profiles'), used = {};
  P.forEach(p => used[String(p.access_code).toUpperCase()] = 1);
  if (P.some(p => String(p.wa) === wa && String(p.name).toLowerCase() === name.toLowerCase()))
    throw new Error('Nama dan nomor WA ini sudah terdaftar. Cek pesan WhatsApp Anda atau hubungi admin.');
  const code = makeCode_(name, used), dept = safe_(b.department).slice(0, 80);
  sheet_('Profiles').appendRow([Utilities.getUuid().slice(0, 8), safe_(name), status, dept, wa, code, true, new Date(), '']);
  return { code, name, status, department: dept, wa };
}
function addWork_(b) {
  const code = String(b.access_code || '').trim().toUpperCase();
  const p = rows_('Profiles').find(x => String(x.access_code).toUpperCase() === code);
  if (!code || !p) throw new Error('Kode akses tidak ditemukan');
  const title = String(b.title || '').trim(), year = String(b.year || '').trim();
  if (title.length < 3) throw new Error('Judul minimal 3 karakter');
  if (!https_(b.link)) throw new Error('Tautan karya harus diawali https://');
  if (b.image && !https_(b.image)) throw new Error('Tautan thumbnail harus diawali https://');
  if (CATS.indexOf(b.category) < 0) throw new Error('Kategori tidak valid');
  if (year && !/^(20\d\d|2100)$/.test(year)) throw new Error('Tahun tidak valid');
  const key = rows_('Works').reduce((m, w) => Math.max(m, Number(w.key) || 0), 0) + 1;
  sheet_('Works').appendRow([key, p.id, safe_(title).slice(0, 120), safe_(b.desc).slice(0, 1000), b.category, safe_(b.cls).slice(0, 30), year, String(b.link).trim(), String(b.image || '').trim(), safe_(b.guru).slice(0, 80), safe_(b.mapel).slice(0, 80), 0, false, new Date()]);
  return { title, name: p.name };
}
function work_(w, p) {
  return { key: Number(w.key), id: w.id, name: p.name, status: p.status, department: p.department, avatar: p.avatar, mapel: w.mapel, cls: w.cls, title: w.title, desc: w.desc, category: w.category, year: String(w.year || ''), link: w.link, image: w.image, guru: w.guru, stars: Number(w.stars) || 0, certified: yes_(w.certified), date: day_(w.date) };
}
// Publik: tanpa kode akses & WA, hanya profil yang mengizinkan publikasi
function publicWorks_() {
  const P = {}; rows_('Profiles').forEach(p => { if (yes_(p.consent)) P[p.id] = p; });
  return rows_('Works').filter(w => P[w.id]).map(w => work_(w, P[w.id]));
}
function admin_(b) {
  const k = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!k || b.admin_key !== k) { Utilities.sleep(1500); throw new Error('Kata sandi admin salah'); }
}
function adminList_(b) {
  admin_(b);
  const P = rows_('Profiles'), M = {}; P.forEach(p => M[p.id] = p);
  return {
    profiles: P.map(p => ({ id: p.id, name: p.name, status: p.status, department: p.department, wa: String(p.wa), code: String(p.access_code), consent: yes_(p.consent), created: day_(p.created) })),
    works: rows_('Works').map(w => { const p = M[w.id] || {}; return Object.assign(work_(w, p), { code: String(p.access_code || '') }); })
  };
}
// Admin hanya boleh mengubah dua kolom ini
function adminUpdateLinks_(b) {
  admin_(b);
  if (!https_(b.link)) throw new Error('Tautan karya harus diawali https://');
  if (b.image && !https_(b.image)) throw new Error('Tautan thumbnail harus diawali https://');
  const w = rows_('Works').find(x => Number(x.key) === Number(b.key));
  if (!w) throw new Error('Karya tidak ditemukan');
  const s = sheet_('Works'), h = HEAD.Works;
  s.getRange(w._row, h.indexOf('link') + 1).setValue(String(b.link).trim());
  s.getRange(w._row, h.indexOf('image') + 1).setValue(String(b.image || '').trim());
  return { key: Number(w.key), link: String(b.link).trim(), image: String(b.image || '').trim() };
}
