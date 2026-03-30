'use client'

import { useState, useEffect } from 'react'

export default function HistoricoPage() {
  const [dietPlans, setDietPlans] = useState([])
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [workoutSessions, setWorkoutSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const [dietsRes, workoutsRes, sessionsRes] = await Promise.all([
        fetch('/api/diet/history'),
        fetch('/api/workout/history'),
        fetch('/api/workout/sessions')
      ])
      
      if (dietsRes.ok) setDietPlans(await dietsRes.json())
      if (workoutsRes.ok) setWorkoutPlans(await workoutsRes.json())
      if (sessionsRes.ok) setWorkoutSessions(await sessionsRes.json())
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-10">Carregando histórico...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Histórico</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Planos Alimentares Anteriores</h2>
        
        {dietPlans.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum plano alimentar encontrado</p>
        ) : (
          <div className="space-y-3">
            {dietPlans.map(plan => (
              <div key={plan.id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-gray-600">
                      Meta: {plan.goalDelta > 0 ? '+' : ''}{plan.goalDelta} kcal
                    </p>
                    <p className="text-xs text-gray-500">
                      Criado: {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${plan.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                {plan.meals && plan.meals.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer">Ver detalhes</summary>
                    <div className="mt-2 text-sm">
                      <p>Refeições: {plan.meals.length}</p>
                      <p>Total: {Math.round(plan.totalKcal || 0)} kcal</p>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🏋️ Planos de Treino Anteriores</h2>
        
        {workoutPlans.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum plano de treino encontrado</p>
        ) : (
          <div className="space-y-3">
            {workoutPlans.map(plan => (
              <div key={plan.id} className="border-l-4 border-green-500 bg-gray-50 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-gray-600">
                      {plan.days?.length || 0} dias de treino
                    </p>
                    <p className="text-xs text-gray-500">
                      Criado: {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${plan.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Sessões de Treino Realizadas</h2>
        
        {workoutSessions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma sessão de treino registrada</p>
        ) : (
          <div className="space-y-3">
            {workoutSessions.map(session => (
              <div key={session.id} className="border-l-4 border-purple-500 bg-gray-50 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{session.workoutPlan?.name || 'Plano de treino'}</h3>
                    <p className="text-sm text-gray-600">
                      Dia: {session.dayIndex !== undefined ? `Dia ${session.dayIndex + 1}` : 'Dia não especificado'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Início: {new Date(session.startTime).toLocaleString()}
                    </p>
                    {session.endTime && (
                      <p className="text-xs text-gray-500">
                        Fim: {new Date(session.endTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {session.endTime ? '✅ Finalizado' : '⏸️ Interrompido'}
                  </span>
                </div>
                
                {session.seriesData && Object.keys(session.seriesData).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer">Ver séries realizadas</summary>
                    <div className="mt-2 text-sm">
                      <p>Total de séries: {Object.keys(session.seriesData).length}</p>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}