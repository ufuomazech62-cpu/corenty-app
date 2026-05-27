import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Home, ArrowLeft, ArrowRight, Check, Phone, DollarSign, Mail, Instagram, AtSign } from 'lucide-react'

const UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'University of Benin (UNIBEN)',
  'Obafemi Awolowo University (OAU)',
  'Covenant University',
  'Lagos State University (LASU)',
]

const ListerDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', phone: '', university: '', location: '', price: '', title: '', description: '',
    whatsapp: '', email: '', instagram: '', tiktok: '', facebook: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))
  const next = () => setStep(s => Math.min(s + 1, 4))
  const back = () => setStep(s => Math.max(s - 1, 1))

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-cream">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-like flex items-center justify-center mx-auto mb-6 shadow-lg shadow-like/30">
            <Check size={36} className="text-white" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight mb-3 text-ink">Listing published!</h1>
          <p className="text-ink mb-8">Your listing is now live. Students will start seeing it in their swipe feed.</p>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('dashboard')} className="flex-1 py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-all">Start swiping</button>
            <button onClick={() => onNavigate('landing')} className="flex-1 py-4 bg-surface border border-border rounded-2xl font-semibold text-ink hover:bg-cream transition-all">Go home</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="glass border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-ink flex items-center justify-center">
            <Home className="w-4.5 h-4.5 text-cream" strokeWidth={2} />
          </div>
          <span className="text-lg font-display font-bold tracking-[-0.03em] text-ink">CoRenty</span>
        </button>
        <button onClick={() => onNavigate('dashboard')} className="px-5 py-2.5 bg-ink text-cream rounded-full text-sm font-medium hover:bg-ink/90 transition-all hover:scale-105 active:scale-95">Start swiping</button>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex-1 h-1 rounded-full bg-border overflow-hidden">
              <motion.div className="h-full bg-ink rounded-full" initial={{ width: 0 }} animate={{ width: step >= s ? '100%' : '0%' }} transition={{ duration: 0.3 }} />
            </div>
          ))}
        </div>
        <p className="text-xs text-ink font-medium tracking-wide uppercase">Step {step} of 4</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-surface rounded-[28px] p-8 lg:p-10 border border-border">
              <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">Who are you?</h2>
              <p className="text-ink mb-8">Tell students a bit about yourself.</p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Your name</label>
                  <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Sarah E." className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Phone number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink" />
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+234 81 2345 6789" className="w-full pl-12 pr-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                  </div>
                </div>
              </div>
              <button onClick={next} disabled={!form.name || !form.phone} className={`w-full mt-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${form.name && form.phone ? 'bg-ink text-cream hover:bg-ink/90' : 'bg-border text-ink cursor-not-allowed'}`}>
                Continue <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-surface rounded-[28px] p-8 lg:p-10 border border-border">
              <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">Where is it?</h2>
              <p className="text-ink mb-8">Help students find your listing.</p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">University</label>
                  <select value={form.university} onChange={e => update('university', e.target.value)} className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all appearance-none cursor-pointer">
                    <option value="">Select university</option>
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Neighborhood</label>
                  <input type="text" value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Akoka, Yaba" className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Price per year (₦)</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink" />
                    <input type="text" value={form.price} onChange={e => update('price', e.target.value)} placeholder="e.g. 250000" className="w-full pl-12 pr-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={back} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-all flex items-center justify-center gap-2">
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={next} disabled={!form.university || !form.location || !form.price} className={`flex-[2] py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${form.university && form.location && form.price ? 'bg-ink text-cream hover:bg-ink/90' : 'bg-border text-ink cursor-not-allowed'}`}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-surface rounded-[28px] p-8 lg:p-10 border border-border">
              <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">Describe your place</h2>
              <p className="text-ink mb-8">Make your listing stand out.</p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Listing title</label>
                  <input type="text" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Modern Room near UNILAG Gate" className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Tell students about the room, amenities, house rules..." rows={4} className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={back} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-all flex items-center justify-center gap-2">
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={next} disabled={!form.title || !form.description} className={`flex-[2] py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${form.title && form.description ? 'bg-ink text-cream hover:bg-ink/90' : 'bg-border text-ink cursor-not-allowed'}`}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-surface rounded-[28px] p-8 lg:p-10 border border-border">
              <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">How can matches reach you?</h2>
              <p className="text-ink mb-8">Add your contact details. Matched students will see these directly.</p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">WhatsApp</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink" />
                    <input type="tel" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} placeholder="+234 81 2345 6789" className="w-full pl-12 pr-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink" />
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" className="w-full pl-12 pr-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Instagram</label>
                  <div className="relative">
                    <Instagram size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink" />
                    <input type="text" value={form.instagram} onChange={e => update('instagram', e.target.value)} placeholder="@yourhandle" className="w-full pl-12 pr-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">TikTok</label>
                  <div className="relative">
                    <AtSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink" />
                    <input type="text" value={form.tiktok} onChange={e => update('tiktok', e.target.value)} placeholder="@yourhandle" className="w-full pl-12 pr-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Facebook</label>
                  <div className="relative">
                    <AtSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink" />
                    <input type="text" value={form.facebook} onChange={e => update('facebook', e.target.value)} placeholder="Your name or profile link" className="w-full pl-12 pr-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={back} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-all flex items-center justify-center gap-2">
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={() => setSubmitted(true)} className="flex-[2] py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-all flex items-center justify-center gap-2">
                  <Check size={18} /> Publish listing
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ListerDashboard
