let honorarium = JSON.parse(localStorage.getItem("honorarium")) || [];
let rejectHonorIndex = null;

// ================= FILTER DATA =================

function getHonorKeuanganData() {
  honorarium = JSON.parse(localStorage.getItem("honorarium")) || [];

  const filterTanggal = document.getElementById("filterTanggal")?.value || "";
  const filterLab = (
    document.getElementById("filterLab")?.value || ""
  ).toLowerCase();

  return honorarium
    .map((item, index) => ({
      item,
      realIndex: index,
    }))
    .filter(({ item }) => {
      const statusMatch =
        item.status === "Pending Keuangan" ||
        item.status === "Approved Keuangan" ||
        item.status === "Rejected Keuangan" ||
        item.status === "Pending";

      const tanggalMatch = filterTanggal
        ? item.periodeMulai === filterTanggal ||
          item.periodeSelesai === filterTanggal
        : true;

      const labMatch = filterLab
        ? (item.lab || "").toLowerCase().includes(filterLab)
        : true;

      return statusMatch && tanggalMatch && labMatch;
    })
    .reverse();
}
function resetFilterHonorKeuangan() {
  document.getElementById("filterTanggal").value = "";
  document.getElementById("filterLab").value = "";
  renderKeuanganHonorarium();
}
// ================= RENDER CARDS =================

function renderHonorKeuanganCards() {
  const data = getHonorKeuanganData();

  const total = data.length;

  const pending = data.filter(
    ({ item }) =>
      (item.status || "Pending Keuangan") === "Pending Keuangan" ||
      (item.status || "Pending Keuangan") === "Pending",
  ).length;

  const approved = data.filter(
    ({ item }) => item.status === "Approved Keuangan",
  ).length;

  document.getElementById("totalHonorKeuangan").innerText = total;
  document.getElementById("pendingHonorKeuangan").innerText = pending;
  document.getElementById("approvedHonorKeuangan").innerText = approved;
}

// ================= RENDER TABLE =================

function renderKeuanganHonorarium() {
  const table = document.getElementById("keuanganHonorTable");

  if (!table) return;

  const data = getHonorKeuanganData();

  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="9">
          Belum ada pengajuan honorarium yang masuk ke bagian keuangan.
        </td>
      </tr>
    `;

    renderHonorKeuanganCards();
    return;
  }

  data.forEach(({ item, realIndex }) => {
    const status =
      item.status === "Pending"
        ? "Pending Keuangan"
        : item.status || "Pending Keuangan";

    table.innerHTML += `
      <tr>
        <td>${item.pengaju || "Laboran"}</td>

        <td>${item.lab || "-"}</td>

        <td>${item.pic || "-"}</td>

        <td>
          ${item.periodeMulai || "-"} s/d ${item.periodeSelesai || "-"}
        </td>

        <td>${item.totalAsisten || "-"}</td>

        <td>
          Rp ${Number(item.totalHonor || 0).toLocaleString("id-ID")}
        </td>

        <td>
          <div class="pdf-action">
            <button
              class="btn-preview"
              onclick="previewHonorFile('${item.bap || "-"}')"
            >
              Preview
            </button>

            <button
              class="btn-download"
              onclick="downloadHonorFile('${item.bap || "-"}')"
            >
              Download
            </button>
          </div>
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
            status === "Pending Keuangan"
              ? `
                <button
                  class="btn-approve"
                  onclick="approveHonorKeuangan(${realIndex})"
                >
                  Approve
                </button>

                <button
                  class="btn-reject"
                  onclick="openRejectHonorModal(${realIndex})"
                >
                  Reject
                </button>
              `
              : `<span style="color:#777;">Sudah diproses</span>`
          }
        </td>
      </tr>
    `;
  });

  renderHonorKeuanganCards();
}

// ================= APPROVE =================

async function approveHonorKeuangan(index) {
  honorarium[index].status = "Approved Keuangan";
  honorarium[index].tahap = "Selesai";
  honorarium[index].komentar =
    "Pengajuan honorarium telah disetujui oleh bagian keuangan.";

  if (window.friSaveItem) {
    await window.friSaveItem("honorarium", JSON.stringify(honorarium));
  } else {
    localStorage.setItem("honorarium", JSON.stringify(honorarium));
  }

  if (window.friLastSyncError) {
    alert("Data tersimpan di browser, tetapi gagal update ke Supabase. Cek Console > friGetSyncStatus().");
    console.error("Detail error sync honorarium:", window.friLastSyncError);
    return;
  }

  addNotification(
    "laboran",
    "Honorarium Disetujui Keuangan",
    `Pengajuan honorarium ${honorarium[index].lab} periode ${honorarium[index].periodeMulai} s/d ${honorarium[index].periodeSelesai} telah disetujui.`,
    "laboran-pengajuan-honorarium.html",
  );

  renderKeuanganHonorarium();
}

// ================= REJECT MODAL =================

function openRejectHonorModal(index) {
  rejectHonorIndex = index;

  document.getElementById("rejectHonorInput").value = "";
  document.getElementById("rejectHonorModal").classList.remove("hidden");
}

function closeRejectHonorModal() {
  document.getElementById("rejectHonorModal").classList.add("hidden");

  rejectHonorIndex = null;

  document.getElementById("rejectHonorInput").value = "";
}

async function submitRejectHonor() {
  const komentar = document.getElementById("rejectHonorInput").value.trim();

  if (komentar === "") {
    alert("Komentar wajib diisi.");
    return;
  }

  honorarium[rejectHonorIndex].status = "Rejected Keuangan";
  honorarium[rejectHonorIndex].tahap = "Keuangan";
  honorarium[rejectHonorIndex].komentar = komentar;

  if (window.friSaveItem) {
    await window.friSaveItem("honorarium", JSON.stringify(honorarium));
  } else {
    localStorage.setItem("honorarium", JSON.stringify(honorarium));
  }

  if (window.friLastSyncError) {
    alert("Data tersimpan di browser, tetapi gagal update ke Supabase. Cek Console > friGetSyncStatus().");
    console.error("Detail error sync honorarium:", window.friLastSyncError);
    return;
  }

  addNotification(
    "laboran",
    "Honorarium Ditolak Keuangan",
    `Pengajuan honorarium ${honorarium[rejectHonorIndex].lab} ditolak keuangan dan perlu revisi.`,
    "laboran-pengajuan-honorarium.html",
  );

  renderKeuanganHonorarium();
  closeRejectHonorModal();
}

// ================= STATUS CLASS =================

function getStatusClass(status) {
  if (!status) return "pending";

  if (status.includes("Approved")) return "approved";

  if (status.includes("Rejected")) return "reject";

  return "pending";
}

// ================= PDF SIMULATION =================

function previewHonorFile(fileName) {
  openDocumentPreview(fileName);
}

function downloadHonorFile(fileName) {
  downloadDocumentFile(fileName);
}

// ================= LOAD =================

renderKeuanganHonorarium();
