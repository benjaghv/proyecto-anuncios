import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromToken } from '@/lib/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    console.log('Token recibido en POST:', token)
    let userId: string
    try {
      userId = await getUserIdFromToken(token)
      console.log('UserId extraído:', userId)
    } catch (error) {
      console.error('Error al verificar token:', error)
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
    }

    const { titulo, contenido, descripcion, precio, categoria, imagen } = await req.json()
    if (!titulo || !contenido) {
      return NextResponse.json({ message: 'Título y contenido son requeridos' }, { status: 400 })
    }

    const anuncio = await prisma.anuncio.create({
      data: {
        titulo,
        contenido,
        descripcion,
        precio,
        categoria,
        imagen,
        userId
      },
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

    return NextResponse.json(anuncio)
  } catch (error) {
    console.error('Error al crear anuncio:', error)
    return NextResponse.json(
      { message: 'Error al crear el anuncio', error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    let userId: string | undefined

    if (token) {
      try {
        userId = await getUserIdFromToken(token)
        console.log('Usuario autenticado:', userId)
      } catch (error) {
        console.error('Error al verificar token:', error)
        // No retornamos error, continuamos sin autenticación
      }
    }

    console.log('Buscando anuncios en la base de datos...')
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

    console.log('Anuncios encontrados:', anuncios.length)
    return NextResponse.json(anuncios)
  } catch (error) {
    console.error('Error al obtener anuncios:', error)
    return NextResponse.json(
      { 
        message: 'Error al obtener anuncios', 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}
