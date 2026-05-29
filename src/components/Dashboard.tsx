import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Heart, X, MapPin, Home, Sparkles, LogOut, Settings, User, ChevronRight,
  ChevronLeft, Edit3, Shield, RefreshCw, Star, MessageSquare, Trash2,
  AlertTriangle, DollarSign, Search, BookOpen, HelpCircle, Bell,
  CreditCard, Instagram, Facebook, Twitter, Phone, Mail, Award, Share2
} from 'lucide-react'
import { TikTokIcon, WhatsAppIcon } from './BrandIcons'
import { api, Listing, Match } from '../lib/api'

interface DashboardProps {
  user: any
  onNavigate: (page: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showMatchPopup, setShowMatchPopup] = useState(false)
  const [matchedListing, setMatchedListing] = useState<Listing | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [sidebarPanel, setSidebarPanel] = useState<string | null>(null)
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [freshUser, setFreshUser] = useState(user)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackCategory, setFeedbackCategory] = useState('general')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [editBio, setEditBio] = useState(user?.bio || '')
  const [editInstitution, setEditInstitution] = useState(user?.institution || '')
  const [editMatric, setEditMatric] = useState(user?.matric_number || '')
  const [editBudget, setEditBudget] = useState(user?.budget || '')
  const [editArea, setEditArea] = useState(user?.preferred_area || user?.preferred_location || '')
  const [editDistance, setEditDistance] = useState(user?.distance_to_campus || 2)
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [profileCarousel, setProfileCarousel] = useState(0)
  const [detailCarousel, setDetailCarousel] = useState(0)

  useEffect(() => { loadListings() }, [])

  async function loadListings() {
    try {
      const data = await api.getListings()
      setListings(data)
    } catch (error) {
      console.error('Failed to load listings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMyListings() {
    try {
      const data = await api.getMyListings()
      setMyListings(data)
    } catch (error) {
      console.error('Failed to load my listings:', error)
    }
  }

  async function loadMatches() {
    try {
      const data = await api.getMatches()
      setMatches(data)
    } catch (error) {
      console.error('Failed to load matches:', error)
    }
  }

  async function loadFreshUser() {
    try {
      const u = await api.getCurrentUser()
      setFreshUser(u)
      setEditName(u.name || '')
      setEditBio(u.bio || '')
      setEditInstitution(u.institution || '')
      setEditMatric(u.matric_number || '')
      setEditBudget(u.budget || '')
      setEditArea(u.preferred_area || u.preferred_location || '')
      setEditDistance(u.distance_to_campus || 2)
    } catch (e) { /* ignore */ }
  }

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= listings.length) return
    const listing = listings[currentIndex]
    if (direction === 'right') {
      try {
        const result = await api.createMatch(listing.id)
        if (result.matched) {
          setMatchedListing(listing)
          setShowMatchPopup(true)
        }
      } catch (error) {
        console.error('Failed to create match:', error)
      }
    }
    setCurrentIndex(prev => prev + 1)
  }

  const handleSignOut = () => {
    document.cookie = 'auth_token=; Max-Age=0; path=/'
    onNavigate('landing')
  }

  const handleResetSwipes = () => setCurrentIndex(0)

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setSaveSuccess(false)
    try {
      await api.updateUserProfile({
        name: editName, bio: editBio, institution: editInstitution,
        matric_number: editMatric, budget: editBudget,
        preferred_area: editArea, distance_to_campus: editDistance,
      })
      setSaveSuccess(true)
      await loadFreshUser()
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    try {
      await api.deleteAccount()
      document.cookie = 'auth_token=; Max-Age=0; path=/'
      onNavigate('landing')
    } catch (error) {
      console.error('Failed to delete account:', error)
      setDeleting(false)
    }
  }

  const handleSubmitFeedback = async () => {
    setFeedbackSubmitting(true)
    try {
      await api.submitFeedback({ rating: feedbackRating, message: feedbackMessage, category: feedbackCategory })
      setFeedbackDone(true)
    } catch (error) {
      console.error('Feedback error:', error)
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  const openPanel = (panel: string) => {
    setSidebarPanel(panel)
    if (panel === 'listings') loadMyListings()
    if (panel === 'matches') loadMatches()
    if (panel === 'settings' || panel === 'profile') loadFreshUser()
  }

  const closePanel = () => {
    setSidebarPanel(null)
    setDeleteConfirm('')
    setFeedbackDone(false)
    setFeedbackMessage('')
    setFeedbackRating(5)
    setFeedbackCategory('general')
  }

  const currentListing = listings[currentIndex]

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-ink text-lg font-display">Loading listings...</div>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-brand" />
          </div>
          <h2 className="text-2xl font-display font-bold text-ink mb-3 tracking-[-0.03em]">Your listing is live!</h2>
          <p className="text-ink-secondary mb-4 leading-relaxed">
            You're the first one here. Your profile is visible to other students — they can see you and match with you when they join.
          </p>
          <div className="p-4 bg-cream rounded-2xl mb-6 text-left">
            <p className="text-[13px] text-ink-tertiary mb-2 font-semibold">What happens next:</p>
            <ul className="space-y-2 text-sm text-ink-secondary">
              <li className="flex items-start gap-2">
                <span className="text-brand font-bold">•</span>
                <span>When new people join, you'll see their listings here</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand font-bold">•</span>
                <span>Swipe right to match with them</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand font-bold">•</span>
                <span>Share CoRenty with friends to get matches faster</span>
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowSidebar(true); setSidebarPanel('listings') }}
              className="flex-1 py-4 bg-white border-2 border-border text-ink rounded-2xl font-bold text-[15px] tracking-[-0.02em] hover:border-ink/20 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>My Listing</span>
            </button>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText('https://corenty-v2.vercel.app')
                  alert('Link copied! Share it with friends.')
                } catch { /* ignore */ }
              }}
              className="flex-1 py-4 bg-brand text-white rounded-2xl font-bold text-[15px] tracking-[-0.02em] hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentIndex >= listings.length) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-like/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-like" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-display font-bold text-ink mb-3 tracking-[-0.03em]">That's everyone for now</h2>
          <p className="text-ink-secondary mb-2 leading-relaxed">
            You've seen all current listings. Your profile is live — others can find you and swipe on your listing too.
          </p>
          <p className="text-[13px] text-ink-tertiary mb-6">
            New people join every day. Come back soon or browse again.
          </p>
          <div className="flex items-center gap-3">
            <button onClick={handleResetSwipes} className="flex-1 py-4 bg-white border-2 border-border text-ink rounded-2xl font-bold text-[15px] tracking-[-0.02em] hover:border-ink/20 transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Browse again</span>
            </button>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText('https://corenty-v2.vercel.app')
                  alert('Link copied! Share it with friends.')
                } catch { /* ignore */ }
              }}
              className="flex-1 py-4 bg-brand text-white rounded-2xl font-bold text-[15px] tracking-[-0.02em] hover:bg-brand/90 transition-colors"
            >
              Invite friends
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getModeBadge = (mode: string) => {
    if (mode === 'have') return { text: 'Has Apartment', cls: 'bg-like text-white' }
    if (mode === 'together') return { text: 'Looking Together', cls: 'bg-[#2563eb] text-white' }
    return { text: 'Needs Apartment', cls: 'bg-brand text-white' }
  }

  const input = 'w-full px-4 py-3 bg-white border border-border rounded-2xl text-ink text-[15px] placeholder:text-ink-tertiary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all'
  const label = 'block text-[13px] font-semibold text-ink mb-1.5'

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[10px] bg-ink flex items-center justify-center">
              <Home className="w-4 h-4 text-cream" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-display font-bold tracking-[-0.03em] text-ink">CoRenty</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowSidebar(true); setSidebarPanel(null) }} className="w-9 h-9 rounded-lg bg-cream border border-border flex items-center justify-center hover:border-ink/20 transition-colors">
              <div className="grid grid-cols-3 gap-[3px]">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-[3px] h-[3px] rounded-full bg-ink" />
                ))}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="bg-surface rounded-3xl shadow-lg overflow-hidden"
          >
            <div className="relative aspect-[4/3] bg-border">
              {currentListing.photos && currentListing.photos.length > 0 ? (
                <img src={currentListing.photos[0]} alt={currentListing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-16 h-16 text-ink-tertiary" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${getModeBadge(currentListing.mode).cls}`}>
                  {getModeBadge(currentListing.mode).text}
                </div>
              </div>
              {currentListing.price && (
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1.5 bg-ink/90 backdrop-blur-sm rounded-full text-xs font-bold text-cream">
                    ₦{currentListing.price}/yr
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-display font-bold text-ink mb-1">{currentListing.title}</h2>
                  <div className="flex items-center gap-1 text-ink-secondary text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{currentListing.location}</span>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 mb-4 p-3 bg-cream rounded-xl hover:bg-border transition-colors w-full">
                <div className="relative">
                  {currentListing.u_photo ? (
                    <img src={currentListing.u_photo} alt={currentListing.u_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center">
                      <User className="w-6 h-6 text-ink-tertiary" />
                    </div>
                  )}
                  {currentListing.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1DA1F2] rounded-full flex items-center justify-center border-2 border-surface">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-ink">{currentListing.u_name}</p>
                  <p className="text-sm text-ink-secondary">{currentListing.institution}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-tertiary" />
              </button>

              {currentListing.description && (
                <p className="text-ink-secondary text-sm mb-4 line-clamp-2">{currentListing.description}</p>
              )}

              <button onClick={() => setShowDetailModal(true)} className="w-full py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-border transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 flex items-center justify-center gap-4">
          <button onClick={() => handleSwipe('left')} className="w-16 h-16 rounded-full bg-surface border-2 border-nope/20 flex items-center justify-center shadow-lg hover:border-nope/40 transition-all active:scale-95">
            <X className="w-7 h-7 text-nope" strokeWidth={2.5} />
          </button>
          <button onClick={() => handleSwipe('right')} className="w-16 h-16 rounded-full bg-like flex items-center justify-center shadow-lg shadow-like/30 hover:shadow-xl transition-all active:scale-95">
            <Heart className="w-7 h-7 text-white" strokeWidth={2.5} fill="white" />
          </button>
        </div>
      </div>

      {/* PROFILE MODAL */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileModal(false)} className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-surface rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto">
              <div className="p-6">
                <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-border">
                  {(currentListing.u_photos && currentListing.u_photos.length > 0) ? (
                    <>
                      <img src={currentListing.u_photos[profileCarousel]} alt="" className="w-full h-full object-cover" />
                      {currentListing.u_photos.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-2">
                          <button onClick={() => setProfileCarousel(i => (i - 1 + currentListing.u_photos.length) % currentListing.u_photos.length)} className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <ChevronLeft className="w-4 h-4 text-ink" />
                          </button>
                          <button onClick={() => setProfileCarousel(i => (i + 1) % currentListing.u_photos.length)} className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <ChevronRight className="w-4 h-4 text-ink" />
                          </button>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {currentListing.u_photos.map((_: any, i: number) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i === profileCarousel ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    </>
                  ) : currentListing.u_photo ? (
                    <img src={currentListing.u_photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><User className="w-16 h-16 text-ink-tertiary" /></div>
                  )}
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-display font-bold text-ink mb-1">{currentListing.u_name}</h3>
                  <p className="text-ink-secondary">{currentListing.institution}</p>
                  {currentListing.matric_number && (
                    <p className="text-[13px] text-ink-tertiary mt-1">Matric: {currentListing.matric_number}</p>
                  )}
                  {currentListing.verified && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <div className="w-4 h-4 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      </div>
                      <span className="text-xs font-semibold text-ink">Verified Student</span>
                    </div>
                  )}
                </div>

                {currentListing.u_bio && (
                  <div className="mb-6">
                    <h4 className="text-[13px] font-semibold text-ink-tertiary mb-2 uppercase tracking-wider">About</h4>
                    <p className="text-ink-secondary text-sm leading-relaxed">{currentListing.u_bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {currentListing.u_mode && (
                    <div className="p-3 bg-cream rounded-xl">
                      <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Looking for</p>
                      <p className="text-sm font-semibold text-ink">{currentListing.u_mode === 'have' ? 'Roommate' : currentListing.u_mode === 'need' ? 'Apartment' : 'Roommate + Place'}</p>
                    </div>
                  )}
                  {currentListing.u_budget && (
                    <div className="p-3 bg-cream rounded-xl">
                      <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Budget</p>
                      <p className="text-sm font-semibold text-ink">₦{currentListing.u_budget}/yr</p>
                    </div>
                  )}
                  {currentListing.u_preferred_area && (
                    <div className="p-3 bg-cream rounded-xl">
                      <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Area</p>
                      <p className="text-sm font-semibold text-ink">{currentListing.u_preferred_area}</p>
                    </div>
                  )}
                </div>

                {currentListing.u_socials && Object.keys(currentListing.u_socials).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[13px] font-semibold text-ink-tertiary mb-3 uppercase tracking-wider">Connect</h4>
                    <div className="space-y-2">
                      {currentListing.u_socials.email && (
                        <div className="flex items-center gap-3 p-2.5 bg-cream rounded-xl">
                          <Mail className="w-4 h-4 text-ink-tertiary" />
                          <span className="text-sm text-ink truncate">{currentListing.u_socials.email}</span>
                        </div>
                      )}
                      {currentListing.u_socials.whatsapp && (
                        <div className="flex items-center gap-3 p-2.5 bg-cream rounded-xl">
                          <WhatsAppIcon className="w-4 h-4 text-ink-tertiary" />
                          <span className="text-sm text-ink">{currentListing.u_socials.whatsapp}</span>
                        </div>
                      )}
                      {currentListing.u_socials.instagram && (
                        <div className="flex items-center gap-3 p-2.5 bg-cream rounded-xl">
                          <Instagram className="w-4 h-4 text-ink-tertiary" />
                          <span className="text-sm text-ink">{currentListing.u_socials.instagram}</span>
                        </div>
                      )}
                      {currentListing.u_socials.tiktok && (
                        <div className="flex items-center gap-3 p-2.5 bg-cream rounded-xl">
                          <TikTokIcon className="w-4 h-4 text-ink-tertiary" />
                          <span className="text-sm text-ink">{currentListing.u_socials.tiktok}</span>
                        </div>
                      )}
                      {currentListing.u_socials.facebook && (
                        <div className="flex items-center gap-3 p-2.5 bg-cream rounded-xl">
                          <Facebook className="w-4 h-4 text-ink-tertiary" />
                          <span className="text-sm text-ink">{currentListing.u_socials.facebook}</span>
                        </div>
                      )}
                      {currentListing.u_socials.twitter && (
                        <div className="flex items-center gap-3 p-2.5 bg-cream rounded-xl">
                          <Twitter className="w-4 h-4 text-ink-tertiary" />
                          <span className="text-sm text-ink">{currentListing.u_socials.twitter}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button onClick={() => { setShowProfileModal(false); setProfileCarousel(0) }} className="w-full py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-border transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-surface rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto">
              <div className="p-6">
                <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />
                {(() => {
                  const photos = currentListing.mode === 'have'
                    ? (currentListing.apartment_photos?.length ? currentListing.apartment_photos : currentListing.photos)
                    : currentListing.photos
                  if (photos && photos.length > 0) {
                    return (
                      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-border">
                        <img src={photos[detailCarousel]} alt="" className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-between px-2">
                            <button onClick={() => setDetailCarousel(i => (i - 1 + photos.length) % photos.length)} className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <ChevronLeft className="w-4 h-4 text-ink" />
                            </button>
                            <button onClick={() => setDetailCarousel(i => (i + 1) % photos.length)} className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <ChevronRight className="w-4 h-4 text-ink" />
                            </button>
                          </div>
                        )}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {photos.map((_: any, i: number) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i === detailCarousel ? 'bg-white' : 'bg-white/40'}`} />
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}

                <h3 className="text-2xl font-display font-bold text-ink mb-2">{currentListing.title}</h3>
                <div className="flex items-center gap-4 text-sm text-ink-secondary mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{currentListing.location}</span>
                  </div>
                  {currentListing.price && (
                    <div className="font-semibold text-ink">₦{currentListing.price}/yr</div>
                  )}
                </div>

                {currentListing.distance_to_campus && (
                  <div className="flex items-center gap-2 p-3 bg-cream rounded-xl mb-4">
                    <Search className="w-4 h-4 text-ink-tertiary" />
                    <span className="text-sm text-ink">{currentListing.distance_to_campus}km from campus</span>
                  </div>
                )}

                {currentListing.description && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-ink mb-2">Description</h4>
                    <p className="text-ink-secondary text-sm whitespace-pre-line leading-relaxed">{currentListing.description}</p>
                  </div>
                )}

                <div className="p-4 bg-cream rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    {currentListing.u_photo ? (
                      <img src={currentListing.u_photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center"><User className="w-5 h-5 text-ink-tertiary" /></div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{currentListing.u_name}</p>
                      <p className="text-[12px] text-ink-tertiary">{currentListing.institution}</p>
                    </div>
                    {currentListing.verified && <Shield className="w-4 h-4 text-[#1DA1F2]" />}
                  </div>
                </div>

                <button onClick={() => { setShowDetailModal(false); setDetailCarousel(0) }} className="w-full py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-border transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MATCH POPUP */}
      <AnimatePresence>
        {showMatchPopup && matchedListing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-surface rounded-3xl w-full max-w-md p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-like to-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-ink mb-2">It's a Match!</h2>
              <p className="text-ink-secondary mb-6">You and {matchedListing.u_name} are interested in each other.</p>
              <div className="bg-cream rounded-2xl p-4 mb-6">
                <p className="text-sm text-ink-secondary mb-3">Subscribe to view contact details</p>
                <button
                  onClick={async () => {
                    try { const { authorization_url } = await api.initializeSubscription(); window.location.href = authorization_url }
                    catch (error) { console.error('Failed to initialize subscription:', error) }
                  }}
                  className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors"
                >
                  Subscribe - ₦6,500/month
                </button>
              </div>
              <button onClick={() => setShowMatchPopup(false)} className="w-full py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-border transition-colors">
                Continue Swiping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowSidebar(false); closePanel() }} className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-surface shadow-2xl overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold text-ink">
                    {sidebarPanel === 'profile' ? 'My Profile' :
                     sidebarPanel === 'listings' ? 'My Listings' :
                     sidebarPanel === 'matches' ? 'My Matches' :
                     sidebarPanel === 'prefs' ? 'Search Preferences' :
                     sidebarPanel === 'settings' ? 'Settings' :
                     sidebarPanel === 'feedback' ? 'Feedback' :
                     sidebarPanel === 'delete' ? 'Delete Account' : 'Menu'}
                  </h3>
                  <button onClick={() => { sidebarPanel ? closePanel() : setShowSidebar(false) }} className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center hover:bg-border transition-colors">
                    {sidebarPanel ? <ChevronLeft className="w-5 h-5 text-ink" /> : <X className="w-5 h-5 text-ink" />}
                  </button>
                </div>

                {!sidebarPanel && (
                  <>
                    <div className="flex items-center gap-3 mb-6 p-4 bg-cream rounded-2xl">
                      {freshUser.profile_photo ? (
                        <img src={freshUser.profile_photo} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center"><User className="w-6 h-6 text-ink-tertiary" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink truncate">{freshUser.name}</p>
                        <p className="text-sm text-ink-secondary truncate">{freshUser.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {[
                        { icon: User, label: 'My Profile', panel: 'profile' },
                        { icon: BookOpen, label: 'My Listings', panel: 'listings' },
                        { icon: Heart, label: 'My Matches', panel: 'matches' },
                        { icon: Search, label: 'Search Preferences', panel: 'prefs' },
                        { icon: Settings, label: 'Settings', panel: 'settings' },
                        { icon: MessageSquare, label: 'Help & Feedback', panel: 'feedback' },
                      ].map((item) => (
                        <button key={item.panel} onClick={() => openPanel(item.panel)} className="w-full flex items-center gap-3 p-4 bg-cream rounded-xl hover:bg-border transition-colors">
                          <item.icon className="w-5 h-5 text-ink" />
                          <span className="flex-1 text-left font-medium text-ink">{item.label}</span>
                          <ChevronRight className="w-5 h-5 text-ink-tertiary" />
                        </button>
                      ))}

                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-4 bg-nope/10 rounded-xl hover:bg-nope/20 transition-colors mt-4">
                        <LogOut className="w-5 h-5 text-nope" />
                        <span className="flex-1 text-left font-medium text-nope">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}

                {sidebarPanel === 'profile' && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      {freshUser.profile_photo ? (
                        <img src={freshUser.profile_photo} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-border flex items-center justify-center mx-auto mb-3"><User className="w-10 h-10 text-ink-tertiary" /></div>
                      )}
                      <h4 className="text-lg font-display font-bold text-ink">{freshUser.name}</h4>
                      <p className="text-sm text-ink-secondary">{freshUser.institution}</p>
                    </div>
                    {freshUser.bio && (
                      <div className="p-3 bg-cream rounded-xl">
                        <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Bio</p>
                        <p className="text-sm text-ink">{freshUser.bio}</p>
                      </div>
                    )}
                    <div className="p-3 bg-cream rounded-xl">
                      <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Matric Number</p>
                      <p className="text-sm text-ink">{freshUser.matric_number || 'Not set'}</p>
                    </div>
                    <div className="p-3 bg-cream rounded-xl">
                      <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Mode</p>
                      <p className="text-sm text-ink">{freshUser.mode === 'have' ? 'Has apartment' : freshUser.mode === 'need' ? 'Needs apartment' : freshUser.mode === 'together' ? 'Looking together' : 'Not set'}</p>
                    </div>
                    {freshUser.budget && (
                      <div className="p-3 bg-cream rounded-xl">
                        <p className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">Budget</p>
                        <p className="text-sm text-ink">₦{freshUser.budget}/yr</p>
                      </div>
                    )}
                    <button onClick={() => openPanel('settings')} className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors flex items-center justify-center gap-2">
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </button>
                  </div>
                )}

                {sidebarPanel === 'listings' && (
                  <div className="space-y-3">
                    {myListings.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-ink-tertiary mx-auto mb-3" />
                        <p className="text-ink-secondary text-sm">No listings yet</p>
                      </div>
                    ) : (
                      myListings.map((l) => (
                        <div key={l.id} className="p-4 bg-cream rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg bg-border overflow-hidden flex-shrink-0">
                              {l.photos?.[0] ? <img src={l.photos[0]} alt="" className="w-full h-full object-cover" /> : <Home className="w-6 h-6 text-ink-tertiary mx-auto mt-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-ink truncate">{l.title}</p>
                              <p className="text-sm text-ink-secondary truncate">{l.location}</p>
                              <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${getModeBadge(l.mode).cls}`}>
                                {getModeBadge(l.mode).text}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this listing?')) {
                                await api.deleteListing(l.id)
                                loadMyListings()
                              }
                            }}
                            className="mt-3 w-full py-2 text-sm text-nope font-semibold hover:bg-nope/10 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {sidebarPanel === 'matches' && (
                  <div className="space-y-3">
                    {matches.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-ink-tertiary mx-auto mb-3" />
                        <p className="text-ink-secondary text-sm">No matches yet</p>
                        <p className="text-[13px] text-ink-tertiary mt-1">Keep swiping to find your match!</p>
                      </div>
                    ) : (
                      matches.map((m) => {
                        const isUser1 = m.user1_id === freshUser.id
                        const otherName = isUser1 ? m.u2_name : m.u1_name
                        const otherPhoto = isUser1 ? m.u2_photo : m.u1_photo
                        return (
                          <div key={m.id} className="flex items-center gap-3 p-4 bg-cream rounded-xl">
                            {otherPhoto ? (
                              <img src={otherPhoto} alt="" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center"><User className="w-6 h-6 text-ink-tertiary" /></div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-ink">{otherName}</p>
                              <p className="text-[12px] text-ink-tertiary">{new Date(m.created_at).toLocaleDateString()}</p>
                            </div>
                            <Heart className="w-5 h-5 text-like" fill="currentColor" />
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {sidebarPanel === 'prefs' && (
                  <div className="space-y-4">
                    <p className="text-[14px] text-ink-secondary mb-4">Set what you're looking for so we show you the best matches first.</p>
                    <div>
                      <label className={label}>Budget (₦/year)</label>
                      <input value={editBudget} onChange={(e) => setEditBudget(e.target.value)} placeholder="e.g. 300,000" className={input} />
                    </div>
                    <div>
                      <label className={label}>Preferred area</label>
                      <input value={editArea} onChange={(e) => setEditArea(e.target.value)} placeholder="e.g. Yaba, Akoka" className={input} />
                    </div>
                    <div>
                      <label className={label}>Max distance to campus</label>
                      <div className="flex items-center gap-3">
                        <input type="range" min={0.5} max={10} step={0.5} value={editDistance} onChange={(e) => setEditDistance(parseFloat(e.target.value))} className="flex-1 accent-brand" />
                        <span className="text-[14px] font-semibold text-ink w-12 text-right">{editDistance}km</span>
                      </div>
                    </div>
                    <button onClick={handleSaveProfile} disabled={savingProfile} className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50">
                      {savingProfile ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Preferences'}
                    </button>
                  </div>
                )}

                {sidebarPanel === 'settings' && (
                  <div className="space-y-4">
                    <div>
                      <label className={label}>Full name</label>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className={input} />
                    </div>
                    <div>
                      <label className={label}>Institution</label>
                      <input value={editInstitution} onChange={(e) => setEditInstitution(e.target.value)} className={input} />
                    </div>
                    <div>
                      <label className={label}>Matric number</label>
                      <input value={editMatric} onChange={(e) => setEditMatric(e.target.value)} className={input} />
                    </div>
                    <div>
                      <label className={label}>About you</label>
                      <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} className={`${input} resize-none`} placeholder="Tell roommates about yourself" />
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <h4 className="text-[13px] font-semibold text-ink mb-3 uppercase tracking-wider">Subscription</h4>
                      <div className="p-3 bg-cream rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-ink">Status</span>
                          <span className={`text-sm font-bold ${freshUser.subscription_status === 'active' ? 'text-like' : 'text-ink-tertiary'}`}>
                            {freshUser.subscription_status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {freshUser.subscription_expires_at && (
                          <p className="text-[12px] text-ink-tertiary mt-1">Expires: {new Date(freshUser.subscription_expires_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      {freshUser.subscription_status !== 'active' && (
                        <button
                          onClick={async () => {
                            try { const { authorization_url } = await api.initializeSubscription(); window.location.href = authorization_url }
                            catch (e) { console.error(e) }
                          }}
                          className="w-full py-3 mt-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors"
                        >
                          Subscribe - ₦6,500/month
                        </button>
                      )}
                    </div>

                    <button onClick={handleSaveProfile} disabled={savingProfile} className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50">
                      {savingProfile ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Changes'}
                    </button>

                    <button onClick={() => openPanel('delete')} className="w-full py-3 text-nope font-semibold hover:bg-nope/10 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                  </div>
                )}

                {sidebarPanel === 'feedback' && !feedbackDone && (
                  <div className="space-y-4">
                    <p className="text-[14px] text-ink-secondary">Help us make CoRenty better for you.</p>
                    <div>
                      <label className={label}>Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setFeedbackRating(s)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ background: s <= feedbackRating ? '#e85d04' : '#f0efeb' }}>
                            <Star className="w-5 h-5" fill={s <= feedbackRating ? 'white' : 'none'} stroke={s <= feedbackRating ? 'white' : '#a0a0a0'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={label}>Category</label>
                      <select value={feedbackCategory} onChange={(e) => setFeedbackCategory(e.target.value)} className={input}>
                        <option value="general">General Feedback</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="safety">Safety Concern</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>Message</label>
                      <textarea value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)} rows={4} placeholder="What's on your mind?" className={`${input} resize-none`} />
                    </div>
                    <button onClick={handleSubmitFeedback} disabled={feedbackSubmitting || !feedbackMessage.trim()} className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50">
                      {feedbackSubmitting ? 'Sending...' : 'Submit Feedback'}
                    </button>
                  </div>
                )}

                {sidebarPanel === 'feedback' && feedbackDone && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-like/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-like" fill="currentColor" />
                    </div>
                    <h4 className="text-lg font-display font-bold text-ink mb-2">Thank you!</h4>
                    <p className="text-ink-secondary text-sm">Your feedback helps us make CoRenty better for everyone.</p>
                  </div>
                )}

                {sidebarPanel === 'delete' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-nope/10 rounded-xl border border-nope/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-nope" />
                        <h4 className="font-bold text-nope">This is permanent</h4>
                      </div>
                      <p className="text-sm text-nope/80">
                        Deleting your account will remove all your data — profile, listings, matches, and subscription. This cannot be undone.
                      </p>
                    </div>
                    <div>
                      <label className={label}>Type <span className="font-mono font-bold text-nope">DELETE</span> to confirm</label>
                      <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="Type DELETE here" className={`${input} font-mono`} />
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== 'DELETE' || deleting}
                      className="w-full py-3 bg-nope text-white rounded-xl font-bold hover:bg-nope/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deleting ? 'Deleting...' : <><Trash2 className="w-4 h-4" /> Delete My Account</>}
                    </button>
                    <button onClick={closePanel} className="w-full py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-border transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
