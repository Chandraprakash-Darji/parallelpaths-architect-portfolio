import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { getProjectById } from '../firebase/services/projectService'
import InteractiveBentoGallery from '../components/blocks/interactive-bento-gallery'

const GALLERY_SPANS = [
  "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
  "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2",
  "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
  "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2",
];

export default function ProjectDetails() {
  const { id } = useParams()
  const customEase = [0.16, 1, 0.3, 1]
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await getProjectById(id)
        if (data) {
          // Add default aesthetic properties if missing from barebones Firestore entries
          setProject({
            ...data,
            subtitle: data.subtitle || 'Architectural Study',
            image: data.mainImage || data.images?.[0]?.url || data.images?.[0] || '',
            location: data.location || 'Undisclosed Sector',
            scale: data.scale || 'Undisclosed Area',
            completion: data.completion || 'In Progress',
            materials: data.materials || 'Concrete, Obsidian, Glass',
            philosophy: data.philosophy || data.description || 'No philosophy provided.'
          })
        }
      } catch (err) {
        console.error("Failed to fetch project details", err)
      } finally {
        setLoading(false)
      }
    }
    loadProject()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen pt-48 pb-24 px-8 md:px-16 flex items-center justify-center">
        <span className="font-headline font-bold uppercase tracking-widest text-accent animate-pulse">Retrieving Archive...</span>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="min-h-screen pt-48 pb-24 px-8 md:px-16 flex flex-col items-center justify-center text-center">
        <h1 className="font-headline font-extrabold text-4xl mb-4 text-primary-text uppercase">Archive Not Found</h1>
        <p className="font-body text-primary-text/60 mb-8 max-w-md">The project you are looking for does not exist in our current collection.</p>
        <Link to="/gallery" className="px-8 py-3 rounded-full border border-accent text-accent font-headline text-xs tracking-widest hover:bg-accent hover:text-on-accent transition-all uppercase">Return to Gallery</Link>
      </main>
    )
  }

  return (
    <main>
      <Helmet>
        <title>{`${project.title} | Parallel Paths Portfolio`}</title>
        <meta name="description" content={`${project.philosophy || project.description} - Architectural study by Parallel Paths.`} />
      </Helmet>

      {/* Hero Section */}
      <header className="relative pt-48 pb-24 px-8 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-12">
          <div className="flex-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="font-label text-[10px] tracking-[0.3em] uppercase text-accent mb-6 block"
            >
              {project.subtitle}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: customEase }}
              className="font-headline font-extrabold text-[12vw] md:text-[8vw] leading-[0.85] tracking-tight uppercase mb-8 text-primary-text"
            >
              {project.title.split(' ').map((word, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {i === 1 ? <span className="italic font-light">{word}</span> : word}
                </span>
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: customEase }}
              className="font-body text-xl md:text-2xl text-primary-text/70 max-w-xl leading-relaxed"
            >
              {project.philosophy || project.description}
            </motion.p>
          </div>
          <div className="hidden lg:block pb-4">
            <div className="flex flex-col items-center gap-6" aria-hidden="true">
              <span className="vertical-text font-label text-[10px] tracking-[0.3em] uppercase text-accent/40">SCROLL TO EXPLORE</span>
              <div className="w-px h-32 bg-accent/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-accent animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <section className="px-6 md:px-8 mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: customEase }}
          className="relative w-full aspect-[21/9] rounded-xl overflow-hidden group"
        >
          <img
            className="w-full h-full object-cover grayscale brightness-75 transition-transform duration-1000 group-hover:scale-105"
            src={project.image}
            alt={`Hero visualization of ${project.title}`}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-12 left-12">
            <div className="flex items-center gap-4">
              <button className="w-12 h-12 rounded-full border border-accent/50 flex items-center justify-center text-accent backdrop-blur-md hover:bg-accent hover:text-on-accent transition-all" aria-label="Play architectural film">
                <span className="material-symbols-outlined filled">play_arrow</span>
              </button>
              <span className="font-label text-[10px] tracking-[0.3em] uppercase text-primary-text">Architectural Film</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Image Gallery Bento Grid */}
      {project.images && project.images.length > 1 && (
        <section className="py-32 px-6 md:px-16 bg-section-tone overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <InteractiveBentoGallery
              title="Project Visuals"
              description="Explore the intricate details and perspectives of this architectural study."
              mediaItems={project.images.slice(1).map((img, i) => {
                const isObject = typeof img === 'object' && img !== null;
                return {
                  id: i + 1,
                  type: isObject ? (img.type || "image") : "image",
                  title: (isObject && img.title) ? img.title : `${project.title} - View ${i + 1}`,
                  desc: (isObject && img.desc) ? img.desc : (project.subtitle || "Architectural Perspective"),
                  url: isObject ? img.url : img,
                  span: GALLERY_SPANS[i % GALLERY_SPANS.length]
                };
              })}
            />
          </div>
        </section>
      )}

      {/* Description Section */}
      <section className="py-32 px-6 md:px-16 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-32">
          <div className="w-full md:w-1/3">
            <h2 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-accent">PHILOSOPHY</h2>
            <div className="w-12 h-1 bg-accent mt-6" aria-hidden="true" />
          </div>
          <div className="w-full md:w-2/3">
            <p className="font-body text-2xl md:text-3xl font-light text-primary-text leading-snug mb-12">
              {project.philosophy || project.description}
            </p>
            <div className="grid grid-cols-2 gap-12 border-t border-white/5 pt-12">
              {[
                { label: 'Location', value: project.location },
                { label: 'Scale', value: project.scale },
                { label: 'Completion', value: project.completion },
                { label: 'Materials', value: project.materials },
              ].map(item => (
                <div key={item.label}>
                  <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent/60 block mb-2">{item.label}</span>
                  <p className="font-body text-lg text-primary-text">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3D Model Placeholder */}
      {project.splineUrl ? (
        <section className="py-24 px-6 md:px-16 bg-section-tone">
          <div className="max-w-7xl mx-auto">
            <div className="relative w-full aspect-video md:aspect-[21/9] bg-surface-lowest rounded-xl overflow-hidden group border border-white/5">
              <iframe
                src={project.splineUrl}
                frameBorder="0"
                width="100%"
                height="100%"
                title={`3D Model for ${project.title}`}
                className="w-full h-full border-none pointer-events-auto"
                style={{ minHeight: '600px' }}
              ></iframe>
            </div>
          </div>
        </section>
      ) : (
      <section className="py-24 px-6 md:px-16 bg-section-tone">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-full aspect-video md:aspect-[21/9] bg-surface-lowest rounded-xl overflow-hidden grid-bg flex items-center justify-center group border border-white/5">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
              <div className="relative w-64 h-64 border border-accent/20 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]" aria-hidden="true">
                <div className="absolute -top-1 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_#C8A96B]" />
              </div>
              <div className="absolute text-center">
                <h3 className="font-headline font-extrabold text-xl tracking-[0.2em] text-primary-text uppercase mb-2">INTERACTIVE 3D MODEL</h3>
                <p className="font-label text-[10px] tracking-[0.1em] text-accent/50">NO MODEL PROVIDED FOR THIS VOLUME</p>
              </div>
            </div>
            <div className="absolute top-8 left-8 flex flex-col gap-1" aria-hidden="true">
              <span className="font-label text-[8px] tracking-[0.3em] text-accent/40 uppercase">X: 65.9422° N</span>
              <span className="font-label text-[8px] tracking-[0.3em] text-accent/40 uppercase">Y: 17.3411° W</span>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Next Project CTA */}
      <section className="py-32 px-6 md:px-16 text-center bg-background">
        <h2 className="font-headline font-extrabold text-[8vw] md:text-[5vw] uppercase tracking-tighter mb-12 text-primary-text">NEXT PROJECT</h2>
        <Link to="/gallery" className="group relative inline-block" aria-label="Return to gallery to view other projects">
          <span className="font-headline text-2xl md:text-4xl text-primary-text/40 group-hover:text-accent transition-colors duration-500 uppercase italic">
            View All Projects
          </span>
          <div className="absolute -bottom-2 left-0 w-0 h-px bg-accent transition-all duration-700 group-hover:w-full" aria-hidden="true" />
        </Link>
      </section>
    </main>
  )
}
