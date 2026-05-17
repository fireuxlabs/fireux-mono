<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleProjectAppsRead />

    <OrganismsConsoleProjectAppsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleApps } from '../../../composables/fireux/console/project/operations/useProjectConsoleApps'

const { canWrite } = useProjectConsoleApps()
</script>
