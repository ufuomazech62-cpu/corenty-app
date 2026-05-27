import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Home } from 'lucide-react'

interface HeaderProps {
  onNavigate: (page: string) => void
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass border-b border-border' : ''
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-[72px]">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-[14px] bg-ink flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Home className="w-5 h-5 text-cream" strokeWidth={2} />
            </div>
            <span className="text-xl font-display font-bold tracking-[-0.03em]">
              CoRenty
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('signin')}
              className="px-6 py-2.5 bg-ink text-cream rounded-full text-sm font-medium hover:bg-ink/90 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
