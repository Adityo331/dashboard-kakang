let pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];
let editIndex = null;
let modeForm = "tambah";

function getLoginUser() {
  return JSON.parse(sessionStorage.getItem("loginUser") || localStorage.getItem("loginUser")) || {};
}

function isCurrentMahasiswaItem(item) {
  const loginUser = getLoginUser();

  return (
    (item.pengaju || "Mahasiswa") === "Mahasiswa" &&
    item.username === loginUser.username
  );
}

// ================= RENDER TABLE =================

function renderTable() {
  pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];

  const table = document.getElementById("pengajuanTable");
  if (!table) return;

  table.innerHTML = "";

  const dataTerbaru = pengajuan
    .map((item, index) => ({
      item,
      realIndex: index,
    }))
    .reverse();

  dataTerbaru.forEach(({ item, realIndex }) => {
    if (!isCurrentMahasiswaItem(item)) return;

    let revisiDisplay = "-";

    if (item.revisi) {
      revisiDisplay = `
        <span class="pdf-file">
          <i class="fa-solid fa-file-pdf"></i>
          ${item.revisi}
        </span>
      `;
    } else if (
      item.status === "Rejected Laboran" ||
      item.status === "Rejected Keuangan"
    ) {
      revisiDisplay = `
        <button onclick="openRevisiModal(${realIndex})" class="btn-edit">
          Upload Revisi
        </button>
      `;
    }

    let aksiButton = "";

    if (
      item.status === "Rejected Laboran" ||
      item.status === "Rejected Keuangan"
    ) {
      aksiButton = `
        <button onclick="openRevisiModal(${realIndex})" class="btn-edit">
          Revisi
        </button>
      `;
    } else if (
      item.status === "Pending Laboran" ||
      item.status === "Pending Keuangan"
    ) {
      aksiButton = `
        <button onclick="editPengajuan(${realIndex})" class="btn-edit">
          Edit
        </button>
      `;
    }

    table.innerHTML += `
      <tr>
        <td>${item.lab || "-"}</td>
        <td>${item.pic || "-"}</td>
        <td>${item.barang || "-"}</td>
        <td>${item.tanggal || "-"}</td>

        <td>
          <div class="pdf-action">
            <button onclick="previewProposal('${item.proposal || "-"}')" class="btn-preview">
              Preview
            </button>
            <button onclick="downloadProposal('${item.proposal || "-"}')" class="btn-download">
              Download
            </button>
          </div>
        </td>

        <td>
          <span class="status ${
            item.status
              ? item.status.toLowerCase().replaceAll(" ", "-")
              : "pending"
          }">
            ${item.status || "Pending Laboran"}
          </span>
        </td>

        <td style="white-space: pre-line; max-width: 260px;">
          ${item.komentar || "-"}
        </td>

        <td>${revisiDisplay}</td>

        <td>
          ${aksiButton}

          ${
            item.status === "Pending Laboran" ||
            item.status === "Rejected Laboran" ||
            item.status === "Rejected Keuangan"
              ? `
                <button onclick="deletePengajuan(${realIndex})" class="btn-delete">
                  Hapus
                </button>
              `
              : ""
          }
        </td>
      </tr>
    `;
  });
}

// ================= MODAL TAMBAH =================

function openModal() {
  editIndex = null;
  modeForm = "tambah";

  document.getElementById("modalTitle").innerText = "Tambah Pengajuan BHP";

  document.getElementById("labInput").disabled = false;
  document.getElementById("picInput").disabled = false;
  document.getElementById("barangInput").disabled = false;
  document.getElementById("tanggalInput").disabled = false;

  document.getElementById("proposalGroup").style.display = "block";
  document.getElementById("revisiContainer").style.display = "none";

  clearFormOnly();

  document.getElementById("modal").classList.remove("hidden");
}

// ================= MODAL EDIT =================

function editPengajuan(index) {
  const item = pengajuan[index];

  if (!isCurrentMahasiswaItem(item)) return;

  editIndex = index;
  modeForm = "edit";

  document.getElementById("modalTitle").innerText = "Edit Pengajuan BHP";

  document.getElementById("labInput").disabled = false;
  document.getElementById("picInput").disabled = false;
  document.getElementById("barangInput").disabled = false;
  document.getElementById("tanggalInput").disabled = false;

  document.getElementById("labInput").value = item.lab || "";
  document.getElementById("picInput").value = item.pic || "";
  document.getElementById("barangInput").value = item.barang || "";
  document.getElementById("tanggalInput").value = item.tanggal || "";

  document.getElementById("proposalInput").value = "";
  document.getElementById("revisiInput").value = "";

  document.getElementById("proposalGroup").style.display = "block";
  document.getElementById("revisiContainer").style.display = "none";

  document.getElementById("modal").classList.remove("hidden");
}

// ================= MODAL REVISI =================

function openRevisiModal(index) {
  const item = pengajuan[index];

  if (!isCurrentMahasiswaItem(item)) return;

  editIndex = index;
  modeForm = "revisi";

  document.getElementById("modalTitle").innerText = "Revisi Pengajuan BHP";

  document.getElementById("labInput").value = item.lab || "";
  document.getElementById("picInput").value = item.pic || "";
  document.getElementById("barangInput").value = item.barang || "";
  document.getElementById("tanggalInput").value = item.tanggal || "";

  document.getElementById("labInput").disabled = true;
  document.getElementById("picInput").disabled = true;
  document.getElementById("barangInput").disabled = true;
  document.getElementById("tanggalInput").disabled = true;

  document.getElementById("proposalInput").value = "";
  document.getElementById("revisiInput").value = "";

  document.getElementById("proposalGroup").style.display = "none";
  document.getElementById("revisiContainer").style.display = "block";

  document.getElementById("modal").classList.remove("hidden");
}

// ================= CLOSE MODAL =================

function closeModal() {
  document.getElementById("modal").classList.add("hidden");

  editIndex = null;
  modeForm = "tambah";

  document.getElementById("labInput").disabled = false;
  document.getElementById("picInput").disabled = false;
  document.getElementById("barangInput").disabled = false;
  document.getElementById("tanggalInput").disabled = false;

  clearFormOnly();
}

// ================= CLEAR FORM =================

function clearFormOnly() {
  document.getElementById("labInput").value = "";
  document.getElementById("picInput").value = "";
  document.getElementById("barangInput").value = "";
  document.getElementById("tanggalInput").value = "";
  document.getElementById("proposalInput").value = "";
  document.getElementById("revisiInput").value = "";
}

// ================= SIMPAN =================

async function addPengajuan() {
  pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];

  const lab = document.getElementById("labInput").value.trim();
  const pic = document.getElementById("picInput").value.trim();
  const barang = document.getElementById("barangInput").value.trim();
  const tanggal = document.getElementById("tanggalInput").value;

  const proposalFile = document.getElementById("proposalInput").files[0];
  const revisiFile = document.getElementById("revisiInput").files[0];

  if (modeForm === "revisi") {
    if (!revisiFile) {
      alert("Upload bukti revisi terlebih dahulu");
      return;
    }

    const oldData = pengajuan[editIndex];

    const nextStatus =
      oldData.status === "Rejected Keuangan"
        ? "Pending Keuangan"
        : "Pending Laboran";

    const nextTahap =
      oldData.status === "Rejected Keuangan" ? "Keuangan" : "Laboran";

    pengajuan[editIndex] = {
      ...oldData,
      revisi: revisiFile.name,
      status: nextStatus,
      tahap: nextTahap,
      komentar: "Revisi telah dikirim ulang",
    };
  } else if (modeForm === "edit") {
    if (lab === "" || pic === "" || barang === "" || tanggal === "") {
      alert("Lengkapi nama lab, PIC, nama barang, dan tanggal");
      return;
    }

    const oldData = pengajuan[editIndex];

    pengajuan[editIndex] = {
      ...oldData,
      lab,
      pic,
      barang,
      tanggal,
      proposal: proposalFile ? proposalFile.name : oldData.proposal,
    };
  } else {
    if (lab === "" || pic === "" || barang === "" || tanggal === "") {
      alert("Lengkapi nama lab, PIC, nama barang, dan tanggal");
      return;
    }

    if (!proposalFile) {
      alert("Upload proposal PDF terlebih dahulu");
      return;
    }

    const loginUser = getLoginUser();

    pengajuan.push({
      pengaju: "Mahasiswa",
      username: loginUser.username,
      lab,
      pic,
      barang,
      tanggal,
      proposal: proposalFile.name,
      revisi: "",
      status: "Pending Laboran",
      tahap: "Laboran",
      komentar: "",
    });

    addNotification(
      "laboran",
      "Pengajuan BHP Baru",
      `${loginUser.username || "Mahasiswa"} mengajukan BHP ${barang} untuk ${lab}.`,
      "laboran.html",
    );
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

  renderTable();
  closeModal();
}

// ================= DELETE =================

async function deletePengajuan(index) {
  if (!confirm("Yakin ingin menghapus pengajuan ini?")) return;

  if (!isCurrentMahasiswaItem(pengajuan[index])) return;

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

  renderTable();
}

// ================= PREVIEW / DOWNLOAD =================

function previewProposal(fileName) {
  openDocumentPreview(fileName);
}

function downloadProposal(fileName) {
  downloadDocumentFile(fileName);
}

// ================= LOGOUT =================

function logout() {
  localStorage.removeItem("loginUser");
  sessionStorage.removeItem("loginUser");
  window.location.href = "../index.html";
}

// ================= FIRST LOAD =================

renderTable();
