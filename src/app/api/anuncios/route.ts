import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET!

export async function GET() {
  const anuncios = await prisma.anuncio.findMany({
    include: { user: true },
    orderBy: { creadoEn: 'desc' }
  })
  return NextResponse.json(anuncios)
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ message: 'No autorizado' }, { status: 401 })

  const token = auth.replace('Bearer ', '')
  let decoded: any
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
  }

  const { titulo, contenido } = await req.json()
  const anuncio = await prisma.anuncio.create({
    data: {
      titulo,
      contenido,
      userId: decoded.userId
    }
  })

  return NextResponse.json(anuncio)
}
