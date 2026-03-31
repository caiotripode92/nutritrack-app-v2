export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'qualquer-chave'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ error: 'Usuário não encontrado' }, { status: 401 })
    
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return Response.json({ error: 'Senha inválida' }, { status: 401 })
    
    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '7d' })
    
    const res = Response.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
    res.headers.set('Set-Cookie', `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`)
    
    return res
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
