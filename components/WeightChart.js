'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function WeightChart({ weightHistory }) {
  const history = Array.isArray(weightHistory) ? weightHistory : []
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))
  
  const data = {
    labels: sorted.map(w => w.date.slice(5)),
    datasets: [
      {
        label: 'Peso (kg)',
        data: sorted.map(w => w.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }
  
  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  )
}