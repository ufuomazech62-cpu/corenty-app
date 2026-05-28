import React, { useState, useEffect } from 'react'
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

  // Check if user has completed onboarding before
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('corenty_onboarding_complete')
    if (hasCompletedOnboarding === 'true') {
      // Load saved user data
      const savedUser = localStorage.getItem('corenty_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    }
  }, [])

  const navigate = (p: string, data?: any) => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    
    // If signing in, check if first-time user
    if (p === 'signin') {
      const hasCompletedOnboarding = localStorage.getItem('corenty_onboarding_complete')
      if (hasCompletedOnboarding === 'true') {
        // Returning user — go straight to dashboard
        const savedUser = localStorage.getItem('corenty_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
        setPage('dashboard')
        return
      }
    }
    
    // If completing onboarding, save the status and user data
    if (p === 'dashboard' && data) {
      localStorage.setItem('corenty_onboarding_complete', 'true')
      localStorage.setItem('corenty_user', JSON.stringify(data))
      setUser(data)
    }
    
    if (data && p !== 'dashboard') {
      setUser(prev => ({ ...prev, ...data }))
    }
    
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
              <Features onNavigate={navigate} />
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
