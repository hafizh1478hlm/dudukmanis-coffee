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

