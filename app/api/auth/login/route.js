import { prisma } from '@/lib/db'
import { createToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return Response.json({ error: 'Usuário não encontrado' }, { status: 401 })
    }
    
    const valid = await bcrypt.compare(password, user.password)
    
    if (!valid) {
      return Response.json({ error: 'Senha inválida' }, { status: 401 })
    }
    
    const token = await createToken(user.id)
    
    const response = Response.json({ user: { id: user.id, name: user.name, email: user.email } })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7
    })
    
    return response
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}