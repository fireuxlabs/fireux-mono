import { createError } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import {
  type IngredientStatus,
} from '../../models/ingredient-taxonomy.ts'
import { normalizeIngredientAliases } from './public-projection.ts'

export type StoredRecord = Record<string, unknown>

export const MAX_LIBRARY_SIZE = 500

export const CREATE_FIELDS = new Set([
  'name',
  'aliases',
  'category',
  'kind',
  'parent_ingredient_id',
  'status',
  'replaced_by_ingredient_id',
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
  const name = text(value).normalize('NFC')
  if (!name) badRequest('Ingredient name is required.')
  if (name.length > 120)
    badRequest('Ingredient name must be 120 characters or fewer.')
  return name
}

export function aliases(value: unknown, name: string) {
  if (value !== undefined && !Array.isArray(value)) {
    badRequest('Ingredient aliases must be an array.')
  }
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

export function optionalIngredientId(value: unknown, label: string) {
  const id = text(value)
  if (!id) return ''
  if (!isFirestoreDocumentId(id)) badRequest(`${label} is invalid.`)
  return id
}

export function imageUrl(value: unknown) {
  const url = text(value)
  if (url.length > 2_000) badRequest('Ingredient image URL is too long.')
  if (url && !url.startsWith('/') && !/^https?:\/\//i.test(url)) {
    badRequest(
      'Ingredient image URL must be an HTTP URL or an absolute app path.'
    )
  }
  return url
}

export function assertLifecycle(input: {
  id: string
  parentIngredientId: string
  status: IngredientStatus
  replacedByIngredientId: string
}) {
  if (input.parentIngredientId === input.id) {
    badRequest('An Ingredient cannot be its own parent.')
  }
  if (input.replacedByIngredientId === input.id) {
    badRequest('An Ingredient cannot replace itself.')
  }
  if (input.status === 'merged' && !input.replacedByIngredientId) {
    badRequest('A merged Ingredient requires a replacement.')
  }
  if (input.status !== 'merged' && input.replacedByIngredientId) {
    badRequest('Only a merged Ingredient may declare a replacement.')
  }
}
