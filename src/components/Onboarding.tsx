import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowRight,
  ArrowLeft,
  Home,
  Search,
  Users,
  MapPin,
  Plus,
  X,
  Loader2,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Camera,
} from 'lucide-react'
import { TikTokIcon, InstagramIcon, FacebookIcon, XIcon, WhatsAppIcon } from './BrandIcons'
import { api } from '../lib/api'

interface OnboardingProps {
  user: any
  onNavigate: (page: string) => void
  onComplete: () => void
}

type Mode = 'have' | 'need' | 'together'

const TOTAL_STEPS = 6

const Onboarding: React.FC<OnboardingProps> = ({ user, onNavigate, onComplete }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [direction, setDirection] = useState(1)

  const [name, setName] = useState(user?.name || '')
  const [institution, setInstitution] = useState('')
  const [matricNumber, setMatricNumber] = useState('')
  const [bio, setBio] = useState('')

  const [profilePhotos, setProfilePhotos] = useState<string[]>([])
  const [profilePhotoFiles, setProfilePhotoFiles] = useState<File[]>([])
  const profileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<Mode | null>(null)

  const [apartmentTitle, setApartmentTitle] = useState('')
  const [apartmentPrice, setApartmentPrice] = useState('')
  const [apartmentLocation, setApartmentLocation] = useState('')
  const [apartmentDescription, setApartmentDescription] = useState('')
  const [apartmentPhotos, setApartmentPhotos] = useState<string[]>([])
  const [apartmentPhotoFiles, setApartmentPhotoFiles] = useState<File[]>([])
  const apartmentInputRef = useRef<HTMLInputElement>(null)

  const [budget, setBudget] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [distanceToCampus, setDistanceToCampus] = useState(2)
  const [lookingFor, setLookingFor] = useState('')

  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [preferredAreas, setPreferredAreas] = useState('')
  const [bringToTable, setBringToTable] = useState('')

  const [email, setEmail] = useState(user?.email || '')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [facebook, setFacebook] = useState('')
  const [twitter, setTwitter] = useState('')

  const [previewCarouselIndex, setPreviewCarouselIndex] = useState(0)

  const nextStep = () => { setDirection(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS)) }
  const prevStep = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)) }

  const handleProfilePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const remaining = 5 - profilePhotos.length
    Array.from(files).slice(0, remaining).forEach((file) => {
      setProfilePhotoFiles((prev) => [...prev, file])
      const reader = new FileReader()
      reader.onloadend = () => setProfilePhotos((prev) => prev.length >= 5 ? prev : [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
    if (profileInputRef.current) profileInputRef.current.value = ''
  }

  const removeProfilePhoto = (i: number) => {
    setProfilePhotos((p) => p.filter((_, idx) => idx !== i))
    setProfilePhotoFiles((p) => p.filter((_, idx) => idx !== i))
  }

  const handleApartmentPhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).slice(0, 5 - apartmentPhotos.length).forEach((file) => {
      setApartmentPhotoFiles((prev) => [...prev, file])
      const reader = new FileReader()
      reader.onloadend = () => setApartmentPhotos((prev) => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
    if (apartmentInputRef.current) apartmentInputRef.current.value = ''
  }

  const removeApartmentPhoto = (i: number) => {
    setApartmentPhotos((p) => p.filter((_, idx) => idx !== i))
    setApartmentPhotoFiles((p) => p.filter((_, idx) => idx !== i))
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!(name.trim() && institution.trim() && matricNumber.trim())
      case 2: return profilePhotos.length >= 1
      case 3: return mode !== null
      case 4:
        if (mode === 'have') return !!(apartmentTitle.trim() && apartmentPrice.trim() && apartmentLocation.trim() && apartmentPhotos.length > 0 && bio.trim())
        if (mode === 'need') return !!(budget.trim() && preferredLocation.trim() && bio.trim())
        if (mode === 'together') return !!(budgetMin.trim() && preferredAreas.trim() && bio.trim())
        return false
      case 5: return !!(email.trim())
      case 6: return true
      default: return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const profilePhotoUrls: string[] = []
      for (let i = 0; i < profilePhotoFiles.length; i++) {
        const r = await api.uploadImage(profilePhotoFiles[i], `profile-${user.id}-${i}.jpg`)
        profilePhotoUrls.push(r.url)
      }

      const apartmentPhotoUrls: string[] = []
      if (mode === 'have') {
        for (let i = 0; i < apartmentPhotoFiles.length; i++) {
          const r = await api.uploadImage(apartmentPhotoFiles[i], `apartment-${user.id}-${i}.jpg`)
          apartmentPhotoUrls.push(r.url)
        }
      }

      const profileData: Record<string, any> = {
        name: name.trim(),
        institution: institution.trim(),
        matric_number: matricNumber.trim(),
        bio: bio.trim(),
        profile_photo: profilePhotoUrls[0] || null,
        profile_photos: profilePhotoUrls,
        mode,
        onboarding_complete: true,
        socials: { email: email.trim(), whatsapp: whatsapp.trim(), instagram: instagram.trim(), tiktok: tiktok.trim(), facebook: facebook.trim(), twitter: twitter.trim() },
      }

      if (mode === 'need' || mode === 'together') {
        profileData.budget = mode === 'need' ? budget : `${budgetMin}-${budgetMax}`
        profileData.preferred_location = mode === 'need' ? preferredLocation : preferredAreas
        if (mode === 'need') profileData.distance_to_campus = distanceToCampus
      }

      await api.updateUserProfile(profileData)

      if (mode === 'have') {
        await api.createListing({ mode: 'have', title: apartmentTitle.trim(), price: apartmentPrice.trim(), location: apartmentLocation.trim(), description: apartmentDescription.trim(), photos: apartmentPhotoUrls, apartment_title: apartmentTitle.trim(), apartment_price: apartmentPrice.trim(), apartment_location: apartmentLocation.trim(), apartment_description: apartmentDescription.trim(), apartment_photos: apartmentPhotoUrls } as any)
      } else if (mode === 'need') {
        await api.createListing({ mode: 'need', title: `${name.trim()} is looking for an apartment`, price: budget.trim(), location: preferredLocation.trim(), description: lookingFor.trim() || `Budget: ₦${budget}/yr, Preferred: ${preferredLocation}`, photos: profilePhotoUrls, distance_to_campus: distanceToCampus } as any)
      } else if (mode === 'together') {
        await api.createListing({ mode: 'together' as any, title: `${name.trim()} is looking for a roommate`, price: `${budgetMin}-${budgetMax}`, location: preferredAreas.trim(), description: bringToTable.trim() || `Budget: ₦${budgetMin}-₦${budgetMax}, Areas: ${preferredAreas}`, photos: profilePhotoUrls } as any)
      }

      onComplete()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPreviewPhotos = () => mode === 'have' ? apartmentPhotos : profilePhotos
  const getPreviewTitle = () => mode === 'have' ? apartmentTitle || 'Apartment' : mode === 'need' ? `${name.trim()} wants an apartment` : `${name.trim()} wants a roommate`
  const getPreviewPrice = () => mode === 'have' ? apartmentPrice : mode === 'need' ? budget : budgetMin && budgetMax ? `${budgetMin}–${budgetMax}` : budgetMin
  const getPreviewLocation = () => mode === 'have' ? apartmentLocation : mode === 'need' ? preferredLocation : preferredAreas
  const getPreviewDescription = () => mode === 'have' ? apartmentDescription : mode === 'need' ? lookingFor || bio : bringToTable || bio
  const getModeBadgeText = () => mode === 'have' ? 'Has Apartment' : mode === 'need' ? 'Needs Apartment' : 'Looking Together'
  const getModeBadgeClass = () => mode === 'have' ? 'bg-like text-white' : mode === 'need' ? 'bg-brand text-white' : 'bg-[#2563eb] text-white'

  const input = 'w-full px-4 py-3.5 bg-white border border-border rounded-2xl text-ink text-[15px] placeholder:text-ink-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all'
  const label = 'block text-[13px] font-semibold text-ink mb-1.5'

  const slide = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-cream">
      {/* ── Fixed Header ── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[13px] font-bold text-ink tracking-[-0.02em]">{step} / {TOTAL_STEPS}</span>
            <span className="text-[13px] font-medium text-ink-tertiary">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div className="h-full bg-brand rounded-full" animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.3, ease: 'easeInOut' }} />
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto px-5">
        <div className="max-w-sm mx-auto py-2">
          <AnimatePresence mode="wait" custom={direction}>

            {/* STEP 1: About You */}
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
                <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">About you</h1>
                <p className="text-[14px] text-ink-tertiary mb-6">Let's get the basics down</p>

                <div className="space-y-4">
                  <div>
                    <label className={label}>Full name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={input} />
                  </div>
                  <div>
                    <label className={label}>Institution</label>
                    <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. University of Lagos" className={input} />
                  </div>
                  <div>
                    <label className={label}>Matric number</label>
                    <input value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} placeholder="Your student ID" className={input} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Photos */}
            {step === 2 && (
              <motion.div key="s2" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
                <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">Your photos</h1>
                <p className="text-[14px] text-ink-tertiary mb-6">Add at least 1 photo (up to 5)</p>

                <div className="grid grid-cols-3 gap-3">
                  {profilePhotos.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-brand text-white text-[10px] font-bold rounded-md">Main</div>}
                      <button onClick={() => removeProfilePhoto(i)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-ink/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {profilePhotos.length < 5 && (
                    <button onClick={() => profileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-brand/40 transition-colors">
                      <Plus className="w-5 h-5 text-ink-tertiary" />
                      <span className="text-[11px] text-ink-tertiary">Add</span>
                    </button>
                  )}
                </div>
                <input ref={profileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleProfilePhotoAdd} />
              </motion.div>
            )}

            {/* STEP 3: Mode */}
            {step === 3 && (
              <motion.div key="s3" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
                <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">What are you doing?</h1>
                <p className="text-[14px] text-ink-tertiary mb-6">Pick one</p>

                <div className="space-y-3">
                  {([
                    { id: 'have' as Mode, icon: Home, title: 'I have an apartment', desc: 'List your place for roommates' },
                    { id: 'need' as Mode, icon: Search, title: 'I need an apartment', desc: 'Find a place to move into' },
                    { id: 'together' as Mode, icon: Users, title: 'Let\'s search together', desc: 'Find a roommate to apartment hunt' },
                  ]).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMode(opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        mode === opt.id ? 'border-brand bg-brand/5' : 'border-border bg-white hover:border-ink/20'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${mode === opt.id ? 'bg-brand' : 'bg-cream'}`}>
                        <opt.icon className={`w-5 h-5 ${mode === opt.id ? 'text-white' : 'text-ink-secondary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-ink">{opt.title}</p>
                        <p className="text-[13px] text-ink-tertiary">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Details */}
            {step === 4 && (
              <motion.div key="s4" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
                {mode === 'have' && (
                  <>
                    <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">Your apartment</h1>
                    <p className="text-[14px] text-ink-tertiary mb-6">Tell others about the place</p>

                    <div className="space-y-4">
                      <div>
                        <label className={label}>Apartment name</label>
                        <input value={apartmentTitle} onChange={(e) => setApartmentTitle(e.target.value)} placeholder="e.g. 2BR at Akoka Estate" className={input} />
                      </div>
                      <div>
                        <label className={label}>Price (₦/year)</label>
                        <input value={apartmentPrice} onChange={(e) => setApartmentPrice(e.target.value)} placeholder="e.g. 450,000" className={input} />
                      </div>
                      <div>
                        <label className={label}>Location</label>
                        <input value={apartmentLocation} onChange={(e) => setApartmentLocation(e.target.value)} placeholder="e.g. Akoka, Yaba" className={input} />
                      </div>
                      <div>
                        <label className={label}>Description</label>
                        <textarea value={apartmentDescription} onChange={(e) => setApartmentDescription(e.target.value)} placeholder="What makes it great?" rows={2} className={`${input} resize-none`} />
                      </div>
                      <div>
                        <label className={label}>Apartment photos</label>
                        <div className="grid grid-cols-4 gap-2">
                          {apartmentPhotos.map((p, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                              <img src={p} alt="" className="w-full h-full object-cover" />
                              <button onClick={() => removeApartmentPhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-ink/60 rounded-full flex items-center justify-center">
                                <X className="w-2.5 h-2.5 text-white" />
                              </button>
                            </div>
                          ))}
                          {apartmentPhotos.length < 5 && (
                            <button onClick={() => apartmentInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-brand/40 transition-colors">
                              <Plus className="w-4 h-4 text-ink-tertiary" />
                            </button>
                          )}
                        </div>
                        <input ref={apartmentInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleApartmentPhotoAdd} />
                      </div>
                    </div>
                  </>
                )}

                {mode === 'need' && (
                  <>
                    <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">What you need</h1>
                    <p className="text-[14px] text-ink-tertiary mb-6">Your apartment preferences</p>

                    <div className="space-y-4">
                      <div>
                        <label className={label}>Budget (₦/year)</label>
                        <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 300,000" className={input} />
                      </div>
                      <div>
                        <label className={label}>Preferred area</label>
                        <input value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} placeholder="e.g. Yaba, Surulere" className={input} />
                      </div>
                      <div>
                        <label className={label}>Distance to campus</label>
                        <div className="flex items-center gap-3">
                          <input type="range" min={0.5} max={10} step={0.5} value={distanceToCampus} onChange={(e) => setDistanceToCampus(parseFloat(e.target.value))} className="flex-1 accent-brand" />
                          <span className="text-[14px] font-semibold text-ink w-12 text-right">{distanceToCampus}km</span>
                        </div>
                      </div>
                      <div>
                        <label className={label}>What are you looking for?</label>
                        <textarea value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="e.g. Shared room near campus, quiet area" rows={2} className={`${input} resize-none`} />
                      </div>
                    </div>
                  </>
                )}

                {mode === 'together' && (
                  <>
                    <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">Search together</h1>
                    <p className="text-[14px] text-ink-tertiary mb-6">What works for you?</p>

                    <div className="space-y-4">
                      <div>
                        <label className={label}>Budget range (₦/year)</label>
                        <div className="flex items-center gap-2">
                          <input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Min" className={`${input} flex-1`} />
                          <span className="text-ink-tertiary">–</span>
                          <input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Max" className={`${input} flex-1`} />
                        </div>
                      </div>
                      <div>
                        <label className={label}>Preferred areas</label>
                        <input value={preferredAreas} onChange={(e) => setPreferredAreas(e.target.value)} placeholder="e.g. Yaba, Akoka" className={input} />
                      </div>
                      <div>
                        <label className={label}>What you bring to the table</label>
                        <textarea value={bringToTable} onChange={(e) => setBringToTable(e.target.value)} placeholder="e.g. I'm neat, pay rent early, good cook" rows={2} className={`${input} resize-none`} />
                      </div>
                    </div>
                  </>
                )}

                {/* Bio — always shown on step 4 */}
                <div className="mt-5 pt-5 border-t border-border">
                  <label className={label}>About you</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A few words for potential roommates" rows={2} className={`${input} resize-none`} />
                </div>
              </motion.div>
            )}

            {/* STEP 5: Socials */}
            {step === 5 && (
              <motion.div key="s5" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
                <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">How to reach you</h1>
                <p className="text-[14px] text-ink-tertiary mb-6">Email is required, rest are optional</p>

                <div className="space-y-3">
                  {[
                    { icon: null, label: 'Email', val: email, set: setEmail, ph: 'you@email.com', required: true },
                    { icon: <WhatsAppIcon className="w-4 h-4" />, label: 'WhatsApp', val: whatsapp, set: setWhatsapp, ph: '080...' },
                    { icon: <InstagramIcon className="w-4 h-4" />, label: 'Instagram', val: instagram, set: setInstagram, ph: '@handle' },
                    { icon: <TikTokIcon className="w-4 h-4" />, label: 'TikTok', val: tiktok, set: setTiktok, ph: '@handle' },
                    { icon: <FacebookIcon className="w-4 h-4" />, label: 'Facebook', val: facebook, set: setFacebook, ph: 'Profile URL' },
                    { icon: <XIcon className="w-4 h-4" />, label: 'X (Twitter)', val: twitter, set: setTwitter, ph: '@handle' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center flex-shrink-0">
                        {f.icon || <span className="text-[12px] font-bold text-ink-tertiary">@</span>}
                      </div>
                      <input value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} className={`${input} !py-3`} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 6: Preview + Submit */}
            {step === 6 && (
              <motion.div key="s6" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
                <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">Preview your listing</h1>
                <p className="text-[14px] text-ink-tertiary mb-6">This is how others will see you</p>

                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-border">
                    {getPreviewPhotos().length > 0 ? (
                      <>
                        <img src={getPreviewPhotos()[previewCarouselIndex]} alt="" className="w-full h-full object-cover" />
                        {getPreviewPhotos().length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-between px-2">
                            <button onClick={() => setPreviewCarouselIndex((i) => (i - 1 + getPreviewPhotos().length) % getPreviewPhotos().length)} className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <ChevronLeft className="w-4 h-4 text-ink" />
                            </button>
                            <button onClick={() => setPreviewCarouselIndex((i) => (i + 1) % getPreviewPhotos().length)} className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <ChevronRight className="w-4 h-4 text-ink" />
                            </button>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {getPreviewPhotos().map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === previewCarouselIndex ? 'bg-white' : 'bg-white/40'}`} />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Camera className="w-12 h-12 text-ink-tertiary" /></div>
                    )}
                    <div className="absolute top-3 left-3">
                      <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getModeBadgeClass()}`}>{getModeBadgeText()}</div>
                    </div>
                    {getPreviewPrice() && (
                      <div className="absolute top-3 right-3">
                        <div className="px-2.5 py-1 bg-ink/80 backdrop-blur-sm rounded-full text-[11px] font-bold text-cream">₦{getPreviewPrice()}/yr</div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h2 className="text-[17px] font-display font-bold text-ink mb-1 tracking-[-0.03em]">{getPreviewTitle()}</h2>
                    <div className="flex items-center gap-1 text-ink-secondary text-[13px] mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{getPreviewLocation()}</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                      {profilePhotos[0] ? (
                        <img src={profilePhotos[0]} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center"><User className="w-5 h-5 text-ink-tertiary" /></div>
                      )}
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-ink">{name}</p>
                        <p className="text-[12px] text-ink-tertiary">{institution}</p>
                      </div>
                    </div>

                    {getPreviewDescription() && (
                      <p className="text-[13px] text-ink-secondary mt-3 line-clamp-2">{getPreviewDescription()}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Fixed Bottom Bar ── */}
      <div className="flex-shrink-0 px-5 pb-6 pt-3 bg-gradient-to-t from-cream via-cream to-transparent">
        <div className="max-w-sm mx-auto">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-[13px] text-red-700 flex-1">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 6 ? (
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-brand text-white rounded-2xl font-bold text-[15px] tracking-[-0.02em] hover:bg-brand/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Submitting...</span></> : <span>Complete onboarding</span>}
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              {step > 1 && (
                <motion.button onClick={prevStep} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center hover:border-ink/20 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-ink" />
                </motion.button>
              )}
              <motion.button
                onClick={nextStep}
                disabled={!canProceed()}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-4 bg-ink text-white rounded-2xl font-bold text-[15px] tracking-[-0.02em] hover:bg-ink/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
