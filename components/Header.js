'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return null

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            NutriTrack
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
            <Link href="/dieta" className="text-gray-700 hover:text-blue-600">Dieta</Link>
            <Link href="/treino" className="text-gray-700 hover:text-blue-600">Treino</Link>
            <Link href="/historico" className="text-gray-700 hover:text-blue-600">Histórico</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Olá, {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
