import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Allow all requests to pass through
  // Authentication checks are handled in the page components
  return NextResponse.next()
}

export const config = {
  matcher: ["/professional/dashboard/:path*", "/panel-profesional/:path*"],
}
