<template>
  <UPage class="page edit-page">
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="kitchenId ? `/kitchens/${encodeURIComponent(kitchenId)}` : '/kitchens'"
        >
          Back to details
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UPageCard v-if="loading" variant="subtle">
        <p class="text-sm text-dimmed">Loading kitchen…</p>
      </UPageCard>

      <UAlert
        v-else-if="!kitchen"
        color="error"
        variant="soft"
        title="Kitchen not found"
        description="We could not find this kitchen. Return to the kitchens list and try again."
      />

      <LayoutsDashboardProfileEdit v-else class="panels-masonry">
        <template #preview>
          <KitchenCardsPreview
            :avatar-url="kitchen.place_image ?? ''"
            :name="kitchen.name ?? ''"
            :website="kitchen.website ?? ''"
            :badges="[]"
            :show-body="false"
          />
        </template>

        <template #core>
          <OrganismsEntitiesKitchenEdit :kitchen="kitchen" />
        </template>
      </LayoutsDashboardProfileEdit>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useKitchenFetch } from '../../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import type { Kitchen } from '../../../models/objects/kitchen.model'

definePageMeta({
  layout: 'default',
  title: 'Edit Kitchen',
  description: 'Edit a saved kitchen.',
  head: { title: 'Edit Kitchen' },
  name: 'KitchensEditPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Kitchen` })

const route = useRoute()
const raw = route.params.id
const kitchenId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { kitchen: fetchKitchen } = useKitchenFetch()
const docRef = kitchenId ? fetchKitchen(kitchenId) : null

const kitchen = computed<Kitchen | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(kitchenId) && docRef?.value === undefined)
const pageTitle = computed(() => kitchen.value?.name || 'Edit kitchen')
const pageSubtitle = computed(() =>
  kitchenId ? `Kitchen: ${kitchenId}` : 'Edit a kitchen'
)
</script>
