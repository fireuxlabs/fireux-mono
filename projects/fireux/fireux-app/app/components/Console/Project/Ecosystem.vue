<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleProjectEcosystemRead
      :selected-project="selectedProject"
      :selected-mode="selectedMode"
      :ecosystem-id="ecosystemId"
      :ecosystem="ecosystem"
      :pending="pending"
    />

    <OrganismsConsoleProjectEcosystemWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectConsoleEcosystem } from '../../../composables/fireux/project-console/useProjectConsoleEcosystem'

const { selectedProject, selectedMode, ecosystemId, ecosystem, pending } = useProjectConsoleEcosystem()
const canWrite = computed(() => selectedMode.value === 'live')
</script>
