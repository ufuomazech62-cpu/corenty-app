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
import { api } from './lib/api'

function App() {
  const [page, setPage] = useState('landing')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const currentUser = await api.getCurrentUser()
      setUser(currentUser)
      
      // Check if user has completed onboarding
      if (currentUser.onboarding_complete) {
        setPage('dashboard')
      } else {
        setPage('onboarding')
      }
    } catch (error) {
      // Not authenticated, check if there's a pending OAuth callback
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      if (code) {
        // Handle OAuth callback
        setPage('auth-callback')
      } else {
        setPage('landing')
      }
    } finally {
      setLoading(false)
    }
  }

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
      // Redirect to Google OAuth
      window.location.href = '/api/auth/google'
      return
    }

    if (p === 'dashboard' && data) {
      setUser(data)
    }

    if (data && p !== 'dashboard') {
      setUser((prev: any) => ({ ...prev, ...data }))
    }

    setPage(p)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-ink text-lg font-display">Loading...</div>
      </div>
    )
  }

  // Handle OAuth callback
  if (page === 'auth-callback') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-ink text-lg font-display">Completing sign in...</div>
      </div>
    )
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
        {page === 'onboarding' && <Onboarding user={user} onNavigate={navigate} onComplete={checkAuth} />}
        {page === 'dashboard' && <Dashboard onNavigate={navigate} user={user} />}
      </AnimatePresence>
    </div>
  )
}

export default App
