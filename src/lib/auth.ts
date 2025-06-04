import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

// Usar una clave secreta consistente
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura'

// Configurar el runtime de Node.js
export const runtime = 'nodejs'

export function generateToken(userId: string): string {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  }
  console.log('Generando token con payload:', payload)
  return jwt.sign(payload, JWT_SECRET)
}

export function verifyToken(token: string): { userId: string } {
  console.log('Verificando token:', token)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    console.log('Token decodificado:', decoded)
    return decoded
  } catch (error) {
    console.error('Error al verificar token:', error)
    throw new Error('Token inválido o expirado')
  }
}

export async function getUserIdFromToken(token: string): Promise<string> {
  try {
    const decoded = verifyToken(token)
    if (!decoded.userId) {
      throw new Error('Token inválido: no contiene userId')
    }
    return decoded.userId
  } catch (error) {
    console.error('Error al obtener userId del token:', error)
    throw error
  }
} 