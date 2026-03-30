export const dynamic = 'force-dynamic'

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
    
    const currentId = await prisma.workoutPlan.findFirst({
      where: { userId: user.id, active: true },
      select: { id: true }
    })
    
    return Response.json({
      plans: plans.map(p => ({
        ...p,
        days: JSON.parse(p.days)
      })),
      currentId: currentId?.id
    })
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { name, days } = await request.json()
    
    await prisma.workoutPlan.updateMany({
      where: { userId: user.id, active: true },
      data: { active: false }
    })
    
    const plan = await prisma.workoutPlan.create({
      data: {
        userId: user.id,
        name,
        days: JSON.stringify(days),
        active: true,
        startDate: new Date()
      }
    })
    
    return Response.json(plan)
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
