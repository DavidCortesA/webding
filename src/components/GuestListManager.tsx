import { useEffect, useState } from 'react'
import { Copy, FileSpreadsheet, Mail, Pencil, Send, Trash2, Upload, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { GuestImportRow, WeddingGuestRow, WeddingSettings } from '../types'
import { createUniqueConfirmationId, getGuestConfirmationUrl, normalizeFamilyName, parseGuestFile } from '../utils/guests'
import { sendGuestConfirmationBatch, sendGuestConfirmationEmail } from '../utils/mailing'

type ImportSummary = {
  duplicates: string[]
  errors: string[]
  imported: number
}

type EditingGuest = {
  id: string
  familyName: string
  allowedGuests: number
  phone: string
  email: string
  notes: string
}

export function GuestListManager({
  eventId,
  settings,
}: {
  eventId: string
  settings: WeddingSettings
}) {
  const [guests, setGuests] = useState<WeddingGuestRow[]>([])
  const [previewRows, setPreviewRows] = useState<GuestImportRow[]>([])
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [duplicateRows, setDuplicateRows] = useState<string[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [editingGuest, setEditingGuest] = useState<EditingGuest | null>(null)
  const [newGuest, setNewGuest] = useState({ allowedGuests: 1, email: '', familyName: '', notes: '', phone: '' })
  const [isImporting, setIsImporting] = useState(false)
  const [sendingGuestId, setSendingGuestId] = useState<string | null>(null)
  const [isSendingBatch, setIsSendingBatch] = useState(false)

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

  async function parseFile(file?: File) {
    if (!file) return
    setSummary(null)
    const result = await parseGuestFile({
      customDomain: settings.customDomain,
      existingGuests: guests,
      file,
      slug: settings.slug,
    })
    setPreviewRows(result.preview)
    setImportErrors(result.errors)
    setDuplicateRows(result.duplicates)
  }

  async function importGuests() {
    if (!previewRows.length) return
    setIsImporting(true)
    const payload = previewRows.map((guest) => ({
      wedding_page_id: eventId,
      confirmation_id: guest.confirmationId,
      family_name: guest.familyName,
      max_guests: guest.allowedGuests,
      phone: guest.phone || null,
      email: guest.email || null,
      notes: guest.notes || null,
      confirmation_url: guest.confirmationUrl,
      status: 'pending',
      confirmed_guests: 0,
    }))
    const { data, error } = await supabase.from('wedding_guests').insert(payload).select('*')
    const inserted = (data as WeddingGuestRow[]) ?? []
    setGuests((current) => [...current, ...inserted].sort((a, b) => a.family_name.localeCompare(b.family_name)))
    setSummary({
      duplicates: duplicateRows,
      errors: error ? [...importErrors, error.message] : importErrors,
      imported: inserted.length,
    })
    setPreviewRows([])
    setIsImporting(false)
  }

  async function deleteGuest(guestId: string) {
    await supabase.from('wedding_guests').delete().eq('id', guestId)
    setGuests((current) => current.filter((guest) => guest.id !== guestId))
  }

  async function createGuest() {
    if (!newGuest.familyName.trim() || newGuest.allowedGuests < 1) return
    const familyKey = normalizeFamilyName(newGuest.familyName)
    if (guests.some((guest) => normalizeFamilyName(guest.family_name) === familyKey)) {
      setSummary({ duplicates: [newGuest.familyName], errors: [], imported: 0 })
      return
    }
    const usedIds = new Set(guests.map((guest) => guest.confirmation_id))
    const confirmationId = createUniqueConfirmationId(usedIds, newGuest.familyName)
    const confirmationUrl = getGuestConfirmationUrl({
      confirmationId,
      customDomain: settings.customDomain,
      slug: settings.slug,
    })
    const { data } = await supabase
      .from('wedding_guests')
      .insert({
        wedding_page_id: eventId,
        confirmation_id: confirmationId,
        family_name: newGuest.familyName,
        max_guests: newGuest.allowedGuests,
        phone: newGuest.phone || null,
        email: newGuest.email || null,
        notes: newGuest.notes || null,
        confirmation_url: confirmationUrl,
        status: 'pending',
        confirmed_guests: 0,
      })
      .select('*')
      .single()

    if (data) {
      setGuests((current) => [...current, data as WeddingGuestRow].sort((a, b) => a.family_name.localeCompare(b.family_name)))
      setNewGuest({ allowedGuests: 1, email: '', familyName: '', notes: '', phone: '' })
      setSummary({ duplicates: [], errors: [], imported: 1 })
    }
  }

  async function saveGuestEdit() {
    if (!editingGuest) return
    const { data } = await supabase
      .from('wedding_guests')
      .update({
        family_name: editingGuest.familyName,
        max_guests: editingGuest.allowedGuests,
        phone: editingGuest.phone || null,
        email: editingGuest.email || null,
        notes: editingGuest.notes || null,
      })
      .eq('id', editingGuest.id)
      .select('*')
      .single()
    if (data) {
      setGuests((current) => current.map((guest) => (guest.id === editingGuest.id ? data as WeddingGuestRow : guest)))
      setEditingGuest(null)
    }
  }

  async function copyLink(guest: WeddingGuestRow) {
    await navigator.clipboard.writeText(getGuestConfirmationUrl({
      confirmationId: guest.confirmation_id,
      customDomain: settings.customDomain,
      slug: settings.slug,
    }))
  }

  async function sendGuestEmail(guest: WeddingGuestRow) {
    if (!guest.email) return
    setSendingGuestId(guest.id)
    try {
      const result = await sendGuestConfirmationEmail(guest.id)
      const { data } = await supabase.from('wedding_guests').select('*').eq('id', guest.id).single()
      if (data) {
        setGuests((current) => current.map((currentGuest) => (currentGuest.id === guest.id ? data as WeddingGuestRow : currentGuest)))
      }
      setSummary({ duplicates: [], errors: result.errors, imported: result.sent })
    } catch (error) {
      setSummary({ duplicates: [], errors: [error instanceof Error ? error.message : 'No se pudo enviar el correo.'], imported: 0 })
    } finally {
      setSendingGuestId(null)
    }
  }

  async function sendPendingGuestEmails() {
    setIsSendingBatch(true)
    try {
      const result = await sendGuestConfirmationBatch(eventId)
      const { data } = await supabase
        .from('wedding_guests')
        .select('*')
        .eq('wedding_page_id', eventId)
        .order('family_name', { ascending: true })
      setGuests((data as WeddingGuestRow[]) ?? [])
      setSummary({ duplicates: [], errors: result.errors, imported: result.sent })
    } catch (error) {
      setSummary({ duplicates: [], errors: [error instanceof Error ? error.message : 'No se pudieron enviar los correos.'], imported: 0 })
    } finally {
      setIsSendingBatch(false)
    }
  }

  if (!eventId) {
    return (
      <fieldset className="guest-manager">
        <legend>Lista de invitados</legend>
        <p className="form-note">Guarda el evento primero para poder importar familias y generar links de confirmacion.</p>
      </fieldset>
    )
  }

  return (
    <fieldset className="guest-manager">
      <legend>Lista de invitados</legend>
      <label className="upload-button guest-upload">
        <Upload size={16} />
        Subir Excel o CSV
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => parseFile(event.target.files?.[0])} />
      </label>
      <p className="form-note">Columnas requeridas: familia, invitadosPermitidos. Opcionales: telefono, email, notas.</p>
      <button className="secondary-button full" type="button" disabled={isSendingBatch} onClick={sendPendingGuestEmails}>
        <Send size={16} />
        {isSendingBatch ? 'Enviando correos...' : 'Enviar correos a invitados pendientes'}
      </button>

      <div className="manual-guest-form">
        <label>
          Familia
          <input value={newGuest.familyName} onChange={(event) => setNewGuest({ ...newGuest, familyName: event.target.value })} />
        </label>
        <label>
          Invitados permitidos
          <input
            min={1}
            type="number"
            value={newGuest.allowedGuests}
            onChange={(event) => setNewGuest({ ...newGuest, allowedGuests: Number(event.target.value) })}
          />
        </label>
        <label>
          Telefono
          <input value={newGuest.phone} onChange={(event) => setNewGuest({ ...newGuest, phone: event.target.value })} />
        </label>
        <label>
          Email
          <input value={newGuest.email} onChange={(event) => setNewGuest({ ...newGuest, email: event.target.value })} />
        </label>
        <label>
          Notas
          <input value={newGuest.notes} onChange={(event) => setNewGuest({ ...newGuest, notes: event.target.value })} />
        </label>
        <button className="secondary-button" type="button" onClick={createGuest}>Agregar familia</button>
      </div>

      {previewRows.length > 0 && (
        <div className="guest-preview">
          <div className="guest-panel-heading">
            <FileSpreadsheet size={17} />
            <strong>Preview antes de importar</strong>
          </div>
          <div className="guest-table">
            <span>Familia</span>
            <span>Permitidos</span>
            <span>Telefono</span>
            <span>Email</span>
            <span>Estado</span>
            {previewRows.map((guest) => (
              <div className="guest-row" key={guest.confirmationId}>
                <strong>{guest.familyName}</strong>
                <span>{guest.allowedGuests}</span>
                <span>{guest.phone || '-'}</span>
                <span>{guest.email || '-'}</span>
                <span className="status-pill draft">pending</span>
              </div>
            ))}
          </div>
          <button className="primary-button full" type="button" disabled={isImporting} onClick={importGuests}>
            {isImporting ? 'Importando...' : `Importar ${previewRows.length} familias`}
          </button>
        </div>
      )}

      {(importErrors.length > 0 || duplicateRows.length > 0 || summary) && (
        <div className="import-summary">
          {summary && <strong>Total importados: {summary.imported}</strong>}
          {duplicateRows.length > 0 && <p>Duplicados omitidos: {duplicateRows.join(', ')}</p>}
          {importErrors.map((error) => <p key={error}>{error}</p>)}
        </div>
      )}

      <div className="guest-table saved-guests">
        <span>Familia</span>
        <span>Permitidos</span>
        <span>Estado</span>
        <span>Email / link</span>
        <span>Acciones</span>
        {guests.map((guest) => {
          const confirmationUrl = getGuestConfirmationUrl({
            confirmationId: guest.confirmation_id,
            customDomain: settings.customDomain,
            slug: settings.slug,
          })
          const isEditing = editingGuest?.id === guest.id

          return (
            <div className="guest-row saved" key={guest.id}>
              {isEditing ? (
                <>
                  <input value={editingGuest.familyName} onChange={(event) => setEditingGuest({ ...editingGuest, familyName: event.target.value })} />
                  <input
                    min={1}
                    type="number"
                    value={editingGuest.allowedGuests}
                    onChange={(event) => setEditingGuest({ ...editingGuest, allowedGuests: Number(event.target.value) })}
                  />
                  <input value={editingGuest.phone} onChange={(event) => setEditingGuest({ ...editingGuest, phone: event.target.value })} />
                  <input value={editingGuest.email} onChange={(event) => setEditingGuest({ ...editingGuest, email: event.target.value })} />
                  <div className="guest-actions">
                    <button className="secondary-button" type="button" onClick={saveGuestEdit}>Guardar</button>
                    <button className="ghost-button icon-only" type="button" onClick={() => setEditingGuest(null)} aria-label="Cancelar">
                      <X size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <strong>{guest.family_name}</strong>
                  <span>{guest.max_guests}</span>
                  <span className={`status-pill ${guest.status === 'confirmed' ? 'published' : 'draft'}`}>{guest.status}</span>
                  <div className="guest-link-cell">
                    <span>{guest.email || 'Sin email'}</span>
                    <code>{confirmationUrl}</code>
                    {guest.email_sent_at && <small>Enviado: {new Date(guest.email_sent_at).toLocaleString()}</small>}
                    {guest.email_last_error && <small className="error-text">{guest.email_last_error}</small>}
                  </div>
                  <div className="guest-actions">
                    <button
                      className="ghost-button icon-only"
                      type="button"
                      onClick={() => sendGuestEmail(guest)}
                      disabled={!guest.email || sendingGuestId === guest.id}
                      aria-label="Enviar email de confirmacion"
                    >
                      <Mail size={15} />
                    </button>
                    <button className="ghost-button icon-only" type="button" onClick={() => copyLink(guest)} aria-label="Copiar link">
                      <Copy size={15} />
                    </button>
                    <button
                      className="ghost-button icon-only"
                      type="button"
                      onClick={() => setEditingGuest({
                        id: guest.id,
                        familyName: guest.family_name,
                        allowedGuests: guest.max_guests,
                        phone: guest.phone ?? '',
                        email: guest.email ?? '',
                        notes: guest.notes ?? '',
                      })}
                      aria-label="Editar familia"
                    >
                      <Pencil size={15} />
                    </button>
                    <button className="ghost-button icon-only" type="button" onClick={() => deleteGuest(guest.id)} aria-label="Eliminar familia">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
