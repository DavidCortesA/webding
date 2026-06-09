import { defaultPhotoCaptions, defaultSectionOrder, defaultSettings } from '../data/catalogs'
import type { SectionKey, WeddingPageRow, WeddingSettings } from '../types'
import { getDnsInstructions, normalizeDomain } from './domain'
import { supabase, supabaseUrl } from '../lib/supabase'

export const localStorageKey = 'webding-pages'

function getLegacySectionOrder(order = defaultSettings.customSectionOrder): SectionKey[] {
  if (order === 'details-first') return ['details', 'intro', 'gallery', 'gift', 'song', 'playlist']
  if (order === 'gallery-first') return ['gallery', 'intro', 'details', 'gift', 'song', 'playlist']
  return defaultSectionOrder
}

function normalizeSectionOrder(settings?: Partial<WeddingSettings>): SectionKey[] {
  const source = settings?.customSectionOrderList?.length
    ? settings.customSectionOrderList
    : getLegacySectionOrder(settings?.customSectionOrder)
  return [...source, ...defaultSectionOrder].filter(
    (section, index, list): section is SectionKey =>
      defaultSectionOrder.includes(section as SectionKey) && list.indexOf(section) === index,
  )
}

export function normalizeSettings(settings?: Partial<WeddingSettings>): WeddingSettings {
  const customDomain = normalizeDomain(settings?.customDomain ?? defaultSettings.customDomain)
  return {
    ...defaultSettings,
    ...settings,
    whatsappCountryCode:
      settings?.whatsappCountryCode ??
      (settings?.whatsappPhone?.startsWith('52') ? '52' : defaultSettings.whatsappCountryCode),
    whatsappPhone: settings?.whatsappCountryCode
      ? (settings?.whatsappPhone ?? '')
      : (settings?.whatsappPhone ?? defaultSettings.whatsappPhone).replace(/^52/, ''),
    religiousCeremonyTitle: settings?.religiousCeremonyTitle ?? defaultSettings.religiousCeremonyTitle,
    religiousCeremonyDate: settings?.religiousCeremonyDate ?? settings?.date ?? defaultSettings.religiousCeremonyDate,
    religiousCeremonyVenue: settings?.religiousCeremonyVenue ?? settings?.venue ?? defaultSettings.religiousCeremonyVenue,
    religiousCeremonyCity: settings?.religiousCeremonyCity ?? settings?.city ?? defaultSettings.religiousCeremonyCity,
    religiousCeremonyMapQuery: settings?.religiousCeremonyMapQuery ?? settings?.mapQuery ?? defaultSettings.religiousCeremonyMapQuery,
    religiousCeremonyIcon: settings?.religiousCeremonyIcon ?? defaultSettings.religiousCeremonyIcon,
    receptionTitle: settings?.receptionTitle ?? defaultSettings.receptionTitle,
    receptionDate: settings?.receptionDate ?? settings?.date ?? defaultSettings.receptionDate,
    receptionVenue: settings?.receptionVenue ?? settings?.venue ?? defaultSettings.receptionVenue,
    receptionCity: settings?.receptionCity ?? settings?.city ?? defaultSettings.receptionCity,
    receptionMapQuery: settings?.receptionMapQuery ?? settings?.mapQuery ?? defaultSettings.receptionMapQuery,
    surfaceColor: settings?.surfaceColor ?? defaultSettings.surfaceColor,
    textColor: settings?.textColor ?? defaultSettings.textColor,
    spotifySongUrl: settings?.spotifySongUrl ?? defaultSettings.spotifySongUrl,
    spotifyPlaylistUrl: settings?.spotifyPlaylistUrl ?? defaultSettings.spotifyPlaylistUrl,
    musicAutoplay: settings?.musicAutoplay ?? defaultSettings.musicAutoplay,
    counterStyle: settings?.counterStyle ?? defaultSettings.counterStyle,
    customTemplateEnabled: settings?.customTemplateEnabled ?? defaultSettings.customTemplateEnabled,
    customHeroSize: settings?.customHeroSize ?? defaultSettings.customHeroSize,
    customGalleryStyle: settings?.customGalleryStyle ?? defaultSettings.customGalleryStyle,
    customSectionOrder: settings?.customSectionOrder ?? defaultSettings.customSectionOrder,
    customSectionOrderList: normalizeSectionOrder(settings),
    showFooterName: settings?.showFooterName ?? defaultSettings.showFooterName,
    footerName: settings?.footerName ?? `Con amor, ${settings?.bride ?? defaultSettings.bride} y ${settings?.groom ?? defaultSettings.groom}`,
    giftBankName: settings?.giftBankName ?? defaultSettings.giftBankName,
    giftAccountNumber: settings?.giftAccountNumber ?? defaultSettings.giftAccountNumber,
    giftAccountHolder: settings?.giftAccountHolder ?? defaultSettings.giftAccountHolder,
    giftConcept: settings?.giftConcept ?? defaultSettings.giftConcept,
    photos: (settings?.photos ?? defaultSettings.photos).slice(0, 10),
    showPhotoCaptions: settings?.showPhotoCaptions ?? defaultSettings.showPhotoCaptions,
    photoCaptions: [...(settings?.photoCaptions ?? []), ...defaultPhotoCaptions].slice(0, 10),
    customDomain,
    domainStatus: settings?.domainStatus ?? defaultSettings.domainStatus,
    dnsInstructions: settings?.dnsInstructions ?? getDnsInstructions(customDomain),
    domainError: settings?.domainError ?? '',
  }
}

export function getSpotifyEmbedUrl(url: string, autoplay = false) {
  const match = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|playlist|album)\/([A-Za-z0-9]+)/)
  if (!match) return ''
  const [, type, id] = match
  const params = new URLSearchParams({ utm_source: 'generator' })
  if (autoplay) {
    params.set('autoplay', '1')
  }
  return `https://open.spotify.com/embed/${type}/${id}?${params.toString()}`
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getPublicLink(slug: string) {
  return `${window.location.origin}/evento/${slug}`
}

export function getLegacyPublicLink(slug: string) {
  return `${window.location.origin}${window.location.pathname}#/i/${slug}`
}

export function getCustomDomainLink(domain?: string | null) {
  const normalized = normalizeDomain(domain ?? '')
  return normalized ? `https://${normalized}` : ''
}

export function getSocialPreviewLink({ customDomain, slug }: { customDomain?: string | null; slug: string }) {
  const functionBaseUrl = `${supabaseUrl}/functions/v1/invitation-meta`
  const params = new URLSearchParams()
  const normalized = normalizeDomain(customDomain ?? '')
  if (normalized) {
    params.set('domain', normalized)
  } else {
    params.set('slug', slug)
  }
  return `${functionBaseUrl}?${params.toString()}`
}

export function getConfirmationLink({
  confirmationId,
  customDomain,
  slug,
}: {
  confirmationId: string
  customDomain?: string | null
  slug: string
}) {
  const normalizedDomain = normalizeDomain(customDomain ?? '')
  if (normalizedDomain) return `https://${normalizedDomain}/confirmar/${confirmationId}`
  return `${window.location.origin}/evento/${slug}/confirmar/${confirmationId}`
}

export function getWhatsappLink(settings: WeddingSettings) {
  const code = settings.whatsappCountryCode.replace(/\D/g, '')
  const phone = settings.whatsappPhone.replace(/\D/g, '')
  const text = encodeURIComponent(settings.whatsappMessage)
  return `https://wa.me/${code}${phone}?text=${text}`
}

export function getMapLink(settings: WeddingSettings) {
  const mapValue = settings.mapQuery.trim()
  if (/^https?:\/\//i.test(mapValue)) return mapValue
  if (mapValue) return `https://${mapValue}`
  const query = `${settings.venue} ${settings.city}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function getPlaceMapLink({ city, mapQuery, venue }: { city: string; mapQuery: string; venue: string }) {
  const mapValue = mapQuery.trim()
  if (/^https?:\/\//i.test(mapValue)) return mapValue
  if (mapValue) return `https://${mapValue}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue} ${city}`)}`
}

export function getDaysLeft(date: string, now = Date.now()) {
  const target = new Date(date).getTime()
  const diff = target - now
  return {
    days: Math.max(0, Math.floor(diff / 86400000)),
    hours: Math.max(0, Math.floor((diff / 3600000) % 24)),
    minutes: Math.max(0, Math.floor((diff / 60000) % 60)),
    seconds: Math.max(0, Math.floor((diff / 1000) % 60)),
    isPast: diff <= 0,
  }
}

export function readLocalPages(): WeddingPageRow[] {
  const raw = localStorage.getItem(localStorageKey)
  return raw ? JSON.parse(raw).map((page: WeddingPageRow) => ({ ...page, settings: normalizeSettings(page.settings) })) : []
}

export function writeLocalPage(row: WeddingPageRow) {
  const pages = readLocalPages()
  const next = [row, ...pages.filter((page) => page.id !== row.id)]
  localStorage.setItem(localStorageKey, JSON.stringify(next))
}

export function deleteLocalPage(pageId: string) {
  const pages = readLocalPages().filter((page) => page.id !== pageId)
  localStorage.setItem(localStorageKey, JSON.stringify(pages))
}

export async function confirmAttendance(guestId: string, confirmedGuests: number) {
  return supabase.functions.invoke('send-rsvp-notification', {
    body: {
      guestId,
      status: 'confirmed',
      confirmedGuests,
    },
  })
}

export async function declineAttendance(guestId: string) {
  return supabase.functions.invoke('send-rsvp-notification', {
    body: {
      guestId,
      status: 'declined',
    },
  })
}
