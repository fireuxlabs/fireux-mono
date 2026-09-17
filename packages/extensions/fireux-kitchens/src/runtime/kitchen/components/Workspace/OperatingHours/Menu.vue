<template>
  <UCard :ui="{ header: 'p-4 sm:px-4', body: 'p-4 sm:p-4' }">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-2">
        <h3 class="min-w-0 flex-1 break-words font-semibold text-highlighted">
          {{ menu.name }}
        </h3>
        <UButton
          :to="`/workspace/kitchen/menus/${encodeURIComponent(menu.slug)}`"
          icon="i-lucide-arrow-up-right"
          :aria-label="`Open ${menu.name}`"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </div>
    </template>
    <p v-if="!entries.length" class="text-sm text-muted">
      No ordering services use this Menu.
    </p>
    <div v-else class="divide-y divide-default">
      <p v-if="menu.doc?.url.trim()" class="pb-4 text-sm text-muted">
        Document Menus are browse-only. Ordering needs items and prices.
      </p>
      <section
        v-for="entry in entries"
        :key="entry.type"
        class="space-y-2 py-3 first:pt-0 last:pb-0"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="text-sm font-medium text-highlighted">
                {{ entry.label }}
              </h4>
              <UBadge
                :color="
                  entry.state === 'Enabled'
                    ? 'success'
                    : entry.state === 'Paused'
                      ? 'warning'
                      : 'neutral'
                "
                variant="subtle"
                size="sm"
                >{{ entry.state }}</UBadge
              >
            </div>
            <p class="text-sm text-muted">
              {{ entry.hoursSource
              }}<span v-if="entry.sharedMenuCount > 1">
                · Shared across {{ entry.sharedMenuCount }} Menus</span
              >
            </p>
          </div>
          <UButton
            :to="entry.configurePath"
            label="Settings"
            :aria-label="`Configure ${entry.label} for ${menu.name}`"
            trailing-icon="i-lucide-chevron-right"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </div>
        <p v-if="entry.diagnostic" class="text-xs text-muted">
          Customer flow not ready.
        </p>
        <p v-if="entry.type === 'pre_order'" class="text-xs text-muted">
          Dining times. Requests can arrive outside these hours.
        </p>
        <div v-if="entry.hours?.windows.length">
          <PlaceOpeningHoursWeek :hours="entry.hours" compact class="mt-2" />
        </div>
        <p v-else class="text-sm text-muted">No hours set for this service.</p>
      </section>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import PlaceOpeningHoursWeek from 'fireux-places/runtime/place/components/OpeningHours/Week.vue'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
import type { menuServiceSummaries } from '../../../utils/menu-service-summary'
defineProps<{
  menu: KitchenMenu
  entries: ReturnType<typeof menuServiceSummaries>
}>()
</script>
