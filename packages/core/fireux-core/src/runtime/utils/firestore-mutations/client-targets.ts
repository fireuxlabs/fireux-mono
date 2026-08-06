import { defineFirestoreMutationTarget } from './target-definition'

/**
 * Defines one domain-owned Client Create target in the active Project database.
 * Callers still own payload validation and lifecycle checks; this seam removes
 * caller-selected database ids from the Client mutation touchpoint.
 */
export function defineRuntimeClientCreateTarget<const Key extends string>(
  key: Key,
  collectionPath: string
) {
  return defineFirestoreMutationTarget({
    key,
    lane: 'client',
    verbs: ['create'],
    database: { kind: 'runtime' },
    collectionPath,
  })
}
