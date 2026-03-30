export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const plans = await prisma.dietPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    const currentId = await prisma.dietPlan.findFirst({
      where: { userId: user.id, active: true },
      select: { id: true }
    })
    
    return Response.json({
      plans: plans.map(p => ({
        ...p,
        meals: JSON.parse(p.meals)
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
    
    const { name, goalDelta, meals } = await request.json()
    
    const totalNutrition = { totalKcal: 0, totalProt: 0, totalCarbs: 0 }
    meals.forEach(meal => {
      meal.foods.forEach(food => {
        totalNutrition.totalKcal += food.kcal || 0
        totalNutrition.totalProt += food.protein || 0
        totalNutrition.totalCarbs += food.carbs || 0
      })
    })
    
    await prisma.dietPlan.updateMany({
      where: { userId: user.id, active: true },
      data: { active: false }
    })
    
    const plan = await prisma.dietPlan.create({
      data: {
        userId: user.id,
        name,
        goalDelta,
        meals: JSON.stringify(meals),
        active: true,
        startDate: new Date(),
        totalKcal: totalNutrition.totalKcal,
        totalProtein: totalNutrition.totalProt,
        totalCarbs: totalNutrition.totalCarbs
      }
    })
    
    return Response.json(plan)
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
