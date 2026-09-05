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
  <USkeleton v-else-if="workspace.outcome.value === 'pending'" class="h-96" />
  <UAlert
    v-else-if="workspace.outcome.value === 'error'"
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
import { computed, ref } from 'vue'
import WorkspaceCalendarSurface from '../../../../components/Workspace/CalendarSurface.vue'
import { useProjectWorkspace } from '../../../composables/workspace/core/useProjectWorkspace'

const workspace = useProjectWorkspace()
const calendarReady = computed(() => workspace.data.value?.status === 'active')
const today = new Date()
const dateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
const todayKey = dateKey(today)
const selectedDate = ref(todayKey)
</script>
