import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { submitContactForm } from '../firebase/services/contactService'

const contactInfo = [
  { icon: 'location_on', label: 'Studio', detail: '422 Obsidian Way, High Desert, AZ 86336' },
  { icon: 'mail', label: 'Enquiries', detail: 'projects@parallelpaths.com' },
  { icon: 'call', label: 'Direct', detail: '+1 (555) 012-3456' },
]

export default function Contact() {
  const customEase = [0.16, 1, 0.3, 1]
  const [formData, setFormData] = useState({ name: '', email: '', project: 'Residential', message: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ state: 'submitting', message: '' })
    
    try {
      await submitContactForm(formData)
      setStatus({ state: 'success', message: 'Enquiry received. We will be in touch shortly.' })
      setFormData({ name: '', email: '', project: 'Residential', message: '' })
    } catch (error) {
      setStatus({ state: 'error', message: 'Failed to send enquiry. Please try again.' })
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  return (
    <main className="pt-40 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Contact | Parallel Paths Architecture</title>
        <meta name="description" content="Begin your architectural journey. Contact Parallel Paths for bespoke residential, commercial, or cultural design enquiries." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-label text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: customEase }}
            className="font-headline font-extrabold text-6xl md:text-8xl leading-[0.9] tracking-tighter uppercase text-primary-text"
          >
            LET'S BUILD <br />
            <span className="italic font-light text-accent">SOMETHING NEW</span>
          </motion.h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: customEase }}
            className="flex flex-col gap-12"
          >
            <p className="font-body text-xl md:text-2xl text-primary-text/60 leading-relaxed max-w-md">
              We are currently accepting new commissions for 2025. Tell us about your vision.
            </p>

            <div className="flex flex-col gap-8">
              {contactInfo.map((info, i) => (
                <div key={info.label} className="flex items-start gap-6 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-on-accent transition-all duration-300">
                    <span className="material-symbols-outlined">{info.icon}</span>
                  </div>
                  <div>
                    <span className="font-label text-[10px] tracking-[0.2em] uppercase text-accent/60 block mb-1">{info.label}</span>
                    <p className="font-body text-lg text-primary-text">{info.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: customEase }}
            className="bg-card-bg/40 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-2xl shadow-2xl flex flex-col gap-8 relative"
            onSubmit={handleSubmit}
          >
            {status.message && (
              <div className={`p-4 rounded-lg font-body text-sm ${status.state === 'success' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {status.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Elias Thorne"
                  className="bg-background/50 border border-white/10 rounded-lg p-4 font-body text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors"
                  required
                  disabled={status.state === 'submitting'}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="elias@thorne.com"
                  className="bg-background/50 border border-white/10 rounded-lg p-4 font-body text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors"
                  required
                  disabled={status.state === 'submitting'}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 relative">
              <label htmlFor="project" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Project Type</label>
              <div className="relative w-full">
                <select
                  id="project"
                  value={formData.project}
                  onChange={handleChange}
                  className="w-full bg-background/50 border border-white/10 rounded-lg p-4 pr-12 font-body text-primary-text focus:border-accent focus:outline-none transition-colors appearance-none"
                  aria-label="Select your project category"
                  disabled={status.state === 'submitting'}
                >
                  <option value="Residential" className="bg-background">Residential</option>
                  <option value="Commercial" className="bg-background">Commercial</option>
                  <option value="Cultural" className="bg-background">Cultural / Exhibition</option>
                  <option value="Interior" className="bg-background">Interior Design</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary-text/40 pointer-events-none" aria-hidden="true">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Message</label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your architectural vision..."
                className="bg-background/50 border border-white/10 rounded-lg p-4 font-body text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors resize-none"
                required
                disabled={status.state === 'submitting'}
              ></textarea>
            </div>

            <motion.button
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 0 20px rgba(200, 169, 107, 0.4)",
                backgroundColor: "var(--color-accent)" 
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={status.state === 'submitting'}
              className="bg-accent text-on-accent font-headline font-bold uppercase tracking-[0.2em] py-5 rounded-full transition-all shadow-xl mt-4 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              aria-label="Send your enquiry"
            >
              {status.state === 'submitting' ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
                  SENDING...
                </>
              ) : 'Send Enquiry'}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </main>
  )
}
