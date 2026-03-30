import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NutriTrack - Dieta e Treino',
  description: 'Controle sua dieta e treino personalizado',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  )
}