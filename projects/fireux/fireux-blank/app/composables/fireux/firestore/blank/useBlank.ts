import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useMembershipAccess } from 'fireux-core/runtime/app/composables/useMembershipAccess'
import { blankAccessCollection } from '../../../../utils/blank-access'
import { computed, unref, type Ref } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { BlankStorage, type Blank } from '../../../../models/blank.model'
const text = (value: unknown) => String(value ?? '').trim()
type CreateBlankInput = { name?: string }
type BlankIdInput = string[] | Ref<string[]>
export function useBlankCollection() {
  const session = useAppSession()
  const config = useFireUXConfig()
  const access = useMembershipAccess(
    () => blankAccessCollection(config.appId),
    session.uid,
    session.appUser
  )
  const ids = computed(() =>
    session.pending.value || session.error.value ? [] : access.ids.value
  )
  const roots = useBlankDocsByIds(ids)
  const blanks = computed(() =>
    ids.value.length
      ? roots.blanks.value.filter((blank) => ids.value.includes(blank.id))
      : []
  )
  const pending = computed(
    () => session.pending.value || access.pending.value || roots.pending.value
  )
  const error = computed(
    () => session.error.value || access.error.value || roots.error.value
  )
  const outcome = computed(() =>
    pending.value
      ? ('pending' as const)
      : error.value
        ? ('error' as const)
        : blanks.value.length
          ? ('ready' as const)
          : ('empty' as const)
  )
  return {
    blanks,
    count: computed(() => blanks.value.length),
    pending,
    error,
    outcome,
  }
}

export function useBlankDocsByIds(ids: BlankIdInput) {
  const { firestoreLoadDocsByIds } = useFirestoreRead()
  const blankIds = computed(() => unref(ids).map(text).filter(Boolean))
  const rootBlanks = firestoreLoadDocsByIds<Blank>({
    collectionPath: BlankStorage.rootCollection,
    ids: blankIds,
  })
  const blanks = computed<Blank[]>(() =>
    (rootBlanks.docs.value ?? []).map((blank) => ({
      ...blank,
      id: text(blank.id),
    }))
  )

  return {
    blanks,
    pending: rootBlanks.pending,
    error: rootBlanks.error,
  }
}

export function useBlankCreate() {
  async function createBlank(input: CreateBlankInput = {}) {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    return $fetch<{
      ok: true
      id: string
      createdRoot: true
    }>('/api/workspace/blank/onboarding', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: text(input.name) || 'Blank target' },
    })
  }

  return {
    createBlank,
  }
}
