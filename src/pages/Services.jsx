import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import React, { useState, useEffect } from 'react'
import { getSettings } from '../firebase/services/settingsService'

const DEFAULT_MODEL = "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLJLVr-u5vNVg6-5nELs24TrHcXnBR4dA_jA70oaCkN5povJEHW_iLFR6JvqhpCQZqa74snkvGEuBRyGFGptS7byLjSN4mwLcuaW3ua03qRmdCIrkW_KTZD2xWsEgWtoUVE0avhroUhdgjn_Si49kb1DiWVF6Z6tJ6zzQIpazT4_CTCfQsW4HHOTtWVQduvv1pndQjMFHTjWVWLWGfucRDm3NU7lXFjKPlOGORw-_vs1cqJNCa-YP5fg6Mzm4hI5dhvRvbrkIneHQ";

const stats = [
  { value: '+21k', label: 'Total Customers' },
  { value: '9+', label: 'Strategic Place' },
  { value: '95%', label: 'Satisfied' },
  { value: '24/7', label: 'Care Support' },
]

export default function Services() {
  const customEase = [0.16, 1, 0.3, 1]
  const [modelImage, setModelImage] = useState(DEFAULT_MODEL)

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings()
      if (settings.servicesModel) setModelImage(settings.servicesModel)
    }
    loadSettings()
  }, [])

  return (
    <main className="tonal-gradient flex-grow pt-32 pb-24">
      <Helmet>
        <title>Services | Parallel Paths Architecture</title>
        <meta name="description" content="Discover our architectural services - blending finesse with nature's serenity in our riverside cabin projects." />
      </Helmet>

      <section className="max-w-screen-2xl mx-auto px-8 md:px-16 lg:px-24">
        {/* Top: Image + Editorial */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-24 mb-32">
          {/* LEFT: Floating Architectural Model */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: customEase }}
            className="w-full md:w-1/2 relative group"
          >
            <div className="absolute -inset-4 bg-accent/5 blur-3xl rounded-full opacity-50" />
            <img
              alt="Floating 3D architectural model of a modern multi-level cabin with wood and glass cladding"
              className="relative z-10 w-full h-auto object-contain mix-blend-lighten transform group-hover:scale-105 transition-transform duration-700 ease-out"
              src={modelImage}
              decoding="async"
            />
          </motion.div>

          {/* RIGHT: Editorial Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: customEase }}
            className="w-full md:w-1/2 space-y-8"
          >
            <p className="font-headline text-[0.75rem] uppercase tracking-[0.3em] text-primary-text/60 font-medium">
              Discover the epitome of refined living nestled within nature's
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-headline font-light leading-[1.05] tracking-tight text-primary-text">
              Our riverside cabins <span className="text-green-accent">seamlessly blend architectural</span> finesse with the serenity of the <span className="text-accent">great outdoors</span>.
            </h1>
            <div className="flex items-center gap-6 pt-4">
              <Link to="/gallery" className="flex items-center gap-4 group" aria-label="Explore our architectural portfolio">
                <span className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                  <span className="material-symbols-outlined text-primary-text group-hover:text-on-accent transition-colors" aria-hidden="true">arrow_forward</span>
                </span>
                <span className="font-headline uppercase tracking-[0.3em] text-[10px] font-extrabold text-primary-text group-hover:text-accent transition-colors">View Projects</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" aria-hidden="true" />

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:flex md:flex-row items-center justify-between gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: customEase }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <span className="text-3xl md:text-5xl lg:text-6xl font-headline font-extrabold text-primary-text tracking-tighter">
                {stat.value}
              </span>
              <span className="font-headline uppercase tracking-[0.2em] text-[10px] text-primary-text/40 mt-3 font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
