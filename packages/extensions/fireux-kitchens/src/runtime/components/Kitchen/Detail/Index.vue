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

          <!-- identity -->
          <KitchenDetailIdentity :kitchen="kitchen" />

          <!-- main -->
          <KitchenDetailMenus :kitchen="kitchen" />

          <!-- app membership -->
          <AppJoinSection />

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
import { computed } from 'vue'
import {
  useKitchenFetch,
  useKitchenInterface,
  useKitchenSeo,
} from '../../../composables/fireux/firestore/kitchen/useKitchen'

const props = defineProps<{
  locator: string
}>()

const locator = computed(() => String(props.locator || '').trim())

const { kitchen, pending } = useKitchenFetch(locator)
const { identity } = useKitchenInterface()
const identityCard = computed(() => identity(kitchen.value))
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
