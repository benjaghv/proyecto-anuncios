import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    console.log('Authorization header recibido:', authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token no proporcionado o formato inválido')
      return NextResponse.json({ message: 'Token no proporcionado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('Token extraído:', token)

    try {
      const decoded = verifyToken(token)
      console.log('Token verificado:', decoded)
      return NextResponse.json({ valid: true, user: decoded })
    } catch (error) {
      console.error('Error al verificar token:', error)
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }
  } catch (error) {
    console.error('Error en verificación:', error)
    return NextResponse.json({ message: 'Error al verificar token' }, { status: 500 })
  }
} 