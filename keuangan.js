let pengajuanBhp = JSON.parse(localStorage.getItem("pengajuan")) || [];

let pengajuanHonor = JSON.parse(localStorage.getItem("honorarium")) || [];

// ================= DASHBOARD CARD =================

function renderKeuanganDashboard() {
  const totalBhp = pengajuanBhp.length;
  const totalHonor = pengajuanHonor.length;

  const pendingBhp = pengajuanBhp.filter(
    (item) => (item.status || "Pending") === "Pending",
  ).length;

  const pendingHonor = pengajuanHonor.filter(
    (item) => (item.status || "Pending") === "Pending",
  ).length;

  document.getElementById("totalBhp").innerText = totalBhp;
  document.getElementById("totalHonor").innerText = totalHonor;
  document.getElementById("totalPending").innerText = pendingBhp + pendingHonor;

  renderLatestTable();
}

// ================= LATEST TABLE =================

function renderLatestTable() {
  const table = document.getElementById("keuanganLatestTable");

  if (!table) return;

  table.innerHTML = "";

  const bhpData = pengajuanBhp.map((item) => ({
    jenis: "BHP",
    pengaju: item.pengaju || "Mahasiswa",
    lab: item.lab || "-",
    detail: item.barang || "-",
    status: item.status || "Pending",
  }));

  const honorData = pengajuanHonor.map((item) => ({
    jenis: "Honorarium",
    pengaju: item.pengaju || "Laboran",
    lab: item.lab || "-",
    detail: `${item.periodeMulai || "-"} s/d ${item.periodeSelesai || "-"}`,
    status: item.status || "Pending",
  }));

  const allData = [...bhpData, ...honorData].slice(-5).reverse();

  if (allData.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5">Belum ada pengajuan masuk.</td>
      </tr>
    `;
    return;
  }

  allData.forEach((item) => {
    table.innerHTML += `
      <tr>
        <td>${item.jenis}</td>
        <td>${item.pengaju}</td>
        <td>${item.lab}</td>
        <td>${item.detail}</td>
        <td>
          <span class="status ${item.status.toLowerCase()}">
            ${item.status}
          </span>
        </td>
      </tr>
    `;
  });
}

renderKeuanganDashboard();
