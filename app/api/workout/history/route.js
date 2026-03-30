import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const plans = await prisma.workoutPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return Response.json(plans.map(p => ({
      ...p,
      days: JSON.parse(p.days)
    })))
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}