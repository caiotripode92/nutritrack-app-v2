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

  const addMeal = () => {
    setEditingMeals([...editingMeals, { name: `Refeição ${editingMeals.length + 1}`, foods: [] }])
  }

  const addFoodToMeal = (mealIdx) => {
    const firstFood = Object.keys(tacoFoods)[0]
    const base = tacoFoods[firstFood]
    const newMeals = [...editingMeals]
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
  }

  const removeFood = (mealIdx, foodIdx) => {
    const newMeals = [...editingMeals]
    newMeals[mealIdx].foods.splice(foodIdx, 1)
    setEditingMeals(newMeals)
  }

  const removeMeal = (mealIdx) => {
    const newMeals = [...editingMeals]
    newMeals.splice(mealIdx, 1)
    setEditingMeals(newMeals)
  }

  const updateFood = (mealIdx, foodIdx, field, value) => {
    const newMeals = [...editingMeals]
    if (field === 'name' && value !== 'custom') {
      const base = tacoFoods[value]
      const grams = newMeals[mealIdx].foods[foodIdx].grams || 100
      const ratio = grams / 100
      newMeals[mealIdx].foods[foodIdx] = {
        name: value,
        kcal: Math.round(base.kcal * ratio),
        protein: Math.round(base.protein * ratio * 10) / 10,
        carbs: Math.round(base.carbs * ratio * 10) / 10,
        grams: grams,
        _baseKcal: base.kcal,
        _baseProtein: base.protein,
        _baseCarbs: base.carbs
      }
    } else if (field === 'grams') {
      const food = newMeals[mealIdx].foods[foodIdx]
      const ratio = value / 100
      food.kcal = Math.round((food._baseKcal || 0) * ratio)
      food.protein = Math.round((food._baseProtein || 0) * ratio * 10) / 10
      food.carbs = Math.round((food._baseCarbs || 0) * ratio * 10) / 10
      food.grams = value
    } else if (field === 'custom') {
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
    }
    setEditingMeals(newMeals)
  }

  const getTotalNutrition = () => {
    let totalKcal = 0, totalProt = 0, totalCarbs = 0
    editingMeals.forEach(meal => {
      meal.foods.forEach(food => {
        totalKcal += food.kcal || 0
        totalProt += food.protein || 0
        totalCarbs += food.carbs || 0
      })
    })
    return { totalKcal, totalProt, totalCarbs }
  }

  const saveDietPlan = async () => {
    const { totalKcal } = getTotalNutrition()
    const targetKcal = tmb + parseInt(dietGoal)
    
    const planData = {
      name: planName,
      goalDelta: parseInt(dietGoal),
      meals: editingMeals,
      totalKcal,
      targetKcal
    }
    
    const res = await fetch('/api/diet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData)
    })
    
    if (res.ok) {
      setShowModal(false)
      fetchData()
      setEditingMeals([])
      setPlanName('')
    }
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  const { totalKcal, totalProt, totalCarbs } = getTotalNutrition()
  const targetKcal = tmb + parseInt(dietGoal)

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

      <div className="grid gap-4">
        {dietPlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-sm text-gray-600">
                  Meta: {plan.goalDelta > 0 ? '+' : ''}{plan.goalDelta} kcal
                </p>
                <p className="text-sm text-gray-500">
                  Criado em: {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {currentDietId === plan.id ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    ✅ ATIVO
                  </span>
                ) : (
                  <button
                    onClick={() => activateDiet(plan.id)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200"
                  >
                    Ativar
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm">
                <strong>Total:</strong> {Math.round(plan.totalKcal || 0)} kcal | 
                Proteínas: {Math.round(plan.totalProtein || 0)}g | 
                Carboidratos: {Math.round(plan.totalCarbs || 0)}g
              </p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Criar Plano Alimentar</h2>
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
                  placeholder="Ex: Cutting, Bulking, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Objetivo</label>
                <select
                  value={dietGoal}
                  onChange={(e) => setDietGoal(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="-1000">Perder peso rápido (TMB - 1000 kcal)</option>
                  <option value="-500">Perder peso (TMB - 500 kcal)</option>
                  <option value="0">Manter peso (TMB)</option>
                  <option value="500">Ganhar peso (TMB + 500 kcal)</option>
                </select>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Refeições</label>
                  <button onClick={addMeal} className="text-blue-600 text-sm">
                    + Adicionar Refeição
                  </button>
                </div>
                
                {editingMeals.map((meal, mealIdx) => (
                  <div key={mealIdx} className="bg-gray-50 rounded-lg p-4 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => {
                          const newMeals = [...editingMeals]
                          newMeals[mealIdx].name = e.target.value
                          setEditingMeals(newMeals)
                        }}
                        className="border rounded-lg px-2 py-1 text-sm flex-1 mr-2"
                      />
                      <button
                        onClick={() => removeMeal(mealIdx)}
                        className="text-red-500 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                    
                    {meal.foods.map((food, foodIdx) => (
                      <div key={foodIdx} className="bg-white rounded p-3 mb-2 flex flex-wrap gap-2 items-center">
                        <select
                          value={food.name}
                          onChange={(e) => updateFood(mealIdx, foodIdx, 'name', e.target.value)}
                          className="flex-1 border rounded-lg px-2 py-1 text-sm"
                        >
                          {Object.keys(tacoFoods).map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                          <option value="custom">+ Personalizado</option>
                        </select>
                        
                        <input
                          type="number"
                          value={food.grams}
                          onChange={(e) => updateFood(mealIdx, foodIdx, 'grams', parseFloat(e.target.value))}
                          className="w-24 border rounded-lg px-2 py-1 text-sm"
                          placeholder="g"
                        />
                        
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {Math.round(food.kcal)} kcal
                        </span>
                        
                        <button
                          onClick={() => removeFood(mealIdx, foodIdx)}
                          className="text-red-500 text-sm"
                        >
                          ✖️
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addFoodToMeal(mealIdx)}
                      className="text-blue-600 text-sm mt-2"
                    >
                      + Adicionar Alimento
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-semibold">Resumo do Plano:</p>
                <p className="text-sm">Calorias: {Math.round(totalKcal)} / {targetKcal} kcal</p>
                <p className="text-sm">Proteínas: {Math.round(totalProt)}g</p>
                <p className="text-sm">Carboidratos: {Math.round(totalCarbs)}g</p>
                {totalKcal > targetKcal && (
                  <p className="text-red-600 text-sm mt-2">
                    ⚠️ Plano está acima da meta calórica
                  </p>
                )}
                {totalKcal < targetKcal && (
                  <p className="text-orange-600 text-sm mt-2">
                    ⚠️ Plano está abaixo da meta calórica
                  </p>
                )}
              </div>
              
              <button
                onClick={saveDietPlan}
                disabled={!planName || editingMeals.length === 0}
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