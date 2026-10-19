import { createClient } from "@supabase/supabase-js";

/**
 * Koneksi Supabase untuk server (pengunjung).
 * Menggunakan SUPABASE_URL dan SUPABASE_SECRET_KEY untuk melewati RLS
 * saat membaca data publik (katalog dan detail produk).
 */
export function buatKlienServer() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY harus diatur di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { buatKlienServer as createClient };

