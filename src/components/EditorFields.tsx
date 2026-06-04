import type { DragEvent } from 'react'
import { ArrowDown, ArrowUp, CreditCard, Gift, GripVertical, Image, MapPin, Upload } from 'lucide-react'
import {
  ceremonyIcons,
  colorThemes,
  countryCodes,
  counterStyles,
  fontOptions,
  galleryStyles,
  heroSizes,
  sectionOrders,
  templates,
} from '../data/catalogs'
import type { WeddingSettings } from '../types'
import { getPlaceMapLink, slugify } from '../utils/wedding'
import { DomainSettings } from './DomainSettings'

export function EditorFields({
  settings,
  onChange,
  onUploadPhoto,
}: {
  settings: WeddingSettings
  onChange: (partial: Partial<WeddingSettings>) => void
  onUploadPhoto?: (index: number, file: File) => Promise<void>
}) {
  function updatePhoto(index: number, value: string) {
    const photos = [...settings.photos]
    photos[index] = value
    onChange({ photos })
  }

  function updatePhotoCaption(index: number, value: string) {
    const photoCaptions = [...settings.photoCaptions]
    photoCaptions[index] = value
    onChange({ photoCaptions })
  }

  async function uploadPhoto(index: number, file?: File) {
    if (!file) return
    if (onUploadPhoto) {
      await onUploadPhoto(index, file)
      return
    }
    const reader = new FileReader()
    reader.onload = () => updatePhoto(index, String(reader.result))
    reader.readAsDataURL(file)
  }

  function applyTheme(themeKey: string) {
    const theme = colorThemes.find((item) => item.key === themeKey)
    if (!theme) return
    onChange({
      primaryColor: theme.primary,
      accentColor: theme.accent,
      backgroundColor: theme.bg,
      surfaceColor: theme.surface,
      textColor: theme.text,
    })
  }

  function reorderSections(fromIndex: number, toIndex: number) {
    const next = [...settings.customSectionOrderList]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onChange({ customSectionOrderList: next })
  }

  function moveSection(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= settings.customSectionOrderList.length) return
    reorderSections(index, nextIndex)
  }

  function dragSection(event: DragEvent<HTMLLIElement>, index: number) {
    event.dataTransfer.setData('text/plain', String(index))
    event.dataTransfer.effectAllowed = 'move'
  }

  function dropSection(event: DragEvent<HTMLLIElement>, toIndex: number) {
    event.preventDefault()
    const fromIndex = Number(event.dataTransfer.getData('text/plain'))
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) return
    reorderSections(fromIndex, toIndex)
  }

  return (
    <div className="field-stack">
      <fieldset>
        <legend>Template inicial</legend>
        <div className="template-select-grid">
          {templates.map((template) => (
            <button
              className={settings.templateKey === template.key ? 'active' : ''}
              key={template.key}
              type="button"
              onClick={() => onChange({ templateKey: template.key })}
            >
              <span>{template.name}</span>
              <small>{template.description}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field-grid two">
        <label>
          Novia
          <input
            value={settings.bride}
            onChange={(event) => onChange({ bride: event.target.value, footerName: `Con amor, ${event.target.value} y ${settings.groom}` })}
          />
        </label>
        <label>
          Novio
          <input
            value={settings.groom}
            onChange={(event) => onChange({ groom: event.target.value, footerName: `Con amor, ${settings.bride} y ${event.target.value}` })}
          />
        </label>
      </div>
      <label>
        URL publica
        <input value={settings.slug} onChange={(event) => onChange({ slug: slugify(event.target.value) })} />
      </label>
      <DomainSettings settings={settings} onChange={onChange} />
      <label>
        Fecha y hora
        <input type="datetime-local" value={settings.date} onChange={(event) => onChange({ date: event.target.value })} />
      </label>
      <div className="phone-grid">
        <label>
          Lada
          <select value={settings.whatsappCountryCode} onChange={(event) => onChange({ whatsappCountryCode: event.target.value })}>
            {countryCodes.map((country) => (
              <option key={`${country.label}-${country.value}`} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Telefono WhatsApp
          <input value={settings.whatsappPhone} onChange={(event) => onChange({ whatsappPhone: event.target.value })} />
        </label>
      </div>
      <label>
        Estilo de contador
        <select value={settings.counterStyle} onChange={(event) => onChange({ counterStyle: event.target.value as WeddingSettings['counterStyle'] })}>
          {counterStyles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Mensaje para confirmar
        <input value={settings.whatsappMessage} onChange={(event) => onChange({ whatsappMessage: event.target.value })} />
      </label>

      <fieldset>
        <legend>Ceremonia religiosa</legend>
        <label>
          Nombre de la seccion
          <input value={settings.religiousCeremonyTitle} onChange={(event) => onChange({ religiousCeremonyTitle: event.target.value })} />
        </label>
        <label>
          Icono de ceremonia
          <div className="segmented icon-segmented">
            {ceremonyIcons.map(({ value, label, Icon }) => (
              <button
                className={settings.religiousCeremonyIcon === value ? 'active' : ''}
                key={value}
                type="button"
                onClick={() => onChange({ religiousCeremonyIcon: value })}
                aria-label={label}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </label>
        <label>
          Fecha y hora de ceremonia
          <input
            type="datetime-local"
            value={settings.religiousCeremonyDate}
            onChange={(event) => onChange({ religiousCeremonyDate: event.target.value })}
          />
        </label>
        <div className="field-grid two">
          <label>
            Lugar de ceremonia
            <input value={settings.religiousCeremonyVenue} onChange={(event) => onChange({ religiousCeremonyVenue: event.target.value })} />
          </label>
          <label>
            Ciudad de ceremonia
            <input value={settings.religiousCeremonyCity} onChange={(event) => onChange({ religiousCeremonyCity: event.target.value })} />
          </label>
        </div>
        <label>
          Link de ceremonia en Google Maps
          <div className="input-action">
            <input
              placeholder="https://maps.app.goo.gl/... o https://www.google.com/maps/..."
              value={settings.religiousCeremonyMapQuery}
              onChange={(event) => onChange({ religiousCeremonyMapQuery: event.target.value })}
            />
            <a
              className="icon-action"
              href={getPlaceMapLink({
                city: settings.religiousCeremonyCity,
                mapQuery: settings.religiousCeremonyMapQuery,
                venue: settings.religiousCeremonyVenue,
              })}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir Google Maps ceremonia"
            >
              <MapPin size={17} />
            </a>
          </div>
        </label>
      </fieldset>

      <fieldset>
        <legend>Recepcion</legend>
        <label>
          Nombre de la seccion
          <input value={settings.receptionTitle} onChange={(event) => onChange({ receptionTitle: event.target.value })} />
        </label>
        <label>
          Fecha y hora de recepcion
          <input type="datetime-local" value={settings.receptionDate} onChange={(event) => onChange({ receptionDate: event.target.value })} />
        </label>
        <div className="field-grid two">
          <label>
            Lugar de recepcion
            <input
              value={settings.receptionVenue}
              onChange={(event) => onChange({
                receptionVenue: event.target.value,
                venue: event.target.value,
              })}
            />
          </label>
          <label>
            Ciudad de recepcion
            <input
              value={settings.receptionCity}
              onChange={(event) => onChange({
                city: event.target.value,
                receptionCity: event.target.value,
              })}
            />
          </label>
        </div>
        <label>
          Link de recepcion en Google Maps
          <div className="input-action">
            <input
              placeholder="https://maps.app.goo.gl/... o https://www.google.com/maps/..."
              value={settings.receptionMapQuery}
              onChange={(event) => onChange({
                mapQuery: event.target.value,
                receptionMapQuery: event.target.value,
              })}
            />
            <a
              className="icon-action"
              href={getPlaceMapLink({
                city: settings.receptionCity,
                mapQuery: settings.receptionMapQuery,
                venue: settings.receptionVenue,
              })}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir Google Maps recepcion"
            >
              <MapPin size={17} />
            </a>
          </div>
        </label>
      </fieldset>

      <label>
        Palabras para invitados
        <textarea value={settings.words} onChange={(event) => onChange({ words: event.target.value })} />
      </label>

      <fieldset>
        <legend>10 temas de 5 colores</legend>
        <div className="theme-grid">
          {colorThemes.map((theme) => (
            <button key={theme.key} type="button" onClick={() => applyTheme(theme.key)}>
              <span className="swatches">
                <i style={{ background: theme.primary }} />
                <i style={{ background: theme.accent }} />
                <i style={{ background: theme.bg }} />
                <i style={{ background: theme.surface }} />
                <i style={{ background: theme.text }} />
              </span>
              {theme.name}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="field-grid five">
        <label>
          Color principal
          <input type="color" value={settings.primaryColor} onChange={(event) => onChange({ primaryColor: event.target.value })} />
        </label>
        <label>
          Acento
          <input type="color" value={settings.accentColor} onChange={(event) => onChange({ accentColor: event.target.value })} />
        </label>
        <label>
          Fondo
          <input type="color" value={settings.backgroundColor} onChange={(event) => onChange({ backgroundColor: event.target.value })} />
        </label>
        <label>
          Superficie
          <input type="color" value={settings.surfaceColor} onChange={(event) => onChange({ surfaceColor: event.target.value })} />
        </label>
        <label>
          Texto
          <input type="color" value={settings.textColor} onChange={(event) => onChange({ textColor: event.target.value })} />
        </label>
      </div>
      <label>
        Letra
        <select value={settings.fontFamily} onChange={(event) => onChange({ fontFamily: event.target.value })}>
          {fontOptions.map((font) => (
            <option key={font}>{font}</option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Cancion de Spotify</legend>
        <label>
          Cancion de la boda
          <input
            placeholder="https://open.spotify.com/track/..."
            value={settings.spotifySongUrl}
            onChange={(event) => onChange({ spotifySongUrl: event.target.value })}
          />
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.musicAutoplay}
            onChange={(event) => onChange({ musicAutoplay: event.target.checked })}
          />
          Intentar reproducir al entrar
        </label>
      </fieldset>

      <fieldset>
        <legend>Playlist de Spotify</legend>
        <label>
          Playlist de boda
          <input
            placeholder="https://open.spotify.com/playlist/..."
            value={settings.spotifyPlaylistUrl}
            onChange={(event) => onChange({ spotifyPlaylistUrl: event.target.value })}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Texto final</legend>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.showFooterName}
            onChange={(event) => onChange({ showFooterName: event.target.checked })}
          />
          Mostrar nombre o dedicatoria al final
        </label>
        {settings.showFooterName && (
          <label>
            Texto final
            <input value={settings.footerName} onChange={(event) => onChange({ footerName: event.target.value })} />
          </label>
        )}
      </fieldset>

      <fieldset>
        <legend>Template personalizado</legend>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.customTemplateEnabled}
            onChange={(event) => onChange({ customTemplateEnabled: event.target.checked })}
          />
          Activar ajustes avanzados
        </label>
        <div className="section-order-editor">
          <span>Orden de secciones</span>
          <ul>
            {settings.customSectionOrderList.map((sectionKey, index) => {
              const section = sectionOrders.find((item) => item.value === sectionKey)
              return (
                <li
                  draggable
                  key={sectionKey}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={(event) => dragSection(event, index)}
                  onDrop={(event) => dropSection(event, index)}
                >
                  <GripVertical size={16} />
                  <strong>{section?.label ?? sectionKey}</strong>
                  <div className="section-order-actions">
                    <button type="button" onClick={() => moveSection(index, -1)} aria-label="Subir seccion">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" onClick={() => moveSection(index, 1)} aria-label="Bajar seccion">
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        {settings.customTemplateEnabled && (
          <div className="field-stack nested">
            <label>
              Tamano del hero
              <select value={settings.customHeroSize} onChange={(event) => onChange({ customHeroSize: event.target.value as WeddingSettings['customHeroSize'] })}>
                {heroSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estilo de galeria
              <select value={settings.customGalleryStyle} onChange={(event) => onChange({ customGalleryStyle: event.target.value as WeddingSettings['customGalleryStyle'] })}>
                {galleryStyles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>Sobre o regalo</legend>
        <div className="segmented">
          {[
            { value: 'sobre', label: 'Sobre', Icon: CreditCard },
            { value: 'regalo', label: 'Regalo', Icon: Gift },
          ].map(({ value, label, Icon }) => (
            <button
              className={settings.giftMode === value ? 'active' : ''}
              key={value}
              type="button"
              onClick={() => onChange({ giftMode: value as WeddingSettings['giftMode'] })}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <label>
        Texto de sobre o regalo
        <textarea value={settings.giftText} onChange={(event) => onChange({ giftText: event.target.value })} />
      </label>
      {settings.giftMode === 'sobre' ? (
        <fieldset>
          <legend>Datos para sobre</legend>
          <label>
            Banco
            <input value={settings.giftBankName} onChange={(event) => onChange({ giftBankName: event.target.value })} />
          </label>
          <label>
            Numero de cuenta
            <input value={settings.giftAccountNumber} onChange={(event) => onChange({ giftAccountNumber: event.target.value })} />
          </label>
          <label>
            Nombre
            <input value={settings.giftAccountHolder} onChange={(event) => onChange({ giftAccountHolder: event.target.value })} />
          </label>
          <label>
            Concepto
            <input value={settings.giftConcept} onChange={(event) => onChange({ giftConcept: event.target.value })} />
          </label>
        </fieldset>
      ) : (
        <>
          <label>
            Link de mesa de regalos
            <input value={settings.giftLink} onChange={(event) => onChange({ giftLink: event.target.value })} />
          </label>
          <label>
            Texto del boton de regalo
            <input value={settings.giftLinkLabel} onChange={(event) => onChange({ giftLinkLabel: event.target.value })} />
          </label>
        </>
      )}

      <fieldset>
        <legend>Code dress</legend>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.dressCodeEnabled}
            onChange={(event) => onChange({ dressCodeEnabled: event.target.checked })}
          />
          Activar code dress
        </label>
        {settings.dressCodeEnabled && (
          <label>
            Tipo de code dress
            <input value={settings.dressCode} onChange={(event) => onChange({ dressCode: event.target.value })} />
          </label>
        )}
      </fieldset>

      <div className="photos-editor">
        <div className="photos-header">
          <Image size={18} />
          <h2>10 fotos y posiciones</h2>
        </div>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.showPhotoCaptions}
            onChange={(event) => onChange({ showPhotoCaptions: event.target.checked })}
          />
          Mostrar nombres debajo de las fotos
        </label>
        {Array.from({ length: 10 }, (_, index) => settings.photos[index] ?? '').map((photo, index) => (
          <div className="photo-field" key={index}>
            {photo ? <img src={photo} alt="" /> : <div className="photo-placeholder">Sin foto</div>}
            <div className="photo-inputs">
              <label>
                <span>{index === 0 ? 'Hero principal' : `Galeria ${index}`}</span>
                <input value={photo} onChange={(event) => updatePhoto(index, event.target.value)} />
              </label>
              {index > 0 && settings.showPhotoCaptions && (
                <label>
                  <span>Nombre visible</span>
                  <input value={settings.photoCaptions[index] ?? ''} onChange={(event) => updatePhotoCaption(index, event.target.value)} />
                </label>
              )}
            </div>
            <label className="upload-button">
              <Upload size={15} />
              Subir
              <input type="file" accept="image/*" onChange={(event) => uploadPhoto(index, event.target.files?.[0])} />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
