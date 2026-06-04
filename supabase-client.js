/* =====================================================
   SUPABASE CLIENT CONFIG - FRI Dashboard
   -----------------------------------------------------
   Isi Project URL dan Publishable/Anon Key dari Supabase.
   Project URL WAJIB tanpa /rest/v1/.
===================================================== */

const SUPABASE_URL = "https://rgqxyrytjqtsreisebyf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7qAzvGLq-Ie0MKNjrmEsbA_KcjlaMzI";

function normalizeSupabaseUrl(url) {
  return String(url || "")
    .trim()
    .replace(/^Ihttps:/i, "https:")
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/$/, "");
}

const CLEAN_SUPABASE_URL = normalizeSupabaseUrl(SUPABASE_URL);

function isSupabaseConfigured() {
  return (
    CLEAN_SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    CLEAN_SUPABASE_URL.startsWith("https://") &&
    CLEAN_SUPABASE_URL.includes(".supabase.co") &&
    !CLEAN_SUPABASE_URL.includes("ISI_SUPABASE") &&
    !SUPABASE_ANON_KEY.includes("ISI_SUPABASE") &&
    window.supabase
  );
}

window.friSupabase = isSupabaseConfigured()
  ? window.supabase.createClient(CLEAN_SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

window.testFriSupabase = async function () {
  if (!window.friSupabase) {
    console.error("Supabase belum terhubung. Cek URL, key, dan urutan script.");
    return null;
  }

  const { data, error } = await window.friSupabase
    .from("pengajuan_bhp")
    .select("*")
    .limit(10);

  console.log("TEST SUPABASE DATA:", data);
  console.log("TEST SUPABASE ERROR:", error);
  return { data, error };
};


window.friSupabaseConfig = {
  url: CLEAN_SUPABASE_URL,
  hasKey: Boolean(SUPABASE_ANON_KEY),
  keyPrefix: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.slice(0, 14) + "..." : "",
};

window.checkFriSupabaseConnection = async function () {
  const result = {
    url: CLEAN_SUPABASE_URL,
    configured: Boolean(window.friSupabase),
    tables: {},
  };

  if (!window.friSupabase) {
    console.error("Supabase belum aktif. Cek URL, anon key, dan script CDN supabase-js.", result);
    return result;
  }

  const tables = [
    "users",
    "pengajuan_bhp",
    "honorarium",
    "notifications",
    "activities",
    "daily_transactions",
    "simulasi_anggaran",
    "monitoring_budget",
  ];

  for (const table of tables) {
    const { data, error } = await window.friSupabase.from(table).select("*").limit(1);
    result.tables[table] = error
      ? { ok: false, message: error.message, details: error.details || null, code: error.code || null }
      : { ok: true, rowsChecked: data ? data.length : 0 };
  }

  console.table(result.tables);
  console.log("Status koneksi Supabase FRI:", result);
  return result;
};

if (window.friSupabase) {
  console.log("Supabase terhubung:", CLEAN_SUPABASE_URL);
} else {
  console.warn(
    "Supabase belum dikonfigurasi. Sistem tetap berjalan memakai localStorage sampai URL dan ANON KEY diisi.",
  );
}
