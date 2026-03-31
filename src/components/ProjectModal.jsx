import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProject } from '../firebase/services/projectService';

export default function ProjectModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ title: '', description: '', splineUrl: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleClose = () => {
    if (status.state === 'uploading') return;
    setFormData({ title: '', description: '', splineUrl: '' });
    setImageFile(null);
    setImagePreview('');
    setStatus({ state: 'idle', message: '' });
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setStatus({ state: 'error', message: 'Image must be less than 10MB due to ImgBB limits.' });
        return;
      }
      setStatus({ state: 'idle', message: '' });
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !imageFile) {
      setStatus({ state: 'error', message: 'Title, details, and an image are required.' });
      return;
    }

    setStatus({ state: 'uploading', message: 'Uploading to Digital Warehouse (ImgBB)...' });

    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey || apiKey === 'YOUR_IMGBB_API_KEY_HERE') {
        throw new Error('Database Error: VITE_IMGBB_API_KEY missing in .env');
      }

      // Prepare Image for ImgBB
      const bbData = new FormData();
      bbData.append('image', imageFile);

      const resp = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: bbData,
      });
      const data = await resp.json();

      if (!data.success) {
         throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
      }

      const imageUrl = data.data.url;

      setStatus({ state: 'uploading', message: 'Saving project to Archive...' });

      // Save to Firestore Database
      await createProject({
        title: formData.title,
        description: formData.description,
        splineUrl: formData.splineUrl || null,
        images: [imageUrl]
      });

      setStatus({ state: 'success', message: 'Project Published!' });
      
      // Notify parent admin dashboard to refetch the table
      onSuccess();
      
      // Auto close after 1.5s
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err) {
      console.error(err);
      setStatus({ state: 'error', message: err.message || 'System fault occurred' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100]"
            onClick={handleClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[600px] bg-card-bg border border-white/5 p-8 md:p-12 rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-[101] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent mb-2 block">Database Entry</span>
                <h2 className="font-headline font-extrabold text-2xl uppercase tracking-wider text-primary-text">Add New Piece</h2>
              </div>
              <button type="button" onClick={handleClose} className="w-10 h-10 bg-white/5 rounded-full text-primary-text/40 hover:bg-white/10 hover:text-red-400 transition-colors flex items-center justify-center" aria-label="Close modal">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {status.message && (
              <div className={`p-4 rounded-xl font-body text-sm mb-6 flex items-center gap-3 ${
                status.state === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                status.state === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                'bg-accent/10 text-accent border border-accent/20'
              }`}>
                {status.state === 'uploading' && <div className="w-4 h-4 border-2 border-accent border-t-transparent flex-shrink-0 flex-grow-0 rounded-full animate-spin" />}
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Project Title <span className="text-accent">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-background/50 border border-white/10 rounded-xl p-4 font-body text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors"
                  placeholder="e.g. The Glass Pavilion"
                  disabled={status.state === 'uploading'}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Architectural Details <span className="text-accent">*</span></label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-background/50 border border-white/10 rounded-xl p-4 font-body text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors resize-none"
                  placeholder="Describe the structural philosophy..."
                  disabled={status.state === 'uploading'}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Spline 3D Link (Optional)</label>
                <input
                  type="url"
                  value={formData.splineUrl}
                  onChange={(e) => setFormData({...formData, splineUrl: e.target.value})}
                  className="w-full bg-background/50 border border-white/10 rounded-xl p-4 font-body text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors"
                  placeholder="https://my.spline.design/..."
                  disabled={status.state === 'uploading'}
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Featured Photograph <span className="text-accent">*</span></label>
                <div className="w-full border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-background/30 hover:bg-background/50 transition-colors relative overflow-hidden group min-h-[160px]">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Preview" />
                      <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors" />
                      <div className="relative z-10 flex flex-col items-center gap-2">
                         <span className="bg-background/90 backdrop-blur-md px-5 py-2.5 rounded-full font-headline text-[10px] tracking-[0.2em] text-primary-text uppercase shadow-2xl flex items-center gap-2 group-hover:scale-105 transition-transform border border-white/5">
                            <span className="material-symbols-outlined text-sm">swap_horiz</span> Replace Image
                         </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">cloud_upload</span>
                      </div>
                      <div className="text-center font-body text-sm text-primary-text/60">
                        <span className="text-accent font-medium">Click to browse</span> or drag and drop<br />
                        <span className="text-[10px] text-primary-text/30 block mt-2 tracking-wider uppercase font-medium">JPEG, PNG up to 10MB</span>
                      </div>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={status.state === 'uploading'}
                    required={!imagePreview}
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end gap-6 items-center">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={status.state === 'uploading'}
                  className="font-headline text-[11px] font-bold uppercase tracking-widest text-primary-text/50 hover:text-primary-text transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status.state === 'uploading'}
                  className="bg-accent text-on-accent px-8 py-4 rounded-full font-headline font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {status.state === 'uploading' ? (
                     <>Publishing...</>
                  ) : (
                     <><span className="material-symbols-outlined text-[1rem]">cloud_done</span> Publish</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
