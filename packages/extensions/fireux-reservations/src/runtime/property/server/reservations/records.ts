import { createError } from 'h3'
import type { Reservation } from '../../models/reservation.model.ts'
import { isDateOnly } from '../../utils/reservation-date.ts'

const sources = new Set(['direct', 'airbnb', 'booking_com', 'vrbo', 'manual', 'other'])
const statuses = new Set(['inquiry', 'hold', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])
const syncStates = new Set(['local', 'synced', 'pending', 'stale', 'error'])
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, any> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : null

export function reservationFail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function boundedText(value: unknown, max: number, label: string) {
  const normalized = text(value)
  if (normalized.length > max) reservationFail(400, `${label} is too long.`)
  return normalized
}

function validStamp(value: unknown, created: boolean) {
  const source = record(value)
  if (!source || !source.at) return false
  const keys = Object.keys(source)
  const allowed = created ? ['at', 'by', 'app_id'] : ['at', 'by']
  return keys.every(key => allowed.includes(key)) &&
    (source.by === undefined || typeof source.by === 'string') &&
    (source.app_id === undefined || typeof source.app_id === 'string')
}

function money(value: unknown) {
  if (value === null) return null
  const source = record(value)
  if (
    !source ||
    Object.keys(source).some(key => !['amount_minor', 'currency_code'].includes(key)) ||
    !Number.isSafeInteger(source.amount_minor) ||
    source.amount_minor < 0 ||
    !/^[A-Z]{3}$/.test(text(source.currency_code))
  ) reservationFail(400, 'Reservation total is invalid.')
  return {
    amount_minor: source.amount_minor as number,
    currency_code: text(source.currency_code),
  }
}

export function reservationInput(value: unknown, partial = false) {
  const source = record(value)
  if (!source) reservationFail(400, 'Reservation request must be an object.')
  const createFields = [
    'guest', 'source', 'external_reference', 'status', 'arrival_date',
    'departure_date', 'adults', 'children', 'total', 'notes',
  ]
  const updateFields = [
    'guest', 'status', 'arrival_date', 'departure_date', 'adults', 'children',
    'total', 'notes',
  ]
  const allowed = partial ? updateFields : createFields
  const unsupported = Object.keys(source).find(key => !allowed.includes(key))
  if (unsupported) reservationFail(400, `Unsupported Reservation field: ${unsupported}.`)
  if (partial && Object.keys(source).length === 0) {
    reservationFail(400, 'Reservation update must change at least one field.')
  }
  const required = partial ? [] : allowed
  const missing = required.find(key => !(key in source))
  if (missing) reservationFail(400, `Reservation field is required: ${missing}.`)

  const output: Record<string, unknown> = {}
  if ('guest' in source) {
    const guest = record(source.guest)
    if (!guest || Object.keys(guest).some(key => !['display_name', 'email', 'phone'].includes(key))) {
      reservationFail(400, 'Reservation guest is invalid.')
    }
    const displayName = boundedText(guest.display_name, 160, 'Guest name')
    if (!displayName) reservationFail(400, 'Guest name is required.')
    output.guest = {
      display_name: displayName,
      email: boundedText(guest.email, 320, 'Guest email'),
      phone: boundedText(guest.phone, 80, 'Guest phone'),
    }
  }
  if ('source' in source) {
    if (!sources.has(source.source)) reservationFail(400, 'Reservation source is invalid.')
    output.source = source.source
  }
  if ('external_reference' in source) output.external_reference = boundedText(source.external_reference, 240, 'Channel reference')
  if ('status' in source) {
    if (!statuses.has(source.status)) reservationFail(400, 'Reservation status is invalid.')
    output.status = source.status
  }
  for (const field of ['arrival_date', 'departure_date'] as const) {
    if (field in source) {
      const value = text(source[field])
      if (!isDateOnly(value)) reservationFail(400, `${field} must use a valid YYYY-MM-DD date.`)
      output[field] = value
    }
  }
  for (const field of ['adults', 'children'] as const) {
    if (field in source) {
      const count = source[field]
      const minimum = field === 'adults' ? 1 : 0
      if (!Number.isInteger(count) || count < minimum || count > 100) {
        reservationFail(400, `Reservation ${field} is invalid.`)
      }
      output[field] = count
    }
  }
  if ('total' in source) output.total = money(source.total)
  if ('notes' in source) output.notes = boundedText(source.notes, 4000, 'Reservation notes')
  return output
}

export function canonicalReservation(id: string, value: unknown): Reservation {
  const source = record(value)
  if (!source || source.id !== undefined) reservationFail(409, `Stored Reservation is invalid: ${id}`)
  const keys = [
    'property_id', 'guest', 'source', 'external_reference', 'status',
    'arrival_date', 'departure_date', 'adults', 'children', 'total', 'notes',
    'sync', 'created', 'updated',
  ]
  if (Object.keys(source).some(key => !keys.includes(key)) || keys.some(key => !(key in source))) {
    reservationFail(409, `Stored Reservation is invalid: ${id}`)
  }
  if (typeof source.property_id !== 'string' || !source.property_id.trim()) {
    reservationFail(409, `Stored Reservation is invalid: ${id}`)
  }
  const normalized = reservationInput({
    guest: source.guest,
    source: source.source,
    external_reference: source.external_reference,
    status: source.status,
    arrival_date: source.arrival_date,
    departure_date: source.departure_date,
    adults: source.adults,
    children: source.children,
    total: source.total,
    notes: source.notes,
  }) as Omit<Reservation, 'id' | 'property_id' | 'sync' | 'created' | 'updated'>
  const sync = record(source.sync)
  if (
    !sync ||
    Object.keys(sync).some(key => !['state', 'channel_updated_at'].includes(key)) ||
    !syncStates.has(sync.state) ||
    !('channel_updated_at' in sync) ||
    !validStamp(source.created, true) ||
    !validStamp(source.updated, false)
  ) reservationFail(409, `Stored Reservation is invalid: ${id}`)
  if (normalized.departure_date <= normalized.arrival_date) {
    reservationFail(409, `Stored Reservation dates are invalid: ${id}`)
  }
  return {
    id,
    property_id: source.property_id.trim(),
    ...normalized,
    sync: { state: sync.state, channel_updated_at: sync.channel_updated_at },
    created: source.created,
    updated: source.updated,
  } as Reservation
}

export function occupiedDates(arrival: string, departure: string) {
  if (!isDateOnly(arrival) || !isDateOnly(departure) || departure <= arrival) {
    reservationFail(400, 'Departure date must be after arrival date.')
  }
  const dates: string[] = []
  let cursor = new Date(`${arrival}T00:00:00Z`)
  const end = new Date(`${departure}T00:00:00Z`)
  while (cursor < end) {
    if (dates.length >= 366) reservationFail(400, 'A Reservation cannot exceed 366 nights.')
    dates.push(cursor.toISOString().slice(0, 10))
    cursor = new Date(cursor.getTime() + 86_400_000)
  }
  return dates
}

export const reservationIsActive = (status: Reservation['status']) => status !== 'cancelled'
