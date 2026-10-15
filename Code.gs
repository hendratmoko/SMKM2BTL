/** Portofolio Digital - Google Apps Script REST API. Deploy sebagai Web App (Execute as: Me, Access: Anyone). */
const CFG = {
  SPREADSHEET_ID: '1bs7699lIF_KS_rfbvwoS8ZfBS5jDfNNsgorfdn3LGTM',
  SHEET_NAME: '',            // kosong = sheet pertama
  ENABLE_WRITE: true,        // false untuk mematikan registrasi & kirim karya
  PUBLISH_CATEGORIES: [],    // kosong = semua kategori boleh tampil
  MAX_LEN: { name: 100, title: 150, desc: 1000, short: 60, url: 500 }
};
// Pemetaan kolom berdasarkan POSISI (0-based). submitted_at muncul di posisi 0 dan 19.
const C = { submitted_at:0, id:1, name:2, status:3, department:4, contact:5, access_code:6, publish_consent:7,
  registered_at:8, work_title:9, work_description:10, work_category:11, work_class:12, work_year:13, work_link:14,
  work_type:15, stars:16, certified:17, quiz_score:18, work_submitted_at:19, lama:20, gambar:21, guru:22, mapel:23, avatar:24 };
const NCOLS = 25;

function out_(ok, data, error) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok, data: data || null, error: error || null, ts: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}
function sheet_() {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  return CFG.SHEET_NAME ? ss.getSheetByName(CFG.SHEET_NAME) : ss.getSheets()[0];
}
const T_ = v => String(v == null ? '' : v).trim();
const bool_ = v => v === true || T_(v).toUpperCase() === 'TRUE' || T_(v) === '1' || T_(v).toUpperCase() === 'YA';
function safeUrl_(u) { u = T_(u); return /^https:\/\/[^\s]+$/i.test(u) && u.length <= CFG.MAX_LEN.url ? u : ''; }
function hash_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'portofolio:' + s)
    .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}
function rows_() { const v = sheet_().getDataRange().getValues(); return v.slice(1).map((r, i) => ({ r: r, row: i + 2 })); }

function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const action = p.action || 'works';
    if (action === 'ping') return out_(true, { status: 'ok' });
    if (action !== 'works') return out_(false, null, 'Aksi tidak dikenal.');
    const all = rows_();
    const reg = {};
    all.forEach(o => { if (T_(o.r[C.work_type]) === 'registration' && bool_(o.r[C.publish_consent])) reg[T_(o.r[C.id])] = o.r; });
    let works = [];
    all.forEach(o => {
      const r = o.r;
      if (T_(r[C.work_type]) !== 'work' || !T_(r[C.work_title])) return;
      const id = T_(r[C.id]); const pr = reg[id];
      if (!pr && !bool_(r[C.publish_consent])) return;      // wajib ada izin publikasi
      const src = pr || r;
      const cat = T_(r[C.work_category]);
      if (CFG.PUBLISH_CATEGORIES.length && CFG.PUBLISH_CATEGORIES.indexOf(cat) < 0) return;
      works.push({
        key: o.row, id: id, name: T_(src[C.name]), status: T_(src[C.status]), department: T_(src[C.department]),
        avatar: T_(src[C.avatar] || r[C.avatar]), title: T_(r[C.work_title]), desc: T_(r[C.work_description]),
        category: cat, cls: T_(r[C.work_class]), year: T_(r[C.work_year]), link: safeUrl_(r[C.work_link]),
        image: safeUrl_(r[C.gambar]), stars: Number(r[C.stars]) || 0, certified: bool_(r[C.certified]),
        guru: T_(r[C.guru]), mapel: T_(r[C.mapel]), date: T_(r[C.work_submitted_at] || r[C.submitted_at])
      });
    });
    const q = p.q ? p.q.toLowerCase() : '';
    works = works.filter(w =>
      (!p.id || w.id === p.id) && (!p.category || w.category === p.category) && (!p.type || w.category === p.type) &&
      (!p.name || w.name.toLowerCase().indexOf(p.name.toLowerCase()) >= 0) &&
      (!q || (w.title + ' ' + w.name).toLowerCase().indexOf(q) >= 0));
    return out_(true, { works: works, count: works.length });
  } catch (err) { return out_(false, null, 'Server error: ' + err.message); }
}

function doPost(e) {
  if (!CFG.ENABLE_WRITE) return out_(false, null, 'Fitur tulis dinonaktifkan.');
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const b = JSON.parse(e.postData.contents);
    if (b.action === 'register') return register_(b);
    if (b.action === 'addWork') return addWork_(b);
    return out_(false, null, 'Aksi tidak dikenal.');
  } catch (err) { return out_(false, null, 'Server error: ' + err.message); }
  finally { try { lock.releaseLock(); } catch (x) {} }
}
function clip_(v, n) { return T_(v).slice(0, n).replace(/^[=+\-@]/, "'$&"); } // cegah formula injection
function register_(b) {
  const name = clip_(b.name, CFG.MAX_LEN.name), status = T_(b.status);
  if (name.length < 3) return out_(false, null, 'Nama minimal 3 karakter.');
  if (['Guru', 'Siswa'].indexOf(status) < 0) return out_(false, null, 'Status harus Guru atau Siswa.');
  if (T_(b.access_code).length < 6) return out_(false, null, 'Kode akses minimal 6 karakter.');
  if (!bool_(b.publish_consent)) return out_(false, null, 'Izin publikasi wajib disetujui.');
  const id = 'U' + Utilities.getUuid().slice(0, 8).toUpperCase();
  const row = new Array(NCOLS).fill('');
  row[C.submitted_at] = new Date(); row[C.id] = id; row[C.name] = name; row[C.status] = status;
  row[C.department] = clip_(b.department, CFG.MAX_LEN.short); row[C.contact] = clip_(b.contact, CFG.MAX_LEN.short);
  row[C.access_code] = hash_(T_(b.access_code)); row[C.publish_consent] = 'TRUE'; row[C.registered_at] = new Date();
  row[C.work_type] = 'registration'; row[C.stars] = 0; row[C.certified] = 'FALSE'; row[C.quiz_score] = 0;
  sheet_().appendRow(row);
  return out_(true, { id: id });
}
function addWork_(b) {
  const id = T_(b.id), code = T_(b.access_code);
  const reg = rows_().filter(o => T_(o.r[C.id]) === id && T_(o.r[C.work_type]) === 'registration')[0];
  if (!reg) return out_(false, null, 'ID tidak ditemukan.');
  const stored = T_(reg.r[C.access_code]);
  if (stored !== code && stored !== hash_(code)) return out_(false, null, 'Kode akses salah.');
  const title = clip_(b.title, CFG.MAX_LEN.title);
  if (title.length < 3) return out_(false, null, 'Judul karya minimal 3 karakter.');
  const link = safeUrl_(b.link); if (!link) return out_(false, null, 'Tautan karya harus berupa URL https.');
  const row = new Array(NCOLS).fill('');
  row[C.submitted_at] = new Date(); row[C.id] = id; row[C.name] = reg.r[C.name]; row[C.status] = reg.r[C.status];
  row[C.department] = reg.r[C.department]; row[C.publish_consent] = reg.r[C.publish_consent];
  row[C.work_title] = title; row[C.work_description] = clip_(b.desc, CFG.MAX_LEN.desc);
  row[C.work_category] = clip_(b.category, CFG.MAX_LEN.short); row[C.work_class] = clip_(b.cls, CFG.MAX_LEN.short);
  row[C.work_year] = clip_(b.year, 4); row[C.work_link] = link; row[C.work_type] = 'work';
  row[C.stars] = 0; row[C.certified] = 'FALSE'; row[C.quiz_score] = 0; row[C.work_submitted_at] = new Date();
  row[C.gambar] = safeUrl_(b.image); row[C.guru] = clip_(b.guru, CFG.MAX_LEN.name); row[C.mapel] = clip_(b.mapel, CFG.MAX_LEN.short);
  row[C.avatar] = reg.r[C.avatar];
  sheet_().appendRow(row);   // appendRow tidak menimpa data lama
  return out_(true, { saved: true });
}
