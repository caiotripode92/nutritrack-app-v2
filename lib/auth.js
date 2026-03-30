import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export async function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export async function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) return null
  
  const decoded = await verifyToken(token)
  if (!decoded) return null
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { profile: true }
  })
  
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Não autenticado')
  }
  return user
}