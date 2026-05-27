import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import {
  Heart, X, MapPin, Home, Info, Sparkles, Phone, Mail, Instagram,
  Grid3x3, Settings, User, LogOut, ChevronRight, ChevronLeft, Edit3, Trash2, Shield
} from 'lucide-react'

interface Listing {
  id: number
  title: string
  price: string
  institution: string
  location: string
  author: string
  description: string
  verified: boolean
  images: string[]
  authorImages: string[]
  tags: string[]
  mode: 'have' | 'need'
  contact: {
    whatsapp?: string
    email?: string
    instagram?: string
    tiktok?: string
    facebook?: string
  }
}

const LISTINGS: Listing[] = [
  {
    id: 1,
    title: 'Modern Room near UNILAG',
    price: '₦250k/yr',
    institution: 'University of Lagos',
    location: 'Akoka, Yaba',
    author: 'Tunde O.',
    description: 'Looking for a clean and quiet roommate. Non-smoker preferred. 24/7 security and stable water supply.',
    verified: true,
    mode: 'have',
    images: ['https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=800'],
    authorImages: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'],
    tags: ['WiFi', 'Security', 'Water'],
    contact: { whatsapp: '+234 801 234 5678', email: 'tunde.o@email.com', instagram: '@tunde_o' }
  },
  {
    id: 2,
    title: 'Looking for roommate near UI',
    price: '₦300k/yr budget',
    institution: 'University of Ibadan',
    location: 'Bodija, Ibadan',
    author: 'Sarah E.',
    description: 'Female student looking for someone to split rent with. Let\'s find a place together near campus.',
    verified: true,
    mode: 'need',
    images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800'],
    authorImages: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'],
    tags: ['Female only', 'Quiet', 'Serious'],
    contact: { whatsapp: '+234 908 765 4321', email: 'sarah.e@email.com', tiktok: '@sarah.e' }
  },
  {
    id: 3,
    title: 'Executive Studio near Campus',
    price: '₦180k/yr',
    institution: 'Covenant University',
    location: 'Ota, Ogun',
    author: 'Daniel J.',
    description: 'Sharing a self-contain apartment. Very close to school gate. Looking for someone focused.',
    verified: false,
    mode: 'have',
    images: ['https://images.unsplash.com/photo-1555854817-5b2260408544?auto=format&fit=crop&q=80&w=800'],
    authorImages: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'],
    tags: ['Affordable', 'Near Gate'],
    contact: { email: 'daniel.j@email.com', instagram: '@danielj_', facebook: 'Daniel Johnson' }
  },
  {
    id: 4,
    title: 'Need roommate — Yaba area',
    price: '₦200k/yr budget',
    institution: 'YabaTech',
    location: 'Yaba, Lagos',
    author: 'Chidi N.',
    description: 'Polytechnic student looking for someone to share a flat with. Budget friendly and close to campus.',
    verified: true,
    mode: 'need',
    images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800'],
    authorImages: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'],
    tags: ['Budget', 'Friendly', 'Near campus'],
    contact: { whatsapp: '+234 812 345 6789', instagram: '@chidi_n' }
  },
]

type SidebarView = 'menu' | 'wishlist' | 'profile' | 'settings'

interface DashboardProps {
  onNavigate: (page: string, data?: any) => void
  user: any
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const [wishlist, setWishlist] = useState<number[]>([])
  const [matchPopup, setMatchPopup] = useState<Listing | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarView, setSidebarView] = useState<SidebarView>('menu')

  const listing = LISTINGS[currentIndex % LISTINGS.length]

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const likeOpacity = useTransform(x, [0, 80], [0, 1])
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0])

  const handleSwipe = (dir: 'left' | 'right') => {
    if (dir === 'right') {
      setWishlist(prev => [...new Set([...prev, listing.id])])
      setMatchPopup(listing)
    }
    setTimeout(() => setCurrentIndex(prev => prev + 1), 300)
  }

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) handleSwipe('right')
    else if (info.offset.x < -100) handleSwipe('left')
  }

  const wishlistItems = LISTINGS.filter(l => wishlist.includes(l.id))

  return (
    <div className="h-[100dvh] flex flex-col bg-cream relative overflow-hidden">
      {/* Header */}
      <header className="glass border-b border-border px-6 py-4 flex items-center justify-between shrink-0 z-30">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-ink flex items-center justify-center">
            <Home className="w-4 h-4 text-cream" strokeWidth={2} />
          </div>
          <span className="text-lg font-display font-bold tracking-[-0.03em] text-ink">CoRenty</span>
        </button>

        {/* Modern dot-grid menu trigger */}
        <button
          onClick={() => { setSidebarOpen(true); setSidebarView('menu') }}
          className="w-10 h-10 rounded-xl bg-cream border border-border flex items-center justify-center hover:border-ink/20 transition-all active:scale-95"
        >
          <div className="grid grid-cols-3 gap-[3px]">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-[3px] h-[3px] rounded-full bg-ink" />
            ))}
          </div>
        </button>
      </header>

      {/* Card Stage */}
      <main className="flex-1 relative flex items-center justify-center px-6 py-6 min-h-0">
        <div className="absolute inset-x-10 bottom-10 h-3 bg-surface/60 rounded-[28px] scale-[0.94] -z-10" />
        <div className="absolute inset-x-8 bottom-12 h-3 bg-surface/80 rounded-[28px] scale-[0.97] -z-10" />

        <AnimatePresence mode="popLayout">
          <motion.div
            key={listing.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
            className="absolute w-full max-w-[380px] h-full max-h-[72vh] bg-surface rounded-[32px] shadow-2xl shadow-ink/8 overflow-hidden cursor-grab select-none border border-border-light flex flex-col"
            onClick={() => setShowDetail(true)}
          >
            <div className="relative h-[60%] w-full overflow-hidden shrink-0">
              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Mode badge */}
              <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 bg-surface/95 backdrop-blur-md rounded-full">
                <div className={`w-1.5 h-1.5 rounded-full ${listing.mode === 'have' ? 'bg-like' : 'bg-brand'}`} />
                <span className="text-[10px] font-semibold text-ink tracking-wide">
                  {listing.mode === 'have' ? 'Has a place' : 'Needs a place'}
                </span>
                {listing.verified && (
                  <>
                    <span className="text-ink-tertiary">·</span>
                    <span className="text-[10px] font-semibold text-ink">Verified</span>
                  </>
                )}
              </div>

              <div className="absolute top-5 right-5 px-4 py-2 bg-surface/95 backdrop-blur-md rounded-xl">
                <span className="text-sm font-display font-bold text-ink">{listing.price}</span>
              </div>

              <motion.div style={{ opacity: likeOpacity }} className="absolute top-20 left-8 z-30 px-5 py-2.5 border-[3px] border-like rounded-xl rotate-[-12deg]">
                <span className="text-like font-display font-bold text-xl tracking-tight">LIKE</span>
              </motion.div>
              <motion.div style={{ opacity: nopeOpacity }} className="absolute top-20 right-8 z-30 px-5 py-2.5 border-[3px] border-nope rounded-xl rotate-[12deg]">
                <span className="text-nope font-display font-bold text-xl tracking-tight">NOPE</span>
              </motion.div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-white text-2xl font-display font-bold tracking-tight mb-1.5">{listing.title}</h2>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-white/60" />
                  <span className="text-white/70 text-sm">{listing.location}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={listing.authorImages[0]} className="w-11 h-11 rounded-full object-cover border-2 border-surface shadow-sm" alt="" />
                  <div>
                    <p className="font-display font-semibold text-sm text-ink">{listing.author}</p>
                    <p className="text-xs text-ink">{listing.institution}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-cream rounded-lg text-xs font-medium text-ink">{tag}</span>
                  ))}
                </div>
                <p className="text-sm text-ink leading-relaxed line-clamp-2">{listing.description}</p>
              </div>
              <div className="flex items-center justify-center pt-4 text-xs text-ink gap-1">
                <Info size={11} /> Tap for details
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Action Buttons */}
      <div className="relative z-10 pb-10 pt-4 flex items-center justify-center gap-6">
        <button onClick={() => handleSwipe('left')} className="w-16 h-16 rounded-full bg-surface border-2 border-nope/20 flex items-center justify-center shadow-lg hover:shadow-xl hover:border-nope/40 transition-all duration-200 hover:scale-110 active:scale-95">
          <X size={26} className="text-nope" strokeWidth={2.5} />
        </button>
        <button onClick={() => handleSwipe('right')} className="w-16 h-16 rounded-full bg-like flex items-center justify-center shadow-lg shadow-like/30 hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95">
          <Heart size={26} className="text-white" strokeWidth={2.5} fill="white" />
        </button>
      </div>

      {/* Match Popup */}
      <AnimatePresence>
        {matchPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm px-6"
            onClick={() => setMatchPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-surface rounded-[32px] p-10 max-w-sm w-full text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-like to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-like/30">
                <Sparkles size={36} className="text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight mb-1 text-ink">It's a match!</h2>
              <p className="text-ink mb-6">Here's how to reach {matchPopup.author}:</p>
              <div className="space-y-3 mb-6">
                {matchPopup.contact.whatsapp && (
                  <a href={`https://wa.me/${matchPopup.contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-like-light rounded-xl text-ink font-medium hover:scale-[1.02] transition-all">
                    <Phone size={18} className="text-like" /> {matchPopup.contact.whatsapp}
                  </a>
                )}
                {matchPopup.contact.email && (
                  <a href={`mailto:${matchPopup.contact.email}`} className="flex items-center gap-3 px-4 py-3 bg-cream rounded-xl text-ink font-medium hover:scale-[1.02] transition-all">
                    <Mail size={18} className="text-ink" /> {matchPopup.contact.email}
                  </a>
                )}
                {matchPopup.contact.instagram && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-cream rounded-xl text-ink font-medium">
                    <Instagram size={18} className="text-ink" /> {matchPopup.contact.instagram}
                  </div>
                )}
                {matchPopup.contact.tiktok && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-cream rounded-xl text-ink font-medium">
                    <span className="text-sm font-bold">TT</span> {matchPopup.contact.tiktok}
                  </div>
                )}
                {matchPopup.contact.facebook && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-cream rounded-xl text-ink font-medium">
                    <span className="text-sm font-bold">FB</span> {matchPopup.contact.facebook}
                  </div>
                )}
              </div>
              <button onClick={() => setMatchPopup(null)} className="w-full py-3.5 bg-ink text-cream rounded-xl font-semibold hover:bg-ink/90 transition-colors">
                Keep swiping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[32px] max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-8" />
                <div className="relative h-64 rounded-3xl overflow-hidden mb-6">
                  <img src={listing.images[0]} className="w-full h-full object-cover" alt="" />
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-surface/95 backdrop-blur-md rounded-full">
                    <div className={`w-1.5 h-1.5 rounded-full ${listing.mode === 'have' ? 'bg-like' : 'bg-brand'}`} />
                    <span className="text-[10px] font-semibold text-ink tracking-wide">
                      {listing.mode === 'have' ? 'Has a place' : 'Needs a place'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold tracking-tight text-ink">{listing.title}</h2>
                    <p className="text-ink text-sm mt-1">{listing.location}</p>
                  </div>
                  <span className="text-2xl font-display font-bold text-brand">{listing.price}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-cream rounded-2xl mb-6">
                  <img src={listing.authorImages[0]} className="w-12 h-12 rounded-full object-cover" alt="" />
                  <div>
                    <p className="font-display font-semibold text-ink">{listing.author}</p>
                    <p className="text-sm text-ink">{listing.institution}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {listing.tags.map(tag => (
                    <span key={tag} className="px-4 py-2 bg-brand-light text-ink rounded-xl text-sm font-semibold">{tag}</span>
                  ))}
                </div>
                <p className="text-ink leading-relaxed mb-8">{listing.description}</p>
                <div className="flex gap-3 pb-4">
                  <button onClick={() => { setShowDetail(false); handleSwipe('left') }} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-colors flex items-center justify-center gap-2">
                    <X size={18} /> Pass
                  </button>
                  <button onClick={() => { setShowDetail(false); handleSwipe('right') }} className="flex-1 py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-colors flex items-center justify-center gap-2">
                    <Heart size={18} fill="white" /> Match
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[360px] bg-surface z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between mb-8">
                  {sidebarView !== 'menu' && (
                    <button onClick={() => setSidebarView('menu')} className="p-2 rounded-xl hover:bg-cream transition-colors">
                      <ChevronLeft size={20} className="text-ink" />
                    </button>
                  )}
                  <h2 className="text-xl font-display font-bold tracking-tight text-ink flex-1 text-center">
                    {sidebarView === 'menu' ? 'Menu' : sidebarView === 'wishlist' ? 'Wishlist' : sidebarView === 'profile' ? 'Profile' : 'Settings'}
                  </h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-cream transition-colors">
                    <X size={20} className="text-ink" />
                  </button>
                </div>

                {/* Menu View */}
                {sidebarView === 'menu' && (
                  <div className="space-y-2">
                    {/* User card */}
                    <div className="flex items-center gap-3 p-4 bg-cream rounded-2xl mb-4">
                      <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center overflow-hidden">
                        {user?.profilePhoto ? (
                          <img src={user.profilePhoto} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User size={24} className="text-ink" />
                        )}
                      </div>
                      <div>
                        <p className="font-display font-bold text-ink">{user?.name || 'Student'}</p>
                        <p className="text-xs text-ink">{user?.institution || 'CoRenty'}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <button
                      onClick={() => setSidebarView('wishlist')}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-cream transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-nope-light flex items-center justify-center">
                        <Heart size={18} className="text-nope" />
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-semibold text-ink">Wishlist</p>
                        <p className="text-xs text-ink">{wishlist.length} saved</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {wishlist.length > 0 && (
                          <span className="w-6 h-6 rounded-full bg-nope text-white text-xs font-bold flex items-center justify-center">{wishlist.length}</span>
                        )}
                        <ChevronRight size={16} className="text-ink" />
                      </div>
                    </button>

                    <button
                      onClick={() => setSidebarView('profile')}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-cream transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center">
                        <User size={18} className="text-ink" />
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-semibold text-ink">My Profile</p>
                        <p className="text-xs text-ink">View and edit</p>
                      </div>
                      <ChevronRight size={16} className="text-ink" />
                    </button>

                    <button
                      onClick={() => setSidebarView('settings')}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-cream transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center">
                        <Settings size={18} className="text-ink" />
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-semibold text-ink">Settings</p>
                        <p className="text-xs text-ink">Account & preferences</p>
                      </div>
                      <ChevronRight size={16} className="text-ink" />
                    </button>

                    <div className="pt-4 border-t border-border mt-4">
                      <button
                        onClick={() => onNavigate('landing')}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-nope-light transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-nope-light flex items-center justify-center">
                          <LogOut size={18} className="text-nope" />
                        </div>
                        <p className="font-display font-semibold text-nope">Sign out</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Wishlist View */}
                {sidebarView === 'wishlist' && (
                  <div>
                    {wishlistItems.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-nope-light flex items-center justify-center mx-auto mb-4">
                          <Heart size={28} className="text-nope" />
                        </div>
                        <h3 className="font-display font-bold text-ink mb-2">No matches yet</h3>
                        <p className="text-sm text-ink">Swipe right on listings you like to save them here.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {wishlistItems.map(item => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-cream rounded-2xl p-4 flex gap-4 items-center"
                          >
                            <img src={item.images[0]} className="w-16 h-16 rounded-xl object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-brand uppercase tracking-wider">{item.institution}</p>
                              <p className="font-display font-bold text-sm text-ink truncate">{item.title}</p>
                              <p className="text-brand font-bold text-sm">{item.price}</p>
                            </div>
                            <button
                              onClick={() => setWishlist(prev => prev.filter(id => id !== item.id))}
                              className="p-2 text-ink hover:text-nope transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile View */}
                {sidebarView === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-cream border-4 border-surface shadow-lg overflow-hidden mb-4">
                        {user?.profilePhoto ? (
                          <img src={user.profilePhoto} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={36} className="text-ink" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-xl text-ink">{user?.name || 'Student'}</h3>
                      <p className="text-sm text-ink">{user?.institution || 'CoRenty User'}</p>
                      <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-like-light rounded-full">
                        <Shield size={12} className="text-like" />
                        <span className="text-xs font-bold text-ink">Verified</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-cream rounded-2xl">
                        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">Mode</p>
                        <p className="font-medium text-ink">{user?.mode === 'have' ? 'Has a place — looking for roommate' : 'Looking for a place + roommate'}</p>
                      </div>
                      <div className="p-4 bg-cream rounded-2xl">
                        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">Institution</p>
                        <p className="font-medium text-ink">{user?.institution || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-cream rounded-2xl">
                        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">Stats</p>
                        <p className="font-medium text-ink">{wishlist.length} matches · {currentIndex} swipes</p>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-colors flex items-center justify-center gap-2">
                      <Edit3 size={16} /> Edit profile
                    </button>
                  </div>
                )}

                {/* Settings View */}
                {sidebarView === 'settings' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-ink uppercase tracking-wider px-2">Account</h3>
                      <SettingsItem icon={User} label="Personal info" desc="Name, photo, contact" />
                      <SettingsItem icon={Shield} label="Verification" desc="Student ID status" />
                      <SettingsItem icon={Home} label={user?.mode === 'have' ? 'My listing' : 'My preferences'} desc={user?.mode === 'have' ? 'Edit apartment details' : 'Budget and area'} />
                    </div>
                    <div className="space-y-2 pt-4 border-t border-border">
                      <h3 className="text-xs font-semibold text-ink uppercase tracking-wider px-2">Preferences</h3>
                      <SettingsItem icon={MapPin} label="Location filter" desc="Filter by institution" />
                      <SettingsItem icon={Settings} label="Notifications" desc="Manage alerts" />
                    </div>
                    <div className="space-y-2 pt-4 border-t border-border">
                      <h3 className="text-xs font-semibold text-ink uppercase tracking-wider px-2">Support</h3>
                      <SettingsItem icon={Info} label="Help center" desc="FAQs and support" />
                      <SettingsItem icon={Shield} label="Safety" desc="Report and block" />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <button
                        onClick={() => onNavigate('landing')}
                        className="w-full py-3 bg-nope-light text-nope rounded-2xl font-semibold hover:bg-nope/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> Delete account
                      </button>
                    </div>
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

const SettingsItem: React.FC<{ icon: React.ElementType; label: string; desc: string }> = ({ icon: Icon, label, desc }) => (
  <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-cream transition-all text-left">
    <div className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center">
      <Icon size={16} className="text-ink" />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-sm text-ink">{label}</p>
      <p className="text-xs text-ink">{desc}</p>
    </div>
    <ChevronRight size={14} className="text-ink" />
  </button>
)

export default Dashboard
