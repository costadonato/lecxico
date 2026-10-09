import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { coincideRuta, RUTA_INICIO, RUTAS_PROTEGIDAS, RUTAS_SOLO_INVITADOS } from "@/lib/auth/rutas"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Consultar el usuario (refresca tokens si es necesario)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  // Rutas que exigen sesión: sin usuario, al login (y de vuelta después).
  // El resto (landing, /recuperar, /restablecer, /auth/callback, /terminos,
  // /privacidad, ...) queda público.
  if (!user && RUTAS_PROTEGIDAS.some((base) => coincideRuta(pathname, base))) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = ""
    url.searchParams.set("next", pathname + search)
    return redirigir(url, supabaseResponse)
  }

  // Con sesión, el login y el registro no tienen sentido: al dashboard.
  if (user && RUTAS_SOLO_INVITADOS.some((base) => coincideRuta(pathname, base))) {
    const url = request.nextUrl.clone()
    url.pathname = RUTA_INICIO
    url.search = ""
    return redirigir(url, supabaseResponse)
  }

  return supabaseResponse
}

/** Redirige conservando las cookies de sesión que haya refrescado getUser(). */
function redirigir(url: URL, supabaseResponse: NextResponse) {
  const response = NextResponse.redirect(url)
  supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
