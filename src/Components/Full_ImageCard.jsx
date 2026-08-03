import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { isSaved, removeFromCollection, saveToCollection } from '../utils/cacheLogic'

const FullImageCard = ({ src, alt, query = '', source = '', onClose }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('save');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    setSaved(isSaved(src));
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [src, onClose]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 1600);
    return () => clearTimeout(timer);
  }, [feedback]);

  if (!src) return null;

  const handleDownload = async () => {
    setSaving(true);
    try {
      // Prefer fetch+blob (works with permissive CORS)
      const res = await fetch(src);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const parts = src.split('/');
        let name = parts[parts.length - 1].split('?')[0] || 'image';
        if (!name.includes('.')) name += '.jpg';
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        // fallback to direct anchor (may be ignored by some browsers)
        const a = document.createElement('a');
        a.href = src;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch {
      // final fallback: open in new tab
      try { window.open(src, '_blank', 'noopener,noreferrer'); } catch (e) { console.error(e); }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!saved) {
      saveToCollection(src, query || alt || '', source || '')
      setSaved(true)
      setFeedbackType('save')
      setFeedback('Saved to collections')
      return
    }

    removeFromCollection(src)
    setSaved(false)
    setFeedbackType('remove')
    setFeedback('Removed from collections')
  }

  return createPortal(
    <div className='fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4'>
      <div className='absolute inset-0' onClick={onClose} />

      <div className='relative max-w-[95vw] max-h-[95vh]'>
        {/* subtle backdrop behind the close button to ensure visibility */}
        <span className='absolute top-2 right-2 w-12 h-12 rounded-full bg-black/40 z-10 blur-sm' aria-hidden />
        <button
          onClick={onClose}
          className='absolute top-3 right-3 z-20 bg-[#E60023]/95 text-white p-3 rounded-full hover:opacity-95 shadow-2xl ring-2 ring-white/20 backdrop-blur-sm'
          aria-label='Close'
          title='Close'
        >
          <svg className='w-6 h-6' fill='none' stroke='white' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        <div className='absolute top-3 left-3 z-20 flex flex-wrap gap-2'>
          <button
            onClick={handleDownload}
            className='bg-[#E60023] text-white px-3 py-2 rounded-md hover:opacity-90'
          >
            {saving ? 'Saving...' : 'Download'}
          </button>
        </div>

        <button
          onClick={handleSave}
          className={`absolute bottom-3 left-3 z-20 rounded-full p-3 shadow-2xl ring-2 transition-colors backdrop-blur-sm ${saved ? 'bg-[#E60023] text-white ring-white/20' : 'bg-white text-[#E60023] ring-[#E60023]/20 hover:bg-gray-100'}`}
          title={saved ? 'Remove from collections' : 'Save to collections'}
          aria-label={saved ? 'Remove from collections' : 'Save to collections'}
        >
          <svg className='w-5 h-5' fill={saved ? 'white' : 'currentColor'} viewBox='0 0 24 24'>
            <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
          </svg>
        </button>

        {feedback && (
          <div className={`absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-bold shadow-2xl ring-1 backdrop-blur-md ${feedbackType === 'remove' ? 'text-[#E60023] ring-[#E60023]/20' : 'text-[#E60023] ring-[#E60023]/20'}`}>
            {feedback}
          </div>
        )}

        <img
          src={src}
          alt={alt || 'Full view'}
          className='block max-w-full max-h-[92vh] rounded-lg shadow-2xl mx-auto object-contain'
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>,
    document.body
  );
};

export default FullImageCard;
