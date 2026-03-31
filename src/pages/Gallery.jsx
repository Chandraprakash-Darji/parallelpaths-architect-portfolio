import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { fetchProjects } from '../firebase/services/projectService'

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

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: customEase }}
          >
            <Link
              to={`/gallery/${project.id}`}
              className="gallery-item relative aspect-[3/4] overflow-hidden rounded-xl bg-card-bg group cursor-pointer block"
              aria-label={`View details for ${project.title}`}
            >
              <img
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                src={project.images?.[0] || project.image}
                alt={`Architectural visualization of ${project.title}`}
                loading="lazy"
                decoding="async"
              />
              <div className="gallery-overlay absolute inset-0 bg-background/60 opacity-0 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="font-label text-[8px] tracking-[0.2em] uppercase text-accent mb-2 block">
                    {project.category || 'Architecture'}
                  </span>
                  <h3 className="font-headline font-bold text-xl md:text-2xl text-primary-text flex justify-between items-center">
                    {project.title}
                    <span className="material-symbols-outlined text-accent text-xl" aria-hidden="true">arrow_outward</span>
                  </h3>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
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
