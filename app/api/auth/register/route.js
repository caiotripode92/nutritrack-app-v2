export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { createToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()
    
    const existing = await prisma.user.findUnique({ where: { email } })
    
    if (existing) {
      return Response.json({ error: 'E-mail já cadastrado' }, { status: 400 })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {
            weightHistory: JSON.stringify([{ date: new Date().toISOString().slice(0,10), weight: 70 }])
          }
        }
      }
    })
    
    const token = await createToken(user.id)
    
    const response = Response.json({ 
      success: true,
      user: { id: user.id, name: user.name, email: user.email } 
    })
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Erro no registro:', error)
    return Response.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
