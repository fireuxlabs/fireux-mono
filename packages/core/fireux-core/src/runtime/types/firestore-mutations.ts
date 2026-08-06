export const FIRESTORE_MUTATION_LANES = [
  'client',
  'server',
  'mcp-skill',
] as const
export const FIRESTORE_MUTATION_VERBS = ['create', 'update', 'delete'] as const

export type FirestoreMutationLane = (typeof FIRESTORE_MUTATION_LANES)[number]
export type FirestoreMutationVerb = (typeof FIRESTORE_MUTATION_VERBS)[number]
export type FirestoreDatabasePlacement =
  | { kind: 'default' }
  | { kind: 'runtime' }
  | { kind: 'identity' }
  | { kind: 'named'; databaseId: string }
  | { kind: 'local-sproochli'; databaseId: string }

export type FirestoreMutationTarget<
  Key extends string = string,
  Lane extends FirestoreMutationLane = FirestoreMutationLane,
  Verb extends FirestoreMutationVerb = FirestoreMutationVerb,
> = Readonly<{
  key: Key
  lane: Lane
  verbs: readonly Verb[]
  database: FirestoreDatabasePlacement
  collectionPath: string
}>

export type TargetFor<
  Lane extends FirestoreMutationLane,
  Verb extends FirestoreMutationVerb,
> = FirestoreMutationTarget<string, Lane, Verb>

export type FirestoreCreateInput<T> = Readonly<{
  target: TargetFor<FirestoreMutationLane, 'create'>
  id?: string
  data: T
}>

export type FirestoreUpdateInput<T> = Readonly<{
  target: TargetFor<FirestoreMutationLane, 'update'>
  id: string
  data: Partial<T>
}>

export type FirestoreDeleteInput = Readonly<{
  target: TargetFor<FirestoreMutationLane, 'delete'>
  id: string
}>
