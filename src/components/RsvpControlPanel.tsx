import { useEffect, useMemo, useState } from 'react'
import { Download, FileSpreadsheet, Link, MessageSquareText, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { RsvpStatus, WeddingGuestRow, WeddingSettings } from '../types'
import { getGuestConfirmationUrl } from '../utils/guests'

type RsvpFilter = 'all' | RsvpStatus

const filterLabels: Array<{ label: string; value: RsvpFilter }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'No asistiran', value: 'declined' },
]

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-MX', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusLabel(status: RsvpStatus) {
  if (status === 'confirmed') return 'Confirmado'
  if (status === 'declined') return 'No asistira'
  return 'Pendiente'
}

function getExportRows(guests: WeddingGuestRow[], settings: WeddingSettings) {
  return guests.map((guest) => ({
    Familia: guest.family_name,
    'Invitados permitidos': guest.max_guests,
    'Invitados confirmados': guest.confirmed_guests,
    Estado: getStatusLabel(guest.status),
    'Fecha de confirmacion': formatDate(guest.confirmed_at),
    Mensaje: guest.message ?? '',
    Telefono: guest.phone ?? '',
    Email: guest.email ?? '',
    Notas: guest.notes ?? '',
    'Link de confirmacion': getGuestConfirmationUrl({
      confirmationId: guest.confirmation_id,
      customDomain: settings.customDomain,
      slug: settings.slug,
    }),
  }))
}

export function RsvpControlPanel({
  eventId,
  settings,
}: {
  eventId: string
  settings: WeddingSettings
}) {
  const [guests, setGuests] = useState<WeddingGuestRow[]>([])
  const [filter, setFilter] = useState<RsvpFilter>('all')
  const [exportScope, setExportScope] = useState<RsvpFilter>('all')

  useEffect(() => {
    async function loadGuests() {
      if (!eventId) return
      const { data } = await supabase
        .from('wedding_guests')
        .select('*')
        .eq('wedding_page_id', eventId)
        .order('family_name', { ascending: true })
      setGuests((data as WeddingGuestRow[]) ?? [])
    }

    loadGuests()
  }, [eventId])

  const metrics = useMemo(() => {
    const confirmed = guests.filter((guest) => guest.status === 'confirmed')
    const pending = guests.filter((guest) => guest.status === 'pending')
    const declined = guests.filter((guest) => guest.status === 'declined')
    return {
      allowedGuests: guests.reduce((total, guest) => total + guest.max_guests, 0),
      confirmedFamilies: confirmed.length,
      confirmedGuests: guests.reduce((total, guest) => total + guest.confirmed_guests, 0),
      declinedFamilies: declined.length,
      pendingFamilies: pending.length,
      totalFamilies: guests.length,
    }
  }, [guests])

  const filteredGuests = useMemo(
    () => filter === 'all' ? guests : guests.filter((guest) => guest.status === filter),
    [filter, guests],
  )

  const exportGuests = useMemo(
    () => exportScope === 'all' ? guests : guests.filter((guest) => guest.status === exportScope),
    [exportScope, guests],
  )

  function downloadCsv() {
    const rows = getExportRows(exportGuests, settings)
    const headers = Object.keys(rows[0] ?? { Familia: '' })
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((header) => `"${String(row[header as keyof typeof row] ?? '').replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `confirmaciones-${exportScope}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function downloadExcel() {
    const XLSX = await import('xlsx')
    const worksheet = XLSX.utils.json_to_sheet(getExportRows(exportGuests, settings))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Confirmaciones')
    XLSX.writeFile(workbook, `confirmaciones-${exportScope}.xlsx`)
  }

  if (!eventId) {
    return (
      <fieldset className="rsvp-control-panel">
        <legend>Confirmaciones</legend>
        <p className="form-note">Guarda el evento primero para ver el control RSVP.</p>
      </fieldset>
    )
  }

  return (
    <fieldset className="rsvp-control-panel">
      <legend>Confirmaciones</legend>
      <div className="rsvp-metrics">
        <article>
          <Users size={17} />
          <span>Total familias</span>
          <strong>{metrics.totalFamilies}</strong>
        </article>
        <article>
          <Users size={17} />
          <span>Confirmadas</span>
          <strong>{metrics.confirmedFamilies}</strong>
        </article>
        <article>
          <Users size={17} />
          <span>Pendientes</span>
          <strong>{metrics.pendingFamilies}</strong>
        </article>
        <article>
          <Users size={17} />
          <span>No asistiran</span>
          <strong>{metrics.declinedFamilies}</strong>
        </article>
        <article>
          <Users size={17} />
          <span>Permitidos</span>
          <strong>{metrics.allowedGuests}</strong>
        </article>
        <article>
          <Users size={17} />
          <span>Confirmados</span>
          <strong>{metrics.confirmedGuests}</strong>
        </article>
      </div>

      <div className="rsvp-toolbar">
        <div className="rsvp-filters" aria-label="Filtrar confirmaciones">
          {filterLabels.map((item) => (
            <button
              className={filter === item.value ? 'active' : ''}
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="export-controls">
          <select value={exportScope} onChange={(event) => setExportScope(event.target.value as RsvpFilter)}>
            {filterLabels.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <button className="secondary-button" type="button" onClick={downloadExcel}>
            <FileSpreadsheet size={15} />
            Excel
          </button>
          <button className="secondary-button" type="button" onClick={downloadCsv}>
            <Download size={15} />
            CSV
          </button>
        </div>
      </div>

      <div className="rsvp-admin-table">
        <span>Familia</span>
        <span>Permitidos</span>
        <span>Confirmados</span>
        <span>Estado</span>
        <span>Fecha</span>
        <span>Mensaje</span>
        <span>Link</span>
        {filteredGuests.map((guest) => {
          const confirmationUrl = getGuestConfirmationUrl({
            confirmationId: guest.confirmation_id,
            customDomain: settings.customDomain,
            slug: settings.slug,
          })
          return (
            <div className="rsvp-admin-row" key={guest.id}>
              <strong>{guest.family_name}</strong>
              <span>{guest.max_guests}</span>
              <span>{guest.confirmed_guests}</span>
              <span className={`status-pill ${guest.status === 'confirmed' ? 'published' : guest.status === 'declined' ? 'declined' : 'draft'}`}>
                {getStatusLabel(guest.status)}
              </span>
              <span>{formatDate(guest.confirmed_at)}</span>
              <span className="rsvp-message">
                <MessageSquareText size={14} />
                {guest.message || '-'}
              </span>
              <a href={confirmationUrl} target="_blank" rel="noreferrer">
                <Link size={14} />
                Abrir
              </a>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
