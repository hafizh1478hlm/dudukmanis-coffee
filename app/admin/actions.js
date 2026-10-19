"use server";

import { redirect } from "next/navigation";
import { buatKlienAdmin } from "@/lib/supabase";

/**
 * Server Action untuk login admin memakai Supabase Auth (@supabase/ssr).
 * Mendukung pemanggilan via useActionState(login, null) maupun langsung dari form action={login}.
 */
export async function login(arg1, arg2) {
  const formData = arg2 instanceof FormData ? arg2 : arg1;
  const email = formData?.get("email");
  const password = formData?.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let signInError = null;

  try {
    const supabase = await buatKlienAdmin();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    });
    signInError = error;
  } catch (err) {
    return { error: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }

  if (signInError) {
    return { error: "Email atau password salah. Silakan periksa kembali." };
  }

  redirect("/admin");
}

/**
 * Server Action untuk keluar (logout) admin.
 * Menghapus sesi Supabase Auth dari cookie lalu kembali ke halaman login.
 */
export async function keluar() {
  try {
    const supabase = await buatKlienAdmin();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Gagal mengakhiri sesi:", err.message);
  }

  redirect("/admin/login");
}

export const logout = keluar;

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memvalidasi panjang minimal 8 karakter dan kesamaan konfirmasi password.
 */
export async function gantiPassword(arg1, arg2) {
  const formData = arg2 instanceof FormData ? arg2 : arg1;
  const passwordBaru = formData?.get("password_baru");
  const konfirmasiPassword = formData?.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (String(passwordBaru).length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  try {
    const supabase = await buatKlienAdmin();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Sesi telah berakhir atau kamu belum login. Silakan login kembali." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: String(passwordBaru),
    });

    if (updateError) {
      return { error: updateError.message || "Gagal mengganti password." };
    }

    return { success: "Password berhasil diganti." };
  } catch (err) {
    return { error: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }
}

export const updatePassword = gantiPassword;

