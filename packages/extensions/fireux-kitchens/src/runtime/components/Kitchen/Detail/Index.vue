<template>
  <ClientOnly>
    <UPage>
      <UPageBody class="pagebody">
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading kitchen…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!kitchen"
          title="Kitchen not found"
          description="This kitchen does not exist or is not public-ready."
          variant="subtle"
        />

        <div v-else class="kitchen-detail">
          <KitchenDetailIdentity :kitchen="kitchen" />

          <KitchenDetailMenus :kitchen="kitchen" />

          <KitchenDetailFulfilment
            :kitchen="kitchen"
            :fulfilment="resolvedFulfilment"
          />

          <KitchenDetailOperatorPanel :kitchen="kitchen" />
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <UPage>
        <UPageBody class="pagebody">
          <UPageCard variant="subtle">
            <p class="text-sm text-dimmed">Loading kitchen…</p>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useFetch } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import {
  useKitchenFetch,
  useKitchenSeo,
} from '../../../composables/fireux/firestore/kitchen/useKitchen'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type {
  Kitchen,
  KitchenFulfilmentConfig,
} from '../../../models/kitchen.model'
import { KitchenStorage } from '../../../models/kitchen.model'
import {
  composeKitchenScopedSurface,
  readKitchenAppScope,
} from '../../../utils/kitchen-spine'

const props = defineProps<{
  locator: string
}>()

const locator = computed(() => String(props.locator || '').trim())
const emptyFulfilment: KitchenFulfilmentConfig = {
  delivery_zones: [],
  payment_methods: [],
}
const fulfilmentPath = computed(() =>
  locator.value
    ? `/api/kitchens/${encodeURIComponent(locator.value)}/fulfilment`
    : ''
)

const { appId } = useFireUXConfig()
const { kitchen: rootKitchen, pending } = useKitchenFetch(locator)
const rootKitchenId = computed(() =>
  String(rootKitchen.value?.id ?? '').trim()
)
const kitchenAppScope = computed(() => readKitchenAppScope(rootKitchen.value))
const scopedKitchenAppId = computed(() => {
  const state = kitchenAppScope.value.state
  const scopedAppId = kitchenAppScope.value.appId
  if ((state === 'parent_app' || state === 'tenant_app') && scopedAppId) {
    return scopedAppId
  }

  return String(appId || '').trim()
})
const scopedKitchenCollection = computed(() => {
  const resolvedAppId = scopedKitchenAppId.value
  if (!resolvedAppId) return ''

  return `${AppStorage.collection}/${resolvedAppId}/${KitchenStorage.scopeCollection}`
})
const scopedKitchenId = computed(() => {
  if (!scopedKitchenCollection.value) return ''
  return rootKitchenId.value
})
const { kitchen: scopedKitchen } = useKitchenFetch(scopedKitchenId, {
  collectionPath: scopedKitchenCollection,
  hydrate: false,
})
const kitchen = computed<KitchenSurface | null>(() =>
  composeKitchenScopedSurface(
    rootKitchen.value,
    scopedKitchen.value
  ) as KitchenSurface | null
)
const seoKitchen = computed(() =>
  kitchen.value as Partial<Kitchen> | null
)
const { data: fulfilmentData } = useFetch<KitchenFulfilmentConfig>(
  fulfilmentPath,
  {
    immediate: Boolean(fulfilmentPath.value),
    watch: [fulfilmentPath],
  }
)
const resolvedFulfilment = computed(() => fulfilmentData.value || emptyFulfilment)

useKitchenSeo(seoKitchen)
</script>

<style scoped>
.kitchen-detail {
  display: grid;
  gap: clamp(calc(var(--spacing) * 9), 5vw, calc(var(--spacing) * 16));
  padding-bottom: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 20));
}
</style>
