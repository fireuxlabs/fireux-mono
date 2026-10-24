<template>
  <WorkspaceCalendarSurface v-model="selectedDate">
    <KitchenCalendarAgenda />
  </WorkspaceCalendarSurface>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceCalendar } from '../../composables/workspace/useKitchenWorkspaceCalendar'

const { selectedDate } = useKitchenWorkspaceCalendar()
</script>
