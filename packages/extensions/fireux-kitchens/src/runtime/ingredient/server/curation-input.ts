import { createError } from 'h3'
import { normalizeIngredientAliases } from './normalize.ts'
import { INGREDIENT_CATEGORIES } from '../models/ingredient-taxonomy'

export type StoredRecord = Record<string, unknown>

export const MAX_LIBRARY_SIZE = 500

export const CREATE_FIELDS = new Set([
  'name',
  'aliases',
  'category',
  'image_url',
])

export const UPDATE_FIELDS = CREATE_FIELDS

export const text = (value: unknown) => String(value ?? '').trim()

export const foldIdentity = (value: unknown) =>
  text(value).normalize('NFC').toLocaleLowerCase('en')

export const record = (value: unknown): StoredRecord =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as StoredRecord)
    : {}

export function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

export function validateObject(
  value: unknown,
  allowed: ReadonlySet<string>,
  label: string
) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest(`${label} must be an object.`)
  }
  const source = value as StoredRecord
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported)
    badRequest(`${label} contains unsupported field: ${unsupported}.`)
  return source
}

export function requiredName(value: unknown) {
  if (typeof value !== 'string') badRequest('Ingredient name must be text.')
  const name = value.trim().normalize('NFC')
  if (!name) badRequest('Ingredient name is required.')
  if (name.length > 120)
    badRequest('Ingredient name must be 120 characters or fewer.')
  return name
}

export function aliases(value: unknown, name: string) {
  if (value !== undefined && !Array.isArray(value)) {
    badRequest('Ingredient aliases must be an array.')
  }
  if (Array.isArray(value) && value.some((alias) => typeof alias !== 'string'))
    badRequest('Ingredient aliases must contain text only.')
  const normalized = normalizeIngredientAliases(value)
  if (normalized.length > 20)
    badRequest('Ingredient aliases may contain at most 20 values.')
  if (normalized.some((alias) => alias.length > 120)) {
    badRequest('Ingredient aliases must be 120 characters or fewer.')
  }
  const canonical = foldIdentity(name)
  return normalized.filter((alias) => foldIdentity(alias) !== canonical)
}

export function enumValue<T extends string>(
  value: unknown,
  values: readonly T[],
  label: string,
  fallback?: T
) {
  if (value === undefined && fallback !== undefined) return fallback
  if (!values.includes(value as T)) {
    badRequest(`${label} is invalid.`)
  }
  return value as T
}

export function imageUrl(value: unknown) {
  if (value !== undefined && typeof value !== 'string')
    badRequest('Ingredient image URL must be text.')
  const url = (value as string | undefined)?.trim() ?? ''
  if (url.length > 2_000) badRequest('Ingredient image URL is too long.')
  if (!url) return ''
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\'))
    return url
  try {
    const parsed = new URL(url)
    if (['http:', 'https:'].includes(parsed.protocol) && parsed.hostname)
      return url
  } catch {
    /* Report the same input contract below. */
  }
  badRequest(
    'Ingredient image URL must be an HTTP URL or an absolute app path.'
  )
}

/** Detach and validate supported identity fields before credential waits. */
export function normalizeIngredientInput(
  input: unknown,
  creating = false
): StoredRecord {
  const source = validateObject(
    input,
    creating ? CREATE_FIELDS : UPDATE_FIELDS,
    creating ? 'Ingredient' : 'Ingredient patch'
  )
  if (!creating && !Object.keys(source).length)
    badRequest('Ingredient patch is empty.')
  const result: StoredRecord = {}
  if (creating || Object.hasOwn(source, 'name'))
    result.name = requiredName(source.name)
  if (creating || Object.hasOwn(source, 'category'))
    result.category = enumValue(
      source.category,
      INGREDIENT_CATEGORIES,
      'Ingredient category'
    )
  if (creating || Object.hasOwn(source, 'aliases'))
    result.aliases = aliases(source.aliases, (result.name as string) ?? '')
  if (creating || Object.hasOwn(source, 'image_url'))
    result.image_url = imageUrl(source.image_url)
  return result
}
