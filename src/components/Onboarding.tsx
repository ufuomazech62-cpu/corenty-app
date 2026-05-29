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

  // Step 1 — basics
  const [name, setName] = useState(user?.name || '')
  const [institution, setInstitution] = useState('')
  const [matricNumber, setMatricNumber] = useState('')

  // Step 2 — photos
  const [profilePhotos, setProfilePhotos] = useState<string[]>([])
  const [profilePhotoFiles, setProfilePhotoFiles] = useState<File[]>([])
  const profileInputRef = useRef<HTMLInputElement>(null)

  // Step 3 — mode
  const [mode, setMode] = useState<Mode | null>(null)

  // Step 4 — mode-specific details
  const [apartmentTitle, setApartmentTitle] = useState('')
  const [apartmentPrice, setApartmentPrice] = useState('')
  const [apartmentLocation, setApartmentLocation] = useState('')
  const [apartmentDescription, setApartmentDescription] = useState('')
  const [apartmentPhotos, setApartmentPhotos] = useState<string[]>([])
  const [apartmentPhotoFiles, setApartmentPhotoFiles] = useState<File[]>([])
  const apartmentInputRef = useRef<HTMLInputElement>(null)

  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [distanceToCampus, setDistanceToCampus] = useState(2)
  const [lookingFor, setLookingFor] = useState('')
  const [preferredAreas, setPreferredAreas] = useState('')
  const [bringToTable, setBringToTable] = useState('')
  const [bio, setBio] = useState('')

  // Step 5 — contact & socials
  const [email] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [socialToggles, setSocialToggles] = useState({
    instagram: false,
    tiktok: false,
    facebook: false,
    twitter: false,
  })
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [facebook, setFacebook] = useState('')
  const [twitter, setTwitter] = useState('')

  // Step 6
  const [previewCarouselIndex, setPreviewCarouselIndex] = useState(0)

  const nextStep = () => { setDirection(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS)) }
  const prevStep = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)) }

  const toggleSocial = (key: keyof typeof socialToggles) => {
    setSocialToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleProfilePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).slice(0, 5 - profilePhotos.length).forEach((file) => {
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
        if (mode === 'need') return !!(budgetMin.trim() && budgetMax.trim() && preferredLocation.trim() && bio.trim())
        if (mode === 'together') return !!(budgetMin.trim() && budgetMax.trim() && preferredAreas.trim() && bio.trim())
        return false
      case 5: return !!(phone.trim())
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

      const socials: Record<string, string> = { email: email.trim(), phone: phone.trim() }
      if (socialToggles.instagram && instagram.trim()) socials.instagram = instagram.trim()
      if (socialToggles.tiktok && tiktok.trim()) socials.tiktok = tiktok.trim()
      if (socialToggles.facebook && facebook.trim()) socials.facebook = facebook.trim()
      if (socialToggles.twitter && twitter.trim()) socials.twitter = twitter.trim()

      const profileData: Record<string, any> = {
        name: name.trim(),
        institution: institution.trim(),
        matric_number: matricNumber.trim(),
        bio: bio.trim(),
        profile_photo: profilePhotoUrls[0] || null,
        profile_photos: profilePhotoUrls,
        mode,
        onboarding_complete: true,
        socials,
      }

      const budgetRange = `${budgetMin}-${budgetMax}`

      if (mode === 'need' || mode === 'together') {
        profileData.budget = budgetRange
        profileData.preferred_location = mode === 'need' ? preferredLocation : preferredAreas
        if (mode === 'need') profileData.distance_to_campus = distanceToCampus
      }

      await api.updateUserProfile(profileData)

      if (mode === 'have') {
        await api.createListing({ mode: 'have', title: apartmentTitle.trim(), price: apartmentPrice.trim(), location: apartmentLocation.trim(), description: apartmentDescription.trim(), photos: apartmentPhotoUrls, apartment_title: apartmentTitle.trim(), apartment_price: apartmentPrice.trim(), apartment_location: apartmentLocation.trim(), apartment_description: apartmentDescription.trim(), apartment_photos: apartmentPhotoUrls } as any)
      } else if (mode === 'need') {
        await api.createListing({ mode: 'need', title: `${name.trim()} is looking for a roommate`, price: budgetRange, location: preferredLocation.trim(), description: lookingFor.trim() || bio.trim(), photos: profilePhotoUrls, distance_to_campus: distanceToCampus } as any)
      } else if (mode === 'together') {
        await api.createListing({ mode: 'together' as any, title: `${name.trim()} wants to find a place together`, price: budgetRange, location: preferredAreas.trim(), description: bringToTable.trim() || bio.trim(), photos: profilePhotoUrls } as any)
      }

      onComplete()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPreviewPhotos = () => mode === 'have' ? apartmentPhotos : profilePhotos
  const getPreviewTitle = () => mode === 'have' ? apartmentTitle || 'My apartment' : mode === 'need' ? `${name.trim()} is looking for a roommate` : `${name.trim()} wants to find a place together`
  const getPreviewPrice = () => mode === 'have' ? apartmentPrice : budgetMin && budgetMax ? `${budgetMin}–${budgetMax}` : budgetMin
  const getPreviewLocation = () => mode === 'have' ? apartmentLocation : mode === 'need' ? preferredLocation : preferredAreas
  const getPreviewDescription = () => mode === 'have' ? apartmentDescription : mode === 'need' ? lookingFor || bio : bringToTable || bio
  const getModeBadgeText = () => mode === 'have' ? 'Has a place' : mode === 'need' ? 'Needs a roommate' : 'Let\'s search together'
  const getModeBadgeClass = () => mode === 'have' ? 'bg-like text-white' : mode === 'need' ? 'bg-brand text-white' : 'bg-[#2563eb] text-white'

  const input = 'w-full px-4 py-3.5 bg-white border border-border rounded-2xl text-ink text-[15px] placeholder:text-ink-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all'
  const label = 'block text-[13px] font-semibold text-ink mb-1.5'

  const slide = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  }

  const socialPlatforms = [
    { key: 'instagram' as const, icon: <InstagramIcon className="w-4 h-4" />, label: 'Instagram', val: instagram, set: setInstagram, ph: '@handle' },
    { key: 'tiktok' as const, icon: <TikTokIcon className="w-4 h-4" />, label: 'TikTok', val: tiktok, set: setTiktok, ph: '@handle' },
    { key: 'facebook' as const, icon: <FacebookIcon className="w-4 h-4" />, label: 'Facebook', val: facebook, set: setFacebook, ph: 'Profile URL or name' },
    { key: 'twitter' as const, icon: <XIcon className="w-4 h-4" />, label: 'X (Twitter)', val: twitter, set: setTwitter, ph: '@handle' },
  ]

  return (
    <div className="h-[100dvh] flex flex-col bg-cream">
      {/* Fixed Header */}
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5">
        <div className="max-w-sm mx-auto py-2">
          <AnimatePresence mode="wait" custom={direction}>

            {/* STEP 1: About You */}
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
                <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">The basics</h1>
                <p className="text-[14px] text-ink-tertiary mb-6">Just a few things to get started</p>

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
                <p className="text-[14px] text-ink-tertiary mb-6">Add at least 1 — first one is your main photo</p>

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
                <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">How do you want to find a roommate?</h1>
                <p className="text-[14px] text-ink-tertiary mb-6">Pick the option that fits your situation</p>

                <div className="space-y-3">
                  {([
                    { id: 'have' as Mode, icon: Home, title: 'I have a place', desc: 'You already have a room or apartment — find a compatible roommate to share it with' },
                    { id: 'need' as Mode, icon: Search, title: 'I need a roommate', desc: 'You\'re looking for someone who has a place that you can move in with' },
                    { id: 'together' as Mode, icon: Users, title: 'Let\'s find a place together', desc: 'Team up with someone and apartment-hunt as a pair' },
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
                        <p className="text-[13px] text-ink-tertiary leading-snug">{opt.desc}</p>
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
                    <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">Tell people about your place</h1>
                    <p className="text-[14px] text-ink-tertiary mb-6">So roommates know what to expect</p>

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
                        <label className={label}>Photos</label>
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
                      <div>
                        <label className={label}>Description</label>
                        <textarea value={apartmentDescription} onChange={(e) => setApartmentDescription(e.target.value)} placeholder="What's the space like? Furnished? Shared amenities?" rows={2} className={`${input} resize-none`} />
                      </div>
                    </div>
                  </>
                )}

                {mode === 'need' && (
                  <>
                    <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">What's your ideal situation?</h1>
                    <p className="text-[14px] text-ink-tertiary mb-6">So people with places know what you're looking for</p>

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
                        <label className={label}>Preferred area</label>
                        <input value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} placeholder="e.g. Yaba, Surulere" className={input} />
                      </div>
                      <div>
                        <label className={label}>Max distance to campus</label>
                        <div className="flex items-center gap-3">
                          <input type="range" min={0.5} max={10} step={0.5} value={distanceToCampus} onChange={(e) => setDistanceToCampus(parseFloat(e.target.value))} className="flex-1 accent-brand" />
                          <span className="text-[14px] font-semibold text-ink w-12 text-right">{distanceToCampus}km</span>
                        </div>
                      </div>
                      <div>
                        <label className={label}>What matters to you in a roommate?</label>
                        <textarea value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="e.g. Quiet, clean, same gender" rows={2} className={`${input} resize-none`} />
                      </div>
                    </div>
                  </>
                )}

                {mode === 'together' && (
                  <>
                    <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">What works for you?</h1>
                    <p className="text-[14px] text-ink-tertiary mb-6">So potential roommates know if you're a good fit</p>

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
                        <label className={label}>What do you bring as a roommate?</label>
                        <textarea value={bringToTable} onChange={(e) => setBringToTable(e.target.value)} placeholder="e.g. Neat, pay on time, good cook" rows={2} className={`${input} resize-none`} />
                      </div>
                    </div>
                  </>
                )}

                {/* Bio — required for all modes */}
                <div className="mt-5 pt-5 border-t border-border">
                  <label className={label}>About you <span className="text-brand">*</span></label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short intro — your hobbies, lifestyle, what makes you a great roommate" rows={3} className={`${input} resize-none`} />
                </div>
              </motion.div>
            )}

            {/* STEP 5: Contact & Socials */}
            {step === 5 && (
              <motion.div key="s5" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
                <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">How roommates can reach you</h1>
                <p className="text-[14px] text-ink-tertiary mb-6">These will show on your profile so people can connect with you</p>

                <div className="space-y-3">
                  {/* Phone — required, main input */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-ink-tertiary mb-0.5 block">Phone / WhatsApp <span className="text-brand">*</span></label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080..." className={`${input} !py-2.5`} />
                    </div>
                  </div>

                  {/* Email — auto from Google, read-only */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center flex-shrink-0">
                      <span className="text-[12px] font-bold text-ink-tertiary">@</span>
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-ink-tertiary mb-0.5 block">Email</label>
                      <input value={email} readOnly className={`${input} !py-2.5 bg-cream text-ink-secondary cursor-default`} />
                    </div>
                  </div>

                  {/* Toggled socials */}
                  {socialPlatforms.map((platform) => (
                    <div key={platform.key}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${socialToggles[platform.key] ? 'bg-brand' : 'bg-cream'}`}>
                          <span className={socialToggles[platform.key] ? 'text-white' : 'text-ink-secondary'}>{platform.icon}</span>
                        </div>
                        <span className="flex-1 text-[15px] font-medium text-ink">{platform.label}</span>
                        <button
                          onClick={() => toggleSocial(platform.key)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${socialToggles[platform.key] ? 'bg-brand' : 'bg-border'}`}
                        >
                          <motion.div
                            className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5"
                            animate={{ left: socialToggles[platform.key] ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                      <AnimatePresence>
                        {socialToggles[platform.key] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <input
                              value={platform.val}
                              onChange={(e) => platform.set(e.target.value)}
                              placeholder={platform.ph}
                              className={`${input} !py-2.5 mt-2 ml-[52px] w-[calc(100%-52px)]`}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 6: Preview + Submit */}
            {step === 6 && (
              <motion.div key="s6" custom={direction} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
                <h1 className="text-[22px] font-display font-bold text-ink tracking-[-0.04em] mb-1">Looks good?</h1>
                <p className="text-[14px] text-ink-tertiary mb-6">Here's how your profile will appear to other students</p>

                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
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

      {/* Fixed Bottom Bar */}
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
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Setting up your profile...</span></> : <span>All done — let's go</span>}
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
