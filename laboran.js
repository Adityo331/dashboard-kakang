let pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];
let rejectIndex = null;
let approveIndex = null;

// ================= HELPER FILTER =================

function getFilterLaboran() {
  return {
    tanggal: document.getElementById("filterTanggal")?.value || "",
    lab: (document.getElementById("filterLab")?.value || "").toLowerCase(),
  };
}

function isMatchFilter(item) {
  const filter = getFilterLaboran();

  const tanggalMatch = filter.tanggal ? item.tanggal === filter.tanggal : true;

  const labMatch = filter.lab
    ? (item.lab || "").toLowerCase().includes(filter.lab)
    : true;

  return tanggalMatch && labMatch;
}

function resetFilterLaboran() {
  document.getElementById("filterTanggal").value = "";
  document.getElementById("filterLab").value = "";
  renderLaboran();
}

// ================= RENDER TABLE =================

function renderLaboran() {
  pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];

  const table = document.getElementById("laboranTable");
  if (!table) return;

  table.innerHTML = "";

  const filteredPengajuan = pengajuan
    .map((item, index) => ({
      item,
      realIndex: index,
    }))
    .filter(({ item }) => isMatchFilter(item))
    .reverse();

  if (filteredPengajuan.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:#777;">
          Tidak ada data pengajuan sesuai filter.
        </td>
      </tr>
    `;

    updateCards();
    return;
  }

  filteredPengajuan.forEach(({ item, realIndex }) => {
    const status = item.status || "Pending Laboran";
    const pengaju = item.pengaju || "Mahasiswa";

    table.innerHTML += `
      <tr>
        <td>${pengaju}</td>
        <td>${item.lab || "-"}</td>
        <td>${item.pic || "-"}</td>
        <td>${item.barang || "-"}</td>
        <td>${item.tanggal || "-"}</td>

        <td>
          <span class="pdf-file">
            <i class="fa-solid fa-file-pdf"></i>
            ${item.proposal || "-"}
          </span>
        </td>

        <td>
          <span class="status ${getStatusClass(status)}">
            ${status}
          </span>
        </td>

        <td style="white-space: pre-line; max-width: 260px;">
          ${item.komentar || "-"}
        </td>

        <td>
          <div class="action-group">
            <button
              class="btn-preview"
              onclick="openDetailPengajuan(${realIndex})"
            >
              Detail
            </button>

            <button
              class="btn-preview"
              onclick="previewLaboranFile('${item.proposal || "-"}')"
            >
              Preview
            </button>

            <button
              class="btn-download"
              onclick="downloadLaboranFile('${item.proposal || "-"}')"
            >
              Download
            </button>

            ${
              pengaju === "Mahasiswa" && status === "Pending Laboran"
                ? `
                  <button
                    class="btn-approve"
                    onclick="openApproveModal(${realIndex})"
                  >
                    Approve
                  </button>

                  <button
                    class="btn-reject"
                    onclick="openRejectModal(${realIndex})"
                  >
                    Reject
                  </button>
                `
                : `<span style="color:#777;">Sudah diproses</span>`
            }
          </div>
        </td>
      </tr>
    `;
  });

  updateCards();
}

// ================= STATUS CLASS =================

function getStatusClass(status) {
  if (!status) return "pending";
  if (status.includes("Approved")) return "approved";
  if (status.includes("Rejected")) return "reject";
  return "pending";
}

// ================= UPDATE CARD =================

function updateCards() {
  const total = pengajuan.length;

  const pending = pengajuan.filter(
    (item) => (item.status || "Pending Laboran") === "Pending Laboran",
  ).length;

  const approved = pengajuan.filter(
    (item) =>
      item.status === "Pending Keuangan" || item.status === "Approved Keuangan",
  ).length;

  document.getElementById("totalPengajuan").innerText = total;
  document.getElementById("pendingPengajuan").innerText = pending;
  document.getElementById("approvedPengajuan").innerText = approved;
}

// ================= OPEN APPROVE MODAL =================

function openApproveModal(index) {
  const item = pengajuan[index];
  approveIndex = index;

  document.getElementById("approveLab").value = item.lab || "";
  document.getElementById("approveBarang").value = item.barang || "";
  if (document.getElementById("existingProposalName")) {
    document.getElementById("existingProposalName").innerText = item.proposal || "-";
  }

  document.getElementById("approveDetail").value = "";
  document.getElementById("approveLink").value = "";
  document.getElementById("approveJenis").value = "";
  document.getElementById("approveJustifikasi").value = "";
  document.getElementById("approveTanggalPenggunaan").value = "";
  document.getElementById("approvePic").value = "";
  document.getElementById("approveTipe").value = "";
  document.getElementById("approveTotal").value = "";

  document.getElementById("docInvoice").value = "";
  document.getElementById("docKwitansi").value = "";
  document.getElementById("docTagihan").value = "";
  document.getElementById("docJustifikasi").value = "";
  document.getElementById("docBast").value = "";

  document.getElementById("approveModal").classList.remove("hidden");
}

// ================= CLOSE APPROVE MODAL =================

function closeApproveModal() {
  document.getElementById("approveModal").classList.add("hidden");
  approveIndex = null;
}

// ================= SUBMIT APPROVE TO KEUANGAN =================

function submitApproveToKeuangan() {
  if (approveIndex === null) {
    alert("Data pengajuan tidak ditemukan.");
    return;
  }

  const detail = document.getElementById("approveDetail").value.trim();
  const link = document.getElementById("approveLink").value.trim();
  const jenis = document.getElementById("approveJenis").value.trim();
  const justifikasi = document
    .getElementById("approveJustifikasi")
    .value.trim();
  const tanggalPenggunaan = document.getElementById(
    "approveTanggalPenggunaan",
  ).value;
  const pic = document.getElementById("approvePic").value.trim();
  const tipe = document.getElementById("approveTipe").value.trim();
  const total = document.getElementById("approveTotal").value.trim();

  const totalNumber = Number(total);

  const existingProposal = pengajuan[approveIndex].proposal || "-";
  const docInvoice = document.getElementById("docInvoice").files[0];
  const docKwitansi = document.getElementById("docKwitansi").files[0];
  const docTagihan = document.getElementById("docTagihan").files[0];
  const docJustifikasi = document.getElementById("docJustifikasi").files[0];
  const docBast = document.getElementById("docBast").files[0];

  if (
    detail === "" ||
    link === "" ||
    jenis === "" ||
    justifikasi === "" ||
    tanggalPenggunaan === "" ||
    pic === "" ||
    tipe === "" ||
    total === ""
  ) {
    alert("Lengkapi seluruh data penerusan pengajuan.");
    return;
  }

  if (isNaN(totalNumber) || totalNumber <= 0) {
    alert("Total harus berupa angka lebih dari 0.");
    return;
  }

  if (!docInvoice || !docTagihan) {
    alert("Invoice dan Tagihan CC wajib diupload. Proposal sudah menggunakan file dari asisten.");
    return;
  }

  if (totalNumber > 1000000 && (!docJustifikasi || !docBast)) {
    alert(
      "Jika total pengajuan di atas Rp1.000.000 maka dokumen Justifikasi dan BAST wajib diupload. Jika total Rp1.000.000 atau di bawahnya, dokumen Justifikasi dan BAST boleh dikosongkan.",
    );
    return;
  }

  if (totalNumber > 5000000 && !docKwitansi) {
    alert(
      "Jika total pengajuan di atas Rp5.000.000 maka dokumen Kwitansi wajib diupload. Jika total Rp5.000.000 atau di bawahnya, dokumen Kwitansi boleh dikosongkan.",
    );
    return;
  }

  pengajuan[approveIndex] = {
    ...pengajuan[approveIndex],

    status: "Pending Keuangan",
    tahap: "Keuangan",
    komentar: "Pengajuan telah disetujui laboran dan diteruskan ke keuangan.",

    detail,
    linkPembelian: link,
    jenisKebutuhan: jenis,
    justifikasi,
    tanggalPenggunaan,
    pic,
    tipePertanggungan: tipe,
    total: totalNumber,

    dokumen: {
      proposalPengajuan: existingProposal,
      invoice: docInvoice.name,
      tagihanCC: docTagihan.name,
      kwitansi: docKwitansi ? docKwitansi.name : "-",
      justifikasi: docJustifikasi ? docJustifikasi.name : "-",
      bast: docBast ? docBast.name : "-",
    },
  };

  (window.friSetItem || localStorage.setItem.bind(localStorage))("pengajuan", JSON.stringify(pengajuan));

  if (typeof addActivity === "function") {
    addActivity(
      "Laboran",
      "Approve BHP",
      `${pengajuan[approveIndex].barang} dari ${pengajuan[approveIndex].lab} diteruskan ke keuangan.`,
      "BHP",
    );
  }

  addNotification(
    "keuangan",
    "Pengajuan BHP Masuk",
    `Pengajuan BHP ${pengajuan[approveIndex].barang} dari ${pengajuan[approveIndex].lab} menunggu validasi keuangan.`,
    "keuangan-bhp.html",
  );

  if (pengajuan[approveIndex].pengaju === "Mahasiswa") {
    addNotification(
      "mahasiswa",
      "Pengajuan BHP Disetujui Laboran",
      `Pengajuan ${pengajuan[approveIndex].barang} telah diteruskan ke bagian keuangan.`,
      "pengajuan-bhp.html",
      pengajuan[approveIndex].username || "",
    );
  }

  renderLaboran();
  closeApproveModal();
}

// ================= MODAL REJECT =================

function openRejectModal(index) {
  rejectIndex = index;
  document.getElementById("rejectKomentarInput").value = "";
  document.getElementById("rejectModal").classList.remove("hidden");
}

function closeRejectModal() {
  document.getElementById("rejectModal").classList.add("hidden");
  rejectIndex = null;
  document.getElementById("rejectKomentarInput").value = "";
}

function submitReject() {
  const komentar = document.getElementById("rejectKomentarInput").value.trim();

  if (komentar === "") {
    alert("Komentar revisi wajib diisi.");
    return;
  }

  pengajuan[rejectIndex].status = "Rejected Laboran";
  pengajuan[rejectIndex].tahap = "Laboran";
  pengajuan[rejectIndex].komentar = komentar;

  (window.friSetItem || localStorage.setItem.bind(localStorage))("pengajuan", JSON.stringify(pengajuan));

  if (typeof addActivity === "function") {
    addActivity(
      "Laboran",
      "Reject BHP",
      `${pengajuan[rejectIndex].barang} dari ${pengajuan[rejectIndex].lab} ditolak laboran.`,
      "BHP",
    );
  }

  addNotification(
    "mahasiswa",
    "Pengajuan BHP Perlu Revisi",
    `Pengajuan ${pengajuan[rejectIndex].barang} ditolak laboran. Silakan upload revisi.`,
    "pengajuan-bhp.html",
    pengajuan[rejectIndex].username || "",
  );

  renderLaboran();
  closeRejectModal();
}

// ================= MODAL TAMBAH BHP LABORAN =================

function openLaboranModal() {
  document.getElementById("laboranModal").classList.remove("hidden");
}

function closeLaboranModal() {
  document.getElementById("laboranModal").classList.add("hidden");
}

// ================= ADD PENGAJUAN BHP LABORAN =================

function addLaboranPengajuan() {
  const lab = document.getElementById("labInput").value;
  const barang = document.getElementById("barangInput").value;
  const tanggal = document.getElementById("tanggalInput").value;
  const proposalFile = document.getElementById("proposalInput").files[0];

  if (barang === "" || tanggal === "" || !proposalFile) {
    alert("Lengkapi semua data dan upload proposal PDF.");
    return;
  }

  pengajuan.push({
    pengaju: "Laboran",
    lab,
    barang,
    tanggal,
    proposal: proposalFile.name,
    status: "Pending Keuangan",
    tahap: "Keuangan",
    komentar: "",
  });

  (window.friSetItem || localStorage.setItem.bind(localStorage))("pengajuan", JSON.stringify(pengajuan));

  renderLaboran();
  closeLaboranModal();

  document.getElementById("barangInput").value = "";
  document.getElementById("tanggalInput").value = "";
  document.getElementById("proposalInput").value = "";
}


// ================= DETAIL PENGAJUAN =================

function openDetailPengajuan(index) {
  const item = pengajuan[index];
  const body = document.getElementById("detailPengajuanBody");
  if (!item || !body) return;

  body.innerHTML = `
    <div class="detail-grid">
      <div><b>Pengaju</b><p>${item.pengaju || "Mahasiswa"}</p></div>
      <div><b>Laboratorium</b><p>${item.lab || "-"}</p></div>
      <div><b>Barang</b><p>${item.barang || "-"}</p></div>
      <div><b>Tanggal Pengajuan</b><p>${item.tanggal || "-"}</p></div>
      <div><b>Total</b><p>${formatDetailRupiah(item.total || 0)}</p></div>
      <div><b>Status</b><p><span class="status ${getStatusClass(item.status || "Pending Laboran")}">${item.status || "Pending Laboran"}</span></p></div>
      <div class="detail-wide"><b>Detail Kebutuhan</b><p>${item.detail || "Belum dilengkapi"}</p></div>
      <div class="detail-wide"><b>Komentar</b><p style="white-space:pre-line;">${item.komentar || "-"}</p></div>
    </div>

    <div class="timeline-box">
      <h3>Timeline Status</h3>
      ${renderStatusTimeline(item)}
    </div>
  `;

  document.getElementById("detailPengajuanModal").classList.remove("hidden");
}

function closeDetailPengajuanModal() {
  document.getElementById("detailPengajuanModal").classList.add("hidden");
}

function renderStatusTimeline(item) {
  const status = item.status || "Pending Laboran";

  const steps = [
    { label: "Pengajuan Dibuat", active: true },
    { label: "Validasi Laboran", active: ["Pending Keuangan", "Approved Keuangan", "Rejected Keuangan"].includes(status), rejected: status === "Rejected Laboran" },
    { label: "Validasi Keuangan", active: status === "Approved Keuangan", rejected: status === "Rejected Keuangan" },
  ];

  return `
    <div class="timeline">
      ${steps
        .map((step) => `
          <div class="timeline-step ${step.active ? "active" : ""} ${step.rejected ? "rejected" : ""}">
            <span>${step.rejected ? "×" : "✓"}</span>
            <p>${step.label}</p>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function formatDetailRupiah(value) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

// ================= FILE ACTION =================

function previewLaboranFile(fileName) {
  openDocumentPreview(fileName);
}

function downloadLaboranFile(fileName) {
  downloadDocumentFile(fileName);
}

// ================= LOGOUT =================

function logout() {
  localStorage.removeItem("loginUser");
  sessionStorage.removeItem("loginUser");
  window.location.href = "../index.html";
}

// ================= LOAD =================

renderLaboran();
