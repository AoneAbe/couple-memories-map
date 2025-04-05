import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// 保護されたルート
const protectedRoutes = ['/map', '/memories'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // 保護されたルートのみチェックする
  if (protectedRoutes.some(route => path.startsWith(route))) {
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // ログインしていない場合はログインページにリダイレクト
    if (!session) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/map/:path*',
    '/memories/:path*',
  ],
};