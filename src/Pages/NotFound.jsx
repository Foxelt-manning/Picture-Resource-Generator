import React from 'react'
import Seo from '../Components/Seo'
import { SITE_NAME } from '../config/site'

const NotFound = () => {
  return (
    <div className='min-h-screen bg-[#111] text-white flex items-center justify-center p-6'>
      <Seo title='Not Found' description='Page not found' />
      <div className='max-w-xl text-center'>
        <h1 className='text-3xl font-bold mb-4'> Oops 🤭 currently — in development</h1>
        <p className='text-gray-400'>The page you're looking for can't be found. {SITE_NAME} is under active development — try returning home.</p>
        <div className='mt-6'>
          <a href='/' className='inline-block bg-white text-black px-4 py-2 rounded-full font-bold'>Go home</a>
        </div>
      </div>
    </div>
  )
}

export default NotFound
