import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  const logs = []
  
  try {
    logs.push('=== INICIANDO DEBUG ===')
    
    // 1. Testar conexão com banco
    logs.push('1. Testando conexão com banco...')
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    logs.push(`1.1. Conexão OK: ${JSON.stringify(dbTest)}`)
    
    // 2. Pegar dados da requisição
    logs.push('2. Pegando dados da requisição...')
    const body = await request.json()
    const { name, email, password } = body
    logs.push(`2.1. Dados: name=${name}, email=${email}, password length=${password?.length}`)
    
    // 3. Verificar se email já existe
    logs.push('3. Verificando email existente...')
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    })
    logs.push(`3.1. Email já existe? ${!!existing}`)
    
    if (existing) {
      return Response.json({ error: 'E-mail já cadastrado', logs }, { status: 400 })
    }
    
    // 4. Criar hash da senha
    logs.push('4. Criando hash da senha...')
    const hashedPassword = await bcrypt.hash(password, 10)
    logs.push('4.1. Hash criado com sucesso')
    
    // 5. Criar usuário
    logs.push('5. Criando usuário no banco...')
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {
            weightHistory: JSON.stringify([{ 
              date: new Date().toISOString().slice(0,10), 
              weight: 70 
            }])
          }
        }
      }
    })
    logs.push(`5.1. Usuário criado: ID=${user.id}`)
    
    // 6. Verificar se perfil foi criado
    logs.push('6. Verificando perfil...')
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })
    logs.push(`6.1. Perfil criado: ${!!profile}`)
    
    logs.push('=== SUCESSO ===')
    
    return Response.json({ 
      success: true, 
      userId: user.id,
      logs 
    })
    
  } catch (error) {
    logs.push(`❌ ERRO: ${error.message}`)
    logs.push(`📋 Código: ${error.code || 'sem código'}`)
    logs.push(`📚 Stack: ${error.stack}`)
    
    return Response.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      logs 
    }, { status: 500 })
  }
}
