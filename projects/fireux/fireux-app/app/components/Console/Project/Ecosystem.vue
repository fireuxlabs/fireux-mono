<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleProjectEcosystemRead />

    <OrganismsConsoleProjectEcosystemWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleEcosystem } from '../../../composables/fireux/project-console/useProjectConsoleEcosystem'

const { canWrite } = useProjectConsoleEcosystem()
</script>
