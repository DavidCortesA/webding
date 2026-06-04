import type { WeddingSettings } from '../types'

const fallbackImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85'

function absoluteUrl(value: string) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${window.location.origin}${value.startsWith('/') ? value : `/${value}`}`
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  const current = document.head.querySelector<HTMLMetaElement>(selector)
  const element = current ?? document.createElement('meta')
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
  if (!current) document.head.appendChild(element)
}

function upsertLink(rel: string, href: string) {
  const current = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  const element = current ?? document.createElement('link')
  element.setAttribute('rel', rel)
  element.setAttribute('href', href)
  if (!current) document.head.appendChild(element)
}

export function getInvitationSeo(settings: WeddingSettings, url = window.location.href) {
  const couple = `${settings.bride} & ${settings.groom}`
  const title = `${couple} | Invitacion de boda`
  const date = settings.date
    ? new Date(settings.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const place = [settings.receptionVenue || settings.venue, settings.receptionCity || settings.city].filter(Boolean).join(', ')
  const description = `Acompananos a celebrar la boda de ${couple}${date ? ` el ${date}` : ''}${place ? ` en ${place}` : ''}. Confirma tu asistencia en nuestra invitacion digital.`
  const image = absoluteUrl(settings.photos.find(Boolean) ?? fallbackImage)

  return {
    description,
    image,
    title,
    url: absoluteUrl(url),
  }
}

export function applyInvitationSeo(settings: WeddingSettings, url = window.location.href) {
  const seo = getInvitationSeo(settings, url)
  document.title = seo.title

  upsertMeta('meta[name="description"]', { content: seo.description, name: 'description' })
  upsertMeta('meta[property="og:title"]', { content: seo.title, property: 'og:title' })
  upsertMeta('meta[property="og:description"]', { content: seo.description, property: 'og:description' })
  upsertMeta('meta[property="og:type"]', { content: 'website', property: 'og:type' })
  upsertMeta('meta[property="og:url"]', { content: seo.url, property: 'og:url' })
  upsertMeta('meta[property="og:image"]', { content: seo.image, property: 'og:image' })
  upsertMeta('meta[property="og:image:secure_url"]', { content: seo.image, property: 'og:image:secure_url' })
  upsertMeta('meta[property="og:image:alt"]', { content: seo.title, property: 'og:image:alt' })
  upsertMeta('meta[property="og:image:width"]', { content: '1200', property: 'og:image:width' })
  upsertMeta('meta[property="og:image:height"]', { content: '630', property: 'og:image:height' })
  upsertMeta('meta[name="twitter:card"]', { content: 'summary_large_image', name: 'twitter:card' })
  upsertMeta('meta[name="twitter:title"]', { content: seo.title, name: 'twitter:title' })
  upsertMeta('meta[name="twitter:description"]', { content: seo.description, name: 'twitter:description' })
  upsertMeta('meta[name="twitter:image"]', { content: seo.image, name: 'twitter:image' })
  upsertLink('canonical', seo.url)

  const previousJsonLd = document.getElementById('invitation-json-ld')
  previousJsonLd?.remove()
  const jsonLd = document.createElement('script')
  jsonLd.id = 'invitation-json-ld'
  jsonLd.type = 'application/ld+json'
  jsonLd.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    description: seo.description,
    image: [seo.image],
    location: {
      '@type': 'Place',
      address: settings.receptionCity || settings.city,
      name: settings.receptionVenue || settings.venue,
    },
    name: `Boda de ${settings.bride} y ${settings.groom}`,
    startDate: settings.date,
    url: seo.url,
  })
  document.head.appendChild(jsonLd)
}
