// Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: explicit Blank collection outcome.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name Blank access support directly.
// Concurrent edit — 2026-07-21 22:28 CEST — Console family alignment: resolve Blank root/support pairs from App-support authority.
// Concurrent edit — 2026-07-21 23:22 CEST — Console family alignment: project access only from strict AppBlank support.
import { computed, unref, type Ref } from 'vue'
import { collection, query, where, type Query } from 'firebase/firestore'
import {
  normalizeConsoleSource,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { readConsoleTargetAuthority } from 'fireux-core/runtime/composables/fireux/console/useConsoleAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import {
  BlankStorage,
  type AppBlank,
  type Blank,
  type BlankSurface,
} from '../../../../models/blank.model'
import { composeBlankSurface } from '../../../../utils/blank-surface'

const text = (value: unknown) => String(value ?? '').trim()

type CreateBlankInput = {
  name?: string
}
type BlankIdInput = string[] | Ref<string[]>
type UseBlankCollectionOptions = {
  source?: ConsoleSource | Ref<ConsoleSource | null | undefined> | null
}

export function blankAppCollectionPath(appId: string) {
  const resolvedAppId = text(appId)
  if (!resolvedAppId) return ''

  return `${AppStorage.collection}/${resolvedAppId}/${BlankStorage.appCollection}`
}

export function useBlankCollection(options: UseBlankCollectionOptions = {}) {
  const { appId, ecosystem } = useFireUXConfig()
  const { uid } = useAuth()
  const db = useFirestore()
  const { firestoreLoadDocsByIds, firestoreQuery } = useFirestoreRead()
  const source = computed(() =>
    normalizeConsoleSource(unref(options.source) ?? 'live')
  )
  const userId = computed(() => text(uid.value))
  const rootCollectionPath = computed(() =>
    source.value === 'live' ? BlankStorage.rootCollection : ''
  )
  const appCollectionPath = computed(() =>
    source.value === 'live' ? blankAppCollectionPath(appId) : ''
  )
  const supportQuery = (field: 'operator_ids' | 'team_ids') => computed<Query<AppBlank> | null>(() =>
    source.value === 'live' && appId && userId.value
      ? query(
          collection(db, AppStorage.collection, appId, BlankStorage.appCollection),
          where(field, 'array-contains', userId.value)
        ) as Query<AppBlank>
      : null
  )
  const operatorBlanks = firestoreQuery<AppBlank>(supportQuery('operator_ids'))
  const teamBlanks = firestoreQuery<AppBlank>(supportQuery('team_ids'))
  const appBlanks = computed(() => {
    const byId = new Map<string, AppBlank>()
    for (const blank of [...(operatorBlanks.value ?? []), ...(teamBlanks.value ?? [])]) {
      const id = text(blank.id)
      if (id) byId.set(id, blank)
    }
    return [...byId.values()]
  })
  const targetIds = computed(() => appBlanks.value.map(blank => text(blank.id)).filter(Boolean))
  const targetIdSet = computed(() => new Set(targetIds.value))
  const authorisedAppBlanks = computed(() =>
    appBlanks.value.filter((blank) => {
      const authority = readConsoleTargetAuthority(blank)

      return Boolean(
        authority &&
        userId.value &&
          (authority.operatorIds.includes(userId.value) ||
            authority.teamIds.includes(userId.value))
      )
    })
  )
  const rootBlanks = firestoreLoadDocsByIds<Blank>({
    collectionPath: rootCollectionPath,
    ids: targetIds,
  })
  const blanks = computed<BlankSurface[]>(() => {
    const appSupportById = new Map<string, AppBlank>()

    for (const appSupport of authorisedAppBlanks.value) {
      const id = text(appSupport.id)
      if (id) appSupportById.set(id, appSupport)
    }

    return (rootBlanks.docs.value ?? []).flatMap((blank) => {
      const id = text(blank.id)
      const appSupport = appSupportById.get(id)
      const authority = readConsoleTargetAuthority(appSupport)
      if (
        !appSupport ||
        !authority ||
        !targetIdSet.value.has(id)
      ) return []

      const surface = composeBlankSurface({
        blank: { ...blank, id },
        appSupport,
        appId: text(appId),
        ecosystem,
      })
      return surface ? [surface] : []
    })
  })
  const active = computed(() => source.value === 'live')
  const count = computed(() => blanks.value.length)
  const pending = computed(() =>
    active.value
      ? operatorBlanks.pending.value || teamBlanks.pending.value || rootBlanks.pending.value
      : false
  )
  const integrityError = computed<Error | undefined>(() => {
    if (
      !active.value ||
      pending.value ||
      operatorBlanks.error.value ||
      teamBlanks.error.value ||
      rootBlanks.error.value ||
      targetIds.value.length === 0
    ) return undefined

    const appSupportById = new Map(
      appBlanks.value.map((support) => [
        text(support.id),
        support,
      ])
    )
    const rootsById = new Map(
      (rootBlanks.docs.value ?? []).map((blank) => [text(blank.id), blank])
    )
    const failures: string[] = []

    for (const id of targetIds.value) {
      const support = appSupportById.get(id)
      const root = rootsById.get(id)
      if (!root) failures.push(`${id}: missing root`)
      if (!support) failures.push(`${id}: missing App support`)
      if (!root || !support) continue

      const authority = readConsoleTargetAuthority(support)
      if (!authority) {
        failures.push(`${id}: malformed App support authority`)
        continue
      }
      if (text(support.blank_id) !== id) {
        failures.push(`${id}: App support id mismatch`)
      }
      if (
        !userId.value ||
        ![...authority.operatorIds, ...authority.teamIds].includes(userId.value)
      ) {
        failures.push(`${id}: current user lacks support access`)
      }
      const management = readFireuxEntityManagement(root.management)
      if (
        !management ||
        management.mode === 'root' ||
        resolveFireuxEntityManagementAppId(management, ecosystem) !==
          text(appId)
      ) {
        failures.push(`${id}: root/App scope mismatch`)
      }
    }

    return failures.length
      ? new Error(`[blank] invalid console target pair; ${failures.join('; ')}`)
      : undefined
  })
  const error = computed<unknown | undefined>(() =>
    active.value
      ? operatorBlanks.error.value ?? teamBlanks.error.value ?? rootBlanks.error.value ?? integrityError.value
      : undefined
  )
  const { outcome } = useFirestoreCollectionState({
    active,
    count,
    error,
    pending,
  })

  return {
    blanks,
    count,
    pending,
    error,
    outcome,
    rootCollectionPath,
    appCollectionPath,
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
      createdAppSupport: true
    }>('/api/console/blank/onboarding', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: text(input.name) || 'Blank target' },
    })
  }

  return {
    createBlank,
  }
}
