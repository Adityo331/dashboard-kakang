let monitoringBhp = [];
let monitoringHonor = [];
let monitoringDaily = [];

function rupiah(value) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

function getQuarter(dateString) {
  if (!dateString) return "q1";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "q1";
  const month = date.getMonth() + 1;

  if (month >= 1 && month <= 3) return "q1";
  if (month >= 4 && month <= 6) return "q2";
  if (month >= 7 && month <= 9) return "q3";
  return "q4";
}

function loadMonitoringData() {
  monitoringBhp = JSON.parse(localStorage.getItem("pengajuan")) || [];
  monitoringHonor = JSON.parse(localStorage.getItem("honorarium")) || [];
  monitoringDaily = JSON.parse(localStorage.getItem("dailyTransactions")) || [];
}

function getApprovedBhp() {
  return monitoringBhp.filter((item) => item.status === "Approved Keuangan");
}

function getApprovedHonor() {
  return monitoringHonor.filter((item) => item.status === "Approved Keuangan");
}

function getManualDaily() {
  return monitoringDaily.filter(
    (item) => item.sumber !== "BHP" && item.sumber !== "Honorarium",
  );
}

function getApprovedBhpValue() {
  return getApprovedBhp().reduce(
    (total, item) => total + Number(item.total || item.nominal || 0),
    0,
  );
}

function getApprovedHonorValue() {
  return getApprovedHonor().reduce(
    (total, item) => total + Number(item.totalHonor || item.nominal || 0),
    0,
  );
}

function getDailyValue() {
  return getManualDaily().reduce(
    (total, item) => total + Number(item.amount || item.nominal || 0),
    0,
  );
}

function getQuarterTotals() {
  const totals = { q1: 0, q2: 0, q3: 0, q4: 0 };

  getApprovedBhp().forEach((item) => {
    const q = getQuarter(item.tanggal);
    totals[q] += Number(item.total || item.nominal || 0);
  });

  getApprovedHonor().forEach((item) => {
    const q = getQuarter(item.periodeMulai || item.tanggal);
    totals[q] += Number(item.totalHonor || item.nominal || 0);
  });

  getManualDaily().forEach((item) => {
    const q = item.quarter || getQuarter(item.date || item.tanggal);
    totals[q] += Number(item.amount || item.nominal || 0);
  });

  return totals;
}

function renderMonitoring() {
  loadMonitoringData();

  const totalBudget =
    Number(document.getElementById("monitoringBudget").value) || 0;

  const bhpTotal = getApprovedBhpValue();
  const honorTotal = getApprovedHonorValue();
  const dailyTotal = getDailyValue();

  const totalRealisasi = bhpTotal + honorTotal + dailyTotal;
  const sisa = totalBudget - totalRealisasi;

  document.getElementById("monitorTotalBudget").innerText = rupiah(totalBudget);
  document.getElementById("monitorTotalRealisasi").innerText =
    rupiah(totalRealisasi);
  document.getElementById("monitorSisaBudget").innerText = rupiah(sisa);

  document.getElementById("monitorBhpTotal").innerText = rupiah(bhpTotal);
  document.getElementById("monitorHonorTotal").innerText = rupiah(honorTotal);
  document.getElementById("monitorDailyTotal").innerText = rupiah(dailyTotal);

  renderLiveStats();
  renderQuarterChart();
  renderApprovedTable();
  renderActivityLog();
}

function renderLiveStats() {
  const approvedBhp = getApprovedBhp();
  const approvedHonor = getApprovedHonor();
  const allApproved = [...approvedBhp, ...approvedHonor];

  const totalAll = [...monitoringBhp, ...monitoringHonor].filter((item) =>
    ["Pending Keuangan", "Approved Keuangan", "Rejected Keuangan"].includes(
      item.status,
    ),
  ).length;

  const approvalRate = totalAll === 0 ? 0 : Math.round((allApproved.length / totalAll) * 100);

  const labTotals = {};
  approvedBhp.forEach((item) => {
    const lab = item.lab || "-";
    labTotals[lab] = (labTotals[lab] || 0) + Number(item.total || item.nominal || 0);
  });
  approvedHonor.forEach((item) => {
    const lab = item.lab || "-";
    labTotals[lab] = (labTotals[lab] || 0) + Number(item.totalHonor || item.nominal || 0);
  });

  const topLab = Object.entries(labTotals).sort((a, b) => b[1] - a[1])[0];

  const totalEl = document.getElementById("monitorTotalTransaksi");
  const rateEl = document.getElementById("monitorApprovalRate");
  const topLabEl = document.getElementById("monitorTopLab");

  if (totalEl) totalEl.innerText = allApproved.length;
  if (rateEl) rateEl.innerText = approvalRate + "%";
  if (topLabEl) topLabEl.innerText = topLab ? topLab[0] : "-";
}

function renderQuarterChart() {
  const totals = getQuarterTotals();

  const values = [totals.q1, totals.q2, totals.q3, totals.q4];
  const maxValue = Math.max(...values, 1);

  const quarterMap = [
    { id: "monitorQ1", value: totals.q1 },
    { id: "monitorQ2", value: totals.q2 },
    { id: "monitorQ3", value: totals.q3 },
    { id: "monitorQ4", value: totals.q4 },
  ];

  quarterMap.forEach((item) => {
    const height = item.value === 0 ? 8 : Math.max(12, (item.value / maxValue) * 100);

    document.getElementById(`${item.id}Bar`).style.height = height + "%";
    document.getElementById(`${item.id}Value`).innerText = rupiah(item.value);
  });
}

function getApprovedRows() {
  const approvedBhp = getApprovedBhp().map((item) => ({
    jenis: "BHP",
    pengaju: item.pengaju || "Mahasiswa",
    lab: item.lab || "-",
    detail: item.barang || "-",
    nominal: Number(item.total || item.nominal || 0),
    status: item.status,
    tanggal: item.tanggal || "-",
  }));

  const approvedHonor = getApprovedHonor().map((item) => ({
    jenis: "Honorarium",
    pengaju: item.pengaju || "Laboran",
    lab: item.lab || "-",
    detail: `${item.periodeMulai || "-"} s/d ${item.periodeSelesai || "-"}`,
    nominal: Number(item.totalHonor || item.nominal || 0),
    status: item.status,
    tanggal: item.periodeMulai || "-",
  }));

  return [...approvedBhp, ...approvedHonor].reverse();
}

function renderApprovedTable() {
  const table = document.getElementById("monitoringApprovedTable");
  if (!table) return;

  table.innerHTML = "";

  const data = getApprovedRows();

  if (data.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:#777;">
          Belum ada pengajuan yang disetujui keuangan.
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((item) => {
    table.innerHTML += `
      <tr>
        <td>${item.jenis}</td>
        <td>${item.pengaju}</td>
        <td>${item.lab}</td>
        <td>${item.detail}</td>
        <td>${rupiah(item.nominal)}</td>
        <td>
          <span class="status approved">
            ${item.status}
          </span>
        </td>
      </tr>
    `;
  });
}

function getActivityRows() {
  const stored = JSON.parse(localStorage.getItem("activities")) || [];

  const syntheticBhp = monitoringBhp
    .filter((item) => item.status)
    .map((item) => ({
      createdAt: item.updatedAt || item.tanggal || new Date().toISOString(),
      module: "BHP",
      role: item.pengaju || "Mahasiswa",
      action: item.status || "Pengajuan dibuat",
      detail: `${item.barang || "-"} - ${item.lab || "-"}`,
    }));

  const syntheticHonor = monitoringHonor
    .filter((item) => item.status)
    .map((item) => ({
      createdAt: item.updatedAt || item.periodeMulai || new Date().toISOString(),
      module: "Honorarium",
      role: item.pengaju || "Laboran",
      action: item.status || "Pengajuan dibuat",
      detail: `${item.lab || "-"} (${item.periodeMulai || "-"} s/d ${item.periodeSelesai || "-"})`,
    }));

  return [...stored, ...syntheticBhp, ...syntheticHonor]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
}

function renderActivityLog() {
  const table = document.getElementById("activityLogTable");
  if (!table) return;

  const data = getActivityRows();
  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#777;">
          Belum ada riwayat aktivitas.
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((item) => {
    table.innerHTML += `
      <tr>
        <td>${formatActivityTimeLocal(item.createdAt)}</td>
        <td>${item.module || "-"}</td>
        <td>${item.role || "-"}</td>
        <td>${item.action || "-"}</td>
        <td>${item.detail || "-"}</td>
      </tr>
    `;
  });
}

function formatActivityTimeLocal(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString || "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportLaporanCSV() {
  loadMonitoringData();
  const rows = getApprovedRows();
  const totalBudget = Number(document.getElementById("monitoringBudget").value) || 0;
  const totalRealisasi = getApprovedBhpValue() + getApprovedHonorValue() + getDailyValue();
  const sisa = totalBudget - totalRealisasi;

  const csvRows = [
    ["Laporan Monitoring Anggaran FRI"],
    ["Total Anggaran", totalBudget],
    ["Total Realisasi", totalRealisasi],
    ["Sisa Anggaran", sisa],
    [],
    ["Tanggal", "Jenis", "Pengaju", "Laboratorium", "Detail", "Nominal", "Status"],
    ...rows.map((r) => [r.tanggal, r.jenis, r.pengaju, r.lab, r.detail, r.nominal, r.status]),
  ];

  const csvContent = csvRows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-monitoring-anggaran-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function updateMonitoring() {
  renderMonitoring();
}

renderMonitoring();
