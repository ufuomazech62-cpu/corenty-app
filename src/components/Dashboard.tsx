import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, X, MapPin, Home, Sparkles, Phone, Mail, Grid3x3, LogOut, Settings, User, ChevronRight, ChevronLeft, Edit3, Shield, RefreshCw } from 'lucide-react'
import { TikTokIcon, InstagramIcon, FacebookIcon, XIcon, WhatsAppIcon } from './BrandIcons'
import { api, Listing } from '../lib/api'

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
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    loadListings()
  }, [])

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

  const handleProfileClick = () => {
    setShowProfileModal(true)
  }

  const handleViewDetails = () => {
    setShowDetailModal(true)
  }

  const handleSignOut = () => {
    document.cookie = 'auth_token=; Max-Age=0; path=/'
    onNavigate('landing')
  }

  const handleResetSwipes = () => {
    setCurrentIndex(0)
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
            <Home className="w-10 h-10 text-brand" />
          </div>
          <h2 className="text-2xl font-display font-bold text-ink mb-3 tracking-[-0.03em]">You're early — that's actually great</h2>
          <p className="text-ink-secondary mb-2 leading-relaxed">
            Your listing is live and ready. When new people join CoRenty, they'll see your profile right away.
          </p>
          <p className="text-[13px] text-ink-tertiary mb-6">
            Share your link with friends to get matches faster.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText('https://corenty-v2.vercel.app')
                  alert('Link copied! Share it with friends.')
                } catch { /* ignore */ }
              }}
              className="flex-1 py-4 bg-brand text-white rounded-2xl font-bold text-[15px] tracking-[-0.02em] hover:bg-brand/90 transition-colors"
            >
              Share CoRenty
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
            <button
              onClick={handleResetSwipes}
              className="flex-1 py-4 bg-white border-2 border-border text-ink rounded-2xl font-bold text-[15px] tracking-[-0.02em] hover:border-ink/20 transition-colors flex items-center justify-center gap-2"
            >
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
            <button
              onClick={() => setShowSidebar(true)}
              className="w-9 h-9 rounded-lg bg-cream border border-border flex items-center justify-center hover:border-ink/20 transition-colors"
            >
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
            {/* Image */}
            <div className="relative aspect-[4/3] bg-border">
              {currentListing.photos && currentListing.photos.length > 0 ? (
                <img
                  src={currentListing.photos[0]}
                  alt={currentListing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-16 h-16 text-ink-tertiary" />
                </div>
              )}

              {/* Mode Badge */}
              <div className="absolute top-4 left-4">
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${getModeBadge(currentListing.mode).cls}`}>
                  {getModeBadge(currentListing.mode).text}
                </div>
              </div>

              {/* Price Badge */}
              {currentListing.price && (
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1.5 bg-ink/90 backdrop-blur-sm rounded-full text-xs font-bold text-cream">
                    ₦{currentListing.price}/yr
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
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

              {/* Author */}
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 mb-4 p-3 bg-cream rounded-xl hover:bg-border transition-colors w-full"
              >
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

              {/* Description Preview */}
              {currentListing.description && (
                <p className="text-ink-secondary text-sm mb-4 line-clamp-2">{currentListing.description}</p>
              )}

              {/* View Details Button */}
              <button
                onClick={handleViewDetails}
                className="w-full py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-border transition-colors"
              >
                View Details
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 flex items-center justify-center gap-4">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-surface border-2 border-nope/20 flex items-center justify-center shadow-lg hover:border-nope/40 transition-all active:scale-95"
          >
            <X className="w-7 h-7 text-nope" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-like flex items-center justify-center shadow-lg shadow-like/30 hover:shadow-xl transition-all active:scale-95"
          >
            <Heart className="w-7 h-7 text-white" strokeWidth={2.5} fill="white" />
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfileModal(false)}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />

                <div className="flex items-center gap-4 mb-6">
                  {currentListing.u_photo ? (
                    <img src={currentListing.u_photo} alt={currentListing.u_name} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-border flex items-center justify-center">
                      <User className="w-10 h-10 text-ink-tertiary" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-display font-bold text-ink">{currentListing.u_name}</h3>
                    <p className="text-ink-secondary">{currentListing.institution}</p>
                    {currentListing.verified && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-4 h-4 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-ink">Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-border transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />

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

                {currentListing.description && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-ink mb-2">Description</h4>
                    <p className="text-ink-secondary text-sm whitespace-pre-line">{currentListing.description}</p>
                  </div>
                )}

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-border transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Popup */}
      <AnimatePresence>
        {showMatchPopup && matchedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-surface rounded-3xl w-full max-w-md p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-like to-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-display font-bold text-ink mb-2">It's a Match!</h2>
              <p className="text-ink-secondary mb-6">You and {matchedListing.u_name} are interested in each other.</p>

              <div className="bg-cream rounded-2xl p-4 mb-6">
                <p className="text-sm text-ink-secondary mb-3">Subscribe to view contact details</p>
                <button
                  onClick={async () => {
                    try {
                      const { authorization_url } = await api.initializeSubscription()
                      window.location.href = authorization_url
                    } catch (error) {
                      console.error('Failed to initialize subscription:', error)
                    }
                  }}
                  className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-colors"
                >
                  Subscribe - ₦6,500/month
                </button>
              </div>

              <button
                onClick={() => setShowMatchPopup(false)}
                className="w-full py-3 bg-cream text-ink rounded-xl font-semibold hover:bg-border transition-colors"
              >
                Continue Swiping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-surface shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-display font-bold text-ink">Menu</h3>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center hover:bg-border transition-colors"
                  >
                    <X className="w-5 h-5 text-ink" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-cream rounded-2xl">
                  {user.profile_photo ? (
                    <img src={user.profile_photo} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center">
                      <User className="w-6 h-6 text-ink-tertiary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink truncate">{user.name}</p>
                    <p className="text-sm text-ink-secondary truncate">{user.email}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-4 bg-cream rounded-xl hover:bg-border transition-colors">
                    <User className="w-5 h-5 text-ink" />
                    <span className="flex-1 text-left font-medium text-ink">My Profile</span>
                    <ChevronRight className="w-5 h-5 text-ink-tertiary" />
                  </button>

                  <button className="w-full flex items-center gap-3 p-4 bg-cream rounded-xl hover:bg-border transition-colors">
                    <Settings className="w-5 h-5 text-ink" />
                    <span className="flex-1 text-left font-medium text-ink">Settings</span>
                    <ChevronRight className="w-5 h-5 text-ink-tertiary" />
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 p-4 bg-nope/10 rounded-xl hover:bg-nope/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-nope" />
                    <span className="flex-1 text-left font-medium text-nope">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
