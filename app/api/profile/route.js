import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })
    
    return Response.json(profile || {})
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const data = await request.json()
    
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
        weightHistory: JSON.stringify([])
      }
    })
    
    return Response.json(profile)
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}