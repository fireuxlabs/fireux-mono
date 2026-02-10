import { useRouter } from '#imports'
import type { KitchenCreateInput } from 'fireux-kitchens/runtime/models/kitchen.model'
import { computed, isRef, ref, type Ref } from 'vue'
import { useKitchenFetch } from '../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenCreate } from '../firestore/kitchen/mutations/useKitchenCreate'

const runtimeKitchenState = ref('')
const RUNTIME_KITCHEN_STORAGE_KEY = 'fireux.runtimeKitchenId'

const readPersistedKitchenId = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(RUNTIME_KITCHEN_STORAGE_KEY) ?? ''
}

const persistKitchenId = (id: string) => {
  if (typeof window === 'undefined') return
  if (!id) {
    window.localStorage.removeItem(RUNTIME_KITCHEN_STORAGE_KEY)
    return
  }
  window.localStorage.setItem(RUNTIME_KITCHEN_STORAGE_KEY, id)
}

export function useRuntimeKitchen(
  kitchenId?: string | Ref<string | null | undefined>,
  isTest = true
) {
  const router = useRouter()
  const { createKitchen } = useKitchenCreate({ test: isTest })
  const { kitchen: fetchKitchen } = useKitchenFetch({
    collectionPath: isTest ? 'test-kitchens' : 'kitchens',
  })

  if (!runtimeKitchenState.value) runtimeKitchenState.value = readPersistedKitchenId()

  const runtimeKitchenId = String(
    (isRef(kitchenId) ? kitchenId.value : kitchenId) || runtimeKitchenState.value || ''
  ).trim()

  if (runtimeKitchenId) {
    runtimeKitchenState.value = runtimeKitchenId
    persistKitchenId(runtimeKitchenId)
  }

  const runtimeKitchenCollectionPath = isTest ? 'test-kitchens' : 'kitchens'

  console.info('[useRuntimeKitchen] init', {
    runtimeKitchenId,
    isTest,
  })

  const openRuntimeKitchen = async (payload?: Partial<KitchenCreateInput>) => {
    const id = runtimeKitchenId
    if (!id) throw new Error('Kitchen id is required')

    console.info('[useRuntimeKitchen] create', {
      id,
      isTest,
      payload,
    })

    await createKitchen({ id, ...(payload ?? {}) })
    runtimeKitchenState.value = id
    persistKitchenId(id)
    console.info('[useRuntimeKitchen] created or exists', { id })
    await router.push('/dashboard/kitchen')
    console.info('[useRuntimeKitchen] routed', { path: '/dashboard/kitchen' })
    return id
  }

  const fetchRuntimeKitchen = () => {
    if (!runtimeKitchenId) {
      console.info('[useRuntimeKitchen] fetch skipped (missing id)')
      return null
    }

    console.info('[useRuntimeKitchen] fetch', { id: runtimeKitchenId })
    return fetchKitchen(runtimeKitchenId)
  }

  const runtimeKitchenDoc = fetchRuntimeKitchen()
  const theRuntimeKitchen = computed(() => runtimeKitchenDoc?.value ?? null)

  return {
    runtimeKitchenId,
    runtimeKitchenCollectionPath,
    runtimeKitchenIsTest: isTest,
    openRuntimeKitchen,
    fetchRuntimeKitchen,
    theRuntimeKitchen,
  }
}
