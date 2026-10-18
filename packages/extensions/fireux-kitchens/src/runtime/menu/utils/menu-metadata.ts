import { requireOperatingHours } from '../../kitchen/utils/operating-hours'
import type { MenuDocument } from '../models/menu.model'
import type { MenuUpdateInput } from '../models/menu-storage.model'

/** Editable catalogue metadata. Publication and relationships have other owners. */
export function normalizeMenuMetadataPatch(input: unknown): MenuUpdateInput {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Invalid Menu changes.')
  const value = input as Record<string, unknown>
  if (
    !Object.keys(value).length ||
    Object.keys(value).some(
      (key) =>
        ![
          'name',
          'description',
          'sort_order',
          'doc',
          'audience',
          'serving_hours',
        ].includes(key)
    )
  )
    throw new Error('Unsupported Menu field.')
  const result: MenuUpdateInput = {}
  if ('name' in value) {
    if (
      typeof value.name !== 'string' ||
      !value.name.trim() ||
      value.name.trim().length > 160
    )
      throw new Error('Menu name must be 1–160 characters.')
    result.name = value.name.trim()
  }
  if ('description' in value) {
    if (
      typeof value.description !== 'string' ||
      value.description.length > 4000
    )
      throw new Error('Menu description must be text up to 4,000 characters.')
    result.description = value.description.trim()
  }
  if ('sort_order' in value) {
    if (
      typeof value.sort_order !== 'number' ||
      !Number.isSafeInteger(value.sort_order)
    )
      throw new Error('Menu order must be a whole number.')
    result.sort_order = value.sort_order
  }
  if ('audience' in value) {
    if (!['public', 'private_link'].includes(String(value.audience)))
      throw new Error(
        'Choose Public or Private link. Protected groups require secure access setup.'
      )
    result.audience = value.audience as 'public' | 'private_link'
  }
  if ('doc' in value) result.doc = normalizeMenuDocument(value.doc)
  if ('serving_hours' in value) {
    if (value.serving_hours === null) result.serving_hours = null
    else {
      const raw = value.serving_hours as Record<string, unknown>
      if (
        !raw ||
        raw.source !== 'custom' ||
        Object.keys(raw).some(
          (key) => !['source', 'timezone', 'windows'].includes(key)
        )
      )
        throw new Error('Choose valid Menu serving hours.')
      result.serving_hours = requireOperatingHours(raw, true)
    }
  }
  return result
}

export function normalizeMenuDocument(input: unknown): MenuDocument {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Invalid Menu document.')
  const data = input as Record<string, unknown>
  const keys = ['url', 'name', 'type', 'storage_path'] as const
  if (
    Object.keys(data).some(
      (key) => !keys.includes(key as (typeof keys)[number])
    ) ||
    keys.some(
      (key) => typeof data[key] !== 'string' || !(data[key] as string).trim()
    )
  )
    throw new Error('Menu document metadata is incomplete or invalid.')
  const doc = Object.fromEntries(
    keys.map((key) => [key, (data[key] as string).trim()])
  ) as MenuDocument
  let url: URL
  try {
    url = new URL(doc.url)
  } catch {
    throw new Error('Menu document requires an HTTP or HTTPS URL.')
  }
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('Menu document requires an HTTP or HTTPS URL.')
  return doc
}
