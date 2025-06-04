import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface TokenPayload {
  id: string
  email: string
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    
    // Verificar que el usuario aún existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    return decoded
  } catch (error) {
    throw new Error('Token inválido')
  }
}

export const getUserIdFromToken = async (token: string): Promise<string> => {
  const decoded = await verifyToken(token)
  return decoded.id
} 