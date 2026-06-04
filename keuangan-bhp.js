let pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];
let selectedDokumenIndex = null;
let rejectKeuanganIndex = null;

// ================= HELPER FILTER =================

function getFilterKeuangan() {
  return {
    tanggal: document.getElementById("filterTanggal")?.value || "",
    lab: (document.getElementById("filterLab")?.value || "").toLowerCase(),
  };
}

function resetFilterKeuangan() {
  document.getElementById("filterTanggal").value = "";
  document.getElementById("filterLab").value = "";
  renderKeuanganBhp();
}

function getFilteredKeuanganData() {
  const filter = getFilterKeuangan();

  return pengajuan
    .map((item, index) => ({
      item,
      realIndex: index,
    }))
    .filter(({ item }) => {
      const statusMatch =
        item.status === "Pending Keuangan" ||
        item.status === "Approved Keuangan" ||
        item.status === "Rejected Keuangan";

      const tanggalMatch = filter.tanggal
        ? item.tanggal === filter.tanggal
        : true;

      const labMatch = filter.lab
        ? (item.lab || "").toLowerCase().includes(filter.lab)
        : true;

      return statusMatch && tanggalMatch && labMatch;
    })
    .reverse();
}

// ================= RENDER =================

function renderKeuanganBhp() {
  pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];

  const table = document.getElementById("keuanganBhpTable");
  if (!table) return;

  table.innerHTML = "";

  const filtered = getFilteredKeuanganData();

  if (filtered.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; color:#777;">
          Tidak ada pengajuan sesuai filter.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(({ item, realIndex }) => {
    table.innerHTML += `
      <tr>
        <td>${item.pengaju || "Mahasiswa"}</td>
        <td>${item.lab || "-"}</td>
        <td>${item.pic || "-"}</td>
        <td>${item.barang || "-"}</td>
        <td>${item.tanggal || "-"}</td>
        <td>${formatRupiah(item.total || 0)}</td>

        <td>
          <button class="btn-preview" onclick="openDokumenModal(${realIndex})">
            Lihat Kelengkapan
          </button>
        </td>

        <td>
          <span class="status ${getStatusClass(item.status)}">
            ${item.status}
          </span>
        </td>

        <td style="white-space: pre-line; max-width: 240px;">
          ${item.komentar || "-"}
        </td>

        <td>
          ${
            item.status === "Pending Keuangan"
              ? `
                <button class="btn-approve" onclick="approveKeuangan(${realIndex})">
                  Approve
                </button>

                <button class="btn-reject" onclick="openRejectKeuanganModal(${realIndex})">
                  Reject
                </button>
              `
              : "-"
          }
        </td>
      </tr>
    `;
  });
}

// ================= MODAL DOKUMEN =================

function openDokumenModal(realIndex) {
  selectedDokumenIndex = realIndex;

  const item = pengajuan[realIndex];

  document.getElementById("dokumenModalBody").innerHTML =
    renderDokumenKeuangan(item);

  document.getElementById("dokumenModal").classList.remove("hidden");
}

function closeDokumenModal() {
  document.getElementById("dokumenModal").classList.add("hidden");
  selectedDokumenIndex = null;
}

function renderDokumenKeuangan(item) {
  const dokumen = item.dokumen || {};

  const daftarDokumen = [
    {
      label: "Proposal Pengajuan",
      file: dokumen.proposalPengajuan || item.proposal,
      wajib: true,
    },
    {
      label: "Invoice",
      file: dokumen.invoice,
      wajib: true,
    },
    {
      label: "Tagihan CC",
      file: dokumen.tagihanCC,
      wajib: true,
    },
    {
      label: "Kwitansi",
      file: dokumen.kwitansi,
      wajib: Number(item.total || 0) > 5000000,
    },
    {
      label: "Justifikasi",
      file: dokumen.justifikasi,
      wajib: Number(item.total || 0) > 1000000,
    },
    {
      label: "BAST",
      file: dokumen.bast,
      wajib: Number(item.total || 0) > 1000000,
    },
  ];

  return `
    <div class="dokumen-modal-list">
      ${daftarDokumen
        .map((doc) => {
          const adaFile = doc.file && doc.file !== "-";

          return `
            <div class="dokumen-modal-item">
              <div>
                <h4>${doc.label}</h4>
                <p>
                  ${
                    adaFile
                      ? doc.file
                      : doc.wajib
                        ? "Belum diupload"
                        : "Opsional / tidak diupload"
                  }
                </p>
              </div>

              <div>
                ${
                  adaFile
                    ? `
                      <button class="btn-preview" onclick="previewFile('${doc.file}')">
                        Preview
                      </button>

                      <button class="btn-download" onclick="downloadFile('${doc.file}')">
                        Download
                      </button>
                    `
                    : `
                      <span class="status reject">
                        ${doc.wajib ? "Wajib" : "Opsional"}
                      </span>
                    `
                }
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

// ================= APPROVE =================

async function approveKeuangan(realIndex) {
  pengajuan[realIndex].status = "Approved Keuangan";
  pengajuan[realIndex].komentar = "Pengajuan telah disetujui bagian keuangan.";

  if (window.friSaveItem) {
    await window.friSaveItem("pengajuan", JSON.stringify(pengajuan));
  } else {
    localStorage.setItem("pengajuan", JSON.stringify(pengajuan));
  }

  if (window.friLastSyncError) {
    alert("Data tersimpan di browser, tetapi gagal update ke Supabase. Cek Console > friGetSyncStatus().");
    console.error("Detail error sync pengajuan:", window.friLastSyncError);
    return;
  }

  if (typeof addActivity === "function") {
    addActivity(
      "Keuangan",
      "Approve BHP",
      `${pengajuan[realIndex].barang} dari ${pengajuan[realIndex].lab} disetujui keuangan.`,
      "BHP",
    );
  }

  if (pengajuan[realIndex].pengaju === "Mahasiswa") {
    addNotification(
      "mahasiswa",
      "Pengajuan BHP Disetujui Keuangan",
      `Pengajuan ${pengajuan[realIndex].barang} telah disetujui bagian keuangan.`,
      "pengajuan-bhp.html",
      pengajuan[realIndex].username || "",
    );
  }

  addNotification(
    "laboran",
    "BHP Disetujui Keuangan",
    `Pengajuan BHP ${pengajuan[realIndex].barang} telah disetujui keuangan.`,
    "laboran-pengajuan-bhp.html",
  );

  let transaksi = JSON.parse(localStorage.getItem("dailyTransactions")) || [];

  const sudahAda = transaksi.some(
    (trx) =>
      trx.sumber === "BHP" &&
      trx.barang === pengajuan[realIndex].barang &&
      trx.tanggal === pengajuan[realIndex].tanggal,
  );

  if (!sudahAda) {
    transaksi.push({
      tanggal: pengajuan[realIndex].tanggal,
      kategori: "BHP",
      barang: pengajuan[realIndex].barang,
      lab: pengajuan[realIndex].lab,
      nominal: Number(pengajuan[realIndex].total || 0),
      sumber: "BHP",
      status: "Approved Keuangan",
    });

    if (window.friSaveItem) {
      await window.friSaveItem("dailyTransactions", JSON.stringify(transaksi));
    } else {
      localStorage.setItem("dailyTransactions", JSON.stringify(transaksi));
    }
  }

  renderKeuanganBhp();
}

// ================= REJECT MODAL =================

function openRejectKeuanganModal(realIndex) {
  rejectKeuanganIndex = realIndex;

  document.getElementById("rejectKeuanganInput").value = "";
  document.getElementById("rejectKeuanganModal").classList.remove("hidden");
}

function closeRejectKeuanganModal() {
  document.getElementById("rejectKeuanganModal").classList.add("hidden");

  rejectKeuanganIndex = null;

  document.getElementById("rejectKeuanganInput").value = "";
}

async function submitRejectKeuangan() {
  const alasan = document.getElementById("rejectKeuanganInput").value.trim();

  if (alasan === "") {
    alert("Komentar penolakan wajib diisi.");
    return;
  }

  pengajuan[rejectKeuanganIndex].status = "Rejected Keuangan";
  pengajuan[rejectKeuanganIndex].komentar = alasan;

  if (window.friSaveItem) {
    await window.friSaveItem("pengajuan", JSON.stringify(pengajuan));
  } else {
    localStorage.setItem("pengajuan", JSON.stringify(pengajuan));
  }

  if (window.friLastSyncError) {
    alert("Data tersimpan di browser, tetapi gagal update ke Supabase. Cek Console > friGetSyncStatus().");
    console.error("Detail error sync pengajuan:", window.friLastSyncError);
    return;
  }

  if (typeof addActivity === "function") {
    addActivity(
      "Keuangan",
      "Reject BHP",
      `${pengajuan[rejectKeuanganIndex].barang} dari ${pengajuan[rejectKeuanganIndex].lab} ditolak keuangan.`,
      "BHP",
    );
  }

  if (pengajuan[rejectKeuanganIndex].pengaju === "Mahasiswa") {
    // Jika pengajuan berasal dari asisten/mahasiswa, notifikasi reject hanya masuk ke asisten terkait.
    addNotification(
      "mahasiswa",
      "Pengajuan BHP Ditolak Keuangan",
      `Pengajuan ${pengajuan[rejectKeuanganIndex].barang} ditolak keuangan dan perlu revisi.`,
      "pengajuan-bhp.html",
      pengajuan[rejectKeuanganIndex].username || "",
    );
  } else {
    // Jika pengajuan berasal dari laboran, notifikasi reject masuk ke laboran.
    addNotification(
      "laboran",
      "BHP Ditolak Keuangan",
      `Pengajuan BHP ${pengajuan[rejectKeuanganIndex].barang} ditolak keuangan dan perlu revisi.`,
      "laboran-pengajuan-bhp.html",
    );
  }

  renderKeuanganBhp();
  closeRejectKeuanganModal();
}

// ================= STATUS CLASS =================

function getStatusClass(status) {
  if (!status) return "pending";
  if (status.includes("Approved")) return "approved";
  if (status.includes("Rejected")) return "reject";
  return "pending";
}

// ================= FORMAT RUPIAH =================

function formatRupiah(angka) {
  return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

// ================= PDF =================

function previewFile(fileName) {
  openDocumentPreview(fileName);
}

function downloadFile(fileName) {
  downloadDocumentFile(fileName);
}

// ================= LOAD =================

renderKeuanganBhp();
