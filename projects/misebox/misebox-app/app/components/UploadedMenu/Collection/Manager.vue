<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div class="collection-manager__controls flex flex-1 items-center gap-2">
          <div class="ml-auto flex flex-wrap items-center gap-2">
            <UBadge variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <p v-if="pending">Loading menus...</p>

    <UPageCard
      v-else-if="error"
      title="Menus unavailable"
      description="The uploaded menu list could not be loaded."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!cards.length"
      title="No QR menu documents yet"
      description="Uploaded QR menu documents will appear here."
      variant="subtle"
    />

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <UPageCard
        v-for="card in cards"
        :key="card.id"
        variant="subtle"
      >
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-highlighted">
                {{ card.title }}
              </h3>
              <p class="mt-1 text-sm text-dimmed">
                {{ card.description }}
              </p>
            </div>

            <UBadge v-if="card.status" color="primary" variant="soft">
              {{ card.status }}
            </UBadge>
          </div>
        </template>

        <p v-if="card.meta" class="text-xs text-dimmed">
          {{ card.meta }}
        </p>

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

    <DevJson
      title="Uploaded menus (JSON)"
      context="collection manager · uploaded menus · root menus collection"
      :data="devJsonData"
      :default-open="false"
    />
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
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
    title?: string
    description?: string
  }>(),
  {
    collection: () => [],
    pending: false,
    error: false,
    title: 'QR menu documents',
    description: 'Browse simple QR menu documents before they become structured kitchen menus.',
  }
)

const { card } = useUploadedMenuInterface()
const { devJsonData } = useDevCollectionJson(computed(() => props.collection))

const cards = computed(() =>
  props.collection
    .map((menu) => card(menu))
    .filter((entry): entry is NonNullable<ReturnType<typeof card>> =>
      Boolean(entry)
    )
)
const title = computed(() => String(props.title || 'QR menu documents'))
const description = computed(() => String(props.description || '').trim())
const countLabel = computed(() => `${cards.value.length} menus`)
</script>
