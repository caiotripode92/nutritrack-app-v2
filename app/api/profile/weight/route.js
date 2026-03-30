import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    const { weight } = await request.json()
    
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    })
    
    let weightHistory = profile?.weightHistory ? JSON.parse(profile.weightHistory) : []
    weightHistory.push({
      date: new Date().toISOString().slice(0, 10),
      weight: weight
    })
    
    const updated = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        weight: weight,
        weightHistory: JSON.stringify(weightHistory)
      },
      create: {
        userId: user.id,
        weight: weight,
        weightHistory: JSON.stringify(weightHistory)
      }
    })
    
    return Response.json(updated)
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}