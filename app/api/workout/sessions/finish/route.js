import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { sessionId } = await request.json()
    
    const session = await prisma.workoutSession.update({
      where: { id: sessionId, userId: user.id },
      data: { endTime: new Date() }
    })
    
    return Response.json(session)
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}