import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { api } from '../lib/api'

interface OnboardingProps {
  user: any
  onNavigate: (page: string) => void
  onComplete: () => void
}

const Onboarding: React.FC<OnboardingProps> = ({ user, onNavigate, onComplete }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Personal Info
  const [name, setName] = useState(user?.name || '')
  const [institution, setInstitution] = useState('')
  const [matricNumber, setMatricNumber] = useState('')

  // Step 2: Profile Photo
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)

  // Step 3: Mode Selection
  const [mode, setMode] = useState<'have' | 'need' | null>(null)

  // Step 4: Listing Details (if mode === 'have')
  const [apartmentTitle, setApartmentTitle] = useState('')
  const [apartmentPrice, setApartmentPrice] = useState('')
  const [apartmentLocation, setApartmentLocation] = useState('')
  const [apartmentDescription, setApartmentDescription] = useState('')
  const [apartmentPhotos, setApartmentPhotos] = useState<string[]>([])
  const [apartmentPhotoFiles, setApartmentPhotoFiles] = useState<File[]>([])

  // Step 5: Preferences (if mode === 'need')
  const [budget, setBudget] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [distanceToCampus, setDistanceToCampus] = useState(2)

  // Step 6: Social Links
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [facebook, setFacebook] = useState('')
  const [twitter, setTwitter] = useState('')
  const [email, setEmail] = useState(user?.email || '')

  const nextStep = () => setStep(s => Math.min(s + 1, 6))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProfilePhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleApartmentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setApartmentPhotoFiles(prev => [...prev, ...newFiles])

    for (const file of newFiles) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setApartmentPhotos(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    }
  }

  const removeApartmentPhoto = (index: number) => {
    setApartmentPhotos(prev => prev.filter((_, i) => i !== index))
    setApartmentPhotoFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Upload profile photo
      let profilePhotoUrl = ''
      if (profilePhotoFile) {
        const uploadResult = await api.uploadImage(profilePhotoFile, `profile-${user.id}.jpg`)
        profilePhotoUrl = uploadResult.url
      }

      // Upload apartment photos
      const apartmentPhotoUrls: string[] = []
      if (apartmentPhotoFiles.length > 0) {
        for (let i = 0; i < apartmentPhotoFiles.length; i++) {
          const uploadResult = await api.uploadImage(apartmentPhotoFiles[i], `apartment-${user.id}-${i}.jpg`)
          apartmentPhotoUrls.push(uploadResult.url)
        }
      }

      // Update user profile
      const updatedUser = await api.updateUserProfile({
        name,
        institution,
        matric_number: matricNumber,
        profile_photo: profilePhotoUrl,
        mode,
        onboarding_complete: true,
        socials: {
          whatsapp,
          instagram,
          tiktok,
          facebook,
          twitter,
          email
        },
        budget: mode === 'need' ? budget : undefined,
        preferred_location: mode === 'need' ? preferredLocation : undefined,
        distance_to_campus: mode === 'need' ? distanceToCampus : undefined
      })

      // Create listing if mode === 'have'
      if (mode === 'have') {
        await api.createListing({
          title: apartmentTitle,
          price: apartmentPrice,
          location: apartmentLocation,
          description: apartmentDescription,
          photos: apartmentPhotoUrls
        })
      }

      onComplete()
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return name && institution && matricNumber
      case 2: return profilePhoto !== null
      case 3: return mode !== null
      case 4: return mode === 'need' || (apartmentTitle && apartmentPrice && apartmentLocation && apartmentPhotos.length > 0)
      case 5: return mode === 'have' || (budget && preferredLocation)
      case 6: return email
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">Step {step} of 6</span>
            <span className="text-sm text-ink-secondary">{Math.round((step / 6) * 100)}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand transition-all duration-300" 
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-display font-bold text-ink mb-6">Personal Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Institution</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="e.g., University of Lagos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Matric Number</label>
                  <input
                    type="text"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="Enter your matric number"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-display font-bold text-ink mb-6">Profile Photo</h2>
              
              <div className="flex flex-col items-center">
                {profilePhoto ? (
                  <div className="mb-4">
                    <img src={profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-brand" />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-border flex items-center justify-center mb-4">
                    <span className="text-ink-tertiary text-sm">No photo</span>
                  </div>
                )}

                <label className="cursor-pointer">
                  <span className="px-6 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors">
                    {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-display font-bold text-ink mb-6">What are you looking for?</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => setMode('have')}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    mode === 'have' 
                      ? 'border-brand bg-brand/5' 
                      : 'border-border hover:border-ink/20'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-ink mb-2">I have an apartment</h3>
                    <p className="text-sm text-ink-secondary">Looking for a roommate to share rent</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('need')}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    mode === 'need' 
                      ? 'border-brand bg-brand/5' 
                      : 'border-border hover:border-ink/20'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-ink mb-2">I need an apartment</h3>
                    <p className="text-sm text-ink-secondary">Looking for someone with an apartment</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && mode === 'have' && (
            <motion.div
              key="step4-have"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 shadow-sm max-h-[70vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-display font-bold text-ink mb-6">Apartment Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Title</label>
                  <input
                    type="text"
                    value={apartmentTitle}
                    onChange={(e) => setApartmentTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="e.g., Modern 2BR near UNILAG"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Price (₦/year)</label>
                  <input
                    type="text"
                    value={apartmentPrice}
                    onChange={(e) => setApartmentPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="e.g., 500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Location</label>
                  <input
                    type="text"
                    value={apartmentLocation}
                    onChange={(e) => setApartmentLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="e.g., Akoka, Yaba"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Description</label>
                  <textarea
                    value={apartmentDescription}
                    onChange={(e) => setApartmentDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand resize-none"
                    rows={3}
                    placeholder="Describe your apartment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Photos</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {apartmentPhotos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={photo} alt={`Apartment ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeApartmentPhoto(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors inline-block">
                      Add Photos
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleApartmentPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && mode === 'need' && (
            <motion.div
              key="step4-need"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-display font-bold text-ink mb-6">Your Preferences</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Budget (₦/year)</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="e.g., 300000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Preferred Location</label>
                  <input
                    type="text"
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="e.g., Yaba, Surulere"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Max Distance to Campus: {distanceToCampus} km
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={distanceToCampus}
                    onChange={(e) => setDistanceToCampus(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-ink-tertiary mt-1">
                    <span>0.5 km</span>
                    <span>10 km</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && mode === 'have' && (
            <motion.div
              key="step5-have"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-display font-bold text-ink mb-6">Social Links</h2>
              <p className="text-sm text-ink-secondary mb-4">Add your social media so potential roommates can contact you</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="+234 800 000 0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Instagram</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">TikTok (Optional)</label>
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Facebook (Optional)</label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="Facebook profile URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Twitter/X (Optional)</label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="@username"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && mode === 'need' && (
            <motion.div
              key="step5-need"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-display font-bold text-ink mb-6">Social Links</h2>
              <p className="text-sm text-ink-secondary mb-4">Add your social media so apartment owners can contact you</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="+234 800 000 0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Instagram</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-brand"
                    placeholder="@username"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-display font-bold text-ink mb-6">Review & Submit</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Name:</span>
                  <span className="text-ink font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Institution:</span>
                  <span className="text-ink font-medium">{institution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Mode:</span>
                  <span className="text-ink font-medium capitalize">{mode}</span>
                </div>
                {mode === 'have' && (
                  <div className="flex justify-between">
                    <span className="text-ink-secondary">Apartment:</span>
                    <span className="text-ink font-medium">{apartmentTitle}</span>
                  </div>
                )}
                {mode === 'need' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-ink-secondary">Budget:</span>
                      <span className="text-ink font-medium">₦{budget}/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-secondary">Location:</span>
                      <span className="text-ink font-medium">{preferredLocation}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 p-4 bg-brand/5 border border-brand/20 rounded-xl">
                <p className="text-sm text-ink">
                  <strong>Next step:</strong> After completing onboarding, you'll be able to browse listings and match with potential roommates. To view contact details, you'll need an active subscription (₦6,500/month).
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={prevStep}
              disabled={loading}
              className="flex-1 py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-cream/80 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              Back
            </button>
          )}
          
          {step < 6 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex-1 py-3 bg-ink text-cream rounded-xl font-semibold hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
              <Check className="w-5 h-5 inline ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
