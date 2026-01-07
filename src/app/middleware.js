// middleware.js (projenizin kök dizininde)
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // URL'den yolu al
  const path = request.nextUrl.pathname;

  // Admin sayfaları için kontrol
  if (path.startsWith('/admin')) {
    // Token kontrolü
    const token = request.cookies.get('token')?.value;

    // Token yoksa login sayfasına yönlendir
    if (!token) {
      return NextResponse.redirect(new URL('/?login=true', request.url));
    }
  }
  // Signup sayfası için yönlendirme
  if (path === '/signup') {
    return NextResponse.redirect(new URL('/?signup=true', request.url));
  }

  // Token varsa devam et (rol kontrolü client tarafında yapılacak)
  return NextResponse.next();
}

// Middleware'in çalışacağı yolları belirt
export const config = {
  matcher: [
    '/admin/:path*'
  ]
};