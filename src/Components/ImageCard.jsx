import React, { useState } from 'react'
import { createPortal } from 'react-dom'

const ImageCard = ({ data, query }) => {
  if (!data) return null
  
  const [active, setActive] = useState(null);
  // Extract URL from various possible API formats
  const ImageUrl = data.image || data.images || data.url || data.src || data;

  return (
    <>
      <div className='relative group cursor-zoom-in overflow-hidden rounded-2xl bg-[#222] shadow-sm'> 
        {/* Pinterest-style Hover Overlay */}
        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-between p-4'>
          <div className='flex justify-end'>
            <button className='bg-[#E60023] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#ad001a] transition-colors shadow-md'>
              Save
            </button>
          </div>
          <div className='flex justify-between items-center'>
            <div className='bg-white/90 hover:bg-white p-2 rounded-full transition-colors cursor-pointer shadow-sm'>
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </div>
          </div>
        </div>

        <img 
          src={ImageUrl} 
          alt={query || "Inspiration"} 
          className='w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110'
          loading="lazy"
          onClick={() => setActive(ImageUrl)}
          onError={(e) => {
            // Graceful fallback for broken images
            e.target.src = 'https://placehold.co/400x600/333/white?text=Inspiration';
          }}
        />
      </div>

      {/* Full-screen Lightbox using Portal */}
      {active && createPortal(
        <div
          className='fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300'
          onClick={() => setActive(null)}
        >
          <button className='absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors'>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={active} 
            className='max-w-full max-h-[92vh] rounded-xl shadow-2xl object-contain cursor-zoom-out'
            onClick={e => e.stopPropagation()}
            alt="Expanded view"
          />
        </div>, document.body
      )}
    </>
  )
}

export default ImageCard
