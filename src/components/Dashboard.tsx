import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import {
  Heart, X, MapPin, Home, Info, Sparkles, Phone, Mail, Instagram,
  Settings, User, LogOut, ChevronRight, ChevronLeft, Edit3, Trash2, Shield,
  Plus, Camera, Check, Bell, BellOff, HelpCircle, Lock, Facebook, AtSign,
  ChevronDown, ChevronUp, Image, MessageCircle, AlertTriangle, Eye
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
  contact: Record<string, string>
}

const LISTINGS: Listing[] = [
  {
    id: 1, title: 'Modern Room near UNILAG', price: '₦250k/yr',
    institution: 'University of Lagos', location: 'Akoka, Yaba', author: 'Tunde O.',
    description: 'Looking for a clean and quiet roommate. Non-smoker preferred. 24/7 security and stable water supply.',
    verified: true, mode: 'have',
    images: ['https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=800'],
    authorImages: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'],
    tags: ['WiFi', 'Security', 'Water'],
    contact: { whatsapp: '+234 801 234 5678', email: 'tunde.o@email.com', instagram: '@tunde_o' }
  },
  {
    id: 2, title: 'Looking for roommate near UI', price: '₦300k/yr budget',
    institution: 'University of Ibadan', location: 'Bodija, Ibadan', author: 'Sarah E.',
    description: 'Female student looking for someone to split rent with. Let\'s find a place together near campus.',
    verified: true, mode: 'need',
    images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800'],
    authorImages: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'],
    tags: ['Female only', 'Quiet', 'Serious'],
    contact: { whatsapp: '+234 908 765 4321', email: 'sarah.e@email.com', tiktok: '@sarah.e' }
  },
  {
    id: 3, title: 'Executive Studio near Campus', price: '₦180k/yr',
    institution: 'Covenant University', location: 'Ota, Ogun', author: 'Daniel J.',
    description: 'Sharing a self-contain apartment. Very close to school gate. Looking for someone focused.',
    verified: false, mode: 'have',
    images: ['https://images.unsplash.com/photo-1555854817-5b2260408544?auto=format&fit=crop&q=80&w=800'],
    authorImages: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'],
    tags: ['Affordable', 'Near Gate'],
    contact: { email: 'daniel.j@email.com', instagram: '@danielj_', facebook: 'Daniel Johnson' }
  },
  {
    id: 4, title: 'Need roommate — Yaba area', price: '₦200k/yr budget',
    institution: 'YabaTech', location: 'Yaba, Lagos', author: 'Chidi N.',
    description: 'Polytechnic student looking for someone to share a flat with. Budget friendly and close to campus.',
    verified: true, mode: 'need',
    images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800'],
    authorImages: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'],
    tags: ['Budget', 'Friendly', 'Near campus'],
    contact: { whatsapp: '+234 812 345 6789', instagram: '@chidi_n' }
  },
]

type SidebarView = 'menu' | 'wishlist' | 'listing' | 'edit' | 'preferences' | 'notifications' | 'help' | 'safety'
type ModalView = 'none' | 'profile' | 'detail' | 'fullProfile'

interface DashboardProps {
  onNavigate: (page: string, data?: any) => void
  user: any
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [modalView, setModalView] = useState<ModalView>('none')
  const [wishlist, setWishlist] = useState<number[]>([])
  const [matchPopup, setMatchPopup] = useState<Listing | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarView, setSidebarView] = useState<SidebarView>('menu')

  // Edit state
  const [editBio, setEditBio] = useState(user?.bio || '')
  const [editSocials, setEditSocials] = useState(user?.socials || { tiktok: '', instagram: '', facebook: '', whatsapp: '', email: '', twitter: '' })
  const [editApartmentDesc, setEditApartmentDesc] = useState(user?.apartmentDesc || '')
  const [editApartmentTitle, setEditApartmentTitle] = useState(user?.apartmentTitle || '')
  const [editApartmentPrice, setEditApartmentPrice] = useState(user?.apartmentPrice || '')
  const [editApartmentLocation, setEditApartmentLocation] = useState(user?.apartmentLocation || '')
  const [editProfileImages, setEditProfileImages] = useState<string[]>(user?.profileImages || [])
  const [editApartmentPhotos, setEditApartmentPhotos] = useState<string[]>(user?.apartmentPhotos || [])
  const [editProfilePhoto, setEditProfilePhoto] = useState<string | null>(user?.profilePhoto || null)
  const [editDistance, setEditDistance] = useState(user?.distanceToCampus || 2)
  const [editBudget, setEditBudget] = useState(user?.budget || '')
  const [editPreferredArea, setEditPreferredArea] = useState(user?.preferredArea || '')
  const [editErrors, setEditErrors] = useState<string[]>([])
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Notifications
  const [notifMatches, setNotifMatches] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(true)

  // Help FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Carousel
  const [carouselIndex, setCarouselIndex] = useState(0)

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

  // All listing images for carousel
  const allListingImages = user?.mode === 'have'
    ? [...(editApartmentPhotos.length > 0 ? editApartmentPhotos : user?.apartmentPhotos || [])]
    : []

  // Save profile edits
  const handleSaveProfile = () => {
    const errors: string[] = []
    if (!editBio.trim()) errors.push('Description is required')
    if (!editProfilePhoto) errors.push('Profile photo is required')
    if (user?.mode === 'have' && editApartmentPhotos.length === 0) errors.push('At least one apartment photo is required')

    if (errors.length > 0) {
      setEditErrors(errors)
      return
    }

    setEditErrors([])
    const updatedUser = {
      ...user,
      bio: editBio,
      socials: editSocials,
      apartmentDesc: editApartmentDesc,
      apartmentTitle: editApartmentTitle,
      apartmentPrice: editApartmentPrice,
      apartmentLocation: editApartmentLocation,
      profileImages: editProfileImages,
      apartmentPhotos: editApartmentPhotos,
      profilePhoto: editProfilePhoto,
      distanceToCampus: editDistance,
      budget: editBudget,
      preferredArea: editPreferredArea,
    }

    onNavigate('dashboard', updatedUser)
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setSidebarView('menu')
    }, 1500)
  }

  const handleEditPhotoUpload = (type: 'profile' | 'profileExtra' | 'apartment') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    if (type === 'profile') {
      const file = files[0]
      if (file && file.type.startsWith('image/')) setEditProfilePhoto(URL.createObjectURL(file))
    } else if (type === 'profileExtra') {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) setEditProfileImages(prev => [...prev, URL.createObjectURL(file)])
      })
    } else {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) setEditApartmentPhotos(prev => [...prev, URL.createObjectURL(file)])
      })
    }
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    setSidebarView('menu')
    setEditErrors([])
    setSaveSuccess(false)
  }

  const openEdit = () => {
    setEditBio(user?.bio || '')
    setEditSocials(user?.socials || { tiktok: '', instagram: '', facebook: '', whatsapp: '', email: '', twitter: '' })
    setEditApartmentDesc(user?.apartmentDesc || '')
    setEditApartmentTitle(user?.apartmentTitle || '')
    setEditApartmentPrice(user?.apartmentPrice || '')
    setEditApartmentLocation(user?.apartmentLocation || '')
    setEditProfileImages(user?.profileImages || [])
    setEditApartmentPhotos(user?.apartmentPhotos || [])
    setEditProfilePhoto(user?.profilePhoto || null)
    setEditDistance(user?.distanceToCampus || 2)
    setEditBudget(user?.budget || '')
    setEditPreferredArea(user?.preferredArea || '')
    setEditErrors([])
    setSidebarView('edit')
  }

  // Carousel navigation
  const carouselImages = user?.mode === 'have'
    ? (editApartmentPhotos.length > 0 ? editApartmentPhotos : user?.apartmentPhotos || [])
    : (user?.profileImages || [])

  const nextCarouselImage = () => setCarouselIndex(i => (i + 1) % Math.max(carouselImages.length, 1))
  const prevCarouselImage = () => setCarouselIndex(i => (i - 1 + carouselImages.length) % Math.max(carouselImages.length, 1))

  const faqs = [
    { q: 'How does matching work?', a: 'Swipe right on listings you like. When both students swipe right on each other, it\'s a match! You\'ll see their contact details to connect directly.' },
    { q: 'Is my data safe?', a: 'All data is stored locally on your device. We verify every student to keep the community safe. Your contact info is only shared after a mutual match.' },
    { q: 'Can I change my preferences?', a: 'Yes! Go to Menu > Preferences to update your budget, preferred area, and distance to campus at any time.' },
    { q: 'How do I report someone?', a: 'Go to Menu > Safety to report or block users. We take safety seriously and review all reports.' },
    { q: 'Can I delete my account?', a: 'Go to Menu > Safety > Delete account. This will remove all your data from this device.' },
  ]

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
            onClick={() => setModalView('detail')}
          >
            <div className="relative h-[60%] w-full overflow-hidden shrink-0">
              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

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
                  <button onClick={(e) => { e.stopPropagation(); setModalView('profile') }}>
                    <img src={listing.authorImages[0]} className="w-11 h-11 rounded-full object-cover border-2 border-surface shadow-sm hover:scale-110 transition-transform" alt="" />
                  </button>
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
                    <Facebook size={18} className="text-ink" /> {matchPopup.contact.facebook}
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
        {modalView === 'detail' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={() => setModalView('none')}
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
                <button
                  onClick={() => setModalView('profile')}
                  className="flex items-center gap-3 p-4 bg-cream rounded-2xl mb-6 w-full hover:bg-border transition-colors"
                >
                  <img src={listing.authorImages[0]} className="w-12 h-12 rounded-full object-cover" alt="" />
                  <div className="text-left flex-1">
                    <p className="font-display font-semibold text-ink">{listing.author}</p>
                    <p className="text-sm text-ink">{listing.institution}</p>
                  </div>
                  <Eye size={16} className="text-ink" />
                </button>
                <div className="flex flex-wrap gap-2 mb-6">
                  {listing.tags.map(tag => (
                    <span key={tag} className="px-4 py-2 bg-brand-light text-ink rounded-xl text-sm font-semibold">{tag}</span>
                  ))}
                </div>
                <p className="text-ink leading-relaxed mb-8">{listing.description}</p>
                <div className="flex gap-3 pb-4">
                  <button onClick={() => { setModalView('none'); handleSwipe('left') }} className="flex-1 py-4 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-colors flex items-center justify-center gap-2">
                    <X size={18} /> Pass
                  </button>
                  <button onClick={() => { setModalView('none'); handleSwipe('right') }} className="flex-1 py-4 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-colors flex items-center justify-center gap-2">
                    <Heart size={18} fill="white" /> Match
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal (listing author) */}
      <AnimatePresence>
        {modalView === 'profile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={() => setModalView('none')}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[32px] max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 pb-8">
                <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />

                {/* Author header with clickable avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setModalView('fullProfile')}
                    className="shrink-0 relative group"
                  >
                    <img
                      src={listing.authorImages[0]}
                      className="w-16 h-16 rounded-full object-cover border-3 border-surface shadow-lg group-hover:scale-105 transition-transform"
                      alt=""
                    />
                    <div className="absolute inset-0 rounded-full bg-ink/0 group-hover:bg-ink/10 transition-colors flex items-center justify-center">
                      <Eye size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </button>
                  <div>
                    <h3 className="text-xl font-display font-bold text-ink">{listing.author}</h3>
                    <p className="text-sm text-ink">{listing.institution}</p>
                    {listing.verified && (
                      <div className="flex items-center gap-1 mt-1">
                        <Shield size={12} className="text-like" />
                        <span className="text-xs font-bold text-ink">Verified Student</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Apartment image carousel */}
                {listing.images.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Photos</p>
                    <div className="relative rounded-2xl overflow-hidden bg-cream">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={carouselIndex}
                          src={listing.images[carouselIndex % listing.images.length]}
                          initial={{ x: 80, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -80, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="w-full h-56 object-cover"
                          alt=""
                        />
                      </AnimatePresence>

                      {/* Tap zones for carousel */}
                      {listing.images.length > 1 && (
                        <>
                          <button
                            onClick={() => prevCarouselImage()}
                            className="absolute left-0 top-0 bottom-0 w-1/3"
                          />
                          <button
                            onClick={() => nextCarouselImage()}
                            className="absolute right-0 top-0 bottom-0 w-2/3"
                          />
                        </>
                      )}

                      {/* Progress dots */}
                      {listing.images.length > 1 && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                          {listing.images.map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex % listing.images.length ? 'bg-white w-4' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Listing details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-bold text-ink">{listing.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={13} className="text-ink" />
                        <span className="text-sm text-ink">{listing.location}</span>
                      </div>
                    </div>
                    <span className="text-xl font-display font-bold text-brand">{listing.price}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-cream rounded-xl text-xs font-medium text-ink">{tag}</span>
                    ))}
                  </div>

                  <p className="text-ink leading-relaxed">{listing.description}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setModalView('none')} className="flex-1 py-3.5 bg-cream rounded-2xl font-semibold text-ink hover:bg-border transition-colors">
                    Close
                  </button>
                  <button onClick={() => { setModalView('none'); handleSwipe('right') }} className="flex-1 py-3.5 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-colors flex items-center justify-center gap-2">
                    <Heart size={16} fill="white" /> Match
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Profile View (from clicking avatar) */}
      <AnimatePresence>
        {modalView === 'fullProfile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-ink/50 backdrop-blur-sm"
            onClick={() => setModalView('profile')}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute inset-4 bg-surface rounded-[32px] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Close button */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-display font-bold text-ink">Full Profile</h3>
                  <button onClick={() => setModalView('profile')} className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center hover:bg-border transition-colors">
                    <X size={18} className="text-ink" />
                  </button>
                </div>

                {/* Large profile photo */}
                <div className="flex justify-center mb-6">
                  <img src={listing.authorImages[0]} className="w-28 h-28 rounded-full object-cover border-4 border-surface shadow-xl" alt="" />
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-ink">{listing.author}</h2>
                  <p className="text-ink mt-1">{listing.institution}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <div className={`w-2 h-2 rounded-full ${listing.mode === 'have' ? 'bg-like' : 'bg-brand'}`} />
                    <span className="text-sm font-medium text-ink">{listing.mode === 'have' ? 'Has a place' : 'Needs a place + roommate'}</span>
                  </div>
                  {listing.verified && (
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <Shield size={14} className="text-like" />
                      <span className="text-xs font-bold text-ink">Verified Student</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-cream rounded-2xl p-3 text-center">
                    <p className="text-lg font-display font-bold text-ink">{listing.images.length}</p>
                    <p className="text-[10px] font-medium text-ink">Photos</p>
                  </div>
                  <div className="bg-cream rounded-2xl p-3 text-center">
                    <p className="text-lg font-display font-bold text-ink">{Object.keys(listing.contact).length}</p>
                    <p className="text-[10px] font-medium text-ink">Contact methods</p>
                  </div>
                  <div className="bg-cream rounded-2xl p-3 text-center">
                    <p className="text-lg font-display font-bold text-ink">{listing.tags.length}</p>
                    <p className="text-[10px] font-medium text-ink">Tags</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">About</p>
                  <p className="text-ink leading-relaxed bg-cream rounded-2xl p-4">{listing.description}</p>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-brand-light rounded-xl text-sm font-medium text-ink">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Contact (only shown after match) */}
                <div className="p-4 bg-cream rounded-2xl text-center">
                  <MessageCircle size={20} className="text-ink mx-auto mb-2" />
                  <p className="text-sm font-medium text-ink">Contact info revealed after matching</p>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm z-40"
              onClick={closeSidebar}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-surface z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6 pb-10">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between mb-6">
                  {sidebarView !== 'menu' ? (
                    <button onClick={() => { setSidebarView('menu'); setEditErrors([]) }} className="p-2 rounded-xl hover:bg-cream transition-colors">
                      <ChevronLeft size={20} className="text-ink" />
                    </button>
                  ) : <div className="w-9" />}
                  <h2 className="text-lg font-display font-bold tracking-tight text-ink">
                    {sidebarView === 'menu' ? 'Menu' :
                     sidebarView === 'wishlist' ? 'Wishlist' :
                     sidebarView === 'listing' ? 'My Listing' :
                     sidebarView === 'edit' ? 'Edit Profile' :
                     sidebarView === 'preferences' ? 'Preferences' :
                     sidebarView === 'notifications' ? 'Notifications' :
                     sidebarView === 'help' ? 'Help Center' : 'Safety'}
                  </h2>
                  <button onClick={closeSidebar} className="p-2 rounded-xl hover:bg-cream transition-colors">
                    <X size={20} className="text-ink" />
                  </button>
                </div>

                {/* MENU VIEW (consolidated — all settings here) */}
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
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-ink truncate">{user?.name || 'Student'}</p>
                        <p className="text-xs text-ink truncate">{user?.institution || 'CoRenty'}</p>
                      </div>
                    </div>

                    <MenuItem icon={Heart} iconBg="bg-nope-light" iconColor="text-nope" label="Wishlist" desc={`${wishlist.length} saved`} badge={wishlist.length} onClick={() => setSidebarView('wishlist')} />
                    <MenuItem icon={Image} iconBg="bg-brand-light" iconColor="text-brand" label="My Listing" desc="View your listing" onClick={() => setSidebarView('listing')} />
                    <MenuItem icon={Edit3} iconBg="bg-cream" iconColor="text-ink" label="Edit Profile" desc="Update your info" onClick={openEdit} />
                    <MenuItem icon={Settings} iconBg="bg-cream" iconColor="text-ink" label="Preferences" desc="Budget, area, distance" onClick={() => setSidebarView('preferences')} />
                    <MenuItem icon={Bell} iconBg="bg-cream" iconColor="text-ink" label="Notifications" desc="Manage alerts" onClick={() => setSidebarView('notifications')} />

                    <div className="pt-3 border-t border-border mt-3 space-y-2">
                      <MenuItem icon={HelpCircle} iconBg="bg-cream" iconColor="text-ink" label="Help Center" desc="FAQs and support" onClick={() => setSidebarView('help')} />
                      <MenuItem icon={Lock} iconBg="bg-cream" iconColor="text-ink" label="Safety & Privacy" desc="Report, block, delete" onClick={() => setSidebarView('safety')} />
                    </div>

                    <div className="pt-3 border-t border-border mt-3">
                      <button
                        onClick={() => { localStorage.removeItem('corenty_onboarding_complete'); localStorage.removeItem('corenty_user'); onNavigate('landing') }}
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

                {/* WISHLIST VIEW */}
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
                          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-cream rounded-2xl p-4 flex gap-4 items-center">
                            <img src={item.images[0]} className="w-16 h-16 rounded-xl object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-brand uppercase tracking-wider">{item.institution}</p>
                              <p className="font-display font-bold text-sm text-ink truncate">{item.title}</p>
                              <p className="text-brand font-bold text-sm">{item.price}</p>
                            </div>
                            <button onClick={() => setWishlist(prev => prev.filter(id => id !== item.id))} className="p-2 text-ink hover:text-nope transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* MY LISTING VIEW */}
                {sidebarView === 'listing' && (
                  <div className="space-y-5">
                    {/* Profile section */}
                    <div className="flex items-center gap-4">
                      <img src={user?.profilePhoto || ''} className="w-14 h-14 rounded-full object-cover border-2 border-surface shadow-md" alt="" />
                      <div>
                        <h3 className="font-display font-bold text-ink">{user?.name || 'Student'}</h3>
                        <p className="text-sm text-ink">{user?.institution || ''}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Shield size={12} className="text-like" />
                          <span className="text-xs font-bold text-ink">Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {user?.bio && (
                      <div>
                        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">About</p>
                        <p className="text-ink bg-cream rounded-2xl p-4 leading-relaxed">{user.bio}</p>
                      </div>
                    )}

                    {/* Social links */}
                    {user?.socials && Object.values(user.socials).some((v: any) => v) && (
                      <div>
                        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Social links</p>
                        <div className="space-y-2">
                          {Object.entries(user.socials).filter(([_, v]) => v).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-3 px-4 py-2.5 bg-cream rounded-xl">
                              <SocialIcon name={key} />
                              <span className="text-sm font-medium text-ink capitalize">{key}</span>
                              <span className="text-sm text-ink ml-auto truncate max-w-[140px]">{val as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Apartment details (have mode) */}
                    {user?.mode === 'have' && (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Apartment</p>
                          <div className="bg-cream rounded-2xl p-4">
                            <h4 className="font-display font-bold text-ink">{user.apartmentTitle || 'Untitled'}</h4>
                            <p className="text-sm text-ink mt-1">₦{user.apartmentPrice || '0'}/yr · {user.apartmentLocation || 'No location'}</p>
                            {user.apartmentDesc && <p className="text-sm text-ink mt-2">{user.apartmentDesc}</p>}
                            <p className="text-xs text-ink mt-2">📍 {user.distanceToCampus || 2} km to campus</p>
                          </div>
                        </div>

                        {/* Apartment photos carousel */}
                        {user.apartmentPhotos?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Apartment photos</p>
                            <div className="relative rounded-2xl overflow-hidden bg-cream">
                              <AnimatePresence mode="wait">
                                <motion.img
                                  key={`apt-${carouselIndex}`}
                                  src={user.apartmentPhotos[carouselIndex % user.apartmentPhotos.length]}
                                  initial={{ x: 80, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  exit={{ x: -80, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="w-full h-48 object-cover"
                                  alt=""
                                />
                              </AnimatePresence>
                              {user.apartmentPhotos.length > 1 && (
                                <>
                                  <button onClick={() => prevCarouselImage()} className="absolute left-0 top-0 bottom-0 w-1/3" />
                                  <button onClick={() => nextCarouselImage()} className="absolute right-0 top-0 bottom-0 w-2/3" />
                                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                                    {user.apartmentPhotos.map((_: any, i: number) => (
                                      <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex % user.apartmentPhotos.length ? 'bg-white w-4' : 'bg-white/50'}`} />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Preferences (need mode) */}
                    {user?.mode === 'need' && (
                      <div>
                        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Looking for</p>
                        <div className="bg-cream rounded-2xl p-4 space-y-2">
                          <p className="text-sm text-ink">Budget: ₦{user.budget || '0'}/yr</p>
                          <p className="text-sm text-ink">Area: {user.preferredArea || 'Flexible'}</p>
                          <p className="text-sm text-ink">Max distance: {user.distanceToCampus || 2} km to campus</p>
                        </div>
                      </div>
                    )}

                    {/* Profile images */}
                    {user?.profileImages?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">More photos</p>
                        <div className="grid grid-cols-3 gap-2">
                          {user.profileImages.map((img: string, i: number) => (
                            <img key={i} src={img} className="aspect-square rounded-xl object-cover" alt="" />
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={openEdit} className="w-full py-3.5 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-colors flex items-center justify-center gap-2">
                      <Edit3 size={16} /> Edit listing
                    </button>
                  </div>
                )}

                {/* EDIT PROFILE VIEW */}
                {sidebarView === 'edit' && (
                  <div className="space-y-5">
                    {/* Errors */}
                    {editErrors.length > 0 && (
                      <div className="p-4 bg-nope-light border border-nope/20 rounded-2xl">
                        {editErrors.map((err, i) => (
                          <p key={i} className="text-sm text-nope font-medium flex items-center gap-2">
                            <AlertTriangle size={14} /> {err}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Success */}
                    {saveSuccess && (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-like-light border border-like/20 rounded-2xl text-center">
                        <Check size={24} className="text-like mx-auto mb-1" />
                        <p className="text-sm font-bold text-ink">Saved successfully!</p>
                      </motion.div>
                    )}

                    {/* Profile photo */}
                    <div>
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Profile photo *</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-cream border-2 border-border">
                          {editProfilePhoto ? (
                            <img src={editProfilePhoto} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera size={20} className="text-ink" />
                            </div>
                          )}
                        </div>
                        <label className="px-4 py-2 bg-cream rounded-xl text-sm font-medium text-ink cursor-pointer hover:bg-border transition-colors">
                          Change photo
                          <input type="file" accept="image/*" onChange={handleEditPhotoUpload('profile')} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">About you *</label>
                      <textarea
                        value={editBio}
                        onChange={e => setEditBio(e.target.value)}
                        placeholder="Tell potential roommates about yourself..."
                        rows={3}
                        maxLength={300}
                        className="w-full px-4 py-3 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 transition-all resize-none text-sm"
                      />
                      <p className="text-[10px] text-ink text-right mt-1">{editBio.length}/300</p>
                    </div>

                    {/* Social links */}
                    <div>
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Social links</label>
                      <div className="space-y-2">
                        {(['instagram', 'tiktok', 'facebook', 'whatsapp', 'email', 'twitter'] as const).map(key => (
                          <div key={key} className="flex items-center gap-2 px-3 py-2.5 bg-cream border border-border rounded-xl focus-within:border-ink/30">
                            <SocialIcon name={key} />
                            <input
                              type="text"
                              value={editSocials[key] || ''}
                              onChange={e => setEditSocials(s => ({ ...s, [key]: e.target.value }))}
                              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                              className="flex-1 bg-transparent text-sm font-medium text-ink focus:outline-none placeholder:text-ink/30"
                            />
                            {editSocials[key] && <button onClick={() => setEditSocials(s => ({ ...s, [key]: '' }))}><X size={12} className="text-ink" /></button>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Apartment details (have mode) */}
                    {user?.mode === 'have' && (
                      <>
                        <div className="pt-3 border-t border-border">
                          <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Apartment details</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Title</label>
                          <input
                            type="text"
                            value={editApartmentTitle}
                            onChange={e => setEditApartmentTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Price (₦/yr)</label>
                            <input
                              type="text"
                              value={editApartmentPrice}
                              onChange={e => setEditApartmentPrice(e.target.value)}
                              className="w-full px-4 py-3 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Location</label>
                            <input
                              type="text"
                              value={editApartmentLocation}
                              onChange={e => setEditApartmentLocation(e.target.value)}
                              className="w-full px-4 py-3 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Description</label>
                          <textarea
                            value={editApartmentDesc}
                            onChange={e => setEditApartmentDesc(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 resize-none text-sm"
                          />
                        </div>

                        {/* Apartment photos */}
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Apartment photos *</label>
                          <div className="grid grid-cols-4 gap-2">
                            {editApartmentPhotos.map((photo, i) => (
                              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-cream border border-border relative group">
                                <img src={photo} className="w-full h-full object-cover" alt="" />
                                <button
                                  onClick={() => setEditApartmentPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={10} className="text-cream" />
                                </button>
                              </div>
                            ))}
                            <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-ink/30 bg-cream">
                              <Plus size={16} className="text-ink" />
                              <input type="file" accept="image/*" multiple onChange={handleEditPhotoUpload('apartment')} className="hidden" />
                            </label>
                          </div>
                        </div>

                        {/* Distance slider */}
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Distance to campus</label>
                          <div className="bg-cream rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm text-ink">Walking distance</span>
                              <span className="text-xl font-display font-bold text-brand">{editDistance} km</span>
                            </div>
                            <input
                              type="range" min={0.5} max={10} step={0.5}
                              value={editDistance}
                              onChange={e => setEditDistance(parseFloat(e.target.value))}
                              className="w-full h-2 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #e85d04 0%, #e85d04 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 100%)`
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Preferences (need mode) */}
                    {user?.mode === 'need' && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Budget (₦/yr)</label>
                          <input
                            type="text"
                            value={editBudget}
                            onChange={e => setEditBudget(e.target.value)}
                            className="w-full px-4 py-3 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Preferred area</label>
                          <input
                            type="text"
                            value={editPreferredArea}
                            onChange={e => setEditPreferredArea(e.target.value)}
                            className="w-full px-4 py-3 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Max distance to campus</label>
                          <div className="bg-cream rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm text-ink">Walking distance</span>
                              <span className="text-xl font-display font-bold text-brand">{editDistance} km</span>
                            </div>
                            <input
                              type="range" min={0.5} max={10} step={0.5}
                              value={editDistance}
                              onChange={e => setEditDistance(parseFloat(e.target.value))}
                              className="w-full h-2 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #e85d04 0%, #e85d04 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 100%)`
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Profile images */}
                    <div>
                      <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">More photos</label>
                      <div className="grid grid-cols-4 gap-2">
                        {editProfileImages.map((img, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden bg-cream border border-border relative group">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                            <button
                              onClick={() => setEditProfileImages(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} className="text-cream" />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-ink/30 bg-cream">
                          <Plus size={16} className="text-ink" />
                          <input type="file" accept="image/*" multiple onChange={handleEditPhotoUpload('profileExtra')} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <button onClick={handleSaveProfile} className="w-full py-3.5 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-colors flex items-center justify-center gap-2">
                      <Check size={16} /> Save changes
                    </button>
                  </div>
                )}

                {/* PREFERENCES VIEW */}
                {sidebarView === 'preferences' && (
                  <div className="space-y-5">
                    {user?.mode === 'have' ? (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-3 block">Distance from apartment to campus</label>
                          <div className="bg-cream rounded-2xl p-5">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-sm font-medium text-ink">Walking distance</span>
                              <span className="text-2xl font-display font-bold text-brand">{editDistance} km</span>
                            </div>
                            <input
                              type="range" min={0.5} max={10} step={0.5}
                              value={editDistance}
                              onChange={e => setEditDistance(parseFloat(e.target.value))}
                              className="w-full h-2 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #e85d04 0%, #e85d04 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 100%)`
                              }}
                            />
                            <div className="flex justify-between mt-2">
                              <span className="text-[10px] text-ink">0.5 km</span>
                              <span className="text-[10px] text-ink">5 km</span>
                              <span className="text-[10px] text-ink">10 km</span>
                            </div>
                            <div className="mt-3 px-3 py-2 bg-surface rounded-xl">
                              <span className="text-xs text-ink">
                                {editDistance <= 1 ? '🚶 Right on campus!' :
                                 editDistance <= 3 ? '🚶 Easy walk' :
                                 editDistance <= 5 ? '🚌 Short commute' : '🚗 Longer commute'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedUser = { ...user, distanceToCampus: editDistance }
                            onNavigate('dashboard', updatedUser)
                            setSaveSuccess(true)
                            setTimeout(() => setSaveSuccess(false), 2000)
                          }}
                          className="w-full py-3 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-colors"
                        >
                          Save preferences
                        </button>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Budget (₦/yr)</label>
                          <input
                            type="text"
                            value={editBudget}
                            onChange={e => setEditBudget(e.target.value)}
                            placeholder="e.g. 200,000"
                            className="w-full px-4 py-3 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">Preferred area</label>
                          <input
                            type="text"
                            value={editPreferredArea}
                            onChange={e => setEditPreferredArea(e.target.value)}
                            placeholder="e.g. Akoka, Yaba"
                            className="w-full px-4 py-3 bg-cream border border-border rounded-2xl font-medium text-ink focus:outline-none focus:border-ink/30 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-ink uppercase tracking-wider mb-3 block">Max distance to campus</label>
                          <div className="bg-cream rounded-2xl p-5">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-sm font-medium text-ink">Walking distance</span>
                              <span className="text-2xl font-display font-bold text-brand">{editDistance} km</span>
                            </div>
                            <input
                              type="range" min={0.5} max={10} step={0.5}
                              value={editDistance}
                              onChange={e => setEditDistance(parseFloat(e.target.value))}
                              className="w-full h-2 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #e85d04 0%, #e85d04 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 100%)`
                              }}
                            />
                            <div className="flex justify-between mt-2">
                              <span className="text-[10px] text-ink">0.5 km</span>
                              <span className="text-[10px] text-ink">5 km</span>
                              <span className="text-[10px] text-ink">10 km</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedUser = { ...user, distanceToCampus: editDistance, budget: editBudget, preferredArea: editPreferredArea }
                            onNavigate('dashboard', updatedUser)
                            setSaveSuccess(true)
                            setTimeout(() => setSaveSuccess(false), 2000)
                          }}
                          className="w-full py-3 bg-ink text-cream rounded-2xl font-semibold hover:bg-ink/90 transition-colors"
                        >
                          Save preferences
                        </button>
                      </>
                    )}
                    {saveSuccess && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-like-light rounded-2xl text-center">
                        <p className="text-sm font-bold text-ink">✓ Preferences saved</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* NOTIFICATIONS VIEW */}
                {sidebarView === 'notifications' && (
                  <div className="space-y-3">
                    <p className="text-sm text-ink mb-4">Choose which notifications you want to receive.</p>
                    <NotifToggle label="New matches" desc="Get notified when someone matches with you" value={notifMatches} onChange={setNotifMatches} />
                    <NotifToggle label="Messages" desc="Alerts for new contact from matches" value={notifMessages} onChange={setNotifMessages} />
                    <NotifToggle label="App updates" desc="New features and improvements" value={notifUpdates} onChange={setNotifUpdates} />
                    <div className="pt-4 mt-4 border-t border-border">
                      <p className="text-xs text-ink">Notification preferences are saved locally on your device.</p>
                    </div>
                  </div>
                )}

                {/* HELP CENTER VIEW */}
                {sidebarView === 'help' && (
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="bg-cream rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-semibold text-sm text-ink pr-4">{faq.q}</span>
                          {openFaq === i ? <ChevronUp size={16} className="text-ink shrink-0" /> : <ChevronDown size={16} className="text-ink shrink-0" />}
                        </button>
                        <AnimatePresence>
                          {openFaq === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="px-4 pb-4 text-sm text-ink leading-relaxed">{faq.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    <div className="pt-4 mt-4 border-t border-border text-center">
                      <p className="text-sm font-medium text-ink mb-1">Need more help?</p>
                      <p className="text-xs text-ink">Email us at support@corenty.app</p>
                    </div>
                  </div>
                )}

                {/* SAFETY VIEW */}
                {sidebarView === 'safety' && (
                  <div className="space-y-5">
                    <div className="bg-cream rounded-2xl p-5">
                      <h3 className="font-display font-bold text-ink mb-2">Stay safe</h3>
                      <p className="text-sm text-ink leading-relaxed">
                        Always meet in public places for the first time. Never share financial information. Trust your instincts — if something feels off, report it.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button className="w-full flex items-center gap-4 p-4 bg-cream rounded-2xl hover:bg-border transition-colors text-left">
                        <div className="w-10 h-10 rounded-xl bg-nope-light flex items-center justify-center">
                          <AlertTriangle size={18} className="text-nope" />
                        </div>
                        <div className="flex-1">
                          <p className="font-display font-semibold text-sm text-ink">Report a user</p>
                          <p className="text-xs text-ink">Flag inappropriate behavior</p>
                        </div>
                        <ChevronRight size={16} className="text-ink" />
                      </button>

                      <button className="w-full flex items-center gap-4 p-4 bg-cream rounded-2xl hover:bg-border transition-colors text-left">
                        <div className="w-10 h-10 rounded-xl bg-nope-light flex items-center justify-center">
                          <Lock size={18} className="text-nope" />
                        </div>
                        <div className="flex-1">
                          <p className="font-display font-semibold text-sm text-ink">Block a user</p>
                          <p className="text-xs text-ink">Prevent someone from seeing you</p>
                        </div>
                        <ChevronRight size={16} className="text-ink" />
                      </button>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <button
                        onClick={() => {
                          localStorage.removeItem('corenty_onboarding_complete')
                          localStorage.removeItem('corenty_user')
                          onNavigate('landing')
                        }}
                        className="w-full py-3 bg-nope-light text-nope rounded-2xl font-semibold hover:bg-nope/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> Delete account
                      </button>
                      <p className="text-[10px] text-ink text-center mt-2">This will remove all your data from this device.</p>
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

// Sub-components

const MenuItem: React.FC<{
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  desc: string
  badge?: number
  onClick: () => void
}> = ({ icon: Icon, iconBg, iconColor, label, desc, badge, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-cream transition-all text-left">
    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
      <Icon size={18} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-display font-semibold text-ink">{label}</p>
      <p className="text-xs text-ink truncate">{desc}</p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {badge !== undefined && badge > 0 && (
        <span className="w-6 h-6 rounded-full bg-nope text-white text-xs font-bold flex items-center justify-center">{badge}</span>
      )}
      <ChevronRight size={16} className="text-ink" />
    </div>
  </button>
)

const SocialIcon: React.FC<{ name: string }> = ({ name }) => {
  const iconClass = "text-ink shrink-0"
  switch (name) {
    case 'instagram': return <Instagram size={14} className={iconClass} />
    case 'facebook': return <Facebook size={14} className={iconClass} />
    case 'whatsapp': return <Phone size={14} className={iconClass} />
    case 'email': return <Mail size={14} className={iconClass} />
    case 'twitter': return <AtSign size={14} className={iconClass} />
    case 'tiktok': return <span className="text-[10px] font-bold text-ink">TT</span>
    default: return <AtSign size={14} className={iconClass} />
  }
}

const NotifToggle: React.FC<{ label: string; desc: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, desc, value, onChange }) => (
  <div className="flex items-center gap-4 p-4 bg-cream rounded-2xl">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${value ? 'bg-like-light' : 'bg-border'}`}>
      {value ? <Bell size={18} className="text-like" /> : <BellOff size={18} className="text-ink" />}
    </div>
    <div className="flex-1">
      <p className="font-display font-semibold text-sm text-ink">{label}</p>
      <p className="text-xs text-ink">{desc}</p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-7 rounded-full transition-all relative ${value ? 'bg-like' : 'bg-border'}`}
    >
      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'right-1' : 'left-1'}`} />
    </button>
  </div>
)

export default Dashboard
/usr/bin/bash: line 5: /Users/H-P/.hermes-zechy/cache/terminal/hermes-snap-c0937a4a9e96.sh: No such file or directory
/usr/bin/bash: line 6: /Users/H-P/.hermes-zechy/cache/terminal/hermes-cwd-c0937a4a9e96.txt: No such file or directory
/usr/bin/bash: line 5: /Users/H-P/.hermes-zechy/cache/terminal/hermes-snap-c0937a4a9e96.sh: No such file or directory
/usr/bin/bash: line 6: /Users/H-P/.hermes-zechy/cache/terminal/hermes-cwd-c0937a4a9e96.txt: No such file or directory
