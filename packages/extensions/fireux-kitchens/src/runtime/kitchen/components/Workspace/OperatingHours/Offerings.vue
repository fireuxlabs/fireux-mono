<template>
  <section class="space-y-4" aria-labelledby="serving-hours-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="serving-hours-title" class="text-lg font-semibold">
        Offering hours
      </h2>
      <UButton
        to="/workspace/kitchen/orders/channels"
        label="Manage offerings"
        color="neutral"
        variant="link"
        trailing-icon="i-lucide-arrow-up-right"
      />
    </header>
    <p v-if="!offerings.length" class="text-sm text-muted">
      No offerings yet. Add an offering and set when guests can receive it.
    </p>
    <div v-else class="grid gap-4 md:grid-cols-2">
      <UCard
        v-for="offering in offerings"
        :key="offering.id"
        :ui="{ header: 'p-4', body: 'p-4' }"
      >
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-semibold">{{ offering.name }}</h3>
              <UBadge
                :color="offering.enabled ? 'success' : 'neutral'"
                variant="subtle"
                >{{ offering.enabled ? 'Enabled' : 'Off' }}</UBadge
              >
            </div>
            <UButton
              :to="
                '/workspace/kitchen/orders/channels/' +
                encodeURIComponent(offering.id)
              "
              :aria-label="'Edit ' + offering.name + ' serving hours'"
              label="Edit"
              color="neutral"
              variant="ghost"
            />
          </div>
        </template>
        <PlaceOpeningHoursWeek
          v-if="offering.hours?.windows.length"
          :hours="offering.hours"
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
            v-for="menu in linkedMenus(offering)"
            :key="menu.id"
            :to="'/workspace/kitchen/menus/' + encodeURIComponent(menu.slug)"
            :label="menu.name"
            color="neutral"
            variant="link"
            size="sm"
          />
          <span v-if="!offering.menu_ids.length" class="text-sm text-muted"
            >No linked Menus</span
          >
        </div>
      </UCard>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { KitchenOffering } from '../../../models/offering.model'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
const props = defineProps<{
  offerings: KitchenOffering[]
  menus: KitchenMenu[]
  menusOutcome: string
}>()
const linkedMenus = (offering: KitchenOffering) =>
  props.menus.filter((menu) => offering.menu_ids.includes(menu.id))
</script>
