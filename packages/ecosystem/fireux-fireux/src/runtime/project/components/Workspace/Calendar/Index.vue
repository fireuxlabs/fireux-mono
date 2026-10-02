<template>
  <WorkspaceCalendarSurface v-if="calendarReady" v-model="selectedDate">
    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar-range"
      title="No events connected yet"
      description="Scheduled Project work will appear here when a capability provides it."
    />
  </WorkspaceCalendarSurface>
  <USkeleton v-else-if="outcome === 'pending'" class="h-96" />
  <UAlert
    v-else-if="outcome === 'error'"
    color="error"
    title="Project unavailable"
    description="The selected Project could not be loaded."
  />
  <UAlert
    v-else
    color="neutral"
    variant="soft"
    icon="i-lucide-lock-keyhole"
    title="Project onboarding required"
    description="Calendar becomes available when the selected Project completes onboarding and its canonical root becomes active."
  />
</template>

<script setup lang="ts">
import WorkspaceCalendarSurface from 'fireux-core/runtime/components/Workspace/CalendarSurface.vue'
import { useProjectCalendar } from '../../../composables/workspace/useProjectCalendar'

const { selectedDate, ready: calendarReady, outcome } = useProjectCalendar()
</script>
