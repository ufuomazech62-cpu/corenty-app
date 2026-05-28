import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Home, ArrowLeft, ArrowRight, Check, Upload, Camera, Shield,
  GraduationCap, Plus, X, Mail, Phone
} from 'lucide-react'
import { TikTokIcon, InstagramIcon, FacebookIcon, XIcon, WhatsAppIcon } from './BrandIcons'

const NIGERIAN_INSTITUTIONS = [
  'University of Lagos (UNILAG)','University of Ibadan (UI)','University of Benin (UNIBEN)',
  'Obafemi Awolowo University (OAU)','University of Nigeria, Nsukka (UNN)',
  'Ahmadu Bello University (ABU)','Covenant University','Lagos State University (LASU)',
  'Babcock University','Federal University of Technology, Akure (FUTA)',
  'University of Ilorin (UNILORIN)','University of Port Harcourt (UNIPORT)',
  'Yaba College of Technology (YabaTech)','Lagos State Polytechnic (LASPOTECH)',
  'Federal Polytechnic, Offa','Federal Polytechnic, Nekede','Auchi Polytechnic',
  'Alvan Ikoku College of Education','Federal College of Education, Abeokuta',
  'Adeniran Ogunsanya College of Education',
]

interface OnboardingProps { onNavigate: (page: string, data?: any) => void }

const Onboarding: React.FC<OnboardingProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'have' | 'need' | null>(null)
  const [institution, setInstitution] = useState('')
  const [instInput, setInstInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [matricNumber, setMatricNumber] = useState('')
  const [verificationMethod, setVerificationMethod] = useState<'matric' | 'id' | null>(null)
  const [idPhoto, setIdPhoto] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [profileImages, setProfileImages] = useState<string[]>([])
  const [apartmentPhotos, setApartmentPhotos] = useState<string[]>([])
  const [apartmentTitle, setApartmentTitle] = useState('')
  const [apartmentPrice, setApartmentPrice] = useState('')
  const [apartmentLocation, setApartmentLocation] = useState('')
  const [apartmentDesc, setApartmentDesc] = useState('')
  const [budget, setBudget] = useState('')
  const [preferredArea, setPreferredArea] = useState('')
  const [bio, setBio] = useState('')
  const [socials, setSocials] = useState({ tiktok: '', instagram: '', facebook: '', whatsapp: '', email: '', twitter: '' })
  const [distanceToCampus, setDistanceToCampus] = useState(2)

  const totalSteps = mode === 'have' ? 6 : 5
  const next = () => setStep(s => Math.min(s + 1, totalSteps))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const handlePhotoUpload = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) setter(URL.createObjectURL(file))
  }

  const handleMultiple = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) Array.from(e.target.files).forEach(f => { if (f.type.startsWith('image/')) setter(prev => [...prev, URL.createObjectURL(f)]) })
  }

  const filteredSuggestions = instInput.length > 0 ? NIGERIAN_INSTITUTIONS.filter(i => i.toLowerCase().includes(instInput.toLowerCase())).slice(0, 4) : []

  const handleFinish = () => {
    onNavigate('dashboard', { mode, institution, matricNumber, profilePhoto, profileImages, apartmentPhotos, apartmentTitle, apartmentPrice, apartmentLocation, apartmentDesc, budget, preferredArea, bio, socials, distanceToCampus, name: 'You' })
  }

  const instValid = institution && verificationMethod && ((verificationMethod === 'matric' && matricNumber) || (verificationMethod === 'id' && idPhoto))

  const inputCls = "w-full px-4 py-3 bg-cream border border-border rounded-xl font-medium text-ink text-sm focus:outline-none focus:border-ink/30 transition-all"
  const labelCls = "text-[10px] font-semibold text-ink uppercase tracking-wider mb-1.5 block"

  return (
    <div className="h-[100dvh] flex flex-col bg-cream overflow-hidden">
      {/* Compact header */}
      <header className="glass border-b border-border px-5 py-3 flex items-center justify-between shrink-0 z-50">
        <button onClick={() => step === 0 ? onNavigate('landing') : back()} className="flex items-center gap-2">
          {step > 0 ? <ArrowLeft size={18} className="text-ink" /> : <div className="w-8 h-8 rounded-[10px] bg-ink flex items-center justify-center"><Home className="w-3.5 h-3.5 text-cream" strokeWidth={2} /></div>}
          {step === 0 && <span className="text-base font-display font-bold tracking-[-0.03em] text-ink">CoRenty</span>}
        </button>
        {step > 0 && <span className="text-[10px] font-semibold text-ink uppercase tracking-wider">{step}/{totalSteps}</span>}
      </header>

      {/* Progress */}
      {step > 0 && (
        <div className="px-5 pt-3 shrink-0">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1 h-[3px] rounded-full bg-border overflow-hidden">
                <motion.div className="h-full bg-ink rounded-full" initial={{ width: 0 }} animate={{ width: step > i ? '100%' : '0%' }} transition={{ duration: 0.3 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content — fills remaining space, no scroll */}
      <div className="flex-1 flex items-center justify-center px-5 py-4 min-h-0 overflow-hidden">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">

            {/* Step 0: Mode */}
            {step === 0 && (
              <motion.div key="mode" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <h2 className="text-2xl lg:text-3xl font-display font-bold tracking-tight mb-2 text-ink">How are you<br/><span className="font-serif italic">looking?</span></h2>
                <p className="text-sm text-ink mb-6">Pick what fits your situation.</p>
                <div className="space-y-3">
                  <button onClick={() => { setMode('have'); setStep(1) }} className="w-full p-5 rounded-2xl border bg-surface border-border hover:border-ink/20 text-left transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center shrink-0"><Home className="w-5 h-5 text-ink" strokeWidth={1.5} /></div>
                      <div>
                        <h3 className="text-base font-display font-bold">I have a place</h3>
                        <p className="text-xs text-ink mt-0.5">List your apartment and find a roommate.</p>
                      </div>
                    </div>
                  </button>
                  <button onClick={() => { setMode('need'); setStep(1) }} className="w-full p-5 rounded-2xl border bg-surface border-border hover:border-ink/20 text-left transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center shrink-0"><GraduationCap className="w-5 h-5 text-ink" strokeWidth={1.5} /></div>
                      <div>
                        <h3 className="text-base font-display font-bold">I need a place + roommate</h3>
                        <p className="text-xs text-ink mt-0.5">Match with another student and search together.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Verify */}
            {step === 1 && (
              <motion.div key="verify" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-display font-bold tracking-tight mb-1 text-ink">Verify you're a student</h2>
                <p className="text-xs text-ink mb-4">This keeps CoRenty safe.</p>
                <div className="space-y-3">
                  <div className="relative">
                    <label className={labelCls}>Your institution</label>
                    <input type="text" value={instInput} onChange={e => { setInstInput(e.target.value); setInstitution(''); setShowSuggestions(true) }} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => { setShowSuggestions(false); if (instInput && !institution) setInstitution(instInput) }, 200)} placeholder="Type your school..." className={inputCls} />
                    {showSuggestions && filteredSuggestions.length > 0 && !institution && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-10 max-h-36 overflow-y-auto">
                        {filteredSuggestions.map(s => (
                          <button key={s} onMouseDown={() => { setInstitution(s); setInstInput(s); setShowSuggestions(false) }} className="w-full text-left px-4 py-2 hover:bg-cream text-ink text-xs font-medium transition-colors">{s}</button>
                        ))}
                      </div>
                    )}
                    {institution && <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1.5 bg-ink/5 rounded-lg"><Check size={11} className="text-like" /><span className="text-xs font-medium text-ink truncate">{institution}</span><button onClick={() => { setInstitution(''); setInstInput('') }} className="ml-auto"><X size={10} className="text-ink" /></button></div>}
                  </div>
                  <div>
                    <label className={labelCls}>Verify with</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setVerificationMethod('matric')} className={`p-3 rounded-xl border text-left transition-all ${verificationMethod === 'matric' ? 'bg-ink border-ink text-cream' : 'bg-surface border-border'}`}>
                        <p className="font-display font-bold text-xs">Matric number</p>
                        <p className={`text-[10px] mt-0.5 ${verificationMethod === 'matric' ? 'text-cream/70' : 'text-ink'}`}>Quick & easy</p>
                      </button>
                      <button onClick={() => setVerificationMethod('id')} className={`p-3 rounded-xl border text-left transition-all ${verificationMethod === 'id' ? 'bg-ink border-ink text-cream' : 'bg-surface border-border'}`}>
                        <p className="font-display font-bold text-xs">Student ID</p>
                        <p className={`text-[10px] mt-0.5 ${verificationMethod === 'id' ? 'text-cream/70' : 'text-ink'}`}>Upload photo</p>
                      </button>
                    </div>
                  </div>
                  {verificationMethod === 'matric' && (
                    <div><label className={labelCls}>Matric number</label><input type="text" value={matricNumber} onChange={e => setMatricNumber(e.target.value)} placeholder="e.g. 210401001" className={inputCls} /></div>
                  )}
                  {verificationMethod === 'id' && (
                    <div>
                      <label className={labelCls}>Student ID photo</label>
                      <label className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-ink/30 transition-all bg-cream">
                        {idPhoto ? <img src={idPhoto} alt="ID" className="h-full w-full object-cover rounded-xl" /> : <><Upload className="w-5 h-5 text-ink mr-2" strokeWidth={1.5} /><span className="text-xs font-medium text-ink">Tap to upload</span></>}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload(setIdPhoto)} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={back} className="flex-1 py-3 bg-cream rounded-xl font-semibold text-ink text-sm flex items-center justify-center gap-1.5"><ArrowLeft size={14} /> Back</button>
                  <button onClick={next} disabled={!instValid} className="flex-[2] py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed">Continue <ArrowRight size={14} /></button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Photos */}
            {step === 2 && (
              <motion.div key="photo" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-display font-bold tracking-tight mb-1 text-ink">Add your photos</h2>
                <p className="text-xs text-ink mb-4">Profile photo required. Add more to stand out.</p>
                <div className="flex items-center gap-5 mb-4">
                  <label className="relative cursor-pointer shrink-0">
                    <div className="w-24 h-24 rounded-full bg-cream border-[3px] border-border overflow-hidden flex items-center justify-center">
                      {profilePhoto ? <img src={profilePhoto} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-ink" strokeWidth={1.5} />}
                    </div>
                    <div className="absolute -bottom-0.5 right-0 w-7 h-7 rounded-full bg-ink flex items-center justify-center shadow-lg"><Upload className="w-3 h-3 text-cream" /></div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload(setProfilePhoto)} className="hidden" />
                  </label>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-ink mb-1.5">More photos</p>
                    <div className="grid grid-cols-4 gap-2">
                      {profileImages.map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-cream border border-border relative group">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={() => setProfileImages(p => p.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-ink/70 flex items-center justify-center"><X size={8} className="text-cream" /></button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-ink/30 bg-cream">
                        <Plus className="w-4 h-4 text-ink" /><input type="file" accept="image/*" multiple onChange={handleMultiple(setProfileImages)} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={back} className="flex-1 py-3 bg-cream rounded-xl font-semibold text-ink text-sm flex items-center justify-center gap-1.5"><ArrowLeft size={14} /> Back</button>
                  <button onClick={next} disabled={!profilePhoto} className="flex-[2] py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed">Continue <ArrowRight size={14} /></button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Bio + Socials */}
            {step === 3 && (
              <motion.div key="bio" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-display font-bold tracking-tight mb-1 text-ink">About <span className="font-serif italic">you</span></h2>
                <p className="text-xs text-ink mb-3">Bio and socials help others know you.</p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Hobbies, lifestyle, habits..." rows={2} maxLength={200} className={`${inputCls} resize-none`} />
                    <p className="text-[10px] text-ink text-right">{bio.length}/200</p>
                  </div>
                  <div>
                    <label className={labelCls}>Social links</label>
                    <div className="space-y-2">
                      {([
                        { key: 'instagram' as const, icon: <InstagramIcon size={14} />, ph: 'Instagram' },
                        { key: 'tiktok' as const, icon: <TikTokIcon size={14} />, ph: 'TikTok' },
                        { key: 'facebook' as const, icon: <FacebookIcon size={14} />, ph: 'Facebook' },
                        { key: 'whatsapp' as const, icon: <WhatsAppIcon size={14} />, ph: 'WhatsApp' },
                        { key: 'email' as const, icon: <Mail size={14} />, ph: 'Email' },
                        { key: 'twitter' as const, icon: <XIcon size={14} />, ph: 'X / Twitter' },
                      ]).map(({ key, icon, ph }) => (
                        <div key={key} className="flex items-center gap-2.5 px-3 py-2 bg-cream border border-border rounded-xl focus-within:border-ink/30 transition-all">
                          <span className="shrink-0">{icon}</span>
                          <input type="text" value={socials[key]} onChange={e => setSocials(s => ({ ...s, [key]: e.target.value }))} placeholder={ph} className="flex-1 bg-transparent font-medium text-ink text-sm focus:outline-none placeholder:text-ink/30" />
                          {socials[key] && <Check size={12} className="text-like shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={back} className="flex-1 py-3 bg-cream rounded-xl font-semibold text-ink text-sm flex items-center justify-center gap-1.5"><ArrowLeft size={14} /> Back</button>
                  <button onClick={next} disabled={!bio} className="flex-[2] py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed">Continue <ArrowRight size={14} /></button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Have → Apartment / Need → Preferences */}
            {step === 4 && mode === 'have' && (
              <motion.div key="apt" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-display font-bold tracking-tight mb-1 text-ink">Your place</h2>
                <p className="text-xs text-ink mb-3">Details + photos. At least 1 photo required.</p>
                <div className="space-y-2.5">
                  <input type="text" value={apartmentTitle} onChange={e => setApartmentTitle(e.target.value)} placeholder="Listing title" className={inputCls} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={apartmentPrice} onChange={e => setApartmentPrice(e.target.value)} placeholder="Price (₦/yr)" className={inputCls} />
                    <input type="text" value={apartmentLocation} onChange={e => setApartmentLocation(e.target.value)} placeholder="Location" className={inputCls} />
                  </div>
                  <textarea value={apartmentDesc} onChange={e => setApartmentDesc(e.target.value)} placeholder="Description..." rows={2} className={`${inputCls} resize-none`} />
                  <div className="grid grid-cols-5 gap-2">
                    {apartmentPhotos.map((p, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-cream border border-border relative group">
                        <img src={p} className="w-full h-full object-cover" />
                        <button onClick={() => setApartmentPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-ink/70 flex items-center justify-center"><X size={8} className="text-cream" /></button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-ink/30 bg-cream">
                      <Upload className="w-4 h-4 text-ink" strokeWidth={1.5} /><span className="text-[9px] font-medium text-ink">Add</span>
                      <input type="file" accept="image/*" multiple onChange={handleMultiple(setApartmentPhotos)} className="hidden" />
                    </label>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-ink">Distance to campus</span>
                      <span className="text-base font-display font-bold text-brand">{distanceToCampus} km</span>
                    </div>
                    <input type="range" min={0.5} max={10} step={0.5} value={distanceToCampus} onChange={e => setDistanceToCampus(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #e85d04 0%, #e85d04 ${((distanceToCampus - 0.5) / 9.5) * 100}%, #e7e5e4 ${((distanceToCampus - 0.5) / 9.5) * 100}%, #e7e5e4 100%)` }} />
                    <p className="text-[10px] text-ink mt-1">{distanceToCampus <= 1 ? '🚶 Right on campus!' : distanceToCampus <= 3 ? '🚶 Easy walk' : distanceToCampus <= 5 ? '🚌 Short commute' : '🚗 Longer commute'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={back} className="flex-1 py-3 bg-cream rounded-xl font-semibold text-ink text-sm flex items-center justify-center gap-1.5"><ArrowLeft size={14} /> Back</button>
                  <button onClick={next} disabled={!apartmentTitle || !apartmentPrice || !apartmentLocation || apartmentPhotos.length === 0} className="flex-[2] py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed">Continue <ArrowRight size={14} /></button>
                </div>
              </motion.div>
            )}

            {step === 4 && mode === 'need' && (
              <motion.div key="prefs" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-display font-bold tracking-tight mb-1 text-ink">What are you looking for?</h2>
                <p className="text-xs text-ink mb-4">This helps us match you.</p>
                <div className="space-y-3">
                  <div><label className={labelCls}>Budget (₦/yr)</label><input type="text" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 200,000" className={inputCls} /></div>
                  <div><label className={labelCls}>Preferred area</label><input type="text" value={preferredArea} onChange={e => setPreferredArea(e.target.value)} placeholder="e.g. Akoka, Yaba" className={inputCls} /></div>
                  <div className="bg-surface border border-border rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-ink">Max distance to campus</span>
                      <span className="text-base font-display font-bold text-brand">{distanceToCampus} km</span>
                    </div>
                    <input type="range" min={0.5} max={10} step={0.5} value={distanceToCampus} onChange={e => setDistanceToCampus(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #e85d04 0%, #e85d04 ${((distanceToCampus - 0.5) / 9.5) * 100}%, #e7e5e4 ${((distanceToCampus - 0.5) / 9.5) * 100}%, #e7e5e4 100%)` }} />
                    <p className="text-[10px] text-ink mt-1">{distanceToCampus <= 1 ? '🚶 Right on campus!' : distanceToCampus <= 3 ? '🚶 Easy walk' : distanceToCampus <= 5 ? '🚌 Short commute' : '🚗 Longer commute'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={back} className="flex-1 py-3 bg-cream rounded-xl font-semibold text-ink text-sm flex items-center justify-center gap-1.5"><ArrowLeft size={14} /> Back</button>
                  <button onClick={next} disabled={!budget} className="flex-[2] py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed">Continue <ArrowRight size={14} /></button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <motion.div key="review" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <h2 className="text-xl font-display font-bold tracking-tight mb-1 text-ink">All set!</h2>
                <p className="text-xs text-ink mb-4">Review your info.</p>
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
                    {profilePhoto && <img src={profilePhoto} className="w-10 h-10 rounded-full object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-sm text-ink truncate">{institution}</p>
                      <p className="text-[10px] text-ink">{mode === 'have' ? 'Has a place' : 'Needs a place + roommate'}</p>
                    </div>
                    {profileImages.length > 0 && <span className="text-[10px] text-ink shrink-0">+{profileImages.length} photos</span>}
                  </div>
                  {bio && <p className="text-xs text-ink bg-surface border border-border rounded-xl p-3">{bio}</p>}
                  {Object.values(socials).some(v => v) && (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(socials).filter(([_, v]) => v).map(([key]) => (
                        <span key={key} className="px-2 py-1 bg-cream rounded-lg text-[10px] font-medium text-ink capitalize">{key}</span>
                      ))}
                    </div>
                  )}
                  {mode === 'have' && (
                    <div className="p-3 bg-surface border border-border rounded-xl">
                      <p className="font-display font-bold text-sm text-ink">{apartmentTitle}</p>
                      <p className="text-[10px] text-ink">₦{apartmentPrice}/yr · {apartmentLocation} · {apartmentPhotos.length} photos · {distanceToCampus}km</p>
                    </div>
                  )}
                  {mode === 'need' && (
                    <div className="p-3 bg-surface border border-border rounded-xl">
                      <p className="text-xs text-ink">Budget: ₦{budget}/yr · {preferredArea || 'Flexible'} · {distanceToCampus}km max</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={back} className="flex-1 py-3 bg-cream rounded-xl font-semibold text-ink text-sm flex items-center justify-center gap-1.5"><ArrowLeft size={14} /> Back</button>
                  <button onClick={handleFinish} className="flex-[2] py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"><Check size={14} /> Start swiping</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
