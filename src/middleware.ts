import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/', '/api/auth/login', '/api/auth/register']
  
  // Verificar si la ruta actual es pública
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path)
  
  // Obtener el token del header Authorization
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.split(' ')[1]

  // Si es una ruta pública, permitir el acceso
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Si no hay token, redirigir al login
  if (!token) {
    return NextResponse.json(
      { message: 'No autorizado' },
      { status: 401 }
    )
  }

  try {
    // Verificar el token
    const decoded = await verifyToken(token)
    
    // Agregar el usuario decodificado a los headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.id)
    requestHeaders.set('x-user-email', decoded.email)

    // Continuar con la solicitud
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Token inválido' },
      { status: 401 }
    )
  }
}

// Configurar las rutas que deben pasar por el middleware
export const config = {
  matcher: [
    '/api/anuncios/:path*',
    '/api/auth/:path*',
    '/'
  ]
} 