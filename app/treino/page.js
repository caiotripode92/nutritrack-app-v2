'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const exercisesByGroup = {
  "Peito": ["Supino reto", "Supino inclinado", "Supino declinado", "Crucifixo", "Crossover", "Peck deck", "Flexão de braços"],
  "Costas": ["Puxada frontal", "Remada curvada", "Remada sentada", "Remada unilateral", "Levantamento terra", "Pulley frente", "Barra fixa"],
  "Pernas": ["Agachamento livre", "Leg press", "Cadeira extensora", "Cadeira flexora", "Stiff", "Panturrilha em pé", "Panturrilha sentado", "Hack machine", "Agachamento sumô"],
  "Ombros": ["Desenvolvimento", "Elevação lateral", "Elevação frontal", "Crucifixo inverso", "Encolhimento", "Desenvolvimento militar"],
  "Bíceps": ["Rosca direta", "Rosca alternada", "Rosca concentrada", "Rosca scott", "Rosca martelo", "Rosca 21"],
  "Tríceps": ["Tríceps pulley", "Tríceps testa", "Tríceps coice", "Mergulho", "Tríceps francês", "Tríceps corda"],
  "Abdômen": ["Abdominal crunch", "Prancha", "Elevação de pernas", "Abdominal infra", "Russian twist", "Abdominal oblíquo"],
  "Glúteos": ["Elevação pélvica", "Agachamento sumô", "Cadeira abdutora", "Glúteo no cabo", "Passada", "Cadeira flexora"],
  "Trapézio": ["Encolhimento com halteres", "Remada alta", "Encolhimento na máquina"],
  "Antebraço": ["Rosca punho", "Rosca inversa", "Grip"]
}

export default function TreinoPage() {
  const router = useRouter()
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [currentWorkoutId, setCurrentWorkoutId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingDays, setEditingDays] = useState([])
  const [planName, setPlanName] = useState('')
  const [trainingSession, setTrainingSession] = useState(null)
  const [selectedDay, setSelectedDay] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/workout')
      if (res.ok) {
        const data = await res.json()
        setWorkoutPlans(data.plans || [])
        setCurrentWorkoutId(data.currentId)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const activateWorkout = async (id) => {
    const res = await fetch('/api/workout/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      setCurrentWorkoutId(id)
      fetchData()
    }
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
    const planData = {
      name: planName,
      days: editingDays
    }
    
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
    }
  }

  const startTraining = async () => {
    const activePlan = workoutPlans.find(p => p.id === currentWorkoutId)
    if (!activePlan) return
    
    const res = await fetch('/api/workout/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workoutPlanId: currentWorkoutId, dayIndex: selectedDay })
    })
    
    if (res.ok) {
      const session = await res.json()
      setTrainingSession(session)
    }
  }

  const updateSeriesWeight = async (exerciseIdx, setIdx, weight) => {
    if (!trainingSession) return
    
    const res = await fetch('/api/workout/session/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: trainingSession.id,
        exerciseIdx,
        setIdx,
        weight
      })
    })
    
    if (res.ok) {
      const updated = await res.json()
      setTrainingSession(updated)
    }
  }

  const finishTraining = async () => {
    if (!trainingSession) return
    
    const res = await fetch('/api/workout/session/finish', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: trainingSession.id })
    })
    
    if (res.ok) {
      setTrainingSession(null)
      fetchData()
    }
  }

  const activePlan = workoutPlans.find(p => p.id === currentWorkoutId)

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Planos de Treino</h1>
        <button
          onClick={() => {
            setEditingDays([])
            setPlanName('')
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Novo Plano
        </button>
      </div>

      {activePlan ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Plano Ativo: {activePlan.name}</h2>
          
          {!trainingSession ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Selecione o dia</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {activePlan.days.map((day, idx) => (
                    <option key={idx} value={idx}>{day.name}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={startTraining}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                ▶️ Iniciar Treino
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-center font-semibold">
                  Treino em andamento: {activePlan.days[trainingSession.dayIndex]?.name}
                </p>
                <p className="text-center text-sm text-gray-600">
                  Iniciado em: {new Date(trainingSession.startTime).toLocaleTimeString()}
                </p>
              </div>
              
              {activePlan.days[trainingSession.dayIndex]?.exercises.map((exercise, exIdx) => (
                <div key={exIdx} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Grupo: {exercise.group} | Séries: {exercise.sets} | Reps: {exercise.reps}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    💪 Máximo já usado: {exercise.maxWeightEver || 0} kg
                    {exercise.lastWeights?.length > 0 && ` | Último: ${exercise.lastWeights[exercise.lastWeights.length - 1]} kg`}
                  </p>
                  
                  {[...Array(exercise.sets)].map((_, setIdx) => {
                    const seriesKey = `${exIdx}_${setIdx}`
                    const seriesData = trainingSession.seriesData?.[seriesKey] || {}
                    return (
                      <div key={setIdx} className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium w-16">Série {setIdx + 1}:</span>
                        <input
                          type="number"
                          placeholder="Peso (kg)"
                          value={seriesData.weight || ''}
                          onChange={(e) => updateSeriesWeight(exIdx, setIdx, parseFloat(e.target.value))}
                          className="flex-1 border rounded-lg px-3 py-2 text-sm"
                        />
                        <span className="text-sm">kg</span>
                      </div>
                    )
                  })}
                </div>
              ))}
              
              <button
                onClick={finishTraining}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                ✅ Finalizar Treino
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Nenhum plano de treino ativo.</p>
          <p className="text-yellow-600 text-sm mt-2">Crie um novo plano clicando no botão acima.</p>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Seus Planos</h2>
        {workoutPlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.days.length} dias de treino</p>
                <p className="text-sm text-gray-500">
                  Criado em: {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {currentWorkoutId === plan.id ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    ✅ ATIVO
                  </span>
                ) : (
                  <button
                    onClick={() => activateWorkout(plan.id)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200"
                  >
                    Ativar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Criar Plano de Treino</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 text-2xl">
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
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ex: ABC 2x, Push/Pull/Legs, etc."
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Dias de Treino</label>
                  <button onClick={addDay} className="text-blue-600 text-sm">
                    + Adicionar Dia
                  </button>
                </div>
                
                {editingDays.map((day, dayIdx) => (
                  <div key={dayIdx} className="bg-gray-50 rounded-lg p-4 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <input
                        type="text"
                        value={day.name}
                        onChange={(e) => {
                          const newDays = [...editingDays]
                          newDays[dayIdx].name = e.target.value
                          setEditingDays(newDays)
                        }}
                        className="border rounded-lg px-2 py-1 text-sm flex-1 mr-2"
                      />
                      <button onClick={() => removeDay(dayIdx)} className="text-red-500 text-sm">
                        Remover Dia
                      </button>
                    </div>
                    
                    {day.exercises.map((exercise, exIdx) => (
                      <div key={exIdx} className="bg-white rounded p-3 mb-2">
                        <div className="flex gap-2 mb-2">
                          <select
                            value={exercise.group}
                            onChange={(e) => updateExercise(dayIdx, exIdx, 'group', e.target.value)}
                            className="flex-1 border rounded-lg px-2 py-1 text-sm"
                          >
                            {Object.keys(exercisesByGroup).map(group => (
                              <option key={group} value={group}>{group}</option>
                            ))}
                          </select>
                          
                          <select
                            value={exercise.name}
                            onChange={(e) => updateExercise(dayIdx, exIdx, 'name', e.target.value)}
                            className="flex-2 border rounded-lg px-2 py-1 text-sm"
                          >
                            {exercisesByGroup[exercise.group].map(ex => (
                              <option key={ex} value={ex}>{ex}</option>
                            ))}
                            <option value="custom">+ Personalizado</option>
                          </select>
                          
                          <button onClick={() => removeExercise(dayIdx, exIdx)} className="text-red-500 text-sm">
                            ✖️
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(dayIdx, exIdx, 'sets', e.target.value)}
                            className="w-20 border rounded-lg px-2 py-1 text-sm"
                            placeholder="Séries"
                          />
                          <input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                            className="w-20 border rounded-lg px-2 py-1 text-sm"
                            placeholder="Reps"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addExercise(dayIdx)}
                      className="text-blue-600 text-sm mt-2"
                    >
                      + Adicionar Exercício
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={saveWorkoutPlan}
                disabled={!planName || editingDays.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Salvar e Ativar Plano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}