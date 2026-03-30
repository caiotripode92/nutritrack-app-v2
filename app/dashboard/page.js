'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import WeightChart from '@/components/WeightChart'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [tmb, setTmb] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        calculateTmb(data)
      } else if (res.status === 401) {
        router.push('/login')
      }
    } catch {
      console.error('Erro')
    } finally {
      setLoading(false)
    }
  }

  const calculateTmb = (data) => {
    if (!data.height || !data.weight || !data.age) return
    let tmbCalc = data.sex === 'M' 
      ? (10 * data.weight + 6.25 * data.height - 5 * data.age + 5)
      : (10 * data.weight + 6.25 * data.height - 5 * data.age - 161)
    tmbCalc = Math.round(tmbCalc * (data.activityLevel || 1.55))
    setTmb(tmbCalc)
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      height: parseFloat(formData.get('height')),
      weight: parseFloat(formData.get('weight')),
      sex: formData.get('sex'),
      age: parseInt(formData.get('age')),
      activityLevel: parseFloat(formData.get('activity'))
    }
    
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (res.ok) {
      const updated = await res.json()
      setProfile(updated)
      calculateTmb(updated)
    }
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Meus Dados</h2>
          <form onSubmit={updateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Altura (cm)</label>
              <input
                type="number"
                name="height"
                defaultValue={profile?.height || ''}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Peso (kg)</label>
              <input
                type="number"
                name="weight"
                step="0.1"
                defaultValue={profile?.weight || ''}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Idade</label>
              <input
                type="number"
                name="age"
                defaultValue={profile?.age || ''}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sexo</label>
              <select name="sex" defaultValue={profile?.sex || 'M'} className="w-full border rounded-lg px-3 py-2">
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nível de Atividade</label>
              <select name="activity" defaultValue={profile?.activityLevel || 1.55} className="w-full border rounded-lg px-3 py-2">
                <option value="1.2">Sedentário</option>
                <option value="1.375">Moderado (1-3x/semana)</option>
                <option value="1.55">Ativo (4-5x/semana)</option>
                <option value="1.725">Muito Ativo (6+x/semana)</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Salvar
            </button>
          </form>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-center">
              <strong>TMB (Gasto Diário):</strong> {tmb} kcal
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Evolução do Peso</h2>
          <WeightChart weightHistory={profile?.weightHistory || []} />
          
          <form onSubmit={async (e) => {
            e.preventDefault()
            const weight = parseFloat(e.target.weight.value)
            const res = await fetch('/api/profile/weight', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ weight })
            })
            if (res.ok) {
              const data = await res.json()
              setProfile(data)
              calculateTmb(data)
              e.target.reset()
            }
          }} className="mt-4 flex gap-2">
            <input
              type="number"
              name="weight"
              step="0.1"
              placeholder="Novo peso (kg)"
              className="flex-1 border rounded-lg px-3 py-2"
              required
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Registrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}