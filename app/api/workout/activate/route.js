import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { id } = await request.json()
    
    await prisma.workoutPlan.updateMany({
      where: { userId: user.id, active: true },
      data: { active: false }
    })
    
    await prisma.workoutPlan.update({
      where: { id, userId: user.id },
      data: { active: true, startDate: new Date() }
    })
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}