<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Kitchen Summary</div>
        <p class="text-sm text-dimmed">
          Live details for the currently selected kitchen.
        </p>
      </div>
    </template>

    <div v-if="kitchen" class="grid gap-3 text-sm text-dimmed sm:grid-cols-2">
      <div>
        Kitchen ID:
        <span class="font-medium text-default">{{ kitchenId }}</span>
      </div>
      <div v-if="kitchenName">
        Name:
        <span class="font-medium text-default">{{ kitchenName }}</span>
      </div>
      <div v-if="kitchenShortName">
        Short Name:
        <span class="font-medium text-default">{{ kitchenShortName }}</span>
      </div>
      <div v-if="kitchenAddress">
        Address:
        <span class="font-medium text-default">{{ kitchenAddress }}</span>
      </div>
      <div v-if="kitchenWebsite" class="sm:col-span-2">
        Website:
        <span class="font-medium text-default break-all">{{ kitchenWebsite }}</span>
      </div>
      <div v-if="kitchenTagline" class="sm:col-span-2">
        Tagline:
        <span class="font-medium text-default">{{ kitchenTagline }}</span>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      No live kitchen is currently selected.
    </p>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useActiveKitchen } from '../../../composables/fireux/app/kitchen-console/useActiveKitchen'

const kitchenState = useActiveKitchen()
const kitchen = computed(() => kitchenState.kitchen.value as Record<string, unknown> | null)

const normalizeString = (value: unknown): string => String(value || '').trim()

const kitchenId = computed(() => kitchenState.id.value)
const kitchenName = computed(() => normalizeString(kitchen.value?.name))
const kitchenShortName = computed(() => normalizeString(kitchen.value?.short_name))
const kitchenAddress = computed(() =>
  normalizeString(kitchen.value?.formatted_address || kitchen.value?.short_address)
)
const kitchenWebsite = computed(() => normalizeString(kitchen.value?.website))
const kitchenTagline = computed(() => normalizeString(kitchen.value?.brand_tagline))
</script>
