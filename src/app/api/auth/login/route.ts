import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const user = await prisma.user.findUnique({ where: { email } })
  
  if (!user) {
    return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 400 })
  }

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 400 })
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' })

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  })
}
