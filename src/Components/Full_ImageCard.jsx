import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const FullImageCard = ({ src, alt, onClose }) => {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

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
    } catch (err) {
      // final fallback: open in new tab
      try { window.open(src, '_blank', 'noopener,noreferrer'); } catch (e) { console.error(e); }
    } finally {
      setSaving(false);
    }
  };

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

        <button
          onClick={handleDownload}
          className='absolute top-3 left-3 z-20 bg-[#E60023] text-white px-3 py-2 rounded-md hover:opacity-90'
        >
          {saving ? 'Saving...' : 'Download'}
        </button>

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
