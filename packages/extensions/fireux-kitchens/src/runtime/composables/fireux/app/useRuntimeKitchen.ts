import { useRoute, useState } from '#imports'
import { computed, unref, watchEffect, type Ref } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import { useKitchenFetch } from '../firestore/kitchen/fetch/useKitchenFetch'

export type RuntimeKitchenMode = 'dummy' | 'test' | 'live'
type RuntimeKitchenSelection = {
  kitchenId?: string | null | undefined
  mode?: RuntimeKitchenMode | null | undefined
}

const RUNTIME_KITCHEN_ID_KEY = 'fireux-kitchens:runtime-kitchen:id'
const RUNTIME_KITCHEN_MODE_KEY = 'fireux-kitchens:runtime-kitchen:mode'

const toSingleValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

const normalizeString = (value: unknown): string => String(toSingleValue(value) ?? '').trim()

const normalizeMode = (value: unknown): RuntimeKitchenMode | null => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'dummy' || normalized === 'test' || normalized === 'live') {
    return normalized
  }
  return null
}

const useRuntimeKitchenState = () => {
  const runtimeKitchenIdState = useState<string>(RUNTIME_KITCHEN_ID_KEY, () => '')
  const runtimeKitchenModeState = useState<RuntimeKitchenMode>(RUNTIME_KITCHEN_MODE_KEY, () => 'dummy')
  return { runtimeKitchenIdState, runtimeKitchenModeState }
}

export function useRuntimeKitchenSelection() {
  const { runtimeKitchenIdState, runtimeKitchenModeState } = useRuntimeKitchenState()

  const setRuntimeKitchen = (selection: RuntimeKitchenSelection = {}) => {
    runtimeKitchenModeState.value = normalizeMode(selection.mode) ?? runtimeKitchenModeState.value ?? 'dummy'
    runtimeKitchenIdState.value = normalizeString(selection.kitchenId)
  }

  return {
    runtimeKitchenId: computed(() => runtimeKitchenIdState.value),
    runtimeKitchenMode: computed(() => runtimeKitchenModeState.value),
    setRuntimeKitchen,
  }
}

export function useRuntimeKitchen(
  kitchenId?: string | Ref<string | null | undefined>,
  mode?: RuntimeKitchenMode | Ref<RuntimeKitchenMode | null | undefined>
) {
  const route = useRoute()
  const { kitchen: fetchKitchen } = useKitchenFetch()
  const { runtimeKitchenIdState, runtimeKitchenModeState } = useRuntimeKitchenState()

  const directKitchenId = computed(() => normalizeString(unref(kitchenId)))
  const routeKitchenId = computed(() => normalizeString(route.query?.id))
  const directMode = computed(() => normalizeMode(unref(mode)))
  const routeMode = computed(() => normalizeMode(route.query?.mode))

  const incomingKitchenId = computed(() => directKitchenId.value || routeKitchenId.value)
  const incomingMode = computed(() => directMode.value ?? routeMode.value)

  watchEffect(() => {
    if (incomingKitchenId.value) runtimeKitchenIdState.value = incomingKitchenId.value
  })

  watchEffect(() => {
    if (incomingMode.value) runtimeKitchenModeState.value = incomingMode.value
  })

  const resolvedKitchenId = computed(() => incomingKitchenId.value || runtimeKitchenIdState.value || '')
  const resolvedMode = computed<RuntimeKitchenMode>(
    () => incomingMode.value ?? runtimeKitchenModeState.value ?? 'dummy'
  )

  const runtimeKitchenDoc = computed(() => {
    const id = resolvedKitchenId.value
    if (!id) return null
    if (resolvedMode.value === 'dummy') return null
    const collectionPath = resolvedMode.value === 'live' ? 'kitchens' : 'test-kitchens'
    return fetchKitchen(id, collectionPath, {
      hydrate: resolvedMode.value !== 'test',
    })
  })

  return computed(() => {
    if (resolvedMode.value === 'dummy') return dummyKitchenScenario.kitchen
    return runtimeKitchenDoc.value?.value ?? null
  })
}
