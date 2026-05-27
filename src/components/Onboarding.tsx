import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Home, ArrowLeft, ArrowRight, Check, Upload, Camera, Shield, GraduationCap } from 'lucide-react'

const INSTITUTION_TYPES = [
  'University',
  'Polytechnic',
  'College of Education',
  'Monotechnic',
  'Other',
]

const NIGERIAN_INSTITUTIONS = [
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'University of Benin (UNIBEN)',
  'Obafemi Awolowo University (OAU)',
  'University of Nigeria, Nsukka (UNN)',
  'Ahmadu Bello University (ABU)',
  'Covenant University',
  'Lagos State University (LASU)',
  'Babcock University',
  'Federal University of Technology, Akure (FUTA)',
  'University of Ilorin (UNILORIN)',
  'University of Port Harcourt (UNIPORT)',
  'Yaba College of Technology (YabaTech)',
  'Lagos State Polytechnic (LASPOTECH)',
  'Federal Polytechnic, Offa',
  'Federal Polytechnic, Nekede',
  'Auchi Polytechnic',
  'Alvan Ikoku College of Education',
  'Federal College of Education, Abeokuta',
  'Adeniran Ogunsanya College of Education',
]

interface OnboardingProps {
  onNavigate: (page: string, data?: any) => void
}

const Onboarding: React.FC<OnboardingProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'have' | 'need' | null>(null)
  const [instType, setInstType] = useState('')
  const [institution, setInstitution] = useState('')
  const [matricNumber, setMatricNumber] = useState('')
  const [verificationMethod, setVerificationMethod] = useState<'matric' | 'id' | null>(null)
  const [idPhoto, setIdPhoto] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [apartmentPhotos, setApartmentPhotos] = useState<string[]>([])
  const [apartmentTitle, setApartmentTitle] = useState('')
  const [apartmentPrice, setApartmentPrice] = useState('')
  const [apartmentLocation, setApartmentLocation] = useState('')
  const [apartmentDesc, setApartmentDesc] = useState('')
  const [budget, setBudget] = useState('')
  const [preferredArea, setPreferredArea] = useState('')
  const [uniSearch, setUniSearch] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  const totalSteps = mode === 'have' ? 5 : 4
  const next = () => setStep(s => Math.min(s + 1, totalSteps))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const handlePhotoUpload = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setter(URL.createObjectURL(file))
    }
  }

  const handleMultiplePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          setApartmentPhotos(prev => [...prev, URL.createObjectURL(file)])
        }
      })
    }
  }

  const filteredSuggestions = uniSearch.length > 0
    ? NIGERIAN_INSTITUTIONS.filter(i => i.toLowerCase().includes(uniSearch.toLowerCase())).slice(0, 5)
    : []

  const handleFinish = () => {
    onNavigate('dashboard', {
      mode,
      institution,
      matricNumber,
      profilePhoto,
      name: 'You',
    })
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="glass border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-ink flex items-center justify-center">
            <Home className="w-4 h-4 text-cream" strokeWidth={2} />
          </div>
          <span className="text-lg font-display font-bold tracking-[-0.03em] text-ink">CoRenty</span>
        </button>
        <span className="text-xs font-semibold text-ink uppercase tracking-wider">
          {step === 0 ? 'Get started' : `Step ${step} of ${totalSteps}`}
        </span>
      </header>

      {/* Progress bar */}
      {step > 0 && (
        <div className="max-w-xl mx-auto w-full px-6 pt-6">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full bg-ink rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: step > i ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">

            {/* Step 0: Choose mode */}
            {step === 0 && (
              <motion.div key="mode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl lg:text-4xl font-display font-bold tracking-tight mb-3 text-ink">
                  How are you
                  <br />
                  <span className="font-serif italic">looking?</span>
                </h2>
                <p className="text-ink mb-10">Pick the option that fits your situation.</p>

                <div className="space-y-4">
                  <button
                    onClick={() => { setMode('have'); setStep(1) }}
                    className={`w-full p-6 rounded-[24px] border text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${mode === 'have' ? 'bg-ink border-ink text-cream' : 'bg-surface border-border hover:border-ink/20'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${mode === 'have' ? 'bg-cream/10' : 'bg-cream'}`}>
                        <Home className={`w-6 h-6 ${mode === 'have' ? 'text-brand' : 'text-ink'}`} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-bold mb-1">I have a place</h3>
                        <p className={`text-sm ${mode === 'have' ? 'text-cream/70' : 'text-ink'}`}>
                          Already renting? List your apartment and find someone to split rent with.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setMode('need'); setStep(1) }}
                    className={`w-full p-6 rounded-[24px] border text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${mode === 'need' ? 'bg-ink border-ink text-cream' : 'bg-surface border-border hover:border-ink/20'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${mode === 'need' ? 'bg-cream/10' : 'bg-cream'}`}>
                        <GraduationCap className={`w-6 h-6 ${mode === 'need' ? 'text-brand' : 'text-ink'}`} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-bold mb-1">I need a place + roommate</h3>
                        <p className={`text-sm ${mode === 'need' ? 'text-cream/70' : 'text-ink'}`}>
                          Don't have a place yet? Match with another student and search together.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Institution & verification method */}
            {step === 1 && (
              <motion.div key="verify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">
                  Verify you're a student
                </h2>
                <p className="text-ink mb-8">This keeps CoRenty safe for everyone.</p>

                <div className="space-y-5">
                  {/* Institution type */}
                  <div>
                    <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Institution type</label>
                    <div className="flex flex-wrap gap-2">
                      {INSTITUTION_TYPES.map(type => (
                        <button
                          key={type}
                          onClick={() => setInstType(type)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${instType === type ? 'bg-ink text-cream' : 'bg-cream border border-border text-ink hover:border-ink/20'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Institution search */}
                  <div className="relative">
                    <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Your institution</label>
                    <input
                      type="text"
                      value={uniSearch || institution}
                      onChange={e => {
                        const val = e.target.value
                        setUniSearch(val)
                        setInstitution('')
                      }}
                      placeholder="Search your school..."
                      className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all"
                    />
                    {filteredSuggestions.length > 0 && !institution && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-10">
                        {filteredSuggestions.map(s => (
                          <button
                            key={s}
                            onClick={() => { setInstitution(s); setUniSearch('') }}
                            className="w-full text-left px-5 py-3 hover:bg-cream text-ink text-sm font-medium transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Verification method */}
                  <div>
                    <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-3 block">Verify with</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setVerificationMethod('matric')}
                        className={`p-4 rounded-2xl border text-left transition-all ${verificationMethod === 'matric' ? 'bg-ink border-ink text-cream' : 'bg-surface border-border hover:border-ink/20'}`}
                      >
                        <p className="font-display font-bold text-sm">Matric number</p>
                        <p className={`text-xs mt-1 ${verificationMethod === 'matric' ? 'text-cream/70' : 'text-ink'}`}>Quick & easy</p>
                      </button>
                      <button
                        onClick={() => setVerificationMethod('id')}
                        className={`p-4 rounded-2xl border text-left transition-all ${verificationMethod === 'id' ? 'bg-ink border-ink text-cream' : 'bg-surface border-border hover:border-ink/20'}`}
                      >
                        <p className="font-display font-bold text-sm">Student ID card</p>
                        <p className={`text-xs mt-1 ${verificationMethod === 'id' ? 'text-cream/70' : 'text-ink'}`}>Upload a photo</p>
                      </button>
                    </div>
                  </div>

                  {/* Matric input */}
                  {verificationMethod === 'matric' && (
                    <div>
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Matric / Registration number</label>
                      <input
                        type="text"
                        value={matricNumber}
                        onChange={e => setMatricNumber(e.target.value)}
                        placeholder="e.g. 210401001"
                        className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all"
                      />
                    </div>
                  )}

                  {/* ID upload */}
                  {verificationMethod === 'id' && (
                    <div>
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Student ID photo</label>
                      <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-ink/30 transition-all bg-cream">
                        {idPhoto ? (
                          <img src={idPhoto} alt="ID" className="h-full w-full object-cover rounded-2xl" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-ink mb-2" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-ink">Tap to upload</span>
                            <span className="text-xs text-ink">JPG, PNG</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload(setIdPhoto)} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={back} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    onClick={next}
                    disabled={!institution || !verificationMethod || (verificationMethod === 'matric' && !matricNumber) || (verificationMethod === 'id' && !idPhoto)}
                    className="flex-[2] py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-all flex items-center justify-center gap-2 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Profile photo */}
            {step === 2 && (
              <motion.div key="photo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">
                  Add a profile photo
                </h2>
                <p className="text-ink mb-8">Help others recognize you. A clear photo gets more matches.</p>

                <div className="flex justify-center mb-8">
                  <label className="relative cursor-pointer group">
                    <div className="w-40 h-40 rounded-full bg-cream border-4 border-border overflow-hidden flex items-center justify-center group-hover:border-ink/30 transition-all">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-12 h-12 text-ink" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="absolute -bottom-1 right-0 w-10 h-10 rounded-full bg-ink flex items-center justify-center shadow-lg">
                      <Upload className="w-4 h-4 text-cream" />
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload(setProfilePhoto)} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-3">
                  <button onClick={back} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    onClick={next}
                    disabled={!profilePhoto}
                    className="flex-[2] py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-all flex items-center justify-center gap-2 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Have place → apartment details / Need place → preferences */}
            {step === 3 && mode === 'have' && (
              <motion.div key="apartment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">
                  Tell us about your place
                </h2>
                <p className="text-ink mb-8">Help potential roommates know what you're offering.</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Listing title</label>
                    <input
                      type="text"
                      value={apartmentTitle}
                      onChange={e => setApartmentTitle(e.target.value)}
                      placeholder="e.g. Modern Room near UNILAG Gate"
                      className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Price (₦/yr)</label>
                      <input
                        type="text"
                        value={apartmentPrice}
                        onChange={e => setApartmentPrice(e.target.value)}
                        placeholder="250,000"
                        className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Location</label>
                      <input
                        type="text"
                        value={apartmentLocation}
                        onChange={e => setApartmentLocation(e.target.value)}
                        placeholder="Akoka, Yaba"
                        className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Description</label>
                    <textarea
                      value={apartmentDesc}
                      onChange={e => setApartmentDesc(e.target.value)}
                      placeholder="Describe the room, amenities, house rules..."
                      rows={3}
                      className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={back} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    onClick={next}
                    disabled={!apartmentTitle || !apartmentPrice || !apartmentLocation}
                    className="flex-[2] py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-all flex items-center justify-center gap-2 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && mode === 'need' && (
              <motion.div key="prefs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">
                  What are you looking for?
                </h2>
                <p className="text-ink mb-8">This helps us match you with the right people.</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Budget (₦/yr)</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      placeholder="e.g. 200,000"
                      className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Preferred area</label>
                    <input
                      type="text"
                      value={preferredArea}
                      onChange={e => setPreferredArea(e.target.value)}
                      placeholder="e.g. Akoka, Yaba"
                      className="w-full px-5 py-4 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={back} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    onClick={next}
                    disabled={!budget}
                    className="flex-[2] py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-all flex items-center justify-center gap-2 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Apartment photos (have mode) or Review (need mode) */}
            {step === 4 && mode === 'have' && (
              <motion.div key="aptphotos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">
                  Add apartment photos
                </h2>
                <p className="text-ink mb-8">Show off your space. Listings with photos get 3x more matches.</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {apartmentPhotos.map((photo, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-cream border border-border">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-ink/30 transition-all bg-cream">
                    <Upload className="w-6 h-6 text-ink mb-1" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-ink">Add</span>
                    <input type="file" accept="image/*" multiple onChange={handleMultiplePhotos} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-3">
                  <button onClick={back} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    onClick={next}
                    disabled={apartmentPhotos.length === 0}
                    className="flex-[2] py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-all flex items-center justify-center gap-2 disabled:bg-border disabled:text-ink disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && mode === 'need' && (
              <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <ReviewStep
                  mode={mode}
                  institution={institution}
                  profilePhoto={profilePhoto}
                  budget={budget}
                  preferredArea={preferredArea}
                  onFinish={handleFinish}
                  onBack={back}
                />
              </motion.div>
            )}

            {/* Step 5: Review (have mode) */}
            {step === 5 && mode === 'have' && (
              <motion.div key="review2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <ReviewStep
                  mode={mode}
                  institution={institution}
                  profilePhoto={profilePhoto}
                  apartmentTitle={apartmentTitle}
                  apartmentPrice={apartmentPrice}
                  apartmentLocation={apartmentLocation}
                  apartmentPhotos={apartmentPhotos.length}
                  onFinish={handleFinish}
                  onBack={back}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

const ReviewStep: React.FC<{
  mode: 'have' | 'need'
  institution: string
  profilePhoto: string | null
  budget?: string
  preferredArea?: string
  apartmentTitle?: string
  apartmentPrice?: string
  apartmentLocation?: string
  apartmentPhotos?: number
  onFinish: () => void
  onBack: () => void
}> = ({ mode, institution, profilePhoto, budget, preferredArea, apartmentTitle, apartmentPrice, apartmentLocation, apartmentPhotos, onFinish, onBack }) => (
  <div>
    <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-ink">
      All set!
    </h2>
    <p className="text-ink mb-8">Review your info before you start swiping.</p>

    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-4 p-4 bg-surface border border-border rounded-2xl">
        {profilePhoto && <img src={profilePhoto} className="w-14 h-14 rounded-full object-cover" alt="" />}
        <div>
          <p className="font-display font-bold text-ink">{institution}</p>
          <p className="text-sm text-ink">{mode === 'have' ? 'Has a place' : 'Looking for a place + roommate'}</p>
        </div>
      </div>

      {mode === 'have' && (
        <div className="p-4 bg-surface border border-border rounded-2xl">
          <p className="font-display font-bold text-ink mb-1">{apartmentTitle}</p>
          <p className="text-sm text-ink">₦{apartmentPrice}/yr · {apartmentLocation}</p>
          <p className="text-xs text-ink mt-1">{apartmentPhotos} photo{apartmentPhotos !== 1 ? 's' : ''} uploaded</p>
        </div>
      )}

      {mode === 'need' && (
        <div className="p-4 bg-surface border border-border rounded-2xl">
          <p className="text-sm text-ink">Budget: ₦{budget}/yr</p>
          <p className="text-sm text-ink">Preferred area: {preferredArea || 'Flexible'}</p>
        </div>
      )}
    </div>

    <div className="flex gap-3">
      <button onClick={onBack} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-all flex items-center justify-center gap-2">
        <ArrowLeft size={18} /> Back
      </button>
      <button onClick={onFinish} className="flex-[2] py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-all flex items-center justify-center gap-2">
        <Check size={18} /> Start swiping
      </button>
    </div>
  </div>
)

export default Onboarding
