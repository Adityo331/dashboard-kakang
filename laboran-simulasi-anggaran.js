// ================= SIMULASI ANGGARAN LABORAN =================
// Revisi konsep:
// 1) TW1-TW4, bukan Q1-Q4
// 2) Perhitungan praktikum memakai: modul x shift per modul x asisten per shift x jam per shift x honor per jam
// 3) Praktikum internasional punya honor berbeda
// 4) Add-ons: Hands On dan Simulasi Bersih
// 5) Simulasi tersimpan dapat diedit, dihapus, dan digabung otomatis antar laboratorium

let simulasiAnggaran = JSON.parse(localStorage.getItem("simulasiAnggaran")) || [];
let currentSimulation = null;
let editSimulationIndex = null;
let dailyTransactions = JSON.parse(localStorage.getItem("dailyTransactions")) || [];

const twList = ["TW1", "TW2", "TW3", "TW4"];

function rupiah(value) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

function getNumber(id) {
  const el = document.getElementById(id);
  return Number(el?.value || 0);
}

function getText(id) {
  const el = document.getElementById(id);
  return (el?.value || "").trim();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

function getTWInput(tw) {
  const kode = tw.toLowerCase();

  return {
    tw,
    regulerModul: getNumber(`${kode}RegulerModul`),
    regulerBhp: getNumber(`${kode}RegulerBhp`),

    internasionalModul: getNumber(`${kode}InternasionalModul`),
    internasionalShiftPerModul: getNumber(`${kode}InternasionalShift`),
    internasionalAsisten: getNumber(`${kode}InternasionalAsisten`),

    handsOnKegiatan: getNumber(`${kode}HandsOnKegiatan`),
    handsOnShift: getNumber(`${kode}HandsOnShift`),
    handsOnAsisten: getNumber(`${kode}HandsOnAsisten`),
    handsOnJam: getNumber(`${kode}HandsOnJam`),

    bersihKegiatan: getNumber(`${kode}BersihKegiatan`),
    bersihBayaran: getNumber(`${kode}BersihBayaran`),
  };
}

function calculateTW(input, master) {
  const honorReguler =
    input.regulerModul *
    master.shiftPerModulReguler *
    master.asistenPerShift *
    master.jamPerShiftReguler *
    master.honorRegulerPerJam;

  const honorInternasional =
    input.internasionalModul *
    input.internasionalShiftPerModul *
    input.internasionalAsisten *
    master.jamPerShiftReguler *
    master.honorInternasionalPerJam;

  const honorHandsOn =
    input.handsOnKegiatan *
    input.handsOnShift *
    input.handsOnAsisten *
    input.handsOnJam *
    master.honorHandsOnPerJam;

  const honorSimulasiBersih = input.bersihKegiatan * input.bersihBayaran;

  const totalHonor =
    honorReguler + honorInternasional + honorHandsOn + honorSimulasiBersih;

  const totalBhp = input.regulerBhp;
  const total = totalHonor + totalBhp;

  return {
    tw: input.tw,
    input,
    honorReguler,
    honorInternasional,
    honorHandsOn,
    honorSimulasiBersih,
    totalBhp,
    totalHonor,
    total,
  };
}

function buildSimulationFromInput() {
  const master = {
    anggaranTahunan: getNumber("anggaranTahunan"),
    laboratorium: getText("namaLabSimulasi"),
    shiftPerModulReguler: getNumber("jumlahShift"),
    asistenPerShift: getNumber("asistenPerShift"),
    jamPerShiftReguler: getNumber("jamJagaPerModul"),
    honorRegulerPerJam: getNumber("honorRegulerPerJam"),
    honorInternasionalPerJam: getNumber("honorInternasionalPerJam"),
    honorHandsOnPerJam: getNumber("honorHandsOnPerJam"),
  };

  if (!master.laboratorium) {
    alert("Nama laboratorium wajib diisi.");
    return null;
  }

  if (
    !master.anggaranTahunan ||
    !master.shiftPerModulReguler ||
    !master.asistenPerShift ||
    !master.jamPerShiftReguler ||
    !master.honorRegulerPerJam ||
    !master.honorInternasionalPerJam ||
    !master.honorHandsOnPerJam
  ) {
    alert(
      "Lengkapi data utama: anggaran, shift per modul, asisten per shift, jam per shift, dan honor per jam.",
    );
    return null;
  }

  const twInput = twList.map((tw) => getTWInput(tw));
  const rincian = twInput.map((input) => calculateTW(input, master));

  const totalHonorReguler = rincian.reduce(
    (sum, item) => sum + item.honorReguler,
    0,
  );
  const totalHonorInternasional = rincian.reduce(
    (sum, item) => sum + item.honorInternasional,
    0,
  );
  const totalHandsOn = rincian.reduce((sum, item) => sum + item.honorHandsOn, 0);
  const totalSimulasiBersih = rincian.reduce(
    (sum, item) => sum + item.honorSimulasiBersih,
    0,
  );
  const totalHonor = rincian.reduce((sum, item) => sum + item.totalHonor, 0);
  const totalBhp = rincian.reduce((sum, item) => sum + item.totalBhp, 0);
  const totalRealisasi = rincian.reduce((sum, item) => sum + item.total, 0);
  const sisaAnggaran = master.anggaranTahunan - totalRealisasi;

  return {
    id:
      editSimulationIndex !== null && simulasiAnggaran[editSimulationIndex]
        ? simulasiAnggaran[editSimulationIndex].id
        : Date.now(),
    laboratorium: master.laboratorium,
    anggaranTahunan: master.anggaranTahunan,
    shiftPerModulReguler: master.shiftPerModulReguler,
    jumlahShift: master.shiftPerModulReguler,
    asistenPerShift: master.asistenPerShift,
    jamPerShiftReguler: master.jamPerShiftReguler,
    jamJagaPerModul: master.jamPerShiftReguler,
    honorRegulerPerJam: master.honorRegulerPerJam,
    honorInternasionalPerJam: master.honorInternasionalPerJam,
    honorHandsOnPerJam: master.honorHandsOnPerJam,
    twInput,
    rincian,
    totalHonorReguler,
    totalHonorInternasional,
    totalHandsOn,
    totalSimulasiBersih,
    totalHonor,
    totalBhp,
    totalRealisasi,
    sisaAnggaran,
    createdAt:
      editSimulationIndex !== null && simulasiAnggaran[editSimulationIndex]
        ? simulasiAnggaran[editSimulationIndex].createdAt
        : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function hitungSimulasiAnggaran() {
  simulasiAnggaran = JSON.parse(localStorage.getItem("simulasiAnggaran")) || [];

  const simulation = buildSimulationFromInput();
  if (!simulation) return;

  currentSimulation = simulation;

  renderCurrentSimulation(currentSimulation);
  renderSavedSimulationSummary();
  renderAnalysis(currentSimulation);
}

function renderCurrentSimulation(data) {
  setText("hasilAnggaran", rupiah(data.anggaranTahunan));
  setText("hasilHonor", rupiah(data.totalHonor));
  setText("hasilBhp", rupiah(data.totalBhp));
  setText("hasilRealisasi", rupiah(data.totalRealisasi));
  setText("hasilSisa", rupiah(data.sisaAnggaran));
  setText("hasilReguler", rupiah(data.totalHonorReguler));
  setText("hasilInternasional", rupiah(data.totalHonorInternasional));
  setText("hasilHandsOn", rupiah(data.totalHandsOn));
  setText("hasilBersih", rupiah(data.totalSimulasiBersih));

  renderTabelSimulasi(data.rincian);
  renderGrafikGabungan();
}

function renderTabelSimulasi(data) {
  const table = document.getElementById("simulasiTable");
  if (!table) return;

  table.innerHTML = "";

  if (!data || data.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:#777;">
          Belum ada simulasi yang dihitung.
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((item) => {
    table.innerHTML += `
      <tr>
        <td>${item.tw}</td>
        <td>${rupiah(item.honorReguler)}</td>
        <td>${rupiah(item.honorInternasional)}</td>
        <td>${rupiah(item.honorHandsOn)}</td>
        <td>${rupiah(item.honorSimulasiBersih)}</td>
        <td>${rupiah(item.totalBhp)}</td>
        <td>${rupiah(item.total)}</td>
      </tr>
    `;
  });
}

function simpanSimulasiSementara() {
  simulasiAnggaran = JSON.parse(localStorage.getItem("simulasiAnggaran")) || [];

  const simulation = buildSimulationFromInput();
  if (!simulation) return;

  currentSimulation = simulation;

  if (editSimulationIndex !== null) {
    simulasiAnggaran[editSimulationIndex] = currentSimulation;
  } else {
    simulasiAnggaran.push(currentSimulation);
  }

  (window.friSetItem || localStorage.setItem.bind(localStorage))("simulasiAnggaran", JSON.stringify(simulasiAnggaran));

  if (typeof addActivity === "function") {
    addActivity(
      "Laboran",
      editSimulationIndex !== null
        ? "Mengedit simulasi anggaran"
        : "Menyimpan simulasi anggaran",
      `Simulasi ${currentSimulation.laboratorium} sebesar ${rupiah(currentSimulation.totalRealisasi)} ${editSimulationIndex !== null ? "diperbarui" : "disimpan sementara"}.`,
      "Simulasi Anggaran",
    );
  }

  alert(
    editSimulationIndex !== null
      ? "Simulasi berhasil diperbarui dan grafik gabungan sudah dikalkulasi ulang."
      : "Simulasi berhasil disimpan sementara dan digabung ke grafik.",
  );

  currentSimulation = null;
  editSimulationIndex = null;
  updateSaveButtonMode();
  clearSimulationInput(false);
  resetCurrentSummary();
  renderSavedSimulationSummary();
  renderSavedSimulationTable();
  renderGrafikGabungan();
  renderAnalysis();
}

function updateSaveButtonMode() {
  const btn = document.getElementById("saveSimulationBtn");
  if (!btn) return;

  btn.innerText = editSimulationIndex !== null ? "Update Simulasi" : "Simpan Simulasi Sementara";
}

function resetCurrentSummary() {
  setText("hasilAnggaran", "Rp 0");
  setText("hasilHonor", "Rp 0");
  setText("hasilBhp", "Rp 0");
  setText("hasilRealisasi", "Rp 0");
  setText("hasilSisa", "Rp 0");
  setText("hasilReguler", "Rp 0");
  setText("hasilInternasional", "Rp 0");
  setText("hasilHandsOn", "Rp 0");
  setText("hasilBersih", "Rp 0");
  renderTabelSimulasi([]);
}

function getTotalGabungan() {
  simulasiAnggaran = JSON.parse(localStorage.getItem("simulasiAnggaran")) || [];

  const total = {
    TW1: 0,
    TW2: 0,
    TW3: 0,
    TW4: 0,
    totalHonorReguler: 0,
    totalHonorInternasional: 0,
    totalHandsOn: 0,
    totalSimulasiBersih: 0,
    totalHonor: 0,
    totalBhp: 0,
    totalRealisasi: 0,
  };

  simulasiAnggaran.forEach((sim) => {
    (sim.rincian || []).forEach((item) => {
      total[item.tw] += Number(item.total || 0);
    });

    total.totalHonorReguler += Number(sim.totalHonorReguler || 0);
    total.totalHonorInternasional += Number(sim.totalHonorInternasional || 0);
    total.totalHandsOn += Number(sim.totalHandsOn || 0);
    total.totalSimulasiBersih += Number(sim.totalSimulasiBersih || 0);
    total.totalHonor += Number(sim.totalHonor || 0);
    total.totalBhp += Number(sim.totalBhp || 0);
    total.totalRealisasi += Number(sim.totalRealisasi || 0);
  });

  return total;
}

function renderSavedSimulationSummary() {
  const total = getTotalGabungan();

  setText("gabunganTotalSimulasi", rupiah(total.totalRealisasi));
  setText("gabunganTotalHonor", rupiah(total.totalHonor));
  setText("gabunganTotalBhp", rupiah(total.totalBhp));
  setText("gabunganTotalLab", simulasiAnggaran.length.toString());
}

function renderGrafikGabungan() {
  const total = getTotalGabungan();

  const values = [total.TW1, total.TW2, total.TW3, total.TW4];
  const maxValue = Math.max(...values, 1);

  twList.forEach((tw, index) => {
    const value = values[index];
    const bar = document.getElementById(`bar${tw}`);
    const label = document.getElementById(`value${tw}`);

    if (bar) {
      bar.style.height = value === 0 ? "8%" : `${(value / maxValue) * 100}%`;
    }

    if (label) {
      label.innerText = rupiah(value);
    }
  });
}

function renderSavedSimulationTable() {
  simulasiAnggaran = JSON.parse(localStorage.getItem("simulasiAnggaran")) || [];

  const table = document.getElementById("savedSimulationTable");
  if (!table) return;

  table.innerHTML = "";

  if (simulasiAnggaran.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:#777;">
          Belum ada simulasi yang disimpan sementara.
        </td>
      </tr>
    `;
    return;
  }

  simulasiAnggaran
    .map((item, index) => ({ item, realIndex: index }))
    .reverse()
    .forEach(({ item, realIndex }) => {
      const twTotal = { TW1: 0, TW2: 0, TW3: 0, TW4: 0 };
      (item.rincian || []).forEach((detail) => {
        twTotal[detail.tw] = Number(detail.total || 0);
      });

      table.innerHTML += `
        <tr>
          <td>${item.laboratorium || "-"}</td>
          <td>${rupiah(twTotal.TW1)}</td>
          <td>${rupiah(twTotal.TW2)}</td>
          <td>${rupiah(twTotal.TW3)}</td>
          <td>${rupiah(twTotal.TW4)}</td>
          <td>${rupiah(item.totalHonor || 0)}</td>
          <td>${rupiah(item.totalRealisasi || 0)}</td>
          <td>
            <div class="action-group">
              <button class="btn-edit" onclick="editSimulasi(${realIndex})">
                Edit
              </button>
              <button class="btn-delete" onclick="hapusSimulasi(${realIndex})">
                Hapus
              </button>
            </div>
          </td>
        </tr>
      `;
    });
}

function editSimulasi(index) {
  simulasiAnggaran = JSON.parse(localStorage.getItem("simulasiAnggaran")) || [];

  const sim = simulasiAnggaran[index];
  if (!sim) return;

  editSimulationIndex = index;
  currentSimulation = sim;

  setValue("anggaranTahunan", sim.anggaranTahunan || "");
  setValue("namaLabSimulasi", sim.laboratorium || "");
  setValue("jumlahShift", sim.shiftPerModulReguler || sim.jumlahShift || "");
  setValue("asistenPerShift", sim.asistenPerShift || "");
  setValue("jamJagaPerModul", sim.jamPerShiftReguler || sim.jamJagaPerModul || "");
  setValue("honorRegulerPerJam", sim.honorRegulerPerJam || "");
  setValue("honorInternasionalPerJam", sim.honorInternasionalPerJam || "");
  setValue("honorHandsOnPerJam", sim.honorHandsOnPerJam || "");

  const inputByTW = {};
  (sim.twInput || []).forEach((input) => {
    inputByTW[input.tw] = input;
  });

  twList.forEach((tw) => {
    const kode = tw.toLowerCase();
    const input = inputByTW[tw] || (sim.rincian || []).find((item) => item.tw === tw)?.input || {};

    setValue(`${kode}RegulerModul`, input.regulerModul || 0);
    setValue(`${kode}RegulerBhp`, input.regulerBhp || 0);
    setValue(`${kode}InternasionalModul`, input.internasionalModul || 0);
    setValue(`${kode}InternasionalShift`, input.internasionalShiftPerModul || input.internasionalShift || 0);
    setValue(`${kode}InternasionalAsisten`, input.internasionalAsisten || 0);
    setValue(`${kode}HandsOnKegiatan`, input.handsOnKegiatan || 0);
    setValue(`${kode}HandsOnShift`, input.handsOnShift || 0);
    setValue(`${kode}HandsOnAsisten`, input.handsOnAsisten || 0);
    setValue(`${kode}HandsOnJam`, input.handsOnJam || 0);
    setValue(`${kode}BersihKegiatan`, input.bersihKegiatan || 0);
    setValue(`${kode}BersihBayaran`, input.bersihBayaran || 0);
  });

  renderCurrentSimulation(sim);
  updateSaveButtonMode();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hapusSimulasi(index) {
  if (!confirm("Yakin ingin menghapus simulasi ini?")) return;

  simulasiAnggaran.splice(index, 1);
  (window.friSetItem || localStorage.setItem.bind(localStorage))("simulasiAnggaran", JSON.stringify(simulasiAnggaran));

  if (editSimulationIndex === index) {
    editSimulationIndex = null;
    currentSimulation = null;
    clearSimulationInput(false);
    resetCurrentSummary();
    updateSaveButtonMode();
  }

  renderSavedSimulationSummary();
  renderSavedSimulationTable();
  renderGrafikGabungan();
  renderAnalysis();
}

function hapusSemuaSimulasi() {
  if (!confirm("Yakin ingin menghapus semua simulasi tersimpan?")) return;

  localStorage.removeItem("simulasiAnggaran");
  simulasiAnggaran = [];
  currentSimulation = null;
  editSimulationIndex = null;

  clearSimulationInput();
  resetCurrentSummary();
  updateSaveButtonMode();
  renderSavedSimulationSummary();
  renderSavedSimulationTable();
  renderGrafikGabungan();
  renderAnalysis();
}

function clearSimulationInput(clearBudget = true) {
  const ids = [
    "namaLabSimulasi",
    "jumlahShift",
    "asistenPerShift",
    "jamJagaPerModul",
    "honorRegulerPerJam",
    "honorInternasionalPerJam",
    "honorHandsOnPerJam",
    ...twList.flatMap((tw) => {
      const kode = tw.toLowerCase();
      return [
        `${kode}RegulerModul`,
        `${kode}RegulerBhp`,
        `${kode}InternasionalModul`,
        `${kode}InternasionalShift`,
        `${kode}InternasionalAsisten`,
        `${kode}HandsOnKegiatan`,
        `${kode}HandsOnShift`,
        `${kode}HandsOnAsisten`,
        `${kode}HandsOnJam`,
        `${kode}BersihKegiatan`,
        `${kode}BersihBayaran`,
      ];
    }),
  ];

  if (clearBudget) ids.unshift("anggaranTahunan");

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  currentSimulation = null;
  editSimulationIndex = null;
  updateSaveButtonMode();
}

function renderAnalysis(data = currentSimulation) {
  const box = document.getElementById("analysisBox");
  if (!box) return;

  const total = getTotalGabungan();

  if (!data && total.totalRealisasi === 0) {
    box.innerText =
      "Masukkan data simulasi atau simpan simulasi sementara untuk melihat hasil analisis.";
    return;
  }

  const sumber = data
    ? data
    : {
        laboratorium: "Gabungan Laboratorium",
        totalRealisasi: total.totalRealisasi,
      };

  const dominan = Math.max(
    total.totalHonorReguler,
    total.totalHonorInternasional,
    total.totalHandsOn,
    total.totalSimulasiBersih,
    total.totalBhp,
  );

  let kategoriDominan = "BHP";
  if (dominan === total.totalHonorReguler) kategoriDominan = "Honor Praktikum Reguler";
  if (dominan === total.totalHonorInternasional) kategoriDominan = "Honor Praktikum Internasional";
  if (dominan === total.totalHandsOn) kategoriDominan = "Honor Hands On";
  if (dominan === total.totalSimulasiBersih) kategoriDominan = "Simulasi Bersih";

  box.innerHTML = `
    <strong>Analisis:</strong><br />
    Simulasi ${sumber.laboratorium || "laboratorium"} menunjukkan estimasi realisasi sebesar
    <strong>${rupiah(sumber.totalRealisasi || 0)}</strong>. Secara gabungan, total simulasi tersimpan
    mencapai <strong>${rupiah(total.totalRealisasi)}</strong> dari ${simulasiAnggaran.length} simulasi laboratorium.
    Komponen biaya yang paling dominan saat ini adalah <strong>${kategoriDominan}</strong>, sehingga komponen tersebut
    perlu menjadi perhatian utama dalam perencanaan anggaran laboratorium.
  `;
}

// ================= TRANSAKSI HARIAN =================

function getQuarter(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;

  if (month >= 1 && month <= 3) return "TW1";
  if (month >= 4 && month <= 6) return "TW2";
  if (month >= 7 && month <= 9) return "TW3";
  return "TW4";
}

function addDailyTransaction() {
  const date = getText("dailyDate");
  const desc = getText("dailyDesc");
  const category = getText("dailyCategory");
  const amount = getNumber("dailyAmount");

  if (!date || !desc || !category || !amount) {
    alert("Lengkapi tanggal, deskripsi, kategori, dan nominal transaksi.");
    return;
  }

  dailyTransactions = JSON.parse(localStorage.getItem("dailyTransactions")) || [];
  dailyTransactions.push({
    id: Date.now(),
    date,
    tanggal: date,
    desc,
    deskripsi: desc,
    category,
    kategori: category,
    amount,
    nominal: amount,
    quarter: getQuarter(date),
    sumber: "Manual Laboran",
    createdAt: new Date().toISOString(),
  });

  (window.friSetItem || localStorage.setItem.bind(localStorage))("dailyTransactions", JSON.stringify(dailyTransactions));

  document.getElementById("dailyDate").value = "";
  document.getElementById("dailyDesc").value = "";
  document.getElementById("dailyAmount").value = "";

  renderDailyTransactions();
}

function renderDailyTransactions() {
  dailyTransactions = JSON.parse(localStorage.getItem("dailyTransactions")) || [];

  const table = document.getElementById("dailyTransactionTable");
  if (!table) return;

  const manualData = dailyTransactions.filter(
    (item) => item.sumber === "Manual Laboran" || !item.sumber,
  );

  table.innerHTML = "";

  if (manualData.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:#777;">
          Belum ada transaksi harian.
        </td>
      </tr>
    `;
    return;
  }

  manualData
    .map((item) => ({ item, realIndex: dailyTransactions.indexOf(item) }))
    .reverse()
    .forEach(({ item, realIndex }) => {
      table.innerHTML += `
        <tr>
          <td>${item.date || item.tanggal || "-"}</td>
          <td>${item.desc || item.deskripsi || "-"}</td>
          <td>${item.category || item.kategori || "-"}</td>
          <td>${rupiah(item.amount || item.nominal || 0)}</td>
          <td>${item.quarter || getQuarter(item.date || item.tanggal)}</td>
          <td>
            <button class="btn-delete" onclick="deleteDailyTransaction(${realIndex})">
              Hapus
            </button>
          </td>
        </tr>
      `;
    });
}

function deleteDailyTransaction(index) {
  if (!confirm("Yakin ingin menghapus transaksi ini?")) return;

  dailyTransactions.splice(index, 1);
  (window.friSetItem || localStorage.setItem.bind(localStorage))("dailyTransactions", JSON.stringify(dailyTransactions));
  renderDailyTransactions();
}

// ================= LOAD =================

resetCurrentSummary();
renderSavedSimulationSummary();
renderSavedSimulationTable();
renderGrafikGabungan();
renderDailyTransactions();
renderAnalysis();
updateSaveButtonMode();
