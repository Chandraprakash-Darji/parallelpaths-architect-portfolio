import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { loginAdmin, subscribeToAuthChanges, logoutAdmin } from '../firebase/services/authService'
import { fetchProjects } from '../firebase/services/projectService'
import { useNavigate } from 'react-router-dom'
import { fetchContacts } from '../firebase/services/contactService'
import { getSettings, updateSetting } from '../firebase/services/settingsService'
import ProjectModal from '../components/ProjectModal'

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [projects, setProjects] = useState([])
  const [contacts, setContacts] = useState([])
  const [currentTab, setCurrentTab] = useState('projects')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [settings, setSettings] = useState({})
  const [uploadingSlot, setUploadingSlot] = useState(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const navigate = useNavigate()
  const customEase = [0.16, 1, 0.3, 1]

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [projectData, contactData, settingsData] = await Promise.all([
          fetchProjects(),
          fetchContacts(),
          getSettings()
        ])
        setProjects(projectData)
        setContacts(contactData)
        setSettings(settingsData)
      } catch(err) {
        console.error("Error loading data", err)
      }
    }

    const unsubscribe = subscribeToAuthChanges((user) => {
      setIsLoggedIn(!!user)
      setIsAuthChecking(false)
      if (user) {
        loadInitialData()
      } else {
        // Defensive: Clear sensitive state on logout
        setProjects([])
        setContacts([])
        setSettings({})
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      if (email && password) {
        await loginAdmin(email, password)
      }
    } catch (error) {
      // Map error codes to user-friendly messages, but keep the code visible for diagnosis
      const errorMessage = error.code ? `${error.code}: ${error.message}` : 'Invalid credentials'
      setLoginError(errorMessage)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutAdmin()
      // Force navigation to home to clear the history stack and prevent back-button access
      navigate('/', { replace: true })
    } catch (error) {
      console.error(error)
    }
  }

  const handleProjectSuccess = async () => {
    try {
      const data = await fetchProjects()
      setProjects(data)
    } catch (err) {
      console.error("Failed to reload projects", err)
    }
  }

  const handleImageUpdate = async (slot, e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingSlot(slot)
    setUploadingSlot(slot)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1] // Strip the data:image/png;base64, prefix
        
        const resp = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64String
          })
        })
        
        const data = await resp.json()
        if (!data.success) throw new Error(data.message || 'Upload failed')

        const imageUrl = data.data.url
        await updateSetting(slot, imageUrl)
        
        setSettings(prev => ({ ...prev, [slot]: imageUrl }))
        window.alert('Secondary-level assets updated successfully via secure proxy!')
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error(err)
      window.alert('Failed to update image: ' + err.message)
    } finally {
      setUploadingSlot(null)
    }
  }
  // Prevent visual flickers or "Back Button" leaks by showing nothing until auth is confirmed
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <Helmet>
          <title>Admin Login | Parallel Paths</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <div className="absolute top-0 right-0 w-1/2 h-full bg-section-tone -z-10 opacity-30" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: customEase }}
          className="w-full max-w-md bg-card-bg/40 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-3xl shadow-2xl relative"
        >
          <div className="flex flex-col items-center mb-10 text-center">
            <span className="font-label text-[10px] tracking-[0.4em] uppercase text-accent mb-4 block">Secure Portal</span>
            <h1 className="font-headline font-extrabold text-3xl tracking-tight text-primary-text uppercase leading-none">
              PARALLEL <span className="italic font-light">PATHS</span>
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-lg font-body text-sm text-center">
                {loginError}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="admin-email" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Identity</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@parallel.com"
                className="w-full bg-background/50 border border-white/10 rounded-xl p-4 font-body text-primary-text placeholder:text-white/5 focus:border-accent focus:outline-none transition-all"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Access Token</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background/50 border border-white/10 rounded-xl p-4 font-body text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-all tracking-widest"
                required
                autoComplete="current-password"
              />
            </div>
            <button
               type="submit"
               className="w-full bg-primary-text text-background font-headline font-bold uppercase tracking-[0.2em] py-5 rounded-full hover:bg-accent hover:text-on-accent transition-all duration-500 shadow-xl mt-4 active:scale-95"
            >
              Authenticate
            </button>
          </form>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex">
      <Helmet>
        <title>Dashboard | Parallel Paths Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleProjectSuccess} 
      />

      <aside className="w-20 md:w-64 border-r border-white/5 flex flex-col bg-background z-20">
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-center md:justify-start">
          <span className="font-headline font-black text-xl md:text-2xl tracking-tighter text-primary-text">PP.</span>
        </div>
        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          {[
            { id: 'projects', icon: 'architecture', label: 'Projects' },
            { id: 'content', icon: 'auto_awesome', label: 'Page Content' },
            { id: 'inquiries', icon: 'mail', label: 'Inquiries' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-4 p-3 md:px-4 rounded-xl transition-all group ${
                currentTab === item.id ? 'bg-accent/10 text-accent' : 'text-primary-text/40 hover:bg-white/5 hover:text-primary-text'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {item.icon}
              </span>
              <span className="hidden md:block font-headline text-xs font-bold uppercase tracking-[0.1em]">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 md:px-4 text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="hidden md:block font-headline text-xs font-bold uppercase tracking-[0.1em]">Secure Exit</span>
          </button>
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 border-b border-white/5 flex flex-row items-center justify-between px-8 md:px-12 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <h2 className="font-headline text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-primary-text/60">
            {currentTab === 'projects' ? 'Portfolio Management' : 
             currentTab === 'content' ? 'Global Page Content' : 'Inquiries Management'}
          </h2>
        </header>

        <div className="p-8 md:p-12 lg:p-16 max-w-7xl">
          {currentTab === 'projects' && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                <div>
                  <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">Dashboard</span>
                  <h1 className="font-headline font-extrabold text-5xl md:text-6xl tracking-tighter text-primary-text uppercase">Project <span className="italic font-light">Archive</span></h1>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-accent text-on-accent px-8 py-4 rounded-full font-headline font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span> Add New Piece
                </button>
              </div>

          <div className="bg-card-bg/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left font-body">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Work Title</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Classification</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Date</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 text-right">Visibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-primary-text/80">
                {projects.map((row) => (
                  <tr key={row.id} onClick={() => navigate(`/gallery/${row.id}`)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {row.images?.[0] ? <img src={row.images[0]} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-white/20">architecture</span>}
                      </div>
                      <span className="font-headline text-xs font-bold uppercase tracking-wider">{row.title}</span>
                    </td>
                    <td className="p-6 text-sm">{row.category || 'Architecture'}</td>
                    <td className="p-6 text-sm">
                      {row.createdAt?.seconds ? new Date(row.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-6 text-right">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-accent/30 text-accent bg-accent/5">
                        Published
                      </span>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                   <tr>
                     <td colSpan="4" className="p-8 text-center text-primary-text/40 text-sm">
                        No projects found in the archive.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}

        {currentTab === 'content' && (
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">Dashboard</span>
                <h1 className="font-headline font-extrabold text-5xl md:text-6xl tracking-tighter text-primary-text uppercase">Page <span className="italic font-light">Content</span></h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Home Page Section */}
              <div className="bg-card-bg/30 border border-white/5 p-8 rounded-3xl space-y-8">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-accent">home</span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-primary-text">Home Page</h3>
                </div>
                <div className="space-y-4">
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block">Hero Background Image</label>
                  <div className="relative group rounded-2xl overflow-hidden aspect-video bg-white/5 border border-white/5">
                    <img src={settings.homeHero || "https://lh3.googleusercontent.com/aida-public/AB6AXuDar4SRBvcnU0_eViIb5fyO6-f6Zg02ySzjPtWTMwm8iYT0H9OjezC7W7-tjQCRve3hTgB6-XpE_4xTAZx4K8djySAxk3G_I2ix6WIMR4c6xnP6bF2NDOtiisni9DCp8PyZsIwCIvNlcg95p7mcSX1XhdeRETG7NrwBx_en3kVoK7FHbmV9qyFSDYBRFRkVUJbVw8K2EMkUp8P6tfogfU3vTyQPAh1udNBEljnTmRqNRbT8uxw2LFelO0HSQcOXa6ITNvRSabgf7l9l"} className="w-full h-full object-cover opacity-50" alt="Home Hero" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <label className="cursor-pointer bg-accent text-on-accent px-6 py-3 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        {uploadingSlot === 'homeHero' ? <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">cloud_upload</span>}
                        Update Home Hero
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpdate('homeHero', e)} disabled={uploadingSlot === 'homeHero'} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Page Section */}
              <div className="bg-card-bg/30 border border-white/5 p-8 rounded-3xl space-y-8">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-accent">architecture</span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-primary-text">Services Page</h3>
                </div>
                <div className="space-y-4">
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block">Floating Model Image</label>
                  <div className="relative group rounded-2xl overflow-hidden aspect-video bg-white/5 border border-white/5">
                    <img src={settings.servicesModel || "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLJLVr-u5vNVg6-5nELs24TrHcXnBR4dA_jA70oaCkN5povJEHW_iLFR6JvqhpCQZqa74snkvGEuBRyGFGptS7byLjSN4mwLcuaW3ua03qRmdCIrkW_KTZD2xWsEgWtoUVE0avhroUhdgjn_Si49kb1DiWVF6Z6tJ6zzQIpazT4_CTCfQsW4HHOTtWVQduvv1pndQjMFHTjWVWLWGfucRDm3NU7lXFjKPlOGORw-_vs1cqJNCa-YP5fg6Mzm4hI5dhvRvbrkIneHQ"} className="w-full h-full object-contain mix-blend-lighten opacity-50" alt="Services Model" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <label className="cursor-pointer bg-accent text-on-accent px-6 py-3 rounded-full font-headline font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                        {uploadingSlot === 'servicesModel' ? <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">cloud_upload</span>}
                        Update Services Model
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpdate('servicesModel', e)} disabled={uploadingSlot === 'servicesModel'} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Page Portfolio */}
              <div className="bg-card-bg/30 border border-white/5 p-8 rounded-3xl space-y-10 lg:col-span-2">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-accent">person</span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider text-primary-text">About Page Assets</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { id: 'aboutPortrait', label: 'Main Portrait', default: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFbeSpEsP4UlxheqYTjaSPhvQyzC42RjwGaNVPdj5E8bP5u9evp0DK1kMT2gg4HjqD74UsnZJuTXOAXZ6BZrvjBNZdqbg6t_-G5A5OC50iqAk25I8u77-4Aq-xvZrN00KYPjogwZKXcKggof0kINXeqZs2k825ZDmlZiqL-tJ93RdxGY1vGyJAp95vnMdDtym1wdK-cmC0xt9J8N-F_boBUEe30vT6Vw9oy85Amm8d_BRVHd5s2Qe8hiksHPkeCHir16qfORTjssEn" },
                    { id: 'aboutPhilosophy', label: 'Philosophy Detail', default: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJR59X0MEgm3EDXP0vXKABKq6E9IsYS73RpHgcORBrndrCSvo0LCQ5vBpVB8dgALoriBrFEODZFfZ8wGzvyup3oD9_Q18LWirI1ASAznfOEfKfHlu6_FRaxWKxHcK0AH8dJ7aqrpo0L1DjKoCJiGp2TGTe725fjj0Ii6y4mhe3kpM2We-e_B2Od1IP0O8-VfogcAz2gkqWtv2E-Y9R0wPc7g-7W-Dd_5Dect6AQ4ucVe1zl80lm_AewrdkYIGo3ZYAOM82U5T3cnk_" },
                    { id: 'aboutResilience', label: 'Resilience Abstract', default: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbo_EdStQMs7fOy5oIB3kyfoN38-gC-8VxrG-gzeUTro7_zWf6Za4fa3Et4FM9alG_yq0AFPZnb_ssuDmjXuggHfENKp1gAc7CwpJhwd9m_Fn2y966cbjoUh68JDhgCqlc1Tfnosy0-hMzTJVnpp68LLjtrq9B5JprTsU2yXquRnoGiptQzuiQ4-UwqRdtFEc2SOm_RNn9kzmRKo5pfCCs3UlRd1KD1qLHFT8IOLs1hSa6eYHDWbPfRKdq0ccmOOl_lQAgw772l4iO" }
                  ].map(slot => (
                    <div key={slot.id} className="space-y-4">
                      <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 block">{slot.label}</label>
                      <div className="relative group rounded-2xl overflow-hidden aspect-[4/5] bg-white/5 border border-white/5">
                        <img src={settings[slot.id] || slot.default} className="w-full h-full object-cover opacity-50" alt={slot.label} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <label className="cursor-pointer bg-accent text-on-accent p-3 rounded-full font-headline font-bold text-[8px] uppercase tracking-widest shadow-xl hover:scale-110 transition-all flex items-center justify-center">
                            {uploadingSlot === slot.id ? <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">cloud_upload</span>}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpdate(slot.id, e)} disabled={uploadingSlot === slot.id} />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'inquiries' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div>
                <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent mb-4 block">Dashboard</span>
                <h1 className="font-headline font-extrabold text-5xl md:text-6xl tracking-tighter text-primary-text uppercase">Direct <span className="italic font-light">Inquiries</span></h1>
              </div>
            </div>

          <div className="bg-card-bg/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left font-body">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Sender</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Email</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40">Message</th>
                  <th className="p-6 font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-primary-text/80">
                {contacts.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6 font-headline text-xs font-bold uppercase tracking-wider">{row.name}</td>
                    <td className="p-6 text-sm text-accent/80 hover:text-accent transition-colors"><a href={`mailto:${row.email}`}>{row.email}</a></td>
                    <td className="p-6 text-sm max-w-sm"><p className="truncate" title={row.message}>{row.message}</p></td>
                    <td className="p-6 text-right text-sm text-primary-text/50">
                      {row.createdAt?.seconds ? new Date(row.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && (
                   <tr>
                     <td colSpan="4" className="p-8 text-center text-primary-text/40 text-sm">
                        No inquiries received.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
        </div>
      </section>
    </main>
  )
}
