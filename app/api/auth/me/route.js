import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    return Response.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}