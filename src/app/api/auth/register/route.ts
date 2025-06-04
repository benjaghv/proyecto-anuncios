import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()
  const userExist = await prisma.user.findUnique({ where: { email } })
  if (userExist) {
    return NextResponse.json({ message: 'Usuario ya existe' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { 
      email, 
      password: hashedPassword,
      name: name || email.split('@')[0] // Usar el nombre proporcionado o la parte del email antes del @
    }
  })

  return NextResponse.json({ 
    message: 'Usuario registrado', 
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  })
}
