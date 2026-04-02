import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProject, updateProject } from '../firebase/services/projectService';
import { uploadToIMGBB } from '../firebase/services/imgbbService';
import ImageCropModal from './ImageCropModal';
import { compressImage } from '../utils/cropImage';

export default function ProjectModal({ isOpen, onClose, onSuccess, initialData }) {
  const [formData, setFormData] = useState({ 
    title: '', 
    subtitle: '',
    philosophy: '', 
    splineUrl: '',
    location: '',
    scale: '',
    completion: '',
    materials: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [cropImage, setCropImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [croppingSlot, setCroppingSlot] = useState('featured'); // 'featured' or index 0-3
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [additionalCroppedBlobs, setAdditionalCroppedBlobs] = useState([]);
  const [additionalMetadata, setAdditionalMetadata] = useState([]); // [{ title: '', desc: '', type: 'image' }]

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        philosophy: initialData.philosophy || initialData.description || '',
        splineUrl: initialData.splineUrl || '',
        location: initialData.location || '',
        scale: initialData.scale || '',
        completion: initialData.completion || '',
        materials: initialData.materials || '',
      });
      setImagePreview(initialData.images?.[0]?.url || initialData.images?.[0] || '');
      setExistingImages(initialData.images || []);
      setAdditionalPreviews([]);
      setAdditionalFiles([]);
      setAdditionalCroppedBlobs([]);
      setAdditionalMetadata((initialData.images?.slice(1) || []).map(img => {
        if (typeof img === 'string') return { url: img, title: '', desc: '', type: 'image' };
        return img;
      }));
      setImageFile(null);
      setStatus({ state: 'idle', message: '' });
      setCroppingSlot('featured');
    } else if (isOpen) {
      setFormData({ 
        title: '', 
        subtitle: '',
        philosophy: '', 
        splineUrl: '',
        location: '',
        scale: '',
        completion: '',
        materials: ''
      });
      setImageFile(null);
      setImagePreview('');
      setAdditionalFiles([]);
      setAdditionalPreviews([]);
      setExistingImages([]);
      setAdditionalMetadata([]);
      setStatus({ state: 'idle', message: '' });
    }
  }, [initialData, isOpen]);

  const handleClose = () => {
    if (status.state === 'uploading') return;
    setFormData({ 
      title: '', 
      subtitle: '',
      philosophy: '', 
      splineUrl: '',
      location: '',
      scale: '',
      completion: '',
      materials: ''
    });
    setImageFile(null);
    setImagePreview('');
    setAdditionalFiles([]);
    setAdditionalPreviews([]);
    setExistingImages([]);
    setAdditionalMetadata([]);
    setStatus({ state: 'idle', message: '' });
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCroppingSlot('featured');
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob) => {
    if (croppingSlot === 'featured') {
      setCroppedBlob(blob);
      setImagePreview(URL.createObjectURL(blob));
    } else {
      const newBlobs = [...additionalCroppedBlobs];
      newBlobs[croppingSlot] = blob;
      setAdditionalCroppedBlobs(newBlobs);
      
      const newPreviews = [...additionalPreviews];
      newPreviews[croppingSlot] = URL.createObjectURL(blob);
      setAdditionalPreviews(newPreviews);
    }
    setIsCropModalOpen(false);
    setCropImage(null);
  };

  const handleAdditionalFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalFiles(files);
    setAdditionalCroppedBlobs(files); // Fallback: original files
    setAdditionalPreviews(files.map(f => URL.createObjectURL(f)));
    
    // Initialize metadata for new files
    setAdditionalMetadata(files.map(() => ({
      title: '',
      desc: '',
      type: 'image'
    })));
  };

  const handleMetadataChange = (index, field, value) => {
    const newMetadata = [...additionalMetadata];
    newMetadata[index] = { ...newMetadata[index], [field]: value };
    setAdditionalMetadata(newMetadata);
  };

  const handleCropAdditional = (index) => {
    const file = additionalFiles[index];
    if (file) {
      setCroppingSlot(index);
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent execution if required data is missing
    if (!croppedBlob && !initialData) {
      console.error("Upload aborted: No image selected for new project");
      setStatus({ state: 'error', message: 'Please select and crop a featured image' });
      return;
    }

    // Spline URL Validation
    if (formData.splineUrl) {
      const isMySpline = formData.splineUrl.includes('my.spline.design');
      const isValid = formData.splineUrl.includes('prod.spline.design');
      
      if (isMySpline) {
        setStatus({ 
          state: 'error', 
          message: 'Please use the Export → Embed link (prod.spline.design) instead of the editor link.' 
        });
        return;
      }
      
      if (!isValid) {
        setStatus({ 
          state: 'error', 
          message: 'Invalid Spline link. Please use a valid embed URL from Spline.' 
        });
        return;
      }
    }

    setStatus({ state: 'uploading', message: 'Optimizing and syncing assets...' });

    try {
      console.log("--- Starting Upload Flow ---");

      // 1. Upload Featured Image
      let featuredUrl = initialData?.mainImage || imagePreview;
      if (croppedBlob) {
        console.log("Uploading featured image to IMGBB...");
        featuredUrl = await uploadToIMGBB(croppedBlob);
        
        if (!featuredUrl) {
          throw new Error("IMGBB failed to return a URL for the featured image.");
        }
        console.log("Featured image uploaded:", featuredUrl);
      }

      // 2. Prepare Additional Images
      const additionalUrls = [];
      if (additionalCroppedBlobs.length > 0) {
        console.log(`Optimizing and uploading ${additionalCroppedBlobs.length} additional images...`);
        for (let i = 0; i < additionalCroppedBlobs.length; i++) {
          const blob = additionalCroppedBlobs[i];
          let finalizedBlob = blob;
          if (blob instanceof File) {
             finalizedBlob = await compressImage(blob, 0.8, 1600);
          }
          const url = await uploadToIMGBB(finalizedBlob);
          
          if (!url) {
            throw new Error(`IMGBB failed to return a URL for additional image ${i + 1}`);
          }
          
          additionalUrls.push(url);
          console.log(`Additional image ${i + 1} uploaded:`, url);
        }
      }

      setStatus({ state: 'uploading', message: 'Finalizing database entry...' });
      
      // 3. Construct Unified Images Array (Objects)
      const finalImages = [
        { 
          url: featuredUrl, 
          title: formData.title, 
          description: formData.subtitle || "Featured Photo"
        }
      ];

      if (additionalUrls.length > 0) {
        additionalUrls.forEach((url, i) => {
          const meta = additionalMetadata[i] || {};
          finalImages.push({
            url: url,
            title: meta.title || `${formData.title} - View ${i + 1}`,
            description: meta.desc || formData.subtitle || "Architectural Detail"
          });
        });
      } else if (existingImages.length > 1) {
        const additionalExisting = existingImages.slice(1).map((img, i) => {
          if (typeof img === 'string') {
            return { url: img, title: '', description: '' };
          }
          return {
            url: img.url,
            title: img.title || '',
            description: img.description || img.desc || ''
          };
        });
        finalImages.push(...additionalExisting);
      }

      const projectPayload = {
        title: formData.title,
        subtitle: formData.subtitle || '',
        philosophy: formData.philosophy,
        mainImage: featuredUrl,
        location: formData.location || '',
        scale: formData.scale || '',
        completion: formData.completion || '',
        materials: formData.materials || '',
        splineUrl: formData.splineUrl || '',
        images: finalImages
      };

      console.log("Final payload build success. Sending to Firestore...");
      
      if (initialData) {
        await updateProject(initialData.id, projectPayload);
        setStatus({ state: 'success', message: 'Project Updated!' });
      } else {
        await createProject(projectPayload);
        setStatus({ state: 'success', message: 'Project Published!' });
      }
      
      onSuccess();
      
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err) {
      console.error("Upload Flow Error:", err);
      setStatus({ state: 'error', message: err.message || 'System fault occurred' });
    } finally {
      // Ensure loading state is cleared if not success
      setStatus(prev => prev.state === 'success' ? prev : { ...prev, state: 'idle' });
      console.log("--- Upload Flow Complete ---");
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
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Archive Subtitle (e.g. Architectural Study)</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full bg-background/50 border border-white/10 rounded-xl p-4 font-body text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors"
                  placeholder="e.g. Residential Observation"
                  disabled={status.state === 'uploading'}
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Architectural Philosophy <span className="text-accent">*</span></label>
                <textarea
                  rows={3}
                  value={formData.philosophy}
                  onChange={(e) => setFormData({...formData, philosophy: e.target.value})}
                  className="w-full bg-background/50 border border-white/10 rounded-xl p-4 font-body text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors resize-none"
                  placeholder="Describe the structural philosophy..."
                  disabled={status.state === 'uploading'}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-background/50 border border-white/10 rounded-xl p-3 font-body text-xs text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors"
                    placeholder="e.g. Iceland"
                    disabled={status.state === 'uploading'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Scale</label>
                  <input
                    type="text"
                    value={formData.scale}
                    onChange={(e) => setFormData({...formData, scale: e.target.value})}
                    className="w-full bg-background/50 border border-white/10 rounded-xl p-3 font-body text-xs text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors"
                    placeholder="e.g. 450 sqm"
                    disabled={status.state === 'uploading'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Completion</label>
                  <input
                    type="text"
                    value={formData.completion}
                    onChange={(e) => setFormData({...formData, completion: e.target.value})}
                    className="w-full bg-background/50 border border-white/10 rounded-xl p-3 font-body text-xs text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors"
                    placeholder="e.g. 2024"
                    disabled={status.state === 'uploading'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Materials</label>
                  <input
                    type="text"
                    value={formData.materials}
                    onChange={(e) => setFormData({...formData, materials: e.target.value})}
                    className="w-full bg-background/50 border border-white/10 rounded-xl p-3 font-body text-xs text-primary-text placeholder:text-white/10 focus:border-accent focus:outline-none transition-colors"
                    placeholder="e.g. Concrete, Glass"
                    disabled={status.state === 'uploading'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Spline 3D Link (Optional)</label>
                <input
                  type="url"
                  value={formData.splineUrl}
                  onChange={(e) => setFormData({...formData, splineUrl: e.target.value})}
                  className={`w-full bg-background/50 border rounded-xl p-4 font-body text-primary-text placeholder:text-white/10 focus:outline-none transition-colors ${
                    formData.splineUrl && formData.splineUrl.includes('my.spline.design') 
                      ? 'border-orange-500/50 focus:border-orange-500' 
                      : 'border-white/10 focus:border-accent'
                  }`}
                  placeholder="https://prod.spline.design/..."
                  disabled={status.state === 'uploading'}
                />
                {formData.splineUrl && formData.splineUrl.includes('my.spline.design') && (
                  <p className="text-[9px] text-orange-400/80 mt-1 ml-1 leading-relaxed uppercase tracking-wider font-medium">
                    ⚠️ Tip: Use the dynamic "Embed" link from Spline (Export → Embed) instead of the editor URL.
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Featured Photograph <span className="text-accent">*</span></label>
                <div className="w-full border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-background/30 hover:bg-background/50 transition-colors relative overflow-hidden group min-h-[160px]">
                  {imagePreview ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img src={imagePreview} className="w-full h-full object-cover opacity-60" alt="Preview" />
                      <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors" />
                      <div className="relative z-10 flex h-full items-center justify-center">
                         <span className="bg-background/90 backdrop-blur-md px-5 py-2.5 rounded-full font-headline text-[10px] tracking-[0.2em] text-primary-text uppercase shadow-2xl border border-white/5">
                            <span className="material-symbols-outlined text-sm">swap_horiz</span> Replace Image
                         </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        disabled={status.state === 'uploading'}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">cloud_upload</span>
                      </div>
                      <div className="text-center font-body text-sm text-primary-text/60">
                        <span className="text-accent font-medium">Click to browse</span> or drag and drop<br />
                        <span className="text-[10px] text-primary-text/30 block mt-2 tracking-wider uppercase font-medium">JPEG, PNG up to 10MB</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        disabled={status.state === 'uploading'}
                        required
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="font-label text-[10px] tracking-[0.2em] uppercase text-primary-text/40 ml-1">Additional Images (Up to 4)</label>
                <div className="w-full border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-background/30 hover:bg-background/50 transition-colors relative overflow-hidden group min-h-[120px]">
                  {additionalPreviews.length > 0 ? (
                    <div className="w-full space-y-6 relative z-10">
                      {additionalPreviews.map((src, i) => (
                        <div key={i} className="flex gap-6 items-start bg-background/40 p-4 rounded-2xl border border-white/5 group/item relative">
                          <div className="relative w-24 h-24 shrink-0 rounded-xl border border-white/10 overflow-hidden group/thumb cursor-pointer">
                            <img src={src} className="w-full h-full object-cover" alt={`Preview ${i+1}`} />
                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleCropAdditional(i); }}
                                className="w-8 h-8 bg-accent text-on-accent rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg relative z-30"
                                title="Crop Image"
                              >
                                <span className="material-symbols-outlined text-[16px]">crop_free</span>
                              </button>
                            </div>
                            <input 
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleAdditionalFilesChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                              title="Replace all gallery images"
                            />
                          </div>
                          
                          <div className="flex-1 space-y-3 relative z-30">
                            <input 
                              type="text"
                              placeholder="Image Title (e.g. South Elevation)"
                              value={additionalMetadata[i]?.title || ''}
                              onChange={(e) => handleMetadataChange(i, 'title', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-body text-[11px] text-primary-text focus:border-accent focus:outline-none transition-colors"
                            />
                            <textarea
                              placeholder="Brief description of this view..."
                              rows={2}
                              value={additionalMetadata[i]?.desc || ''}
                              onChange={(e) => handleMetadataChange(i, 'desc', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-body text-[10px] text-primary-text/60 focus:border-accent focus:outline-none transition-colors resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (existingImages.length > 1) ? (
                    <div className="w-full space-y-6 relative z-10">
                      {existingImages.slice(1).map((img, i) => {
                        const url = typeof img === 'string' ? img : img.url;
                        const meta = typeof img === 'string' ? { title: '', desc: '' } : img;
                        return (
                          <div key={i} className="flex gap-6 items-start bg-background/40 p-4 rounded-2xl border border-white/5 opacity-80 group/item relative">
                            <div className="relative w-24 h-24 shrink-0 rounded-xl border border-white/10 overflow-hidden grayscale cursor-pointer group/thumb">
                              <img src={url} className="w-full h-full object-cover" alt="existing" />
                              <input 
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleAdditionalFilesChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                title="Click to replace gallery with new images"
                              />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary-text/30">Existing Asset {i+1}</div>
                              <p className="font-body text-[11px] text-primary-text/40">{meta.title || 'No Title'}</p>
                              <p className="font-body text-[10px] text-primary-text/20 italic line-clamp-1">{meta.desc || 'No description provided.'}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-center font-label text-[9px] text-accent/50 uppercase tracking-[0.2em] pt-2 italic">Uploading new images will replace these existing gallery entries</div>
                    </div>
                  ) : (
                    <div className="relative z-10 text-center font-body text-sm text-primary-text/60">
                      <span className="text-accent font-medium">Select up to 4 images</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalFilesChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        disabled={status.state === 'uploading'}
                      />
                    </div>
                  )}
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
