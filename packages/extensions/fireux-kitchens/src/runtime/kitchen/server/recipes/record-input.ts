import { createError } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

export function recipeTarget(kitchenId: string) {
  return defineFirestoreMutationTarget({
    key: 'kitchens.recipes',
    lane: 'server',
    verbs: ['create', 'update', 'delete'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchenId}/recipes`,
  })
}

export function recipeFields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Recipe input.',
    })
  const value = input as Record<string, unknown>
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Recipe field.',
    })
  return value
}

export function validateRecipeInput<T>(read: () => T): T {
  try {
    return read()
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : 'Invalid Recipe input.',
    })
  }
}
