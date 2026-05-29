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
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
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

  // Step 1: Personal Info
  const [name, setName] = useState(user?.name || '')
  const [institution, setInstitution] = useState('')
  const [matricNumber, setMatricNumber] = useState('')
  const [bio, setBio] = useState('')

  // Step 2: Profile Photos (multiple, up to 5)
  const [profilePhotos, setProfilePhotos] = useState<string[]>([]) // data URLs for preview
  const [profilePhotoFiles, setProfilePhotoFiles] = useState<File[]>([])
  const profileInputRef = useRef<HTMLInputElement>(null)

  // Step 3: Mode Selection
  const [mode, setMode] = useState<Mode | null>(null)

  // Step 4a: Apartment Details (mode === 'have')
  const [apartmentTitle, setApartmentTitle] = useState('')
  const [apartmentPrice, setApartmentPrice] = useState('')
  const [apartmentLocation, setApartmentLocation] = useState('')
  const [apartmentDescription, setApartmentDescription] = useState('')
  const [apartmentPhotos, setApartmentPhotos] = useState<string[]>([]) // data URLs
  const [apartmentPhotoFiles, setApartmentPhotoFiles] = useState<File[]>([])
  const apartmentInputRef = useRef<HTMLInputElement>(null)

  // Step 4b: Need Preferences (mode === 'need')
  const [budget, setBudget] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [distanceToCampus, setDistanceToCampus] = useState(2)
  const [lookingFor, setLookingFor] = useState('')

  // Step 4c: Together Preferences (mode === 'together')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [preferredAreas, setPreferredAreas] = useState('')
  const [bringToTable, setBringToTable] = useState('')

  // Step 5: Social Links (uniform across all modes)
  const [email, setEmail] = useState(user?.email || '')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [facebook, setFacebook] = useState('')
  const [twitter, setTwitter] = useState('')

  // Preview carousel
  const [previewCarouselIndex, setPreviewCarouselIndex] = useState(0)

  // Navigation
  const nextStep = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }
  const prevStep = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  // Profile photos handlers
  const handleProfilePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newFiles = Array.from(files)
    const remaining = 5 - profilePhotos.length
    const filesToAdd = newFiles.slice(0, remaining)

    filesToAdd.forEach((file) => {
      setProfilePhotoFiles((prev) => [...prev, file])
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhotos((prev) => {
          if (prev.length >= 5) return prev
          return [...prev, reader.result as string]
        })
      }
      reader.readAsDataURL(file)
    })
    // Reset input
    if (profileInputRef.current) profileInputRef.current.value = ''
  }

  const removeProfilePhoto = (index: number) => {
    setProfilePhotos((prev) => prev.filter((_, i) => i !== index))
    setProfilePhotoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Apartment photos handlers
  const handleApartmentPhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newFiles = Array.from(files)

    newFiles.forEach((file) => {
      setApartmentPhotoFiles((prev) => [...prev, file])
      const reader = new FileReader()
      reader.onloadend = () => {
        setApartmentPhotos((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
    if (apartmentInputRef.current) apartmentInputRef.current.value = ''
  }

  const removeApartmentPhoto = (index: number) => {
    setApartmentPhotos((prev) => prev.filter((_, i) => i !== index))
    setApartmentPhotoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Validation per step
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!(name.trim() && institution.trim() && matricNumber.trim() && bio.trim())
      case 2:
        return profilePhotos.length >= 1
      case 3:
        return mode !== null
      case 4:
        if (mode === 'have') {
          return !!(
            apartmentTitle.trim() &&
            apartmentPrice.trim() &&
            apartmentLocation.trim() &&
            apartmentPhotos.length > 0
          )
        }
        if (mode === 'need') {
          return !!(budget.trim() && preferredLocation.trim())
        }
        if (mode === 'together') {
          return !!(budgetMin.trim() && preferredAreas.trim())
        }
        return false
      case 5:
        return !!(email.trim())
      case 6:
        return true // preview/submit step
      default:
        return false
    }
  }

  // Submit handler
  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Upload profile photos
      const profilePhotoUrls: string[] = []
      for (let i = 0; i < profilePhotoFiles.length; i++) {
        const result = await api.uploadImage(
          profilePhotoFiles[i],
          `profile-${user.id}-${i}.jpg`
        )
        profilePhotoUrls.push(result.url)
      }
      const mainProfilePhoto = profilePhotoUrls[0] || null

      // Upload apartment photos (if 'have')
      const apartmentPhotoUrls: string[] = []
      if (mode === 'have') {
        for (let i = 0; i < apartmentPhotoFiles.length; i++) {
          const result = await api.uploadImage(
            apartmentPhotoFiles[i],
            `apartment-${user.id}-${i}.jpg`
          )
          apartmentPhotoUrls.push(result.url)
        }
      }

      // Build profile update
      const profileData: Record<string, any> = {
        name: name.trim(),
        institution: institution.trim(),
        matric_number: matricNumber.trim(),
        bio: bio.trim(),
        profile_photo: mainProfilePhoto,
        profile_photos: profilePhotoUrls,
        mode,
        onboarding_complete: true,
        socials: {
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
          facebook: facebook.trim(),
          twitter: twitter.trim(),
        },
      }

      if (mode === 'need' || mode === 'together') {
        profileData.budget = mode === 'need' ? budget : `${budgetMin}-${budgetMax}`
        profileData.preferred_location =
          mode === 'need' ? preferredLocation : preferredAreas
        if (mode === 'need') {
          profileData.distance_to_campus = distanceToCampus
        }
      }

      await api.updateUserProfile(profileData)

      // Create listing
      if (mode === 'have') {
        await api.createListing({
          mode: 'have',
          title: apartmentTitle.trim(),
          price: apartmentPrice.trim(),
          location: apartmentLocation.trim(),
          description: apartmentDescription.trim(),
          photos: apartmentPhotoUrls,
          apartment_title: apartmentTitle.trim(),
          apartment_price: apartmentPrice.trim(),
          apartment_location: apartmentLocation.trim(),
          apartment_description: apartmentDescription.trim(),
          apartment_photos: apartmentPhotoUrls,
        } as any)
      } else if (mode === 'need') {
        await api.createListing({
          mode: 'need',
          title: `${name.trim()} is looking for an apartment`,
          price: budget.trim(),
          location: preferredLocation.trim(),
          description: lookingFor.trim() || `Budget: ₦${budget}/yr, Preferred: ${preferredLocation}`,
          photos: profilePhotoUrls,
          distance_to_campus: distanceToCampus,
        } as any)
      } else if (mode === 'together') {
        await api.createListing({
          mode: 'together' as any,
          title: `${name.trim()} is looking for a roommate`,
          price: `${budgetMin}-${budgetMax}`,
          location: preferredAreas.trim(),
          description:
            bringToTable.trim() || `Budget: ₦${budgetMin}-₦${budgetMax}, Areas: ${preferredAreas}`,
          photos: profilePhotoUrls,
        } as any)
      }

      onComplete()
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Get preview data
  const getPreviewPhotos = (): string[] => {
    if (mode === 'have') return apartmentPhotos
    return profilePhotos
  }

  const getPreviewTitle = (): string => {
    if (mode === 'have') return apartmentTitle || 'Apartment Listing'
    if (mode === 'need') return `${name.trim() || 'User'} is looking for an apartment`
    return `${name.trim() || 'User'} is looking for a roommate`
  }

  const getPreviewPrice = (): string => {
    if (mode === 'have') return apartmentPrice
    if (mode === 'need') return budget
    if (budgetMin && budgetMax) return `${budgetMin}-${budgetMax}`
    return budgetMin
  }

  const getPreviewLocation = (): string => {
    if (mode === 'have') return apartmentLocation
    if (mode === 'need') return preferredLocation
    return preferredAreas
  }

  const getPreviewDescription = (): string => {
    if (mode === 'have') return apartmentDescription
    if (mode === 'need') return lookingFor || bio
    return bringToTable || bio
  }

  const getModeBadgeText = (): string => {
    if (mode === 'have') return 'Has Apartment'
    if (mode === 'need') return 'Needs Apartment'
    return 'Looking Together'
  }

  const getModeBadgeClass = (): string => {
    if (mode === 'have') return 'bg-like text-white'
    if (mode === 'need') return 'bg-brand text-white'
    return 'bg-[#2563eb] text-white'
  }

  // Input style helper
  const inputClass =
    'w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all'

  const labelClass = 'block text-sm font-semibold text-ink mb-2'

  // Slide variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-ink tracking-[-0.04em]">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-sm font-semibold text-ink-secondary">
              {Math.round((step / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand rounded-full"
              initial={false}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Something went wrong</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pb-4">
          <AnimatePresence mode="wait" custom={direction}>
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-surface rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-display font-bold text-ink tracking-[-0.04em] mb-1">
                  Personal Info
                </h2>
                <p className="text-sm text-ink-secondary mb-6">
                  Tell us a bit about yourself
                </p>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Institution *</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., University of Lagos"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Matric Number *</label>
                    <input
                      type="text"
                      value={matricNumber}
                      onChange={(e) => setMatricNumber(e.target.value)}
                      className={inputClass}
                      placeholder="Enter your matric number"
                    />
                    {!matricNumber.trim() && step === 1 && (
                      <p className="text-xs text-brand mt-1.5 font-medium">
                        Required — you cannot proceed without this
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Tell potential roommates about yourself *
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={`${inputClass} resize-none`}
                      rows={4}
                      placeholder="What's your lifestyle like? Are you a night owl? Do you cook? What are your hobbies?"
                    />
                    <p className="text-xs text-ink-tertiary mt-1">
                      {bio.length}/300 characters
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Profile Photos */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-surface rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-display font-bold text-ink tracking-[-0.04em] mb-1">
                  Profile Photos
                </h2>
                <p className="text-sm text-ink-secondary mb-6">
                  Add up to 5 photos. The first one is your main photo.
                </p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {profilePhotos.map((photo, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden border border-border"
                    >
                      <img
                        src={photo}
                        alt={`Profile ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {i === 0 && (
                        <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-brand text-white text-[10px] font-bold rounded-full">
                          Main
                        </div>
                      )}
                      <button
                        onClick={() => removeProfilePhoto(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-ink/70 text-white rounded-full flex items-center justify-center hover:bg-ink transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {profilePhotos.length < 5 && (
                    <label className="cursor-pointer">
                      <div className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-brand hover:bg-brand/5 transition-all">
                        <Plus className="w-6 h-6 text-ink-tertiary mb-1" />
                        <span className="text-xs text-ink-tertiary font-medium">Add</span>
                      </div>
                      <input
                        ref={profileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleProfilePhotoAdd}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-xs text-ink-tertiary text-center">
                  {profilePhotos.length}/5 photos added
                </p>
              </motion.div>
            )}

            {/* STEP 3: Mode Selection */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-surface rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-display font-bold text-ink tracking-[-0.04em] mb-1">
                  What are you looking for?
                </h2>
                <p className="text-sm text-ink-secondary mb-6">
                  Choose how you'd like to use CoRenty
                </p>

                <div className="space-y-3">
                  {([
                    {
                      value: 'have' as Mode,
                      icon: Home,
                      title: 'I have an apartment',
                      desc: 'Looking for a roommate to share rent and split costs',
                    },
                    {
                      value: 'need' as Mode,
                      icon: Search,
                      title: 'I need an apartment',
                      desc: 'Looking for someone who already has a place',
                    },
                    {
                      value: 'together' as Mode,
                      icon: Users,
                      title: 'Search together',
                      desc: "Find someone to apartment-hunt with and split everything",
                    },
                  ]).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMode(option.value)}
                      className={`w-full p-5 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                        mode === option.value
                          ? 'border-brand bg-brand/5 shadow-sm'
                          : 'border-border hover:border-ink/20'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          mode === option.value
                            ? 'bg-brand text-white'
                            : 'bg-cream text-ink-secondary'
                        }`}
                      >
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-ink tracking-[-0.02em]">
                          {option.title}
                        </h3>
                        <p className="text-sm text-ink-secondary mt-0.5">
                          {option.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Details per mode */}
            {step === 4 && mode === 'have' && (
              <motion.div
                key="step4-have"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-surface rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-display font-bold text-ink tracking-[-0.04em] mb-1">
                  Apartment Details
                </h2>
                <p className="text-sm text-ink-secondary mb-6">
                  Tell others about your apartment
                </p>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Title *</label>
                    <input
                      type="text"
                      value={apartmentTitle}
                      onChange={(e) => setApartmentTitle(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., Modern 2BR near UNILAG"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Price (₦/year) *</label>
                    <input
                      type="text"
                      value={apartmentPrice}
                      onChange={(e) => setApartmentPrice(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., 500000"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Location *</label>
                    <input
                      type="text"
                      value={apartmentLocation}
                      onChange={(e) => setApartmentLocation(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., Akoka, Yaba"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      value={apartmentDescription}
                      onChange={(e) => setApartmentDescription(e.target.value)}
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder="Describe your apartment, amenities, house rules..."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Apartment Photos *</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {apartmentPhotos.map((photo, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-lg overflow-hidden"
                        >
                          <img
                            src={photo}
                            alt={`Apartment ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeApartmentPhoto(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-ink/70 text-white rounded-full flex items-center justify-center hover:bg-ink transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="cursor-pointer">
                        <div className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-brand hover:bg-brand/5 transition-all">
                          <Plus className="w-5 h-5 text-ink-tertiary" />
                        </div>
                        <input
                          ref={apartmentInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleApartmentPhotoAdd}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && mode === 'need' && (
              <motion.div
                key="step4-need"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-surface rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-display font-bold text-ink tracking-[-0.04em] mb-1">
                  Your Preferences
                </h2>
                <p className="text-sm text-ink-secondary mb-6">
                  What kind of apartment are you looking for?
                </p>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Budget (₦/year) *</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., 300000"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Preferred Location *</label>
                    <input
                      type="text"
                      value={preferredLocation}
                      onChange={(e) => setPreferredLocation(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., Yaba, Surulere"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Max Distance to Campus: {distanceToCampus} km
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={distanceToCampus}
                      onChange={(e) =>
                        setDistanceToCampus(parseFloat(e.target.value))
                      }
                      className="w-full accent-brand"
                    />
                    <div className="flex justify-between text-xs text-ink-tertiary mt-1">
                      <span>0.5 km</span>
                      <span>10 km</span>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>What are you looking for?</label>
                    <textarea
                      value={lookingFor}
                      onChange={(e) => setLookingFor(e.target.value)}
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder="Describe your ideal apartment and roommate..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && mode === 'together' && (
              <motion.div
                key="step4-together"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-surface rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-display font-bold text-ink tracking-[-0.04em] mb-1">
                  Apartment Search
                </h2>
                <p className="text-sm text-ink-secondary mb-6">
                  Find someone to apartment-hunt with
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Min Budget (₦) *</label>
                      <input
                        type="text"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className={inputClass}
                        placeholder="200000"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Max Budget (₦)</label>
                      <input
                        type="text"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className={inputClass}
                        placeholder="500000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Preferred Areas *</label>
                    <input
                      type="text"
                      value={preferredAreas}
                      onChange={(e) => setPreferredAreas(e.target.value)}
                      className={inputClass}
                      placeholder="e.g., Yaba, Akoka, Surulere"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      What do you bring to the table?
                    </label>
                    <textarea
                      value={bringToTable}
                      onChange={(e) => setBringToTable(e.target.value)}
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder="What qualities do you bring as a roommate? Clean, reliable, quiet..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Social Links */}
            {step === 5 && (
              <motion.div
                key="step5"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-surface rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-display font-bold text-ink tracking-[-0.04em] mb-1">
                  Social Links
                </h2>
                <p className="text-sm text-ink-secondary mb-6">
                  How can potential roommates reach you?
                </p>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>WhatsApp</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <WhatsAppIcon size={18} />
                      </div>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Instagram</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <InstagramIcon size={18} />
                      </div>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>TikTok</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <TikTokIcon size={18} />
                      </div>
                      <input
                        type="text"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Facebook</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <FacebookIcon size={18} />
                      </div>
                      <input
                        type="text"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="Profile URL or username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Twitter / X</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <XIcon size={18} />
                      </div>
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className={`${inputClass} pl-10`}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Preview + Submit */}
            {step === 6 && (
              <motion.div
                key="step6"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 className="text-2xl font-display font-bold text-ink tracking-[-0.04em] mb-1">
                  Preview Your Listing
                </h2>
                <p className="text-sm text-ink-secondary mb-6">
                  This is how others will see your listing
                </p>

                {/* Preview Card — matches Dashboard exactly */}
                <div className="bg-surface rounded-3xl shadow-lg overflow-hidden">
                  {/* Image Section */}
                  <div className="relative aspect-[4/3] bg-border">
                    {getPreviewPhotos().length > 0 ? (
                      <img
                        src={getPreviewPhotos()[previewCarouselIndex]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-16 h-16 text-ink-tertiary" />
                      </div>
                    )}

                    {/* Carousel controls */}
                    {getPreviewPhotos().length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setPreviewCarouselIndex((prev) =>
                              prev === 0
                                ? getPreviewPhotos().length - 1
                                : prev - 1
                            )
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-ink/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-ink/60 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setPreviewCarouselIndex((prev) =>
                              prev === getPreviewPhotos().length - 1
                                ? 0
                                : prev + 1
                            )
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-ink/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-ink/60 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {getPreviewPhotos().map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                i === previewCarouselIndex
                                  ? 'bg-white w-4'
                                  : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Mode Badge */}
                    <div className="absolute top-4 left-4">
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${getModeBadgeClass()}`}
                      >
                        {getModeBadgeText()}
                      </div>
                    </div>

                    {/* Price Badge */}
                    {getPreviewPrice() && (
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-1.5 bg-ink/90 backdrop-blur-sm rounded-full text-xs font-bold text-cream">
                          ₦{getPreviewPrice()}/yr
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className="text-xl font-display font-bold text-ink mb-1">
                          {getPreviewTitle()}
                        </h2>
                        <div className="flex items-center gap-1 text-ink-secondary text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{getPreviewLocation()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-cream rounded-xl w-full">
                      <div className="relative">
                        {profilePhotos[0] ? (
                          <img
                            src={profilePhotos[0]}
                            alt={name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center">
                            <User className="w-6 h-6 text-ink-tertiary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-ink">{name}</p>
                        <p className="text-sm text-ink-secondary">
                          {institution}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-ink-tertiary" />
                    </div>

                    {/* Description Preview */}
                    {getPreviewDescription() && (
                      <p className="text-ink-secondary text-sm mb-4 line-clamp-2">
                        {getPreviewDescription()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-6 py-4 bg-brand text-white rounded-xl font-bold text-base tracking-[-0.02em] hover:bg-brand/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Onboarding</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons (not on last step) */}
        {step < TOTAL_STEPS && (
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && (
              <motion.button
                onClick={prevStep}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3.5 bg-surface border border-border text-ink rounded-xl font-semibold hover:bg-cream transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>
            )}
            <motion.button
              onClick={nextStep}
              disabled={!canProceed()}
              whileTap={{ scale: canProceed() ? 0.95 : 1 }}
              className="flex-1 py-3.5 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>{step === TOTAL_STEPS - 1 ? 'Preview' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Onboarding
/usr/bin/bash: line 5: /Users/H-P/.hermes-zechy/cache/terminal/hermes-snap-e8ebb525b9aa.sh: No such file or directory
/usr/bin/bash: line 6: /Users/H-P/.hermes-zechy/cache/terminal/hermes-cwd-e8ebb525b9aa.txt: No such file or directory
/usr/bin/bash: line 5: /Users/H-P/.hermes-zechy/cache/terminal/hermes-snap-e8ebb525b9aa.sh: No such file or directory
/usr/bin/bash: line 6: /Users/H-P/.hermes-zechy/cache/terminal/hermes-cwd-e8ebb525b9aa.txt: No such file or directory
