// ================= FILE PREVIEW & DOWNLOAD HELPER =================
// Browser tidak bisa membuka file asli dari input lokal hanya dari nama file.
// Jika file tidak ada di folder assets/templates, sistem otomatis memakai template sementara.

const DOCUMENT_TEMPLATE_PATH = "../assets/templates/template-pengajuan.pdf";
const DOCUMENT_BASE_PATH = "../assets/templates/";

function getSafeDocumentUrl(fileName) {
  if (!fileName || fileName === "-") return "";

  if (fileName === "template-pengajuan.pdf") {
    return DOCUMENT_TEMPLATE_PATH;
  }

  return DOCUMENT_BASE_PATH + encodeURIComponent(fileName);
}

function openDocumentPreview(fileName) {
  if (!fileName || fileName === "-") {
    alert("File belum tersedia.");
    return;
  }

  const fileUrl = getSafeDocumentUrl(fileName);

  fetch(fileUrl, { method: "HEAD" })
    .then((response) => {
      const finalUrl = response.ok ? fileUrl : DOCUMENT_TEMPLATE_PATH;
      window.open(finalUrl, "_blank");
    })
    .catch(() => {
      window.open(DOCUMENT_TEMPLATE_PATH, "_blank");
    });
}

function downloadDocumentFile(fileName) {
  if (!fileName || fileName === "-") {
    alert("File belum tersedia.");
    return;
  }

  const fileUrl = getSafeDocumentUrl(fileName);
  const downloadName = fileName || "template-pengajuan.pdf";

  fetch(fileUrl, { method: "HEAD" })
    .then((response) => {
      const finalUrl = response.ok ? fileUrl : DOCUMENT_TEMPLATE_PATH;

      const link = document.createElement("a");
      link.href = finalUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(() => {
      const link = document.createElement("a");
      link.href = DOCUMENT_TEMPLATE_PATH;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
}
