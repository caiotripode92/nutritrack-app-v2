import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { sessionId, exerciseIdx, setIdx, weight } = await request.json()
    
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId, userId: user.id }
    })
    
    if (!session) {
      return Response.json({ error: 'Sessão não encontrada' }, { status: 404 })
    }
    
    let seriesData = JSON.parse(session.seriesData)
    seriesData[`${exerciseIdx}_${setIdx}`] = { weight }
    
    const updated = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: { seriesData: JSON.stringify(seriesData) }
    })
    
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: session.workoutPlanId }
    })
    
    if (workoutPlan && weight > 0) {
      const days = JSON.parse(workoutPlan.days)
      const exercise = days[session.dayIndex]?.exercises[exerciseIdx]
      if (exercise) {
        if (weight > (exercise.maxWeightEver || 0)) {
          exercise.maxWeightEver = weight
        }
        if (!exercise.lastWeights) exercise.lastWeights = []
        exercise.lastWeights.push(weight)
        
        await prisma.workoutPlan.update({
          where: { id: session.workoutPlanId },
          data: { days: JSON.stringify(days) }
        })
      }
    }
    
    return Response.json({
      ...updated,
      seriesData: JSON.parse(updated.seriesData)
    })
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}