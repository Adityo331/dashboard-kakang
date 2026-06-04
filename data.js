/* ================= LEGACY SAMPLE DATA =================
   File ini tidak dipakai oleh halaman utama. Data asli sekarang
   memakai localStorage yang disinkronkan ke Supabase lewat
   supabase-sync.js.
====================================================== */

window.legacySampleData = {
  users: [
    { name: "Adit", email: "adit@student.telkomuniversity.ac.id", password: "123", role: "mahasiswa" },
    { name: "Laboran", email: "laboran@telkomuniversity.ac.id", password: "123", role: "laboran" },
    { name: "Finance", email: "finance@telkomuniversity.ac.id", password: "123", role: "keuangan" },
  ],
  pengajuan: [
    { lab: "Lab Ergonomi", barang: "Kursi Ergonomi", tanggal: "2025-05-12", status: "Pending" },
    { lab: "Lab Produksi", barang: "Masker KN95", tanggal: "2025-05-10", status: "Approved" },
  ],
  honorarium: [
    { nama: "Adit", pertemuan: 8, tarif: 50000, total: 400000, status: "Pending" },
    { nama: "Budi", pertemuan: 10, tarif: 50000, total: 500000, status: "Approved" },
  ],
};
