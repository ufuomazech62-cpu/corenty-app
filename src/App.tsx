import React, { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Footer from './components/Footer'
import SignIn from './components/SignIn'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import { AnimatePresence } from 'motion/react'

function App() {
  const [page, setPage] = useState('landing')
  const [user, setUser] = useState<any>(null)

  const navigate = (p: string, data?: any) => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (data) setUser(prev => ({ ...prev, ...data }))
    setPage(p)
  }

  return (
    <div className="min-h-screen bg-cream font-body text-ink antialiased">
      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <>
            <Header onNavigate={navigate} />
            <main>
              <Hero onNavigate={navigate} />
              <HowItWorks />
              <Features />
            </main>
            <Footer />
          </>
        )}
        {page === 'signin' && <SignIn onNavigate={navigate} />}
        {page === 'onboarding' && <Onboarding onNavigate={navigate} />}
        {page === 'dashboard' && <Dashboard onNavigate={navigate} user={user} />}
      </AnimatePresence>
    </div>
  )
}

export default App
