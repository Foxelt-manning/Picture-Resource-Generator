import React, { useEffect, useState } from 'react'

const PwaInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [status, setStatus] = useState('Checking install availability...')
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa-banner-dismissed') === 'true')
  const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setCanInstall(true)
      setStatus('Installable now')
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setCanInstall(false)
      setShowHelp(false)
      setStatus('Installed')
    }

    const checkStandAlone = () => {
      if (window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone) {
        setStatus('Running as installed app')
      } else if (!deferredPrompt) {
        setStatus('Not installable yet')
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    checkStandAlone()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [deferredPrompt])

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

  const handleDismiss = () => {
    setShowHelp(false)
    setDismissed(true)
    sessionStorage.setItem('pwa-banner-dismissed', 'true')
  }

  if (isStandalone || dismissed) return null

  return (
    <div className='fixed bottom-4 left-1/2 z-[1000] w-[min(92vw,420px)] -translate-x-1/2'>
      <div className='relative rounded-2xl border border-white/10 bg-[#151515]/95 px-4 py-3 shadow-2xl backdrop-blur-md'>
        <button
          type='button'
          onClick={handleDismiss}
          className='absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#E60023] text-white/90 transition-colors hover:bg-[#c9001f] hover:text-white'
          aria-label='Dismiss PWA banner'
          title='Dismiss'
        >
          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <div className='text-xs font-semibold uppercase tracking-[0.2em] text-gray-400'>PWA</div>
            <div className='truncate text-sm font-bold text-white'>{status}</div>
            <div className='mt-1 text-[11px] text-gray-400'>
              {canInstall ? 'Browser prompt is available' : 'Use browser menu or wait for install eligibility'}
            </div>
          </div>

          <button
            type='button'
            onClick={handleInstall}
             className='shrink-0 rounded-full bg-white mt-8 px-2 py-1 translate-y-[4px] text-xs sm:text-sm font-bold text-black shadow-lg transition-transform hover:scale-[1.02]'
            title={canInstall ? 'Install the app' : 'Install instructions'}
          >
            {canInstall ? 'Install app' : 'Help'}
          </button>
        </div>

        {showHelp && !canInstall && (
        <div className='absolute left-0 right-0 bottom-full mb-5 rounded-2xl border border-white/10 bg-[#171717] p-3 text-left text-xs text-gray-300 shadow-2xl z-[100]'>
          <div className='font-bold text-white mb-1'>Install this app</div>
          <p className='leading-5'>
            If your browser does not show the install prompt, open the browser menu and choose
            <span className='font-semibold text-white'> Install app</span> or
            <span className='font-semibold text-white'> Add to Home Screen</span>.
            
            <p className='mt-4 text-white'> Please note that only supported on <span className="font-bold text-red-300"><br/> Edge <br /> Brave <br /> Samsung Internet <br/>  Opera and Chrome</span> .</p>
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
    </div>
  )
}

export default PwaInstallButton;