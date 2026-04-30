<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleProjectAppsRead />

    <OrganismsConsoleProjectAppsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleApps } from '../../../composables/fireux/project-console/useProjectConsoleApps'

const { canWrite } = useProjectConsoleApps()
</script>
