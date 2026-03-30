export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { sessionId, exerciseIdx, setIdx, weight, exerciseName } = await request.json()
    
    if (!sessionId || exerciseIdx === undefined || setIdx === undefined) {
      return Response.json({ error: 'Dados incompletos' }, { status: 400 })
    }
    
    // Buscar sessão atual
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId, userId: user.id }
    })
    
    if (!session) {
      return Response.json({ error: 'Sessão não encontrada' }, { status: 404 })
    }
    
    // Atualizar seriesData
    let seriesData = {}
    try {
      seriesData = JSON.parse(session.seriesData || '{}')
    } catch (e) {
      seriesData = {}
    }
    
    const key = `${exerciseIdx}_${setIdx}`
    seriesData[key] = { weight: weight || 0, timestamp: new Date().toISOString() }
    
    // Atualizar no banco
    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: { seriesData: JSON.stringify(seriesData) }
    })
    
    // Atualizar o plano de treino com o novo máximo e histórico
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: session.workoutPlanId }
    })
    
    if (workoutPlan && weight > 0) {
      let days = []
      try {
        days = JSON.parse(workoutPlan.days)
      } catch (e) {
        days = []
      }
      
      const day = days[session.dayIndex]
      if (day && day.exercises && day.exercises[exerciseIdx]) {
        const exercise = day.exercises[exerciseIdx]
        
        // Atualizar máximo
        if (weight > (exercise.maxWeightEver || 0)) {
          exercise.maxWeightEver = weight
        }
        
        // Atualizar histórico
        if (!exercise.lastWeights) exercise.lastWeights = []
        exercise.lastWeights.push(weight)
        if (exercise.lastWeights.length > 10) exercise.lastWeights.shift()
        
        // Salvar no banco
        await prisma.workoutPlan.update({
          where: { id: session.workoutPlanId },
          data: { days: JSON.stringify(days) }
        })
      }
    }
    
    return Response.json({
      id: updatedSession.id,
      userId: updatedSession.userId,
      workoutPlanId: updatedSession.workoutPlanId,
      dayIndex: updatedSession.dayIndex,
      startTime: updatedSession.startTime,
      endTime: updatedSession.endTime,
      seriesData: JSON.parse(updatedSession.seriesData)
    })
  } catch (error) {
    console.error('Erro ao atualizar série:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
