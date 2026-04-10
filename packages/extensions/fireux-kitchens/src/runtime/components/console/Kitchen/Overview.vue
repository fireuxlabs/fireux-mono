<template>
  <section class="space-y-6">
    <div v-if="kitchen" class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Focus</div>
            <p class="text-sm text-dimmed">
              Metrics for the selected kitchen.
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <div class="text-sm font-medium text-highlighted">
            {{ kitchenTitle }}
          </div>

          <div class="space-y-1">
            <div class="text-3xl font-semibold text-default">
              {{ focusUsersValue }}
            </div>
            <div class="text-sm text-dimmed">Users</div>
          </div>

          <p class="text-sm text-dimmed">
            User totals for the selected kitchen are not wired yet.
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">All</div>
            <p class="text-sm text-dimmed">
              Metrics across every kitchen in the collection.
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <div class="text-sm font-medium text-highlighted">
            All Kitchens
          </div>

          <div class="space-y-1">
            <div class="text-3xl font-semibold text-default">
              {{ allUsersValue }}
            </div>
            <div class="text-sm text-dimmed">Users</div>
          </div>

          <p class="text-sm text-dimmed">
            Total kitchens in scope: {{ totalKitchensLabel }}.
          </p>
        </div>
      </UCard>
    </div>

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
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'
import { useKitchenCollection } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'

const { kitchenState, kitchen } = useKitchenConsole()
const { count: totalKitchens } = useKitchenCollection()
const selectedKitchen = computed(
  () => kitchenState.kitchen.value as Record<string, unknown> | null
)

const normalizeString = (value: unknown): string => String(value || '').trim()

const kitchenId = computed(() => kitchenState.id.value)
const kitchenName = computed(() => normalizeString(selectedKitchen.value?.name))
const kitchenShortName = computed(() => normalizeString(selectedKitchen.value?.short_name))
const kitchenAddress = computed(() =>
  normalizeString(
    selectedKitchen.value?.formatted_address || selectedKitchen.value?.short_address
  )
)
const kitchenWebsite = computed(() => normalizeString(selectedKitchen.value?.website))
const kitchenTagline = computed(() => normalizeString(selectedKitchen.value?.brand_tagline))

const kitchenTitle = computed(
  () =>
    kitchen.value?.title ||
    kitchenName.value ||
    kitchenShortName.value ||
    kitchenId.value ||
    'Selected Kitchen'
)
const focusUsersValue = computed(() => '—')
const allUsersValue = computed(() => '—')
const totalKitchensLabel = computed(() => String(totalKitchens.value || 0))
</script>
