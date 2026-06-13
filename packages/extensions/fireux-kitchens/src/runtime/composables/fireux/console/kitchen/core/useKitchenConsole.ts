import { computed, watch } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleConfig } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useKitchenCollection } from '../../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../../firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { resolveKitchenScopeCollectionPath } from '../../../firestore/kitchen/utils/paths/useKitchenChildCollection'

type KitchenConsoleEntity = KitchenSurface

const displayIdentityKeys = [
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

const mergeSelectedKitchen = (
  target: KitchenConsoleEntity | null,
  runtime: KitchenConsoleEntity | null
): KitchenConsoleEntity | null => {
  if (!target) return runtime
  if (!runtime) return target

  const merged = {
    ...(target as Record<string, unknown>),
    ...(runtime as Record<string, unknown>),
  }

  for (const key of displayIdentityKeys) {
    if (normalizeString(merged[key])) continue

    const targetValue = (target as Record<string, unknown>)[key]
    if (normalizeString(targetValue)) merged[key] = targetValue
  }

  const targetImage =
    normalizeString((target as Record<string, unknown>).display_image_url) ||
    normalizeString((target as Record<string, unknown>).image_url)

  if (targetImage) {
    if (!normalizeString(merged.display_image_url)) {
      merged.display_image_url = targetImage
    }

    if (!normalizeString(merged.image_url)) {
      merged.image_url = targetImage
    }
  }

  return merged as KitchenConsoleEntity
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
 * This file adapts Kitchen root/app authority targets into the private /console/kitchen selected runtime.
 * It should not own Kitchen child operation records; those live under console/kitchen/operations.
 */
export function useKitchenConsole() {
  /*
   * Input:
   * - runtime app config
   * - signed-in user
   * - stored console selection
   *
   * Process:
   * - choose configured tenant kitchens or user.myKitchens
   * - fetch those Kitchen targets
   * - connect targets to the shared console selection cookie
   * - auto-select a single tenant target when there is no selection
   * - derive the selected Kitchen runtime path and write permission
   *
   * Output:
   * - kitchens: target collection for the console index
   * - selection: selected Kitchen state
   * - runtime: selected Kitchen read/write context
   * - actions: select/clear helpers
   */
  const fireux = useFireUXConfig()
  const { appId } = fireux
  const consoleConfig = useConsoleConfig('kitchen')
  const { uid } = useAuth()
  const { coreUser, pending: userPending } = useUser()

  const userId = computed(() => normalizeString(uid.value))
  const configKitchenIds = computed(() =>
    uniqueStrings(consoleConfig.targetIds())
  )
  const myKitchenIds = computed(() =>
    Array.isArray(coreUser.value?.myKitchens)
      ? uniqueStrings(coreUser.value.myKitchens)
      : []
  )
  const targetIds = computed(() =>
    fireux.isTenant ? configKitchenIds.value : myKitchenIds.value
  )
  const targetCollection = useKitchenCollection({ ids: targetIds })
  const targetKitchens = computed<KitchenSurface[]>(
    () => targetCollection.kitchens.value
  )
  const targetCount = computed(() => targetKitchens.value.length)
  const targetPending = computed(() =>
    fireux.isTenant
      ? targetCollection.pending.value
      : Boolean(userPending.value || targetCollection.pending.value)
  )
  const { selectedEntity, selectEntity, clearSelection } =
    useConsole<KitchenSurface>('kitchen', {
      targetItems: targetKitchens,
      targetPending,
      getId: (kitchen) => normalizeString(kitchen?.id),
    })
  const selectedTargetKitchen = computed<KitchenConsoleEntity | null>(
    () => selectedEntity.value
  )
  const kitchenId = computed(() => normalizeString(selectedTargetKitchen.value?.id))
  const activeKitchenAppId = computed(() =>
    resolveConsoleEntityAppId(selectedTargetKitchen.value, appId)
  )
  const databaseId = computed(() =>
    readRuntimeFirestoreDatabaseId() || ''
  )
  const rootCollection = computed(() =>
    resolveKitchenScopeCollectionPath(activeKitchenAppId.value)
  )
  const { kitchen: runtimeKitchen } = useKitchenFetch(kitchenId, {
    collectionPath: rootCollection,
    hydrate: false,
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(
    () =>
      mergeSelectedKitchen(
        selectedTargetKitchen.value,
        runtimeKitchen.value as KitchenConsoleEntity | null
      )
  )
  const readOnly = computed(() => false)
  const canCreate = computed(() => consoleConfig.canCreateTarget())
  const autoSelectSingle = computed(
    () => fireux.isTenant && targetCount.value === 1
  )
  const canWrite = computed(() =>
    !readOnly.value && targetHasOperator(selectedKitchen.value, userId.value)
  )
  const header = computed<ConsoleHeaderData>(() => {
    const kitchen = selectedKitchen.value as Record<string, unknown> | null
    if (!kitchen) return null

    return {
      title:
        normalizeString(kitchen.name) ||
        normalizeString(kitchen.display_name) ||
        normalizeString(kitchen.id),
      subtitle:
        normalizeString(kitchen.short_address) ||
        normalizeString(kitchen.formatted_address) ||
        undefined,
      imageUrl:
        normalizeString(kitchen.display_image_url) ||
        normalizeString(kitchen.image_url) ||
        undefined,
    }
  })

  usePublishConsoleHeader('kitchen', header)

  const clearSelectedKitchen = () => {
    clearSelection()
  }
  const selectKitchen = (kitchenId: string) => {
    selectEntity(kitchenId)
  }
  watch(
    targetKitchens,
    (kitchens) => {
      if (
        selectedTargetKitchen.value ||
        !autoSelectSingle.value ||
        kitchens.length !== 1
      ) {
        return
      }

      const onlyKitchenId = normalizeString(kitchens[0]?.id)
      if (onlyKitchenId) selectEntity(onlyKitchenId)
    },
    { immediate: true }
  )
  const kitchens = {
    targets: targetKitchens,
    count: targetCount,
    pending: targetPending,
    source: {
      targetIds,
      configKitchenIds,
      myKitchenIds,
      canCreate,
      autoSelectSingle,
    },
  }
  const selection = {
    kitchen: selectedKitchen,
    kitchenId,
    hasSelection: computed(() => Boolean(kitchenId.value)),
  }
  const runtime = {
    appId: activeKitchenAppId,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
  }
  const actions = {
    selectKitchen,
    clearSelectedKitchen,
  }

  return {
    kitchens,
    selection,
    runtime,
    actions,
  }
}
