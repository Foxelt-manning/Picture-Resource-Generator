import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../Components/Seo'
import { SITE_NAME } from '../config/site'
import {
  getCollectionSettings,
  setCollectionSettings,
  getCollectionRetentionMs,
  pruneCollections,
  getCollections
} from '../utils/cacheLogic'

const unitOptions = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' }
]

const SettingsPage = () => {
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('')
  const [status, setStatus] = useState('')
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    const settings = getCollectionSettings()
    setValue(settings.value || '')
    setUnit(settings.unit || '')
    setSavedCount(getCollections().length)
  }, [])

  const handleSave = () => {
    if (!value || Number(value) <= 0 || !unit) {
      setStatus('Enter a retention value and choose a unit before saving.')
      return
    }

    setCollectionSettings({ value, unit })
    setStatus('Collection retention saved.')
  }

  const handlePrune = () => {
    const retentionMs = getCollectionRetentionMs({ value, unit })
    if (!retentionMs) {
      setStatus('Set a valid retention time first.')
      return
    }

    const nextItems = pruneCollections(retentionMs)
    setSavedCount(nextItems.length)
    setStatus('Old saved collections cleared.')
  }

  return (
    <div className='min-h-screen bg-[#111] text-white'>
      <Seo
        title='Collection Settings'
        description='Set how long saved collections should remain stored before you clear them manually.'
        robots='noindex,follow'
      />
      <header className='sticky top-0 z-50 bg-[#111]/95 backdrop-blur-md border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Link to='/' className='text-[#E60023] font-bold text-2xl tracking-tighter'>
            {SITE_NAME}
          </Link>
          <div className='flex flex-wrap items-center gap-2'>
            <Link to='/' className='px-4 py-2 rounded-full text-sm font-bold text-gray-400 hover:text-white'>
              Search
            </Link>
            <Link to='/saved' className='px-4 py-2 rounded-full text-sm font-bold text-gray-400 hover:text-white'>
              Saved
            </Link>
          </div>
        </div>
      </header>

      <main className='max-w-3xl mx-auto px-4 py-8 sm:py-10 space-y-8'>
        <section className='bg-[#171717] border border-white/10 rounded-2xl p-6'>
          <h1 className='text-2xl sm:text-3xl font-bold'>Collection Settings</h1>
          <p className='mt-2 text-gray-400'>Choose how long saved collections should stay before you clear them manually.</p>

          <div className='mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end'>
            <label className='block'>
              <span className='block text-sm text-gray-300 mb-2'>Retention value</span>
              <input
                type='number'
                min='1'
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder='Enter a value'
                className='w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/20'
              />
            </label>

            <label className='block'>
              <span className='block text-sm text-gray-300 mb-2'>Unit</span>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className='w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/20'
              >
                <option value=''>Select a unit</option>
                {unitOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className='mt-6 flex flex-wrap gap-3'>
            <button
              onClick={handleSave}
              className='bg-white text-black rounded-full px-5 py-3 font-bold hover:scale-[1.02] transition-transform w-full sm:w-auto'
            >
              Save settings
            </button>
            <button
              onClick={handlePrune}
              className='bg-[#E60023] text-white rounded-full px-5 py-3 font-bold hover:opacity-95 transition-opacity w-full sm:w-auto'
            >
              Clear collections now
            </button>
          </div>

          <div className='mt-4 text-sm text-gray-400'>
            Saved collections count: {savedCount}
          </div>

          {getCollectionRetentionMs({ value, unit }) && (
            <div className='mt-2 text-sm text-gray-500'>
              Current prune window: {value} {unit}
            </div>
          )}

          {status && (
            <div className='mt-4 text-sm text-gray-300'>{status}</div>
          )}
        </section>
      </main>
    </div>
  )
}

export default SettingsPage
