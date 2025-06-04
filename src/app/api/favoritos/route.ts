import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const userId = await getUserIdFromToken(token)
    console.log('UserId extraído en GET favoritos:', userId)

    const favoritos = await db.favorito.findMany({
      where: { userId },
      include: {
        anuncio: true
      }
    })

    return NextResponse.json(favoritos)
  } catch (error) {
    console.error('Error al obtener favoritos:', error)
    return NextResponse.json(
      { message: 'Error al obtener favoritos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const userId = await getUserIdFromToken(token)
    console.log('UserId extraído en POST favoritos:', userId)

    const { anuncioId } = await request.json()

    // Verificar que el anuncio existe
    const anuncio = await db.anuncio.findUnique({
      where: { id: anuncioId }
    })

    if (!anuncio) {
      return NextResponse.json(
        { message: 'Anuncio no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no existe ya como favorito
    const favoritoExistente = await db.favorito.findFirst({
      where: {
        userId,
        anuncioId
      }
    })

    if (favoritoExistente) {
      return NextResponse.json(
        { message: 'El anuncio ya está en favoritos' },
        { status: 400 }
      )
    }

    const favorito = await db.favorito.create({
      data: {
        userId,
        anuncioId
      },
      include: {
        anuncio: true
      }
    })

    return NextResponse.json(favorito)
  } catch (error) {
    console.error('Error al agregar favorito:', error)
    return NextResponse.json(
      { message: 'Error al agregar favorito' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const userId = await getUserIdFromToken(token)
    console.log('UserId extraído en DELETE favoritos:', userId)

    const { anuncioId } = await request.json()

    // Verificar que el favorito existe
    const favorito = await db.favorito.findFirst({
      where: {
        userId,
        anuncioId
      }
    })

    if (!favorito) {
      return NextResponse.json(
        { message: 'Favorito no encontrado' },
        { status: 404 }
      )
    }

    await db.favorito.delete({
      where: {
        id: favorito.id
      }
    })

    return NextResponse.json({ message: 'Favorito eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar favorito:', error)
    return NextResponse.json(
      { message: 'Error al eliminar favorito' },
      { status: 500 }
    )
  }
} 