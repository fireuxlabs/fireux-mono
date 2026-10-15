<template>
  <WorkspaceCalendarSurface v-model="selectedDate">
    <WorkspaceKitchenCalendarAgenda />
  </WorkspaceCalendarSurface>
</template>

<script setup lang="ts">
import { useKitchenCalendar } from '../../../composables/workspace/calendar/useKitchenCalendar'

const { selectedDate } = useKitchenCalendar()
</script>
