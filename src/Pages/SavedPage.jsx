import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SavedCollections from '../Components/Saved_Collections'
import Seo from '../Components/Seo'
import { SITE_NAME } from '../config/site'

const SavedPage = () => {
  const navigate = useNavigate()

  const handleSearch = (query, source) => {
    const nextQuery = (query || '').trim()
    if (!nextQuery) {
      navigate('/')
      return
    }

    const params = new URLSearchParams()
    params.set('q', nextQuery)
    if (source) params.set('tab', source)
    navigate({ pathname: '/', search: `?${params.toString()}` })
  }

  return (
    <div className='min-h-screen bg-[#111] text-white'>
      <Seo
        title={`Saved Collections`}
        description='View your saved image collections, grouped by search query, with quick access to reopen related searches.'
        robots='noindex,follow'
      />
      <header className='sticky top-0 z-50 bg-[#111]/95 backdrop-blur-md border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Link to='/' className='text-[#E60023] font-bold text-2xl tracking-tighter'>
            {SITE_NAME}
          </Link>
          <div className='flex flex-wrap items-center gap-2'>
            <Link to='/' className='px-4 py-2 rounded-full text-sm font-bold bg-white text-black'>
              Search
            </Link>
            <Link to='/settings' className='px-4 py-2 rounded-full text-sm font-bold text-gray-400 hover:text-white'>
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4'>
        <SavedCollections onSearch={handleSearch} />
      </main>
    </div>
  )
}

export default SavedPage
