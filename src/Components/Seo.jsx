import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_DESCRIPTION, SITE_NAME } from '../config/site'

const upsertMeta = (selector, attrs) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
}

const upsertLink = (selector, attrs) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
}

const Seo = ({ title, description, robots = 'index,follow', image = '/pwa-512x512.svg' }) => {
  const location = useLocation()

  useEffect(() => {
    const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    const pageDescription = description || SITE_DESCRIPTION
    const canonicalUrl = `${window.location.origin}${location.pathname}`

    document.title = pageTitle
    upsertMeta('meta[name="description"]', { name: 'description', content: pageDescription })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: pageDescription })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: pageDescription })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl })
  }, [title, description, robots, image, location.pathname])

  return null
}

export default Seo