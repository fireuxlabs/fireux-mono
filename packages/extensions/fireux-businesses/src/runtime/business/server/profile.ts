import { createError } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
export function businessProfile(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({ statusCode: 400, statusMessage: 'Enter valid Business details.' })
  const body = input as Record<string, unknown>
  const keys = ['name', 'description', 'email', 'phone', 'website', 'place_ids']
  if (Object.keys(body).some((key) => !keys.includes(key)))
    throw createError({ statusCode: 400, statusMessage: 'Unsupported Business field.' })
  if (keys.filter((key) => key !== 'place_ids').some((key) => body[key] !== undefined && typeof body[key] !== 'string'))
    throw createError({ statusCode: 400, statusMessage: 'Business profile fields must be text.' })
  const result = {
    name: String(body.name ?? '').trim(),
    description: String(body.description ?? '').trim(),
    email: String(body.email ?? '').trim(),
    phone: String(body.phone ?? '').trim(),
    website: String(body.website ?? '').trim(),
    place_ids: body.place_ids ?? [],
  }
  if (!result.name || result.name.length > 120 || result.description.length > 2000 ||
      result.email.length > 254 || result.phone.length > 80 || result.website.length > 2000 ||
      (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) ||
      (result.website && !/^https?:\/\//.test(result.website)) ||
      !Array.isArray(result.place_ids) || result.place_ids.length > 20 ||
      !result.place_ids.every((id) => typeof id === 'string' && isFirestoreDocumentId(id)) ||
      new Set(result.place_ids).size !== result.place_ids.length)
    throw createError({ statusCode: 400, statusMessage: 'Check the Business name, contact details and locations.' })
  if (result.website) {
    try {
      const url = new URL(result.website)
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid URL')
    } catch { throw createError({ statusCode: 400, statusMessage: 'Enter a valid public website URL.' }) }
  }
  return { ...result, place_ids: result.place_ids as string[] }
}
