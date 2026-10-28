import { doc, type Firestore } from 'firebase/firestore'
import { useNuxtApp } from '#imports'
import { useDocument } from '../vuefire'
import { guardFirestorePromise } from './firestore-read-errors'
import {
  computed,
  effectScope,
  ref,
  unref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import { attachDevCollectionMeta } from '../../../diagnostics/useDiagnosticsCollectionJson'
import type { FirestoreReadOutcome } from './useFirestoreRead'

type MaybeRef<T> = T | Ref<T>

export type FirestoreLoadDocsByIdsOptions = {
  collectionPath: string | Ref<string | null | undefined>
  ids: MaybeRef<(string | number | null | undefined)[] | null | undefined>
}

export function createFirestoreExactDocLoader<T>(input: {
  resolveDb: () => Firestore
  databaseId?: string | Ref<string | null | undefined> | null
  options: FirestoreLoadDocsByIdsOptions
}): {
  docs: Ref<T[] | undefined>
  pending: Ref<boolean>
  error: Ref<unknown | undefined>
  outcome: ComputedRef<FirestoreReadOutcome>
} {
  const { vueApp } = useNuxtApp()
  const { resolveDb } = input
  const { collectionPath, ids } = input.options
  const docs = ref<T[] | undefined>(undefined) as Ref<T[] | undefined>
  const pending = ref(false)
  const error = ref<unknown>()
  let requestId = 0

  const normalizedCollectionPath = computed(() =>
    String(unref(collectionPath) || '').trim()
  )
  const normalizedDatabaseId = computed(() =>
    String(unref(input.databaseId) || '').trim()
  )
  const normalizedIds = computed(() => {
    const values = unref(ids) ?? []
    return Array.from(
      new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))
    )
  })
  const active = computed(() =>
    Boolean(normalizedCollectionPath.value && normalizedIds.value.length)
  )
  const outcome = computed<FirestoreReadOutcome>(() => {
    if (!active.value) return 'idle'
    if (pending.value) return 'pending'
    if (error.value) return 'error'
    return docs.value?.length ? 'ready' : 'empty'
  })

  watch(
    () => ({
      collectionPath: normalizedCollectionPath.value,
      databaseId: normalizedDatabaseId.value,
      ids: normalizedIds.value,
    }),
    (
      {
        collectionPath,
        ids,
      }: {
        collectionPath: string
        databaseId: string
        ids: string[]
      },
      _previous,
      onCleanup
    ) => {
      const currentRequestId = ++requestId
      if (!collectionPath || !ids.length) {
        docs.value = []
        pending.value = false
        error.value = undefined
        return
      }
      if (import.meta.server) {
        docs.value = undefined
        pending.value = true
        error.value = undefined
        return
      }

      docs.value = undefined
      pending.value = true
      error.value = undefined
      const scope = effectScope()
      onCleanup(() => scope.stop())
      vueApp.runWithContext(() =>
        scope.run(() => {
          const bindings = ids.map((id) =>
            useDocument(doc(resolveDb(), collectionPath, id), {
              reset: true,
            })
          )
          bindings.forEach((binding, index) =>
            guardFirestorePromise(binding, `${collectionPath}/${ids[index]}`)
          )
          watch(
            () =>
              bindings.map((binding) => ({
                value: binding.value,
                pending: binding.pending.value,
                error: binding.error.value,
              })),
            (states) => {
              if (currentRequestId !== requestId) return
              pending.value = states.some((state) => state.pending)
              error.value = states.find((state) => state.error)?.error
              docs.value =
                pending.value || error.value
                  ? undefined
                  : states.flatMap((state, index) => {
                      if (!state.value) return []
                      return [
                        attachDevCollectionMeta(
                          { ...state.value, id: ids[index] },
                          collectionPath,
                          ids[index]!
                        ) as T,
                      ]
                    })
            },
            { immediate: true, deep: true }
          )
        })
      )
    },
    { immediate: true, deep: true }
  )

  return { docs, pending, error, outcome }
}
