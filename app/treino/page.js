'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const exercisesByGroup = {
  "Peito": ["Supino reto", "Supino inclinado", "Supino declinado", "Crucifixo", "Crossover", "Peck deck", "Flexão de braços", "Supino com halteres", "Pullover"],
  "Costas": ["Puxada frontal", "Remada curvada", "Remada sentada", "Remada unilateral", "Levantamento terra", "Pulley frente", "Barra fixa", "Remada máquina", "Puxada triângulo"],
  "Pernas": ["Agachamento livre", "Leg press", "Cadeira extensora", "Cadeira flexora", "Stiff", "Panturrilha em pé", "Panturrilha sentado", "Hack machine", "Agachamento sumô", "Afundo", "Cadeira adutora", "Cadeira abdutora"],
  "Ombros": ["Desenvolvimento", "Elevação lateral", "Elevação frontal", "Crucifixo inverso", "Encolhimento", "Desenvolvimento militar", "Elevação lateral polia"],
  "Bíceps": ["Rosca direta", "Rosca alternada", "Rosca concentrada", "Rosca scott", "Rosca martelo", "Rosca 21", "Rosca direta barra w", "Rosca inversa"],
  "Tríceps": ["Tríceps pulley", "Tríceps testa", "Tríceps coice", "Mergulho", "Tríceps francês", "Tríceps corda", "Tríceps banco"],
  "Abdômen": ["Abdominal crunch", "Prancha", "Elevação de pernas", "Abdominal infra", "Russian twist", "Abdominal oblíquo", "Abdominal máquina", "Prancha lateral"],
  "Glúteos": ["Elevação pélvica", "Agachamento sumô", "Cadeira abdutora", "Glúteo no cabo", "Passada", "Cadeira flexora", "Hip thrust"],
  "Trapézio": ["Encolhimento com halteres", "Remada alta", "Encolhimento na máquina"],
  "Antebraço": ["Rosca punho", "Rosca inversa", "Grip", "Farmer's walk"]
}

export default function TreinoPage() {
  const router = useRouter()
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [currentWorkoutId, setCurrentWorkoutId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingDays, setEditingDays] = useState([])
  const [planName, setPlanName] = useState('')
  const [expandedPlans, setExpandedPlans] = useState({})
  const [trainingSession, setTrainingSession] = useState(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [timerInterval, setTimerInterval] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    fetchData()
    fetchSessions()
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/workout')
      if (res.ok) {
        const data = await res.json()
        console.log('Planos carregados:', data)
        setWorkoutPlans(data.plans || [])
        setCurrentWorkoutId(data.currentId)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/workout/sessions')
      if (res.ok) {
        const data = await res.json()
        console.log('Sessões carregadas:', data)
        setWorkoutPlans(prev => prev.map(plan => {
          const sessions = data.filter(s => s.workoutPlanId === plan.id)
          return { ...plan, sessions }
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    }
  }

  const activateWorkout = async (id) => {
    try {
      const res = await fetch('/api/workout/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setCurrentWorkoutId(id)
        fetchData()
      } else {
        const error = await res.json()
        alert('Erro ao ativar: ' + (error.error || 'Tente novamente'))
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro de conexão')
    }
  }

  const toggleExpandPlan = (planId) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }))
  }

  const addDay = () => {
    setEditingDays([...editingDays, { name: `Dia ${editingDays.length + 1}`, exercises: [] }])
  }

  const removeDay = (dayIdx) => {
    const newDays = [...editingDays]
    newDays.splice(dayIdx, 1)
    setEditingDays(newDays)
  }

  const addExercise = (dayIdx) => {
    const newDays = [...editingDays]
    newDays[dayIdx].exercises.push({
      name: exercisesByGroup["Peito"][0],
      group: "Peito",
      sets: 3,
      reps: 12,
      lastWeights: [],
      maxWeightEver: 0
    })
    setEditingDays(newDays)
  }

  const removeExercise = (dayIdx, exIdx) => {
    const newDays = [...editingDays]
    newDays[dayIdx].exercises.splice(exIdx, 1)
    setEditingDays(newDays)
  }

  const updateExercise = (dayIdx, exIdx, field, value) => {
    const newDays = [...editingDays]
    if (field === 'group') {
      newDays[dayIdx].exercises[exIdx].group = value
      newDays[dayIdx].exercises[exIdx].name = exercisesByGroup[value][0]
    } else if (field === 'name') {
      if (value === 'custom') {
        const customName = prompt('Nome do exercício personalizado:')
        if (customName) newDays[dayIdx].exercises[exIdx].name = customName
      } else {
        newDays[dayIdx].exercises[exIdx].name = value
      }
    } else {
      newDays[dayIdx].exercises[exIdx][field] = parseInt(value)
    }
    setEditingDays(newDays)
  }

  const saveWorkoutPlan = async () => {
    if (!planName) {
      alert('Por favor, dê um nome ao plano')
      return
    }
    if (editingDays.length === 0) {
      alert('Adicione pelo menos um dia de treino')
      return
    }

    const planData = {
      name: planName,
      days: editingDays
    }
    
    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      })
      
      if (res.ok) {
        setShowModal(false)
        fetchData()
        setEditingDays([])
        setPlanName('')
      } else {
        const error = await res.json()
        alert('Erro ao salvar: ' + (error.error || 'Tente novamente'))
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro de conexão')
    }
  }

  const startTraining = async (planId, dayIndex) => {
    try {
      console.log('Iniciando treino:', { planId, dayIndex })
      
      const res = await fetch('/api/workout/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutPlanId: planId, dayIndex })
      })
      
      const data = await res.json()
      console.log('Resposta do servidor:', data)
      
      if (res.ok) {
        setTrainingSession(data)
        setElapsedTime(0)
        const interval = setInterval(() => {
          setElapsedTime(prev => prev + 1)
        }, 1000)
        setTimerInterval(interval)
      } else {
        alert('Erro ao iniciar treino: ' + (data.error || 'Tente novamente'))
      }
    } catch (error) {
      console.error('Erro ao iniciar treino:', error)
      alert('Erro de conexão ao iniciar treino')
    }
  }

  const updateSeriesWeight = async (exerciseIdx, setIdx, weight, exercise) => {
    if (!trainingSession) return
    
    try {
      console.log('Atualizando peso:', { exerciseIdx, setIdx, weight })
      
      // Atualizar localmente
      const newSeriesData = { ...trainingSession.seriesData }
      newSeriesData[`${exerciseIdx}_${setIdx}`] = { weight }
      setTrainingSession({ ...trainingSession, seriesData: newSeriesData })
      
      // Salvar no servidor
      const res = await fetch('/api/workout/session/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: trainingSession.id,
          exerciseIdx,
          setIdx,
          weight,
          exerciseName: exercise.name
        })
      })
      
      const data = await res.json()
      console.log('Resposta atualização:', data)
      
      if (res.ok) {
        setTrainingSession(data)
        // Recarregar dados para atualizar histórico
        fetchData()
        fetchSessions()
      } else {
        console.error('Erro na atualização:', data.error)
      }
    } catch (error) {
      console.error('Erro ao atualizar peso:', error)
    }
  }

  const finishTraining = async () => {
    if (!trainingSession) return
    
    if (timerInterval) clearInterval(timerInterval)
    
    try {
      const res = await fetch('/api/workout/session/finish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: trainingSession.id })
      })
      
      if (res.ok) {
        setTrainingSession(null)
        setTimerInterval(null)
        setElapsedTime(0)
        fetchData()
        fetchSessions()
        alert('Treino finalizado com sucesso! 🎉')
      } else {
        const error = await res.json()
        alert('Erro ao finalizar: ' + (error.error || 'Tente novamente'))
      }
    } catch (error) {
      console.error('Erro ao finalizar:', error)
      alert('Erro de conexão')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const activePlan = workoutPlans.find(p => p.id === currentWorkoutId)
  const selectedDayData = activePlan?.days?.[selectedDay]
  const hasExercises = selectedDayData?.exercises?.length > 0

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Carregando planos de treino...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">🏋️ Planos de Treino</h1>
        <button
          onClick={() => {
            setEditingDays([])
            setPlanName('')
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Novo Plano
        </button>
      </div>

      {/* Sessão de treino ativa */}
      {trainingSession && activePlan && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-800">🔥 Treino em Andamento</h2>
            <div className="text-2xl font-mono font-bold text-green-700">{formatTime(elapsedTime)}</div>
          </div>
          <p className="text-green-700 mb-4">
            Plano: <strong>{activePlan.name}</strong> | 
            Dia: <strong>{activePlan.days[trainingSession.dayIndex]?.name}</strong>
          </p>
          
          {activePlan.days[trainingSession.dayIndex]?.exercises?.map((exercise, exIdx) => {
            const exerciseHistory = exercise.lastWeights || []
            const lastWeight = exerciseHistory.length > 0 ? exerciseHistory[exerciseHistory.length - 1] : 0
            
            return (
              <div key={exIdx} className="bg-white rounded-lg p-4 mb-4 shadow">
                <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Grupo: {exercise.group} | Séries: {exercise.sets} | Reps: {exercise.reps}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  💪 Máximo já usado: <strong className="text-blue-600">{exercise.maxWeightEver || 0} kg</strong>
                  {lastWeight > 0 && ` | Último treino: ${lastWeight} kg`}
                </p>
                
                <div className="space-y-2">
                  {[...Array(exercise.sets)].map((_, setIdx) => {
                    const seriesKey = `${exIdx}_${setIdx}`
                    const seriesData = trainingSession.seriesData?.[seriesKey] || {}
                    return (
                      <div key={setIdx} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium w-16">Série {setIdx + 1}:</span>
                        <input
                          type="number"
                          placeholder="Peso (kg)"
                          value={seriesData.weight || ''}
                          onChange={(e) => updateSeriesWeight(exIdx, setIdx, parseFloat(e.target.value), exercise)}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          step="0.5"
                        />
                        <span className="text-sm">kg</span>
                        <span className="text-sm text-gray-500">x {exercise.reps} reps</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          
          <button
            onClick={finishTraining}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors mt-4"
          >
            ✅ Finalizar Treino
          </button>
        </div>
      )}

      {/* Plano ativo */}
      {activePlan && !trainingSession && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📋 Plano Ativo: {activePlan.name}</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Selecione o dia para treinar</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {activePlan.days?.map((day, idx) => (
                  <option key={idx} value={idx}>{day.name} ({day.exercises?.length || 0} exercícios)</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => startTraining(currentWorkoutId, selectedDay)}
              disabled={!hasExercises}
              className={`bg-green-600 text-white px-6 py-2 rounded-lg transition-colors ${!hasExercises ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
            >
              ▶️ Iniciar Treino
            </button>
          </div>
          {!hasExercises && selectedDayData && (
            <p className="text-xs text-red-500 mt-2">Este dia não tem exercícios cadastrados. Edite o plano para adicionar exercícios.</p>
          )}
        </div>
      )}

      {!activePlan && !trainingSession && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Nenhum plano de treino ativo.</p>
          <p className="text-yellow-600 text-sm mt-2">Crie um novo plano ou ative um existente.</p>
        </div>
      )}

      {/* Lista de planos */}
      {workoutPlans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">📚 Seus Planos</h2>
          <div className="grid gap-4">
            {workoutPlans.map(plan => (
              <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {currentWorkoutId === plan.id && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            ✅ ATIVO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {plan.days?.length || 0} dias de treino
                      </p>
                      <p className="text-xs text-gray-500">
                        Criado em: {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {currentWorkoutId !== plan.id && (
                        <button
                          onClick={() => activateWorkout(plan.id)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                        >
                          Ativar
                        </button>
                      )}
                      <button
                        onClick={() => toggleExpandPlan(plan.id)}
                        className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg text-sm"
                      >
                        {expandedPlans[plan.id] ? '▲ Esconder' : '▼ Ver detalhes'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {expandedPlans[plan.id] && plan.days && plan.days.length > 0 && (
                  <div className="p-4 space-y-4">
                    {plan.days.map((day, dayIdx) => (
                      <div key={dayIdx} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 font-semibold">
                          📅 {day.name} ({day.exercises?.length || 0} exercícios)
                        </div>
                        <div className="p-3">
                          {day.exercises && day.exercises.length > 0 ? (
                            <div className="space-y-3">
                              {day.exercises.map((exercise, exIdx) => (
                                <div key={exIdx} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{exercise.name}</h4>
                                      <p className="text-xs text-gray-500">Grupo: {exercise.group}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">{exercise.sets} séries</p>
                                      <p className="text-sm">{exercise.reps} repetições</p>
                                    </div>
                                  </div>
                                  {exercise.maxWeightEver > 0 && (
                                    <div className="mt-2 text-xs text-blue-600">
                                      🏆 Máximo já usado: {exercise.maxWeightEver} kg
                                    </div>
                                  )}
                                  {exercise.lastWeights && exercise.lastWeights.length > 0 && (
                                    <div className="mt-1 text-xs text-gray-500">
                                      📊 Últimos: {exercise.lastWeights.slice(-3).map(w => `${w}kg`).join(' → ')}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm text-center py-4">Nenhum exercício cadastrado</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {plan.sessions && plan.sessions.length > 0 && expandedPlans[plan.id] && (
                  <div className="px-4 pb-4">
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer">📊 Histórico de treinos realizados ({plan.sessions.length})</summary>
                      <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                        {plan.sessions.slice().reverse().map(session => (
                          <div key={session.id} className="bg-gray-50 rounded p-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">Dia {session.dayIndex + 1}</span>
                              <span className="text-gray-500">{new Date(session.startTime).toLocaleDateString('pt-BR')}</span>
                            </div>
                            {session.endTime && (
                              <div className="text-xs text-gray-500">
                                ⏱️ Duração: {Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000)} minutos
                              </div>
                            )}
                            {session.seriesData && Object.keys(session.seriesData).length > 0 && (
                              <div className="text-xs text-gray-500">
                                📝 Séries registradas: {Object.keys(session.seriesData).length}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Criar Novo Plano de Treino</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 text-2xl hover:text-gray-700">
                ×
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Plano</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: ABC 2x, Push/Pull/Legs, Full Body"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Dias de Treino</label>
                  <button onClick={addDay} className="text-blue-600 text-sm hover:text-blue-700">
                    + Adicionar Dia
                  </button>
                </div>
                
                {editingDays.length === 0 && (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    <p>Nenhum dia de treino adicionado</p>
                    <p className="text-xs mt-1">Clique em "+ Adicionar Dia" para começar</p>
                  </div>
                )}
                
                {editingDays.map((day, dayIdx) => (
                  <div key={dayIdx} className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <input
                        type="text"
                        value={day.name}
                        onChange={(e) => {
                          const newDays = [...editingDays]
                          newDays[dayIdx].name = e.target.value
                          setEditingDays(newDays)
                        }}
                        className="border rounded-lg px-3 py-1 text-sm font-medium flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome do dia"
                      />
                      <button onClick={() => removeDay(dayIdx)} className="text-red-500 text-sm hover:text-red-700">
                        Remover Dia
                      </button>
                    </div>
                    
                    {day.exercises.map((exercise, exIdx) => (
                      <div key={exIdx} className="bg-white rounded-lg p-3 mb-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <select
                            value={exercise.group}
                            onChange={(e) => updateExercise(dayIdx, exIdx, 'group', e.target.value)}
                            className="flex-1 min-w-[120px] border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Object.keys(exercisesByGroup).map(group => (
                              <option key={group} value={group}>{group}</option>
                            ))}
                          </select>
                          
                          <select
                            value={exercise.name}
                            onChange={(e) => updateExercise(dayIdx, exIdx, 'name', e.target.value)}
                            className="flex-2 min-w-[150px] border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {exercisesByGroup[exercise.group].map(ex => (
                              <option key={ex} value={ex}>{ex}</option>
                            ))}
                            <option value="custom">+ Personalizado</option>
                          </select>
                          
                          <button onClick={() => removeExercise(dayIdx, exIdx)} className="text-red-500 text-sm hover:text-red-700">
                            ✖️
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(dayIdx, exIdx, 'sets', e.target.value)}
                            className="w-24 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Séries"
                          />
                          <input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                            className="w-24 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Reps"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addExercise(dayIdx)}
                      className="text-blue-600 text-sm mt-2 hover:text-blue-700"
                    >
                      + Adicionar Exercício
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={saveWorkoutPlan}
                disabled={!planName || editingDays.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Salvar e Ativar Plano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
