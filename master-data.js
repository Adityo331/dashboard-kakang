// ================= MASTER DATA LAB, PIC, TEMPLATE =================

const FRI_LAB_OPTIONS = [
  "Laboratorium Proses Manufaktur (PROSMAN)",
  "Laboratorium Analisis Perancangan Kerja dan Ergonomi (APKE)",
  "Laboratorium Gambar Teknik (GTX)",
  "Laboratorium Sistem Produksi dan Otomasi (SISPROMASI)",
  "Laboratorium Statistika Industri dan Penelitian Operasional (SIPO)",
  "Laboratorium Produk Development (PDEV)",
  "Laboratorium Simulasi Bisnis (SIMBI)",
  "Laboratorium Techno Economy (TEKMI)",
  "Laboratorium Facility Technology (FASTECH)",
  "Laboratorium Enterprise System Engineering (ENSYSE)",
  "Laboratorium OPSIM",
  "Laboratorium Dasar Pemrograman (DASPRO)",
  "Laboratorium Manajemen Rekayasa (MR)",
  "Laboratorium Sistem Operasi dan Jaringan Komputer (SISJAR)",
  "Laboratorium Enterprise Application Development (EAD)",
  "Laboratorium Enterprise Resource Planning (ERP)",
  "Laboratorium System Architecture and Governance",
  "Laboratorium EIM",
  "Laboratorium EDM",
  "Laboratorium EISD",
];

const FRI_PIC_OPTIONS = [
  "Ekky Novriza Alam, S.Kom., M.T.",
  "Gredy Ramadhany, S.Kom.",
  "Reynaldo Yoseva Parulian Sitompul, S.T.",
  "Hanif Yoga Adiwianto, S.Kom.",
  "Rahadhitya Samudra Anuraga, S.Kom.",
  "Fatur",
];

const TEMPLATE_FILE_PATH = "../assets/templates/template-pengajuan.pdf";

function replaceWithSelect(id, options, placeholder, onChangeHandler = "") {
  const oldEl = document.getElementById(id);
  if (!oldEl) return;

  const currentValue = oldEl.value || oldEl.getAttribute("value") || "";
  const select = document.createElement("select");

  select.id = oldEl.id;
  select.name = oldEl.name || oldEl.id;
  select.className = oldEl.className || "";
  select.disabled = oldEl.disabled;
  select.style.cssText = oldEl.style.cssText || "";

  if (onChangeHandler) select.setAttribute("onchange", onChangeHandler);
  if (oldEl.getAttribute("onchange") && !onChangeHandler) {
    select.setAttribute("onchange", oldEl.getAttribute("onchange"));
  }

  select.innerHTML = `<option value="">${placeholder}</option>`;

  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });

  if (currentValue && !options.includes(currentValue)) {
    const opt = document.createElement("option");
    opt.value = currentValue;
    opt.textContent = currentValue;
    select.appendChild(opt);
  }

  select.value = currentValue;
  oldEl.replaceWith(select);
}

function getFilterLabHandler() {
  if (typeof renderLaboran === "function") return "renderLaboran()";
  if (typeof renderKeuanganBhp === "function") return "renderKeuanganBhp()";
  if (typeof renderKeuanganHonorarium === "function") return "renderKeuanganHonorarium()";
  return "";
}

function initLabAndPicDropdowns() {
  replaceWithSelect("labInput", FRI_LAB_OPTIONS, "Pilih Laboratorium");
  replaceWithSelect("labHonorInput", FRI_LAB_OPTIONS, "Pilih Laboratorium");
  replaceWithSelect("filterLab", FRI_LAB_OPTIONS, "Semua Laboratorium", getFilterLabHandler());

  replaceWithSelect("picInput", FRI_PIC_OPTIONS, "Pilih PIC");
  replaceWithSelect("picHonorInput", FRI_PIC_OPTIONS, "Pilih PIC");
  replaceWithSelect("approvePic", FRI_PIC_OPTIONS, "Pilih PIC");
}

function insertTemplateBeforeInput(inputId, title) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const group = input.closest(".input-group") || input.parentElement;
  if (!group || group.querySelector(`.template-download[data-template-for="${inputId}"]`)) return;

  const div = document.createElement("div");
  div.className = "template-download";
  div.dataset.templateFor = inputId;
  div.innerHTML = `
    <div class="template-info">
      <i class="fa-solid fa-file-lines"></i>
      <span>${title}</span>
    </div>
    <a class="btn-template" href="${TEMPLATE_FILE_PATH}" download>
      <i class="fa-solid fa-download"></i> Download Template
    </a>
  `;

  group.insertBefore(div, input);
}

function initTemplateDownloadButtons() {
  insertTemplateBeforeInput("proposalInput", "Template Proposal BHP");
  insertTemplateBeforeInput("revisiInput", "Template Bukti Revisi");
  insertTemplateBeforeInput("invoiceInput", "Template Invoice");
  insertTemplateBeforeInput("tagihanInput", "Template Tagihan CC");
  insertTemplateBeforeInput("kwitansiInput", "Template Kwitansi");
  insertTemplateBeforeInput("justifikasiInput", "Template Justifikasi");
  insertTemplateBeforeInput("bastInput", "Template BAST");
  insertTemplateBeforeInput("bapInput", "Template BAP Praktikum");

  insertTemplateBeforeInput("docInvoice", "Template Invoice");
  insertTemplateBeforeInput("docTagihan", "Template Tagihan CC");
  insertTemplateBeforeInput("docKwitansi", "Template Kwitansi");
  insertTemplateBeforeInput("docJustifikasi", "Template Justifikasi");
  insertTemplateBeforeInput("docBast", "Template BAST");
}

document.addEventListener("DOMContentLoaded", () => {
  initLabAndPicDropdowns();
  initTemplateDownloadButtons();
});
