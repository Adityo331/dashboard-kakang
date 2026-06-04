# Panduan Supabase - FRI Dashboard

Project ini memakai adapter Supabase agar kode lama yang masih berbasis `localStorage` tetap berjalan, tetapi data utama ikut tersimpan ke tabel Supabase terpisah.

## 1. URL Supabase yang benar

Di file `js/supabase-client.js`, Project URL harus berupa base URL project, **tanpa** `/rest/v1/`.

```js
const SUPABASE_URL = "https://rgqxyrytjqtsreisebyf.supabase.co";
```

Jangan pakai format berikut:

```txt
https://rgqxyrytjqtsreisebyf.supabase.co/rest/v1/
```

## 2. Anon/Public Key

Pastikan `SUPABASE_ANON_KEY` di `js/supabase-client.js` berasal dari project Supabase yang sama, yaitu project dengan URL `rgqxyrytjqtsreisebyf`. Kalau URL benar tetapi key dari project lain, data tetap gagal masuk.

## 3. Jalankan SQL

Buka Supabase → SQL Editor, lalu jalankan semua isi file:

```txt
supabase_schema.sql
```

File tersebut membuat tabel:

- `users`
- `pengajuan_bhp`
- `honorarium`
- `notifications`
- `activities`
- `daily_transactions`
- `simulasi_anggaran`
- `monitoring_budget`

Tabel `app_state` hanya disediakan sebagai backup/kompatibilitas, bukan tabel utama.

## 4. Cara cek koneksi

Buka aplikasi melalui Live Server, lalu buka browser Console dan jalankan:

```js
checkFriSupabaseConnection()
```

Kalau tabel sudah benar, hasilnya akan menampilkan status `ok: true` untuk tabel-tabel utama.

Untuk memaksa kirim semua data lokal ke Supabase, jalankan:

```js
forceFriSyncNow()
```

Untuk melihat error terakhir:

```js
friGetSyncStatus()
```

## 5. Catatan

Pada versi ini, proses tambah user, pengajuan BHP, dan honorarium dibuat menunggu proses sync Supabase. Kalau gagal, aplikasi akan memberi alert bahwa data hanya tersimpan di browser dan detail error bisa dilihat dari Console.
