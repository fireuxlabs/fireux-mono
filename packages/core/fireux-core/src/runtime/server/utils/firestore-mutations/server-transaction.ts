import type {
  DocumentData,
  Transaction,
  UpdateData,
} from 'firebase-admin/firestore'
import type {
  FirestoreDatabasePlacement,
  FirestoreMutationTarget,
} from '../../../types/firestore-mutations'
import { assertFirestoreMutationVerb } from '../../../utils/firestore-mutations/targets'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../getRuntimeFirestore'

export type GuardedServerTransaction = Readonly<{
  read<T extends DocumentData>(
    target: FirestoreMutationTarget<string, 'server'>,
    id: string
  ): Promise<{ exists: boolean; data: T | undefined }>
  readMany<T extends DocumentData>(
    target: FirestoreMutationTarget<string, 'server'>,
    ids: readonly string[]
  ): Promise<Array<{ id: string; exists: boolean; data: T | undefined }>>
  readAll<T extends DocumentData>(
    target: FirestoreMutationTarget<string, 'server'>,
    limit: number
  ): Promise<Array<{ id: string; data: T }>>
  query<T extends DocumentData>(
    target: FirestoreMutationTarget<string, 'server'>,
    input: {
      field: string
      op: '==' | 'array-contains' | 'in'
      value: unknown
      limit: number
    }
  ): Promise<Array<{ id: string; data: T }>>
  create<T extends DocumentData>(
    target: FirestoreMutationTarget<string, 'server'>,
    id: string,
    data: T
  ): void
  update<T extends DocumentData>(
    target: FirestoreMutationTarget<string, 'server'>,
    id: string,
    data: UpdateData<T>
  ): void
  delete(target: FirestoreMutationTarget<string, 'server'>, id: string): void
}>

function samePlacement(
  left: FirestoreDatabasePlacement,
  right: FirestoreDatabasePlacement
): boolean {
  return (
    left.kind === right.kind &&
    (left.kind === 'default' ||
      left.kind === 'runtime' ||
      left.kind === 'identity' ||
      ((left.kind === 'named' || left.kind === 'local-sproochli') &&
        (right.kind === 'named' || right.kind === 'local-sproochli') &&
        left.databaseId === right.databaseId))
  )
}

export function runGuardedServerTransaction<T>(
  placement: FirestoreDatabasePlacement,
  work: (transaction: GuardedServerTransaction) => Promise<T>
): Promise<T> {
  const database =
    placement.kind === 'identity'
      ? getRuntimeIdentityFirestore()
      : getRuntimeFirestore(
          placement.kind === 'named' || placement.kind === 'local-sproochli'
            ? placement.databaseId
            : undefined
        )
  const ref = (
    target: FirestoreMutationTarget<string, 'server'>,
    verb: 'create' | 'update' | 'delete' | undefined,
    id: string
  ) => {
    if (verb) assertFirestoreMutationVerb(target, 'server', verb)
    if (!samePlacement(placement, target.database))
      throw new Error(
        `Transaction placement does not own target ${target.key}.`
      )
    return database.collection(target.collectionPath).doc(id)
  }
  return database.runTransaction(async (raw: Transaction) =>
    work({
      async read<T extends DocumentData>(
        target: FirestoreMutationTarget<string, 'server'>,
        id: string
      ) {
        const snapshot = await raw.get(ref(target, undefined, id))
        return {
          exists: snapshot.exists,
          data: snapshot.data() as T | undefined,
        }
      },
      async readMany<T extends DocumentData>(
        target: FirestoreMutationTarget<string, 'server'>,
        ids: readonly string[]
      ) {
        const snapshots = await raw.getAll(
          ...ids.map((id) => ref(target, undefined, id))
        )
        return snapshots.map((snapshot, index) => ({
          id: ids[index]!,
          exists: snapshot.exists,
          data: snapshot.data() as T | undefined,
        }))
      },
      async readAll<T extends DocumentData>(
        target: FirestoreMutationTarget<string, 'server'>,
        limit: number
      ) {
        ref(target, undefined, '__read_all_authority__')
        if (limit < 1 || limit > 1_000) {
          throw new Error(
            'Guarded Server transaction collection read is invalid.'
          )
        }
        const snapshot = await raw.get(
          database.collection(target.collectionPath).limit(limit)
        )
        return snapshot.docs.map((document) => ({
          id: document.id,
          data: document.data() as T,
        }))
      },
      async query<T extends DocumentData>(
        target: FirestoreMutationTarget<string, 'server'>,
        input: {
          field: string
          op: '==' | 'array-contains' | 'in'
          value: unknown
          limit: number
        }
      ) {
        ref(target, undefined, '__query_authority__')
        if (!input.field.trim() || input.limit < 1 || input.limit > 100) {
          throw new Error('Guarded Server transaction query is invalid.')
        }
        const collection = database.collection(target.collectionPath)
        const snapshot = await raw.get(
          collection
            .where(input.field, input.op, input.value)
            .limit(input.limit)
        )
        return snapshot.docs.map((document) => ({
          id: document.id,
          data: document.data() as T,
        }))
      },
      create(target, id, data) {
        const payload = { ...data }
        delete payload.id
        raw.create(ref(target, 'create', id), payload)
      },
      update(target, id, data) {
        raw.update(ref(target, 'update', id), data)
      },
      delete(target, id) {
        raw.delete(ref(target, 'delete', id))
      },
    })
  )
}
