import React, { useState } from 'react'
import {createPortal} from 'react-dom'

const ImageCard = ({data}) => {

  if(!data) return null
  
  const [active,setActive] =useState(null);
  
  // Handle different API response formats
  const ImageUrl = data.image || data.images || data.url || data.src || data;
  
  console.log('Extracted ImageUrl:', ImageUrl);
  
  // Handle missing images gracefully
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ccc"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
  };

  return (
  <>
    
  <div className='border-gray-700 bg-surface/50 p-4 rounded-xl backdrop-blur-lg hover:border-accent hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:transform hover:scale-105'> 
    <img 
      src={ImageUrl} 
      alt="Search result" 
      className='w-full h-auto object-cover rounded-lg'
      onError={handleImageError}
      loading="lazy"
      onClick={() => setActive(ImageUrl)}
    />

    {active && createPortal(
      <div
      className='fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]'
      onClick={()=>setActive(null)}
      >
        <button onClick={() => setActive(null)} className='absolute top-4 right-4 text-red-500 text-2xl cursor-pointer font-bold'>
          X
        </button>
        <img src={active} className='max-w-[95vw] max-h-[95vh] object-contain cursor-zoom-out'
        onClick={e => e.stopPropagation()}/>
      </div>,document.body
    )}

  </div>

  
    </>
  )
}

export default ImageCard