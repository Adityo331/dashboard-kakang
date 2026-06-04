function getLoginUser() {
  return JSON.parse(sessionStorage.getItem("loginUser") || localStorage.getItem("loginUser")) || {};
}

function getPengajuanSaya() {
  const loginUser = getLoginUser();
  const username = loginUser.username;

  const pengajuan = JSON.parse(localStorage.getItem("pengajuan")) || [];

  return pengajuan.filter((item) => {
    return (
      (item.pengaju || "Mahasiswa") === "Mahasiswa" &&
      item.username === username
    );
  });
}

function setupRole() {
  const loginUser = getLoginUser();

  const profileName = document.querySelector(".profile-box h4");
  const profileRole = document.querySelector(".profile-box p");
  const avatar = document.querySelector(".avatar");

  if (profileName) profileName.innerText = loginUser.username || "Mahasiswa";
  if (profileRole) profileRole.innerText = "Asisten Laboratorium";
  if (avatar)
    avatar.innerText = (loginUser.username || "M").charAt(0).toUpperCase();
}

function renderDashboard() {
  const dataSaya = getPengajuanSaya();

  const total = dataSaya.length;

  const approved = dataSaya.filter(
    (item) => item.status === "Approved Keuangan",
  ).length;

  const pending = dataSaya.filter(
    (item) =>
      item.status === "Pending Laboran" || item.status === "Pending Keuangan",
  ).length;

  const rejected = dataSaya.filter(
    (item) =>
      item.status === "Rejected Laboran" || item.status === "Rejected Keuangan",
  ).length;

  document.getElementById("totalPengajuan").innerText = total;
  document.getElementById("approvedPengajuan").innerText = approved;
  document.getElementById("pendingPengajuan").innerText = pending;

  document.getElementById("approvedTrackingText").innerText =
    `${approved} pengajuan disetujui`;

  document.getElementById("pendingTrackingText").innerText =
    `${pending} menunggu validasi`;

  document.getElementById("rejectedTrackingText").innerText =
    `${rejected} pengajuan ditolak`;

  renderStatusTerbaru(dataSaya);
}

function renderStatusTerbaru(dataSaya) {
  const table = document.getElementById("dashboardTable");

  if (!table) return;

  table.innerHTML = "";

  if (dataSaya.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; color:#777;">
          Belum ada pengajuan dari akun ini.
        </td>
      </tr>
    `;
    return;
  }

  dataSaya
    .slice()
    .reverse()
    .slice(0, 5)
    .forEach((item) => {
      table.innerHTML += `
        <tr>
          <td>${item.lab || "-"}</td>
          <td>${item.barang || "-"}</td>
          <td>
            <span class="status ${getStatusClass(item.status)}">
              ${item.status || "Pending Laboran"}
            </span>
          </td>
          <td>${item.tanggal || "-"}</td>
        </tr>
      `;
    });
}

function getStatusClass(status) {
  if (!status) return "pending";
  if (status.includes("Approved")) return "approved";
  if (status.includes("Rejected")) return "reject";
  return "pending";
}

setupRole();
renderDashboard();
