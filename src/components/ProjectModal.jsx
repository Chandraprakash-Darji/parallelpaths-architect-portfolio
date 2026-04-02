import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProject, updateProject } from '../firebase/services/projectService';
import { uploadFile } from '../firebase/services/storageService';
import ImageCropModal from './ImageCropModal';
import { compressImage } from '../utils/cropImage';

export default function ProjectModal({ isOpen, onClose, onSuccess, initialData }) {
  const [formData, setFormData] = useState({ title: '', description: '', splineUrl: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [cropImage, setCropImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        splineUrl: initialData.splineUrl || '',
      });
      setImagePreview(initialData.images?.[0] || '');
      setExistingImages(initialData.images || []);
      setAdditionalPreviews([]);
      setAdditionalFiles([]);
      setImageFile(null);
      setStatus({ state: 'idle', message: '' });
    } else if (isOpen) {
      setFormData({ title: '', description: '', splineUrl: '' });
      setImageFile(null);
      setImagePreview('');
      setAdditionalFiles([]);
      setAdditionalPreviews([]);
      setExistingImages([]);
      setStatus({ state: 'idle', message: '' });
    }
  }, [initialData, isOpen]);

  const handleClose = () => {
    if (status.state === 'uploading') return;
    setFormData({ title: '', description: '', splineUrl: '' });
    setImageFile(null);
    setImagePreview('');
    setAdditionalFiles([]);
    setAdditionalPreviews([]);
    setExistingImages([]);
    setStatus({ state: 'idle', message: '' });
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob) => {
    setCroppedBlob(blob);
    setImagePreview(URL.createObjectURL(blob));
    setIsCropModalOpen(false);
    setCropImage(null);
  };

  const handleAdditionalFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalFiles(files);
    setAdditionalPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'uploading', message: 'Optimizing and syncing assets...' });

    try {
      const timestamp = Date.now();
      const slug = formData.title.replace(/\s+/g, '-').toLowerCase();

      // 1. Prepare Featured Image Promise
      let featuredPromise = Promise.resolve(imagePreview);
      if (croppedBlob) {
        const path = `projects/${slug}_featured_${timestamp}.jpg`;
        featuredPromise = uploadFile(croppedBlob, path);
      }

      // 2. Prepare Additional Image Promises with compression
      const additionalUploadPromises = additionalFiles.map(async (file, index) => {
        const compressed = await compressImage(file, 0.8, 1600);
        const path = `projects/${slug}_extra_${timestamp}_${index}.jpg`;
        return uploadFile(compressed, path);
      });

      // 3. Execute all uploads in parallel
      const [featuredUrl, ...additionalUrls] = await Promise.all([
        featuredPromise,
        ...additionalUploadPromises
      ]);

      setStatus({ state: 'uploading', message: 'Finalizing database entry...' });
      
      let finalImages = [featuredUrl];
      if (additionalUrls.length > 0) {
        finalImages = [...finalImages, ...additionalUrls];
      } else if (existingImages.length > 1) {
        // Carry over existing images if no new ones selected
        finalImages = [...finalImages, ...existingImages.slice(1)];
      }

      const projectPayload = {
        title: formData.title,
        description: formData.description,
        splineUrl: formData.splineUrl || null,
        images: finalImages
      };

      if (initialData) {
        await updateProject(initialData.id, projectPayload);
        setStatus({ state: 'success', message: 'Project Updated!' });
      } else {
        await createProject(projectPayload);
        setStatus({ state: 'success', message: 'Project Published!' });
      }
      
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
            <ImageCropModal 
              isOpen={isCropModalOpen}
              image={cropImage}
              onCancel={() => { setIsCropModalOpen(false); setCropImage(null); }}
              onCropComplete={handleCropComplete}
            />

            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="font-label text-[10px] tracking-[0.3em] uppercase text-accent mb-2 block">Database Entry</span>
                <h2 className="font-headline font-extrabold text-2xl uppercase tracking-wider text-primary-text">{initialData ? 'Edit Piece' : 'Add New Piece'}</h2>
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

              <div className="space-y-2 pt-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Additional Images (Up to 4)</label>
                <div className="w-full border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-background/30 hover:bg-background/50 transition-colors relative overflow-hidden group min-h-[120px]">
                  {additionalPreviews.length > 0 ? (
                    <div className="flex gap-2 w-full p-2 relative z-10 justify-center">
                      {additionalPreviews.map((src, i) => (
                        <div key={i} className="relative w-16 h-16 shrink-0 rounded-md border border-white/10 overflow-hidden">
                          <img src={src} className="w-full h-full object-cover" alt="preview" />
                        </div>
                      ))}
                    </div>
                  ) : (existingImages.length > 1) ? (
                    <div className="flex gap-2 w-full p-2 relative z-10 justify-center">
                      {existingImages.slice(1).map((src, i) => (
                        <div key={i} className="relative w-16 h-16 shrink-0 rounded-md border border-white/10 overflow-hidden">
                          <img src={src} className="w-full h-full object-cover" alt="existing" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative z-10 text-center font-body text-sm text-primary-text/60">
                      <span className="text-accent font-medium">Select up to 4 images</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalFilesChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={status.state === 'uploading'}
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
                     <><span className="material-symbols-outlined text-[1rem]">cloud_done</span> {initialData ? 'Update' : 'Publish'}</>
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
