import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { getSettings } from '../firebase/services/settingsService'
import React, { useState, useEffect } from 'react'

const DEFAULT_HERO = "https://lh3.googleusercontent.com/aida-public/AB6AXuDar4SRBvcnU0_eViIb5fyO6-f6Zg02ySzjPtWTMwm8iYT0H9OjezC7W7-tjQCRve3hTgB6-XpE_4xTAZx4K8djySAxk3G_I2ix6WIMR4c6xnP6bF2NDOtiisni9DCp8PyZsIwCIvNlcg95p7mcSX1XhdeRETG7NrwBx_en3kVoK7FHbmV9qyFSDYBRFRkVUJbVw8K2EMkUp8P6tfogfU3vTyQPAh1udNBEljnTmRqNRbT8uxw2LFelO0HSQcOXa6ITNvRSabgf7l9l";

export default function Home() {
  const customEase = [0.16, 1, 0.3, 1]
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO)

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings()
      if (settings.homeHero) setHeroImage(settings.homeHero)
    }
    loadSettings()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: customEase }
    }
  }

  return (
    <main className="relative min-h-screen flex items-center pt-24 lg:pt-0 overflow-hidden">
      <Helmet>
        <title>Home | Parallel Paths Architecture</title>
        <meta name="description" content="Parallel Paths Architecture - Bespoke architectural escapes where modern geometry meets the untamed flow of nature." />
      </Helmet>

      {/* Background split */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-1/2 lg:h-full bg-section-tone -z-10 opacity-50 lg:opacity-100" />

      <div className="max-w-[1920px] mx-auto w-full px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
        {/* Left: Headline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-1/2 flex flex-col items-start z-10 pb-12 lg:pb-0 pt-4 lg:pt-0"
        >
          <motion.div variants={itemVariants} className="space-y-0">
            <h1 className="font-headline font-extrabold text-[12vw] sm:text-[10vw] lg:text-[120px] leading-[0.85] tracking-tight uppercase text-primary-text">
              Wilderness<br />
              <span className="text-accent italic">Riverside</span><br />
              Cabins
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 lg:mt-8 max-w-md">
            <p className="font-body text-base md:text-lg lg:text-xl text-primary-text/70 font-light leading-relaxed">
              Curating bespoke architectural escapes where modern geometry meets the untamed flow of nature. Experience elevated living in the heart of the wild.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <Link
              to="/contact"
              className="group flex items-center gap-4 bg-accent text-on-accent px-8 md:px-10 py-4 md:py-5 rounded-full font-headline font-bold uppercase tracking-[0.1em] shadow-2xl hover:scale-105 transition-all duration-300"
              aria-label="Enquire about booking our cabins"
            >
              Book Now
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Image + Testimonial */}
        <div className="relative w-full lg:w-1/2 flex flex-col lg:flex-row items-center justify-center lg:h-screen lg:overflow-visible">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: customEase }}
            className="relative w-[90%] mx-auto lg:mx-0 lg:w-[110%] aspect-[4/5] lg:aspect-auto lg:h-[85%] lg:-ml-[10%] rounded-[500px] overflow-hidden shadow-2xl z-0 mb-12 lg:mb-0"
          >
            <img
              alt="Architectural exterior of a minimalist wooden cabin situated on a rocky ridge beside a tranquil river"
              className="w-full h-full object-cover"
              src={heroImage}
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </motion.div>

          {/* Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8, ease: customEase }}
            className="absolute -bottom-10 lg:bottom-10 right-0 lg:right-10 bg-card-bg/95 backdrop-blur-2xl p-6 md:p-8 rounded-full border border-white/10 shadow-2xl max-w-[90%] sm:max-w-md lg:max-w-xs z-20"
          >
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  alt="Headshot of Elena Rodriguez, a client of Parallel Paths"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCic1KnN6HJhhlYVNbeTBTNhh-uod8WYt9nwHE6DX10q5PV4biN83-H82gp10V1mUgwSn6mG-WuXqrKH3L3-2vaUncIfN0guwnkEL-ohrTK48HV9eqxtMoD9Ut_VF3RcY1ntIKe546zHxjr-ah8sQ_UWkrIchNOLkhfd0Pi4DsHHwoaD5-McleI2BesdswzBA__-qLGC1OotXnT4KBhMY-08MTjXlB9y-1BaLUFbyzK_vHxahC9za9Wo-XwKkEB_7OFM0KsSgScZl4A"
                  loading="lazy"
                />
              </div>
              <div className="flex-grow">
                <p className="font-headline font-bold text-sm md:text-base text-primary-text">minal jadhav</p>
                <div className="flex text-accent scale-75 -ml-3" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined filled" aria-hidden="true">star</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="font-body text-sm md:text-base text-primary-text/80 leading-relaxed px-2">
              "An unparalleled retreat. The architecture doesn't just sit in nature; it converses with it. Truly transformative space."
            </p>
          </motion.div>

          {/* Scroll Path Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute left-0 bottom-20 flex-col items-center gap-4 hidden lg:flex"
            aria-hidden="true"
          >
            <div className="w-[1px] h-32 bg-accent/30 relative overflow-hidden">
              <motion.div
                animate={{
                  y: [0, 128, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-0 left-0 w-full h-1/2 bg-accent"
              />
            </div>
            <span className="font-label text-[10px] uppercase tracking-[0.3em] vertical-text transform origin-center text-accent">
              Scroll Path
            </span>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
