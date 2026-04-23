import { computed, unref, type ComputedRef, type Ref } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { getDemoKitchenCollection, type DemoKitchenCollectionName } from '../utils/kitchen-demo-scenarios'
import type { KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type UseKitchenConsoleReadPageOptions<T> = {
  collectionName: DemoKitchenCollectionName
  selectedKitchen: MaybeRef<KitchenSurface | null | undefined>
  selectedMode: MaybeRef<ConsoleMode>
  kitchenId: MaybeRef<string>
  liveItems: MaybeRef<T[] | null | undefined>
  livePending: MaybeRef<boolean | null | undefined>
  collectionPath?: MaybeRef<string | null | undefined>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleReadPage<T>(
  options: UseKitchenConsoleReadPageOptions<T>
) {
  const focus = computed(() => {
    const entity = unref(options.selectedKitchen) ?? null
    const mode = unref(options.selectedMode)
    const id = normalizeString(unref(options.kitchenId))

    return {
      entity,
      id,
      mode,
      modeLabel: mode === 'demo' ? 'Demo' : mode === 'test' ? 'Test' : 'Live',
      hasSelection: Boolean(entity),
      name: normalizeString(entity?.name),
    }
  })

  const items = computed<T[]>(() => {
    if (focus.value.mode === 'demo') {
      return getDemoKitchenCollection<T>(focus.value.id, options.collectionName)
    }

    return unref(options.liveItems) ?? []
  })

  const collection = computed(() => ({
    items: items.value,
    count: items.value.length,
    hasItems: items.value.length > 0,
    pending:
      focus.value.mode === 'demo' ? false : Boolean(unref(options.livePending)),
  }))

  const canWrite = computed(() => focus.value.mode === 'live')

  const debug = computed(() => ({
    focus: focus.value,
    source: focus.value.mode === 'demo' ? 'demo-scenario' : 'firestore',
    collectionName: options.collectionName,
    collectionPath: normalizeString(unref(options.collectionPath)),
    count: collection.value.count,
  }))

  return {
    focus,
    collection,
    debug,
    canWrite,
  }
}
