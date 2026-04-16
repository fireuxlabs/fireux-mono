<template>
  <section class="console-surface space-y-4">
    <UCard v-if="project && apps.length">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Apps</div>
        </div>
      </template>

      <div class="flex flex-wrap gap-3">
        <AppCardsPill
          v-for="(card, i) in appPills"
          :key="i"
          v-bind="card"
          :link="false"
        />
      </div>
    </UCard>

    <UCard v-else-if="project">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Apps</div>
        </div>
      </template>

      <p class="console-card-header__description">
        No apps found for this project.
      </p>
    </UCard>

    <UCard v-else>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Apps</div>
        </div>
      </template>

      <p class="console-card-header__description">
        No project selected.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useProjectConsole } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsole'
import { useProjectConsoleApps } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsoleApps'

const { project } = useProjectConsole()
const { apps, appPills } = useProjectConsoleApps()
</script>