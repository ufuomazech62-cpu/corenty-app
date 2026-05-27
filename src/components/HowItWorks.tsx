import React from 'react'
import { motion } from 'motion/react'

const steps = [
  {
    num: '01',
    title: 'Tell us your situation',
    description: 'Have a place and need a roommate? Or looking for both a place and a roommate?',
    detail: 'Either way, you swipe, you match, you connect.',
  },
  {
    num: '02',
    title: 'Quick verification',
    description: 'Upload your student ID or matric number. Add a profile photo.',
    detail: 'Takes less than 2 minutes. Every student on CoRenty is verified.',
  },
  {
    num: '03',
    title: 'Swipe & match',
    description: 'Browse verified listings. Like what you see? Swipe right to match.',
    detail: 'Get their WhatsApp, email, Instagram — direct contact, no middleman.',
  },
]

const HowItWorks: React.FC = () => {
  return (
    <section className="py-32 lg:py-48 px-6 lg:px-12 bg-surface">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-20 lg:mb-32"
        >
          <p className="text-sm font-medium text-brand tracking-wide mb-4 uppercase">
            How it works
          </p>
          <h2 className="text-5xl lg:text-7xl font-display font-bold tracking-[-0.04em] leading-[0.95] text-ink">
            Find your roommate
            <br />
            <span className="font-serif italic">in three steps.</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative"
            >
              <div className="text-8xl lg:text-9xl font-display font-bold text-cream tracking-tighter mb-6 select-none">
                {step.num}
              </div>
              <h3 className="text-2xl font-display font-bold tracking-tight mb-3 text-ink">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed mb-2 text-ink">
                {step.description}
              </p>
              <p className="text-sm leading-relaxed text-ink">
                {step.detail}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 -right-4 w-8 h-px bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
