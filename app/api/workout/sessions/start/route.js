import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { workoutPlanId, dayIndex } = await request.json()
    
    if (!workoutPlanId || dayIndex === undefined) {
      return Response.json({ error: 'Dados incompletos' }, { status: 400 })
    }
    
    const session = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        workoutPlanId,
        dayIndex,
        startTime: new Date(),
        seriesData: JSON.stringify({})
      }
    })
    
    return Response.json({
      id: session.id,
      userId: session.userId,
      workoutPlanId: session.workoutPlanId,
      dayIndex: session.dayIndex,
      startTime: session.startTime,
      seriesData: JSON.parse(session.seriesData)
    })
  } catch (error) {
    console.error('Erro ao iniciar treino:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
