import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Testar se o modelo WorkoutSession existe
    const test = await prisma.workoutSession.count()
    
    return Response.json({
      success: true,
      user: { id: user.id, name: user.name },
      workoutSessionCount: test,
      message: 'API funcionando'
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 })
  }
}
