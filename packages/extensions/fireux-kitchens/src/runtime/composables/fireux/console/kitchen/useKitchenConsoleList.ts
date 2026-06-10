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
 * 1. Read the user's Kitchen index first: `users/{uid}.kitchen_ids`.
 * 2. Hydrate those exact root Kitchen docs.
 * 3. Read exact app-scoped Kitchen records only for those ids.
 *
 * This avoids scanning every app scope or every root Kitchen in the browser.
 */
export function useKitchenConsoleList(options: UseKitchenConsoleListOptions = {}) {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { appUser, pending: userPending } = useUser()
  const { surface } = useKitchenInterface()
  const scopeItems = ref<AppKitchenConsoleListDoc[]>([])
  const scopePending = ref(false)
  let requestId = 0
  const resolvedFilter = computed<KitchenConsoleListFilter | undefined>(() => {
    if (isRef(options.filter)) return options.filter.value ?? undefined
    return options.filter ?? undefined
  })
  const explicitIds = computed(() =>
    (resolvedFilter.value?.ids ?? []).map((id) => normalize(id)).filter(Boolean)
  )
  const hasExplicitIds = computed(() => Array.isArray(resolvedFilter.value?.ids))
  const userKitchenIds = computed(() =>
    Array.isArray(appUser.value?.console_scopes)
      ? appUser.value.console_scopes
          .map((scope) => {
            const normalized = normalize(scope)
            return normalized.startsWith('kitchen:')
              ? normalized.slice('kitchen:'.length)
              : ''
          })
          .map((id) => normalize(id))
          .filter(Boolean)
      : []
  )
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
  const kitchens = computed<KitchenSurface[]>(() =>
    rootCollection.kitchens.value
      .map((kitchen) =>
        surface({
          kitchen,
          scope: scopesByKitchenId.value.get(normalize(kitchen.id)) ?? null,
          routeScope: kitchen.route_scope,
        })
      )
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
