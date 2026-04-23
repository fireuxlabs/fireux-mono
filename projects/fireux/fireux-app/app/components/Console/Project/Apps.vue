<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleProjectAppsRead
      :selected-project="selectedProject"
      :selected-mode="selectedMode"
      :app-id="appId"
      :ecosystem-id="ecosystemId"
      :apps="apps"
      :pending="pending"
    />

    <OrganismsConsoleProjectAppsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectConsoleApps } from '../../../composables/fireux/project-console/useProjectConsoleApps'

const { selectedProject, selectedMode, appId, ecosystemId, apps, pending } =
  useProjectConsoleApps()
const canWrite = computed(() => selectedMode.value === 'live')
</script>
