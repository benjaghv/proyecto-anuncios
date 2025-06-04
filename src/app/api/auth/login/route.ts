import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('POST /api/auth/login - Intento de login con email:', email)

    if (!email || !password) {
      console.log('POST /api/auth/login - Email o contraseña no proporcionados')
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('POST /api/auth/login - Usuario no encontrado:', email)
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('POST /api/auth/login - Contraseña inválida para usuario:', email)
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const token = generateToken(user.id)
    console.log('POST /api/auth/login - Token generado para usuario:', email)

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('POST /api/auth/login - Error:', error)
    return NextResponse.json(
      { message: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
