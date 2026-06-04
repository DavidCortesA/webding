import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  ExternalLink,
  Gift,
  MapPin,
  MessageCircle,
  Music,
  Pause,
  Play,
  Shirt,
  X,
} from 'lucide-react'
import { ceremonyIcons, defaultSectionOrder, templates } from '../data/catalogs'
import type { SectionKey, WeddingSettings } from '../types'
import { getDaysLeft, getPlaceMapLink, getSpotifyEmbedUrl, getWhatsappLink, normalizeSettings } from '../utils/wedding'

export function WeddingPreview({ settings: rawSettings, compact = false }: { settings: WeddingSettings; compact?: boolean }) {
  const settings = normalizeSettings(rawSettings)
  const [now, setNow] = useState(() => Date.now())
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [playlistEnabled, setPlaylistEnabled] = useState(true)
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)
  const counter = useMemo(() => getDaysLeft(settings.date, now), [settings.date, now])
  const template = templates.find((item) => item.key === settings.templateKey)
  const galleryPhotos = settings.photos
    .slice(1, 10)
    .map((photo, index) => ({ caption: settings.photoCaptions[index + 1] || `Galeria ${index + 1}`, src: photo }))
    .filter((photo) => photo.src)
  const galleryStyle = settings.customTemplateEnabled ? settings.customGalleryStyle : 'bento'
  const heroSize = settings.customTemplateEnabled ? settings.customHeroSize : 'balanced'
  const sectionOrder = settings.customSectionOrderList.length ? settings.customSectionOrderList : defaultSectionOrder
  const previewStyle = {
    '--wedding-primary': settings.primaryColor,
    '--wedding-accent': settings.accentColor,
    '--wedding-bg': settings.backgroundColor,
    '--wedding-surface': settings.surfaceColor,
    '--wedding-text': settings.textColor,
    '--wedding-font': settings.fontFamily,
  } as CSSProperties
  const spotifySongEmbed = getSpotifyEmbedUrl(settings.spotifySongUrl, settings.musicAutoplay)
  const spotifyPlaylistEmbed = getSpotifyEmbedUrl(settings.spotifyPlaylistUrl, false)
  const ceremonyIcon = ceremonyIcons.find((item) => item.value === settings.religiousCeremonyIcon) ?? ceremonyIcons[0]
  const CeremonyIcon = ceremonyIcon.Icon

  function formatEventDate(value: string) {
    return new Date(value).toLocaleDateString('es-MX', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  function showPreviousPhoto() {
    setActivePhotoIndex((current) => {
      if (current === null) return current
      return current === 0 ? galleryPhotos.length - 1 : current - 1
    })
  }

  function showNextPhoto() {
    setActivePhotoIndex((current) => {
      if (current === null) return current
      return current === galleryPhotos.length - 1 ? 0 : current + 1
    })
  }

  const introSection = (
    <section className="wedding-section intro" key="intro">
      <div className="intro-copy">
        <CalendarDays size={22} />
        <h2>{counter.isPast ? 'Hoy celebramos' : 'Faltan'}</h2>
        <p>{settings.words}</p>
      </div>
      <div className={`counter-grid counter-${settings.counterStyle}`}>
        <strong>
          {counter.days}
          <span>Dias</span>
        </strong>
        <strong>
          {counter.hours}
          <span>Horas</span>
        </strong>
        <strong>
          {counter.minutes}
          <span>Min</span>
        </strong>
        <strong>
          {counter.seconds}
          <span>Seg</span>
        </strong>
      </div>
    </section>
  )

  const detailsSection = (
    <section className="wedding-section details" key="details">
      <div className="event-detail-card ceremony-detail">
        <span>
          <CeremonyIcon size={18} />
          {settings.religiousCeremonyTitle}
        </span>
        <h2>{settings.religiousCeremonyVenue}</h2>
        <p>{settings.religiousCeremonyCity}</p>
        <time dateTime={settings.religiousCeremonyDate}>{formatEventDate(settings.religiousCeremonyDate)}</time>
        <a
          className="styled-link map-link"
          href={getPlaceMapLink({
            city: settings.religiousCeremonyCity,
            mapQuery: settings.religiousCeremonyMapQuery,
            venue: settings.religiousCeremonyVenue,
          })}
          target="_blank"
          rel="noreferrer"
        >
          <MapPin size={18} />
          Ver ceremonia
        </a>
      </div>

      <div className="event-detail-card reception-detail">
        <span>
          <MapPin size={18} />
          {settings.receptionTitle}
        </span>
        <h2>{settings.receptionVenue}</h2>
        <p>{settings.receptionCity}</p>
        <time dateTime={settings.receptionDate}>{formatEventDate(settings.receptionDate)}</time>
        <a
          className="styled-link map-link"
          href={getPlaceMapLink({
            city: settings.receptionCity,
            mapQuery: settings.receptionMapQuery,
            venue: settings.receptionVenue,
          })}
          target="_blank"
          rel="noreferrer"
        >
          <MapPin size={18} />
          Ver recepcion
        </a>
      </div>

      <div className="details-actions">
        <a className="whatsapp-button" href={getWhatsappLink(settings)} target="_blank" rel="noreferrer">
          <MessageCircle size={18} />
          Confirmar asistencia
        </a>
      </div>
    </section>
  )

  const gallerySection = galleryPhotos.length ? (
    <section
      className={`gallery-section gallery-${galleryStyle} bento-${settings.templateKey} gallery-count-${galleryPhotos.length}`}
      key="gallery"
    >
      {galleryPhotos.map((photo, index) => (
        <figure key={`${photo.src}-${index}`}>
          <button className="gallery-photo-button" type="button" onClick={() => setActivePhotoIndex(index)}>
            <img src={photo.src} alt={photo.caption || `Foto ${index + 1}`} />
          </button>
          {settings.showPhotoCaptions && photo.caption && <figcaption>{photo.caption}</figcaption>}
        </figure>
      ))}
    </section>
  ) : null

  const giftSection = (
    <section className="wedding-section gift-section" key="gift">
      <div className="gift-icon">{settings.giftMode === 'sobre' ? <CreditCard size={22} /> : <Gift size={22} />}</div>
      <h2>{settings.giftMode === 'sobre' ? 'Sobre o deposito' : 'Mesa de regalos'}</h2>
      <p>{settings.giftText}</p>
      {settings.giftMode === 'sobre' && (
        <dl className="bank-details">
          <div>
            <dt>Banco</dt>
            <dd>{settings.giftBankName}</dd>
          </div>
          <div>
            <dt>Numero de cuenta</dt>
            <dd>{settings.giftAccountNumber}</dd>
          </div>
          <div>
            <dt>Nombre</dt>
            <dd>{settings.giftAccountHolder}</dd>
          </div>
          <div>
            <dt>Concepto</dt>
            <dd>{settings.giftConcept}</dd>
          </div>
        </dl>
      )}
      {settings.giftMode === 'regalo' && settings.giftLink && (
        <a className="styled-link gift-link" href={settings.giftLink} target="_blank" rel="noreferrer">
          <ExternalLink size={18} />
          {settings.giftLinkLabel || 'Abrir link'}
        </a>
      )}
      {settings.dressCodeEnabled && (
        <div className="dress-code-note">
          <Shirt size={18} />
          <strong>Code dress:</strong> {settings.dressCode}
        </div>
      )}
    </section>
  )

  const songSection = spotifySongEmbed ? (
    <section className="music-bar" key="song">
      <div className="music-heading">
        <Music size={18} />
        <div>
          <h2>Cancion de la boda</h2>
          <p>
            {settings.musicAutoplay
              ? 'Intentaremos reproducir al entrar; algunos navegadores piden tocar play.'
              : 'Tus invitados pueden reproducir o pausar cuando quieran.'}
          </p>
        </div>
        <button className="music-toggle" type="button" onClick={() => setMusicEnabled((current) => !current)}>
          {musicEnabled ? <Pause size={16} /> : <Play size={16} />}
          {musicEnabled ? 'Pausar' : 'Reproducir'}
        </button>
      </div>
      {musicEnabled && (
        <iframe
          className="spotify-frame song-frame"
          title="Cancion de la boda en Spotify"
          src={spotifySongEmbed}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
    </section>
  ) : null

  const playlistSection = spotifyPlaylistEmbed ? (
    <section className="playlist-bar" key="playlist">
      <div className="music-heading">
        <Music size={18} />
        <div>
          <h2>Playlist de boda</h2>
          <p>Una seleccion para acompanar la celebracion antes y despues del gran momento.</p>
        </div>
        <button className="music-toggle" type="button" onClick={() => setPlaylistEnabled((current) => !current)}>
          {playlistEnabled ? <Pause size={16} /> : <Play size={16} />}
          {playlistEnabled ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {playlistEnabled && (
        <iframe
          className="spotify-frame playlist-frame"
          title="Playlist de boda en Spotify"
          src={spotifyPlaylistEmbed}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
    </section>
  ) : null

  const sectionMap: Record<SectionKey, ReactNode> = {
    intro: introSection,
    details: detailsSection,
    gallery: gallerySection,
    gift: giftSection,
    song: songSection,
    playlist: playlistSection,
  }

  const orderedSections = sectionOrder.map((section) => sectionMap[section]).filter(Boolean)
  const activePhoto = activePhotoIndex === null ? null : galleryPhotos[activePhotoIndex]

  return (
    <article className={`wedding-page template-${settings.templateKey} hero-${heroSize} ${compact ? 'compact' : ''}`} style={previewStyle}>
      <section className="wedding-hero">
        <img src={settings.photos[0]} alt={`${settings.bride} y ${settings.groom}`} />
        <div className="wedding-hero-copy">
          <span>{template?.name ?? 'Nuestra boda'}</span>
          <h1>
            {settings.bride} & {settings.groom}
          </h1>
          <p>{new Date(settings.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </section>

      {orderedSections}

      {settings.showFooterName && (
        <footer className="wedding-footer">
          <Check size={18} />
          <span>{settings.footerName}</span>
        </footer>
      )}

      {activePhoto && (
        <div className="photo-modal" role="dialog" aria-modal="true" aria-label="Vista de foto">
          <button className="photo-modal-backdrop" type="button" aria-label="Cerrar foto" onClick={() => setActivePhotoIndex(null)} />
          <div className="photo-modal-content">
            <button className="photo-modal-close" type="button" aria-label="Cerrar foto" onClick={() => setActivePhotoIndex(null)}>
              <X size={20} />
            </button>
            {galleryPhotos.length > 1 && (
              <button className="photo-modal-nav previous" type="button" aria-label="Foto anterior" onClick={showPreviousPhoto}>
                <ChevronLeft size={24} />
              </button>
            )}
            <img src={activePhoto.src} alt={activePhoto.caption || 'Foto de boda'} />
            {settings.showPhotoCaptions && activePhoto.caption && <p>{activePhoto.caption}</p>}
            {galleryPhotos.length > 1 && (
              <button className="photo-modal-nav next" type="button" aria-label="Foto siguiente" onClick={showNextPhoto}>
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
