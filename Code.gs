/**
 * JH Laundry POS: backend Google Sheets
 * Cara pakai ada di PANDUAN.md. Ganti PIN di bawah sebelum dipakai.
 */
const PIN = 'GANTI-PIN-INI';   // <- isi PIN rahasia, samakan dengan kolom PIN di aplikasi

const SHEET = 'Pesanan';
// KEYS = nama field di aplikasi, HEADERS = judul kolom yang tampil di Sheet
const KEYS = ['id','tanggal','bulan','nama','wa','paket','layanan','kg','kgTagih','tarif','satuan','tambah','potong','total','bayar','metode','tglBayar','estimasi','antar','catatan','items','ketTambah','ketPotong','kiloan','totalKiloan','totalSatuan','diambil'];
const HEADERS = ['ID','Tanggal','Bulan','Nama','WhatsApp','Paket','Layanan','Kg','Kg ditagih','Tarif per kg','Satuan (ringkas)','Biaya tambahan','Potongan','Total','Status bayar','Cara bayar','Tanggal bayar','Estimasi selesai','Antar jemput','Catatan','Items (JSON)','Ket. biaya tambahan','Ket. potongan','Rincian kiloan (JSON)','Total kiloan (Rp)','Total satuan (Rp)','Tanggal diambil'];
const NUM = ['kg','kgTagih','tarif','tambah','potong','total','totalKiloan','totalSatuan'];

/** Jalankan SEKALI dari editor Apps Script (menu Run > setup) untuk membuat tab Pesanan dan Rekap. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  // pengaman: jangan hapus data kalau setup dijalankan lagi setelah dipakai
  if (sh && sh.getLastRow() > 1) throw new Error('Tab Pesanan sudah berisi data. setup dihentikan supaya data tidak terhapus.');
  sh = sh || ss.insertSheet(SHEET);
  sh.clear();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#1b4aa0').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  // kolom teks supaya tanggal dan nomor tidak diubah otomatis oleh Sheets
  const textCols = ['id','tanggal','bulan','nama','wa','paket','layanan','satuan','bayar','metode','tglBayar','estimasi','antar','catatan','items','ketTambah','ketPotong','kiloan','diambil'];
  textCols.forEach(k => sh.getRange(1, KEYS.indexOf(k) + 1, sh.getMaxRows(), 1).setNumberFormat('@'));
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  NUM.forEach(k => sh.getRange(2, KEYS.indexOf(k) + 1, sh.getMaxRows() - 1, 1).setNumberFormat(k === 'kg' || k === 'kgTagih' ? '0.0' : '#,##0'));
  sh.setColumnWidths(1, HEADERS.length, 110);

  // Tab Rekap: satu baris per bulan, terisi otomatis oleh rumus
  let rk = ss.getSheetByName('Rekap') || ss.insertSheet('Rekap');
  rk.clear();
  rk.getRange('A:A').setNumberFormat('@');
  rk.getRange(1, 1, 1, 6).setValues([['Bulan', 'Jumlah pesanan', 'Total kg', 'Total tagihan (Rp)', 'Uang masuk (Rp)', 'Belum dibayar (Rp)']])
    .setFontWeight('bold').setBackground('#1b4aa0').setFontColor('#ffffff');
  const col = k => String.fromCharCode(65 + KEYS.indexOf(k));  // huruf kolom di tab Pesanan
  const rows = [];
  let y = 2026, m = 10;
  for (let i = 0; i < 36; i++) {
    const r = i + 2, mm = ('0' + m).slice(-2);
    rows.push([
      y + '-' + mm,
      `=COUNTIF(Pesanan!$${col('bulan')}:$${col('bulan')},A${r})`,
      `=SUMIF(Pesanan!$${col('bulan')}:$${col('bulan')},A${r},Pesanan!$${col('kg')}:$${col('kg')})`,
      `=SUMIF(Pesanan!$${col('bulan')}:$${col('bulan')},A${r},Pesanan!$${col('total')}:$${col('total')})`,
      `=SUMIFS(Pesanan!$${col('total')}:$${col('total')},Pesanan!$${col('tglBayar')}:$${col('tglBayar')},A${r}&"*",Pesanan!$${col('bayar')}:$${col('bayar')},"Lunas")`,
      `=SUMIFS(Pesanan!$${col('total')}:$${col('total')},Pesanan!$${col('bulan')}:$${col('bulan')},A${r},Pesanan!$${col('bayar')}:$${col('bayar')},"Belum")`
    ]);
    m++; if (m > 12) { m = 1; y++; }
  }
  rk.getRange(2, 1, rows.length, 6).setFormulas(rows);
  rk.getRange(2, 3, rows.length, 1).setNumberFormat('0.0');
  rk.getRange(2, 4, rows.length, 3).setNumberFormat('#,##0');
  rk.setFrozenRows(1);
  rk.setColumnWidths(1, 6, 150);
}

/** Menyamakan baris judul di tab Pesanan dengan HEADERS. Dipanggil otomatis, jadi kolom baru tidak perlu diketik manual. */
function ensureHeaders_(sh) {
  const cur = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (HEADERS.every((h, i) => cur[i] === h)) return;
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#1b4aa0').setFontColor('#ffffff');
  ['ketTambah','ketPotong','kiloan','diambil'].forEach(k => sh.getRange(2, KEYS.indexOf(k) + 1, sh.getMaxRows() - 1, 1).setNumberFormat('@'));
  ['totalKiloan','totalSatuan'].forEach(k => sh.getRange(2, KEYS.indexOf(k) + 1, sh.getMaxRows() - 1, 1).setNumberFormat('#,##0'));
}

const rb_ = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function rowToObj_(row) {
  const o = {};
  KEYS.forEach((k, i) => { o[k] = NUM.indexOf(k) >= 0 ? Number(row[i]) || 0 : String(row[i] == null ? '' : row[i]); });
  return o;
}

function objToRow_(o) {
  const items = Array.isArray(o.items) ? o.items : [];
  const full = Object.assign({}, o, {
    bulan: String(o.tanggal || '').slice(0, 7),
    satuan: items.map(i => i.nama + ' x' + i.qty + ' @' + rb_(i.harga)).join('; '),
    items: JSON.stringify(items)
  });
  return KEYS.map(k => NUM.indexOf(k) >= 0 ? Number(full[k]) || 0 : (full[k] == null ? '' : String(full[k])));
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.key !== PIN) return json_({ ok: false, error: 'PIN salah' });
  if (p.action !== 'list') return json_({ ok: false, error: 'aksi tidak dikenal' });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok: true, orders: [] });
  const from = String(p.from || '0000-00-00'), to = String(p.to || '9999-12-31');
  const rows = sh.getRange(2, 1, last - 1, KEYS.length).getValues();
  const out = [];
  rows.forEach(r => {
    const o = rowToObj_(r);
    const d1 = o.tanggal.slice(0, 10), d2 = o.tglBayar.slice(0, 10);
    if ((d1 >= from && d1 <= to) || (d2 && d2 >= from && d2 <= to)) out.push(o);
  });
  return json_({ ok: true, orders: out });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'data tidak valid' }); }
  if (body.key !== PIN) return json_({ ok: false, error: 'PIN salah' });
  if (body.action !== 'upsert' || !body.order || !body.order.id) return json_({ ok: false, error: 'aksi tidak dikenal' });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
    ensureHeaders_(sh);
    const row = objToRow_(body.order);
    const last = sh.getLastRow();
    let target = -1;
    if (last >= 2) {
      const ids = sh.getRange(2, 1, last - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) { if (String(ids[i][0]) === String(body.order.id)) { target = i + 2; break; } }
    }
    if (target < 0) target = last + 1;
    sh.getRange(target, 1, 1, KEYS.length).setValues([row]);
    return json_({ ok: true, id: body.order.id });
  } finally {
    lock.releaseLock();
  }
}
