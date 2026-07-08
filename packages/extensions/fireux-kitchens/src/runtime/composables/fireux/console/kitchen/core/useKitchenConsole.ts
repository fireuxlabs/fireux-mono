import { useCookie } from '#imports'
import { computed, watch } from 'vue'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { useConsoleEntityFirestore } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/useConsoleEntityFirestore'
import {
  readRuntimeFirestoreDatabaseId,
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import {
  useKitchenFetch,
  type KitchenFetchSource,
} from '../../../firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'

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
const normalizeSource = (value: unknown): KitchenFetchSource => {
  const source = normalizeString(value)
  if (source === 'demo' || source === 'test') return source
  return 'live'
}

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
  const consoleRoot = useConsole('kitchen')

  const configKitchenIds = computed(() =>
    uniqueStrings(consoleRoot.targetIds())
  )
  const { selectedId, selectTarget, clearSelection } =
    useConsoleSelection<KitchenSurface>('kitchen')
  const sourceState = useCookie<KitchenFetchSource>(
    'fireux-console-kitchen-source',
    {
      default: () => 'live',
      sameSite: 'lax',
    }
  )
  const kitchenId = computed(() => normalizeString(selectedId.value))
  const kitchenSource = computed<KitchenFetchSource>(() =>
    normalizeSource(sourceState.value)
  )
  const { kitchen: publicKitchen } = useKitchenFetch(kitchenId, {
    source: kitchenSource,
  })
  const selectedPublicKitchen = computed<KitchenConsoleEntity | null>(
    () => publicKitchen.value as KitchenConsoleEntity | null
  )
  const scopedAppId = computed(() =>
    kitchenSource.value === 'live'
      ? resolveConsoleEntityAppId(selectedPublicKitchen.value, consoleRoot.appId)
      : consoleRoot.appId
  )
  const databaseId = computed(() =>
    kitchenSource.value === 'test'
      ? readRuntimeSimulationFirestoreDatabaseId() || ''
      : readRuntimeFirestoreDatabaseId() || ''
  )
  const firestore = useConsoleEntityFirestore({
    family: KitchenStorage.scopeCollection,
    target: selectedPublicKitchen,
    appId: scopedAppId,
    mode: kitchenSource,
    testCollectionPath: KitchenStorage.rootCollection,
    useAppOverlay: computed(
      () => kitchenSource.value === 'live' && Boolean(scopedAppId.value)
    ),
  })
  const kitchenCollectionPath = firestore.writeCollection
  const liveScopedKitchenId = computed(() =>
    kitchenSource.value === 'live' ? kitchenId.value : ''
  )
  const { kitchen: scopedKitchen } = useKitchenFetch(liveScopedKitchenId, {
    collectionPath: kitchenCollectionPath,
    hydrate: false,
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(
    () =>
      kitchenSource.value === 'live'
        ? composeConsoleKitchen(
            selectedPublicKitchen.value,
            scopedKitchen.value as KitchenConsoleEntity | null
          )
        : selectedPublicKitchen.value
  )
  const readOnly = computed(() => kitchenSource.value === 'demo')
  const autoSelectSingle = computed(
    () => consoleRoot.isTenant && configKitchenIds.value.length === 1
  )
  const canWrite = computed(() =>
    !readOnly.value && Boolean(selectedKitchen.value)
  )
  const clearSelectedKitchen = () => {
    sourceState.value = 'live'
    clearSelection()
  }
  const selectKitchen = (
    kitchenId: string,
    source: KitchenFetchSource = 'live'
  ) => {
    sourceState.value = normalizeSource(source)
    selectTarget(kitchenId)
  }
  watch(
    configKitchenIds,
    (ids: string[]) => {
      const onlyKitchenId = normalizeString(ids[0])
      if (!autoSelectSingle.value || !onlyKitchenId) return
      if (kitchenId.value === onlyKitchenId) return

      selectKitchen(onlyKitchenId, 'live')
    },
    { immediate: true }
  )
  watch(
    kitchenId,
    (id: string) => {
      if (id) return
      sourceState.value = 'live'
    },
    { immediate: true }
  )
  const selection = {
    kitchen: selectedKitchen,
    kitchenId,
    kitchenSource,
    hasSelection: computed(() => Boolean(kitchenId.value)),
  }
  const runtime = {
    appId: firestore.appId,
    source: kitchenSource,
    canonicalRootCollection: firestore.rootCollection,
    collectionPath: firestore.collectionPath,
    isTenantOwned: firestore.isTenantOwned,
    kitchenCollectionPath,
    rootCollection: kitchenCollectionPath,
    scopeState: firestore.scopeState,
    scopedCollection: firestore.scopedCollection,
    usesAppOverlay: firestore.usesAppOverlay,
    writeCollection: firestore.writeCollection,
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
