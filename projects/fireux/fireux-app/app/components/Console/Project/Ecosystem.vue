<template>
  <section class="console-surface space-y-4">
    <UAlert
      v-if="pending"
      color="neutral"
      variant="soft"
      title="Loading project ecosystem"
      description="Fetching the ecosystem linked to the selected project."
    />

    <UCard v-else-if="project && ecosystem">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Ecosystem</div>
        </div>
      </template>

      <EcosystemCardsProfile v-if="ecosystemProfile" :item="ecosystemProfile" />
    </UCard>

    <UCard v-else-if="project">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Ecosystem</div>
        </div>
      </template>

      <p class="console-card-header__description">
        No ecosystem linked to this project.
      </p>
    </UCard>

    <UCard v-else>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Ecosystem</div>
        </div>
      </template>

      <p class="console-card-header__description">No project selected.</p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useProjectConsole } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsole'
import { useProjectConsoleEcosystem } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsoleEcosystem'

const { project } = useProjectConsole()
const { ecosystem, ecosystemProfile, pending } = useProjectConsoleEcosystem()
</script>
