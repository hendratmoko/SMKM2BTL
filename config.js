// Konfigurasi bersama untuk semua halaman
const SITE = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzcoe27720MIUKOLr7V-xajxJiRCowK_7CKV7ynMGSRlevNMyVgxwX0ITDvulZwKCoBzg/exec',
  name: 'SMK MUHAMMADIYAH 2 BANTUL',
  logo: 'https://raw.githubusercontent.com/hendratmoko/SMKM2BTL/refs/heads/main/LOGO.png'
};
async function api(body) {
  const r = await fetch(SITE.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'Terjadi kesalahan');
  return j.data;
}
