import React, { useEffect, useState } from 'react'

const PwaInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setCanInstall(false)
      setShowHelp(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowHelp(prev => !prev)
      return
    }

    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setCanInstall(false)
    setShowHelp(false)
  }

  return (
    <div className='relative inline-flex items-center'>
      <button
        type='button'
        onClick={handleInstall}
        className='inline-flex items-center justify-center rounded-full border border-white/15 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-black shadow-sm transition-transform hover:scale-[1.02]'
        title={canInstall ? 'Install the app' : 'Install instructions'}
      >
        {canInstall ? 'Install app' : 'Install info'}
      </button>

      {showHelp && !canInstall && (
        <div className='absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-[#171717] p-3 text-left text-xs text-gray-300 shadow-2xl z-[100]'>
          <div className='font-bold text-white mb-1'>Install this app</div>
          <p className='leading-5'>
            If your browser does not show the install prompt, open the browser menu and choose
            <span className='font-semibold text-white'> Install app</span> or
            <span className='font-semibold text-white'> Add to Home Screen</span>.
          </p>
          <button
            type='button'
            onClick={() => setShowHelp(false)}
            className='mt-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-black'
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

export default PwaInstallButton;