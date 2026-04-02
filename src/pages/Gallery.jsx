import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { fetchProjects } from '../firebase/services/projectService'
import { CardStack } from '../components/ui/CardStack'

export default function Gallery() {
  const customEase = [0.16, 1, 0.3, 1]
  const [projects, setProjects] = useState([])

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
      <div className="w-full py-12">
        <CardStack 
          items={projects.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            category: p.category,
            imageSrc: p.images?.[0] || p.image,
            href: `/gallery/${p.id}`,
          }))}
          initialIndex={0}
          autoAdvance
          intervalMs={4000}
          pauseOnHover
          showDots
          cardWidth={window.innerWidth < 768 ? 320 : 600}
          cardHeight={window.innerWidth < 768 ? 480 : 400}
        />
      </div>

      {/* View Archive Button */}
      <div className="mt-24 flex flex-col items-center">
        <button
          className="px-12 py-4 rounded-full border border-accent/30 text-accent font-label text-[10px] tracking-[0.3em] uppercase hover:bg-accent hover:text-on-accent transition-all duration-500 active:scale-95 shadow-xl"
          aria-label="Load more projects from the archive"
        >
          View Archive
        </button>
      </div>
    </main>
  )
}
