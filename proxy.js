import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Proxy (middleware Next.js 16) untuk memproteksi rute admin.
 * Memeriksa sesi login admin via Supabase Auth.
 * Semua rute /admin kecuali /admin/login wajib login.
 */
export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";

  // Jika belum login dan mengakses /admin (selain /admin/login), alihkan ke /admin/login
  if (!user && pathname.startsWith("/admin") && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

export default proxy;

