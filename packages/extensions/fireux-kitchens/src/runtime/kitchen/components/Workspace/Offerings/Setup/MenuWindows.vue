<template>
  <section v-if="menus.length" class="space-y-3 border-t border-default pt-4">
    <h4 class="text-sm font-medium">Menu availability</h4>
    <p class="text-xs text-muted">
      Each Menu can have its own times within this service. Open a Menu to
      change them in Settings.
    </p>
    <div v-for="menu in menus" :key="menu.id" class="space-y-1">
      <NuxtLink
        :to="`/workspace/kitchen/menus/${encodeURIComponent(menu.slug)}`"
        class="text-sm font-medium underline underline-offset-4"
        >{{ menu.name }}</NuxtLink
      >
      <p v-if="!menu.serving_hours" class="text-xs text-muted">
        Throughout this service
      </p>
      <template v-else>
        <p v-for="line in lines(menu)" :key="line" class="text-xs text-muted">
          {{ line }}
        </p>
        <p v-if="!lines(menu).length" class="text-xs text-warning">
          Unavailable during this service
        </p>
      </template>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { Menu } from '../../../../../menu/models/menu.model'
import type { WeekdayTimeWindowsConfig } from '../../../../../models/shared/weekday-time.model'
import { intersectWeekdayHours } from '../../../../../utils/weekday-time-constraints'
import { serviceHoursSummary } from '../../../../utils/service-hours'
const props = defineProps<{
  menus: Menu[]
  serviceHours?: WeekdayTimeWindowsConfig | null
}>()
function lines(menu: Menu) {
  return menu.serving_hours && props.serviceHours
    ? serviceHoursSummary(
        intersectWeekdayHours(menu.serving_hours, props.serviceHours)
      )
    : []
}
</script>
