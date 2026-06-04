function hitungHonor() {
  const pertemuan = parseInt(document.getElementById("pertemuan").value) || 0;

  const honor = parseInt(document.getElementById("honor").value) || 0;

  const bonus = parseInt(document.getElementById("bonus").value) || 0;

  // TOTAL

  const total = pertemuan * honor + bonus;

  // FORMAT RUPIAH

  document.getElementById("totalHonor").innerText =
    "Rp " + total.toLocaleString("id-ID");
}
function logout() {
  window.location.href = "../index.html";
}
