<template>
  <WorkspaceKitchenAIFocus focus="kitchen-ai.calendar" label="Calendar" />
  <WorkspaceCalendarSurface v-model="selectedDate">
    <WorkspaceKitchenCalendarAgenda />
  </WorkspaceCalendarSurface>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceCalendar } from '../../../composables/workspace/calendar/useKitchenWorkspaceCalendar'

const { selectedDate } = useKitchenWorkspaceCalendar()
</script>
