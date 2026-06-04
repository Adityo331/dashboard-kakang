/* =====================================================
   SUPABASE SYNC ADAPTER - SEPARATE TABLE MODE (STABLE)
   -----------------------------------------------------
   Project lama tetap memakai localStorage, tetapi setiap
   perubahan data utama langsung disimpan ke tabel Supabase
   terpisah. Adapter ini aman untuk prototype TA.
===================================================== */

const FRI_SYNC_KEYS = [
  "users",
  "pengajuan",
  "honorarium",
  "notifications",
  "activities",
  "dailyTransactions",
  "simulasiAnggaran",
  "monitoringBudget",
];

const FRI_TABLE_MAP = {
  users: "users",
  pengajuan: "pengajuan_bhp",
  honorarium: "honorarium",
  notifications: "notifications",
  activities: "activities",
  dailyTransactions: "daily_transactions",
  simulasiAnggaran: "simulasi_anggaran",
  monitoringBudget: "monitoring_budget",
};

window.friSupabaseReady = false;
window.friLastSyncError = null;

const friNativeSetItem = Storage.prototype.setItem;
const friNativeGetItem = Storage.prototype.getItem;
const friNativeRemoveItem = Storage.prototype.removeItem;
const friNativeClear = Storage.prototype.clear;

let friIsLoadingFromSupabase = false;
let friRealtimeChannels = [];
let friSyncQueue = Promise.resolve();

// ================= UTIL =================

function friDefaultValue(key) {
  return key === "monitoringBudget" ? 0 : [];
}

function friSafeParse(value, fallback = []) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function friNormalizeValue(key, value) {
  if (value === undefined || value === null || value === "") {
    return friDefaultValue(key);
  }

  if (typeof value === "string") {
    return friSafeParse(value, friDefaultValue(key));
  }

  return value;
}

function friCreateId(prefix = "row") {
  if (window.crypto && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

function friGetItemId(key, item, index) {
  if (!item || typeof item !== "object") return `${key}_${index}`;

  if (item.client_id) return String(item.client_id);
  if (item.id) return String(item.id);

  if (key === "users" && item.username) return String(item.username);
  if (key === "notifications" && item.id_notifikasi) return String(item.id_notifikasi);
  if (key === "activities" && item.id_aktivitas) return String(item.id_aktivitas);

  const newId = friCreateId(key);
  item.client_id = newId;
  item.id = item.id || newId;
  return newId;
}

function friArrayValue(key, value) {
  if (key === "monitoringBudget") return value || 0;
  return Array.isArray(value) ? value : [];
}

function friDateOrNull(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function friNumberOrZero(value) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

// ================= ROW MAPPERS =================

function friMapUserToRow(item, index) {
  const clientId = friGetItemId("users", item, index);
  return {
    client_id: clientId,
    username: item.username || clientId,
    nama: item.nama || item.name || item.username || "-",
    password: item.password || "",
    role: item.role || "mahasiswa",
    payload: item,
    updated_at: new Date().toISOString(),
  };
}

function friMapPengajuanToRow(item, index) {
  const clientId = friGetItemId("pengajuan", item, index);
  return {
    client_id: clientId,
    pengaju: item.pengaju || "Mahasiswa",
    username: item.username || null,
    laboratorium: item.lab || item.laboratorium || "-",
    pic: item.pic || "-",
    nama_barang: item.barang || item.nama_barang || "-",
    tanggal_pengajuan: friDateOrNull(item.tanggal || item.tanggal_pengajuan),
    proposal: item.proposal || null,
    revisi: item.revisi || null,
    status: item.status || "Pending Laboran",
    tahap: item.tahap || "Laboran",
    komentar: item.komentar || null,
    total: friNumberOrZero(item.total),
    payload: item,
    updated_at: new Date().toISOString(),
  };
}

function friMapHonorariumToRow(item, index) {
  const clientId = friGetItemId("honorarium", item, index);
  return {
    client_id: clientId,
    pengaju: item.pengaju || "Laboran",
    username: item.username || null,
    laboratorium: item.lab || item.laboratorium || "-",
    pic: item.pic || "-",
    periode_mulai: friDateOrNull(item.periodeMulai || item.periode_mulai),
    periode_selesai: friDateOrNull(item.periodeSelesai || item.periode_selesai),
    total_asisten: friNumberOrZero(item.totalAsisten || item.total_asisten),
    total_honor: friNumberOrZero(item.totalHonor || item.total_honor),
    bap_praktikum: item.bap || item.bap_praktikum || null,
    status: item.status || "Pending Keuangan",
    tahap: item.tahap || "Keuangan",
    komentar: item.komentar || null,
    payload: item,
    updated_at: new Date().toISOString(),
  };
}

function friMapNotificationToRow(item, index) {
  const clientId = friGetItemId("notifications", item, index);
  return {
    client_id: clientId,
    target_role: item.targetRole || item.target_role || null,
    target_username: item.targetUsername || item.target_username || null,
    title: item.title || item.judul || "Notifikasi",
    message: item.message || item.pesan || "-",
    link: item.link || null,
    is_read: Boolean(item.isRead || item.is_read),
    created_at: item.createdAt || item.created_at || new Date().toISOString(),
    payload: item,
    updated_at: new Date().toISOString(),
  };
}

function friMapActivityToRow(item, index) {
  const clientId = friGetItemId("activities", item, index);
  return {
    client_id: clientId,
    role: item.role || null,
    aksi: item.aksi || item.action || null,
    modul: item.modul || item.module || null,
    detail: item.detail || item.description || null,
    created_at: item.createdAt || item.created_at || new Date().toISOString(),
    payload: item,
    updated_at: new Date().toISOString(),
  };
}

function friMapDailyTransactionToRow(item, index) {
  const clientId = friGetItemId("dailyTransactions", item, index);
  return {
    client_id: clientId,
    tanggal: friDateOrNull(item.tanggal || item.date),
    kategori: item.kategori || item.category || null,
    laboratorium: item.lab || item.laboratorium || null,
    deskripsi: item.deskripsi || item.description || item.barang || null,
    nominal: friNumberOrZero(item.nominal || item.amount),
    sumber: item.sumber || item.source || null,
    status: item.status || null,
    payload: item,
    updated_at: new Date().toISOString(),
  };
}

function friMapSimulasiToRow(item, index) {
  const clientId = friGetItemId("simulasiAnggaran", item, index);
  return {
    client_id: clientId,
    laboratorium: item.laboratorium || item.lab || item.namaLab || "-",
    tipe: item.tipe || item.type || "Simulasi Anggaran",
    tw1: friNumberOrZero(item.tw1 || item.TW1),
    tw2: friNumberOrZero(item.tw2 || item.TW2),
    tw3: friNumberOrZero(item.tw3 || item.TW3),
    tw4: friNumberOrZero(item.tw4 || item.TW4),
    total: friNumberOrZero(item.total || item.totalSimulasi),
    payload: item,
    updated_at: new Date().toISOString(),
  };
}

function friMapMonitoringBudgetToRow(value) {
  return {
    id: 1,
    total_anggaran: friNumberOrZero(value),
    payload: value,
    updated_at: new Date().toISOString(),
  };
}

function friMapKeyToRows(key, value) {
  const normalized = friArrayValue(key, friNormalizeValue(key, value));

  if (key === "monitoringBudget") {
    return [friMapMonitoringBudgetToRow(normalized)];
  }

  const arrayValue = Array.isArray(normalized) ? normalized : [];

  const mapper = {
    users: friMapUserToRow,
    pengajuan: friMapPengajuanToRow,
    honorarium: friMapHonorariumToRow,
    notifications: friMapNotificationToRow,
    activities: friMapActivityToRow,
    dailyTransactions: friMapDailyTransactionToRow,
    simulasiAnggaran: friMapSimulasiToRow,
  }[key];

  return mapper ? arrayValue.map((item, index) => mapper(item, index)) : [];
}

// ================= ROW TO LOCAL =================

function friRowsToLocalValue(key, rows) {
  if (key === "monitoringBudget") {
    const row = (rows || [])[0];
    return row ? row.total_anggaran || row.payload || 0 : 0;
  }

  return (rows || [])
    .sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
      const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
      return aTime - bTime;
    })
    .map((row) => row.payload || row);
}

// ================= DIRECT SYNC =================

async function friSyncKeyToSeparateTable(key, value) {
  if (!window.friSupabase || !FRI_SYNC_KEYS.includes(key)) return;

  const tableName = FRI_TABLE_MAP[key];
  if (!tableName) return;

  const rows = friMapKeyToRows(key, value);

  if (key === "monitoringBudget") {
    const { error } = await window.friSupabase
      .from(tableName)
      .upsert(rows[0], { onConflict: "id" });

    if (error) throw error;
    return;
  }

  // Prototype mode: tabel disamakan dengan localStorage.
  // Hapus semua row lama, lalu insert array terbaru agar edit/hapus pasti ikut sinkron.
  const { error: deleteError } = await window.friSupabase
    .from(tableName)
    .delete()
    .not("client_id", "is", null);

  if (deleteError) throw deleteError;

  if (rows.length > 0) {
    const { error: insertError } = await window.friSupabase
      .from(tableName)
      .upsert(rows, { onConflict: "client_id" });

    if (insertError) throw insertError;
  }

  const normalized = friNormalizeValue(key, value);
  if (Array.isArray(normalized)) {
    friNativeSetItem.call(localStorage, key, JSON.stringify(normalized));
  }
}

function friQueueSync(key, value) {
  if (friIsLoadingFromSupabase) return Promise.resolve();
  if (!window.friSupabase) return Promise.resolve();
  if (!FRI_SYNC_KEYS.includes(key)) return Promise.resolve();

  friSyncQueue = friSyncQueue
    .then(() => friSyncKeyToSeparateTable(key, value))
    .then(() => {
      window.friLastSyncError = null;
      window.friLastSyncAt = new Date().toISOString();
      console.log("Berhasil sync ke Supabase:", key, "->", FRI_TABLE_MAP[key]);
    })
    .catch((error) => {
      window.friLastSyncError = error;
      console.error("Gagal sync ke Supabase:", key, error.message || error, error);
    });

  return friSyncQueue;
}

async function friSyncNow(key, value) {
  if (!window.friSupabase || !FRI_SYNC_KEYS.includes(key)) return;

  try {
    await friSyncKeyToSeparateTable(key, value);
    window.friLastSyncError = null;
    console.log("Berhasil sync ke Supabase:", key, "->", FRI_TABLE_MAP[key]);
  } catch (error) {
    window.friLastSyncError = error;
    console.error("Gagal sync ke Supabase:", key, error.message || error, error);
  }
}

function friSetItem(key, value) {
  friNativeSetItem.call(localStorage, key, value);
  return friQueueSync(key, value);
}

async function friSaveItem(key, value) {
  friNativeSetItem.call(localStorage, key, value);
  await friQueueSync(key, value);
  return !window.friLastSyncError;
}

window.friSetItem = friSetItem;
window.friSaveItem = friSaveItem;
window.friSyncNow = friSyncNow;
window.friGetSyncStatus = function () {
  return {
    ready: window.friSupabaseReady,
    hasClient: Boolean(window.friSupabase),
    lastSyncAt: window.friLastSyncAt || null,
    lastError: window.friLastSyncError
      ? {
          message: window.friLastSyncError.message || String(window.friLastSyncError),
          details: window.friLastSyncError.details || null,
          code: window.friLastSyncError.code || null,
        }
      : null,
  };
};

async function syncAllLocalToSupabase() {
  if (!window.friSupabase) {
    console.warn("Supabase belum aktif, sync dibatalkan.");
    return;
  }

  for (const key of FRI_SYNC_KEYS) {
    const localValue = friNativeGetItem.call(localStorage, key);
    await friSyncNow(key, localValue ?? JSON.stringify(friDefaultValue(key)));
  }
}

window.syncAllLocalToSupabase = syncAllLocalToSupabase;
window.forceFriSyncNow = syncAllLocalToSupabase;

// ================= PATCH LOCAL STORAGE =================

function patchLocalStorageForSupabase() {
  if (window.friLocalStoragePatched) return;
  window.friLocalStoragePatched = true;

  Storage.prototype.setItem = function (key, value) {
    friNativeSetItem.call(this, key, value);

    if (this === localStorage && FRI_SYNC_KEYS.includes(key)) {
      return friQueueSync(key, value);
    }
  };

  Storage.prototype.removeItem = function (key) {
    friNativeRemoveItem.call(this, key);

    if (this === localStorage && FRI_SYNC_KEYS.includes(key)) {
      friQueueSync(key, JSON.stringify(friDefaultValue(key)));
    }
  };

  Storage.prototype.clear = function () {
    friNativeClear.call(this);
    console.warn("localStorage.clear() dipanggil. Supabase tidak dihapus otomatis untuk keamanan.");
  };
}

// ================= LOAD REMOTE =================

async function loadKeyFromSeparateTable(key) {
  const tableName = FRI_TABLE_MAP[key];
  if (!tableName || !window.friSupabase) return friDefaultValue(key);

  const { data, error } = await window.friSupabase
    .from(tableName)
    .select("*")
    .order("updated_at", { ascending: true });

  if (error) throw error;

  return friRowsToLocalValue(key, data || []);
}

async function loadSupabaseStateToLocalStorage() {
  if (!window.friSupabase) {
    window.friSupabaseReady = true;
    document.dispatchEvent(new CustomEvent("friSupabaseReady"));
    return;
  }

  friIsLoadingFromSupabase = true;

  for (const key of FRI_SYNC_KEYS) {
    try {
      const remoteValue = await loadKeyFromSeparateTable(key);
      const localRaw = friNativeGetItem.call(localStorage, key);
      const localValue = friNormalizeValue(key, localRaw);

      const remoteEmpty = Array.isArray(remoteValue) ? remoteValue.length === 0 : !remoteValue;
      const localEmpty = Array.isArray(localValue) ? localValue.length === 0 : !localValue;

      // Jangan timpa data lokal yang sudah ada dengan remote kosong.
      if (!remoteEmpty || localEmpty) {
        friNativeSetItem.call(localStorage, key, JSON.stringify(remoteValue));
      }
    } catch (error) {
      console.error("Gagal load Supabase table:", key, error.message || error);
    }
  }

  friIsLoadingFromSupabase = false;

  window.friSupabaseReady = true;
  document.dispatchEvent(new CustomEvent("friSupabaseReady"));
}

// ================= RENDER ULANG =================

function refreshCurrentPageAfterSupabaseLoad() {
  const renderFunctions = [
    "renderTable",
    "renderDashboard",
    "renderLaboran",
    "renderLaboranBhpTable",
    "renderHonorariumTable",
    "renderKeuanganBhp",
    "renderKeuanganHonorarium",
    "renderMonitoring",
    "renderNotificationBadge",
    "renderNotificationList",
    "renderSimulasiTersimpan",
    "renderGrafikGabungan",
    "renderDailyTransactions",
  ];

  renderFunctions.forEach((functionName) => {
    if (typeof window[functionName] === "function") {
      try {
        window[functionName]();
      } catch (error) {
        console.warn("Render ulang gagal:", functionName, error.message);
      }
    }
  });
}

// ================= REALTIME =================

function subscribeSupabaseRealtime() {
  if (!window.friSupabase || friRealtimeChannels.length > 0) return;

  Object.values(FRI_TABLE_MAP).forEach((tableName) => {
    const channel = window.friSupabase
      .channel(`${tableName}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        async () => {
          await loadSupabaseStateToLocalStorage();
          refreshCurrentPageAfterSupabaseLoad();
        },
      )
      .subscribe((status) => {
        console.log(`Supabase realtime ${tableName}:`, status);
      });

    friRealtimeChannels.push(channel);
  });
}

// ================= INIT =================

patchLocalStorageForSupabase();

// Load secepat mungkin, tanpa menunggu terlalu lama.
document.addEventListener("DOMContentLoaded", async () => {
  await loadSupabaseStateToLocalStorage();
  await syncAllLocalToSupabase();
  refreshCurrentPageAfterSupabaseLoad();
  subscribeSupabaseRealtime();
  console.log("Supabase sync adapter aktif: mode tabel terpisah stabil.");
});
