import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import FullImageCard from './Full_ImageCard'
import { saveToCollection, isSaved, removeFromCollection } from '../utils/cacheLogic'

const ImageCard = ({ data, query }) => {
  const ImageUrl = data?.image || data?.images || data?.url || data?.src || data
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastKind, setToastKind] = useState('save');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!ImageUrl) {
      setSaved(false)
      return
    }
    setSaved(isSaved(ImageUrl));
  }, [ImageUrl]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!ImageUrl) return null

  return (
    <>
      <div onClick={() => setActive(ImageUrl)} className='relative group cursor-zoom-in overflow-hidden rounded-2xl bg-[#222] shadow-sm'> 
        {/* Pinterest-style Hover Overlay */}
        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-between p-4'>
          <div className='flex justify-end'>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!ImageUrl) return;
                setSaving(true);
                try {
                  console.info('Attempting to save', ImageUrl);
                  const res = await fetch(ImageUrl);
                  if (!res.ok) throw new Error(`fetch status ${res.status}`);
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  const parts = ImageUrl.split('/');
                  let name = parts[parts.length - 1].split('?')[0] || 'image';
                  if (!name.includes('.')) name += '.jpg';
                  a.download = name;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                  console.info('Download triggered for', name);
                } catch (err) {
                  console.warn('Save via fetch failed, attempting direct download fallback', err);
                  // Fallback 1: try creating an <a download> pointing to the remote URL.
                  // Note: many browsers ignore `download` for cross-origin URLs, but it's a best-effort.
                  try {
                    const parts = ImageUrl.split('/');
                    let name = parts[parts.length - 1].split('?')[0] || 'image';
                    if (!name.includes('.')) name += '.jpg';
                    const a = document.createElement('a');
                    a.href = ImageUrl;
                    a.download = name;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    console.info('Direct-download fallback triggered');
                  } catch (err2) {
                    console.error('Direct-download fallback failed', err2);
                    // Final fallback: open image in new tab
                    try { window.open(ImageUrl, '_blank', 'noopener,noreferrer'); } catch (err3) { console.error('Fallback open failed', err3); }
                  }
                } finally {
                  setSaving(false);
                }
              }}
              className='bg-[#E60023] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#ad001a] transition-colors shadow-md'
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className='flex justify-between items-center'>
            <div
              onClick={(e) => {
                e.stopPropagation();
                // toggle saved state
                if (saved) {
                  removeFromCollection(ImageUrl);
                  setSaved(false);
                  setToastKind('remove');
                  setToast('Removed from collections');
                } else {
                  saveToCollection(ImageUrl, query || '');
                  setSaved(true);
                  setToastKind('save');
                  setToast('Saved to collections');
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                removeFromCollection(ImageUrl);
                setSaved(false);
                setToastKind('remove');
                setToast('Removed from collections');
              }}
              className={`${saved ? 'bg-[#E60023] text-white' : 'bg-white/90 hover:bg-white text-black'} p-2 rounded-full transition-colors cursor-pointer shadow-sm`}
            >
                <svg className="w-5 h-5" fill={saved ? 'white' : 'currentColor'} viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </div>
          </div>
        </div>

        <img 
          src={ImageUrl} 
          alt={query || "Inspiration"} 
          className='w-full aspect-[3/4] sm:aspect-auto sm:h-auto object-cover transition-transform duration-500 group-hover:scale-110'
          loading="lazy"
          onError={(e) => {
            // Graceful fallback for broken images
            e.target.src = 'https://placehold.co/400x600/333/white?text=Inspiration';
          }}
        />
      </div>

      {/* Full-screen Lightbox using FullImageCard component */}
      {active && (
        <FullImageCard src={active} alt={query || 'Expanded view'} onClose={() => setActive(null)} />
      )}

      {toast && createPortal(
        <div className={`fixed bottom-6 left-1/2 z-[10000] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-2xl ring-1 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 ${toastKind === 'remove' ? 'text-[#E60023] ring-[#E60023]/20' : 'text-[#E60023] ring-[#E60023]/20'}`}>
          {toast}
        </div>,
        document.body
      )}
    </>
  )
}

export default ImageCard
