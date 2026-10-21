<template>
  <WorkspaceCalendarSurface v-model="selectedDate">
    <KitchenCalendarAgenda />
  </WorkspaceCalendarSurface>
</template>

<script setup lang="ts">
import { useKitchenCalendar } from '../../composables/workspace/calendar/useKitchenCalendar'

const { selectedDate } = useKitchenCalendar()
</script>
