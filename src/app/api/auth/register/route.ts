import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { generateToken } from '@/lib/auth'
import { RegisterCredentials, User } from '@/types/user'

export async function POST(request: Request) {
  try {
    console.log('Iniciando proceso de registro...')
    
    const body = await request.json()
    console.log('Datos recibidos:', { email: body.email, name: body.name })
    
    const { email, password, name } = body as RegisterCredentials

    // Validar campos requeridos
    if (!email || !password || !name) {
      console.log('Campos faltantes:', { email: !!email, password: !!password, name: !!name })
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    console.log('Verificando si el usuario ya existe...')
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Usuario ya existe:', email)
      return NextResponse.json(
        { message: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    console.log('Hasheando contraseña...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el usuario
    console.log('Creando usuario en la base de datos...')
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          image: null
        }
      })

      console.log('Usuario creado exitosamente:', user)

      // Generar token
      console.log('Generando token...')
      const token = generateToken(user.id)

      // Retornar respuesta sin la contraseña
      const { password: _, ...userWithoutPassword } = user
      console.log('Registro completado exitosamente para:', email)
      return NextResponse.json({
        message: 'Usuario registrado exitosamente',
        user: userWithoutPassword as User,
        token
      })
    } catch (dbError) {
      console.error('Error al crear usuario en la base de datos:', dbError)
      throw dbError
    }
  } catch (error) {
    console.error('Error detallado en registro:', error)
    return NextResponse.json(
      { message: 'Error al registrar usuario', error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
