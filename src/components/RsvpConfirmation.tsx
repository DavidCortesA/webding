import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, MessageCircle, Users, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { RsvpStatus, WeddingGuestRow, WeddingPageRow, WeddingSettings } from '../types'
import { normalizeSettings } from '../utils/wedding'
import { WeddingPreview } from './WeddingPreview'
import { BrandLogo } from './BrandLogo'

type GuestWithPage = {
  guest: WeddingGuestRow
  page: WeddingPageRow
}

async function loadGuestByConfirmationId(confirmationId: string, slug?: string, customDomain?: string): Promise<GuestWithPage | null> {
  const { data: guest } = await supabase
    .from('wedding_guests')
    .select('*')
    .eq('confirmation_id', confirmationId)
    .maybeSingle()

  if (!guest) return null

  let pageQuery = supabase
    .from('wedding_pages')
    .select('*')
    .eq('id', guest.wedding_page_id)
    .eq('status', 'published')

  if (slug) pageQuery = pageQuery.eq('slug', slug)
  if (customDomain) pageQuery = pageQuery.eq('custom_domain', customDomain)

  const { data: page } = await pageQuery.maybeSingle()
  if (!page) return null

  return {
    guest: guest as WeddingGuestRow,
    page: {
      ...page,
      settings: normalizeSettings(page.settings as WeddingSettings),
    } as WeddingPageRow,
  }
}

export function RsvpConfirmation({
  confirmationId,
  slug,
  customDomain,
}: {
  confirmationId: string
  slug?: string
  customDomain?: string
}) {
  const [data, setData] = useState<GuestWithPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [status, setStatus] = useState<RsvpStatus>('pending')
  const [confirmedGuests, setConfirmedGuests] = useState(1)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const guestOptions = useMemo(
    () => Array.from({ length: data?.guest.max_guests ?? 1 }, (_, index) => index + 1),
    [data?.guest.max_guests],
  )

  function openInvitation() {
    window.location.assign(customDomain ? '/' : `/evento/${data?.page.slug}`)
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      const result = await loadGuestByConfirmationId(confirmationId, slug, customDomain)
      if (!result) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setData(result)
      setStatus(result.guest.status)
      setConfirmedGuests(Math.max(1, result.guest.confirmed_guests || 1))
      setMessage(result.guest.message ?? '')
      setLoading(false)
    }

    load()
  }, [confirmationId, customDomain, slug])

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data || status === 'pending') return

    setSaving(true)
    const nextConfirmedGuests = status === 'confirmed' ? Math.min(confirmedGuests, data.guest.max_guests) : 0
    const confirmedAt = new Date().toISOString()
    const { data: updated } = await supabase
      .from('wedding_guests')
      .update({
        status,
        confirmed_guests: nextConfirmedGuests,
        message,
        confirmed_at: confirmedAt,
      })
      .eq('id', data.guest.id)
      .eq('confirmation_id', confirmationId)
      .select('*')
      .single()

    if (updated) {
      setData((current) => current ? { ...current, guest: updated as WeddingGuestRow } : current)
      setSubmitted(true)
    }
    setSaving(false)
  }

  if (loading) {
    return <main className="rsvp-shell"><p className="public-message">Cargando confirmacion...</p></main>
  }

  if (notFound || !data) {
    return (
      <main className="rsvp-shell">
        <section className="rsvp-card">
          <XCircle size={34} />
          <h1>No encontramos esta confirmacion</h1>
          <p>Revisa que el link sea correcto o pide a los anfitriones que te compartan de nuevo tu invitacion.</p>
        </section>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="rsvp-shell">
        <section className="rsvp-card thank-you">
          <CheckCircle2 size={38} />
          <span>{data.page.title}</span>
          <h1>Gracias, {data.guest.family_name}</h1>
          <p>
            {status === 'confirmed'
              ? `Hemos guardado tu confirmacion para ${confirmedGuests} ${confirmedGuests === 1 ? 'persona' : 'personas'}.`
              : 'Hemos guardado que no podran asistir. Gracias por avisarnos.'}
          </p>
          <div className="confirmation-actions">
            <button className="secondary-button" type="button" onClick={() => setSubmitted(false)}>
              Editar confirmacion
            </button>
            <button className="primary-button" type="button" onClick={openInvitation}>
              Ver invitacion
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="rsvp-page">
      <section className="rsvp-form-panel">
        <a className="brand" href={customDomain ? '/' : `/evento/${data.page.slug}`}>
          <BrandLogo />
        </a>
        <form className="rsvp-card" onSubmit={submitRsvp}>
          <span>{data.page.title}</span>
          <h1>{data.guest.family_name}</h1>
          <p>Esta confirmacion permite hasta {data.guest.max_guests} invitados.</p>

          <div className="rsvp-choice-grid">
            <button className={status === 'confirmed' ? 'active' : ''} type="button" onClick={() => setStatus('confirmed')}>
              <CheckCircle2 size={18} />
              Si asistire
            </button>
            <button className={status === 'declined' ? 'active' : ''} type="button" onClick={() => setStatus('declined')}>
              <XCircle size={18} />
              No podre asistir
            </button>
          </div>

          {status === 'confirmed' && (
            <label>
              Personas que asistiran
              <div className="guest-stepper">
                <Users size={17} />
                <select value={confirmedGuests} onChange={(event) => setConfirmedGuests(Number(event.target.value))}>
                  {guestOptions.map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </div>
            </label>
          )}

          <label>
            Mensaje opcional
            <textarea
              placeholder="Alergias, comentarios o un mensaje para los novios..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>

          <button className="primary-button full" disabled={saving || status === 'pending'} type="submit">
            <MessageCircle size={18} />
            {saving ? 'Guardando...' : 'Enviar confirmacion'}
          </button>
        </form>
      </section>
      <aside className="rsvp-preview" aria-label="Preview de invitacion">
        <WeddingPreview settings={data.page.settings} compact />
      </aside>
    </main>
  )
}
