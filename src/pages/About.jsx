import { Helmet } from 'react-helmet-async'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getSettings } from '../firebase/services/settingsService'

const DEFAULTS = {
  portrait: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFbeSpEsP4UlxheqYTjaSPhvQyzC42RjwGaNVPdj5E8bP5u9evp0DK1kMT2gg4HjqD74UsnZJuTXOAXZ6BZrvjBNZdqbg6t_-G5A5OC50iqAk25I8u77-4Aq-xvZrN00KYPjogwZKXcKggof0kINXeqZs2k825ZDmlZiqL-tJ93RdxGY1vGyJAp95vnMdDtym1wdK-cmC0xt9J8N-F_boBUEe30vT6Vw9oy85Amm8d_BRVHd5s2Qe8hiksHPkeCHir16qfORTjssEn",
  philosophy: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJR59X0MEgm3EDXP0vXKABKq6E9IsYS73RpHgcORBrndrCSvo0LCQ5vBpVB8dgALoriBrFEODZFfZ8wGzvyup3oD9_Q18LWirI1ASAznfOEfKfHlu6_FRaxWKxHcK0AH8dJ7aqrpo0L1DjKoCJiGp2TGTe725fjj0Ii6y4mhe3kpM2We-e_B2Od1IP0O8-VfogcAz2gkqWtv2E-Y9R0wPc7g-7W-Dd_5Dect6AQ4ucVe1zl80lm_AewrdkYIGo3ZYAOM82U5T3cnk_",
  resilience: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbo_EdStQMs7fOy5oIB3kyfoN38-gC-8VxrG-gzeUTro7_zWf6Za4fa3Et4FM9alG_yq0AFPZnb_ssuDmjXuggHfENKp1gAc7CwpJhwd9m_Fn2y966cbjoUh68JDhgCqlc1Tfnosy0-hMzTJVnpp68LLjtrq9B5JprTsU2yXquRnoGiptQzuiQ4-UwqRdtFEc2SOm_RNn9kzmRKo5pfCCs3UlRd1KD1qLHFT8IOLs1hSa6eYHDWbPfRKdq0ccmOOl_lQAgw772l4iO"
};

export default function About() {
  const customEase = [0.16, 1, 0.3, 1]
  const [images, setImages] = useState(DEFAULTS)

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings()
      setImages({
        portrait: settings.aboutPortrait || DEFAULTS.portrait,
        philosophy: settings.aboutPhilosophy || DEFAULTS.philosophy,
        resilience: settings.aboutResilience || DEFAULTS.resilience
      })
    }
    loadSettings()
  }, [])

  return (
    <>
      <Helmet>
        <title>About | Parallel Paths Architecture</title>
        <meta name="description" content="Meet Elias Thorne, the visionary behind Parallel Paths. Discover our philosophy of subtraction and essentialist architectural design." />
      </Helmet>

      {/* SECTION 1: Dark-themed About (Primary) */}
      <main className="min-h-screen pt-40 pb-24 px-8 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          {/* LEFT: Portrait Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: customEase }}
            className="relative group"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl transition-transform duration-700 hover:scale-[1.02]">
              <img
                alt="Portrait of Elias Thorne, Principal Architect of Parallel Paths, in a modernist concrete studio"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                src={images.portrait}
                decoding="async"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -z-10" />
          </motion.div>

          {/* RIGHT: Editorial Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: customEase }}
            className="flex flex-col space-y-12"
          >
            <div className="space-y-6">
              <span className="text-[0.75rem] uppercase tracking-[0.3em] text-accent font-bold block font-headline">
                THE ARCHITECT
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-primary-text leading-[1.1] font-headline uppercase">
                The <span className="italic text-accent">Architect</span>
              </h1>
            </div>

            <div className="space-y-8 max-w-xl">
              <p className="text-lg md:text-xl leading-relaxed text-primary-text/70 font-light font-body">
                Founded on the belief that space should breathe, Elias Thorne has spent two decades carving stillness into the urban landscape. His approach is reductive yet profound—stripping away the superfluous to reveal the skeletal beauty of light, shadow, and raw materiality.
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-primary-text/70 font-light font-body">
                To Thorne, a building is not an object, but an experience. It is the silent dialogue between the permanence of stone and the fleeting dance of the meridian sun. His vision remains unwavering: to create monoliths that stand as quiet testaments to the power of essentialist design.
              </p>
            </div>

            {/* Signature */}
            <div className="pt-8 border-t border-white/10 flex flex-col space-y-2">
              <span className="signature-font text-5xl text-accent opacity-90 select-none">
                Elias Thorne
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-primary-text/40 font-headline font-bold">
                Principal Visionary &amp; Founder
              </span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* SECTION 2: Light-themed Architect Section (Contrast Block) */}
      <section className="px-6 md:px-12 lg:px-24 py-12" style={{ backgroundColor: '#F5F2EA', color: '#171412' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: customEase }}
          className="max-w-7xl mx-auto grid grid-cols-12 gap-8 items-center"
        >
          <div className="col-span-12 lg:col-span-7 h-[400px] lg:h-[500px] overflow-hidden rounded-2xl shadow-xl" style={{ backgroundColor: '#1F1208' }}>
            <img
              alt="Detail of a modern geometric skyscraper facade with interlocking steel and glass modules"
              className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700"
              src={images.philosophy}
              loading="lazy"
            />
          </div>
          <div className="col-span-12 lg:col-span-5 flex flex-col space-y-6 lg:pl-12">
            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight font-headline" style={{ color: '#171412' }}>
              01. The Philosophy of Subtraction
            </h3>
            <p className="max-w-md font-body text-lg leading-relaxed" style={{ color: '#8B7D6B' }}>
              Every line drawn is a choice to exclude the noise of the world. We build for the moments between the walls.
            </p>
            <div className="w-12 h-1" style={{ backgroundColor: '#C8A96B', opacity: 0.3 }} aria-hidden="true" />
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: Dark Philosophy Strip (from about.html) */}
      <section className="px-8 md:px-12 lg:px-24 py-24 bg-section-tone">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: customEase }}
          className="max-w-7xl mx-auto grid grid-cols-12 gap-8 items-center"
        >
          <div className="col-span-12 lg:col-span-7 h-[500px] overflow-hidden rounded-2xl shadow-xl">
            <img
              alt="Low angle shot of abstract architectural lines in a modern building facade"
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
              src={images.resilience}
              loading="lazy"
            />
          </div>
          <div className="col-span-12 lg:col-span-5 flex flex-col space-y-6 lg:pl-12">
            <h3 className="text-3xl font-bold tracking-tight text-primary-text font-headline uppercase italic">
              02. Tectonic Resilience
            </h3>
            <p className="text-primary-text/60 max-w-md font-body text-lg leading-relaxed">
              We design for longevity, ensuring that each intervention ages with grace and remains functionally relevant for generations.
            </p>
            <div className="w-12 h-1 bg-accent/30" aria-hidden="true" />
          </div>
        </motion.div>
      </section>
    </>
  )
}
