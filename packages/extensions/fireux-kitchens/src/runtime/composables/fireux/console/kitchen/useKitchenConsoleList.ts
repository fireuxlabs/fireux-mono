import { doc, getDoc } from 'firebase/firestore'
import { computed, isRef, ref, watch, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { KitchenStorage } from '../../../../models/kitchen.model'
import { useKitchenCollection } from '../../firestore/kitchen/fetch/useKitchenCollection'
import type { KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenUserComputed } from './useKitchenUserComputed'

type AppKitchenConsoleListDoc = {
  id?: string
  app_scope_app_id?: string
  operator_ids?: string[]
  team_ids?: string[]
}

export type KitchenConsoleListFilterValue = string | number | null | undefined
export type KitchenConsoleListFilter = {
  ids?: KitchenConsoleListFilterValue[] | null | undefined
}

type UseKitchenConsoleListOptions = {
  filter?: KitchenConsoleListFilter | Ref<KitchenConsoleListFilter | null | undefined> | null
}

const normalize = (value: unknown) => String(value ?? '').trim()
const uniq = (values: unknown[]) =>
  Array.from(new Set(values.map(normalize).filter(Boolean)))

/**
 * Console Kitchen read-many seam.
 *
 * Canon:
 * 1. Read the user's Kitchen index first: `users/{uid}.myKitchens`.
 * 2. Hydrate those exact root Kitchen docs.
 * 3. Read exact app-scoped Kitchen records only for those ids.
 * 4. Show only kitchens where the user is listed in the app-scoped team.
 *
 * This avoids scanning every app scope or every root Kitchen in the browser.
 */
export function useKitchenConsoleList(options: UseKitchenConsoleListOptions = {}) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { surface } = useKitchenInterface()
  const { coreUser, pending: userPending } = useUser()
  const scopeItems = ref<AppKitchenConsoleListDoc[]>([])
  const scopePending = ref(false)
  const { consoleKitchenIds } = useKitchenUserComputed(
    computed(() => scopeItems.value)
  )
  let requestId = 0
  const resolvedFilter = computed<KitchenConsoleListFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const explicitIds = computed(() =>
    (resolvedFilter.value?.ids ?? []).map((id) => normalize(id)).filter(Boolean)
  )
  const hasExplicitIds = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const userKitchenIds = computed(() => {
    return coreUser.value?.myKitchens ?? []
  })
  const collectionIds = computed(() =>
    uniq(hasExplicitIds.value ? explicitIds.value : userKitchenIds.value)
  )
  const rootCollection = useKitchenCollection({ ids: collectionIds })
  const scopeTargets = computed(() =>
    rootCollection.kitchens.value
      .map((kitchen) => {
        const kitchenId = normalize(kitchen.id)
        const scopeAppId =
          normalize(kitchen.app_scope_app_id) || normalize(appId)

        return kitchenId && scopeAppId
          ? { kitchenId, appId: scopeAppId }
          : null
      })
      .filter(
        (target): target is { kitchenId: string; appId: string } =>
          Boolean(target)
      )
  )

  const loadAppScopes = async (
    targets: { kitchenId: string; appId: string }[]
  ) => {
    const scopes = await Promise.all(
      targets.map(async (target) => {
        const snap = await getDoc(
          doc(
            db,
            AppStorage.collection,
            target.appId,
            KitchenStorage.scopeCollection,
            target.kitchenId
          )
        )

        if (!snap.exists()) return null

        const data = snap.data() as AppKitchenConsoleListDoc
        return {
          ...data,
          id: target.kitchenId,
          app_scope_app_id: target.appId,
          operator_ids: uniq(data.operator_ids ?? []),
          team_ids: uniq(data.team_ids ?? []),
        } satisfies AppKitchenConsoleListDoc
      })
    )

    return scopes.filter((scope): scope is AppKitchenConsoleListDoc =>
      Boolean(scope)
    )
  }

  watch(
    () => scopeTargets.value,
    async (targets) => {
      const currentRequestId = ++requestId

      if (!targets.length || import.meta.server) {
        scopeItems.value = []
        scopePending.value = false
        return
      }

      scopePending.value = true

      try {
        const scopes = await loadAppScopes(targets)
        if (currentRequestId === requestId) scopeItems.value = scopes
      } catch (error) {
        if (import.meta.dev) {
          console.error('[useKitchenConsoleList] exact app-scope read failed', error)
        }
        if (currentRequestId === requestId) scopeItems.value = []
      } finally {
        if (currentRequestId === requestId) scopePending.value = false
      }
    },
    { immediate: true, deep: true }
  )

  const scopesByKitchenId = computed(() => {
    const map = new Map<string, AppKitchenConsoleListDoc>()

    for (const scope of scopeItems.value) {
      const id = normalize(scope?.id)
      if (id) map.set(id, scope)
    }

    return map
  })
  const consoleKitchenIdSet = computed(() => new Set(consoleKitchenIds.value))
  const kitchens = computed<KitchenSurface[]>(() =>
    rootCollection.kitchens.value
      .map((kitchen) => {
        const kitchenId = normalize(kitchen.id)
        const scope = scopesByKitchenId.value.get(kitchenId) ?? null
        if (!consoleKitchenIdSet.value.has(kitchenId)) return null

        return surface({
          kitchen,
          scope,
          routeScope: kitchen.route_scope,
        })
      })
      .filter((kitchen): kitchen is KitchenSurface => Boolean(kitchen))
  )
  const count = computed(() => kitchens.value.length)
  const pending = computed(
    () =>
      (!hasExplicitIds.value && userPending.value) ||
      rootCollection.pending.value ||
      scopePending.value
  )

  return {
    kitchens,
    count,
    pending,
  }
}
