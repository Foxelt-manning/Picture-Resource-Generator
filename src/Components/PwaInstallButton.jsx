import React, { useEffect, useState } from 'react'

const PwaInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone

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

  if (isStandalone) return null

  return (
    <div className='fixed bottom-4 right-4 z-[1000] inline-flex items-center'>
      <button
        type='button'
        onClick={handleInstall}
        className='inline-flex items-center justify-center rounded-full border border-white/15 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-black shadow-2xl transition-transform hover:scale-[1.02]'
        title={canInstall ? 'Install the app' : 'Install instructions'}
      >
        {canInstall ? 'Install PWA' : 'How to install'}
      </button>

      {showHelp && !canInstall && (
        <div className='absolute right-0 bottom-full mb-2 w-64 rounded-2xl border border-white/10 bg-[#171717] p-3 text-left text-xs text-gray-300 shadow-2xl z-[100]'>
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