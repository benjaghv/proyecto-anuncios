import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    const { anuncioId } = await req.json()
    if (!anuncioId) {
      return NextResponse.json({ message: 'ID del anuncio requerido' }, { status: 400 })
    }

    const favorito = await prisma.favorito.create({
      data: {
        userId,
        anuncioId
      }
    })

    return NextResponse.json(favorito)
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'El anuncio ya está en favoritos' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Error al agregar a favoritos' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    const { anuncioId } = await req.json()
    if (!anuncioId) {
      return NextResponse.json({ message: 'ID del anuncio requerido' }, { status: 400 })
    }

    await prisma.favorito.delete({
      where: {
        userId_anuncioId: {
          userId,
          anuncioId
        }
      }
    })

    return NextResponse.json({ message: 'Favorito eliminado' })
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar de favoritos' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    const favoritos = await prisma.favorito.findMany({
      where: { userId },
      include: {
        anuncio: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(favoritos)
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener favoritos' }, { status: 500 })
  }
} 