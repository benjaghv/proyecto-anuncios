import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

// Función para verificar el token y obtener el userId
async function getUserIdFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: Request, context: any) {
  const { params } = context;
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

    const anuncio = await prisma.anuncio.findUnique({
      where: { id: params.id }
    })

    if (!anuncio) {
      return NextResponse.json({ message: 'Anuncio no encontrado' }, { status: 404 })
    }

    if (anuncio.userId !== userId) {
      return NextResponse.json({ message: 'No autorizado para editar este anuncio' }, { status: 403 })
    }

    const anuncioActualizado = await prisma.anuncio.update({
      where: { id: params.id },
      data: { titulo, contenido }
    })

    return NextResponse.json(anuncioActualizado)
  } catch {
    return NextResponse.json({ message: 'Error al actualizar el anuncio' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: Request, context: any) {
  const { params } = context;
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    const anuncio = await prisma.anuncio.findUnique({
      where: { id: params.id }
    })

    if (!anuncio) {
      return NextResponse.json({ message: 'Anuncio no encontrado' }, { status: 404 })
    }

    if (anuncio.userId !== userId) {
      return NextResponse.json({ message: 'No autorizado para eliminar este anuncio' }, { status: 403 })
    }

    await prisma.anuncio.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Anuncio eliminado' })
  } catch {
    return NextResponse.json({ message: 'Error al eliminar el anuncio' }, { status: 500 })
  }
} 