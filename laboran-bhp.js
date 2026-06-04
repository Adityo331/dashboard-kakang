let pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];
let editIndex = null;

// ================= RENDER TABLE =================

function renderLaboranBhpTable() {
  pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];

  const table = document.getElementById("laboranBhpTable");
  if (!table) return;

  table.innerHTML = "";

  const laboranPengajuan = pengajuan
    .map((item, index) => ({
      item,
      realIndex: index,
    }))
    .filter(({ item }) => item.pengaju === "Laboran")
    .reverse();

  if (laboranPengajuan.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:#777;">
          Belum ada pengajuan BHP laboran.
        </td>
      </tr>
    `;
    return;
  }

  laboranPengajuan.forEach(({ item, realIndex }) => {
    const status = item.status || "Pending Keuangan";

    table.innerHTML += `
      <tr>
        <td>${item.pengaju || "Laboran"}</td>
        <td>${item.lab || "-"}</td>
        <td>${item.pic || "-"}</td>
        <td>${item.barang || "-"}</td>
        <td>${item.tanggal || "-"}</td>

        <td>
          <button class="btn-preview" onclick="openDokumenModalLaboran(${realIndex})">
            Lihat Kelengkapan
          </button>
        </td>

        <td>
          <span class="status ${getStatusClass(status)}">
            ${status}
          </span>
        </td>

        <td style="white-space: pre-line; max-width: 240px;">
          ${item.komentar || "-"}
        </td>

        <td>
${
  status !== "Approved Keuangan"
    ? `
      <button class="btn-edit" onclick="editLaboranBhp(${realIndex})">
        ${status === "Rejected Keuangan" ? "Revisi" : "Edit"}
      </button>
    `
    : ""
}

          <button class="btn-delete" onclick="deleteLaboranBhp(${realIndex})">
            Hapus
          </button>
        </td>
      </tr>
    `;
  });
}

// ================= STATUS CLASS =================

function getStatusClass(status) {
  if (!status) return "pending";
  if (status.includes("Approved")) return "approved";
  if (status.includes("Rejected")) return "reject";
  return "pending";
}

// ================= MODAL TAMBAH / REVISI =================

function openLaboranBhpModal() {
  if (editIndex === null) {
    clearLaboranBhpForm();
  }

  document.getElementById("laboranBhpModal").classList.remove("hidden");
}

function closeLaboranBhpModal() {
  document.getElementById("laboranBhpModal").classList.add("hidden");
  clearLaboranBhpForm();
  editIndex = null;
}

function clearLaboranBhpForm() {
  document.getElementById("labInput").value = "";
  document.getElementById("barangInput").value = "";
  document.getElementById("detailInput").value = "";
  document.getElementById("linkInput").value = "";
  document.getElementById("jenisInput").value = "";
  document.getElementById("tanggalInput").value = "";
  document.getElementById("picInput").value = "";
  document.getElementById("tipeInput").value = "";
  document.getElementById("totalInput").value = "";

  document.getElementById("proposalInput").value = "";
  document.getElementById("invoiceInput").value = "";
  document.getElementById("tagihanInput").value = "";
  document.getElementById("kwitansiInput").value = "";
  document.getElementById("justifikasiInput").value = "";
  document.getElementById("bastInput").value = "";
}

// ================= EDIT / REVISI =================

function editLaboranBhp(index) {
  const item = pengajuan[index];

  editIndex = index;

  document.getElementById("labInput").value = item.lab || "";
  document.getElementById("barangInput").value = item.barang || "";
  document.getElementById("detailInput").value = item.detail || "";
  document.getElementById("linkInput").value = item.linkPembelian || "";
  document.getElementById("jenisInput").value = item.jenisKebutuhan || "";
  document.getElementById("tanggalInput").value = item.tanggal || "";
  document.getElementById("picInput").value = item.pic || "";
  document.getElementById("tipeInput").value = item.tipePertanggungan || "";
  document.getElementById("totalInput").value = item.total || "";

  document.getElementById("proposalInput").value = "";
  document.getElementById("invoiceInput").value = "";
  document.getElementById("tagihanInput").value = "";
  document.getElementById("kwitansiInput").value = "";
  document.getElementById("justifikasiInput").value = "";
  document.getElementById("bastInput").value = "";

  document.getElementById("laboranBhpModal").classList.remove("hidden");
}

// ================= SAVE =================

async function saveLaboranBhp() {
  pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];

  const lab = document.getElementById("labInput").value.trim();
  const barang = document.getElementById("barangInput").value.trim();
  const detail = document.getElementById("detailInput").value.trim();
  const link = document.getElementById("linkInput").value.trim();
  const jenis = document.getElementById("jenisInput").value.trim();
  const tanggal = document.getElementById("tanggalInput").value;
  const pic = document.getElementById("picInput").value.trim();
  const tipe = document.getElementById("tipeInput").value.trim();
  const total = Number(document.getElementById("totalInput").value);

  const proposal = document.getElementById("proposalInput").files[0];
  const invoice = document.getElementById("invoiceInput").files[0];
  const tagihan = document.getElementById("tagihanInput").files[0];
  const kwitansi = document.getElementById("kwitansiInput").files[0];
  const justifikasi = document.getElementById("justifikasiInput").files[0];
  const bast = document.getElementById("bastInput").files[0];

  const oldData = editIndex !== null ? pengajuan[editIndex] : null;
  const oldDokumen = oldData ? oldData.dokumen || {} : {};

  if (
    lab === "" ||
    barang === "" ||
    detail === "" ||
    link === "" ||
    jenis === "" ||
    tanggal === "" ||
    pic === "" ||
    tipe === "" ||
    !total
  ) {
    alert("Lengkapi seluruh data pengajuan.");
    return;
  }

  const proposalName = proposal
    ? proposal.name
    : oldDokumen.proposalPengajuan || oldData?.proposal || "";

  const invoiceName = invoice ? invoice.name : oldDokumen.invoice || "";
  const tagihanName = tagihan ? tagihan.name : oldDokumen.tagihanCC || "";
  const kwitansiName = kwitansi ? kwitansi.name : oldDokumen.kwitansi || "-";
  const justifikasiName = justifikasi
    ? justifikasi.name
    : oldDokumen.justifikasi || "-";
  const bastName = bast ? bast.name : oldDokumen.bast || "-";

  if (!proposalName || !invoiceName || !tagihanName) {
    alert("Proposal, Invoice, dan Tagihan CC wajib diupload.");
    return;
  }

  if (total > 1000000 && (justifikasiName === "-" || bastName === "-")) {
    alert(
      "Jika total di atas Rp1.000.000 maka Justifikasi dan BAST wajib diupload.",
    );
    return;
  }

  if (total > 5000000 && kwitansiName === "-") {
    alert("Jika total di atas Rp5.000.000 maka Kwitansi wajib diupload.");
    return;
  }

  const dataBaru = {
    pengaju: "Laboran",
    lab,
    barang,
    tanggal,

    proposal: proposalName,
    detail,
    linkPembelian: link,
    jenisKebutuhan: jenis,
    pic,
    tipePertanggungan: tipe,
    total,

    dokumen: {
      proposalPengajuan: proposalName,
      invoice: invoiceName,
      tagihanCC: tagihanName,
      kwitansi: kwitansiName,
      justifikasi: justifikasiName,
      bast: bastName,
    },

    status: "Pending Keuangan",
    tahap: "Keuangan",
    komentar:
      editIndex !== null ? "Revisi telah dikirim ulang ke keuangan." : "",
  };

  if (editIndex !== null) {
    pengajuan[editIndex] = {
      ...pengajuan[editIndex],
      ...dataBaru,
    };
  } else {
    pengajuan.push(dataBaru);
  }

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

  addNotification(
    "keuangan",
    editIndex !== null ? "Revisi BHP Laboran Masuk" : "Pengajuan BHP Laboran Baru",
    `${editIndex !== null ? "Revisi" : "Pengajuan"} BHP ${barang} dari ${lab} menunggu validasi keuangan.`,
    "keuangan-bhp.html",
  );

  renderLaboranBhpTable();
  closeLaboranBhpModal();
}

// ================= MODAL DOKUMEN =================

function openDokumenModalLaboran(index) {
  const item = pengajuan[index];

  document.getElementById("dokumenModalBody").innerHTML =
    renderDokumenLaboran(item);

  document.getElementById("dokumenModal").classList.remove("hidden");
}

function closeDokumenModal() {
  document.getElementById("dokumenModal").classList.add("hidden");
}

function renderDokumenLaboran(item) {
  const dokumen = item.dokumen || {};

  const daftarDokumen = [
    {
      label: "Proposal Pengajuan",
      file: dokumen.proposalPengajuan || item.proposal,
    },
    {
      label: "Invoice",
      file: dokumen.invoice,
    },
    {
      label: "Tagihan CC",
      file: dokumen.tagihanCC,
    },
    {
      label: "Kwitansi",
      file: dokumen.kwitansi,
    },
    {
      label: "Justifikasi",
      file: dokumen.justifikasi,
    },
    {
      label: "BAST",
      file: dokumen.bast,
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
                <p>${adaFile ? doc.file : "Opsional / tidak diupload"}</p>
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
                    : `<span class="status reject">Kosong</span>`
                }
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

// ================= DELETE =================

async function deleteLaboranBhp(index) {
  if (!confirm("Yakin ingin menghapus pengajuan ini?")) return;

  pengajuan.splice(index, 1);
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

  renderLaboranBhpTable();
}

// ================= FILE =================

function previewFile(fileName) {
  openDocumentPreview(fileName);
}

function downloadFile(fileName) {
  downloadDocumentFile(fileName);
}

// ================= LOGOUT =================

function logout() {
  localStorage.removeItem("loginUser");
  sessionStorage.removeItem("loginUser");
  window.location.href = "../index.html";
}

// ================= LOAD =================

renderLaboranBhpTable();
