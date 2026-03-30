'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DietaPage() {
  const router = useRouter()
  const [dietPlans, setDietPlans] = useState([])
  const [currentDietId, setCurrentDietId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingMeals, setEditingMeals] = useState([])
  const [dietGoal, setDietGoal] = useState('0')
  const [planName, setPlanName] = useState('')
  const [tmb, setTmb] = useState(0)
  const [expandedPlans, setExpandedPlans] = useState({})

  const tacoFoods = {
    "Arroz branco cozido": { kcal: 128, protein: 2.5, carbs: 28.1 },
    "Feijão carioca cozido": { kcal: 76, protein: 4.8, carbs: 13.6 },
    "Frango grelhado": { kcal: 165, protein: 31, carbs: 0 },
    "Carne bovina grelhada": { kcal: 250, protein: 26, carbs: 0 },
    "Ovo cozido": { kcal: 146, protein: 13, carbs: 1.1 },
    "Batata doce cozida": { kcal: 77, protein: 1.4, carbs: 18.4 },
    "Banana": { kcal: 92, protein: 1.2, carbs: 23.8 },
    "Maçã": { kcal: 56, protein: 0.3, carbs: 14.3 },
    "Leite integral": { kcal: 60, protein: 3.1, carbs: 4.7 },
    "Iogurte natural": { kcal: 61, protein: 4.1, carbs: 4.7 },
    "Pão francês": { kcal: 300, protein: 8, carbs: 58 },
    "Queijo mussarela": { kcal: 280, protein: 22, carbs: 2.5 },
    "Peito de peru": { kcal: 108, protein: 22, carbs: 2.5 },
    "Atum em conserva": { kcal: 118, protein: 26, carbs: 0 },
    "Aveia em flocos": { kcal: 394, protein: 13.5, carbs: 66 },
    "Macarrão cozido": { kcal: 131, protein: 4, carbs: 28 }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, dietsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/diet')
      ])
      
      if (profileRes.ok) {
        const profile = await profileRes.json()
        calculateTmb(profile)
      }
      
      if (dietsRes.ok) {
        const diets = await dietsRes.json()
        setDietPlans(diets.plans || [])
        setCurrentDietId(diets.currentId)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTmb = (profile) => {
    if (!profile.height || !profile.weight || !profile.age) return
    let tmbCalc = profile.sex === 'M' 
      ? (10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5)
      : (10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161)
    tmbCalc = Math.round(tmbCalc * (profile.activityLevel || 1.55))
    setTmb(tmbCalc)
  }

  const activateDiet = async (id) => {
    const res = await fetch('/api/diet/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      setCurrentDietId(id)
      fetchData()
    }
  }

  const toggleExpandPlan = (planId) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }))
  }

  const formatMacros = (value) => {
    return Math.round(value * 10) / 10
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Planos Alimentares</h1>
        <button
          onClick={() => {
            setEditingMeals([])
            setPlanName('')
            setDietGoal('0')
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Novo Plano
        </button>
      </div>

      <div className="grid gap-6">
        {dietPlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Cabeçalho do plano */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    {currentDietId === plan.id && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        ✅ ATIVO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Meta: {plan.goalDelta > 0 ? '+' : ''}{plan.goalDelta} kcal
                  </p>
                  <p className="text-xs text-gray-500">
                    Criado em: {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {currentDietId !== plan.id && (
                    <button
                      onClick={() => activateDiet(plan.id)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200"
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
              
              {/* Resumo rápido */}
              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Calorias</p>
                  <p className="font-bold text-blue-600">{Math.round(plan.totalKcal || 0)} kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Proteínas</p>
                  <p className="font-bold text-green-600">{formatMacros(plan.totalProtein || 0)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Carboidratos</p>
                  <p className="font-bold text-orange-600">{formatMacros(plan.totalCarbs || 0)}g</p>
                </div>
              </div>
            </div>
            
            {/* Detalhes expandidos */}
            {expandedPlans[plan.id] && plan.meals && plan.meals.length > 0 && (
              <div className="p-4 space-y-4">
                {plan.meals.map((meal, mealIdx) => (
                  <div key={mealIdx} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-semibold">
                      🍽️ {meal.name}
                    </div>
                    <div className="p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Alimento</th>
                            <th className="text-right py-2">Quantidade</th>
                            <th className="text-right py-2">Kcal</th>
                            <th className="text-right py-2">Prot</th>
                            <th className="text-right py-2">Carb</th>
                          </tr>
                        </thead>
                        <tbody>
                          {meal.foods.map((food, foodIdx) => (
                            <tr key={foodIdx} className="border-b last:border-0">
                              <td className="py-2">{food.name}</td>
                              <td className="text-right py-2">{food.grams || 100}g</td>
                              <td className="text-right py-2">{Math.round(food.kcal)}</td>
                              <td className="text-right py-2">{formatMacros(food.protein)}g</td>
                              <td className="text-right py-2">{formatMacros(food.carbs)}g</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td className="py-2 font-semibold">Total da refeição</td>
                            <td className="text-right py-2"></td>
                            <td className="text-right py-2 font-semibold">
                              {Math.round(meal.foods.reduce((sum, f) => sum + (f.kcal || 0), 0))}
                            </td>
                            <td className="text-right py-2 font-semibold">
                              {formatMacros(meal.foods.reduce((sum, f) => sum + (f.protein || 0), 0))}g
                            </td>
                            <td className="text-right py-2 font-semibold">
                              {formatMacros(meal.foods.reduce((sum, f) => sum + (f.carbs || 0), 0))}g
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
                
                {/* Resumo total do plano */}
                <div className="bg-blue-50 rounded-lg p-4 mt-2">
                  <h4 className="font-semibold mb-2">📊 Resumo Total do Plano</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Calorias</p>
                      <p className="text-xl font-bold text-blue-600">{Math.round(plan.totalKcal || 0)} kcal</p>
                      <p className="text-xs text-gray-500">Meta: {tmb + plan.goalDelta} kcal</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Proteínas</p>
                      <p className="text-xl font-bold text-green-600">{formatMacros(plan.totalProtein || 0)}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Carboidratos</p>
                      <p className="text-xl font-bold text-orange-600">{formatMacros(plan.totalCarbs || 0)}g</p>
                    </div>
                  </div>
                  {plan.totalKcal > tmb + plan.goalDelta && (
                    <p className="text-red-600 text-sm text-center mt-2">
                      ⚠️ Plano está {Math.round(plan.totalKcal - (tmb + plan.goalDelta))} kcal acima da meta
                    </p>
                  )}
                  {plan.totalKcal < tmb + plan.goalDelta && (
                    <p className="text-orange-600 text-sm text-center mt-2">
                      ⚠️ Plano está {Math.round((tmb + plan.goalDelta) - plan.totalKcal)} kcal abaixo da meta
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {dietPlans.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800">Nenhum plano alimentar criado ainda.</p>
          <p className="text-yellow-600 text-sm mt-2">Clique em "+ Novo Plano" para começar!</p>
        </div>
      )}

      {/* Modal de criação */}
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Criar Novo Plano Alimentar</h2>
        <button onClick={() => setShowModal(false)} className="text-gray-500 text-2xl hover:text-gray-700">
          ×
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Nome do plano */}
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Plano</label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Cutting, Bulking, Hipercalórico"
          />
        </div>
        
        {/* Objetivo */}
        <div>
          <label className="block text-sm font-medium mb-1">Objetivo</label>
          <select
            value={dietGoal}
            onChange={(e) => setDietGoal(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="-1000">Perder peso rápido (TMB - 1000 kcal)</option>
            <option value="-500">Perder peso (TMB - 500 kcal)</option>
            <option value="0">Manter peso (TMB)</option>
            <option value="500">Ganhar peso (TMB + 500 kcal)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Sua TMB atual: <strong>{tmb} kcal</strong> | Meta: <strong className="text-blue-600">{tmb + parseInt(dietGoal)} kcal</strong>
          </p>
        </div>
        
        {/* Refeições */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium">Refeições</label>
            <button
              onClick={() => {
                setEditingMeals([...editingMeals, { 
                  name: `Refeição ${editingMeals.length + 1}`, 
                  foods: [] 
                }])
              }}
              className="text-blue-600 text-sm hover:text-blue-700"
            >
              + Adicionar Refeição
            </button>
          </div>
          
          {editingMeals.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <p>Nenhuma refeição adicionada</p>
              <p className="text-xs mt-1">Clique em "+ Adicionar Refeição" para começar</p>
            </div>
          )}
          
          {editingMeals.map((meal, mealIdx) => (
            <div key={mealIdx} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  value={meal.name}
                  onChange={(e) => {
                    const newMeals = [...editingMeals]
                    newMeals[mealIdx].name = e.target.value
                    setEditingMeals(newMeals)
                  }}
                  className="border rounded-lg px-3 py-1 text-sm font-medium flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da refeição"
                />
                <button
                  onClick={() => {
                    const newMeals = [...editingMeals]
                    newMeals.splice(mealIdx, 1)
                    setEditingMeals(newMeals)
                  }}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remover
                </button>
              </div>
              
              {/* Alimentos da refeição */}
              {meal.foods.map((food, foodIdx) => (
                <div key={foodIdx} className="bg-white rounded-lg p-3 mb-2 flex flex-wrap gap-2 items-center">
                  <select
                    value={food.name}
                    onChange={(e) => {
                      const newMeals = [...editingMeals]
                      if (e.target.value === 'custom') {
                        const customName = prompt('Nome do alimento personalizado:')
                        if (customName) {
                          const kcal = parseFloat(prompt('Calorias por 100g:', '0'))
                          const protein = parseFloat(prompt('Proteínas por 100g:', '0'))
                          const carbs = parseFloat(prompt('Carboidratos por 100g:', '0'))
                          newMeals[mealIdx].foods[foodIdx] = {
                            name: customName,
                            kcal: kcal,
                            protein: protein,
                            carbs: carbs,
                            grams: 100,
                            _baseKcal: kcal,
                            _baseProtein: protein,
                            _baseCarbs: carbs
                          }
                        }
                      } else {
                        const base = tacoFoods[e.target.value]
                        const grams = newMeals[mealIdx].foods[foodIdx].grams || 100
                        const ratio = grams / 100
                        newMeals[mealIdx].foods[foodIdx] = {
                          name: e.target.value,
                          kcal: Math.round(base.kcal * ratio),
                          protein: Math.round(base.protein * ratio * 10) / 10,
                          carbs: Math.round(base.carbs * ratio * 10) / 10,
                          grams: grams,
                          _baseKcal: base.kcal,
                          _baseProtein: base.protein,
                          _baseCarbs: base.carbs
                        }
                      }
                      setEditingMeals(newMeals)
                    }}
                    className="flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(tacoFoods).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                    <option value="custom">+ Personalizado</option>
                  </select>
                  
                  <input
                    type="number"
                    value={food.grams}
                    onChange={(e) => {
                      const newMeals = [...editingMeals]
                      const grams = parseFloat(e.target.value)
                      if (!isNaN(grams) && grams > 0) {
                        const ratio = grams / 100
                        newMeals[mealIdx].foods[foodIdx].kcal = Math.round((newMeals[mealIdx].foods[foodIdx]._baseKcal || 0) * ratio)
                        newMeals[mealIdx].foods[foodIdx].protein = Math.round((newMeals[mealIdx].foods[foodIdx]._baseProtein || 0) * ratio * 10) / 10
                        newMeals[mealIdx].foods[foodIdx].carbs = Math.round((newMeals[mealIdx].foods[foodIdx]._baseCarbs || 0) * ratio * 10) / 10
                        newMeals[mealIdx].foods[foodIdx].grams = grams
                      }
                      setEditingMeals(newMeals)
                    }}
                    className="w-24 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="g"
                  />
                  
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                    {Math.round(food.kcal)} kcal
                  </span>
                  
                  <button
                    onClick={() => {
                      const newMeals = [...editingMeals]
                      newMeals[mealIdx].foods.splice(foodIdx, 1)
                      setEditingMeals(newMeals)
                    }}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    ✖️
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newMeals = [...editingMeals]
                  const firstFood = Object.keys(tacoFoods)[0]
                  const base = tacoFoods[firstFood]
                  newMeals[mealIdx].foods.push({
                    name: firstFood,
                    kcal: base.kcal,
                    protein: base.protein,
                    carbs: base.carbs,
                    grams: 100,
                    _baseKcal: base.kcal,
                    _baseProtein: base.protein,
                    _baseCarbs: base.carbs
                  })
                  setEditingMeals(newMeals)
                }}
                className="text-blue-600 text-sm mt-2 hover:text-blue-700"
              >
                + Adicionar Alimento
              </button>
            </div>
          ))}
        </div>
        
        {/* Resumo do plano */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">📊 Resumo do Plano</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Calorias</p>
              <p className="text-xl font-bold text-blue-600">
                {Math.round(editingMeals.reduce((total, meal) => 
                  total + meal.foods.reduce((sum, food) => sum + (food.kcal || 0), 0), 0))} kcal
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Proteínas</p>
              <p className="text-xl font-bold text-green-600">
                {Math.round(editingMeals.reduce((total, meal) => 
                  total + meal.foods.reduce((sum, food) => sum + (food.protein || 0), 0), 0))}g
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Carboidratos</p>
              <p className="text-xl font-bold text-orange-600">
                {Math.round(editingMeals.reduce((total, meal) => 
                  total + meal.foods.reduce((sum, food) => sum + (food.carbs || 0), 0), 0))}g
              </p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm">
              Meta: <strong className="text-blue-600">{tmb + parseInt(dietGoal)} kcal</strong>
              {editingMeals.reduce((total, meal) => 
                total + meal.foods.reduce((sum, food) => sum + (food.kcal || 0), 0), 0) > tmb + parseInt(dietGoal) && (
                <span className="text-red-600 ml-2">⚠️ Acima da meta</span>
              )}
              {editingMeals.reduce((total, meal) => 
                total + meal.foods.reduce((sum, food) => sum + (food.kcal || 0), 0), 0) < tmb + parseInt(dietGoal) && (
                <span className="text-orange-600 ml-2">⚠️ Abaixo da meta</span>
              )}
            </p>
          </div>
        </div>
        
        {/* Botão salvar */}
        <button
          onClick={async () => {
            if (!planName) {
              alert('Por favor, dê um nome ao plano')
              return
            }
            if (editingMeals.length === 0) {
              alert('Adicione pelo menos uma refeição')
              return
            }
            
            const totalKcal = editingMeals.reduce((total, meal) => 
              total + meal.foods.reduce((sum, food) => sum + (food.kcal || 0), 0), 0)
            const totalProtein = editingMeals.reduce((total, meal) => 
              total + meal.foods.reduce((sum, food) => sum + (food.protein || 0), 0), 0)
            const totalCarbs = editingMeals.reduce((total, meal) => 
              total + meal.foods.reduce((sum, food) => sum + (food.carbs || 0), 0), 0)
            
            const res = await fetch('/api/diet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: planName,
                goalDelta: parseInt(dietGoal),
                meals: editingMeals,
                totalKcal,
                totalProtein,
                totalCarbs
              })
            })
            
            if (res.ok) {
              setShowModal(false)
              setEditingMeals([])
              setPlanName('')
              fetchData()
            } else {
              const error = await res.json()
              alert('Erro ao salvar: ' + (error.error || 'Tente novamente'))
            }
          }}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
        >
          💾 Salvar e Ativar Plano
        </button>
      </div>
    </div>
  </div>
)}
