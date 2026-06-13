import { computed, watch } from 'vue'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenFetch } from '../../../firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { resolveKitchenScopeCollectionPath } from '../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

type KitchenConsoleEntity = KitchenSurface

const publicIdentityKeys = [
  'name',
  'display_name',
  'short_name',
  'short_address',
  'formatted_address',
  'display_image_url',
  'image_url',
  'cover_image',
  'brand_tagline',
] as const

const uniqueStrings = (values: unknown[]) =>
  Array.from(
    new Set(values.map((value) => normalizeString(value)).filter(Boolean))
  )

const composeConsoleKitchen = (
  publicKitchen: KitchenConsoleEntity | null,
  scoped: KitchenConsoleEntity | null
): KitchenConsoleEntity | null => {
  if (!publicKitchen) return scoped
  if (!scoped) return publicKitchen

  const composed = {
    ...(publicKitchen as Record<string, unknown>),
    ...(scoped as Record<string, unknown>),
  }

  for (const key of publicIdentityKeys) {
    if (normalizeString(composed[key])) continue

    const publicValue = (publicKitchen as Record<string, unknown>)[key]
    if (normalizeString(publicValue)) composed[key] = publicValue
  }

  const publicImage =
    normalizeString((publicKitchen as Record<string, unknown>).display_image_url) ||
    normalizeString((publicKitchen as Record<string, unknown>).image_url)

  if (publicImage) {
    if (!normalizeString(composed.display_image_url)) {
      composed.display_image_url = publicImage
    }

    if (!normalizeString(composed.image_url)) {
      composed.image_url = publicImage
    }
  }

  return composed as KitchenConsoleEntity
}

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Kitchen.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-kitchens/docs/contract.md
 *
 * This file adapts the selected public Kitchen into the selected /console/kitchen scope.
 * Index pages own Kitchen target collection reads.
 * It should not own Kitchen child operation records; those live under console/kitchen/operations.
 */
export function useKitchenConsole() {
  /*
   * Input:
   * - runtime app config
   * - stored console selection
   *
   * Process:
   * - keep the selected Kitchen id in the shared console cookie
   * - read the selected public Kitchen
   * - read the selected app-scoped Kitchen
   * - compose one selected Kitchen view for console consumers
   * - derive the selected Kitchen scope path and write permission
   *
   * Output:
   * - selection: selected Kitchen state
   * - runtime: selected Kitchen scope/read/write context
   * - actions: select/clear helpers
  */
  const fireux = useFireUXConfig()
  const { appId } = fireux
  const consoleRoot = useConsole('kitchen')
  const { uid } = useAuth()

  const userId = computed(() => normalizeString(uid.value))
  const configKitchenIds = computed(() =>
    uniqueStrings(consoleRoot.targetIds())
  )
  const { selectedId, selectTarget, clearSelection } =
    useConsoleSelection<KitchenSurface>('kitchen')
  const kitchenId = computed(() => normalizeString(selectedId.value))
  const { kitchen: publicKitchen } = useKitchenFetch(kitchenId)
  const selectedPublicKitchen = computed<KitchenConsoleEntity | null>(
    () => publicKitchen.value as KitchenConsoleEntity | null
  )
  const scopedAppId = computed(() =>
    resolveConsoleEntityAppId(selectedPublicKitchen.value, appId)
  )
  const databaseId = computed(() =>
    readRuntimeFirestoreDatabaseId() || ''
  )
  const kitchenCollectionPath = computed(() =>
    resolveKitchenScopeCollectionPath(scopedAppId.value)
  )
  const { kitchen: scopedKitchen } = useKitchenFetch(kitchenId, {
    collectionPath: kitchenCollectionPath,
    hydrate: false,
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(
    () =>
      composeConsoleKitchen(
        selectedPublicKitchen.value,
        scopedKitchen.value as KitchenConsoleEntity | null
      )
  )
  const readOnly = computed(() => false)
  const autoSelectSingle = computed(
    () => fireux.isTenant && configKitchenIds.value.length === 1
  )
  const canWrite = computed(() =>
    !readOnly.value && targetHasOperator(selectedKitchen.value, userId.value)
  )
  const clearSelectedKitchen = () => {
    clearSelection()
  }
  const selectKitchen = (kitchenId: string) => {
    selectTarget(kitchenId)
  }
  watch(
    configKitchenIds,
    (ids) => {
      const onlyKitchenId = normalizeString(ids[0])
      if (!autoSelectSingle.value || !onlyKitchenId) return
      if (kitchenId.value === onlyKitchenId) return

      selectTarget(onlyKitchenId)
    },
    { immediate: true }
  )
  const selection = {
    kitchen: selectedKitchen,
    kitchenId,
    hasSelection: computed(() => Boolean(kitchenId.value)),
  }
  const runtime = {
    appId: scopedAppId,
    kitchenCollectionPath,
    rootCollection: kitchenCollectionPath,
    databaseId,
    readOnly,
    canWrite,
  }
  const actions = {
    selectKitchen,
    clearSelectedKitchen,
  }

  return {
    selection,
    runtime,
    actions,
  }
}
