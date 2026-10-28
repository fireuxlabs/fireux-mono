import type {
  FirestoreDatabasePlacement,
  FirestoreReadTarget,
  FirestoreMutationLane,
  FirestoreMutationTarget,
  FirestoreMutationVerb,
} from '../../types/firestore-mutations'

const RETIRED_SEGMENTS = new Set([
  'directory-outbox',
  'platform-directory',
  'registry',
  'test',
  'handles',
  'user-handles',
  'user-handle-state',
  'security-migrations',
])

export const ALL_FIRESTORE_MUTATION_VERBS = [
  'create',
  'update',
  'delete',
] as const

export function assertFirestoreMutationSegment(
  value: string,
  label: string
): string {
  const segment = String(value || '').trim()
  if (!segment || segment.includes('/'))
    throw new Error(`${label} must be one Firestore path segment.`)
  if (
    RETIRED_SEGMENTS.has(segment) ||
    segment.endsWith('-simulation') ||
    segment.startsWith('test-') ||
    segment.startsWith('seo_index_')
  )
    throw new Error(
      `${label} uses permanently retired Firestore name: ${segment}`
    )
  return segment
}

export function defineFirestoreMutationTarget<
  const Key extends string,
  const Lane extends FirestoreMutationLane,
  const Verb extends FirestoreMutationVerb,
>(input: {
  key: Key
  lane: Lane
  verbs: readonly Verb[]
  database: FirestoreDatabasePlacement
  collectionPath: string
}): FirestoreMutationTarget<Key, Lane, Verb> {
  const collectionPath = input.collectionPath
    .split('/')
    .map((part) => assertFirestoreMutationSegment(part, 'collectionPath'))
    .join('/')
  if (input.database.kind === 'default' && input.lane === 'client') {
    throw new Error(
      '(default) Firestore mutation targets are never client-writable.'
    )
  }
  if (
    input.database.kind === 'named' ||
    input.database.kind === 'local-sproochli'
  )
    assertFirestoreMutationSegment(input.database.databaseId, 'databaseId')
  if (!input.verbs.length)
    throw new Error(
      `Mutation target ${input.key} must allow at least one verb.`
    )
  return Object.freeze({
    ...input,
    collectionPath,
    verbs: Object.freeze([...input.verbs]),
  })
}

export function assertFirestoreMutationVerb<
  Lane extends FirestoreMutationLane,
  Verb extends FirestoreMutationVerb,
>(
  target: FirestoreMutationTarget<string, Lane, FirestoreMutationVerb>,
  lane: Lane,
  verb: Verb
): asserts target is FirestoreMutationTarget<string, Lane, Verb> {
  if (target.lane !== lane || !target.verbs.includes(verb)) {
    throw new Error(
      `Firestore mutation target ${target.key} does not authorize ${lane}:${verb}.`
    )
  }
}

export function resolveFirestoreMutationDatabaseId(
  target: FirestoreMutationTarget
): string | undefined {
  return target.database.kind === 'named' ||
    target.database.kind === 'local-sproochli'
    ? target.database.databaseId
    : undefined
}

export function defineFirestoreReadTarget(
  input: FirestoreReadTarget
): FirestoreReadTarget {
  const collectionPath = input.collectionPath
    .split('/')
    .map((part) => assertFirestoreMutationSegment(part, 'collectionPath'))
    .join('/')
  if (input.database.kind === 'named' || input.database.kind === 'local-sproochli')
    assertFirestoreMutationSegment(input.database.databaseId, 'databaseId')
  return Object.freeze({ ...input, collectionPath })
}
