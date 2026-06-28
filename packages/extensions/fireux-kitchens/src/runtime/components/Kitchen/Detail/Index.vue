<template>
  <ClientOnly>
    <UPage>
      <UPageHeader
        class="pageheader"
        :title="pageTitle"
        :description="pageDescription"
      />

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

        <div v-else class="space-y-4">
          <!-- place -->
          <KitchenDetailPlace :kitchen="kitchen" />

          <!-- fulfilment -->
          <KitchenDetailFulfilment
            :kitchen="kitchen"
            :fulfilment="resolvedFulfilment"
          />

          <!-- main -->
          <KitchenDetailMenus :kitchen="kitchen" />

          <!-- team access -->
          <KitchenDetailJoin :kitchen="kitchen" />

          <!-- operator -->
          <KitchenDetailOperatorPanel :kitchen="kitchen" />

          <!-- dev -->
          <DevJson
            :title="'Kitchen (Doc)'"
            context="KitchenDetail · kitchens/[slug] · hydrated kitchen doc"
            :data="kitchen"
            :default-open="false"
          />
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <UPage>
        <UPageHeader
          class="pageheader"
          :title="pageTitle"
          :description="pageDescription"
        />

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
import {
  useKitchenFetch,
  useKitchenInterface,
  useKitchenSeo,
} from '../../../composables/fireux/firestore/kitchen/useKitchen'
import type { KitchenFulfilmentConfig } from '../../../models/kitchen.model'

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

const { kitchen, pending } = useKitchenFetch(locator)
const { data: fulfilmentData } = useFetch<KitchenFulfilmentConfig>(
  fulfilmentPath,
  {
    immediate: Boolean(fulfilmentPath.value),
    watch: [fulfilmentPath],
  }
)
const { identity } = useKitchenInterface()
const identityCard = computed(() => identity(kitchen.value))
const resolvedFulfilment = computed(() => fulfilmentData.value || emptyFulfilment)
const kitchenDisplayName = computed(() =>
  String(kitchen.value?.display_name ?? '').trim()
)
const kitchenTagline = computed(() =>
  String(kitchen.value?.tagline ?? '').trim()
)

const pageTitle = computed(() =>
  kitchenDisplayName.value || identityCard.value?.title || locator.value || 'Kitchen'
)
const pageDescription = computed(() =>
  kitchenTagline.value || identityCard.value?.subtitle || ''
)

useKitchenSeo(kitchen)
</script>
