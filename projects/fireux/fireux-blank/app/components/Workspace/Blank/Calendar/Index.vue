<template>
  <WorkspaceCalendarSurface v-model="calendar.selectedDate.value">
    <UAlert
      title="No events connected yet"
      description="Scheduled Blank work will appear here when an event source is connected."
      icon="i-lucide-calendar"
      color="neutral"
    />
  </WorkspaceCalendarSurface>
</template>
<script setup lang="ts">
import WorkspaceCalendarSurface from 'fireux-core/runtime/workspace/components/CalendarSurface.vue'
import { useBlankWorkspaceCalendar } from '../../../../composables/workspace/useBlankWorkspaceCalendar'
const calendar = useBlankWorkspaceCalendar()
</script>
