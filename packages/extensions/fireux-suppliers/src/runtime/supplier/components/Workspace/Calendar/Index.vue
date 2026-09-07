<template>
  <WorkspaceCalendarSurface v-model="calendar.selectedDate.value">
    <UAlert title="No events connected yet" description="Scheduled Supplier work will appear here when an event source is connected." icon="i-lucide-calendar" color="neutral" />
  </WorkspaceCalendarSurface>
</template>
<script setup lang="ts">
import WorkspaceCalendarSurface from 'fireux-core/runtime/components/Workspace/CalendarSurface.vue'
import { useSupplierCalendar } from '../../../composables/useSupplierCalendar'
const calendar = useSupplierCalendar()
</script>
