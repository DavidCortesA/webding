export type GiftMode = 'sobre' | 'regalo'
export type CounterStyle = 'cards' | 'line' | 'circles' | 'minimal'
export type GalleryStyle = 'bento' | 'coastal' | 'mosaic' | 'film' | 'stacked'
export type HeroSize = 'compact' | 'balanced' | 'full'
export type SectionOrder = 'story-first' | 'details-first' | 'gallery-first'
export type SectionKey = 'intro' | 'details' | 'gallery' | 'gift' | 'song' | 'playlist'
export type DomainStatus = 'pending' | 'verified' | 'active' | 'error'
export type RsvpStatus = 'confirmed' | 'declined' | 'pending'
export type CeremonyIcon = 'church' | 'rings' | 'cross' | 'heart' | 'sparkles'

export type DnsRecord = {
  type: 'CNAME' | 'A'
  host: string
  value: string
  required: boolean
}

export type DnsInstructions = {
  records: DnsRecord[]
  platformDomain: string
  notes: string[]
}

export type WeddingSettings = {
  slug: string
  templateKey: string
  bride: string
  groom: string
  date: string
  venue: string
  city: string
  mapQuery: string
  religiousCeremonyTitle: string
  religiousCeremonyDate: string
  religiousCeremonyVenue: string
  religiousCeremonyCity: string
  religiousCeremonyMapQuery: string
  religiousCeremonyIcon: CeremonyIcon
  receptionTitle: string
  receptionDate: string
  receptionVenue: string
  receptionCity: string
  receptionMapQuery: string
  words: string
  whatsappCountryCode: string
  whatsappPhone: string
  whatsappMessage: string
  primaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  fontFamily: string
  musicUrl: string
  spotifySongUrl: string
  spotifyPlaylistUrl: string
  musicAutoplay: boolean
  counterStyle: CounterStyle
  customTemplateEnabled: boolean
  customHeroSize: HeroSize
  customGalleryStyle: GalleryStyle
  customSectionOrder: SectionOrder
  customSectionOrderList: SectionKey[]
  showFooterName: boolean
  footerName: string
  giftMode: GiftMode
  giftText: string
  giftLink: string
  giftLinkLabel: string
  giftBankName: string
  giftAccountNumber: string
  giftAccountHolder: string
  giftConcept: string
  dressCodeEnabled: boolean
  dressCode: string
  photos: string[]
  showPhotoCaptions: boolean
  photoCaptions: string[]
  customDomain: string
  domainStatus: DomainStatus
  dnsInstructions: DnsInstructions
  domainError: string
}

export type WeddingPageRow = {
  id: string
  user_id: string
  slug: string
  title: string
  template_key: string
  status: 'draft' | 'published'
  custom_domain?: string | null
  domain_status?: DomainStatus
  dns_instructions?: DnsInstructions
  settings: WeddingSettings
  created_at?: string
  updated_at?: string
}

export type WeddingGuestRow = {
  id: string
  wedding_page_id: string
  confirmation_id: string
  family_name: string
  max_guests: number
  phone: string | null
  email: string | null
  notes: string | null
  confirmation_url: string | null
  email_sent_at?: string | null
  email_last_error?: string | null
  status: RsvpStatus
  confirmed_guests: number
  message: string | null
  confirmed_at: string | null
  created_at?: string
  updated_at?: string
}

export type GuestImportRow = {
  familyName: string
  allowedGuests: number
  phone: string
  email: string
  notes: string
  confirmationId: string
  confirmationUrl: string
  status: RsvpStatus
}
