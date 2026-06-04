# Supabase Tabel Terpisah - FRI Dashboard

Versi ini tidak lagi mengandalkan tabel `app_state` sebagai penyimpanan utama. Data disinkronkan ke tabel terpisah:

- `users`
- `pengajuan_bhp`
- `honorarium`
- `notifications`
- `activities`
- `daily_transactions`
- `simulasi_anggaran`
- `monitoring_budget`

## Langkah setup

1. Buka Supabase → SQL Editor.
2. Jalankan isi file `supabase_schema.sql`.
3. Pastikan `js/supabase-client.js` berisi URL tanpa `/rest/v1/`.
4. Jalankan aplikasi.
5. Tambah pengajuan baru.
6. Cek Supabase Table Editor → `pengajuan_bhp`.

## Test manual

Di browser console:

```js
forceFriSyncNow()
```

Jika sukses, console menampilkan:

```txt
Berhasil sync ke Supabase: pengajuan -> pengajuan_bhp
```
