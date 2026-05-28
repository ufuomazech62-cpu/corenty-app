import React from 'react'
import { motion } from 'motion/react'
import { Shield, Zap, Phone, MapPin } from 'lucide-react'

interface FeaturesProps {
  onNavigate: (page: string) => void
}

const Features: React.FC<FeaturesProps> = ({ onNavigate }) => {
  return (
    <section className="py-32 lg:py-48 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 lg:mb-24 max-w-2xl"
        >
          <p className="text-sm font-medium text-brand tracking-wide mb-4 uppercase">
            Why CoRenty
          </p>
          <h2 className="text-4xl lg:text-6xl font-display font-bold tracking-[-0.04em] leading-[1] mb-5 text-ink">
            Not just another
            <br />
            <span className="font-serif italic">listing site.</span>
          </h2>
          <p className="text-lg leading-relaxed text-ink">
            CoRenty matches <strong>students with students</strong> — whether you have a place or you're looking for one together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 bg-ink rounded-[28px] p-8 lg:p-12 noise relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-cream/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-brand" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-cream tracking-tight mb-3">
                Every student verified
              </h3>
              <p className="text-cream/70 text-base leading-relaxed max-w-md">
                Student ID card or matric number verification. Universities, polytechnics, colleges of education — all supported.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-brand/10 blur-3xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-brand-light rounded-[28px] p-8 lg:p-10 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-7 h-7 text-brand" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-display font-bold tracking-tight mb-2 text-ink">
              Two modes, one feed
            </h3>
            <p className="text-ink text-sm leading-relaxed">
              Have a place? List it. Need one? Find a co-searcher. Everyone swipes, everyone matches.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-surface border border-border rounded-[28px] p-8 lg:p-10 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Phone className="w-7 h-7 text-ink" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-display font-bold tracking-tight mb-2 text-ink">
              Direct contact
            </h3>
            <p className="text-ink text-sm leading-relaxed">
              Match and get their WhatsApp, email, Instagram, TikTok, or Facebook. No middleman.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-surface border border-border rounded-[28px] p-8 lg:p-10 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-7 h-7 text-ink" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-display font-bold tracking-tight mb-2 text-ink">
              Near your campus
            </h3>
            <p className="text-ink text-sm leading-relaxed">
              Filter by institution and neighborhood. Universities, polys, colleges — all covered.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2 bg-cream border border-border rounded-[28px] p-8 lg:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-2xl font-display font-bold tracking-tight mb-1 text-ink">
                Ready to find your match?
              </h3>
              <p className="text-ink text-sm">
                Join thousands of verified students already on CoRenty.
              </p>
            </div>
            <button
              onClick={() => onNavigate('signin')}
              className="shrink-0 px-8 py-4 bg-ink text-cream rounded-full font-medium hover:bg-ink/90 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Get started →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Features
