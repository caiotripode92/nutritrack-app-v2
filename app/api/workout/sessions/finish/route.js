import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return Response.json({ error: 'ID da sessão não informado' }, { status: 400 })
    }
    
    const session = await prisma.workoutSession.update({
      where: { id: sessionId, userId: user.id },
      data: { endTime: new Date() }
    })
    
    return Response.json({
      id: session.id,
      userId: session.userId,
      workoutPlanId: session.workoutPlanId,
      dayIndex: session.dayIndex,
      startTime: session.startTime,
      endTime: session.endTime,
      seriesData: JSON.parse(session.seriesData)
    })
  } catch (error) {
    console.error('Erro ao finalizar treino:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
