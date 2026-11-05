import { createError } from 'h3'
import { readBusinessDetail } from './projection'
export async function readBusinessPlace(id: unknown) {
  const { place } = await readBusinessDetail(id)
  if (!place) throw createError({ statusCode: 404, statusMessage: 'Business has no available location.' })
  return place
}
