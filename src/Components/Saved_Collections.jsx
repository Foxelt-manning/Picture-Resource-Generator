import React, { useEffect, useState, useMemo } from 'react'
import { getCollections, removeFromCollection } from '../utils/cacheLogic'
import FullImageCard from './Full_ImageCard'

const SavedCollections = ({ onSearch }) => {
  const [items, setItems] = useState([])
  const [active, setActive] = useState(null)

  useEffect(() => {
    setItems(getCollections())
  }, [])

  const handleRemove = (id) => {
    removeFromCollection(id)
    setItems(getCollections())
  }
  // Group items by their query for "similar search" grouping
  const groups = useMemo(() => {
    return (items || []).reduce((acc, item) => {
      const key = (item.query || 'No query').trim() || 'No query';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [items]);

  if (!items || items.length === 0) return (
    <div className='py-24 text-center'>
      <h2 className='text-3xl font-bold'>No saved images yet</h2>
      <p className='mt-4 text-gray-400'>Click the heart on any image to save it here.</p>
    </div>
  )

  return (
    <div className='py-6 sm:py-8 space-y-6 sm:space-y-8'>
      <h2 className='text-xl sm:text-2xl font-bold mb-2'>Saved Collections</h2>

      {Object.keys(groups).map((groupKey) => (
        <section key={groupKey} className='bg-[#0b0b0b] p-3 sm:p-4 rounded-2xl'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4'>
            <div>
              <div className='text-base sm:text-lg font-semibold break-words'>{groupKey}</div>
              <div className='text-sm text-gray-400'>{groups[groupKey].length} item{groups[groupKey].length > 1 ? 's' : ''}</div>
            </div>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => onSearch?.(groupKey === 'No query' ? '' : groupKey, groups[groupKey]?.[0]?.source)}
                className='bg-white text-black px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold w-full sm:w-auto'
              >
                Search this group
              </button>
              <button
                onClick={() => {
                  // remove all items in this group
                  groups[groupKey].forEach(i => removeFromCollection(i.id));
                  setItems(getCollections());
                }}
                className='text-red-400 text-xs sm:text-sm w-full sm:w-auto'
              >
                Remove group
              </button>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
            {groups[groupKey].map(item => (
              <div key={item.id} className='bg-[#111] p-2 rounded-2xl'>
                <img
                  src={item.url}
                  alt={item.query || 'saved'}
                  className='w-full aspect-[3/4] sm:aspect-auto sm:h-48 object-cover rounded-xl cursor-zoom-in'
                  onClick={() => setActive(item.url)}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x600/333/ffffff?text=No+Preview' }}
                />
                <div className='mt-2 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:justify-between sm:items-center'>
                  <div className='min-w-0'>
                    <div className='text-xs sm:text-sm text-gray-300 truncate' title={item.query || ''}>{item.query || 'no query'}</div>
                    <div className='text-xs text-gray-500'>{new Date(item.timestamp).toLocaleString()}</div>
                  </div>
                  <div className='flex flex-row sm:flex-col gap-2'>
                    <button
                      onClick={() => onSearch?.(item.query, item.source)}
                      className='bg-white text-black px-2 py-1.5 rounded-full text-[11px] sm:text-sm w-full sm:w-auto'
                    >
                      Search
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className='text-red-400 text-[11px] sm:text-sm w-full sm:w-auto'
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {active && (
        <FullImageCard src={active} alt={'Saved full view'} query={items.find(item => item.url === active)?.query || ''} source={items.find(item => item.url === active)?.source || ''} onClose={() => setActive(null)} />
      )}
    </div>
  )
}

export default SavedCollections
