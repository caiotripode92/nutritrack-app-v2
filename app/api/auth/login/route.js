export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-temporaria'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    console.log('Login attempt for:', email)
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('User not found')
      return Response.json({ error: 'Usuário não encontrado' }, { status: 401 })
    }
    
    console.log('User found:', user.id)
    
    // Verificar senha
    const valid = await bcrypt.compare(password, user.password)
    
    if (!valid) {
      console.log('Invalid password')
      return Response.json({ error: 'Senha inválida' }, { status: 401 })
    }
    
    // Gerar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    
    console.log('Token generated, creating response')
    
    // Criar resposta
    const response = Response.json({ 
      success: true,
      user: { id: user.id, name: user.name, email: user.email } 
    })
    
    // Set cookie MANUALMENTE
    response.headers.set(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
    )
    
    console.log('Login successful')
    return response
    
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ 
      error: 'Erro interno no servidor',
      details: error.message 
    }, { status: 500 })
  }
}
