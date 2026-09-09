<template>
  <WorkspaceCalendarSurface v-model="selectedDate">
    <WorkspaceKitchenCalendarAgenda />
  </WorkspaceCalendarSurface>
</template>

<script setup lang="ts">
import WorkspaceCalendarSurface from 'fireux-core/runtime/components/Workspace/CalendarSurface.vue'
import { useKitchenCalendar } from '../../../composables/workspace/calendar/useKitchenCalendar'

const { selectedDate } = useKitchenCalendar()
</script>
