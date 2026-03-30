export const dynamic = 'force-dynamic'

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
      orderBy: { startTime: 'desc' },
      take: 50
    })
    
    return Response.json(sessions.map(s => ({
      ...s,
      seriesData: JSON.parse(s.seriesData || '{}')
    })))
  } catch (error) {
    console.error('Erro ao listar sessões:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
