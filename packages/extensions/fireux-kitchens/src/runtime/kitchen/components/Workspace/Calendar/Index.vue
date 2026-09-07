<template>
  <WorkspaceCalendarSurface v-model="selectedDate">
    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar-range"
      title="No events connected yet"
      description="Scheduled Kitchen work will appear here when a capability provides it."
    />
  </WorkspaceCalendarSurface>
</template>

<script setup lang="ts">
import WorkspaceCalendarSurface from 'fireux-core/runtime/components/Workspace/CalendarSurface.vue'
import { useKitchenCalendar } from '../../../composables/workspace/useKitchenCalendar'

const { selectedDate } = useKitchenCalendar()
</script>
