import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import MainLayout from './layout/MainLayout'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const About = lazy(() => import('./pages/About'))
const Gallery = lazy(() => import('./pages/Gallery'))
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'))
const Contact = lazy(() => import('./pages/Contact'))
const Admin = lazy(() => import('./pages/Admin'))

// Minimal loading fallback
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background z-[100]">
    <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
  </div>
)

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/:id" element={<ProjectDetails />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

export default App
