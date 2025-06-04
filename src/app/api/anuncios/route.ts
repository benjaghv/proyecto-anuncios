import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

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
  } catch (error) {
    console.error('Error creating announcement:', error)
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
      },
      orderBy: {
        creadoEn: 'desc'
      }
    })

    // Asegurarse de que siempre devolvemos un array
    return NextResponse.json(Array.isArray(anuncios) ? anuncios : [])
  } catch (error) {
    console.error('Error fetching announcements:', error)
    // En caso de error, devolver un array vacío en lugar de un mensaje de error
    return NextResponse.json([])
  }
}
