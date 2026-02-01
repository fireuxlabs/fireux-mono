// FILE: packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/mutations/usePlaceUpdate.ts
// flag

import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type { Place, PlaceImageShade } from '../../../../../../models/objects/place.model'

type UpdateCtx = { id: string | null | undefined }

function reqId(ctx: UpdateCtx): string {
  const id = String(ctx?.id ?? '').trim()
  if (!id) throw new Error('Place id is required')
  return id
}

function sanitize(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function sanitizeNullable(value: unknown): string {
  const v = sanitize(value)
  return v
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim())
  if (!Number.isFinite(n)) throw new Error('Value must be a number')
  return n
}

function toShade(value: unknown): PlaceImageShade {
  const v = String(value ?? 'none').toLowerCase().trim()
  if (v === 'light' || v === 'dark' || v === 'none') return v
  return 'none'
}

/**
 * usePlaceUpdate
 * Centralized update functions for Place (core-only; no app overlay)
 * Firestore: places/{id}
 */
export function usePlaceUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  async function updateName(value: string, ctx: UpdateCtx) {
    const id = reqId(ctx)
    const name = sanitize(value) || 'Untitled place'
    await updateDocument<Place>('places', id, { name } as Partial<Place>)
  }

  async function updateShortName(value: string, ctx: UpdateCtx) {
    const id = reqId(ctx)
    const short_name = sanitizeNullable(value)
    await updateDocument<Place>('places', id, { short_name } as Partial<Place>)
  }

  async function updateFormattedAddress(value: string, ctx: UpdateCtx) {
    const id = reqId(ctx)
    const formatted_address = sanitizeNullable(value)
    await updateDocument<Place>('places', id, {
      formatted_address,
    } as Partial<Place>)
  }

  async function updateShortAddress(value: string, ctx: UpdateCtx) {
    const id = reqId(ctx)
    const short_address = sanitizeNullable(value)
    await updateDocument<Place>('places', id, { short_address } as Partial<Place>)
  }

  async function updateSearchTerm(value: string, ctx: UpdateCtx) {
    const id = reqId(ctx)
    const search_term = sanitizeNullable(value).toLowerCase()
    await updateDocument<Place>('places', id, { search_term } as Partial<Place>)
  }

  async function updateLat(value: string | number, ctx: UpdateCtx) {
    const id = reqId(ctx)
    const lat = toNumber(value)
    await updateDocument<Place>('places', id, { lat } as Partial<Place>)
  }

  async function updateLng(value: string | number, ctx: UpdateCtx) {
    const id = reqId(ctx)
    const lng = toNumber(value)
    await updateDocument<Place>('places', id, { lng } as Partial<Place>)
  }

  /**
   * NOTE: This expects a final URL string (already uploaded).
   * Keep upload concerns in the UI (like Place/Edit.vue) or a separate image helper.
   */
  async function updatePlaceImage(value: string, ctx: UpdateCtx) {
    const id = reqId(ctx)
    const image_url = sanitizeNullable(value)
    await updateDocument<Place>('places', id, { image_url } as Partial<Place>)
  }

  async function updateImageShade(value: PlaceImageShade | string, ctx: UpdateCtx) {
    const id = reqId(ctx)
    const image_shade = toShade(value)
    await updateDocument<Place>('places', id, { image_shade } as Partial<Place>)
  }

  return {
    updateName,
    updateShortName,
    updateFormattedAddress,
    updateShortAddress,
    updateSearchTerm,
    updateLat,
    updateLng,
    updatePlaceImage,
    updateImageShade,
  }
}