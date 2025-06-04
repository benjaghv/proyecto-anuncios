import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/anuncios',
  '/.well-known/appspecific/com.chrome.devtools.json'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Si la ruta es pública, permitir el acceso sin verificar el token
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Verificar el token solo para rutas API protegidas
  const token = request.headers.get('Authorization')?.split(' ')[1]
  console.log('Middleware - Ruta solicitada:', pathname)
  console.log('Middleware - Authorization header:', token)

  if (!token) {
    console.log('Middleware - No hay token o formato inválido')
    return NextResponse.json(
      { message: 'No autorizado' },
      { status: 401 }
    )
  }

  try {
    // Permitir el acceso y dejar que la ruta de API maneje la verificación del token
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware - Error al verificar token:', error)
    return NextResponse.json(
      { message: 'Token inválido o expirado' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: '/api/:path*',
  runtime: 'nodejs'
} 