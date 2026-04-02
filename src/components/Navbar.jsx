import React, { useState, useEffect, memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'About', path: '/about' },
  { label: 'Gallery', path: '/gallery' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    document.body.style.overflow = ''
  }, [location.pathname])

  const toggleMobile = () => {
    setMobileOpen(prev => {
      document.body.style.overflow = !prev ? 'hidden' : ''
      return !prev
    })
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 w-full z-50 transition-colors duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(13, 7, 4, 0.9)' : 'rgba(13, 7, 4, 0.4)',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0)'
      }}
    >
      <div className="flex justify-between items-center w-full px-6 md:px-12 py-4 md:py-6 max-w-[1920px] mx-auto">
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-[0.1em] text-primary-text font-headline" aria-label="Parallel Paths Home">
          PARALLEL PATHS
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12 font-headline tracking-[0.05em] uppercase text-sm font-medium">
          {navLinks.map(link => (
            <motion.div key={link.path} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Link
                to={link.path}
                className={`transition-colors duration-300 ${
                  location.pathname === link.path
                    ? 'text-accent border-b border-accent pb-1'
                    : 'text-primary-text hover:text-accent'
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="hidden md:block">
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(200, 169, 107, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/contact"
              className="bg-primary-text text-background px-6 md:px-8 py-2 md:py-3 rounded-full font-headline text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-accent hover:text-on-accent transition-all duration-300 shadow-lg inline-block"
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* Mobile Hamburger */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden flex items-center justify-center p-2 text-primary-text hover:text-accent transition-colors"
          onClick={toggleMobile}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined text-3xl">{mobileOpen ? 'close' : 'menu'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[55]"
            onClick={toggleMobile}
          />
        )}
        {mobileOpen && (
          <motion.div
            key="menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-y-0 right-0 w-full sm:w-80 bg-background border-l border-white/5 z-[60] flex flex-col"
          >
            <div className="flex justify-end p-6">
                <button
                  className="p-2 text-primary-text hover:text-accent transition-colors"
                  onClick={toggleMobile}
                  aria-label="Close navigation menu"
                >
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>
              <div className="flex flex-col items-center gap-8 mt-12 font-headline tracking-[0.1em] uppercase text-lg font-medium">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`transition-colors duration-300 ${
                      location.pathname === link.path
                        ? 'text-accent'
                        : 'text-primary-text hover:text-accent'
                    }`}
                    onClick={toggleMobile}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/contact"
                  className="mt-8 bg-primary-text text-background px-10 py-4 rounded-full font-headline text-sm font-bold uppercase tracking-wider hover:bg-accent transition-all duration-300 shadow-lg"
                  onClick={toggleMobile}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default memo(Navbar)
