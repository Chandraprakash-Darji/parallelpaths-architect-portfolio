import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { fetchProjects } from '../firebase/services/projectService'
import { CardStack } from '../components/ui/CardStack'

export default function Gallery() {
  const customEase = [0.16, 1, 0.3, 1]
  const [projects, setProjects] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects()
        setProjects(data)
      } catch (error) {
        console.error("Failed to load generic projects:", error)
      }
    }
    loadProjects()
  }, [])

  const mappedProjects = useMemo(() => projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.subtitle || project.philosophy?.slice(0, 90),
    imageSrc: project.mainImage || project.images?.[0]?.url,
    href: `/gallery/${project.id}`,
  })), [projects]);

  return (
    <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1920px] mx-auto">
      <Helmet>
        <title>Portfolio | Parallel Paths Architecture</title>
        <meta name="description" content="Explore Obsidian Structures: A curated gallery of residential, commercial, and cultural architectural masterworks by Parallel Paths." />
      </Helmet>

      {/* Header Section */}
      <header className="mb-16 md:mb-24 flex flex-col items-center text-center">
        <div className="mb-8 scroll-path" aria-hidden="true" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-label text-[10px] uppercase tracking-[0.3em] text-accent mb-4"
        >
          Selected Works
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: customEase }}
          className="font-headline font-extrabold text-[10vw] md:text-[6vw] leading-[0.9] tracking-tighter uppercase text-primary-text"
        >
          Obsidian <span className="italic font-light opacity-80">Structures</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: customEase }}
          className="mt-8 max-w-2xl text-primary-text/60 font-body text-lg leading-relaxed"
        >
          Exploring the intersection of tectonic permanence and fluid modernism through curated architectural interventions.
        </motion.p>
      </header>

      {/* Gallery Card Stack */}
      <div className="w-full max-w-6xl mx-auto py-12 px-4 overflow-visible">
        <CardStack 
          items={mappedProjects}
          maxVisible={5}
          cardWidth={380}
          cardHeight={260}
          overlap={0.6}
          spreadDeg={60}
          depthPx={180}
          tiltXDeg={10}
          activeScale={1.05}
          inactiveScale={0.9}
          renderCard={(item, { active }) => (
            <div 
              onClick={(e) => {
                if (!active) return;
                // Prevent navigation if it was a drag
                if (e.movementX && Math.abs(e.movementX) > 5) return;
                e.stopPropagation();
                navigate(item.href);
              }}
              className={`relative h-full w-full rounded-2xl overflow-hidden group block transition-all duration-300 ${
                active ? 'pointer-events-auto cursor-pointer hover:scale-[1.02] shadow-[0_0_25px_rgba(212,175,55,0.15)]' : 'pointer-events-none'
              }`}
            >
              {/* Image */}
              <img
                src={item.imageSrc}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 p-5 w-full">
                <h3 className="text-white text-lg font-semibold tracking-wide">
                  {item.title}
                </h3>
                <p className="text-white/70 text-sm mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Gold Accent Border */}
              <div className="absolute inset-0 rounded-2xl border border-[#D4AF37]/20 pointer-events-none" />
            </div>
          )}
          autoAdvance
          intervalMs={3000}
          pauseOnHover
          showDots
        />
      </div>

      {/* View Archive Button */}
      <div className="mt-24 flex flex-col items-center">
        <motion.button
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 0 25px rgba(200, 169, 107, 0.4)",
            borderColor: "var(--color-accent)"
          }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-4 rounded-full border border-accent/30 text-accent font-label text-[10px] tracking-[0.3em] uppercase hover:bg-accent hover:text-on-accent transition-all duration-500 shadow-xl"
          aria-label="Load more projects from the archive"
        >
          View Archive
        </motion.button>
      </div>
    </main>
  )
}
