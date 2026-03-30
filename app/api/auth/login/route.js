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
    
    // Criar resposta com o cookie
    const response = Response.json({ 
      success: true,
      user: { id: user.id, name: user.name, email: user.email } 
    })
    
    // Adicionar cookie no header
    response.headers.set(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    )
    
    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return Response.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
