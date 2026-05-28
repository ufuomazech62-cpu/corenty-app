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

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('corenty_onboarding_complete')
    if (hasCompletedOnboarding === 'true') {
      const savedUser = localStorage.getItem('corenty_user')
      if (savedUser) setUser(JSON.parse(savedUser))
    }
  }, [])

  // Lock body scroll for app screens, allow scroll for landing/signin
  useEffect(() => {
    const locked = page === 'onboarding' || page === 'dashboard'
    if (locked) {
      document.body.classList.add('app-locked')
    } else {
      document.body.classList.remove('app-locked')
    }
    return () => document.body.classList.remove('app-locked')
  }, [page])

  const navigate = (p: string, data?: any) => {
    window.scrollTo({ top: 0, behavior: 'instant' })

    if (p === 'signin') {
      const hasCompletedOnboarding = localStorage.getItem('corenty_onboarding_complete')
      if (hasCompletedOnboarding === 'true') {
        const savedUser = localStorage.getItem('corenty_user')
        if (savedUser) setUser(JSON.parse(savedUser))
        setPage('dashboard')
        return
      }
    }

    if (p === 'dashboard' && data) {
      localStorage.setItem('corenty_onboarding_complete', 'true')
      localStorage.setItem('corenty_user', JSON.stringify(data))
      setUser(data)
    }

    if (data && p !== 'dashboard') {
      setUser((prev: any) => ({ ...prev, ...data }))
    }

    setPage(p)
  }

  return (
    <div className={`min-h-screen bg-cream font-body text-ink antialiased ${page === 'onboarding' || page === 'dashboard' ? 'h-[100dvh] overflow-hidden' : ''}`}>
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
// Force redeployment Thu May 28 20:37:40 WEDT 2026
