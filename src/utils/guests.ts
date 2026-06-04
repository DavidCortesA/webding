import type { GuestImportRow, WeddingGuestRow } from '../types'
import { getConfirmationLink } from './wedding'

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function normalizeFamilyName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function generateConfirmationId(prefix = 'fam') {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  const token = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
  return `${prefix}_${token}`
}

export function createUniqueConfirmationId(usedIds: Set<string>, familyName = '') {
  const familyPrefix = normalizeFamilyName(familyName)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 12)
  let nextId: string
  do {
    nextId = familyPrefix ? `${familyPrefix}-${generateConfirmationId('').replace('_', '')}` : generateConfirmationId()
  } while (usedIds.has(nextId))
  usedIds.add(nextId)
  return nextId
}

export function getGuestConfirmationUrl({
  confirmationId,
  customDomain,
  slug,
}: {
  confirmationId: string
  customDomain?: string | null
  slug: string
}) {
  return getConfirmationLink({ confirmationId, customDomain, slug })
}

export async function parseGuestFile({
  customDomain,
  existingGuests,
  file,
  slug,
}: {
  customDomain?: string | null
  existingGuests: WeddingGuestRow[]
  file: File
  slug: string
}) {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  const usedIds = new Set(existingGuests.map((guest) => guest.confirmation_id))
  const existingFamilies = new Set(existingGuests.map((guest) => normalizeFamilyName(guest.family_name)))
  const preview: GuestImportRow[] = []
  const errors: string[] = []
  const duplicates: string[] = []

  rows.forEach((rawRow, rowIndex) => {
    const normalizedRow = Object.fromEntries(
      Object.entries(rawRow).map(([key, value]) => [normalizeHeader(key), String(value).trim()]),
    )
    const familyName = normalizedRow.familia
    const allowedGuestsValue = normalizedRow.invitadospermitidos
    const allowedGuests = Number(allowedGuestsValue)

    if (!familyName || !allowedGuestsValue) {
      errors.push(`Fila ${rowIndex + 2}: faltan columnas obligatorias familia o invitadosPermitidos.`)
      return
    }

    if (!Number.isInteger(allowedGuests) || allowedGuests <= 0) {
      errors.push(`Fila ${rowIndex + 2}: invitadosPermitidos debe ser un numero entero mayor a 0.`)
      return
    }

    const familyKey = normalizeFamilyName(familyName)
    if (existingFamilies.has(familyKey) || preview.some((guest) => normalizeFamilyName(guest.familyName) === familyKey)) {
      duplicates.push(familyName)
      return
    }

    const confirmationId = createUniqueConfirmationId(usedIds, familyName)
    preview.push({
      familyName,
      allowedGuests,
      phone: normalizedRow.telefono ?? '',
      email: normalizedRow.email ?? '',
      notes: normalizedRow.notas ?? '',
      confirmationId,
      confirmationUrl: getGuestConfirmationUrl({ confirmationId, customDomain, slug }),
      status: 'pending',
    })
  })

  return { duplicates, errors, preview, totalRows: rows.length }
}
