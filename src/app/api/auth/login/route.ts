import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { generateToken } from '@/lib/auth'
import { LoginCredentials, User } from '@/types/user'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as LoginCredentials

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return NextResponse.json(
        { message: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email
    })

    // Retornar respuesta sin la contraseña
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      message: 'Login exitoso',
      user: userWithoutPassword as User,
      token
    })
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { message: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
