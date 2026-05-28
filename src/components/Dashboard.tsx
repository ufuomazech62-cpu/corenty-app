import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import {
  Heart, X, MapPin, Home, Info, Sparkles, Phone, Mail,
  Settings, User, LogOut, ChevronRight, ChevronLeft, Edit3, Trash2, Shield,
  Plus, Camera, Check, Bell, BellOff, HelpCircle, Lock,
  ChevronDown, ChevronUp, Image, MessageCircle, AlertTriangle, Eye
} from 'lucide-react'
import { TikTokIcon, InstagramIcon, FacebookIcon, XIcon, WhatsAppIcon } from './BrandIcons'

interface Listing {
  id: number; title: string; price: string; institution: string; location: string
  author: string; description: string; verified: boolean; images: string[]
  authorImages: string[]; tags: string[]; mode: 'have' | 'need'; contact: Record<string, string>
}

const LISTINGS: Listing[] = [
  { id: 1, title: 'Modern Room near UNILAG', price: '₦250k/yr', institution: 'University of Lagos', location: 'Akoka, Yaba', author: 'Tunde O.', description: 'Looking for a clean and quiet roommate. Non-smoker preferred. 24/7 security and stable water supply.', verified: true, mode: 'have', images: ['https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=800'], authorImages: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'], tags: ['WiFi', 'Security', 'Water'], contact: { whatsapp: '+234 801 234 5678', email: 'tunde.o@email.com', instagram: '@tunde_o' } },
  { id: 2, title: 'Looking for roommate near UI', price: '₦300k/yr', institution: 'University of Ibadan', location: 'Bodija, Ibadan', author: 'Sarah E.', description: "Female student looking for someone to split rent with. Let's find a place together near campus.", verified: true, mode: 'need', images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800'], authorImages: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'], tags: ['Female only', 'Quiet', 'Serious'], contact: { whatsapp: '+234 908 765 4321', email: 'sarah.e@email.com', tiktok: '@sarah.e' } },
  { id: 3, title: 'Executive Studio near Campus', price: '₦180k/yr', institution: 'Covenant University', location: 'Ota, Ogun', author: 'Daniel J.', description: 'Sharing a self-contain apartment. Very close to school gate.', verified: false, mode: 'have', images: ['https://images.unsplash.com/photo-1555854817-5b2260408544?auto=format&fit=crop&q=80&w=800'], authorImages: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'], tags: ['Affordable', 'Near Gate'], contact: { email: 'daniel.j@email.com', instagram: '@danielj_', facebook: 'Daniel Johnson' } },
  { id: 4, title: 'Need roommate — Yaba area', price: '₦200k/yr', institution: 'YabaTech', location: 'Yaba, Lagos', author: 'Chidi N.', description: 'Polytechnic student looking for someone to share a flat with.', verified: true, mode: 'need', images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800'], authorImages: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'], tags: ['Budget', 'Friendly', 'Near campus'], contact: { whatsapp: '+234 812 345 6789', instagram: '@chidi_n' } },
]

type SidebarView = 'menu' | 'wishlist' | 'listing' | 'edit' | 'preferences' | 'notifications' | 'help' | 'safety'
type ModalView = 'none' | 'profile' | 'detail' | 'fullProfile'

interface DashboardProps { onNavigate: (page: string, data?: any) => void; user: any }

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [modalView, setModalView] = useState<ModalView>('none')
  const [wishlist, setWishlist] = useState<number[]>([])
  const [matchPopup, setMatchPopup] = useState<Listing | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarView, setSidebarView] = useState<SidebarView>('menu')
  const [carouselIndex, setCarouselIndex] = useState(0)

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
  const [notifMatches, setNotifMatches] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const listing = LISTINGS[currentIndex % LISTINGS.length]
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const likeOpacity = useTransform(x, [0, 80], [0, 1])
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0])

  const handleSwipe = (dir: 'left' | 'right') => {
    if (dir === 'right') { setWishlist(prev => [...new Set([...prev, listing.id])]); setMatchPopup(listing) }
    setTimeout(() => setCurrentIndex(prev => prev + 1), 300)
  }
  const handleDragEnd = (_: any, info: any) => { if (info.offset.x > 100) handleSwipe('right'); else if (info.offset.x < -100) handleSwipe('left') }
  const wishlistItems = LISTINGS.filter(l => wishlist.includes(l.id))

  const handleSaveProfile = () => {
    const errors: string[] = []
    if (!editBio.trim()) errors.push('Bio is required')
    if (!editProfilePhoto) errors.push('Profile photo required')
    if (user?.mode === 'have' && editApartmentPhotos.length === 0) errors.push('At least 1 apartment photo required')
    if (errors.length > 0) { setEditErrors(errors); return }
    setEditErrors([])
    const updatedUser = { ...user, bio: editBio, socials: editSocials, apartmentDesc: editApartmentDesc, apartmentTitle: editApartmentTitle, apartmentPrice: editApartmentPrice, apartmentLocation: editApartmentLocation, profileImages: editProfileImages, apartmentPhotos: editApartmentPhotos, profilePhoto: editProfilePhoto, distanceToCampus: editDistance, budget: editBudget, preferredArea: editPreferredArea }
    onNavigate('dashboard', updatedUser)
    setSaveSuccess(true)
    setTimeout(() => { setSaveSuccess(false); setSidebarView('menu') }, 1500)
  }

  const openEdit = () => {
    setEditBio(user?.bio || ''); setEditSocials(user?.socials || { tiktok: '', instagram: '', facebook: '', whatsapp: '', email: '', twitter: '' })
    setEditApartmentDesc(user?.apartmentDesc || ''); setEditApartmentTitle(user?.apartmentTitle || '')
    setEditApartmentPrice(user?.apartmentPrice || ''); setEditApartmentLocation(user?.apartmentLocation || '')
    setEditProfileImages(user?.profileImages || []); setEditApartmentPhotos(user?.apartmentPhotos || [])
    setEditProfilePhoto(user?.profilePhoto || null); setEditDistance(user?.distanceToCampus || 2)
    setEditBudget(user?.budget || ''); setEditPreferredArea(user?.preferredArea || '')
    setEditErrors([]); setSidebarView('edit')
  }

  const closeSidebar = () => { setSidebarOpen(false); setSidebarView('menu'); setEditErrors([]); setSaveSuccess(false) }

  const handleEditPhotoUpload = (type: 'profile' | 'profileExtra' | 'apartment') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return
    if (type === 'profile') { const f = files[0]; if (f && f.type.startsWith('image/')) setEditProfilePhoto(URL.createObjectURL(f)) }
    else if (type === 'profileExtra') { Array.from(files).forEach(f => { if (f.type.startsWith('image/')) setEditProfileImages(prev => [...prev, URL.createObjectURL(f)]) }) }
    else { Array.from(files).forEach(f => { if (f.type.startsWith('image/')) setEditApartmentPhotos(prev => [...prev, URL.createObjectURL(f)]) }) }
  }

  const faqs = [
    { q: 'How does matching work?', a: 'Swipe right on listings you like. When both students swipe right, it\'s a match! You\'ll see their contact details.' },
    { q: 'Is my data safe?', a: 'All data is stored locally. We verify every student. Contact info is only shared after a mutual match.' },
    { q: 'Can I change preferences?', a: 'Yes! Menu > Preferences to update budget, area, and distance.' },
    { q: 'How do I report someone?', a: 'Menu > Safety to report or block users.' },
  ]

  const socialEntries = (s: Record<string, string>) => Object.entries(s).filter(([_, v]) => v)
  const socialIcon = (key: string, sz = 14) => {
    switch (key) {
      case 'instagram': return <InstagramIcon size={sz} />
      case 'tiktok': return <TikTokIcon size={sz} />
      case 'facebook': return <FacebookIcon size={sz} />
      case 'whatsapp': return <WhatsAppIcon size={sz} />
      case 'twitter': return <XIcon size={sz} />
      case 'email': return <Mail size={sz} />
      default: return <Mail size={sz} />
    }
  }

  const carouselImages = user?.mode === 'have' ? (user?.apartmentPhotos || []) : (user?.profileImages || [])

  return (
    <div className="h-[100dvh] flex flex-col bg-cream relative overflow-hidden">
      {/* Header */}
      <header className="glass border-b border-border px-5 py-3 flex items-center justify-between shrink-0 z-30">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-ink flex items-center justify-center"><Home className="w-3.5 h-3.5 text-cream" strokeWidth={2} /></div>
          <span className="text-base font-display font-bold tracking-[-0.03em] text-ink">CoRenty</span>
        </button>
        <button onClick={() => { setSidebarOpen(true); setSidebarView('menu') }} className="w-9 h-9 rounded-lg bg-cream border border-border flex items-center justify-center hover:border-ink/20 transition-all active:scale-95">
          <div className="grid grid-cols-3 gap-[3px]">{[...Array(9)].map((_, i) => (<div key={i} className="w-[3px] h-[3px] rounded-full bg-ink" />))}</div>
        </button>
      </header>

      {/* Card Stage — fills available space */}
      <main className="flex-1 relative flex items-center justify-center px-5 py-3 min-h-0">
        <div className="absolute inset-x-8 bottom-8 h-2.5 bg-surface/60 rounded-[24px] scale-[0.94] -z-10" />
        <div className="absolute inset-x-6 bottom-10 h-2.5 bg-surface/80 rounded-[24px] scale-[0.97] -z-10" />
        <AnimatePresence mode="popLayout">
          <motion.div key={listing.id} style={{ x, rotate }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={1} onDragEnd={handleDragEnd} initial={{ scale: 0.96, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} whileDrag={{ scale: 1.02, cursor: 'grabbing' }} className="absolute w-full max-w-[360px] h-full max-h-[calc(100%-16px)] bg-surface rounded-[28px] shadow-2xl shadow-ink/8 overflow-hidden cursor-grab select-none border border-border-light flex flex-col" onClick={() => setModalView('detail')}>
            <div className="relative h-[55%] w-full overflow-hidden shrink-0">
              <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-surface/95 backdrop-blur-md rounded-full">
                <div className={`w-1.5 h-1.5 rounded-full ${listing.mode === 'have' ? 'bg-like' : 'bg-brand'}`} />
                <span className="text-[9px] font-semibold text-ink">{listing.mode === 'have' ? 'Has a place' : 'Needs a place'}</span>
                {listing.verified && <><span className="text-ink-tertiary">·</span><span className="text-[9px] font-semibold text-ink">Verified</span></>}
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-surface/95 backdrop-blur-md rounded-lg"><span className="text-xs font-display font-bold text-ink">{listing.price}</span></div>
              <motion.div style={{ opacity: likeOpacity }} className="absolute top-16 left-6 z-30 px-4 py-2 border-[3px] border-like rounded-xl rotate-[-12deg]"><span className="text-like font-display font-bold text-lg tracking-tight">LIKE</span></motion.div>
              <motion.div style={{ opacity: nopeOpacity }} className="absolute top-16 right-6 z-30 px-4 py-2 border-[3px] border-nope rounded-xl rotate-[12deg]"><span className="text-nope font-display font-bold text-lg tracking-tight">NOPE</span></motion.div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2 className="text-white text-xl font-display font-bold tracking-tight mb-1">{listing.title}</h2>
                <div className="flex items-center gap-1.5"><MapPin size={11} className="text-white/60" /><span className="text-white/70 text-xs">{listing.location}</span></div>
              </div>
            </div>
            <div className="flex-1 p-5 flex flex-col justify-between min-h-0">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <button onClick={e => { e.stopPropagation(); setModalView('profile') }}><img src={listing.authorImages[0]} className="w-9 h-9 rounded-full object-cover border-2 border-surface shadow-sm" alt="" /></button>
                  <div><p className="font-display font-semibold text-xs text-ink">{listing.author}</p><p className="text-[10px] text-ink">{listing.institution}</p></div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">{listing.tags.map(tag => (<span key={tag} className="px-2.5 py-0.5 bg-cream rounded-md text-[10px] font-medium text-ink">{tag}</span>))}</div>
                <p className="text-xs text-ink leading-relaxed line-clamp-2">{listing.description}</p>
              </div>
              <div className="flex items-center justify-center pt-2 text-[10px] text-ink gap-1"><Info size={10} /> Tap for details</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Action Buttons */}
      <div className="relative z-10 pb-8 pt-2 flex items-center justify-center gap-5 shrink-0">
        <button onClick={() => handleSwipe('left')} className="w-14 h-14 rounded-full bg-surface border-2 border-nope/20 flex items-center justify-center shadow-lg hover:border-nope/40 transition-all active:scale-95"><X size={22} className="text-nope" strokeWidth={2.5} /></button>
        <button onClick={() => handleSwipe('right')} className="w-14 h-14 rounded-full bg-like flex items-center justify-center shadow-lg shadow-like/30 transition-all active:scale-95"><Heart size={22} className="text-white" strokeWidth={2.5} fill="white" /></button>
      </div>

      {/* Match Popup */}
      <AnimatePresence>
        {matchPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm px-6" onClick={() => setMatchPopup(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-surface rounded-[28px] p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-like to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-like/30"><Sparkles size={28} className="text-white" /></div>
              <h2 className="text-xl font-display font-bold tracking-tight mb-1 text-ink">It's a match!</h2>
              <p className="text-xs text-ink mb-4">Here's how to reach {matchPopup.author}:</p>
              <div className="space-y-2 mb-5 max-h-[40vh] overflow-y-auto">
                {socialEntries(matchPopup.contact).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3 px-3 py-2.5 bg-cream rounded-xl text-ink font-medium">
                    {socialIcon(key, 16)} <span className="text-sm truncate">{val}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setMatchPopup(null)} className="w-full py-3 bg-ink text-cream rounded-xl font-semibold text-sm">Keep swiping</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {modalView === 'detail' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-ink/40 backdrop-blur-sm" onClick={() => setModalView('none')}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[28px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 pb-8">
                <div className="w-10 h-1.5 bg-border rounded-full mx-auto mb-6" />
                <div className="relative h-48 rounded-2xl overflow-hidden mb-4"><img src={listing.images[0]} className="w-full h-full object-cover" alt="" /></div>
                <div className="flex items-start justify-between mb-3">
                  <div><h2 className="text-lg font-display font-bold tracking-tight text-ink">{listing.title}</h2><p className="text-xs text-ink mt-0.5">{listing.location}</p></div>
                  <span className="text-lg font-display font-bold text-brand">{listing.price}</span>
                </div>
                <button onClick={() => setModalView('profile')} className="flex items-center gap-3 p-3 bg-cream rounded-xl mb-4 w-full">
                  <img src={listing.authorImages[0]} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div className="text-left flex-1"><p className="font-display font-semibold text-sm text-ink">{listing.author}</p><p className="text-[10px] text-ink">{listing.institution}</p></div>
                  <Eye size={14} className="text-ink" />
                </button>
                <div className="flex flex-wrap gap-1.5 mb-3">{listing.tags.map(tag => (<span key={tag} className="px-3 py-1 bg-brand-light text-ink rounded-lg text-xs font-semibold">{tag}</span>))}</div>
                <p className="text-xs text-ink leading-relaxed mb-6">{listing.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setModalView('none'); handleSwipe('left') }} className="flex-1 py-3 bg-cream rounded-xl font-semibold text-ink text-sm flex items-center justify-center gap-1.5"><X size={14} /> Pass</button>
                  <button onClick={() => { setModalView('none'); handleSwipe('right') }} className="flex-1 py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"><Heart size={14} fill="white" /> Match</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {modalView === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-ink/40 backdrop-blur-sm" onClick={() => setModalView('none')}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[28px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-5 pb-8">
                <div className="w-10 h-1.5 bg-border rounded-full mx-auto mb-5" />
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => setModalView('fullProfile')} className="shrink-0 relative group">
                    <img src={listing.authorImages[0]} className="w-14 h-14 rounded-full object-cover border-[3px] border-surface shadow-lg group-hover:scale-105 transition-transform" alt="" />
                    <div className="absolute inset-0 rounded-full bg-ink/0 group-hover:bg-ink/10 transition-colors flex items-center justify-center"><Eye size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" /></div>
                  </button>
                  <div><h3 className="text-lg font-display font-bold text-ink">{listing.author}</h3><p className="text-xs text-ink">{listing.institution}</p>{listing.verified && <div className="flex items-center gap-1 mt-0.5"><Shield size={10} className="text-like" /><span className="text-[10px] font-bold text-ink">Verified</span></div>}</div>
                </div>
                {/* Carousel */}
                {listing.images.length > 0 && (
                  <div className="mb-5">
                    <div className="relative rounded-2xl overflow-hidden bg-cream">
                      <AnimatePresence mode="wait"><motion.img key={carouselIndex} src={listing.images[carouselIndex % listing.images.length]} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.2 }} className="w-full h-44 object-cover" alt="" /></AnimatePresence>
                      {listing.images.length > 1 && (<><button onClick={() => setCarouselIndex(i => (i - 1 + listing.images.length) % listing.images.length)} className="absolute left-0 top-0 bottom-0 w-1/3" /><button onClick={() => setCarouselIndex(i => (i + 1) % listing.images.length)} className="absolute right-0 top-0 bottom-0 w-2/3" /><div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">{listing.images.map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === carouselIndex % listing.images.length ? 'bg-white w-3' : 'bg-white/50'}`}/>))}</div></>)}
                    </div>
                  </div>
                )}
                <div className="flex items-start justify-between mb-3"><div><h4 className="font-display font-bold text-sm text-ink">{listing.title}</h4><p className="text-[10px] text-ink">{listing.location}</p></div><span className="text-base font-display font-bold text-brand">{listing.price}</span></div>
                <p className="text-xs text-ink leading-relaxed mb-5">{listing.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => setModalView('none')} className="flex-1 py-3 bg-cream rounded-xl font-semibold text-ink text-sm">Close</button>
                  <button onClick={() => { setModalView('none'); handleSwipe('right') }} className="flex-1 py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"><Heart size={14} fill="white" /> Match</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Profile */}
      <AnimatePresence>
        {modalView === 'fullProfile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] bg-ink/50 backdrop-blur-sm" onClick={() => setModalView('profile')}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="absolute inset-4 bg-surface rounded-[28px] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-5">
                <div className="flex justify-between items-center mb-4"><h3 className="text-base font-display font-bold text-ink">Full Profile</h3><button onClick={() => setModalView('profile')} className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center"><X size={16} className="text-ink" /></button></div>
                <div className="flex justify-center mb-4"><img src={listing.authorImages[0]} className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-xl" alt="" /></div>
                <div className="text-center mb-5"><h2 className="text-xl font-display font-bold text-ink">{listing.author}</h2><p className="text-xs text-ink mt-0.5">{listing.institution}</p><div className="flex items-center justify-center gap-1.5 mt-1.5"><div className={`w-2 h-2 rounded-full ${listing.mode === 'have' ? 'bg-like' : 'bg-brand'}`} /><span className="text-xs font-medium text-ink">{listing.mode === 'have' ? 'Has a place' : 'Needs a place'}</span></div></div>
                <div className="grid grid-cols-3 gap-2 mb-4"><div className="bg-cream rounded-xl p-2.5 text-center"><p className="text-base font-display font-bold text-ink">{listing.images.length}</p><p className="text-[9px] font-medium text-ink">Photos</p></div><div className="bg-cream rounded-xl p-2.5 text-center"><p className="text-base font-display font-bold text-ink">{Object.keys(listing.contact).length}</p><p className="text-[9px] font-medium text-ink">Contacts</p></div><div className="bg-cream rounded-xl p-2.5 text-center"><p className="text-base font-display font-bold text-ink">{listing.tags.length}</p><p className="text-[9px] font-medium text-ink">Tags</p></div></div>
                <p className="text-xs text-ink leading-relaxed bg-cream rounded-xl p-3 mb-4">{listing.description}</p>
                <div className="p-3 bg-cream rounded-xl text-center"><MessageCircle size={16} className="text-ink mx-auto mb-1" /><p className="text-xs font-medium text-ink">Contact info revealed after matching</p></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/50 backdrop-blur-sm z-40" onClick={closeSidebar} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute right-0 top-0 bottom-0 w-full max-w-[340px] bg-surface z-50 shadow-2xl flex flex-col">
              {/* Sidebar Header */}
              <div className="px-5 py-3 flex items-center justify-between shrink-0 border-b border-border">
                {sidebarView !== 'menu' ? <button onClick={() => { setSidebarView('menu'); setEditErrors([]) }} className="p-1.5 rounded-lg hover:bg-cream"><ChevronLeft size={18} className="text-ink" /></button> : <div className="w-7" />}
                <h2 className="text-sm font-display font-bold text-ink">{sidebarView === 'menu' ? 'Menu' : sidebarView === 'wishlist' ? 'Wishlist' : sidebarView === 'listing' ? 'My Listing' : sidebarView === 'edit' ? 'Edit Profile' : sidebarView === 'preferences' ? 'Preferences' : sidebarView === 'notifications' ? 'Notifications' : sidebarView === 'help' ? 'Help' : 'Safety'}</h2>
                <button onClick={closeSidebar} className="p-1.5 rounded-lg hover:bg-cream"><X size={18} className="text-ink" /></button>
              </div>

              {/* Sidebar Body — scrollable within panel */}
              <div className="flex-1 overflow-y-auto p-5">

                {/* MENU */}
                {sidebarView === 'menu' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 p-3 bg-cream rounded-xl mb-3">
                      <div className="w-10 h-10 rounded-full bg-border overflow-hidden">{user?.profilePhoto ? <img src={user.profilePhoto} className="w-full h-full object-cover" /> : <User size={18} className="text-ink" />}</div>
                      <div className="min-w-0"><p className="font-display font-bold text-sm text-ink truncate">{user?.name || 'Student'}</p><p className="text-[10px] text-ink truncate">{user?.institution || 'CoRenty'}</p></div>
                    </div>
                    <MenuItem icon={Heart} iconBg="bg-nope-light" iconColor="text-nope" label="Wishlist" desc={`${wishlist.length} saved`} badge={wishlist.length} onClick={() => setSidebarView('wishlist')} />
                    <MenuItem icon={Image} iconBg="bg-brand-light" iconColor="text-brand" label="My Listing" desc="View your listing" onClick={() => setSidebarView('listing')} />
                    <MenuItem icon={Edit3} iconBg="bg-cream" iconColor="text-ink" label="Edit Profile" desc="Update your info" onClick={openEdit} />
                    <MenuItem icon={Settings} iconBg="bg-cream" iconColor="text-ink" label="Preferences" desc="Budget, area, distance" onClick={() => setSidebarView('preferences')} />
                    <MenuItem icon={Bell} iconBg="bg-cream" iconColor="text-ink" label="Notifications" desc="Manage alerts" onClick={() => setSidebarView('notifications')} />
                    <div className="pt-2 border-t border-border mt-2 space-y-1.5">
                      <MenuItem icon={HelpCircle} iconBg="bg-cream" iconColor="text-ink" label="Help" desc="FAQs" onClick={() => setSidebarView('help')} />
                      <MenuItem icon={Lock} iconBg="bg-cream" iconColor="text-ink" label="Safety" desc="Report, block, delete" onClick={() => setSidebarView('safety')} />
                    </div>
                    <div className="pt-2 border-t border-border mt-2">
                      <button onClick={() => { localStorage.removeItem('corenty_onboarding_complete'); localStorage.removeItem('corenty_user'); onNavigate('landing') }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-nope-light transition-all text-left">
                        <div className="w-8 h-8 rounded-lg bg-nope-light flex items-center justify-center"><LogOut size={14} className="text-nope" /></div>
                        <p className="font-display font-semibold text-sm text-nope">Sign out</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* WISHLIST */}
                {sidebarView === 'wishlist' && (
                  <div>
                    {wishlistItems.length === 0 ? (
                      <div className="text-center py-12"><div className="w-14 h-14 rounded-2xl bg-nope-light flex items-center justify-center mx-auto mb-3"><Heart size={24} className="text-nope" /></div><h3 className="font-display font-bold text-sm text-ink mb-1">No matches yet</h3><p className="text-xs text-ink">Swipe right to save listings.</p></div>
                    ) : (
                      <div className="space-y-2">{wishlistItems.map(item => (<div key={item.id} className="bg-cream rounded-xl p-3 flex gap-3 items-center"><img src={item.images[0]} className="w-12 h-12 rounded-lg object-cover" /><div className="flex-1 min-w-0"><p className="font-display font-bold text-xs text-ink truncate">{item.title}</p><p className="text-brand font-bold text-xs">{item.price}</p></div><button onClick={() => setWishlist(prev => prev.filter(id => id !== item.id))} className="p-1.5 text-ink hover:text-nope"><Trash2 size={14} /></button></div>))}</div>
                    )}
                  </div>
                )}

                {/* MY LISTING */}
                {sidebarView === 'listing' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img src={user?.profilePhoto || ''} className="w-11 h-11 rounded-full object-cover border-2 border-surface shadow-md" />
                      <div><h3 className="font-display font-bold text-sm text-ink">{user?.name || 'Student'}</h3><p className="text-[10px] text-ink">{user?.institution || ''}</p><div className="flex items-center gap-1 mt-0.5"><Shield size={10} className="text-like" /><span className="text-[9px] font-bold text-ink">Verified</span></div></div>
                    </div>
                    {user?.bio && <div><p className="text-[9px] font-semibold text-ink uppercase tracking-wider mb-1">About</p><p className="text-xs text-ink bg-cream rounded-xl p-3">{user.bio}</p></div>}
                    {user?.socials && Object.values(user.socials).some((v: any) => v) && (
                      <div><p className="text-[9px] font-semibold text-ink uppercase tracking-wider mb-1">Socials</p><div className="space-y-1.5">{socialEntries(user.socials).map(([key, val]) => (<div key={key} className="flex items-center gap-2.5 px-3 py-2 bg-cream rounded-lg">{socialIcon(key, 13)}<span className="text-xs text-ink truncate">{val as string}</span></div>))}</div></div>
                    )}
                    {user?.mode === 'have' && (
                      <>
                        <div><p className="text-[9px] font-semibold text-ink uppercase tracking-wider mb-1">Apartment</p><div className="bg-cream rounded-xl p-3"><h4 className="font-display font-bold text-xs text-ink">{user.apartmentTitle || 'Untitled'}</h4><p className="text-[10px] text-ink mt-0.5">₦{user.apartmentPrice}/yr · {user.apartmentLocation}</p>{user.apartmentDesc && <p className="text-[10px] text-ink mt-1">{user.apartmentDesc}</p>}<p className="text-[10px] text-ink mt-1">📍 {user.distanceToCampus || 2} km to campus</p></div></div>
                        {user.apartmentPhotos?.length > 0 && (<div><p className="text-[9px] font-semibold text-ink uppercase tracking-wider mb-1">Photos</p><div className="relative rounded-xl overflow-hidden bg-cream"><AnimatePresence mode="wait"><motion.img key={`apt-${carouselIndex}`} src={user.apartmentPhotos[carouselIndex % user.apartmentPhotos.length]} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.2 }} className="w-full h-36 object-cover" /></AnimatePresence>{user.apartmentPhotos.length > 1 && (<><button onClick={() => setCarouselIndex(i => (i - 1 + user.apartmentPhotos.length) % user.apartmentPhotos.length)} className="absolute left-0 top-0 bottom-0 w-1/3" /><button onClick={() => setCarouselIndex(i => (i + 1) % user.apartmentPhotos.length)} className="absolute right-0 top-0 bottom-0 w-2/3" /><div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">{user.apartmentPhotos.map((_: any, i: number) => (<div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === carouselIndex % user.apartmentPhotos.length ? 'bg-white w-3' : 'bg-white/50'}`}/>))}</div></>)}</div></div>)}
                      </>
                    )}
                    {user?.mode === 'need' && <div><p className="text-[9px] font-semibold text-ink uppercase tracking-wider mb-1">Looking for</p><div className="bg-cream rounded-xl p-3 space-y-1"><p className="text-xs text-ink">Budget: ₦{user.budget || '0'}/yr</p><p className="text-xs text-ink">Area: {user.preferredArea || 'Flexible'}</p><p className="text-xs text-ink">Max distance: {user.distanceToCampus || 2} km</p></div></div>}
                    {user?.profileImages?.length > 0 && (<div><p className="text-[9px] font-semibold text-ink uppercase tracking-wider mb-1">More photos</p><div className="grid grid-cols-3 gap-1.5">{user.profileImages.map((img: string, i: number) => (<img key={i} src={img} className="aspect-square rounded-lg object-cover" />))}</div></div>)}
                    <button onClick={openEdit} className="w-full py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"><Edit3 size={13} /> Edit listing</button>
                  </div>
                )}

                {/* EDIT PROFILE */}
                {sidebarView === 'edit' && (
                  <div className="space-y-3">
                    {editErrors.length > 0 && <div className="p-3 bg-nope-light rounded-xl">{editErrors.map((err, i) => (<p key={i} className="text-xs text-nope font-medium flex items-center gap-1.5"><AlertTriangle size={12} />{err}</p>))}</div>}
                    {saveSuccess && <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-3 bg-like-light rounded-xl text-center"><Check size={18} className="text-like mx-auto mb-0.5" /><p className="text-xs font-bold text-ink">Saved!</p></motion.div>}
                    <div>
                      <label className={labelCls}>Profile photo *</label>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-cream border-2 border-border">{editProfilePhoto ? <img src={editProfilePhoto} className="w-full h-full object-cover" /> : <Camera size={16} className="text-ink" />}</div>
                        <label className="px-3 py-1.5 bg-cream rounded-lg text-xs font-medium text-ink cursor-pointer">Change<input type="file" accept="image/*" onChange={handleEditPhotoUpload('profile')} className="hidden" /></label>
                      </div>
                    </div>
                    <div><label className={labelCls}>Bio *</label><textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={2} maxLength={200} className="w-full px-3 py-2 bg-cream border border-border rounded-xl text-xs font-medium text-ink focus:outline-none resize-none" /><p className="text-[9px] text-ink text-right">{editBio.length}/200</p></div>
                    <div>
                      <label className={labelCls}>Socials</label>
                      <div className="space-y-1.5">{(['instagram','tiktok','facebook','whatsapp','email','twitter'] as const).map(key => (<div key={key} className="flex items-center gap-2 px-2.5 py-2 bg-cream border border-border rounded-lg"><span className="shrink-0">{socialIcon(key, 13)}</span><input type="text" value={editSocials[key] || ''} onChange={e => setEditSocials(s => ({ ...s, [key]: e.target.value }))} placeholder={key.charAt(0).toUpperCase() + key.slice(1)} className="flex-1 bg-transparent text-xs font-medium text-ink focus:outline-none" />{editSocials[key] && <button onClick={() => setEditSocials(s => ({ ...s, [key]: '' }))}><X size={10} className="text-ink" /></button>}</div>))}</div>
                    </div>
                    {user?.mode === 'have' && (<>
                      <div><label className={labelCls}>Title</label><input type="text" value={editApartmentTitle} onChange={e => setEditApartmentTitle(e.target.value)} className="w-full px-3 py-2 bg-cream border border-border rounded-xl text-xs font-medium text-ink focus:outline-none" /></div>
                      <div className="grid grid-cols-2 gap-2"><div><label className={labelCls}>Price</label><input type="text" value={editApartmentPrice} onChange={e => setEditApartmentPrice(e.target.value)} className="w-full px-3 py-2 bg-cream border border-border rounded-xl text-xs font-medium text-ink focus:outline-none" /></div><div><label className={labelCls}>Location</label><input type="text" value={editApartmentLocation} onChange={e => setEditApartmentLocation(e.target.value)} className="w-full px-3 py-2 bg-cream border border-border rounded-xl text-xs font-medium text-ink focus:outline-none" /></div></div>
                      <div><label className={labelCls}>Description</label><textarea value={editApartmentDesc} onChange={e => setEditApartmentDesc(e.target.value)} rows={2} className="w-full px-3 py-2 bg-cream border border-border rounded-xl text-xs font-medium text-ink focus:outline-none resize-none" /></div>
                      <div><label className={labelCls}>Apartment photos *</label><div className="grid grid-cols-4 gap-1.5">{editApartmentPhotos.map((p, i) => (<div key={i} className="aspect-square rounded-lg overflow-hidden bg-cream border border-border relative group"><img src={p} className="w-full h-full object-cover" /><button onClick={() => setEditApartmentPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-ink/70 flex items-center justify-center"><X size={8} className="text-cream" /></button></div>))}<label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer bg-cream"><Plus size={12} className="text-ink" /><input type="file" accept="image/*" multiple onChange={handleEditPhotoUpload('apartment')} className="hidden" /></label></div></div>
                      <div className="bg-cream rounded-xl p-3"><div className="flex justify-between items-center mb-1"><span className="text-xs text-ink">Distance</span><span className="text-sm font-display font-bold text-brand">{editDistance} km</span></div><input type="range" min={0.5} max={10} step={0.5} value={editDistance} onChange={e => setEditDistance(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #e85d04 0%, #e85d04 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 100%)` }} /></div>
                    </>)}
                    {user?.mode === 'need' && (<>
                      <div><label className={labelCls}>Budget (₦/yr)</label><input type="text" value={editBudget} onChange={e => setEditBudget(e.target.value)} className="w-full px-3 py-2 bg-cream border border-border rounded-xl text-xs font-medium text-ink focus:outline-none" /></div>
                      <div><label className={labelCls}>Preferred area</label><input type="text" value={editPreferredArea} onChange={e => setEditPreferredArea(e.target.value)} className="w-full px-3 py-2 bg-cream border border-border rounded-xl text-xs font-medium text-ink focus:outline-none" /></div>
                      <div className="bg-cream rounded-xl p-3"><div className="flex justify-between items-center mb-1"><span className="text-xs text-ink">Max distance</span><span className="text-sm font-display font-bold text-brand">{editDistance} km</span></div><input type="range" min={0.5} max={10} step={0.5} value={editDistance} onChange={e => setEditDistance(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #e85d04 0%, #e85d04 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 100%)` }} /></div>
                    </>)}
                    <div><label className={labelCls}>More photos</label><div className="grid grid-cols-4 gap-1.5">{editProfileImages.map((img, i) => (<div key={i} className="aspect-square rounded-lg overflow-hidden bg-cream border border-border relative group"><img src={img} className="w-full h-full object-cover" /><button onClick={() => setEditProfileImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-ink/70 flex items-center justify-center"><X size={8} className="text-cream" /></button></div>))}<label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer bg-cream"><Plus size={12} className="text-ink" /><input type="file" accept="image/*" multiple onChange={handleEditPhotoUpload('profileExtra')} className="hidden" /></label></div></div>
                    <button onClick={handleSaveProfile} className="w-full py-3 bg-ink text-cream rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"><Check size={13} /> Save changes</button>
                  </div>
                )}

                {/* PREFERENCES */}
                {sidebarView === 'preferences' && (
                  <div className="space-y-3">
                    {user?.mode === 'need' && (<><div><label className={labelCls}>Budget (₦/yr)</label><input type="text" value={editBudget} onChange={e => setEditBudget(e.target.value)} className="w-full px-3 py-2 bg-cream border border-border rounded-xl text-xs font-medium text-ink focus:outline-none" /></div><div><label className={labelCls}>Preferred area</label><input type="text" value={editPreferredArea} onChange={e => setEditPreferredArea(e.target.value)} className="w-full px-3 py-2 bg-cream border border-border rounded-xl text-xs font-medium text-ink focus:outline-none" /></div></>)}
                    <div className="bg-cream rounded-xl p-3"><div className="flex justify-between items-center mb-1.5"><span className="text-xs font-medium text-ink">{user?.mode === 'have' ? 'Distance to campus' : 'Max distance'}</span><span className="text-base font-display font-bold text-brand">{editDistance} km</span></div><input type="range" min={0.5} max={10} step={0.5} value={editDistance} onChange={e => setEditDistance(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #e85d04 0%, #e85d04 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 ${((editDistance - 0.5) / 9.5) * 100}%, #e7e5e4 100%)` }} /><p className="text-[10px] text-ink mt-1">{editDistance <= 1 ? '🚶 Right on campus!' : editDistance <= 3 ? '🚶 Easy walk' : editDistance <= 5 ? '🚌 Short commute' : '🚗 Longer commute'}</p></div>
                    <button onClick={() => { const u = { ...user, distanceToCampus: editDistance, budget: editBudget, preferredArea: editPreferredArea }; onNavigate('dashboard', u); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000) }} className="w-full py-3 bg-ink text-cream rounded-xl font-semibold text-sm">Save preferences</button>
                    {saveSuccess && <div className="p-2 bg-like-light rounded-xl text-center"><p className="text-xs font-bold text-ink">✓ Saved</p></div>}
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {sidebarView === 'notifications' && (
                  <div className="space-y-2"><p className="text-xs text-ink mb-2">Choose notifications.</p><NotifToggle label="New matches" value={notifMatches} onChange={setNotifMatches} /><NotifToggle label="Messages" value={notifMessages} onChange={setNotifMessages} /><NotifToggle label="App updates" value={notifUpdates} onChange={setNotifUpdates} /></div>
                )}

                {/* HELP */}
                {sidebarView === 'help' && (
                  <div className="space-y-2">{faqs.map((faq, i) => (<div key={i} className="bg-cream rounded-xl overflow-hidden"><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-3 text-left"><span className="font-semibold text-xs text-ink pr-3">{faq.q}</span>{openFaq === i ? <ChevronUp size={14} className="text-ink shrink-0" /> : <ChevronDown size={14} className="text-ink shrink-0" />}</button><AnimatePresence>{openFaq === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-3 pb-3 text-xs text-ink leading-relaxed">{faq.a}</p></motion.div>}</AnimatePresence></div>))}</div>
                )}

                {/* SAFETY */}
                {sidebarView === 'safety' && (
                  <div className="space-y-3">
                    <div className="bg-cream rounded-xl p-4"><h3 className="font-display font-bold text-sm text-ink mb-1">Stay safe</h3><p className="text-xs text-ink leading-relaxed">Meet in public first. Never share financial info. Report anything suspicious.</p></div>
                    <button className="w-full flex items-center gap-3 p-3 bg-cream rounded-xl text-left"><div className="w-8 h-8 rounded-lg bg-nope-light flex items-center justify-center"><AlertTriangle size={14} className="text-nope" /></div><div className="flex-1"><p className="font-display font-semibold text-xs text-ink">Report a user</p></div><ChevronRight size={14} className="text-ink" /></button>
                    <button className="w-full flex items-center gap-3 p-3 bg-cream rounded-xl text-left"><div className="w-8 h-8 rounded-lg bg-nope-light flex items-center justify-center"><Lock size={14} className="text-nope" /></div><div className="flex-1"><p className="font-display font-semibold text-xs text-ink">Block a user</p></div><ChevronRight size={14} className="text-ink" /></button>
                    <div className="pt-3 border-t border-border"><button onClick={() => { localStorage.removeItem('corenty_onboarding_complete'); localStorage.removeItem('corenty_user'); onNavigate('landing') }} className="w-full py-2.5 bg-nope-light text-nope rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"><Trash2 size={13} /> Delete account</button></div>
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

const labelCls = "text-[9px] font-semibold text-ink uppercase tracking-wider mb-1 block"

const MenuItem: React.FC<{ icon: React.ElementType; iconBg: string; iconColor: string; label: string; desc: string; badge?: number; onClick: () => void }> = ({ icon: Icon, iconBg, iconColor, label, desc, badge, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-all text-left">
    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}><Icon size={15} className={iconColor} /></div>
    <div className="flex-1 min-w-0"><p className="font-display font-semibold text-sm text-ink">{label}</p><p className="text-[10px] text-ink">{desc}</p></div>
    <div className="flex items-center gap-1.5 shrink-0">{badge !== undefined && badge > 0 && <span className="w-5 h-5 rounded-full bg-nope text-white text-[10px] font-bold flex items-center justify-center">{badge}</span>}<ChevronRight size={14} className="text-ink" /></div>
  </button>
)

const NotifToggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center gap-3 p-3 bg-cream rounded-xl">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${value ? 'bg-like-light' : 'bg-border'}`}>{value ? <Bell size={14} className="text-like" /> : <BellOff size={14} className="text-ink" />}</div>
    <p className="flex-1 font-display font-semibold text-xs text-ink">{label}</p>
    <button onClick={() => onChange(!value)} className={`w-10 h-6 rounded-full transition-all relative ${value ? 'bg-like' : 'bg-border'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'right-1' : 'left-1'}`} /></button>
  </div>
)

export default Dashboard
