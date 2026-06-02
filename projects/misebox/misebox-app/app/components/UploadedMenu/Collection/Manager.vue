<template>
  <UPageCard v-if="pending" variant="subtle">
    <p class="text-sm text-dimmed">Loading menus…</p>
  </UPageCard>

  <UPageCard
    v-else-if="error"
    title="Menus unavailable"
    description="The uploaded menu list could not be loaded."
    variant="subtle"
  />

  <UPageCard
    v-else-if="!cards.length"
    title="No menus yet"
    description="Uploaded menu links will appear here."
    variant="subtle"
  />

  <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <UPageCard
      v-for="card in cards"
      :key="card.id"
      :title="card.title"
      :description="card.description"
      variant="subtle"
    >
      <template #footer>
        <div class="flex flex-wrap gap-2">
          <UButton size="xs" :to="card.to">
            Open menu
          </UButton>
          <UButton size="xs" variant="ghost" :to="card.qrTo">
            QR
          </UButton>
        </div>
      </template>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useUploadedMenuInterface,
  type UploadedMenuSummary,
} from '../../../composables/menus/useUploadedMenuInterface'

const props = withDefaults(
  defineProps<{
    collection?: UploadedMenuSummary[]
    pending?: boolean
    error?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
    error: false,
  }
)

const { card } = useUploadedMenuInterface()

const cards = computed(() =>
  props.collection
    .map((menu) => card(menu))
    .filter((entry): entry is NonNullable<ReturnType<typeof card>> =>
      Boolean(entry)
    )
)
</script>
