export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
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
    
    return Response.json({ 
      success: true,
      user: { id: user.id, name: user.name, email: user.email } 
    })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
