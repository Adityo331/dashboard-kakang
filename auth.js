// ================= AKUN STAFF DEFAULT =================

function initDefaultStaffAccounts() {
  let users = JSON.parse(localStorage.getItem("users")) || [];

  const defaultStaff = [
    {
      username: "laboran",
      password: "laboran123",
      role: "laboran",
    },
    {
      username: "keuangan",
      password: "keuangan123",
      role: "keuangan",
    },
  ];

  defaultStaff.forEach((staff) => {
    const exists = users.find((user) => user.username === staff.username);

    if (!exists) {
      users.push(staff);
    }
  });

  (window.friSetItem || localStorage.setItem.bind(localStorage))("users", JSON.stringify(users));
}

function runDefaultStaffInitWhenSupabaseReady() {
  // Penting: jangan langsung sync akun default sebelum data users dari Supabase selesai dibaca.
  // Kalau langsung sync saat halaman login dibuka, data user yang sudah ada di Supabase bisa ketimpa default saja.
  if (window.friSupabase && !window.friSupabaseReady) {
    document.addEventListener(
      "friSupabaseReady",
      () => {
        initDefaultStaffAccounts();
      },
      { once: true },
    );
    return;
  }

  initDefaultStaffAccounts();
}

runDefaultStaffInitWhenSupabaseReady();

// ================= SHOW REGISTER =================

function showRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

// ================= SHOW LOGIN =================

function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
}

// ================= REGISTER =================

async function register() {
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  // register hanya untuk asisten lab/mahasiswa
  const role = "mahasiswa";

  if (username === "" || password === "") {
    alert("Lengkapi data");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const checkUser = users.find((user) => user.username === username);

  if (checkUser) {
    alert("Username sudah digunakan");
    return;
  }

  users.push({
    username,
    password,
    role,
  });

  if (window.friSaveItem) {
    await window.friSaveItem("users", JSON.stringify(users));
  } else {
    localStorage.setItem("users", JSON.stringify(users));
  }

  if (window.friLastSyncError) {
    alert("Registrasi tersimpan di browser, tetapi gagal masuk Supabase. Cek Console > friGetSyncStatus().");
    console.error("Detail error sync user:", window.friLastSyncError);
    return;
  }

  alert("Registrasi berhasil sebagai Asisten Laboratorium dan tersimpan ke Supabase");

  showLogin();
}

// ================= LOGIN =================

function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (user) {
    localStorage.setItem("loginUser", JSON.stringify(user));
    sessionStorage.setItem("loginUser", JSON.stringify(user));

    if (user.role === "mahasiswa") {
      window.location.href = "pages/mahasiswa.html";
    } else if (user.role === "laboran") {
      window.location.href = "pages/laboran.html";
    } else if (user.role === "keuangan") {
      window.location.href = "pages/keuangan.html";
    }
  } else {
    alert("Login gagal, pastikan username dan password benar");
  }
}
