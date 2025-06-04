import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

async function getUserIdFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    const { titulo, contenido } = await request.json()
    if (!titulo || !contenido) {
      return NextResponse.json({ message: 'Título y contenido son requeridos' }, { status: 400 })
    }

    const anuncio = await prisma.anuncio.create({
      data: {
        titulo,
        contenido,
        userId
      }
    })

    return NextResponse.json(anuncio)
  } catch {
    return NextResponse.json({ message: 'Error al crear el anuncio' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const anuncios = await prisma.anuncio.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(anuncios)
  } catch {
    return NextResponse.json({ message: 'Error al obtener los anuncios' }, { status: 500 })
  }
}
