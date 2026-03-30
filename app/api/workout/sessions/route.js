import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: user.id },
      include: { workoutPlan: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    return Response.json(sessions.map(s => ({
      ...s,
      seriesData: JSON.parse(s.seriesData)
    })))
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}