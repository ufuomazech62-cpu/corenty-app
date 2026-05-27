import React from 'react'
import { Home } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-ink px-6 lg:px-12 py-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[14px] bg-cream/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-cream" strokeWidth={2} />
              </div>
              <span className="text-xl font-display font-bold text-cream tracking-[-0.03em]">
                CoRenty
              </span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed text-cream/70">
              The simplest way to find verified student roommates near your campus.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
            <div>
              <p className="text-xs font-semibold text-cream/40 uppercase tracking-wider mb-4">Product</p>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-cream/80 hover:text-cream transition-colors">How it works</a>
                <a href="#" className="block text-sm text-cream/80 hover:text-cream transition-colors">Pricing</a>
                <a href="#" className="block text-sm text-cream/80 hover:text-cream transition-colors">Safety</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-cream/40 uppercase tracking-wider mb-4">Company</p>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-cream/80 hover:text-cream transition-colors">About</a>
                <a href="#" className="block text-sm text-cream/80 hover:text-cream transition-colors">Blog</a>
                <a href="#" className="block text-sm text-cream/80 hover:text-cream transition-colors">Careers</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-cream/40 uppercase tracking-wider mb-4">Legal</p>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-cream/80 hover:text-cream transition-colors">Privacy</a>
                <a href="#" className="block text-sm text-cream/80 hover:text-cream transition-colors">Terms</a>
                <a href="#" className="block text-sm text-cream/80 hover:text-cream transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream/50">
            © 2026 CoRenty. Built for students, by students.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-cream/50 hover:text-cream transition-colors">Twitter</a>
            <a href="#" className="text-xs text-cream/50 hover:text-cream transition-colors">Instagram</a>
            <a href="#" className="text-xs text-cream/50 hover:text-cream transition-colors">TikTok</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
