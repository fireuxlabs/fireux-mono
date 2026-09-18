<template>
  <section class="space-y-4" aria-labelledby="serving-hours-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="serving-hours-title" class="text-lg font-semibold">
        Service hours
      </h2>
      <UButton
        to="/workspace/kitchen/orders/services"
        label="Manage services"
        color="neutral"
        variant="link"
        trailing-icon="i-lucide-arrow-up-right"
      />
    </header>
    <p v-if="!services.length" class="text-sm text-muted">
      No services yet. Add an offering and set when guests can receive it.
    </p>
    <div v-else class="grid gap-4 md:grid-cols-2">
      <UCard
        v-for="service in services"
        :key="service.id"
        :ui="{ header: 'p-4', body: 'p-4' }"
      >
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-semibold">{{ service.name }}</h3>
              <UBadge
                :color="service.enabled ? 'success' : 'neutral'"
                variant="subtle"
                >{{ service.enabled ? 'Enabled' : 'Off' }}</UBadge
              >
            </div>
            <UButton
              :to="
                '/workspace/kitchen/orders/services/' +
                encodeURIComponent(service.id)
              "
              :aria-label="'Edit ' + service.name + ' serving hours'"
              label="Edit"
              color="neutral"
              variant="ghost"
            />
          </div>
        </template>
        <PlaceOpeningHoursWeek
          v-if="service.hours?.windows.length"
          :hours="service.hours"
          compact
        />
        <p v-else class="text-sm text-muted">No serving hours set.</p>
        <p
          v-if="menusOutcome === 'pending' || menusOutcome === 'idle'"
          role="status"
          class="mt-3 text-sm text-muted"
        >
          Loading linked Menus…
        </p>
        <p v-else-if="menusOutcome === 'error'" class="mt-3 text-sm text-muted">
          Linked Menus could not be loaded.
        </p>
        <div v-else class="mt-3 flex flex-wrap gap-2">
          <UButton
            v-for="menu in linkedMenus(service)"
            :key="menu.id"
            :to="'/workspace/kitchen/menus/' + encodeURIComponent(menu.slug)"
            :label="menu.name"
            color="neutral"
            variant="link"
            size="sm"
          />
          <span v-if="!service.menu_ids.length" class="text-sm text-muted"
            >No linked Menus</span
          >
        </div>
      </UCard>
    </div>
  </section>
</template>
<script setup lang="ts">
import PlaceOpeningHoursWeek from 'fireux-places/runtime/place/components/OpeningHours/Week.vue'
import type { KitchenService } from '../../../models/service.model'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
const props = defineProps<{
  services: KitchenService[]
  menus: KitchenMenu[]
  menusOutcome: string
}>()
const linkedMenus = (service: KitchenService) =>
  props.menus.filter((menu) => service.menu_ids.includes(menu.id))
</script>
