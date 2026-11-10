<template>
  <section v-if="menus.length">
    <h4>Menu availability</h4>
    <p>
      Each Menu can have its own times within this service. Open a Menu to
      change them in Settings.
    </p>
    <div v-for="menu in menus" :key="menu.id">
      <NuxtLink
        :to="`/workspace/kitchen/menu/menus/${encodeURIComponent(menu.slug)}`"
        >{{ menu.internal_name || menu.name }}</NuxtLink
      >
      <p v-if="!menu.serving_hours">Throughout this service</p>
      <template v-else>
        <p v-for="line in lines(menu)" :key="line">
          {{ line }}
        </p>
        <p v-if="!lines(menu).length">Unavailable during this service</p>
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
