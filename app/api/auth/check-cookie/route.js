export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  
  return Response.json({
    hasToken: !!token,
    tokenValue: token?.value ? 'presente' : 'ausente',
    allCookies: cookieStore.getAll().map(c => c.name)
  })
}
