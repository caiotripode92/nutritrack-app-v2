import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-temporaria'

export async function POST(request) {
  const logs = []
  
  try {
    const { email, password } = await request.json()
    logs.push(`1. Tentando login com: ${email}`)
    
    // Buscar usuário
    logs.push('2. Buscando usuário no banco...')
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      logs.push('3. Usuário não encontrado')
      return Response.json({ error: 'Usuário não encontrado', logs }, { status: 401 })
    }
    logs.push(`3. Usuário encontrado: ${user.id}`)
    
    // Verificar senha
    logs.push('4. Verificando senha...')
    const valid = await bcrypt.compare(password, user.password)
    logs.push(`4.1. Senha válida? ${valid}`)
    
    if (!valid) {
      logs.push('5. Senha inválida')
      return Response.json({ error: 'Senha inválida', logs }, { status: 401 })
    }
    
    // Gerar token
    logs.push('6. Gerando token JWT...')
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    logs.push('6.1. Token gerado com sucesso')
    
    // Criar resposta com cookie
    logs.push('7. Criando resposta...')
    const response = Response.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email },
      logs 
    })
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })
    
    logs.push('8. Login finalizado com sucesso!')
    return response
    
  } catch (error) {
    logs.push(`❌ ERRO: ${error.message}`)
    logs.push(`📚 Stack: ${error.stack}`)
    
    return Response.json({ 
      error: error.message,
      logs 
    }, { status: 500 })
  }
}
