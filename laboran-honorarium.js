let honorarium = JSON.parse(localStorage.getItem("honorarium")) || [];
let editHonorIndex = null;

// ================= RENDER TABLE =================

function renderHonorariumTable() {
  honorarium = JSON.parse(localStorage.getItem("honorarium")) || [];

  const table = document.getElementById("honorariumTable");
  if (!table) return;

  table.innerHTML = "";

  const dataTerbaru = honorarium
    .map((item, index) => ({
      item,
      realIndex: index,
    }))
    .reverse();

  if (dataTerbaru.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="11" style="text-align:center; color:#777;">
          Belum ada pengajuan honorarium.
        </td>
      </tr>
    `;
    return;
  }

  dataTerbaru.forEach(({ item, realIndex }) => {
    const status = item.status || "Pending Keuangan";

    table.innerHTML += `
      <tr>
        <td>${item.pengaju || "Laboran"}</td>
        <td>${item.lab || "-"}</td>
        <td>${item.pic || "-"}</td>
        <td>${item.periodeMulai || "-"}</td>
        <td>${item.periodeSelesai || "-"}</td>
        <td>${item.totalAsisten || 0}</td>

        <td>
          Rp ${Number(item.totalHonor || 0).toLocaleString("id-ID")}
        </td>

        <td>
          <div class="pdf-action">
            <button class="btn-preview" onclick="previewBap('${item.bap || "-"}')">
              Preview
            </button>

            <button class="btn-download" onclick="downloadBap('${item.bap || "-"}')">
              Download
            </button>
          </div>
        </td>

        <td>
          <span class="status ${getStatusClass(status)}">
            ${status}
          </span>
        </td>

        <td style="white-space: pre-line; max-width:240px;">
          ${item.komentar || "-"}
        </td>

        <td>
          ${
            status !== "Approved Keuangan"
              ? `
                <button class="btn-edit" onclick="editHonorarium(${realIndex})">
                  ${status === "Rejected Keuangan" ? "Revisi" : "Edit"}
                </button>
              `
              : ""
          }

          <button class="btn-delete" onclick="deleteHonorarium(${realIndex})">
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

// ================= MODAL =================

function openHonorModal() {
  document.getElementById("honorModal").classList.remove("hidden");
}

function closeHonorModal() {
  document.getElementById("honorModal").classList.add("hidden");

  editHonorIndex = null;

  document.getElementById("labHonorInput").value = "";
  document.getElementById("picHonorInput").value = "";
  document.getElementById("periodeMulaiInput").value = "";
  document.getElementById("periodeSelesaiInput").value = "";
  document.getElementById("totalAsistenInput").value = "";
  document.getElementById("totalHonorInput").value = "";
  document.getElementById("bapInput").value = "";
}

// ================= SAVE ADD / EDIT =================

async function saveHonorarium() {
  honorarium = JSON.parse(localStorage.getItem("honorarium")) || [];

  const lab = document.getElementById("labHonorInput").value.trim();
  const pic = document.getElementById("picHonorInput").value.trim();
  const periodeMulai = document.getElementById("periodeMulaiInput").value;
  const periodeSelesai = document.getElementById("periodeSelesaiInput").value;
  const totalAsisten = document.getElementById("totalAsistenInput").value;
  const totalHonor = document.getElementById("totalHonorInput").value;
  const bapFile = document.getElementById("bapInput").files[0];

  if (
    lab === "" ||
    pic === "" ||
    periodeMulai === "" ||
    periodeSelesai === "" ||
    totalAsisten === "" ||
    totalHonor === ""
  ) {
    alert("Lengkapi semua data pengajuan honorarium.");
    return;
  }

  if (periodeSelesai < periodeMulai) {
    alert("Periode selesai tidak boleh lebih awal dari periode mulai.");
    return;
  }

  if (editHonorIndex !== null) {
    const oldData = honorarium[editHonorIndex];

    honorarium[editHonorIndex] = {
      ...oldData,
      pengaju: "Laboran",
      lab,
      pic,
      periodeMulai,
      periodeSelesai,
      totalAsisten,
      pic,
      totalHonor,
      bap: bapFile ? bapFile.name : oldData.bap,

      status:
        oldData.status === "Rejected Keuangan"
          ? "Pending Keuangan"
          : oldData.status || "Pending Keuangan",

      tahap: "Keuangan",

      komentar:
        oldData.status === "Rejected Keuangan"
          ? "Revisi honorarium telah dikirim ulang."
          : oldData.komentar || "",
    };
  } else {
    if (!bapFile) {
      alert("Upload BAP Praktikum PDF wajib diisi.");
      return;
    }

    honorarium.push({
      pengaju: "Laboran",
      lab,
      pic,
      periodeMulai,
      periodeSelesai,
      totalAsisten,
      pic,
      totalHonor,
      bap: bapFile.name,
      status: "Pending Keuangan",
      tahap: "Keuangan",
      komentar: "",
    });
  }

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

  if (typeof addNotification === "function") {
    addNotification(
      "keuangan",
      editHonorIndex !== null
        ? "Revisi Honorarium Masuk"
        : "Pengajuan Honorarium Baru",
      `${editHonorIndex !== null ? "Revisi" : "Pengajuan"} honorarium ${lab} periode ${periodeMulai} s/d ${periodeSelesai} menunggu validasi keuangan.`,
      "keuangan-honorarium.html",
    );
  }

  renderHonorariumTable();
  closeHonorModal();
}

// ================= EDIT =================

function editHonorarium(index) {
  const item = honorarium[index];

  document.getElementById("labHonorInput").value = item.lab || "";
  document.getElementById("picHonorInput").value = item.pic || "";
  document.getElementById("periodeMulaiInput").value = item.periodeMulai || "";
  document.getElementById("periodeSelesaiInput").value =
    item.periodeSelesai || "";
  document.getElementById("totalAsistenInput").value = item.totalAsisten || "";
  document.getElementById("totalHonorInput").value = item.totalHonor || "";
  document.getElementById("bapInput").value = "";

  editHonorIndex = index;

  openHonorModal();
}

// ================= DELETE =================

async function deleteHonorarium(index) {
  if (!confirm("Yakin ingin menghapus pengajuan honorarium ini?")) return;

  honorarium.splice(index, 1);
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

  renderHonorariumTable();
}

// ================= PREVIEW / DOWNLOAD =================

function previewBap(fileName) {
  openDocumentPreview(fileName);
}

function downloadBap(fileName) {
  downloadDocumentFile(fileName);
}

// ================= LOAD =================

renderHonorariumTable();
