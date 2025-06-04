import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    let userId: string
    try {
      userId = await getUserIdFromToken(token)
      console.log('UserId extraído en PUT:', userId)
    } catch (error) {
      console.error('Error al verificar token en PUT:', error)
      return NextResponse.json(
        { message: 'Token inválido o expirado' },
        { status: 401 }
      )
    }

    const anuncio = await db.anuncio.findUnique({
      where: { id: params.id }
    })

    if (!anuncio) {
      return NextResponse.json(
        { message: 'Anuncio no encontrado' },
        { status: 404 }
      )
    }

    if (anuncio.userId !== userId) {
      return NextResponse.json(
        { message: 'No tienes permiso para editar este anuncio' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const anuncioActualizado = await db.anuncio.update({
      where: { id: params.id },
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        precio: data.precio,
        categoria: data.categoria,
        imagen: data.imagen
      }
    })

    return NextResponse.json(anuncioActualizado)
  } catch (error) {
    console.error('Error al actualizar anuncio:', error)
    return NextResponse.json(
      { message: 'Error al actualizar el anuncio' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    let userId: string
    try {
      userId = await getUserIdFromToken(token)
      console.log('UserId extraído en DELETE:', userId)
    } catch (error) {
      console.error('Error al verificar token en DELETE:', error)
      return NextResponse.json(
        { message: 'Token inválido o expirado' },
        { status: 401 }
      )
    }

    const anuncio = await db.anuncio.findUnique({
      where: { id: params.id }
    })

    if (!anuncio) {
      return NextResponse.json(
        { message: 'Anuncio no encontrado' },
        { status: 404 }
      )
    }

    if (anuncio.userId !== userId) {
      return NextResponse.json(
        { message: 'No tienes permiso para eliminar este anuncio' },
        { status: 403 }
      )
    }

    await db.anuncio.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Anuncio eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar anuncio:', error)
    return NextResponse.json(
      { message: 'Error al eliminar el anuncio' },
      { status: 500 }
    )
  }
} 