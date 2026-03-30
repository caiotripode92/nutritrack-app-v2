import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { workoutPlanId, dayIndex } = await request.json()
    
    const session = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        workoutPlanId,
        dayIndex,
        startTime: new Date(),
        seriesData: JSON.stringify({})
      }
    })
    
    return Response.json(session)
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}