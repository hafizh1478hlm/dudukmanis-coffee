import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

/**
 * Koneksi Supabase untuk sesi admin (@supabase/ssr + cookie).
 * Menggunakan SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY.
 * Dipakai untuk autentikasi (login, keluar, ganti password)
 * dan aksi kelola produk agar RLS tetap berlaku.
 */
export async function buatKlienAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY harus diatur di environment variable."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Abaikan jika dipanggil dari Server Component
        }
      },
    },
  });
}

export { buatKlienServer as createClient };
export const buatKlienSesiAdmin = buatKlienAdmin;
export default buatKlienServer;
