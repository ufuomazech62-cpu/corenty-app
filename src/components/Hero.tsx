import React from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

interface HeroProps {
  onNavigate: (page: string) => void
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6 lg:px-12 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-2xl"
          >
            <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-display font-bold leading-[0.95] tracking-[-0.04em] mb-8 text-ink">
              Split rent with
              <br />
              another <span className="font-serif italic text-brand">student.</span>
            </h1>

            <p className="text-lg lg:text-xl leading-relaxed mb-10 max-w-md text-ink">
              Match with verified students looking to share apartments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('signin')}
                className="group px-8 py-4 bg-ink text-cream rounded-2xl font-medium text-base hover:bg-ink/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Match with a roommate
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative w-[340px] h-[520px] mx-auto">
              <div className="absolute inset-0 bg-surface rounded-[32px] rotate-3 scale-95 opacity-60" />
              <div className="absolute inset-0 bg-surface rounded-[32px] -rotate-2 scale-[0.98] opacity-40 translate-y-2" />
              
              <div className="relative w-full h-full bg-surface rounded-[32px] shadow-2xl shadow-ink/10 overflow-hidden border border-border-light">
                <div className="relative h-[58%] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=800"
                    className="w-full h-full object-cover"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute top-5 right-5 px-4 py-2 bg-surface/95 backdrop-blur-md rounded-xl">
                    <span className="text-sm font-display font-bold text-ink">₦250k/yr</span>
                  </div>

                  <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 bg-surface/95 backdrop-blur-md rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-like" />
                    <span className="text-[10px] font-semibold text-ink tracking-wide">Verified</span>
                  </div>

                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-white font-display font-bold text-lg tracking-tight mb-1">
                      Modern Room near UNILAG
                    </h3>
                    <p className="text-white/70 text-sm">Akoka, Yaba</p>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between h-[42%]">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
                      className="w-10 h-10 rounded-full object-cover border-2 border-surface"
                      alt=""
                    />
                    <div>
                      <p className="font-display font-semibold text-sm text-ink">Tunde O.</p>
                      <p className="text-xs text-ink">University of Lagos</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-cream rounded-lg text-xs font-medium text-ink">WiFi</span>
                    <span className="px-3 py-1 bg-cream rounded-lg text-xs font-medium text-ink">Security</span>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-nope-light border border-nope/10 flex items-center justify-center">
                      <span className="text-nope text-2xl font-light">✕</span>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-like-light border border-like/10 flex items-center justify-center">
                      <span className="text-like text-2xl">♥</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero image — BEFORE the two cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 lg:mt-32 rounded-[32px] overflow-hidden shadow-2xl shadow-ink/10"
        >
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1600"
            alt="Students collaborating"
            className="w-full h-[300px] lg:h-[400px] object-cover"
          />
        </motion.div>

        {/* Two-way cards — no "mode" labels, self-explanatory */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-8 grid md:grid-cols-2 gap-4"
        >
          <div className="bg-ink rounded-[28px] p-8 lg:p-10 noise relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-cream tracking-tight mb-3">
                Already have a place?
              </h3>
              <p className="text-cream/70 text-base leading-relaxed">
                List your apartment and find a verified student to split the rent with.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-brand/8 blur-3xl" />
          </div>

          <div className="bg-surface border border-border rounded-[28px] p-8 lg:p-10 relative overflow-hidden">
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-ink tracking-tight mb-3">
              Looking for both?
            </h3>
            <p className="text-ink text-base leading-relaxed">
              Match with another student and search for an apartment together.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
