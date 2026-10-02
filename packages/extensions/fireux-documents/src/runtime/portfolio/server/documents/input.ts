import { createError } from 'h3'
export function invalidDocumentInput(): never { throw createError({ statusCode: 400, statusMessage: 'Invalid Document input.' }) }
export function documentFields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalidDocumentInput()
  const value = input as Record<string, unknown>
  if (Object.keys(value).some(key => !allowed.includes(key))) invalidDocumentInput()
  return value
}
export function documentString(input: unknown, required = false) {
  if (typeof input !== 'string') invalidDocumentInput()
  const value = input.trim()
  if (required && !value) invalidDocumentInput()
  return value
}
