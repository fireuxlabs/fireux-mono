import { createError } from 'h3'
import type { MenuExpressRequest } from '../../shared/types/menu-express'

export function fail(message: string, statusCode = 400): never {
  throw createError({ statusCode, statusMessage: message })
}
export function text(
  value: unknown,
  label: string,
  max: number,
  optional = false
) {
  const result = typeof value === 'string' ? value.trim() : ''
  if ((!result && !optional) || result.length > max)
    fail(`${label} is invalid.`)
  return result
}
export function requestId(value: unknown) {
  const id = text(value, 'Request id', 36)
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)
  )
    fail('Request id is invalid.')
  return id
}
export function intake(input: Record<string, unknown>) {
  const name = text(input.name, 'Name', 120)
  const email = text(input.email, 'Email', 320).toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail('Email is invalid.')
  const sourceUrl = text(input.sourceUrl, 'Source link', 2000, true)
  if (sourceUrl) {
    let url: URL
    try {
      url = new URL(sourceUrl)
    } catch {
      return fail('Source link is invalid.')
    }
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      fail('Source link must use HTTP or HTTPS.')
  }
  return {
    contact: { name, email },
    venue: text(input.venue, 'Venue', 200),
    location: text(input.location, 'Location', 300),
    sourceUrl,
    instructions: text(input.instructions, 'Instructions', 2000, true),
  }
}
export function requirePaid(request: MenuExpressRequest) {
  if (request.payment.status !== 'paid') fail('Payment is not confirmed.', 409)
}
export function requireReview(request: MenuExpressRequest, revision: unknown) {
  requirePaid(request)
  if (
    request.stage !== 'review' ||
    !request.review ||
    revision !== request.review.revision
  )
    fail('This review has changed. Reload before continuing.', 409)
}

export function dto(id: string, data: Record<string, any>): MenuExpressRequest {
  return {
    id,
    contact: data.contact,
    venue: data.venue,
    location: data.location,
    sourceUrl: data.sourceUrl,
    instructions: data.instructions,
    demo: data.demo,
    stage: data.stage,
    payment: data.payment,
    target: data.target,
    review: data.review,
    approval: data.approval,
    correction: data.correction,
    delivery: data.delivery,
    sources: data.sources || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}
