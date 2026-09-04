import type { H3Event } from 'h3'
import { readAppSession } from 'fireux-core/runtime/app/server/session/read'
import { readPlacePresentation } from 'fireux-places/runtime/place/utils/place-spine'
import { readSupplier } from '../identity/read.ts'

export type SupplierWorkspacePrimaryPresentation = {
  id: string
  name: string
  tagline: string
  url: string
}

export async function readSupplierWorkspacePrimary(
  event: H3Event
): Promise<{ current: SupplierWorkspacePrimaryPresentation | null }> {
  const membership = (await readAppSession(event)).appUser
  const id = membership?.primary_supplier || ''
  if (!id) return { current: null }

  const { place } = await readSupplier(id)
  const presentation = readPlacePresentation(place)
  return {
    current: {
      id,
      name: presentation.shortName || presentation.name,
      tagline: presentation.tagline,
      url: presentation.imageUrl,
    },
  }
}
