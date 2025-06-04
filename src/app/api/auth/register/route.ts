import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { generateToken } from '@/lib/auth'
import { RegisterCredentials, User } from '@/types/user'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json() as RegisterCredentials

    // Validar campos requeridos
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email
    })

    // Retornar respuesta sin la contraseña
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword as User,
      token
    })
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { message: 'Error al registrar usuario' },
      { status: 500 }
    )
  }
}
