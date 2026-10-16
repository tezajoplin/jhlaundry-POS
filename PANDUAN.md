# JH Laundry POS: panduan pasang (sekitar 25 menit, sekali saja)

Isi paket:
- `1_Google_Sheets/Code.gs`: kode untuk Google Sheets (tempat semua data disimpan)
- `2_Aplikasi_upload_ke_GitHub/`: aplikasinya (6 file, upload SEMUANYA)
- `PANDUAN.md`: panduan ini

Hasil akhirnya: aplikasi "JH Kasir" di layar utama HP dan tablet Android. Staf ketik nama, pilih paket, isi kilo (tarif bisa diubah), simpan, lalu tekan Kirim: nota masuk ke WhatsApp pelanggan. Semua pesanan tercatat di Google Sheet milikmu dan rekap kg dan uang masuk per bulan terisi sendiri.

## A. Siapkan Google Sheets
1. Buka sheets.google.com, buat spreadsheet baru, beri nama "JH Laundry POS".
2. Menu **Ekstensi > Apps Script**.
3. Hapus semua isi yang ada, lalu tempel seluruh isi `Code.gs`.
4. Di baris paling atas, ganti `GANTI-PIN-INI` dengan PIN rahasiamu (misalnya 6 angka). Simpan (ikon disket).
5. Pilih fungsi **setup** di bagian atas, klik **Jalankan**. Google akan minta izin: pilih akunmu, klik "Lanjutan", lalu "Buka ... (tidak aman)" dan izinkan. Itu normal untuk skrip buatan sendiri.
   Jalankan **setup hanya sekali**. Kalau tab Pesanan sudah berisi data, setup berhenti sendiri supaya data tidak terhapus.
6. Kembali ke spreadsheet: sekarang ada tab **Pesanan** (semua nota) dan **Rekap** (per bulan, terisi otomatis).

## B. Terbitkan sebagai web app
1. Di Apps Script: **Terapkan > Penerapan baru**.
2. Jenis: **Aplikasi web**. "Jalankan sebagai": **Saya**. "Yang memiliki akses": **Siapa saja**.
3. Klik Terapkan, lalu **salin URL** yang berakhiran `/exec`.

Kalau nanti kamu mengubah `Code.gs`, buat penerapan versi baru lagi supaya perubahannya aktif.

## C. Taruh aplikasinya di internet (GitHub Pages)
1. Buat repo baru di GitHub, misalnya `jhlaundry-pos`.
2. Upload **semua 6 file** dari folder `2_Aplikasi_upload_ke_GitHub`: `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.
3. Settings > Pages > Branch `main`, folder `/ (root)` > Save.
4. Tunggu 1 sampai 2 menit. Alamatnya: `https://NAMAKAMU.github.io/jhlaundry-pos/`.

Semua file harus ikut. Kalau hanya `index.html` yang diupload, aplikasi tetap jalan di browser tapi tidak bisa dipasang sebagai aplikasi.

## D. Pasang di HP dan tablet Android
1. Buka alamat tadi di **Chrome** di perangkat itu.
2. Menu titik tiga > **Pasang aplikasi** (atau "Tambahkan ke layar utama"). Di tab Setelan juga ada tombol "Pasang aplikasi di perangkat ini" kalau Chrome menawarkannya. Ikon JH muncul di layar utama dan terbuka layar penuh seperti aplikasi biasa.
3. Buka aplikasinya, tab **Setelan**:
   - isi nama usaha, **telepon: 0853-4645-7272**, dan alamat (samakan dengan profil Google),
   - tempel **URL Apps Script** dan **PIN**,
   - **Simpan pengaturan**, lalu **Sinkronkan sekarang**. Penanda di pojok atas jadi hijau "Tersinkron".
4. Ulangi langkah 1 sampai 3 di tiap perangkat. Semuanya menyimpan ke Sheet yang sama.

Aplikasi tetap terbuka walau internet mati. Pesanan yang dicatat saat offline terkirim ke Sheet otomatis begitu online (penanda kuning = masih menunggu).

## E. Cara pakai harian
1. Tab **Pesanan**: nama, nomor WhatsApp, pilih paket, isi kilo (tarif per kg terisi otomatis, boleh diubah), atau tambah item satuan. Tekan **Simpan & kirim nota ke WhatsApp**. WhatsApp terbuka dengan nota siap, tekan kirim.
2. Tab **Daftar**: pesanan hari itu, buka ulang nota, **Tandai lunas** saat pelanggan membayar.
3. Tab **Rekap**: pilih bulan, lihat jumlah pesanan, total kg, uang masuk, dan yang belum dibayar. Bisa diunduh CSV.

## Aturan hitung yang dipakai
- Harga dan paket memakai daftar harga di gambar. Tarif per kg bisa diubah per pesanan (mis. harga member).
- Kalau berat di bawah minimum paket (mis. Reguler min. 3 kg), yang ditagih adalah minimum itu. Bisa dimatikan di Setelan.
- Kg di rekap adalah berat sebenarnya, bukan berat yang ditagih.
- "Uang masuk" dihitung dari tanggal pembayaran. "Belum dibayar" adalah pesanan bulan itu yang belum lunas.
- Estimasi selesai terisi otomatis: Reguler 2 hari, 1 Hari, Kilat 12 Jam, Kilat 5 Jam. Cuci Kering dan Pakaian Bayi isi manual.
- Kalau harga berubah: buka `index.html`, cari bagian `DATA HARGA`, ubah angkanya, lalu upload ulang ke GitHub.

## Nota ke WhatsApp: ketukan, bukan otomatis penuh
WhatsApp tidak mengizinkan aplikasi lain mengirim pesan atas nama nomormu begitu saja. Jadi sekarang alurnya: simpan, WhatsApp terbuka dengan nota sudah terisi, staf menekan **Kirim** (1 ketukan). Gratis dan aman untuk nomor usahamu.

Kalau mau benar-benar otomatis tanpa ketukan, ada jalan resmi (WhatsApp Business Platform / Cloud API) dengan biaya per pesan dan setup tambahan. Kode `Code.gs` bisa ditambah pengirimnya kalau kamu sudah memutuskan jalannya.

## Keamanan dan cadangan
- Semua data ada di Google Sheet milikmu. Jangan bagikan URL Apps Script dan PIN ke sembarang orang.
- Unduh cadangan sesekali dari Setelan > Cadangan.

## Belum ada di versi sederhana ini
Status cucian (dicuci, siap diambil), deposit atau member, cetak struk thermal, pembayaran QRIS otomatis, pengingat pengambilan, dan kirim WhatsApp otomatis penuh.
