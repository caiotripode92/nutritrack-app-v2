import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { workoutPlanId, dayIndex } = await request.json()
    
    console.log('Iniciando treino:', { userId: user.id, workoutPlanId, dayIndex })
    
    if (!workoutPlanId) {
      return Response.json({ error: 'workoutPlanId é obrigatório' }, { status: 400 })
    }
    
    if (dayIndex === undefined || dayIndex === null) {
      return Response.json({ error: 'dayIndex é obrigatório' }, { status: 400 })
    }
    
    // Verificar se o plano existe
    const plan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId, userId: user.id }
    })
    
    if (!plan) {
      return Response.json({ error: 'Plano de treino não encontrado' }, { status: 404 })
    }
    
    // Criar sessão
    const session = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        workoutPlanId,
        dayIndex,
        startTime: new Date(),
        seriesData: JSON.stringify({})
      }
    })
    
    console.log('Sessão criada:', session.id)
    
    return Response.json({
      id: session.id,
      userId: session.userId,
      workoutPlanId: session.workoutPlanId,
      dayIndex: session.dayIndex,
      startTime: session.startTime,
      seriesData: {}
    })
  } catch (error) {
    console.error('Erro detalhado ao iniciar treino:', error)
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
