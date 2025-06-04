import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Función para verificar el token y obtener el userId
async function getUserIdFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// Función para verificar si el usuario es el propietario del anuncio
async function isOwner(userId: string, anuncioId: string) {
  const anuncio = await prisma.anuncio.findUnique({
    where: { id: anuncioId }
  })
  return anuncio?.userId === userId
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    if (!await isOwner(userId, params.id)) {
      return NextResponse.json({ message: 'No tienes permiso para editar este anuncio' }, { status: 403 })
    }

    const { titulo, contenido } = await req.json()
    if (!titulo || !contenido) {
      return NextResponse.json({ message: 'Título y contenido son requeridos' }, { status: 400 })
    }

    const anuncio = await prisma.anuncio.update({
      where: { id: params.id },
      data: { titulo, contenido }
    })

    return NextResponse.json(anuncio)
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar el anuncio' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const userId = await getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    if (!await isOwner(userId, params.id)) {
      return NextResponse.json({ message: 'No tienes permiso para eliminar este anuncio' }, { status: 403 })
    }

    await prisma.anuncio.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Anuncio eliminado' })
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar el anuncio' }, { status: 500 })
  }
} 