import type { LucideIcon } from 'lucide-react'
import { Church, Cross, Heart, Image, LayoutTemplate, MapPin, MessageCircle, Palette, Sparkles, User } from 'lucide-react'
import type { CeremonyIcon, SectionKey, WeddingSettings } from '../types'
import { getDnsInstructions } from '../utils/domain'

export const photoSeeds = [
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1509610973147-232dfea52a97?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1494955870715-979ca4f13bf0?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=85',
]

export const defaultPhotoCaptions = [
  'Portada',
  'Ceremonia',
  'Recepcion',
  'Nosotros',
  'Detalles',
  'Familia',
  'Amigos',
  'Celebracion',
  'Momentos',
  'Despedida',
]

export const ceremonyIcons = [
  { value: 'church', label: 'Iglesia', Icon: Church },
  { value: 'rings', label: 'Anillos', Icon: Heart },
  { value: 'cross', label: 'Cruz', Icon: Cross },
  { value: 'heart', label: 'Corazon', Icon: Heart },
  { value: 'sparkles', label: 'Brillo', Icon: Sparkles },
] satisfies Array<{ value: CeremonyIcon; label: string; Icon: LucideIcon }>

export const templates = [
  { key: 'quincy_romance', name: 'Quincy Romance', description: 'Editorial clasico con hero cinematografico y galeria masonry.' },
  { key: 'botanical_minimal', name: 'Linen Atelier', description: 'Editorial limpio con marco de atelier, foto lateral y composicion tipo revista.' },
  { key: 'modern_luxe', name: 'Modern Luxe', description: 'Look black tie con contraste alto, serif gigante y galeria monocromatica.' },
  { key: 'garden_party', name: 'Grand Ballroom', description: 'Formal, simetrico y elegante para salon, gala o recepcion nocturna.' },
  { key: 'terracotta_sunset', name: 'Terracotta Sunset', description: 'Estilo hacienda/destino con tonos calidos, cards y acentos artesanales.' },
  { key: 'coastal_vows', name: 'Coastal Vows', description: 'Ligero y luminoso, con portada centrada y secciones amplias tipo resort.' },
  { key: 'city_hall_chic', name: 'City Hall Chic', description: 'Urbano, editorial y sobrio para civil, brunch o boda moderna en ciudad.' },
  { key: 'desert_editorial', name: 'Desert Editorial', description: 'Destino calido con portada tipo revista, bloques amplios y galeria organica.' },
]

export const colorThemes = [
  { key: 'olive', name: 'Olivo editorial', primary: '#4e5f48', accent: '#c99772', bg: '#fbf7ef', surface: '#fffdf8', text: '#23312c' },
  { key: 'champagne', name: 'Champagne', primary: '#725a46', accent: '#d6b98c', bg: '#fff8eb', surface: '#f5ead8', text: '#33281f' },
  { key: 'noir', name: 'Noir gala', primary: '#171717', accent: '#b8955f', bg: '#f5f1e9', surface: '#27231f', text: '#151515' },
  { key: 'rose', name: 'Rosa antiguo', primary: '#6f4b55', accent: '#d9a6a1', bg: '#fff4f3', surface: '#f2d8d4', text: '#3b252b' },
  { key: 'sage', name: 'Sage garden', primary: '#50645b', accent: '#9fb78b', bg: '#f4f8ef', surface: '#e4ecdc', text: '#26352d' },
  { key: 'terracotta', name: 'Terracota', primary: '#733f32', accent: '#d8895d', bg: '#fff2e8', surface: '#f2d1bb', text: '#3f241e' },
  { key: 'coastal', name: 'Costa', primary: '#2f5d66', accent: '#88b8bd', bg: '#eff8f8', surface: '#d8ecee', text: '#20373c' },
  { key: 'lavender', name: 'Lavanda', primary: '#4e4666', accent: '#b6a2d9', bg: '#f7f3ff', surface: '#e6dcf5', text: '#2f2943' },
  { key: 'forest', name: 'Bosque', primary: '#1f3b31', accent: '#c0a16b', bg: '#f2f5ee', surface: '#dfe7d8', text: '#17271f' },
  { key: 'wine', name: 'Vino', primary: '#5c1f2e', accent: '#c48979', bg: '#fff3ef', surface: '#ead1c9', text: '#35131b' },
]

export const countryCodes = [
  { label: 'Mexico +52', value: '52' },
  { label: 'Estados Unidos +1', value: '1' },
  { label: 'Canada +1', value: '1' },
  { label: 'Espana +34', value: '34' },
  { label: 'Colombia +57', value: '57' },
  { label: 'Argentina +54', value: '54' },
  { label: 'Chile +56', value: '56' },
  { label: 'Peru +51', value: '51' },
  { label: 'Ecuador +593', value: '593' },
  { label: 'Brasil +55', value: '55' },
]

export const fontOptions = ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'Montserrat', 'Inter']

export const counterStyles = [
  { value: 'cards', label: 'Tarjetas' },
  { value: 'line', label: 'Linea editorial' },
  { value: 'circles', label: 'Circulos' },
  { value: 'minimal', label: 'Minimal' },
]

export const galleryStyles = [
  { value: 'bento', label: 'Bento del template' },
  { value: 'coastal', label: 'Coastal limpio' },
  { value: 'mosaic', label: 'Mosaico' },
  { value: 'film', label: 'Film strip' },
  { value: 'stacked', label: 'Apilado' },
]

export const heroSizes = [
  { value: 'compact', label: 'Compacto' },
  { value: 'balanced', label: 'Balanceado' },
  { value: 'full', label: 'Pantalla completa' },
]

export const sectionOrders: Array<{ value: SectionKey; label: string }> = [
  { value: 'intro', label: 'Historia y contador' },
  { value: 'details', label: 'Lugar y confirmacion' },
  { value: 'gallery', label: 'Galeria de fotos' },
  { value: 'gift', label: 'Sobre o regalo' },
  { value: 'song', label: 'Cancion de boda' },
  { value: 'playlist', label: 'Playlist' },
]

export const defaultSectionOrder: SectionKey[] = sectionOrders.map((section) => section.value)

export const marketingFeatures: Array<{ title: string; text: string; Icon: LucideIcon }> = [
  { title: 'Perfil y dashboard', text: 'Cada pareja ve sus invitaciones, estados y ligas publicas.', Icon: User },
  { title: '8 templates', text: 'Empieza eligiendo una base visual y cambia cuando quieras.', Icon: LayoutTemplate },
  { title: '10 temas', text: 'Paletas listas, mas colores manuales para ajustar el detalle.', Icon: Palette },
  { title: 'Fotos flexibles', text: 'Sube imagenes o pega URLs y mira su posicion en vivo.', Icon: Image },
  { title: 'Google Maps', text: 'Pega el link exacto del lugar para que tus invitados lleguen sin buscar.', Icon: MapPin },
  { title: 'WhatsApp RSVP', text: 'Lada internacional y mensaje de confirmacion preparado.', Icon: MessageCircle },
]

export const faqItems = [
  {
    question: 'Puedo crear mas de una invitacion?',
    answer: 'Si. El dashboard esta preparado para listar varias invitaciones por cuenta, cada una con su slug, template y estado.',
  },
  {
    question: 'La confirmacion se guarda en la app?',
    answer: 'Si. Cada familia puede tener un link unico de confirmacion para guardar asistencia, numero de invitados y mensaje.',
  },
  {
    question: 'Las fotos se pueden subir?',
    answer: 'Si, el editor permite subir imagenes locales o pegar URLs. El siguiente paso natural es conectarlo a Supabase Storage.',
  },
  {
    question: 'Puedo usar mesa de regalos externa?',
    answer: 'Si. La seccion de regalo acepta un link de deposito, transferencia o tienda externa.',
  },
]

export const defaultSettings: WeddingSettings = {
  slug: 'ana-y-david',
  templateKey: 'quincy_romance',
  bride: 'Ana',
  groom: 'David',
  date: '2026-11-21T18:00',
  venue: 'Hacienda San Gabriel',
  city: 'Queretaro, Mexico',
  mapQuery: 'https://www.google.com/maps/search/?api=1&query=Hacienda%20San%20Gabriel%20Queretaro%20Mexico',
  religiousCeremonyTitle: 'Ceremonia religiosa',
  religiousCeremonyDate: '2026-11-21T17:00',
  religiousCeremonyVenue: 'Parroquia de San Miguel',
  religiousCeremonyCity: 'Queretaro, Mexico',
  religiousCeremonyMapQuery: 'https://www.google.com/maps/search/?api=1&query=Parroquia%20de%20San%20Miguel%20Queretaro%20Mexico',
  religiousCeremonyIcon: 'church',
  receptionTitle: 'Recepcion',
  receptionDate: '2026-11-21T19:00',
  receptionVenue: 'Hacienda San Gabriel',
  receptionCity: 'Queretaro, Mexico',
  receptionMapQuery: 'https://www.google.com/maps/search/?api=1&query=Hacienda%20San%20Gabriel%20Queretaro%20Mexico',
  words:
    'Hay momentos que se celebran una sola vez, pero se recuerdan toda la vida. Queremos compartir este dia con las personas que han sido parte de nuestra historia.',
  whatsappCountryCode: '52',
  whatsappPhone: '5512345678',
  whatsappMessage: 'Hola, confirmo mi asistencia a la boda de Ana y David.',
  primaryColor: '#4e5f48',
  accentColor: '#c99772',
  backgroundColor: '#fbf7ef',
  surfaceColor: '#fffdf8',
  textColor: '#23312c',
  fontFamily: 'Cormorant Garamond',
  musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  spotifySongUrl: 'https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2',
  spotifyPlaylistUrl: '',
  musicAutoplay: false,
  counterStyle: 'cards',
  customTemplateEnabled: false,
  customHeroSize: 'balanced',
  customGalleryStyle: 'coastal',
  customSectionOrder: 'story-first',
  customSectionOrderList: defaultSectionOrder,
  showFooterName: true,
  footerName: 'Con amor, Ana y David',
  giftMode: 'sobre',
  giftText: 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle, tendremos mesa de sobres el dia del evento.',
  giftLink: '',
  giftLinkLabel: 'Ver datos de regalo',
  giftBankName: 'Banco ejemplo',
  giftAccountNumber: '0000 0000 0000 0000',
  giftAccountHolder: 'Ana y David',
  giftConcept: 'Regalo boda Ana y David',
  dressCodeEnabled: true,
  dressCode: 'Formal jardin: tonos neutros, lino, seda y vestidos largos.',
  photos: photoSeeds,
  showPhotoCaptions: true,
  photoCaptions: defaultPhotoCaptions,
  customDomain: '',
  domainStatus: 'pending',
  dnsInstructions: getDnsInstructions(),
  domainError: '',
}
